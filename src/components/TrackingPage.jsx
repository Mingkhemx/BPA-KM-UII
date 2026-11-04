import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  Sparkles,
  PhoneCall,
  Send,
  Calendar,
  Building,
  User,
  Package,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Share2,
  Printer,
  Sliders,
  Image as ImageIcon,
  MessageSquare,
  RefreshCw,
  PlusCircle,
  XCircle,
  ExternalLink,
  Info
} from 'lucide-react';
import {
  getStoredTrackingBookings,
  saveStoredTrackingBookings
} from '../data/trackingData';

export const TrackingPage = ({
  onBackHome,
  onNavigateSewa,
  initialBookingCode = '',
  activeBooking = null
}) => {
  // Database Booking Tracking
  const [allBookings, setAllBookings] = useState(() => getStoredTrackingBookings());
  
  // Kode Booking yang sedang dicari/dilihat
  const [searchCode, setSearchCode] = useState(() => {
    if (initialBookingCode) return initialBookingCode;
    if (activeBooking?.bookingCode) return activeBooking.bookingCode;
    return 'BPA-20261102-7492';
  });

  // Booking yang saat ini aktif ditampilkan
  const [currentBooking, setCurrentBooking] = useState(() => {
    const list = getStoredTrackingBookings();
    const code = initialBookingCode || activeBooking?.bookingCode || 'BPA-20261102-7492';
    const found = list.find(b => b.bookingCode.toLowerCase() === code.toLowerCase());
    return found || list[0] || null;
  });

  // State Mode Staf BPA (Untuk Mengirimkan Update & Persentase)
  const [isStaffPanelOpen, setIsStaffPanelOpen] = useState(false);
  const [staffFormPercent, setStaffFormPercent] = useState(currentBooking?.progressPercent || 75);
  const [staffFormStatus, setStaffFormStatus] = useState(currentBooking?.status || 'SEDANG DISIAPKAN');
  const [staffFormStage, setStaffFormStage] = useState(currentBooking?.progressStage || '');
  const [staffUpdateTitle, setStaffUpdateTitle] = useState('');
  const [staffUpdateMessage, setStaffUpdateMessage] = useState('');
  const [staffSenderName, setStaffSenderName] = useState('Fathur Rahman (Koordinator Sarpras)');
  const [staffSelectedPhoto, setStaffSelectedPhoto] = useState('/images/produk/detail/scc-wide.jpg');
  const [toastMessage, setToastMessage] = useState('');

  // Foto-foto preset yang bisa dipilih staf untuk dokumentasi persiapan
  const PRESET_PHOTOS = [
    { label: 'Hall Gedung SCC Rapi & Bersih', url: '/images/produk/detail/scc-wide.jpg' },
    { label: 'HT Baofeng Charger Penuh', url: '/images/produk/detail/ht-tampak.jpg' },
    { label: 'Rigging Proyektor & Layar', url: '/images/produk/detail/proyektor-angle.jpg' },
    { label: 'Sound System HTS P12E Ready', url: '/images/produk/hts-speaker-p12e.png' },
    { label: 'Kursi Sapporo Ditata Rapi', url: '/images/produk/detail/kursi-tampak.jpg' },
    { label: 'Gedung SCC Tampak Depan', url: '/images/produk/gedung-scc.png' }
  ];

  // Sinkronisasi saat searchCode atau list berubah
  useEffect(() => {
    if (currentBooking) {
      setStaffFormPercent(currentBooking.progressPercent || 0);
      setStaffFormStatus(currentBooking.status || 'MENUNGGU PERSETUJUAN');
      setStaffFormStage(currentBooking.progressStage || '');
    }
  }, [currentBooking]);

  const handleSearch = (e) => {
    e?.preventDefault();
    const clean = searchCode.trim().toLowerCase();
    const found = allBookings.find(b => b.bookingCode.toLowerCase() === clean);
    if (found) {
      setCurrentBooking(found);
      showToast(`Data sewa #${found.bookingCode} berhasil ditemukan!`);
    } else {
      showToast(`Kode "${searchCode}" tidak ditemukan. Silakan cek nomor registrasi Anda.`, 'error');
    }
  };

  const handleSelectQuickCode = (code) => {
    setSearchCode(code);
    const found = allBookings.find(b => b.bookingCode.toLowerCase() === code.toLowerCase());
    if (found) {
      setCurrentBooking(found);
      showToast(`Memuat data sewa #${found.bookingCode}`);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  // Handler Staf BPA Mengirimkan Pembaruan Progres Baru
  const handleStaffSubmitUpdate = (e) => {
    e.preventDefault();
    if (!currentBooking) return;

    if (!staffUpdateTitle.trim() || !staffUpdateMessage.trim()) {
      showToast('Mohon isi judul update dan rincian pesan progres untuk penyewa.', 'error');
      return;
    }

    const now = new Date();
    const timeStr = `Hari ini, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} WIB`;

    const newUpdateItem = {
      id: `upd-${Date.now()}`,
      timestamp: timeStr,
      sender: staffSenderName,
      senderRole: 'Staf Lapangan BPA KM UII',
      title: staffUpdateTitle.trim(),
      message: staffUpdateMessage.trim(),
      percent: staffFormPercent,
      badgeType: staffFormPercent === 100 ? 'ready' : 'prep',
      photo: staffSelectedPhoto
    };

    // Update milestones completion based on percentage
    const updatedMilestones = currentBooking.milestones.map(m => {
      if (staffFormPercent >= 100) return { ...m, completed: true, current: m.id === 6 };
      if (staffFormPercent >= 80) return { ...m, completed: m.id <= 5, current: m.id === 5 };
      if (staffFormPercent >= 50) return { ...m, completed: m.id <= 4, current: m.id === 4 };
      if (staffFormPercent >= 30) return { ...m, completed: m.id <= 3, current: m.id === 3 };
      if (staffFormPercent >= 20) return { ...m, completed: m.id <= 2, current: m.id === 2 };
      return { ...m, completed: m.id === 1, current: m.id === 1 };
    });

    const updatedBooking = {
      ...currentBooking,
      status: staffFormStatus,
      progressPercent: staffFormPercent,
      progressStage: staffFormStage.trim() || `Persiapan Fisik & Sarana (${staffFormPercent}%)`,
      milestones: updatedMilestones,
      timelineUpdates: [newUpdateItem, ...(currentBooking.timelineUpdates || [])]
    };

    const updatedAll = allBookings.map(b => 
      b.bookingCode === updatedBooking.bookingCode ? updatedBooking : b
    );

    setAllBookings(updatedAll);
    setCurrentBooking(updatedBooking);
    saveStoredTrackingBookings(updatedAll);

    // Reset formulir input update
    setStaffUpdateTitle('');
    setStaffUpdateMessage('');
    showToast(`✅ Progres persiapan (${staffFormPercent}%) berhasil dikirim & dipublikasikan ke penyewa!`);
  };

  // Helper WhatsApp Staf Memberi Notifikasi Update ke Nomor Pemesan
  const handleSendWhatsAppUpdateToCustomer = () => {
    if (!currentBooking) return;
    const phone = currentBooking.customer?.phone?.replace(/[^0-9]/g, '') || '';
    let formattedPhone = phone;
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.slice(1);
    }

    const itemsSummary = currentBooking.items.map(it => `• ${it.name} (${it.quantity} Unit)`).join('\n');
    const latestUpdate = currentBooking.timelineUpdates?.[0];

    let msg = `*PEMBERITAHUAN PROGRES PERSIAPAN SEWA ASET BPA KM UII*\n\n`;
    msg += `Yth. *${currentBooking.customer?.name}* (${currentBooking.customer?.org || 'Pribadi'})\n`;
    msg += `Kami dari Tim Staf BPA KM UII menginformasikan perkembangan persiapan sewa sarana prasarana Anda:\n\n`;
    msg += `📋 *Kode Registrasi:* #${currentBooking.bookingCode}\n`;
    msg += `📊 *Persentase Persiapan BPA:* *${currentBooking.progressPercent}%*\n`;
    msg += `🏷️ *Status:* *${currentBooking.status}*\n`;
    msg += `📍 *Lokasi:* ${currentBooking.location}\n`;
    msg += `📅 *Jadwal Acara:* ${currentBooking.eventDate}\n\n`;
    msg += `📦 *Aset yang Disewa:*\n${itemsSummary}\n\n`;
    
    if (latestUpdate) {
      msg += `📢 *Update Lapangan Terkini:*\n"${latestUpdate.title}"\n${latestUpdate.message}\n(Oleh: ${latestUpdate.sender})\n\n`;
    }

    msg += `🔗 *Pantau Live Tracking Lengkap:* ${window.location.origin}\n\n`;
    msg += `Apabila ada koordinasi teknis tambahan, silakan balas pesan ini. Terima kasih!\n\n`;
    msg += `_Badan Pengelola Aset (BPA) KM UII_\n_Gedung SCC Lantai 1 Kampus Terpadu UII_`;

    const targetUrl = formattedPhone 
      ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/6285233475595?text=${encodeURIComponent(msg)}`;

    window.open(targetUrl, '_blank');
  };

  // Helper User Menghubungi WhatsApp PIC Staf
  const handleChatStaffPIC = () => {
    if (!currentBooking) return;
    const staffPhone = currentBooking.picStaff?.phone || '6285233475595';
    let msg = `Halo ${currentBooking.picStaff?.name || 'Staf BPA KM UII'}, saya ${currentBooking.customer?.name} pemesan sewa aset dengan Kode: *#${currentBooking.bookingCode}*.\n\n`;
    msg += `Saya melihat progres persiapan di website BPA saat ini sudah *${currentBooking.progressPercent}%* (${currentBooking.status}). Ingin menanyakan koordinasi teknis terkait persiapan acara kami pada ${currentBooking.eventDate}. Terima kasih!`;

    window.open(`https://wa.me/${staffPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Status Styling Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'SIAP DIGUNAKAN':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-300',
          dot: 'bg-emerald-500',
          icon: Sparkles,
          label: '100% Siap Digunakan / Serah Terima'
        };
      case 'SEDANG DISIAPKAN':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-300',
          dot: 'bg-blue-600 animate-pulse',
          icon: Clock,
          label: 'Sedang Disiapkan oleh Staf BPA'
        };
      case 'DISETUJUI':
        return {
          bg: 'bg-teal-50 text-teal-800 border-teal-300',
          dot: 'bg-teal-500',
          icon: CheckCircle2,
          label: 'Pengajuan Disetujui (Approved)'
        };
      case 'DITOLAK':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-300',
          dot: 'bg-rose-500',
          icon: XCircle,
          label: 'Pengajuan Ditolak'
        };
      default:
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300',
          dot: 'bg-amber-500 animate-ping',
          icon: Clock,
          label: 'Menunggu Persetujuan Staf'
        };
    }
  };

  const statusMeta = currentBooking ? getStatusBadge(currentBooking.status) : getStatusBadge('SEDANG DISIAPKAN');
  const StatusIcon = statusMeta.icon;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 sm:pt-28 pb-20 selection:bg-uii-blue-900 selection:text-uii-gold">
      
      {/* Toast Notifikasi Aksi */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-bold flex items-center space-x-2 border ${
              toastMessage.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700'
                : 'bg-uii-blue-950 text-uii-gold border-uii-gold/40'
            }`}
          >
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb & Back */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <button
              onClick={onBackHome}
              className="hover:text-uii-blue-900 font-bold transition-colors"
            >
              Beranda
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <button
              onClick={onNavigateSewa}
              className="hover:text-uii-blue-900 font-bold transition-colors"
            >
              Layanan Sewa Aset
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-uii-blue-950 font-black">Pelacakan Progres Sewa</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition-colors"
              title="Cetak Bukti Pelacakan"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Cetak Dokumen</span>
            </button>

            {/* Toggle Panel Khusus Staf BPA */}
            <button
              onClick={() => setIsStaffPanelOpen(!isStaffPanelOpen)}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-2 border transition-all ${
                isStaffPanelOpen
                  ? 'bg-amber-400 text-uii-blue-950 border-amber-500 shadow-sm'
                  : 'bg-uii-blue-950 text-white border-uii-gold/50 hover:border-uii-gold'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-uii-gold" />
              <span>{isStaffPanelOpen ? 'Tutup Mode Staf BPA' : '🛠️ Mode Staf BPA (Kirim Progres)'}</span>
            </button>
          </div>
        </div>

        {/* HERO HEADER: PENCARIAN & IDENTITAS PELACAKAN */}
        <div className="relative rounded-3xl bg-gradient-to-r from-uii-blue-950 via-uii-blue-900 to-uii-blue-950 text-white p-6 sm:p-10 shadow-2xl overflow-hidden mb-8 border border-uii-gold/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-uii-gold/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-uii-gold text-xs font-black uppercase tracking-wider mb-3 border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-uii-gold" />
              <span>Live Preparation Tracker BPA KM UII</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-black font-heading tracking-tight leading-tight">
              Pelacakan Progres & Persiapan Sewa Aset
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Pantau persentase kesiapan gedung, perangkat audio multimedia, serta inventaris acara Anda secara transparan langsung dari laporan tim lapangan BPA KM UII.
            </p>

            {/* FORM INPUT PENCARIAN KODE BOOKING */}
            <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  placeholder="Masukkan Nomor Registrasi Sewa (Contoh: BPA-20261102-7492)"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-slate-900 text-xs sm:text-sm font-bold placeholder-slate-400 border border-transparent focus:outline-none focus:ring-2 focus:ring-uii-gold shadow-lg"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3.5 rounded-2xl bg-uii-gold hover:bg-yellow-400 text-uii-blue-950 font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 flex-shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>Lacak Progres</span>
              </button>
            </form>
          </div>
        </div>

        {/* ============================================================== */}
        {/* PANEL KHUSUS STAF BPA: UNTUK MENGIRIMKAN PROSES & PERSENTASE */}
        {/* ============================================================== */}
        <AnimatePresence>
          {isStaffPanelOpen && currentBooking && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              className="overflow-hidden mb-8"
            >
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-100/50 border-2 border-amber-300 shadow-xl space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/80 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-amber-800">
                        Portal Internal Petugas
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-amber-950 font-heading">
                        Panel Pengelola & Kirim Progres (Staf BPA KM UII)
                      </h3>
                    </div>
                  </div>

                  <div className="text-xs text-amber-900 bg-white/80 px-3.5 py-1.5 rounded-xl border border-amber-200 font-bold self-start sm:self-center">
                    Aset: <span className="text-uii-blue-950 font-extrabold">{currentBooking.bookingCode}</span>
                  </div>
                </div>

                {/* FORM STAF UPDATE PROGRES */}
                <form onSubmit={handleStaffSubmitUpdate} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Kolom Kiri: Slider Persentase & Status Sewa */}
                    <div className="space-y-5 bg-white p-5 rounded-2xl border border-amber-200 shadow-2xs">
                      
                      {/* PENGATURAN PERSENTASE PERSIAPAN */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                            Persentase Persiapan BPA:
                          </label>
                          <span className="text-2xl font-black text-uii-blue-950 font-heading">
                            {staffFormPercent}%
                          </span>
                        </div>

                        {/* Visual Range Slider */}
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={staffFormPercent}
                          onChange={(e) => setStaffFormPercent(Number(e.target.value))}
                          className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-uii-blue-900"
                        />

                        {/* Quick Percent Buttons */}
                        <div className="flex items-center justify-between gap-1.5 mt-3">
                          {[15, 25, 50, 75, 90, 100].map(p => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setStaffFormPercent(p)}
                              className={`flex-1 py-1 text-[11px] font-black rounded-lg transition-all ${
                                staffFormPercent === p
                                  ? 'bg-uii-blue-950 text-uii-gold shadow-xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              {p}%
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* UBAH STATUS PENGAJUAN */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                          Status Permohonan Sewa:
                        </label>
                        <select
                          value={staffFormStatus}
                          onChange={(e) => setStaffFormStatus(e.target.value)}
                          className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-uii-blue-900"
                        >
                          <option value="MENUNGGU PERSETUJUAN">⏳ MENUNGGU PERSETUJUAN</option>
                          <option value="DISETUJUI">🟢 DISETUJUI (APPROVED)</option>
                          <option value="SEDANG DISIAPKAN">🔧 SEDANG DISIAPKAN (IN PREPARATION)</option>
                          <option value="SIAP DIGUNAKAN">✨ SIAP DIGUNAKAN / SERAH TERIMA (100%)</option>
                          <option value="SELESAI">🏁 SELESAI / PENGEMBALIAN ASET</option>
                          <option value="DITOLAK">🔴 DITOLAK (REJECTED)</option>
                        </select>
                      </div>

                      {/* TAHAP SAAT INI (STAGE LABEL) */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                          Tahapan Persiapan Singkat:
                        </label>
                        <input
                          type="text"
                          value={staffFormStage}
                          onChange={(e) => setStaffFormStage(e.target.value)}
                          placeholder="Contoh: Tahap 4: Uji Audio & Penataan 300 Kursi"
                          className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-uii-blue-900"
                        />
                      </div>

                      {/* NAMA STAF PENGIRIM */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                          Nama Staf Lapangan yang Bertugas:
                        </label>
                        <input
                          type="text"
                          value={staffSenderName}
                          onChange={(e) => setStaffSenderName(e.target.value)}
                          className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-uii-blue-900"
                        />
                      </div>

                    </div>

                    {/* Kolom Kanan: Pesan Update Baru & Dokumentasi Foto */}
                    <div className="space-y-4 bg-white p-5 rounded-2xl border border-amber-200 shadow-2xs">
                      
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                          Judul Pembaruan Progres Lapangan:
                        </label>
                        <input
                          type="text"
                          value={staffUpdateTitle}
                          onChange={(e) => setStaffUpdateTitle(e.target.value)}
                          placeholder="Misal: Penataan Aula SCC Selesai & AC Pra-cooling 20°C"
                          className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-uii-blue-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                          Keterangan / Pesan Detail untuk Penyewa:
                        </label>
                        <textarea
                          rows={3}
                          value={staffUpdateMessage}
                          onChange={(e) => setStaffUpdateMessage(e.target.value)}
                          placeholder="Jelaskan kondisi fisik aset yang telah disiapkan tim BPA..."
                          className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-uii-blue-900"
                        />
                      </div>

                      {/* PILIH FOTO DOKUMENTASI DARI PRESET BPA */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                          Lampirkan Foto Dokumentasi Persiapan Lapangan:
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {PRESET_PHOTOS.map((ph, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setStaffSelectedPhoto(ph.url)}
                              className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-all ${
                                staffSelectedPhoto === ph.url
                                  ? 'border-uii-blue-900 ring-2 ring-uii-gold scale-105'
                                  : 'border-slate-200 opacity-70 hover:opacity-100'
                              }`}
                              title={ph.label}
                            >
                              <img src={ph.url} alt={ph.label} className="w-full h-full object-cover" />
                              {staffSelectedPhoto === ph.url && (
                                <div className="absolute inset-0 bg-uii-blue-950/40 flex items-center justify-center">
                                  <CheckCircle2 className="w-4 h-4 text-uii-gold" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* TOMBOL AKSI DARI STAF */}
                  <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleSendWhatsAppUpdateToCustomer}
                      className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-md"
                    >
                      <Send className="w-4 h-4 text-white" />
                      <span>Kirimkan Notifikasi Progres via WhatsApp ke Penyewa</span>
                    </button>

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-uii-blue-950 hover:bg-uii-blue-900 text-uii-gold font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg"
                    >
                      <PlusCircle className="w-4 h-4 text-uii-gold" />
                      <span>Publikasikan & Simpan Update Progres</span>
                    </button>
                  </div>

                </form>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================================== */}
        {/* KONTEN UTAMA DARI SEGI USER (USER TRACKING VIEW) */}
        {/* ============================================================== */}
        {currentBooking ? (
          <div className="space-y-8">
            
            {/* 1. KARTU RINGKASAN PROGRES UTAMA (GAUGE & STATUS) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden">
              
              {/* Header Status Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider font-heading">
                      Kode: #{currentBooking.bookingCode}
                    </span>

                    {/* Status Badge */}
                    <div className={`inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${statusMeta.bg}`}>
                      <span className={`w-2 h-2 rounded-full ${statusMeta.dot}`} />
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{statusMeta.label}</span>
                    </div>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-uii-blue-950 font-heading">
                    {currentBooking.progressStage || 'Sedang Dalam Proses Penyiapan Lapangan'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Waktu Pengajuan: <strong>{currentBooking.createdAt}</strong> • Diperbarui Real-time
                  </p>
                </div>

                {/* Hubungi PIC BPA Button */}
                <div className="flex items-center gap-2 self-start lg:self-center">
                  <button
                    onClick={handleChatStaffPIC}
                    className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center space-x-2 shadow-sm"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Chat PIC BPA</span>
                  </button>
                </div>
              </div>

              {/* INDIKATOR BESAR PERSENTASE & PROGRESS BAR */}
              <div className="py-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* Visual Radial / Percentage Display */}
                <div className="md:col-span-4 flex items-center space-x-5">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center rounded-3xl bg-gradient-to-br from-uii-blue-950 to-uii-blue-900 text-white shadow-xl flex-shrink-0 border-2 border-uii-gold/40">
                    <div className="text-center">
                      <span className="text-3xl sm:text-4xl font-black text-uii-gold font-heading tracking-tight block">
                        {currentBooking.progressPercent}%
                      </span>
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                        Kesiapan
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Tingkat Kesiapan Aset
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-uii-blue-950 font-heading">
                      {currentBooking.progressPercent >= 100
                        ? 'Semua Aset 100% Siap'
                        : currentBooking.progressPercent >= 75
                        ? 'Tahap Akhir / Final Setup'
                        : currentBooking.progressPercent >= 50
                        ? 'Pengujian Teknis Sedang Berjalan'
                        : currentBooking.progressPercent >= 25
                        ? 'Persetujuan Terbit, Masuk Antrean'
                        : 'Menunggu Verifikasi Staf'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      PIC: <strong className="text-slate-800">{currentBooking.picStaff?.name}</strong>
                    </p>
                  </div>
                </div>

                {/* Progress Bar & Stage Indicator */}
                <div className="md:col-span-8 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600">Progres Penyiapan Sarpras oleh Tim BPA</span>
                    <span className="text-uii-blue-950 font-black">{currentBooking.progressPercent}% dari 100%</span>
                  </div>

                  {/* Horizontal Bar (Satu Warna Solid Rapi Sesuai Permintaan Pengguna) */}
                  <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${currentBooking.progressPercent}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full transition-all ${
                        currentBooking.progressPercent === 100
                          ? 'bg-emerald-600'
                          : 'bg-uii-blue-900'
                      }`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>1. Pengajuan</span>
                    <span>2. Approval</span>
                    <span>3. DP</span>
                    <span>4. Cek Fisik</span>
                    <span>5. Setting</span>
                    <span className="font-bold text-emerald-600">6. Ready</span>
                  </div>
                </div>

              </div>

              {/* Grid Metadata Acara & Pemesan */}
              <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center space-x-2 text-slate-400 mb-1">
                    <User className="w-3.5 h-3.5" />
                    <span className="font-bold uppercase tracking-wider text-[10px]">Pemesan & Lembaga</span>
                  </div>
                  <span className="font-bold text-slate-900 block truncate">{currentBooking.customer?.name}</span>
                  <span className="text-[11px] text-slate-500 block truncate">{currentBooking.customer?.org || 'Pribadi / Umum'}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center space-x-2 text-slate-400 mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="font-bold uppercase tracking-wider text-[10px]">Jadwal Pelaksanaan</span>
                  </div>
                  <span className="font-bold text-slate-900 block truncate">{currentBooking.eventDate}</span>
                  <span className="text-[11px] text-slate-500 block truncate">Sesuai Kalender Resmi</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center space-x-2 text-slate-400 mb-1">
                    <Building className="w-3.5 h-3.5" />
                    <span className="font-bold uppercase tracking-wider text-[10px]">Lokasi Pemakaian</span>
                  </div>
                  <span className="font-bold text-slate-900 block truncate">Gedung SCC UII</span>
                  <span className="text-[11px] text-slate-500 block truncate">Kampus Terpadu UII</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center space-x-2 text-slate-400 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="font-bold uppercase tracking-wider text-[10px]">Status Biaya & DP</span>
                  </div>
                  <span className="font-bold text-emerald-700 block truncate">{currentBooking.downPayment || 'Terverifikasi'}</span>
                  <span className="text-[11px] text-slate-500 block truncate">Total: Rp {currentBooking.totalCost?.toLocaleString('id-ID')}</span>
                </div>
              </div>

            </div>

            {/* 2. ENAM TAHAPAN UTAMA (MILESTONE PROGRESS STEPPER) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
              <h3 className="text-base sm:text-lg font-black text-uii-blue-950 font-heading mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5 text-uii-blue-900" />
                <span>Tahapan Alur Persiapan & Pengelolaan Aset BPA</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                {currentBooking.milestones?.map((step) => {
                  const isDone = step.completed;
                  const isCurrent = step.current;

                  return (
                    <div
                      key={step.id}
                      className={`relative p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/30'
                          : isDone
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-slate-50/70 border-slate-200 opacity-60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                            isDone
                              ? 'bg-emerald-500 text-white'
                              : isCurrent
                              ? 'bg-amber-500 text-white animate-pulse'
                              : 'bg-slate-200 text-slate-500'
                          }`}>
                            {isDone ? '✓' : step.id}
                          </span>

                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                            Langkah {step.id}
                          </span>
                        </div>

                        <h4 className="text-xs font-black text-uii-blue-950 font-heading leading-snug">
                          {step.label}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                          {step.desc}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/60">
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
                          isCurrent
                            ? 'text-amber-800'
                            : isDone
                            ? 'text-emerald-700'
                            : 'text-slate-400'
                        }`}>
                          {isCurrent ? '⚡ Sedang Berjalan' : isDone ? 'Selesai' : 'Antrean'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. DUA KOLOM: TIMELINE LOG DARI BPA VS RINCIAN ASET */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* KOLOM KIRI (7/12): LIVE FEED TIMELINE DARI STAF BPA */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-uii-blue-950 font-heading flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-uii-blue-900" />
                      <span>Berita Acara & Catatan Progres Lapangan BPA</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Laporan langsung dari tim operasional dan teknisi BPA KM UII
                    </p>
                  </div>

                  <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 font-bold border border-blue-200">
                    {currentBooking.timelineUpdates?.length || 0} Update
                  </span>
                </div>

                {/* TIMELINE LIST */}
                <div className="space-y-6 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                  {currentBooking.timelineUpdates && currentBooking.timelineUpdates.length > 0 ? (
                    currentBooking.timelineUpdates.map((item, idx) => (
                      <div key={item.id || idx} className="relative pl-9 space-y-2">
                        {/* Dot indicator */}
                        <div className={`absolute left-1.5 top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                          idx === 0 ? 'bg-amber-500 ring-4 ring-amber-200' : 'bg-uii-blue-900'
                        }`} />

                        {/* Card Content */}
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-uii-blue-900/40 transition-colors space-y-2">
                          
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[11px] font-extrabold text-slate-400">
                              {item.timestamp}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-uii-blue-950 text-uii-gold text-[10px] font-black uppercase tracking-wider">
                              Kesiapan: {item.percent}%
                            </span>
                          </div>

                          <h4 className="text-sm font-black text-uii-blue-950 font-heading">
                            {item.title}
                          </h4>

                          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                            {item.message}
                          </p>

                          {/* Lampiran Foto Persiapan Lapangan dari BPA */}
                          {item.photo && (
                            <div className="mt-3 pt-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                                <ImageIcon className="w-3 h-3" />
                                <span>Dokumentasi Lapangan Staf BPA:</span>
                              </span>
                              <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-48 group">
                                <img
                                  src={item.photo}
                                  alt={item.title}
                                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold">
                                  Dokumentasi Resmi BPA KM UII
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Sender Information */}
                          <div className="mt-3 pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
                            <span>Petugas: <strong className="text-slate-800">{item.sender}</strong></span>
                            <span className="text-[10px] text-slate-400">{item.senderRole || 'Staf BPA'}</span>
                          </div>

                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      Belum ada catatan log persiapan yang dikirimkan.
                    </div>
                  )}
                </div>

              </div>

              {/* KOLOM KANAN (5/12): RINCIAN ASET & FAST-TRACK ACTIONS */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Kartu Daftar Aset yang Disewa */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-uii-blue-950 font-heading uppercase tracking-wider flex items-center gap-2">
                      <Package className="w-4 h-4 text-uii-blue-900" />
                      <span>Daftar Aset Dipinjam ({currentBooking.items?.length || 0})</span>
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {currentBooking.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center space-x-3"
                      >
                        <img
                          src={item.image || '/images/produk/gedung-scc.png'}
                          alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 flex-shrink-0 bg-white"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-black text-uii-blue-950 truncate font-heading">
                            {item.name}
                          </h4>
                          <span className="text-[11px] text-slate-500 block">
                            Jumlah: <strong>{item.quantity} Unit</strong> • {item.days || 1} Hari
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md inline-block mt-1">
                            {item.itemStatus || 'Unit Siap / Tersedia'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between text-xs">
                    <span className="font-bold text-slate-600">Total Biaya Sewa:</span>
                    <span className="text-base font-black text-uii-blue-950 font-heading">
                      Rp {currentBooking.totalCost?.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Kartu PIC Staf BPA Penanggung Jawab */}
                <div className="bg-gradient-to-br from-uii-blue-950 to-uii-blue-900 text-white rounded-3xl p-6 shadow-xl border border-uii-gold/30 space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-uii-gold block">
                    Penanggung Jawab Aset (PIC BPA)
                  </span>

                  <div className="flex items-center space-x-3.5">
                    <img
                      src={currentBooking.picStaff?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                      alt={currentBooking.picStaff?.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-uii-gold"
                    />
                    <div>
                      <h4 className="text-sm font-black text-white font-heading">
                        {currentBooking.picStaff?.name || 'Fathur Rahman, S.T.'}
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        {currentBooking.picStaff?.role || 'Koordinator Sarpras BPA KM UII'}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Staf PIC siap mendampingi proses gladi resik, serah terima inventaris, serta standby teknis operasional saat acara Anda berlangsung.
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={handleChatStaffPIC}
                      className="w-full py-3 px-4 rounded-xl bg-uii-gold hover:bg-yellow-400 text-uii-blue-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-md"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>Hubungi PIC via WhatsApp</span>
                    </button>
                  </div>
                </div>

                {/* Informasi Pengambilan & Lokasi */}
                <div className="bg-slate-100 rounded-3xl p-5 border border-slate-200 text-xs text-slate-700 space-y-2">
                  <h4 className="font-black text-uii-blue-950 font-heading flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-uii-blue-900" />
                    <span>Ketentuan Serah Terima Aset:</span>
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
                    <li>Harap membawa bukti identitas (KTM / KTP Asli) perwakilan panitia saat serah terima aset.</li>
                    <li>Pelunasan sisa sewa dilakukan sebelum atau saat serah terima barang di Gedung SCC.</li>
                    <li>Pengecekan kelengkapan dilakukan bersama staf BPA KM UII dan dituangkan dalam Berita Acara Serah Terima (BAST).</li>
                  </ul>
                </div>

              </div>

            </div>

          </div>
        ) : (
          /* Empty State Jika Belum Memasukkan Kode */
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-xl mx-auto shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-uii-blue-950 font-heading">
              Masukkan Nomor Registrasi Sewa
            </h3>
            <p className="text-xs text-slate-500">
              Silakan ketik nomor booking yang Anda dapatkan setelah mengajukan sewa (contoh: <strong>BPA-20261102-7492</strong>) pada kolom pencarian di atas.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

