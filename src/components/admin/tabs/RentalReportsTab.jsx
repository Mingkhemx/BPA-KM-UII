import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Sparkles,
  Camera,
  Trash2,
  ChevronDown,
  Upload,
  Image as ImageIcon,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { adminStorage } from '../../../utils/adminStorage';
import { neonApi } from '../../../services/neonDb';
import { 
  saveStoredTrackingBookings,
  PROGRESS_STAGES,
  deriveStatusFromPercent,
  buildSmartMilestones,
  getActiveStaffPIC,
  formatWhatsAppNumber
} from '../../../data/trackingData';
import { AdminConfirmOverlayModal } from '../AdminOverlayModal';

export const RentalReportsTab = ({ adminUser }) => {
  const [bookings, setBookings] = useState(() => adminStorage.getBookings());

  useEffect(() => {
    const syncBookings = () => setBookings(adminStorage.getBookings());
    window.addEventListener('bpa-data-updated', syncBookings);
    window.addEventListener('storage', syncBookings);
    return () => {
      window.removeEventListener('bpa-data-updated', syncBookings);
      window.removeEventListener('storage', syncBookings);
    };
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [toastMsg, setToastMsg] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [progressModalBooking, setProgressModalBooking] = useState(null);
  const [rejectTargetCode, setRejectTargetCode] = useState(null);
  const [newProgressPercent, setNewProgressPercent] = useState(35);
  const [newProgressStage, setNewProgressStage] = useState('');
  const [newProgressTitle, setNewProgressTitle] = useState('');
  const [newProgressDesc, setNewProgressDesc] = useState('');
  const [uploadedPhoto, setUploadedPhoto] = useState('');
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const photoInputRef = useRef(null);

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

  // Perhitungan Tingkat Utilisasi Aset secara Dinamis dari Data Reservasi Nyata
  const assetUtilization = useMemo(() => {
    if (!Array.isArray(bookings) || bookings.length === 0) return [];

    const countMap = {};
    bookings.forEach((b) => {
      const items = Array.isArray(b.items) && b.items.length > 0
        ? b.items
        : [{ name: b.assetName || b.asset_name || 'Aset BPA' }];
      items.forEach((it) => {
        const name = (it.name || 'Aset BPA').trim();
        countMap[name] = (countMap[name] || 0) + (Number(it.quantity) || 1);
      });
    });

    const entries = Object.entries(countMap);
    if (entries.length === 0) return [];

    const totalQuantity = entries.reduce((acc, [, qty]) => acc + qty, 0) || 1;

    return entries
      .map(([name, count]) => ({
        name,
        count,
        percent: Math.min(100, Math.round((count / totalQuantity) * 100))
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [bookings]);

  const syncBookingsAndSave = (updated, changedBooking) => {
    setBookings(updated);
    adminStorage.saveBookings(updated);
    saveStoredTrackingBookings(updated);
    if (changedBooking) {
      neonApi.saveBooking(changedBooking).catch(() => {});
    }
  };

  // Handlers
  const handleApprove = (bookingCode) => {
    const staffPic = getActiveStaffPIC(adminUser);
    let target = null;
    const updated = bookings.map(b => {
      if (b.bookingCode === bookingCode) {
        target = {
          ...b,
          status: 'DISETUJUI',
          progressPercent: 35,
          progressStage: 'Tahap 2: Jadwal Disetujui Staf BPA & Menunggu Konfirmasi DP',
          picStaff: b.picStaff?.name ? b.picStaff : staffPic,
          milestones: buildSmartMilestones(35, b.milestones)
        };
        return target;
      }
      return b;
    });
    syncBookingsAndSave(updated, target);
    showNotification(`Reservasi ${bookingCode} berhasil DISETUJUI & ditugaskan ke ${target?.picStaff?.name}!`);
  };

  const handleClaimPIC = (bookingCode) => {
    const staffPic = getActiveStaffPIC(adminUser);
    let target = null;
    const now = new Date();
    const timeStr = now.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\//g, '/') + ' WIB';

    const claimEntry = {
      id: `upd-${Date.now()}`,
      timestamp: timeStr,
      sender: staffPic.name,
      senderRole: staffPic.role,
      title: 'Penanggung Jawab Aset (PIC) Resmi Ditugaskan',
      message: `${staffPic.name} telah mengklaim dan resmi menjadi staf penanggung jawab (PIC) operasional aset sewa ini. Penyewa dapat berkoordinasi langsung melalui WhatsApp: ${staffPic.phone}.`,
      percent: 35,
      badgeType: 'info'
    };

    const updated = bookings.map(b => {
      if (b.bookingCode === bookingCode) {
        claimEntry.percent = b.progressPercent || 35;
        target = {
          ...b,
          picStaff: staffPic,
          timelineUpdates: [claimEntry, ...(b.timelineUpdates || [])]
        };
        return target;
      }
      return b;
    });

    syncBookingsAndSave(updated, target);
    showNotification(`Anda (${staffPic.name}) berhasil mengklaim ${bookingCode} sebagai PIC!`);
  };

  const handleReject = (bookingCode) => {
    setRejectTargetCode(bookingCode);
  };

  const handleConfirmReject = () => {
    if (!rejectTargetCode) return;
    let target = null;
    const updated = bookings.map(b => {
      if (b.bookingCode === rejectTargetCode) {
        target = {
          ...b,
          status: 'DITOLAK',
          progressPercent: 0,
          progressStage: 'Pengajuan Ditolak (Jadwal Bentrok / Syarat Tidak Terpenuhi)'
        };
        return target;
      }
      return b;
    });
    syncBookingsAndSave(updated, target);
    showNotification(`Reservasi ${rejectTargetCode} telah DITOLAK.`);
    setRejectTargetCode(null);
  };

  const handleMarkCompleted = (bookingCode) => {
    let target = null;
    const updated = bookings.map(b => {
      if (b.bookingCode === bookingCode) {
        target = {
          ...b,
          status: 'SELESAI',
          progressPercent: 100,
          progressStage: 'Tahap 6: Acara Selesai, Serah Terima Kembali & Checklist Lengkap',
          milestones: buildSmartMilestones(100, b.milestones)
        };
        return target;
      }
      return b;
    });
    syncBookingsAndSave(updated, target);
    showNotification(`Reservasi ${bookingCode} ditandai SELESAI.`);
  };

  const getLoggedInAdmin = () => {
    try {
      const raw = localStorage.getItem('bpa_auth_user');
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  };

  // Handler Perubahan Slider Berbasis Tahap (snap langsung per tahap 1..6)
  const handleStageSliderChange = (stageIdx) => {
    const stage = PROGRESS_STAGES[stageIdx];
    if (!stage) return;
    setNewProgressPercent(stage.percent);
    setNewProgressStage(stage.stage);
    setNewProgressTitle(stage.title);
    setNewProgressDesc(stage.note);
  };

  const currentStageSliderIndex = (() => {
    const exactIdx = PROGRESS_STAGES.findIndex((s) => s.percent === Number(newProgressPercent));
    if (exactIdx !== -1) return exactIdx;
    let bestIdx = 0;
    let minDiff = Infinity;
    PROGRESS_STAGES.forEach((s, idx) => {
      const diff = Math.abs(s.percent - Number(newProgressPercent));
      if (diff < minDiff) {
        minDiff = diff;
        bestIdx = idx;
      }
    });
    return bestIdx;
  })();

  // Handler Upload Foto Dokumentasi Lapangan (dengan kompresi Canvas)
  const handlePhotoFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('Mohon pilih file gambar yang valid (JPG, PNG, atau WEBP).');
      return;
    }

    setIsProcessingPhoto(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 800;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setUploadedPhoto(canvas.toDataURL('image/jpeg', 0.8));
        setIsProcessingPhoto(false);
        showNotification('Foto dokumentasi berhasil dipilih!');
      };
      img.onerror = () => {
        setIsProcessingPhoto(false);
        showNotification('Gagal memproses file gambar.');
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Handler Submit Pembaruan Progres Kesiapan & Foto Dokumentasi
  const handleUpdateProgressSubmit = (e) => {
    e.preventDefault();
    if (!progressModalBooking) return;

    const pct = Number(newProgressPercent);
    const stageText = newProgressStage.trim() || progressModalBooking.progressStage || 'Tahap 1: Verifikasi Jadwal';
    const nextStatus = deriveStatusFromPercent(pct, progressModalBooking.status);

    const stageObj = PROGRESS_STAGES.find(s => s.percent === pct) || 
                     PROGRESS_STAGES.find(s => stageText.startsWith(`Tahap ${s.tahap}`));
    const finalTitle = newProgressTitle.trim() || stageObj?.title || `Pembaruan Kesiapan (${pct}%)`;
    const finalDesc = newProgressDesc.trim() || stageObj?.note || stageText;

    const loggedIn = getLoggedInAdmin();
    const now = new Date();
    const timeStr = now.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\//g, '/') + ' WIB';

    const newTimelineEntry = {
      id: `upd-${Date.now()}`,
      timestamp: timeStr,
      sender: loggedIn?.name || 'Miki Mangkunegara',
      senderRole: loggedIn?.role || 'Koordinator Approval BPA',
      title: finalTitle,
      message: finalDesc,
      percent: pct,
      badgeType: pct >= 100 ? 'ready' : pct >= 70 ? 'prep' : 'info',
      photo: uploadedPhoto || ''
    };

    const staffPic = progressModalBooking.picStaff?.name ? progressModalBooking.picStaff : getActiveStaffPIC(adminUser);

    let target = null;
    const updated = bookings.map(b => {
      if (b.bookingCode === progressModalBooking.bookingCode) {
        target = {
          ...b,
          progressPercent: pct,
          progressStage: stageText,
          progressDescription: finalDesc,
          progressPhoto: uploadedPhoto || b.progressPhoto || '',
          picStaff: staffPic,
          status: nextStatus,
          milestones: buildSmartMilestones(pct, b.milestones),
          timelineUpdates: [newTimelineEntry, ...(b.timelineUpdates || [])]
        };
        return target;
      }
      return b;
    });

    syncBookingsAndSave(updated, target);
    showNotification(`Progres kesiapan ${progressModalBooking.bookingCode} berhasil diupdate ke ${pct}%!`);
    setProgressModalBooking(null);
    setUploadedPhoto('');
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
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-1.5 w-28">
                              <div className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-uii-blue-900 h-full rounded-full"
                                  style={{ width: `${b.progressPercent}%` }}
                                />
                              </div>
                              <span className="text-[9px] font-bold text-slate-500">{b.progressPercent}%</span>
                              {(b.progressPhoto || b.timelineUpdates?.some(u => u.photo)) && (
                                <span title="Foto dokumentasi kesiapan terlampir" className="text-uii-blue-900 flex-shrink-0">
                                  <Camera className="w-2.5 h-2.5 inline" />
                                </span>
                              )}
                            </div>
                            {b.progressStage && (
                              <span className="text-[9px] text-slate-500 block truncate max-w-[130px]" title={b.progressStage}>
                                {b.progressStage.split(':')[0]}
                              </span>
                            )}
                            {b.picStaff?.name ? (
                              <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded block truncate max-w-[130px]" title={`PIC: ${b.picStaff.name} (WA: ${b.picStaff.phone || '-'})`}>
                                PIC: {b.picStaff.name}
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleClaimPIC(b.bookingCode)}
                                className="text-[9px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded transition-colors block text-left"
                                title="Klaim penugasan sebagai PIC penanggung jawab"
                              >
                                + Klaim PIC
                              </button>
                            )}
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
                              const curPct = b.progressPercent !== undefined ? Number(b.progressPercent) : 35;
                              setNewProgressPercent(curPct);
                              setNewProgressStage(b.progressStage || 'Tahap 2: Jadwal Disetujui Staf BPA & Menunggu Konfirmasi DP');
                              setUploadedPhoto(b.progressPhoto || b.timelineUpdates?.[0]?.photo || '');
                              const matched = PROGRESS_STAGES.find(s => 
                                (b.progressStage && b.progressStage.startsWith(`Tahap ${s.tahap}`)) || 
                                s.percent === curPct
                              );
                              setNewProgressTitle(matched?.title || b.timelineUpdates?.[0]?.title || 'Jadwal Terverifikasi & Disetujui');
                              setNewProgressDesc(b.progressDescription || b.timelineUpdates?.[0]?.message || matched?.note || '');
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
      <div className="grid grid-cols-1 gap-4">
        {/* Utilisasi Aset Terpopuler */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-uii-blue-950 font-heading">
              Tingkat Utilisasi Aset Terpopuler
            </h4>
            <span className="text-[10px] text-slate-400 font-bold">
              {bookings.length} Reservasi
            </span>
          </div>

          {assetUtilization.length > 0 ? (
            <div className="space-y-3 text-xs">
              {assetUtilization.map((asset) => (
                <div key={asset.name}>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="truncate pr-2">{asset.name}</span>
                    <span className="text-uii-blue-900 font-black flex-shrink-0">
                      {asset.percent}% Utilisasi ({asset.count}x)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-uii-blue-900 h-full rounded-full transition-all duration-500"
                      style={{ width: `${asset.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-slate-400 space-y-1">
              <p className="text-xs font-bold text-slate-500">Belum Ada Data Sewa Aset</p>
              <p className="text-[11px] text-slate-400">
                Tingkat utilisasi akan otomatis terhitung saat admin atau pengguna membuat reservasi sewa.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL UPDATE PROGRESS PERSIAPAN */}
      {progressModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleUpdateProgressSubmit}
            className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-uii-blue-900 block font-mono">
                  {progressModalBooking.bookingCode}
                </span>
                <h4 className="font-black text-sm text-uii-blue-950 font-heading">
                  Update Kesiapan Lapangan ({progressModalBooking.bookingCode})
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setProgressModalBooking(null);
                  setUploadedPhoto('');
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* PENANGGUNG JAWAB ASET (PIC BPA DARI DATABASE) */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center space-x-3 min-w-0">
                  <img
                    src={
                      progressModalBooking.picStaff?.avatar ||
                      progressModalBooking.picStaff?.picture ||
                      getActiveStaffPIC(adminUser).avatar
                    }
                    alt="PIC"
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-white flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[9px] font-black uppercase tracking-wider text-uii-blue-900 block">
                      Penanggung Jawab Aset (PIC BPA Terdaftar)
                    </span>
                    <h5 className="font-extrabold text-slate-900 text-xs truncate">
                      {progressModalBooking.picStaff?.name || getActiveStaffPIC(adminUser).name}
                    </h5>
                    <p className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                      <span>WhatsApp:</span>
                      <span>{progressModalBooking.picStaff?.phone || getActiveStaffPIC(adminUser).phone}</span>
                    </p>
                  </div>
                </div>

                {(!progressModalBooking.picStaff?.name || progressModalBooking.picStaff.name !== getActiveStaffPIC(adminUser).name) ? (
                  <button
                    type="button"
                    onClick={() => {
                      const staffPic = getActiveStaffPIC(adminUser);
                      setProgressModalBooking({
                        ...progressModalBooking,
                        picStaff: staffPic
                      });
                      showNotification(`PIC diset ke akun Anda: ${staffPic.name} (WA: ${staffPic.phone})`);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-uii-blue-950 hover:bg-uii-blue-900 text-uii-gold text-[10px] font-black shadow-xs flex-shrink-0 transition-colors cursor-pointer"
                  >
                    Klaim Sebagai PIC
                  </button>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center gap-1 flex-shrink-0">
                    <ShieldCheck className="w-3 h-3" />
                    <span>PIC Anda</span>
                  </span>
                )}
              </div>

              {/* PERSENTASE KESIAPAN SARPRAS & SLIDER */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-700">Persentase Kesiapan Sarpras:</span>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-900">
                      {deriveStatusFromPercent(newProgressPercent, progressModalBooking.status)}
                    </span>
                    <span className="text-uii-blue-950 font-black text-sm">{newProgressPercent}%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={PROGRESS_STAGES.length - 1}
                  step={1}
                  value={currentStageSliderIndex}
                  onChange={(e) => handleStageSliderChange(Number(e.target.value))}
                  className="w-full accent-uii-blue-950 cursor-pointer"
                />
                <div className="grid grid-cols-6 gap-1 text-center text-[9px] font-bold text-slate-400">
                  {PROGRESS_STAGES.map((stage, idx) => (
                    <button
                      key={stage.tahap}
                      type="button"
                      onClick={() => handleStageSliderChange(idx)}
                      className={`py-0.5 rounded transition-colors ${
                        currentStageSliderIndex === idx
                          ? 'text-uii-blue-950 font-black'
                          : 'hover:text-slate-600'
                      }`}
                    >
                      Tahap {stage.tahap} ({stage.percent}%)
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. JUDUL BERITA ACARA & LABEL TAHAP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Judul Berita Acara:
                  </label>
                  <input
                    type="text"
                    required
                    value={newProgressTitle}
                    onChange={(e) => setNewProgressTitle(e.target.value)}
                    placeholder="Contoh: Jadwal Terverifikasi & Disetujui"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-uii-blue-900 focus:outline-none shadow-2xs font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Label Tahap Kesiapan:
                  </label>
                  <input
                    type="text"
                    required
                    value={newProgressStage}
                    onChange={(e) => {
                      setNewProgressStage(e.target.value);
                    }}
                    placeholder="Contoh: Tahap 2: Jadwal Disetujui Staf BPA & Menunggu Konfirmasi DP"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-uii-blue-900 focus:outline-none shadow-2xs"
                  />
                </div>
              </div>

              {/* 4. DESKRIPSI CATATAN PROGRES UNTUK PENYEWA */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Deskripsi Catatan Progres untuk Penyewa:
                </label>
                <textarea
                  rows={3}
                  required
                  value={newProgressDesc}
                  onChange={(e) => setNewProgressDesc(e.target.value)}
                  placeholder="Contoh: Staf BPA telah memverifikasi jadwal dan ketersediaan aset bebas bentrok. Silakan selesaikan administrasi DP."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-uii-blue-900 focus:outline-none resize-none shadow-2xs leading-relaxed"
                />
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Teks ini langsung muncul pada kartu <strong>Berita Acara & Catatan Progres Lapangan BPA</strong> di sisi penyewa.
                </span>
              </div>

              {/* 4. UPLOAD FOTO DOKUMENTASI BUKTI TAHAP */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-uii-blue-900" />
                    <span>Upload Foto Dokumentasi Lapangan:</span>
                  </span>
                  <span className="text-[10px] font-normal text-slate-400">Opsional</span>
                </label>

                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoFileChange}
                  className="hidden"
                />

                {uploadedPhoto ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group">
                    <img
                      src={uploadedPhoto}
                      alt="Preview dokumentasi tahap"
                      className="w-full h-36 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-white text-slate-800 font-bold text-[11px] shadow-md flex items-center space-x-1 hover:bg-slate-50"
                      >
                        <Camera className="w-3 h-3 text-uii-blue-900" />
                        <span>Ganti</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadedPhoto('')}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-[11px] shadow-md flex items-center space-x-1 hover:bg-rose-700"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Hapus</span>
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-bold">
                      Foto Terlampir
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      disabled={isProcessingPhoto}
                      className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-uii-blue-900 bg-slate-50/70 hover:bg-blue-50/40 text-slate-600 font-bold flex flex-col items-center justify-center space-y-1 transition-all"
                    >
                      <div className="p-2 rounded-full bg-blue-50 text-uii-blue-900">
                        <Camera className="w-4 h-4" />
                      </div>
                      <span className="text-[11px]">
                        {isProcessingPhoto ? 'Sedang memproses gambar...' : 'Klik untuk Pilih / Upload Foto Dokumentasi'}
                      </span>
                      <span className="text-[9px] font-normal text-slate-400">
                        Mendukung JPG, PNG, WEBP (Otomatis dikompres)
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setProgressModalBooking(null);
                  setUploadedPhoto('');
                }}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isProcessingPhoto}
                className="px-5 py-2 rounded-xl bg-uii-blue-950 hover:bg-uii-blue-900 text-uii-gold text-xs font-black shadow-md flex items-center space-x-1.5 transition-colors disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Simpan Progres</span>
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

              {/* Status & Kesiapan Lapangan Terkini */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Kesiapan Lapangan
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-900">
                    {selectedBooking.status} ({selectedBooking.progressPercent || 0}%)
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-uii-blue-900 h-full rounded-full transition-all"
                      style={{ width: `${selectedBooking.progressPercent || 0}%` }}
                    />
                  </div>
                  <p className="text-[11px] font-bold text-slate-700">
                    {selectedBooking.progressStage || 'Tahap Verifikasi Awal'}
                  </p>
                </div>

                {/* Foto Dokumentasi Terkini jika ada */}
                {(selectedBooking.progressPhoto || selectedBooking.timelineUpdates?.[0]?.photo) && (
                  <div className="pt-2 border-t border-slate-200/70">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                      <Camera className="w-3 h-3 text-uii-blue-900" />
                      <span>Dokumentasi Foto Lapangan Terakhir:</span>
                    </span>
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-48 group">
                      <img
                        src={selectedBooking.progressPhoto || selectedBooking.timelineUpdates?.[0]?.photo}
                        alt="Dokumentasi Lapangan"
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  </div>
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
      {/* CARD OVERLAY KONFIRMASI TOLAK PENGAJUAN */}
      <AdminConfirmOverlayModal
        isOpen={Boolean(rejectTargetCode)}
        onClose={() => setRejectTargetCode(null)}
        onConfirm={handleConfirmReject}
        title="Tolak Pengajuan Sewa"
        message={`Yakin ingin menolak pengajuan sewa ${rejectTargetCode || ''}? Status reservasi akan berubah menjadi DITOLAK.`}
        confirmLabel="Ya, Tolak Pengajuan"
        variant="warning"
      />
    </div>
  );
};
