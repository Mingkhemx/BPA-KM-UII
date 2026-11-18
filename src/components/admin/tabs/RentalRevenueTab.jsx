import React, { useState, useMemo, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Package,
  CheckCircle2,
  Clock,
  Search,
  Printer,
  Download,
  Calendar,
  BarChart3
} from 'lucide-react';
import { adminStorage } from '../../../utils/adminStorage';
import { neonApi } from '../../../services/neonDb';
import { getStoredTrackingBookings } from '../../../data/trackingData';

const parseCostNumber = (val) => {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  const clean = String(val).replace(/[^0-9]/g, '');
  return parseInt(clean, 10) || 0;
};

const normalizeKey = (str) =>
  String(str || '')
    .toLowerCase()
    .replace(/^prod-/, '')
    .replace(/[^a-z0-9]/g, '');

export const RentalRevenueTab = () => {
  const loadMergedBookings = () => {
    const adminList = adminStorage.getBookings() || [];
    const trackingList = getStoredTrackingBookings() || [];
    const map = new Map();
    [...adminList, ...trackingList].forEach((b) => {
      if (b && b.bookingCode && !map.has(b.bookingCode)) {
        map.set(b.bookingCode, b);
      }
    });
    return Array.from(map.values());
  };

  const [bookings, setBookings] = useState(loadMergedBookings);
  const [products] = useState(() => adminStorage.getProducts());
  const [filterMode, setFilterMode] = useState('RENTED_ALL'); // 'RENTED_ALL' | 'COMPLETED_ONLY' | 'ACTIVE_ONLY'
  const [searchQuery, setSearchQuery] = useState('');

  // Sinkronisasi langsung dengan data terbaru dari Neon PostgreSQL
  useEffect(() => {
    let active = true;
    neonApi
      .getBookings()
      .then((remote) => {
        if (!active || !Array.isArray(remote)) return;
        setBookings(remote);
        localStorage.setItem('bpa_admin_bookings', JSON.stringify(remote));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Klasifikasi status pesanan yang sudah sah tersewa (tidak ditolak & bukan sekadar antre menunggu)
  const getBookingRevenue = (b) => {
    const directCost = parseCostNumber(b.totalCost) || parseCostNumber(b.totalPrice);
    if (directCost > 0) return directCost;
    return (b.items || []).reduce(
      (sum, it) => sum + (Number(it.priceValue) || 0) * (Number(it.quantity) || 1) * (Number(it.days) || 1),
      0
    );
  };

  const analytics = useMemo(() => {
    const isCompleted = (b) =>
      (b.status || '').toUpperCase() === 'SELESAI' || Number(b.progressPercent ?? 0) >= 100;

    const isRejectedOrPending = (b) => {
      const s = (b.status || '').toUpperCase();
      return s === 'DITOLAK' || s === 'MENUNGGU PERSETUJUAN';
    };

    // Semua pesanan yang sudah disetujui / berjalan / selesai
    const allRentedBookings = bookings.filter((b) => !isRejectedOrPending(b));
    const completedBookings = allRentedBookings.filter(isCompleted);
    const activeBookings = allRentedBookings.filter((b) => !isCompleted(b));

    const completedRevenue = completedBookings.reduce((sum, b) => sum + getBookingRevenue(b), 0);
    const activeRevenue = activeBookings.reduce((sum, b) => sum + getBookingRevenue(b), 0);
    const totalRentedRevenue = completedRevenue + activeRevenue;

    // Filter sesuai mode yang dipilih user
    const scopedBookings =
      filterMode === 'COMPLETED_ONLY'
        ? completedBookings
        : filterMode === 'ACTIVE_ONLY'
        ? activeBookings
        : allRentedBookings;

    // Agregasi pendapatan per barang / aset
    const catalogPriceMap = new Map();
    products.forEach((p) => {
      const key = normalizeKey(p.slug || p.id || p.name);
      if (key) catalogPriceMap.set(key, Number(p.priceValue) || 0);
    });

    const assetMap = new Map();
    let totalUnitsRented = 0;

    scopedBookings.forEach((b) => {
      const items = Array.isArray(b.items) && b.items.length > 0 ? b.items : [{ name: b.assetName || 'Aset BPA', quantity: 1, days: 1, priceValue: getBookingRevenue(b) }];
      const bookingTotal = getBookingRevenue(b);

      // Hitung estimasi subtotal tiap item
      const rawSubtotals = items.map((it) => {
        const qty = Number(it.quantity) || 1;
        const days = Number(it.days) || 1;
        const unitPrice = Number(it.priceValue) || catalogPriceMap.get(normalizeKey(it.id || it.name)) || 0;
        return unitPrice * qty * days;
      });
      const rawSum = rawSubtotals.reduce((s, v) => s + v, 0);

      items.forEach((it, idx) => {
        const qty = Number(it.quantity) || 1;
        const days = Number(it.days) || 1;
        totalUnitsRented += qty;

        // Jika item punya priceValue pakai sub-nya; jika tidak ada dan single item pakai totalCost booking
        let itemRevenue = rawSubtotals[idx];
        if (itemRevenue === 0 && bookingTotal > 0) {
          itemRevenue = rawSum === 0 ? Math.round(bookingTotal / items.length) : 0;
        }

        const key = normalizeKey(it.id || it.name) || it.name;
        const existing = assetMap.get(key) || {
          key,
          name: it.name || 'Aset BPA',
          ordersCount: 0,
          totalQty: 0,
          totalDays: 0,
          revenue: 0
        };

        assetMap.set(key, {
          ...existing,
          ordersCount: existing.ordersCount + 1,
          totalQty: existing.totalQty + qty,
          totalDays: existing.totalDays + days,
          revenue: existing.revenue + itemRevenue
        });
      });
    });

    const q = searchQuery.trim().toLowerCase();
    const perAssetList = Array.from(assetMap.values())
      .filter((a) => !q || a.name.toLowerCase().includes(q))
      .sort((a, b) => b.revenue - a.revenue);

    const scopedTotalRevenue = scopedBookings.reduce((sum, b) => sum + getBookingRevenue(b), 0);

    const filteredTransactions = scopedBookings.filter(
      (b) =>
        !q ||
        (b.bookingCode || '').toLowerCase().includes(q) ||
        (b.customer?.name || b.userName || '').toLowerCase().includes(q) ||
        (b.items || []).some((it) => (it.name || '').toLowerCase().includes(q))
    );

    return {
      totalRentedRevenue,
      completedRevenue,
      activeRevenue,
      totalRentedCount: allRentedBookings.length,
      completedCount: completedBookings.length,
      activeCount: activeBookings.length,
      totalUnitsRented,
      scopedTotalRevenue,
      perAssetList,
      filteredTransactions
    };
  }, [bookings, products, filterMode, searchQuery]);

  const handleExportCsv = () => {
    const header = ['Nama Barang / Aset', 'Jumlah Pesanan', 'Total Unit Disewa', 'Total Hari', 'Total Pendapatan (Rp)'];
    const rows = analytics.perAssetList.map((a) => [
      `"${a.name.replace(/"/g, '""')}"`,
      a.ordersCount,
      a.totalQty,
      a.totalDays,
      a.revenue
    ]);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pendapatan-sewa-bpa-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* 1. KPI PENDAPATAN DARI SEMUA BARANG YANG SUDAH TERSEWA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-uii-blue-950 text-white p-5 rounded-2xl border border-uii-gold/30 shadow-md flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-uii-gold text-uii-blue-950 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
              Total Pendapatan Tersewa
            </span>
            <span className="text-lg sm:text-xl font-black text-uii-gold font-heading truncate block">
              Rp {analytics.totalRentedRevenue.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] text-slate-300">{analytics.totalRentedCount} pesanan sah</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Pendapatan Selesai (100%)
            </span>
            <span className="text-lg font-black text-emerald-700 font-heading truncate block">
              Rp {analytics.completedRevenue.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] text-slate-500">{analytics.completedCount} transaksi selesai</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-uii-blue-900 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Pendapatan Sedang Berjalan
            </span>
            <span className="text-lg font-black text-uii-blue-950 font-heading truncate block">
              Rp {analytics.activeRevenue.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] text-slate-500">{analytics.activeCount} pesanan aktif</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Unit Barang Tersewa
            </span>
            <span className="text-xl font-black text-amber-900 font-heading block">
              {analytics.totalUnitsRented} Unit
            </span>
            <span className="text-[10px] text-slate-500">{analytics.perAssetList.length} jenis aset</span>
          </div>
        </div>
      </div>

      {/* 2. FILTER MODE & EXPORT */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama barang, kode booking, atau penyewa..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-900/20 focus:bg-white"
            />
          </div>

          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700"
          >
            <option value="RENTED_ALL">Semua Barang Tersewa (Aktif + Selesai)</option>
            <option value="COMPLETED_ONLY">Hanya yang Sudah Selesai</option>
            <option value="ACTIVE_ONLY">Hanya yang Sedang Berjalan</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-uii-blue-950 hover:bg-uii-blue-900 text-uii-gold font-bold text-xs flex items-center space-x-1.5 shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* 3. RINCIAN PENDAPATAN PER BARANG / ASET */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-uii-blue-900" />
            <h3 className="text-sm font-black text-uii-blue-950 font-heading">
              Rincian Pendapatan Per Barang yang Tersewa
            </h3>
          </div>
          <span className="text-xs font-black text-uii-blue-950">
            Subtotal: Rp {analytics.scopedTotalRevenue.toLocaleString('id-ID')}
          </span>
        </div>

        {analytics.perAssetList.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">
            Belum ada data barang tersewa pada kategori filter ini.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {analytics.perAssetList.map((asset) => {
              const sharePercent =
                analytics.scopedTotalRevenue > 0
                  ? Math.round((asset.revenue / analytics.scopedTotalRevenue) * 100)
                  : 0;
              return (
                <div key={asset.key} className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
                  <div className="min-w-0 sm:w-2/5">
                    <p className="text-xs sm:text-sm font-black text-slate-900 truncate">
                      {asset.name}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {asset.ordersCount} transaksi • {asset.totalQty} unit • {asset.totalDays} hari sewa
                    </p>
                  </div>

                  <div className="flex-1 max-w-xs space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500 font-semibold">Kontribusi Pendapatan</span>
                      <span className="font-black text-uii-blue-950">{sharePercent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-uii-blue-900 transition-all"
                        style={{ width: `${Math.min(100, sharePercent)}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-left sm:text-right flex-shrink-0">
                    <span className="text-xs sm:text-sm font-black text-emerald-700 font-heading block">
                      Rp {asset.revenue.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. DAFTAR TRANSAKSI PENYEWAAN PENYUMBANG PENDAPATAN */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-black text-uii-blue-950 font-heading">
              Daftar Transaksi Barang Tersewa ({analytics.filteredTransactions.length})
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Kode Booking</th>
                <th className="py-3 px-4">Penyewa</th>
                <th className="py-3 px-4">Barang / Aset Disewa</th>
                <th className="py-3 px-4">Tanggal Acara</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Pendapatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analytics.filteredTransactions.length > 0 ? (
                analytics.filteredTransactions.map((b) => {
                  const rev = getBookingRevenue(b);
                  return (
                    <tr key={b.bookingCode} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-black text-uii-blue-950">
                        {b.bookingCode}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">
                          {b.customer?.name || b.userName || '-'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {b.customer?.org || b.userOrg || 'Personal'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {(b.items || []).map((it) => `${it.name} (${it.quantity || 1}×)`).join(', ') ||
                          b.assetName ||
                          '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {b.eventDate || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            (b.status || '').toUpperCase() === 'SELESAI'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-900'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-emerald-700">
                        Rp {rev.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada transaksi pada filter ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
