import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Calendar,
  Clock,
  CheckCircle2,
  Package,
  ShoppingBag,
  Send,
  Star,
  ShieldCheck,
  MapPin,
  Share2,
  Info,
  Sparkles,
  PhoneCall,
  Plus,
  Minus,
  Check,
  Layers,
  ArrowRight,
  Lock,
  LogIn,
  UserPlus,
  AlertCircle
} from 'lucide-react';
import { OFFICIAL_PRODUCTS, getProductById } from '../data/officialProducts';

export const ProductDetailPage = ({
  product: initialProduct,
  onBack,
  onNavigateProduct,
  onAddToCart,
  onOpenCart,
  onSubmitBooking,
  currentUser,
  onRequireAuth,
  onNavigateAuth
}) => {
  // Pastikan kita memiliki objek produk lengkap dari data resmi
  const product = useMemo(() => {
    if (!initialProduct) return OFFICIAL_PRODUCTS[0];
    const full = getProductById(initialProduct.slug || initialProduct.id);
    return full || initialProduct;
  }, [initialProduct]);

  // State galeri foto (foto aktif)
  const images = useMemo(() => {
    if (product.images && product.images.length > 0) return product.images;
    return [product.image || '/images/asset-bpa/scc-uii.webp'];
  }, [product]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // State konfigurasi sewa langsung / keranjang
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }, []);

  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(tomorrowStr);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState('deskripsi'); // 'deskripsi' | 'spesifikasi' | 'prosedur'
  const [addedToast, setAddedToast] = useState(false);

  // Hitung durasi hari
  const rentalDays = useMemo(() => {
    try {
      const s = new Date(startDate);
      const e = new Date(endDate);
      const diffTime = e - s;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(1, diffDays > 0 ? diffDays : 1);
    } catch {
      return 1;
    }
  }, [startDate, endDate]);

  // Hitung total estimasi biaya
  const estimatedCost = useMemo(() => {
    const base = product.priceValue || 0;
    return base * quantity * rentalDays;
  }, [product, quantity, rentalDays]);

  // Aksi Masuk Keranjang
  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product, quantity, startDate, endDate, rentalDays, notes);
    }
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  // Aksi Langsung Sewa (WhatsApp Checkout Instan dengan Notifikasi Approval)
  const handleDirectRent = () => {
    // Intersepsi Autentikasi Pengguna: Jika belum login, tampilkan modal notifikasi wajib login
    if (!currentUser) {
      if (onRequireAuth) {
        onRequireAuth(`sewa langsung untuk aset "${product.name}"`);
      }
      return;
    }

    const bookingCode = `BPA-REV-${Date.now().toString().slice(-6)}`;
    const newBooking = {
      bookingCode,
      createdAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB',
      status: 'MENUNGGU PERSETUJUAN',
      items: [
        {
          id: product.id,
          name: product.name,
          cat: product.cat,
          priceText: product.priceText,
          priceValue: product.priceValue,
          quantity,
          startDate,
          endDate,
          days: rentalDays
        }
      ],
      customer: {
        name: currentUser.name || 'Pemesan Langsung (Web BPA)',
        org: currentUser.org || 'Pribadi / Lembaga Mahasiswa',
        phone: currentUser.phone || 'WhatsApp User',
        notes: notes.trim()
      },
      totalCost: estimatedCost
    };

    if (onSubmitBooking) {
      onSubmitBooking(newBooking);
    }
  };

  // Produk Terkait / Rekomendasi
  const relatedProducts = useMemo(() => {
    return OFFICIAL_PRODUCTS.filter(p => p.id !== product.id).slice(0, 3);
  }, [product]);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-24 sm:pt-28">
      {/* Toast Notifikasi Berhasil Tambah ke Keranjang */}
      <AnimatePresence>
        {addedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-uii-blue-950 text-white px-5 py-3 rounded-2xl shadow-2xl border border-uii-gold/40 flex items-center space-x-3 text-xs sm:text-sm font-bold"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <span>Berhasil dimasukkan ke keranjang sewa!</span>
            </div>
            <button
              onClick={() => {
                setAddedToast(false);
                if (onOpenCart) onOpenCart();
              }}
              className="ml-3 px-3 py-1 bg-uii-gold text-uii-blue-950 rounded-lg text-xs font-black uppercase hover:bg-yellow-400 transition-colors"
            >
              Lihat Keranjang
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Breadcrumb & Tombol Kembali */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-bold text-uii-blue-950 hover:bg-uii-blue-900 hover:text-white transition-all shadow-xs group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Katalog Sewa</span>
          </button>

          {/* Breadcrumb path */}
          <nav className="text-xs text-slate-500 flex items-center space-x-1.5 overflow-hidden">
            <span className="hover:text-uii-blue-900 cursor-pointer" onClick={onBack}>Katalog Sewa</span>
            <span>/</span>
            <span className="font-bold text-uii-blue-900 uppercase">{product.cat}</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
          </nav>
        </div>

        {/* ========================================================
            BAGIAN 1: GRID UTAMA (GALERI BANYAK FOTO + SIDEBAR SEWA)
           ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* KOLOM KIRI: GALERI MULTI-FOTO (6 Kolom Desktop) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Foto Utama Besar */}
            <div className="relative w-full h-[360px] sm:h-[480px] bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-6 flex items-center justify-center group">
              <img
                src={images[activeImageIndex]}
                alt={`${product.name} detail view ${activeImageIndex + 1}`}
                className="w-full h-full object-contain rounded-2xl transition-all duration-500 group-hover:scale-105"
                onError={(e) => { e.target.src = '/images/asset-bpa/scc-uii.webp'; }}
              />

              {/* Badges di atas foto */}
              <div className="absolute top-5 left-5 flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-uii-blue-950 text-uii-gold shadow-md border border-white/10">
                  {product.cat}
                </span>
                <span className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-emerald-500/90 text-white backdrop-blur-md shadow-md flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Unit Ready
                </span>
              </div>

              {/* Indikator Foto X dari Y */}
              <div className="absolute bottom-5 right-5 px-3 py-1 rounded-xl bg-uii-blue-950/80 backdrop-blur-md text-white text-[11px] font-bold">
                Foto {activeImageIndex + 1} / {images.length}
              </div>
            </div>

            {/* Strip Thumbnail Banyak Foto (Thumbnails Carousel / Strip) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span className="font-bold flex items-center gap-1.5 text-slate-700">
                  <Layers className="w-3.5 h-3.5 text-uii-blue-900" />
                  Galeri Foto Lengkap ({images.length} Sudut / Detail):
                </span>
                <span className="text-[11px] text-slate-400">Klik untuk melihat detail</span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative h-20 sm:h-24 rounded-2xl bg-white border-2 overflow-hidden p-1.5 transition-all duration-200 flex items-center justify-center ${
                      activeImageIndex === idx
                        ? 'border-uii-blue-900 ring-2 ring-uii-blue-900/30 shadow-md scale-102'
                        : 'border-slate-200 hover:border-slate-400 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-contain rounded-xl"
                      onError={(e) => { e.target.src = '/images/asset-bpa/scc-uii.webp'; }}
                    />
                    {activeImageIndex === idx && (
                      <div className="absolute inset-0 bg-uii-blue-900/10 pointer-events-none rounded-xl" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Guarantees & Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 flex items-center space-x-3 text-xs shadow-2xs">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold text-slate-700">Kondisi Prima & Terawat</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 flex items-center space-x-3 text-xs shadow-2xs">
                <Sparkles className="w-5 h-5 text-uii-gold flex-shrink-0" />
                <span className="font-semibold text-slate-700">Resmi Milik KM UII</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 flex items-center space-x-3 text-xs shadow-2xs">
                <MapPin className="w-5 h-5 text-uii-blue-900 flex-shrink-0" />
                <span className="font-semibold text-slate-700">Ambil di Gedung SCC</span>
              </div>
            </div>

          </div>

          {/* KOLOM KANAN: JUDUL, HARGA, DESKRIPSI SINGKAT & FORM SEWA / KERANJANG (5 Kolom Desktop) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-6">
              
              {/* Judul & Rating */}
              <div className="space-y-2 border-b border-slate-100 pb-5">
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-uii-blue-900 text-uii-gold">
                    {product.cat}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {product.categoryLabel}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black font-heading text-uii-blue-950 leading-tight">
                  {product.name}
                </h1>

                {product.tagline && (
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {product.tagline}
                  </p>
                )}

                {/* Rating Bintang & Review Count */}
                <div className="flex items-center space-x-2 pt-1 text-xs">
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="font-extrabold text-slate-800">{product.rating || 4.9}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500 underline font-medium">
                    {product.reviewsCount || 38} Ulasan Penyewa
                  </span>
                </div>
              </div>

              {/* Box Harga Sewa Resmi */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-uii-blue-950 to-uii-blue-900 text-white flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[11px] font-semibold text-uii-gold uppercase tracking-wider block">
                    Tarif Sewa Resmi
                  </span>
                  <span className="text-2xl sm:text-3xl font-black font-heading text-white">
                    {product.priceText}
                  </span>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/10 text-slate-200">
                    Khusus KM UII & Umum
                  </span>
                </div>
              </div>

              {/* Form Input Sewa (Tanggal & Kuantitas) */}
              <div className="space-y-4 pt-1">
                
                {/* Pilihan Tanggal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-uii-blue-900" />
                      Tanggal Mulai
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      min={todayStr}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-uii-blue-900/30 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-uii-blue-900" />
                      Tanggal Selesai
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-uii-blue-900/30 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Kuantitas / Jumlah Unit */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Jumlah Kuantitas</span>
                    <span className="text-[11px] text-slate-500">Durasi sewa: {rentalDays} hari</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-black text-sm text-uii-blue-950 font-heading">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Catatan Kebutuhan Acara */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Catatan Acara / Kepanitiaan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Untuk Seminar Nasional DPM di Hall SCC"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-uii-blue-900/30 focus:bg-white"
                  />
                </div>

                {/* Total Estimasi Perhitungan */}
                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-baseline justify-between">
                  <span className="text-xs text-amber-900 font-bold">Subtotal Estimasi:</span>
                  <span className="text-base sm:text-lg font-black text-amber-900 font-heading">
                    Rp {estimatedCost.toLocaleString('id-ID')}
                  </span>
                </div>

                {/* DUA TOMBOL AKSI UTAMA:
                    1. LANGSUNG SEWA (Jika belum login, benar-benar DIBLOKIR dan muncul ALERT OVERLAY)
                    2. MASUKIN KERANJANG */}
                <div className="space-y-2.5 pt-2">
                  
                  {/* Tombol 1: Langsung Sewa (In-App Booking Langsung Tanpa WhatsApp) */}
                  <button
                    onClick={handleDirectRent}
                    className="w-full py-3.5 px-4 rounded-2xl bg-uii-blue-900 hover:bg-uii-blue-950 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 group"
                  >
                    <Send className="w-4 h-4 text-uii-gold group-hover:scale-110 transition-transform" />
                    <span>Langsung Sewa</span>
                  </button>

                  {/* Tombol 2: Masukin Keranjang */}
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 text-uii-blue-950 border-2 border-uii-blue-900/80 font-extrabold text-xs uppercase tracking-wider transition-all shadow-xs hover:shadow-sm flex items-center justify-center space-x-2 group"
                  >
                    <ShoppingBag className="w-4 h-4 text-uii-blue-900 group-hover:scale-110 transition-transform" />
                    <span>Masukin Keranjang</span>
                  </button>

                </div>

                {/* Help text */}
                <div className="pt-2 text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                  <span>Konsultasi Cepat: Hotline Resmi (+62 852-3347-5595)</span>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ========================================================
            BAGIAN 2: TABBED CONTENT (DESKRIPSI, SPESIFIKASI, SOP)
           ======================================================== */}
        <div className="mt-12 bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          
          {/* Header Tab */}
          <div className="flex border-b border-slate-200 bg-slate-50/70 overflow-x-auto">
            <button
              onClick={() => setActiveTab('deskripsi')}
              className={`px-6 py-4 text-xs sm:text-sm font-extrabold font-heading uppercase tracking-wider transition-all border-b-2 flex-shrink-0 ${
                activeTab === 'deskripsi'
                  ? 'border-uii-blue-900 text-uii-blue-950 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Deskripsi & Fasilitas
            </button>
            <button
              onClick={() => setActiveTab('spesifikasi')}
              className={`px-6 py-4 text-xs sm:text-sm font-extrabold font-heading uppercase tracking-wider transition-all border-b-2 flex-shrink-0 ${
                activeTab === 'spesifikasi'
                  ? 'border-uii-blue-900 text-uii-blue-950 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Spesifikasi Teknis
            </button>
            <button
              onClick={() => setActiveTab('prosedur')}
              className={`px-6 py-4 text-xs sm:text-sm font-extrabold font-heading uppercase tracking-wider transition-all border-b-2 flex-shrink-0 ${
                activeTab === 'prosedur'
                  ? 'border-uii-blue-900 text-uii-blue-950 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Tata Tertib & SOP Peminjaman
            </button>
          </div>

          {/* Konten Tab */}
          <div className="p-6 sm:p-8">
            {activeTab === 'deskripsi' && (
              <div className="space-y-6 max-w-4xl">
                <div>
                  <h3 className="text-lg font-black font-heading text-uii-blue-950 mb-3">
                    Tentang {product.name}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {product.features && product.features.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-uii-blue-950 uppercase tracking-wider mb-3">
                      Keunggulan & Fasilitas yang Didapatkan:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {product.features.map((feat, i) => (
                        <div key={i} className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'spesifikasi' && (
              <div className="max-w-3xl">
                <h3 className="text-lg font-black font-heading text-uii-blue-950 mb-4">
                  Rincian Spesifikasi Teknis
                </h3>
                <div className="rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                  {product.specs && product.specs.length > 0 ? (
                    product.specs.map((item, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 text-xs sm:text-sm bg-white hover:bg-slate-50 transition-colors">
                        <span className="font-semibold text-slate-500">{item.label}</span>
                        <span className="font-bold text-slate-900 mt-0.5 sm:mt-0">{item.value}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-xs text-slate-500">Spesifikasi standar terverifikasi oleh BPA KM UII.</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'prosedur' && (
              <div className="space-y-4 max-w-4xl">
                <h3 className="text-lg font-black font-heading text-uii-blue-950 mb-2">
                  Prosedur & Syarat Peminjaman Aset BPA KM UII
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  Demi kenyamanan dan kelancaran bersama seluruh civitas akademika Universitas Islam Indonesia, penyewa diwajibkan mematuhi panduan berikut:
                </p>
                <div className="space-y-2.5">
                  {product.terms && product.terms.map((t, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start space-x-3 text-xs sm:text-sm text-slate-700">
                      <span className="w-6 h-6 rounded-full bg-uii-blue-900 text-uii-gold flex items-center justify-center font-black text-xs flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="pt-0.5">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ========================================================
            BAGIAN 3: TESTIMONI PENYEWA (SESUAI REQUEST PENGGUNA)
           ======================================================== */}
        <div className="mt-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-uii-gold/20 text-uii-blue-950 text-xs font-black uppercase tracking-wider mb-2">
                <Star className="w-3.5 h-3.5 fill-uii-blue-950 text-uii-blue-950" />
                <span>Ulasan Kepuasan</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-heading text-uii-blue-950">
                Pengalaman & Testimoni Penyewa
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Ulasan asli dari kepanitiaan, lembaga mahasiswa, dan mitra yang telah menyewa {product.name}.
              </p>
            </div>

            {/* Average Rating Score Badge */}
            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex-shrink-0">
              <div className="text-center pr-4 border-r border-slate-200">
                <span className="text-3xl font-black text-uii-blue-950 font-heading">
                  {product.rating || 4.9}
                </span>
                <span className="text-[10px] text-slate-400 block font-bold">DARI 5.0</span>
              </div>
              <div>
                <div className="flex items-center text-amber-400 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700">
                  100% Kepuasan Penyewa
                </span>
              </div>
            </div>
          </div>

          {/* Grid Testimoni */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {product.testimonials && product.testimonials.length > 0 ? (
              product.testimonials.map((testi) => (
                <div
                  key={testi.id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Bintang */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-amber-400">
                        {[...Array(testi.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {testi.date}
                      </span>
                    </div>

                    {/* Kutipan Ulasan */}
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                      "{testi.content}"
                    </p>
                  </div>

                  {/* Profil Penyewa */}
                  <div className="pt-4 border-t border-slate-100 flex items-center space-x-3">
                    <img
                      src={testi.avatar}
                      alt={testi.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {testi.name}
                      </h4>
                      <p className="text-[11px] text-uii-blue-900 font-semibold truncate">
                        {testi.organization}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
                Belum ada ulasan untuk aset ini. Jadilah penyewa pertama!
              </div>
            )}
          </div>
        </div>

        {/* ========================================================
            BAGIAN 4: REKOMENDASI ASET LAIN (SERING DISEWA BERSAMA)
           ======================================================== */}
        <div className="mt-16 pt-12 border-t border-slate-200/80">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl sm:text-2xl font-black font-heading text-uii-blue-950">
                Aset Lain yang Sering Disewa Bersama
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Lengkapi kebutuhan acara Anda dengan peralatan pendukung resmi lainnya.
              </p>
            </div>
            <button
              onClick={onBack}
              className="hidden sm:flex items-center space-x-1.5 text-xs font-bold text-uii-blue-900 hover:text-uii-blue-950"
            >
              <span>Lihat Semua Katalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => (
              <div
                key={rel.id}
                onClick={() => {
                  if (onNavigateProduct) {
                    onNavigateProduct(rel);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 rounded-2xl bg-slate-50 p-3 overflow-hidden flex items-center justify-center mb-4">
                    <img
                      src={rel.images && rel.images[0] ? rel.images[0] : rel.image}
                      alt={rel.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-uii-blue-950 text-uii-gold">
                      {rel.cat}
                    </span>
                  </div>

                  <h4 className="text-base font-extrabold font-heading text-[#192a3d] group-hover:text-uii-blue-900 transition-colors line-clamp-1">
                    {rel.name}
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    {rel.priceText}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-uii-blue-900">
                  <span>Lihat Detail Foto & Sewa</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
