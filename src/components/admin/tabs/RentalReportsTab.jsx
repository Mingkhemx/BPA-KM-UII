import React, { useState } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  TrendingUp, 
  DollarSign, 
  FileSpreadsheet, 
  Eye, 
  Check, 
  X, 
  Search, 
  Printer, 
  ArrowUpRight,
  Package,
  Sliders,
  Sparkles
} from 'lucide-react';
import { adminStorage } from '../../../utils/adminStorage';

export const RentalReportsTab = () => {
  const [bookings, setBookings] = useState(() => adminStorage.getBookings());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [toastMsg, setToastMsg] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [progressModalBooking, setProgressModalBooking] = useState(null);
  const [newProgressPercent, setNewProgressPercent] = useState(50);
  const [newProgressStage, setNewProgressStage] = useState('');

  const showNotification = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // KPI Metrics Calculation
  const parseCost = (val) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    const clean = String(val).replace(/[^0-9]/g, '');
    return parseInt(clean, 10) || 0;
  };

  const totalBookings = bookings.length;
  const pendingCount = bookings.filter(b => {
    const s = (b.status || '').toUpperCase();
    return s.includes('MENUNGGU') || s.includes('PENGAJUAN');
  }).length;
  const approvedCount = bookings.filter(b => {
    const s = (b.status || '').toUpperCase();
    return s.includes('SETUJU') || s.includes('SIAP') || s.includes('SETTING');
  }).length;
  const completedCount = bookings.filter(b => (b.status || '').toUpperCase().includes('SELESAI')).length;
  const totalRevenue = bookings.reduce((acc, curr) => acc + (parseCost(curr.totalCost) || parseCost(curr.totalPrice) || 0), 0);

  // Handlers
  const handleApprove = (bookingCode) => {
    const updated = bookings.map(b => {
      if (b.bookingCode === bookingCode) {
        return {
          ...b,
          status: 'DISETUJUI',
          progressPercent: 25,
          progressStage: 'Tahap 2: Jadwal Disetujui Staf BPA & Menunggu Konfirmasi DP'
        };
      }
      return b;
    });
    setBookings(updated);
    adminStorage.saveBookings(updated);
    showNotification(`Reservasi ${bookingCode} berhasil DISETUJUI!`);
  };

  const handleReject = (bookingCode) => {
    if (confirm(`Yakin ingin menolak pengajuan sewa ${bookingCode}?`)) {
      const updated = bookings.map(b => {
        if (b.bookingCode === bookingCode) {
          return {
            ...b,
            status: 'DITOLAK',
            progressPercent: 0,
            progressStage: 'Pengajuan Ditolak (Jadwal Bentrok / Syarat Tidak Terpenuhi)'
          };
        }
        return b;
      });
      setBookings(updated);
      adminStorage.saveBookings(updated);
      showNotification(`Reservasi ${bookingCode} telah DITOLAK.`);
    }
  };

  const handleMarkCompleted = (bookingCode) => {
    const updated = bookings.map(b => {
      if (b.bookingCode === bookingCode) {
        return {
          ...b,
          status: 'SELESAI',
          progressPercent: 100,
          progressStage: 'Tahap 6: Acara Selesai, Serah Terima Kembali & Checklist Selesai'
        };
      }
      return b;
    });
    setBookings(updated);
    adminStorage.saveBookings(updated);
    showNotification(`Reservasi ${bookingCode} ditandai SELESAI.`);
  };

  const handleUpdateProgressSubmit = (e) => {
    e.preventDefault();
    if (!progressModalBooking) return;

    const updated = bookings.map(b => {
      if (b.bookingCode === progressModalBooking.bookingCode) {
        return {
          ...b,
          progressPercent: Number(newProgressPercent),
          progressStage: newProgressStage.trim() || b.progressStage,
          status: Number(newProgressPercent) >= 100 ? 'SELESAI' : Number(newProgressPercent) >= 80 ? 'SIAP DIGUNAKAN' : 'SEDANG DISIAPKAN'
        };
      }
      return b;
    });
    setBookings(updated);
    adminStorage.saveBookings(updated);
    showNotification(`Progres kesiapan ${progressModalBooking.bookingCode} diupdate ke ${newProgressPercent}%!`);
    setProgressModalBooking(null);
  };

  const handlePrintReport = () => {
    window.print();
  };

  // Filter Bookings
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.bookingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.customer?.name && b.customer.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.customer?.org && b.customer.org.toLowerCase().includes(searchQuery.toLowerCase())) ||
      b.items?.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'Semua' || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notifikasi */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 px-5 py-3 rounded-2xl bg-uii-blue-950 text-uii-gold border border-uii-gold/40 shadow-2xl text-xs font-bold flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-uii-gold" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* KPI KARTU METRIK EKSEKUTIF */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Reservasi</span>
            <Calendar className="w-4 h-4 text-uii-blue-900" />
          </div>
          <span className="text-2xl font-black text-uii-blue-950 font-heading">{totalBookings}</span>
          <span className="text-[10px] text-slate-400 block mt-1">Keseluruhan agenda sewa</span>
        </div>

        <div className="bg-amber-50/70 p-4 sm:p-5 rounded-2xl border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Perlu Persetujuan</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-black text-amber-950 font-heading">{pendingCount}</span>
          <span className="text-[10px] text-amber-700 block mt-1 font-semibold">Menunggu konfirmasi staf</span>
        </div>

        <div className="bg-blue-50/70 p-4 sm:p-5 rounded-2xl border border-blue-200 shadow-2xs">
          <div className="flex items-center justify-between text-uii-blue-800 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Sedang Berjalan</span>
            <Clock className="w-4 h-4 text-uii-blue-900" />
          </div>
          <span className="text-2xl font-black text-uii-blue-950 font-heading">{approvedCount}</span>
          <span className="text-[10px] text-uii-blue-800 block mt-1 font-semibold">Disetujui & persiapan sarpras</span>
        </div>

        <div className="bg-emerald-50/70 p-4 sm:p-5 rounded-2xl border border-emerald-200 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Selesai / Terlaksana</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-800 font-heading">{completedCount}</span>
          <span className="text-[10px] text-emerald-700 block mt-1 font-semibold">Sukses serah terima</span>
        </div>

        <div className="bg-gradient-to-br from-[#0c1f38] to-uii-blue-950 text-white p-4 sm:p-5 rounded-2xl border border-uii-gold/30 shadow-md">
          <div className="flex items-center justify-between text-uii-gold mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Nilai Sewa</span>
            <DollarSign className="w-4 h-4 text-uii-gold" />
          </div>
          <span className="text-lg sm:text-xl font-black text-white font-heading truncate block">
            Rp {totalRevenue.toLocaleString('id-ID')}
          </span>
          <span className="text-[10px] text-uii-gold/80 block mt-1 font-medium">Rekapitulasi pendapatan</span>
        </div>
      </div>

      {/* FILTER & AKSI LAPORAN */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode booking, nama penyewa, ormawa, atau aset..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-900/20 focus:bg-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700"
          >
            <option value="Semua">Semua Status Pengajuan</option>
            <option value="MENUNGGU PERSETUJUAN">Menunggu Persetujuan</option>
            <option value="DISETUJUI">Disetujui</option>
            <option value="SEDANG DISIAPKAN">Sedang Disiapkan</option>
            <option value="SIAP DIGUNAKAN">Siap Digunakan</option>
            <option value="SELESAI">Selesai</option>
            <option value="DITOLAK">Ditolak</option>
          </select>
        </div>

        <button
          onClick={handlePrintReport}
          className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center space-x-2 flex-shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak / Ekspor Laporan Ringkasan</span>
        </button>
      </div>

      {/* TABEL DAFTAR RESERVASI SEWA */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-wider text-uii-blue-950 font-heading">
            Daftar Reservasi & Pengajuan Sewa Aset
          </h4>
          <span className="text-[11px] font-bold text-slate-500">
            Menampilkan {filteredBookings.length} data
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Kode Booking</th>
                <th className="py-3 px-4">Penyewa & Organisasi</th>
                <th className="py-3 px-4">Aset yang Disewa</th>
                <th className="py-3 px-4">Jadwal Acara</th>
                <th className="py-3 px-4">Estimasi Biaya</th>
                <th className="py-3 px-4">Status & Progres</th>
                <th className="py-3 px-4 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((b) => (
                  <tr key={b.bookingCode} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-uii-blue-900 block font-mono text-[11px]">
                        {b.bookingCode}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{b.createdAt || '-'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-slate-900 block">{b.customer?.name || b.userName || 'Penyewa'}</span>
                      <span className="text-[10px] text-slate-500 block truncate max-w-[180px]">{b.customer?.org || b.userOrg || '-'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {b.items && b.items.length > 0 ? (
                          b.items.map((it, idx) => (
                            <span key={idx} className="inline-block text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md mr-1">
                              {it.name} ({it.quantity || 1}x)
                            </span>
                          ))
                        ) : (
                          <span className="inline-block text-[10px] font-semibold bg-blue-50 text-blue-900 px-2 py-0.5 rounded-md">
                            {b.assetName || 'Gedung SCC'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {b.eventDate || `${b.items?.[0]?.startDate || '-'} s/d ${b.items?.[0]?.endDate || '-'}`}
                    </td>
                    <td className="py-3 px-4 font-black text-amber-900">
                      {typeof b.totalPrice === 'string' && b.totalPrice.startsWith('Rp')
                        ? b.totalPrice
                        : `Rp ${Number(b.totalCost || b.totalPrice || 0).toLocaleString('id-ID')}`}
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          b.status === 'MENUNGGU PERSETUJUAN'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : b.status === 'DISETUJUI' || b.status === 'SEDANG DISIAPKAN' || b.status === 'SIAP DIGUNAKAN'
                            ? 'bg-blue-100 text-blue-900'
                            : b.status === 'SELESAI'
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-rose-100 text-rose-900'
                        }`}>
                          {b.status}
                        </span>

                        {b.progressPercent !== undefined && b.status !== 'DITOLAK' && (
                          <div className="flex items-center space-x-1.5 w-28">
                            <div className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-uii-blue-900 h-full rounded-full"
                                style={{ width: `${b.progressPercent}%` }}
                              />
                            </div>
                            <span className="text-[9px] font-bold text-slate-500">{b.progressPercent}%</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center space-x-1">
                        {/* Tombol Approval Cepat */}
                        {b.status === 'MENUNGGU PERSETUJUAN' && (
                          <>
                            <button
                              onClick={() => handleApprove(b.bookingCode)}
                              className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-2xs flex items-center space-x-1"
                              title="Setujui Pengajuan Sewa"
                            >
                              <Check className="w-3 h-3" />
                              <span>Setujui</span>
                            </button>
                            <button
                              onClick={() => handleReject(b.bookingCode)}
                              className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] shadow-2xs flex items-center space-x-1"
                              title="Tolak Pengajuan"
                            >
                              <X className="w-3 h-3" />
                              <span>Tolak</span>
                            </button>
                          </>
                        )}

                        {/* Tombol Update Progress Kesiapan */}
                        {b.status !== 'MENUNGGU PERSETUJUAN' && b.status !== 'DITOLAK' && b.status !== 'SELESAI' && (
                          <button
                            onClick={() => {
                              setProgressModalBooking(b);
                              setNewProgressPercent(b.progressPercent || 50);
                              setNewProgressStage(b.progressStage || '');
                            }}
                            className="p-1.5 rounded-lg text-uii-blue-900 bg-blue-50 hover:bg-blue-100 font-bold text-[10px] flex items-center space-x-1"
                            title="Update Persentase Kesiapan Lapangan"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Progres</span>
                          </button>
                        )}

                        {/* Tombol Tandai Selesai */}
                        {b.status === 'SIAP DIGUNAKAN' && (
                          <button
                            onClick={() => handleMarkCompleted(b.bookingCode)}
                            className="px-2 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px]"
                          >
                            Selesai
                          </button>
                        )}

                        {/* Detail Modal Trigger */}
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-uii-blue-900 hover:bg-slate-100"
                          title="Lihat Rincian Reservasi"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada data reservasi yang sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RINGKASAN UTILITAS ASET & LAPORAN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Utilisasi Aset Terpopuler */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-uii-blue-950 font-heading">
            Tingkat Utilisasi Aset Terpopuler
          </h4>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>Gedung Student Convention Center (SCC)</span>
                <span className="text-uii-blue-900 font-black">75% Utilisasi</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-uii-blue-900 h-full rounded-full" style={{ width: '75%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>Handy Talky (HT) Baofeng UV-82</span>
                <span className="text-uii-blue-900 font-black">60% Utilisasi</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-uii-blue-900 h-full rounded-full" style={{ width: '60%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>Sound System HTS P12E & Mic Wireless</span>
                <span className="text-uii-blue-900 font-black">50% Utilisasi</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-uii-blue-900 h-full rounded-full" style={{ width: '50%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Prosedur & Catatan Operasional Divisi Sewa */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-uii-blue-950 font-heading">
            Standar Verifikasi & SOP Divisi Operasional
          </h4>
          <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>Verifikasi bentrok jadwal di kalender dilakukan maksimal 1x24 jam sejak pengajuan masuk.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>Kuitansi DP (minimal 30%) wajib diunggah sebelum kru teknis melakukan setting panggung dan audio.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>Berita acara serah terima dan pemeriksaan fisik wajib ditandatangani saat pengambilan dan pengembalian aset.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* MODAL UPDATE PROGRESS PERSIAPAN */}
      {progressModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleUpdateProgressSubmit} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-black text-sm text-uii-blue-950 font-heading">
                Update Kesiapan Lapangan ({progressModalBooking.bookingCode})
              </h4>
              <button type="button" onClick={() => setProgressModalBooking(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <label className="text-slate-700">Persentase Kesiapan Sarpras:</label>
                  <span className="text-uii-blue-900 font-black">{newProgressPercent}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={newProgressPercent}
                  onChange={(e) => setNewProgressPercent(e.target.value)}
                  className="w-full accent-uii-blue-950"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan Tahap Kesiapan:</label>
                <input
                  type="text"
                  required
                  value={newProgressStage}
                  onChange={(e) => setNewProgressStage(e.target.value)}
                  placeholder="Contoh: Tahap 4: Uji Soundcheck & Pengecekan AC Aula SCC Selesai"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setProgressModalBooking(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-uii-blue-950 text-uii-gold text-xs font-black shadow-xs"
              >
                Simpan Progres
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL RINCIAN DETAIL RESERVASI */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-extrabold text-uii-blue-900 block">
                  {selectedBooking.bookingCode}
                </span>
                <h4 className="font-black text-sm text-uii-blue-950 font-heading">Rincian Reservasi Sewa</h4>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Data Penyewa</span>
                <p className="font-extrabold text-slate-900 text-sm">{selectedBooking.customer?.name}</p>
                <p className="text-slate-600">{selectedBooking.customer?.org || 'Penyewa Umum'}</p>
                <p className="text-slate-500">WhatsApp: {selectedBooking.customer?.phone || '-'}</p>
                {selectedBooking.customer?.notes && (
                  <p className="p-2 bg-amber-50 rounded-lg text-amber-900 text-[11px] border border-amber-200">
                    Catatan: {selectedBooking.customer.notes}
                  </p>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Rincian Aset</span>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {selectedBooking.items?.map((it, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between bg-white">
                      <div>
                        <span className="font-extrabold text-slate-900 block">{it.name}</span>
                        <span className="text-[10px] text-slate-400">Jumlah: {it.quantity || 1} unit • {it.days || 1} hari</span>
                      </div>
                      <span className="font-black text-slate-800">
                        Rp {Number((it.priceValue || 0) * (it.quantity || 1) * (it.days || 1)).toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center text-amber-950">
                <span className="font-bold">Total Nilai Sewa:</span>
                <span className="text-base font-black font-heading">
                  Rp {Number(selectedBooking.totalCost || 0).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 rounded-xl bg-uii-blue-950 text-uii-gold text-xs font-black"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
