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
  Sliders,
  Image as ImageIcon,
  MessageSquare,
  RefreshCw,
  PlusCircle,
  XCircle,
  X,
  ExternalLink,
  Info
} from 'lucide-react';
import {
  getAllMergedTrackingBookings,
  saveStoredTrackingBookings,
  formatWhatsAppNumber
} from '../data/trackingData';
import { neonApi } from '../services/neonDb';

const findBookingByCode = (list, rawCode) => {
  if (!Array.isArray(list)) return null;
  const raw = String(rawCode || '').trim();
  if (!raw) return null;

  // 1. Exact match (case insensitive & hapus tanda #)
  const clean = raw.replace(/^#/, '').trim().toLowerCase();
  const exact = list.find((b) => String(b.bookingCode || '').trim().toLowerCase() === clean);
  if (exact) return exact;

  // 2. Prefix 'bpa-' match (jika user ketik '01' atau '157')
  const withPrefix = list.find((b) => String(b.bookingCode || '').trim().toLowerCase() === `bpa-${clean}`);
  if (withPrefix) return withPrefix;

  // 3. Numeric match: mendukung ketikan angka seperti '1', '01', 'bpa-1', '#1'
  const numericPart = clean.replace(/^bpa-/i, '').trim();
  const numInput = parseInt(numericPart, 10);
  if (!isNaN(numInput)) {
    const numericMatch = list.find((b) => {
      const bCode = String(b.bookingCode || '').trim().toLowerCase();
      const bNumeric = parseInt(bCode.replace(/^bpa-/i, '').trim(), 10);
      return !isNaN(bNumeric) && bNumeric === numInput;
    });
    if (numericMatch) return numericMatch;
  }

  return null;
};

const isBookingCompleted = (b) => {
  if (!b) return false;
  const s = String(b.status || '').toUpperCase();
  const pct = Number(b.progressPercent ?? 0);
  return s === 'SELESAI' || pct >= 100;
};

const isBookingOwnedByUser = (b, user) => {
  if (!b || !user) return false;
  const userEmail = String(user.email || '').toLowerCase().trim();
  const userName = String(user.name || '').toLowerCase().trim();
  const custEmail = String(b.customer?.email || b.userEmail || '').toLowerCase().trim();
  const custName = String(b.customer?.name || b.userName || '').toLowerCase().trim();

  if (userEmail && custEmail) {
    return userEmail === custEmail;
  }
  if (userName && custName) {
    return userName === custName;
  }
  return false;
};

export const TrackingPage = ({
  currentUser = null,
  onRequireAuth,
  onBackHome,
  onNavigateSewa,
  initialBookingCode = '',
  resetKey = 0
}) => {
  // Database Booking Tracking (Gabungan Tracking & Admin Storage)
  const [allBookings, setAllBookings] = useState(() => getAllMergedTrackingBookings());
  
  // Kode Booking yang sedang dicari/dilihat (Kosong untuk user agar mengisi sendiri)
  const [searchCode, setSearchCode] = useState(() => initialBookingCode || '');
  const [accessNotice, setAccessNotice] = useState(null);

  const validateTrackingAccess = (found, rawQuery = '') => {
    if (!found) {
      return {
        ok: false,
        reason: 'not_found',
        message: `ID "${rawQuery}" tidak ditemukan. Silakan periksa kembali kode sewa Anda.`
      };
    }
    if (!currentUser) {
      return {
        ok: false,
        reason: 'auth_required',
        message: 'Silakan login menggunakan akun pemesan terlebih dahulu untuk melacak kode sewa ini.'
      };
    }
    if (!isBookingOwnedByUser(found, currentUser)) {
      return {
        ok: false,
        reason: 'forbidden',
        message: 'Akses ditolak: Kode sewa ini hanya dapat dilacak oleh akun pemesan yang memiliki tiket pembelian.'
      };
    }
    if (isBookingCompleted(found)) {
      return {
        ok: false,
        reason: 'completed',
        message: `Pesanan #${found.bookingCode} telah selesai (100%) dan tidak lagi ditampilkan di pelacakan aktif.`
      };
    }
    return { ok: true, booking: found };
  };

  // Booking yang saat ini aktif ditampilkan (Null jika user belum memasukkan kode / tidak lolos validasi)
  const [currentBooking, setCurrentBooking] = useState(() => {
    if (!initialBookingCode) return null;
    const list = getAllMergedTrackingBookings();
    const found = findBookingByCode(list, initialBookingCode);
    if (!found || !currentUser || !isBookingOwnedByUser(found, currentUser) || isBookingCompleted(found)) {
      return null;
    }
    return found;
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

  // Sinkronisasi data terbaru dari Neon PostgreSQL di latar belakang
  useEffect(() => {
    let mounted = true;
    neonApi.getBookings().then((remote) => {
      if (!mounted || !Array.isArray(remote)) return;
      const merged = getAllMergedTrackingBookings(remote);
      setAllBookings(merged);
      setCurrentBooking((prev) => {
        if (!prev?.bookingCode) return prev;
        const refreshed = findBookingByCode(merged, prev.bookingCode);
        if (!refreshed || !isBookingOwnedByUser(refreshed, currentUser) || isBookingCompleted(refreshed)) {
          if (refreshed && isBookingCompleted(refreshed)) {
            setAccessNotice({
              reason: 'completed',
              message: `Pesanan #${refreshed.bookingCode} telah selesai (100%) dan tidak lagi ditampilkan di pelacakan aktif.`
            });
          }
          return null;
        }
        return refreshed;
      });
    }).catch(() => {});
    return () => {
      mounted = false;
    };
  }, [currentUser]);

  // Sinkronisasi otomatis real-time saat staf mengunggah pembaruan progres & foto
  useEffect(() => {
    const handleSync = () => {
      const list = getAllMergedTrackingBookings();
      setAllBookings(list);
      setCurrentBooking((prev) => {
        if (!prev?.bookingCode) return prev;
        const refreshed = findBookingByCode(list, prev.bookingCode);
        if (!refreshed || !isBookingOwnedByUser(refreshed, currentUser) || isBookingCompleted(refreshed)) {
          if (refreshed && isBookingCompleted(refreshed)) {
            setAccessNotice({
              reason: 'completed',
              message: `Pesanan #${refreshed.bookingCode} telah selesai (100%) dan tidak lagi ditampilkan di pelacakan aktif.`
            });
          }
          return null;
        }
        return refreshed;
      });
    };

    window.addEventListener('bpa-data-updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('bpa-data-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [currentUser]);

  // Reset / Sinkronisasi jika navigasi ke Lacak membawa kode baru atau resetKey berubah atau user berubah
  useEffect(() => {
    if (initialBookingCode) {
      const list = getAllMergedTrackingBookings();
      setAllBookings(list);
      setSearchCode(initialBookingCode);
      const found = findBookingByCode(list, initialBookingCode);
      const check = validateTrackingAccess(found, initialBookingCode);
      if (check.ok) {
        setCurrentBooking(check.booking);
        setAccessNotice(null);
      } else {
        setCurrentBooking(null);
        setAccessNotice({ reason: check.reason, message: check.message });
      }
    } else {
      setSearchCode('');
      setCurrentBooking(null);
      setAccessNotice(null);
    }
  }, [initialBookingCode, resetKey, currentUser]);

  // Sinkronisasi saat currentBooking berubah
  useEffect(() => {
    if (currentBooking) {
      setStaffFormPercent(currentBooking.progressPercent || 0);
      setStaffFormStatus(currentBooking.status || 'MENUNGGU PERSETUJUAN');
      setStaffFormStage(currentBooking.progressStage || '');
    }
  }, [currentBooking]);

  const handleSearch = async (e) => {
    e?.preventDefault();
    const cleanInput = searchCode.trim().replace(/^#/, '');
    if (!cleanInput) {
      setCurrentBooking(null);
      showToast('Silakan masukkan ID sewa Anda terlebih dahulu.', 'error');
      return;
    }

    let latestList = getAllMergedTrackingBookings();
    let found = findBookingByCode(latestList, cleanInput);

    if (!found) {
      const remote = await neonApi.getBookings().catch(() => null);
      if (Array.isArray(remote)) {
        latestList = getAllMergedTrackingBookings(remote);
        setAllBookings(latestList);
        found = findBookingByCode(latestList, cleanInput);
      }
    }

    const check = validateTrackingAccess(found, searchCode.trim());
    if (check.ok) {
      setCurrentBooking(check.booking);
      setAccessNotice(null);
      showToast(`Data sewa #${check.booking.bookingCode} berhasil ditemukan!`);
    } else {
      setCurrentBooking(null);
      setAccessNotice({ reason: check.reason, message: check.message });
      showToast(check.message, 'error');
    }
  };

  const handleClearSearch = () => {
    setSearchCode('');
    setCurrentBooking(null);
    setAccessNotice(null);
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
    neonApi.saveBooking(updatedBooking).catch(() => {});

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

  // Helper User Menghubungi WhatsApp PIC Staf Penanggung Jawab
  const handleChatStaffPIC = () => {
    if (!currentBooking) return;
    const rawPhone = currentBooking.picStaff?.phone || '6285233475595';
    const staffPhone = formatWhatsAppNumber(rawPhone);
    const staffName = currentBooking.picStaff?.name || 'Staf BPA KM UII';
    let msg = `Halo ${staffName}, saya ${currentBooking.customer?.name || 'Pemesan'} pemesan sewa aset dengan Kode: *#${currentBooking.bookingCode}*.\n\n`;
    msg += `Saya melihat progres persiapan di website BPA saat ini sudah *${effectiveProgressPercent}%* (${currentBooking.status}). Ingin menanyakan koordinasi teknis terkait persiapan acara kami pada ${currentBooking.eventDate}. Terima kasih!`;

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

  // Persentase kesiapan: jika masih tahap Pengajuan (MENUNGGU PERSETUJUAN), progres penyiapan adalah 0%
  const isPendingApproval = (currentBooking?.status || '').toUpperCase() === 'MENUNGGU PERSETUJUAN';
  const effectiveProgressPercent = isPendingApproval
    ? 0
    : Math.max(0, Math.min(100, Number(currentBooking?.progressPercent ?? 0)));

  // Petakan persentase ke posisi visual 6 kolom tahapan agar bar tepat berada di tahap aktif (tidak melebihi label tahap)
  const getStageAlignedBarWidth = (pct) => {
    if (pct <= 0) return 0;
    if (pct >= 100) return 100;
    if (pct < 25) return (pct / 25) * 16.67;
    if (pct < 50) return 25 + ((pct - 25) / 25) * (33.33 - 25);
    if (pct < 75) return 41.67 + ((pct - 50) / 25) * (50 - 41.67);
    if (pct < 90) return 58.33 + ((pct - 75) / 15) * (66.67 - 58.33);
    return 75 + ((pct - 90) / 10) * (83.33 - 75);
  };
  const stageAlignedBarWidth = getStageAlignedBarWidth(effectiveProgressPercent);

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
                  placeholder="Masukkan ID Sewa Anda (Contoh: BPA-01)"
                  className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white text-slate-900 text-xs sm:text-sm font-bold placeholder-slate-400 border border-transparent focus:outline-none focus:ring-2 focus:ring-uii-gold shadow-lg"
                />
                {searchCode && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    title="Bersihkan Pencarian"
                    aria-label="Bersihkan Pencarian"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
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
                  {currentBooking.progressDescription && (
                    <p className="text-xs text-slate-600 mt-2 p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 font-medium leading-relaxed">
                      <strong className="text-uii-blue-950">Catatan Progres Staf:</strong> {currentBooking.progressDescription}
                    </p>
                  )}
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
                        {effectiveProgressPercent}%
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
                      {effectiveProgressPercent >= 100
                        ? 'Semua Aset 100% Siap'
                        : effectiveProgressPercent >= 75
                        ? 'Tahap Akhir / Final Setup'
                        : effectiveProgressPercent >= 50
                        ? 'Pengujian Teknis Sedang Berjalan'
                        : effectiveProgressPercent >= 25
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
                    <span className="text-uii-blue-950 font-black">{effectiveProgressPercent}% dari 100%</span>
                  </div>

                  {/* Horizontal Bar (Satu Warna Solid Rapi Sesuai Permintaan Pengguna) */}
                  <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stageAlignedBarWidth}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full transition-all ${
                        effectiveProgressPercent === 100
                          ? 'bg-emerald-600'
                          : 'bg-uii-blue-900'
                      }`}
                    />
                  </div>

                  {/* Tahapan Milestone: Ditandai secara dinamis sesuai progres aktif */}
                  <div className="grid grid-cols-6 gap-1 items-start text-center text-[10px] sm:text-[11px] pt-1 select-none leading-tight">
                    <span className={effectiveProgressPercent < 25 ? 'font-black text-uii-blue-950 underline decoration-uii-gold decoration-2 underline-offset-4' : 'font-bold text-emerald-700'}>
                      {effectiveProgressPercent >= 25 ? '✓ 1. Pengajuan' : '1. Pengajuan'}
                    </span>
                    <span className={effectiveProgressPercent >= 25 && effectiveProgressPercent < 50 ? 'font-black text-uii-blue-950 underline decoration-uii-gold decoration-2 underline-offset-4' : effectiveProgressPercent >= 50 ? 'font-bold text-emerald-700' : 'text-slate-400'}>
                      {effectiveProgressPercent >= 50 ? '✓ 2. Approval' : '2. Approval'}
                    </span>
                    <span className={effectiveProgressPercent >= 50 && effectiveProgressPercent < 75 ? 'font-black text-uii-blue-950 underline decoration-uii-gold decoration-2 underline-offset-4' : effectiveProgressPercent >= 75 ? 'font-bold text-emerald-700' : 'text-slate-400'}>
                      {effectiveProgressPercent >= 75 ? '✓ 3. DP' : '3. DP'}
                    </span>
                    <span className={effectiveProgressPercent >= 75 && effectiveProgressPercent < 90 ? 'font-black text-uii-blue-950 underline decoration-uii-gold decoration-2 underline-offset-4' : effectiveProgressPercent >= 90 ? 'font-bold text-emerald-700' : 'text-slate-400'}>
                      {effectiveProgressPercent >= 90 ? '✓ 4. Cek Fisik' : '4. Cek Fisik'}
                    </span>
                    <span className={effectiveProgressPercent >= 90 && effectiveProgressPercent < 100 ? 'font-black text-uii-blue-950 underline decoration-uii-gold decoration-2 underline-offset-4' : effectiveProgressPercent >= 100 ? 'font-bold text-emerald-700' : 'text-slate-400'}>
                      {effectiveProgressPercent >= 100 ? '✓ 5. Setting' : '5. Setting'}
                    </span>
                    <span className={effectiveProgressPercent >= 100 ? 'font-black text-emerald-600' : 'text-slate-400'}>
                      6. Ready
                    </span>
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
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-uii-gold block">
                      Penanggung Jawab Aset (PIC BPA)
                    </span>
                    {currentBooking.picStaff?.name && (
                      <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        <span>PIC Terverifikasi</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3.5">
                    <img
                      src={
                        currentBooking.picStaff?.avatar ||
                        currentBooking.picStaff?.picture ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                      }
                      alt={currentBooking.picStaff?.name || 'Staf PIC BPA'}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-uii-gold bg-slate-800 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-black text-white font-heading truncate">
                        {currentBooking.picStaff?.name || 'Fathur Rahman, S.T.'}
                      </h4>
                      <p className="text-[11px] text-slate-300 truncate">
                        {currentBooking.picStaff?.role || 'Koordinator Sarpras BPA KM UII'}
                      </p>
                      {currentBooking.picStaff?.phone && (
                        <p className="text-[10px] text-uii-gold font-bold mt-0.5 flex items-center gap-1">
                          <span>WhatsApp:</span>
                          <span className="underline decoration-uii-gold/60">{currentBooking.picStaff.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Staf PIC siap mendampingi proses gladi resik, serah terima inventaris, serta standby teknis operasional saat acara Anda berlangsung.
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={handleChatStaffPIC}
                      className="w-full py-3 px-4 rounded-xl bg-uii-gold hover:bg-yellow-400 text-uii-blue-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer"
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
        ) : accessNotice ? (
          /* Pesan Status / Validasi Akses Pelacakan */
          <div className="bg-white rounded-3xl p-10 sm:p-12 text-center border border-slate-200 max-w-xl mx-auto shadow-sm space-y-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
                accessNotice.reason === 'completed'
                  ? 'bg-emerald-50 text-emerald-600'
                  : accessNotice.reason === 'forbidden' || accessNotice.reason === 'not_found'
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-amber-50 text-amber-600'
              }`}
            >
              {accessNotice.reason === 'completed' ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : (
                <AlertCircle className="w-8 h-8" />
              )}
            </div>
            <h3 className="text-lg font-black text-uii-blue-950 font-heading">
              {accessNotice.reason === 'completed'
                ? 'Pesanan Sudah Selesai'
                : accessNotice.reason === 'forbidden'
                ? 'Akses Pelacakan Ditolak'
                : accessNotice.reason === 'auth_required'
                ? 'Login Akun Pemesan Diperlukan'
                : 'ID Sewa Tidak Ditemukan'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {accessNotice.message}
            </p>
            {accessNotice.reason === 'auth_required' && onRequireAuth && (
              <button
                type="button"
                onClick={onRequireAuth}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-uii-blue-950 hover:bg-uii-blue-900 text-uii-gold font-black text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                <User className="w-4 h-4" />
                <span>Login Akun Pemesan</span>
              </button>
            )}
          </div>
        ) : (
          /* Empty State Jika Belum Memasukkan Kode */
          <div className="bg-white rounded-3xl p-10 sm:p-12 text-center border border-slate-200 max-w-xl mx-auto shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-uii-blue-950 font-heading">
              Masukkan ID Sewa Anda
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Silakan ketik ID singkat yang Anda dapatkan setelah mengajukan sewa (contoh: <strong className="text-uii-blue-950 font-mono">BPA-01</strong>) pada kolom pencarian di atas untuk memantau masing-masing pesanan Anda.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

