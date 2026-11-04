import React, { useState, useMemo } from 'react';
import { 
  Home, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Package, 
  Send, 
  X,
  Info,
  CalendarCheck,
  ShoppingBag,
  AlertCircle,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { OFFICIAL_PRODUCTS } from '../data/officialProducts';

// Konfigurasi Warna Identitas untuk Setiap Aset (Sesuai Permintaan Pengguna)
export const ASSET_META = {
  'Gedung SCC': {
    name: 'Gedung SCC',
    color: '#2563eb',
    bgClass: 'bg-blue-600',
    lightBgClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
    textClass: 'text-blue-700'
  },
  'Proyektor Epson EB x400': {
    name: 'Proyektor Epson',
    color: '#9333ea',
    bgClass: 'bg-purple-600',
    lightBgClass: 'bg-purple-50',
    borderClass: 'border-purple-200',
    textClass: 'text-purple-700'
  },
  'Handy Talky (HT) Baofeng UV 82': {
    name: 'HT Baofeng UV 82',
    color: '#059669',
    bgClass: 'bg-emerald-600',
    lightBgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200',
    textClass: 'text-emerald-700'
  },
  'HTS Portable Wireless Mic And Speaker P12E': {
    name: 'HTS Speaker P12E',
    color: '#d97706',
    bgClass: 'bg-amber-600',
    lightBgClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
    textClass: 'text-amber-700'
  },
  'Kursi Sapporo': {
    name: 'Kursi Sapporo',
    color: '#0d9488',
    bgClass: 'bg-teal-600',
    lightBgClass: 'bg-teal-50',
    borderClass: 'border-teal-200',
    textClass: 'text-teal-700'
  },
  'Layar Proyektor': {
    name: 'Layar Proyektor',
    color: '#4f46e5',
    bgClass: 'bg-indigo-600',
    lightBgClass: 'bg-indigo-50',
    borderClass: 'border-indigo-200',
    textClass: 'text-indigo-700'
  },
  'Megaphone 2R-2015S': {
    name: 'Megaphone 2R-2015S',
    color: '#ca8a04',
    bgClass: 'bg-yellow-600',
    lightBgClass: 'bg-yellow-50',
    borderClass: 'border-yellow-200',
    textClass: 'text-yellow-700'
  },
  'Mic Wireless TNW': {
    name: 'Mic Wireless TNW',
    color: '#c026d3',
    bgClass: 'bg-fuchsia-600',
    lightBgClass: 'bg-fuchsia-50',
    borderClass: 'border-fuchsia-200',
    textClass: 'text-fuchsia-700'
  },
  'Paket Nasi / Katering': {
    name: 'Katering (Nasi / Snack)',
    color: '#e11d48',
    bgClass: 'bg-rose-600',
    lightBgClass: 'bg-rose-50',
    borderClass: 'border-rose-200',
    textClass: 'text-rose-700'
  },
  'Moment Kita Photobooth': {
    name: 'Moment Kita Photobooth',
    color: '#db2777',
    bgClass: 'bg-pink-600',
    lightBgClass: 'bg-pink-50',
    borderClass: 'border-pink-200',
    textClass: 'text-pink-700'
  }
};

// Dataset Jadwal Pemakaian Terpadu (1 Kalender Terpadu untuk Semua Aset)
const UNIFIED_BOOKED_SCHEDULES = [
  {
    id: 'sch-1',
    date: '2026-11-02',
    assetKey: 'Gedung SCC',
    assetName: 'Gedung SCC',
    agenda: 'Rapat Koordinasi Akbar DPM KM UII',
    organizer: 'DPM KM UII',
    time: '13.00 - 17.00 WIB'
  },
  {
    id: 'sch-2',
    date: '2026-11-05',
    assetKey: 'Handy Talky (HT) Baofeng UV 82',
    assetName: 'Handy Talky (HT) Baofeng UV 82 (10 Unit)',
    agenda: 'Latihan Gabungan Lapangan Mapala Unisi',
    organizer: 'Mapala Unisi',
    time: '08.00 - 16.00 WIB'
  },
  {
    id: 'sch-3',
    date: '2026-11-07',
    assetKey: 'Gedung SCC',
    assetName: 'Gedung SCC',
    agenda: 'Wisuda Periode II Universitas Islam Indonesia',
    organizer: 'Rektorat UII',
    time: '07.00 - 14.30 WIB'
  },
  {
    id: 'sch-4',
    date: '2026-11-07',
    assetKey: 'HTS Portable Wireless Mic And Speaker P12E',
    assetName: 'HTS Portable Wireless Mic And Speaker P12E',
    agenda: 'Wisuda Periode II UII (Audio Cadangan Hall)',
    organizer: 'Biro Logistik BPA',
    time: '07.00 - 14.30 WIB'
  },
  {
    id: 'sch-5',
    date: '2026-11-10',
    assetKey: 'Proyektor Epson EB x400',
    assetName: 'Proyektor Epson EB x400',
    agenda: 'Kuliah Tamu & Workshop Digital Bisnis Mahasiswa',
    organizer: 'Himpunan Mahasiswa Jurusan',
    time: '09.00 - 15.00 WIB'
  },
  {
    id: 'sch-6',
    date: '2026-11-10',
    assetKey: 'Layar Proyektor',
    assetName: 'Layar Proyektor Tripod',
    agenda: 'Workshop Digital Bisnis Mahasiswa',
    organizer: 'Himpunan Mahasiswa Jurusan',
    time: '09.00 - 15.00 WIB'
  },
  {
    id: 'sch-7',
    date: '2026-11-14',
    assetKey: 'Gedung SCC',
    assetName: 'Gedung SCC',
    agenda: 'Seminar Nasional Teknologi Industri FTI UII 2026',
    organizer: 'BEM FTI UII',
    time: '08.00 - 16.30 WIB'
  },
  {
    id: 'sch-8',
    date: '2026-11-14',
    assetKey: 'Paket Nasi / Katering',
    assetName: 'Paket Nasi (250 Box)',
    agenda: 'Konsumsi Peserta Seminar Nasional FTI UII',
    organizer: 'Panitia Semnas FTI',
    time: '11.30 - 13.00 WIB'
  },
  {
    id: 'sch-9',
    date: '2026-11-18',
    assetKey: 'Kursi Sapporo',
    assetName: 'Kursi Sapporo (100 Unit)',
    agenda: 'Festival Musik & Seni Budaya Mahasiswa UII',
    organizer: 'Keluarga Mahasiswa UII',
    time: '13.00 - 22.00 WIB'
  },
  {
    id: 'sch-10',
    date: '2026-11-18',
    assetKey: 'Mic Wireless TNW',
    assetName: 'Mic Wireless TNW',
    agenda: 'Live Podcast & Talkshow Seni Budaya',
    organizer: 'UKM Radio Mahasiswa',
    time: '14.00 - 18.00 WIB'
  },
  {
    id: 'sch-11',
    date: '2026-11-21',
    assetKey: 'Gedung SCC',
    assetName: 'Gedung SCC',
    agenda: 'Musyawarah Besar Lembaga Kemahasiswaan UII',
    organizer: 'LEM UII',
    time: '08.00 - 22.00 WIB'
  },
  {
    id: 'sch-12',
    date: '2026-11-21',
    assetKey: 'Moment Kita Photobooth',
    assetName: 'Moment Kita Photobooth',
    agenda: 'Photobooth Wisuda & Musyawarah Mahasiswa',
    organizer: 'Panitia Dokumentasi',
    time: '09.00 - 17.00 WIB'
  },
  {
    id: 'sch-13',
    date: '2026-11-25',
    assetKey: 'Megaphone 2R-2015S',
    assetName: 'Megaphone 2R-2015S',
    agenda: 'Simulasi Tanggap Bencana & Evakuasi Kampus',
    organizer: 'KSR PMI Unit UII',
    time: '08.00 - 12.00 WIB'
  },
  {
    id: 'sch-14',
    date: '2026-11-28',
    assetKey: 'Handy Talky (HT) Baofeng UV 82',
    assetName: 'Handy Talky (HT) Baofeng UV 82 (8 Unit)',
    agenda: 'Pekan Olahraga Mahasiswa Antar Fakultas',
    organizer: 'Biro Olahraga KM UII',
    time: '07.00 - 18.00 WIB'
  },
  {
    id: 'sch-15',
    date: '2026-11-28',
    assetKey: 'HTS Portable Wireless Mic And Speaker P12E',
    assetName: 'HTS Portable Wireless Mic And Speaker P12E',
    agenda: 'Opening Ceremony Pekan Olahraga Mahasiswa',
    organizer: 'Biro Olahraga KM UII',
    time: '07.30 - 10.00 WIB'
  }
];

export const SewaPage = ({
  onBackHome,
  onNavigateSection,
  onOpenProductDetail,
  cartItems = [],
  onOpenCart,
  onAddToCart,
  activeBooking,
  onOpenApprovalModal,
  onNavigateTracking
}) => {
  // State Kalender (Bulan & Tahun: November 2026)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(10); // 0-indexed: 10 = November
  const [selectedDateStr, setSelectedDateStr] = useState('2026-11-02');

  // State Katalog Produk
  const [selectedProductCategory, setSelectedProductCategory] = useState('Semua');
  const [searchProductQuery, setSearchProductQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Cepat masukkan ke keranjang (Bisa pesan lebih dari satu sekaligus)
  const handleQuickAddToCart = (product) => {
    if (onAddToCart) {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      onAddToCart(product, 1, selectedDateStr || today, tomorrow, 1, 'Pemesanan cepat dari Katalog Sewa');
      setToastMessage(`${product.name} berhasil ditambahkan ke keranjang sewa!`);
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  // Perhitungan Kalender
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  const firstDayOfMonth = useMemo(() => {
    return new Date(currentYear, currentMonth, 1).getDay();
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  // Map Jadwal per Tanggal (YYYY-MM-DD)
  const schedulesByDate = useMemo(() => {
    const map = {};
    for (const item of UNIFIED_BOOKED_SCHEDULES) {
      if (!map[item.date]) {
        map[item.date] = [];
      }
      map[item.date].push(item);
    }
    return map;
  }, []);

  // Detail Jadwal pada Tanggal Terpilih
  const activeDaySchedules = schedulesByDate[selectedDateStr] || [];

  // Filter Produk Sesuai Kategori Screenshot Pengguna (SCC, SAC, KATERING, PHOTOBOOTH)
  const productCategories = ['Semua', 'SCC', 'SAC', 'KATERING', 'PHOTOBOOTH'];

  const filteredProducts = useMemo(() => {
    return OFFICIAL_PRODUCTS.filter(prod => {
      const matchCat = selectedProductCategory === 'Semua' || prod.cat === selectedProductCategory;
      const q = searchProductQuery.toLowerCase().trim();
      const matchQ = !q || 
        prod.name.toLowerCase().includes(q) || 
        prod.cat.toLowerCase().includes(q) ||
        prod.priceText.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [selectedProductCategory, searchProductQuery]);

  // Navigasi ke Halaman Detail Produk & Sewa (Tanpa Modal Overlay)
  const handleSelectProduct = (product) => {
    if (onOpenProductDetail) {
      onOpenProductDetail(product);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 selection:bg-uii-blue-900 selection:text-uii-gold">
      
      {/* Toast Notifikasi Cepat Tambah Keranjang */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-uii-blue-950 text-white px-5 py-3 rounded-2xl shadow-2xl border border-uii-gold/40 flex items-center space-x-3 text-xs sm:text-sm font-bold"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span>{toastMessage}</span>
            {onOpenCart && (
              <button
                onClick={onOpenCart}
                className="ml-2 px-3 py-1 bg-uii-gold text-uii-blue-950 rounded-lg text-xs font-black uppercase hover:bg-yellow-400"
              >
                Lihat Keranjang
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 1. Hero Header Banner */}
      <section className="relative w-full pt-28 sm:pt-36 pb-16 sm:pb-24 bg-uii-blue-950 overflow-hidden text-center text-white select-none">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/produk/gedung-scc.png"
            alt="Penyewaan Fasilitas BPA KM UII"
            className="w-full h-full object-cover object-center filter brightness-40 blur-xs scale-105"
            onError={(e) => { e.target.src = '/images/asset-bpa/scc-uii.webp'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-uii-blue-950/85 to-uii-blue-950" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8">
          {/* Breadcrumb Navigation */}
          <nav className="inline-flex items-center space-x-2 text-xs text-blue-200 mb-6 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/15">
            <button 
              onClick={onBackHome}
              className="hover:text-uii-gold transition-colors flex items-center space-x-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </button>
            <span>/</span>
            <span className="text-uii-gold font-bold">Sewa Aset & Fasilitas</span>
          </nav>

          {/* Title & Tagline */}
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight font-heading uppercase text-white mb-4">
            Layanan Reservasi & Sewa Aset
          </h1>
          <p className="text-sm sm:text-base text-slate-200 max-w-2xl mx-auto font-sans leading-relaxed">
            Periksa kalender jadwal pemakaian seluruh fasilitas & inventaris resmi BPA KM UII secara transparan, lalu ajukan sewa langsung melalui formulir terpadu.
          </p>
        </div>
      </section>

      {/* 2. TOP SECTION: Kalender Jadwal Pemakaian Terpadu (1 Kalender untuk Semua Aset dengan Warna Identitas) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 -mt-10 sm:-mt-14 relative z-20 mb-16">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
          
          {/* Header Kalender (Bersih: Tanpa Tab Filter, Fokus 1 Kalender Terpadu) */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-uii-blue-900 to-uii-blue-950 text-white">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-uii-gold text-xs font-extrabold uppercase tracking-wider mb-2 border border-white/10">
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Kalender Ketersediaan Real-Time</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-heading tracking-wide">
                Jadwal Pemakaian Seluruh Aset Kampus
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                1 Kalender Terpadu: Titik warna pada setiap tanggal menunjukkan aset yang sedang dipakai/dibooking.
              </p>
            </div>

            {/* PANDUAN WARNA IDENTITAS ASET (Legend Warna Terpadu) */}
            <div className="mt-6 pt-5 border-t border-white/15">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-uii-gold block mb-2.5">
                Panduan Warna Aset Terpakai:
              </span>
              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                {Object.entries(ASSET_META).map(([key, meta]) => (
                  <div
                    key={key}
                    className="inline-flex items-center space-x-1.5 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10 text-slate-100"
                  >
                    <span 
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-xs"
                      style={{ backgroundColor: meta.color }}
                    />
                    <span className="text-[11px] font-semibold">{meta.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Grid Kalender & Panel Detail Hari Ini */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            
            {/* Sisi Kiri: Tampilan Grid Bulan (7 Kolom) */}
            <div className="lg:col-span-7 p-6 sm:p-8">
              {/* Navigasi Bulan & Tahun */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-uii-blue-950 font-heading">
                  {monthNames[currentMonth]} {currentYear}
                </h3>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                    title="Bulan Sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                    title="Bulan Berikutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Hari dalam Seminggu */}
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">
                {daysOfWeek.map((day, idx) => (
                  <div key={idx} className={`py-1.5 ${idx === 0 ? 'text-rose-400' : ''}`}>
                    {day}
                  </div>
                ))}
              </div>

              {/* Kotak Tanggal */}
              <div className="grid grid-cols-7 gap-1.5">
                {/* Empty placeholders for offset */}
                {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="h-12 sm:h-14 rounded-xl bg-slate-50/50"></div>
                ))}

                {/* Day Buttons */}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const monthPad = String(currentMonth + 1).padStart(2, '0');
                  const dayPad = String(dayNum).padStart(2, '0');
                  const dateStr = `${currentYear}-${monthPad}-${dayPad}`;
                  
                  const isSelected = selectedDateStr === dateStr;
                  const bookingsOnDate = schedulesByDate[dateStr] || [];
                  const hasBooking = bookingsOnDate.length > 0;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDateStr(dateStr)}
                      className={`h-12 sm:h-14 rounded-xl p-1 flex flex-col items-center justify-between transition-all relative ${
                        isSelected
                          ? 'bg-uii-blue-900 text-white font-extrabold shadow-md ring-2 ring-uii-gold scale-102 z-10'
                          : hasBooking
                          ? 'bg-blue-50/40 border border-slate-200/90 text-slate-800 hover:bg-blue-50/80 hover:border-uii-blue-900'
                          : 'bg-white border border-slate-200/60 text-slate-800 hover:border-uii-blue-900 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`text-xs sm:text-sm font-semibold ${isSelected ? 'text-white' : ''}`}>
                        {dayNum}
                      </span>
                      
                      {/* Titik Warna Aset yang Sedang Dipakai pada Tanggal Ini */}
                      <div className="flex items-center space-x-1 justify-center flex-wrap max-w-full px-0.5">
                        {hasBooking ? (
                          bookingsOnDate.map((b, bIdx) => {
                            const meta = ASSET_META[b.assetKey] || { color: '#2563eb' };
                            return (
                              <span
                                key={bIdx}
                                className="inline-block w-2 h-2 rounded-full shadow-xs flex-shrink-0"
                                style={{ backgroundColor: meta.color }}
                                title={`${meta.name}: ${b.agenda}`}
                              />
                            );
                          })
                        ) : (
                          <span className={`inline-block w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sisi Kanan: Panel Detail Jadwal & Status Pemakaian Aset */}
            <div className="lg:col-span-5 p-6 sm:p-8 bg-slate-50/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Rincian Tanggal Terpilih
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-uii-blue-950 font-heading">
                      {new Date(selectedDateStr).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h4>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    activeDaySchedules.length > 0
                      ? 'bg-blue-100 text-blue-900 border border-blue-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {activeDaySchedules.length > 0 ? `${activeDaySchedules.length} Aset Terpakai` : 'Tersedia Lengkap'}
                  </span>
                </div>

                {/* List Pemakaian pada Hari Terpilih */}
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {activeDaySchedules.length > 0 ? (
                    activeDaySchedules.map((item) => {
                      const meta = ASSET_META[item.assetKey] || {
                        name: item.assetName,
                        color: '#2563eb',
                        lightBgClass: 'bg-blue-50',
                        borderClass: 'border-blue-200',
                        textClass: 'text-blue-700'
                      };

                      return (
                        <div
                          key={item.id}
                          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 border-l-4"
                          style={{ borderLeftColor: meta.color }}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span 
                                className="inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider text-white"
                                style={{ backgroundColor: meta.color }}
                              >
                                {meta.name}
                              </span>
                              <h5 className="font-extrabold text-uii-blue-950 text-sm mt-1">
                                {item.assetName}
                              </h5>
                            </div>
                            <span className="text-xs font-bold text-slate-400 flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{item.time}</span>
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium">
                            <span className="text-slate-400">Acara:</span> {item.agenda}
                          </p>
                          <div className="text-[11px] text-slate-500 flex items-center space-x-1 pt-1 border-t border-slate-100">
                            <span className="text-slate-400">Penyelenggara:</span>
                            <span className="font-semibold text-uii-blue-900">{item.organizer}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-10 bg-white rounded-2xl border border-slate-200/80 p-6 space-y-2">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h5 className="font-extrabold text-uii-blue-950 text-sm">
                        Tidak Ada Pemakaian Aset
                      </h5>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                        Seluruh inventaris (Gedung SCC, Proyektor, HT, Sound, Kursi, Katering, Photobooth) berstatus <strong className="text-emerald-700">Tersedia</strong> untuk disewa pada tanggal ini.
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 3. BOTTOM SECTION: Katalog Produk & Aset Sewa BPA KM UII (Sesuai 5 Screenshot Pengguna) */}
      <section id="katalog-produk-sewa" className="max-w-7xl mx-auto px-4 sm:px-8 scroll-mt-24">
        
        {/* Section Heading & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-uii-blue-900 text-xs font-extrabold uppercase tracking-wider mb-2">
              <Package className="w-3.5 h-3.5 text-uii-gold" />
              <span>Inventaris Resmi BPA KM UII</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-uii-blue-950 font-heading">
              Katalog Produk & Layanan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Daftar fasilitas gedung SCC, peralatan event SAC, paket katering, dan photobooth resmi.
            </p>
          </div>

          {/* Search Bar Produk */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchProductQuery}
              onChange={(e) => setSearchProductQuery(e.target.value)}
              placeholder="Cari gedung, proyektor, HT, kursi, nasi..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-uii-blue-900/30 focus:border-uii-blue-900 transition-all shadow-xs"
            />
            {searchProductQuery && (
              <button
                onClick={() => setSearchProductQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills Kategori Produk Resmi (SCC, SAC, KATERING, PHOTOBOOTH) */}
        <div className="flex flex-wrap items-center gap-2 mb-10">
          {productCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedProductCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedProductCategory === cat
                  ? 'bg-uii-blue-900 text-uii-gold shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-uii-blue-900 hover:text-uii-blue-900'
              }`}
            >
              {cat === 'Semua' ? 'Semua Produk' : cat}
            </button>
          ))}
        </div>

        {/* Grid Produk Sewa Resmi (Desain Sesuai Screenshot bpakm.uii.ac.id/produk-kami/) */}
        {filteredProducts.length > 0 ? (
          selectedProductCategory === 'Semua' && !searchProductQuery ? (
            <div className="space-y-14">
              {['SCC', 'SAC', 'KATERING', 'PHOTOBOOTH'].map((categoryName) => {
                const items = filteredProducts.filter(p => p.cat === categoryName);
                if (items.length === 0) return null;
                return (
                  <div key={categoryName} className="space-y-6">
                    <h2 className="text-2xl sm:text-3xl font-black font-heading text-[#192a3d]">
                      {categoryName}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                      {items.map((prod) => (
                        <div
                          key={prod.id}
                          className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                        >
                          <div>
                            {/* Gambar Produk: Ukuran Terkunci Rapi Sesuai Screenshot */}
                            <div className="relative w-full h-64 sm:h-72 bg-slate-50 overflow-hidden flex-shrink-0 p-4 flex items-center justify-center">
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="w-full h-full object-contain rounded-2xl group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => { e.target.src = '/images/asset-bpa/scc-uii.webp'; }}
                              />
                              
                              {/* Badge Kategori */}
                              <div className="absolute top-4 left-4 z-10">
                                <span className="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-uii-blue-950/90 text-uii-gold backdrop-blur-md border border-white/10 shadow-xs">
                                  {prod.cat}
                                </span>
                              </div>
                            </div>

                            {/* Judul & Harga (Persis Sesuai Screenshot bpakm.uii.ac.id/produk-kami/) */}
                            <div className="p-6 pt-3 space-y-2">
                              <h3 className="font-extrabold text-[#192a3d] text-xl leading-snug font-heading group-hover:text-uii-blue-900 transition-colors">
                                {prod.name}
                              </h3>
                              <p className="text-sm text-slate-600 font-semibold">
                                {prod.priceText}
                              </p>
                            </div>
                          </div>

                          {/* Tombol Aksi: + Keranjang & Sewa */}
                          <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickAddToCart(prod);
                              }}
                              className="py-2.5 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-uii-blue-950 font-extrabold text-[11px] sm:text-xs uppercase tracking-wider transition-all border border-slate-300 hover:border-uii-blue-900 flex items-center justify-center space-x-1 group/cart shadow-2xs"
                              title="Masukkan ke keranjang sewa"
                            >
                              <ShoppingBag className="w-3.5 h-3.5 text-uii-blue-900 group-hover/cart:scale-110 transition-transform" />
                              <span>+ Keranjang</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectProduct(prod);
                              }}
                              className="py-2.5 px-3 rounded-xl bg-uii-blue-900 hover:bg-uii-blue-950 text-white font-extrabold text-[11px] sm:text-xs uppercase tracking-wider transition-all shadow-sm hover:shadow-md flex items-center justify-center space-x-1 group/btn"
                              title="Lihat foto detail & sewa"
                            >
                              <Package className="w-3.5 h-3.5 text-uii-gold group-hover/btn:scale-110 transition-transform" />
                              <span>Sewa</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer"
                  onClick={() => handleSelectProduct(prod)}
                >
                  <div>
                    {/* Gambar Produk: Ukuran Terkunci Rapi Sesuai Screenshot */}
                    <div className="relative w-full h-64 sm:h-72 bg-slate-50 overflow-hidden flex-shrink-0 p-4 flex items-center justify-center">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-contain rounded-2xl group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.src = '/images/asset-bpa/scc-uii.webp'; }}
                      />
                      
                      {/* Badge Kategori */}
                      <div className="absolute top-4 left-4 z-10">
                        <span className="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-uii-blue-950/90 text-uii-gold backdrop-blur-md border border-white/10 shadow-xs">
                          {prod.cat}
                        </span>
                      </div>
                    </div>

                    {/* Judul & Harga (Persis Sesuai Screenshot bpakm.uii.ac.id/produk-kami/) */}
                    <div className="p-6 pt-3 space-y-2">
                      <h3 className="font-extrabold text-[#192a3d] text-xl leading-snug font-heading group-hover:text-uii-blue-900 transition-colors">
                        {prod.name}
                      </h3>
                      <p className="text-sm text-slate-600 font-semibold">
                        {prod.priceText}
                      </p>
                    </div>
                  </div>

                  {/* Tombol Aksi: + Keranjang & Sewa */}
                  <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickAddToCart(prod);
                      }}
                      className="py-2.5 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-uii-blue-950 font-extrabold text-[11px] sm:text-xs uppercase tracking-wider transition-all border border-slate-300 hover:border-uii-blue-900 flex items-center justify-center space-x-1 group/cart shadow-2xs"
                      title="Masukkan ke keranjang sewa"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-uii-blue-900 group-hover/cart:scale-110 transition-transform" />
                      <span>+ Keranjang</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectProduct(prod);
                      }}
                      className="py-2.5 px-3 rounded-xl bg-uii-blue-900 hover:bg-uii-blue-950 text-white font-extrabold text-[11px] sm:text-xs uppercase tracking-wider transition-all shadow-sm hover:shadow-md flex items-center justify-center space-x-1 group/btn"
                      title="Lihat foto detail & sewa"
                    >
                      <Package className="w-3.5 h-3.5 text-uii-gold group-hover/btn:scale-110 transition-transform" />
                      <span>Sewa</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-700">Produk Tidak Ditemukan</h4>
            <p className="text-xs text-slate-400 mt-1">Silakan coba gunakan kata kunci pencarian lain.</p>
          </div>
        )}

      </section>

    </div>
  );
};

export default SewaPage;
