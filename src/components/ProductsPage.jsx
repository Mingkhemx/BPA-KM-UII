import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Tag, 
  MessageCircle, 
  CheckCircle2, 
  Filter, 
  Home, 
  Building2, 
  Volume2, 
  Radio, 
  Shirt, 
  Tent, 
  Laptop, 
  Megaphone,
  CalendarCheck
} from 'lucide-react';
import { siteData } from '../data/siteData';

export const ProductsPage = ({ onBackHome, onOpenDetail, onNavigateSewa, currentUser, onNavigateAuth }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Handler tombol Sewa: Jika belum login atau belum mempunyai akun, langsung diarahkan ke page login & register
  const handleSewaAction = (e, product) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!currentUser) {
      if (onNavigateAuth) {
        onNavigateAuth('login');
      }
      return;
    }
    if (onNavigateSewa) {
      onNavigateSewa(product);
    }
  };

  // Menggunakan 1 produk template utama (siap disambungkan ke API / Backend)
  const allProducts = useMemo(() => {
    return (siteData.programs || []).slice(0, 1);
  }, []);

  const categories = [
    { label: 'Semua', value: 'Semua' },
    { label: 'Gedung & Venue', value: 'Gedung & Venue' },
    { label: 'Sewa Alat', value: 'Sewa Alat' },
    { label: 'Logistik Resmi', value: 'Logistik Resmi' },
    { label: 'Digital & Kemitraan', value: 'Digital & Kemitraan' }
  ];

  // Category icons mapping
  const categoryIcons = {
    'Gedung & Venue': Building2,
    'Sewa Alat': Volume2,
    'Logistik Resmi': Shirt,
    'Digital & Kemitraan': Laptop
  };

  // Filter & Search logic
  const filteredProducts = useMemo(() => {
    return allProducts.filter((item) => {
      const matchesCategory = 
        selectedCategory === 'Semua' || 
        item.category.toLowerCase() === selectedCategory.toLowerCase();

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.tagline.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        (item.tracks && item.tracks.some(t => t.toLowerCase().includes(query))) ||
        (item.features && item.features.some(f => f.toLowerCase().includes(query)));

      return matchesCategory && matchesSearch;
    });
  }, [allProducts, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      
      {/* 1. Hero Header Banner (sesuai referensi user: "PRODUK KAMI") */}
      <section className="relative w-full pt-28 sm:pt-36 pb-16 sm:pb-24 bg-uii-blue-950 overflow-hidden text-center text-white select-none">
        {/* Background Image with Dark Vignette Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/asset-bpa/scc-uii.webp"
            alt="Produk BPA KM UII"
            className="w-full h-full object-cover object-center filter brightness-40 blur-xs scale-105"
            onError={(e) => { e.target.src = '/images/banner/banner.jpg'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-uii-blue-950/80 to-uii-blue-950" />
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
            <span className="text-white/40">/</span>
            <span className="text-uii-gold font-bold">Produk Kami</span>
          </nav>

          {/* Big Bold Page Title (sesuai foto referensi user) */}
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-wider font-heading text-white drop-shadow-md">
            PRODUK KAMI
          </h1>
          
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Katalog lengkap fasilitas gedung, paket audio panggung, perangkat komunikasi HT, tenda sarnafil, serta layanan atribut resmi Badan Pengelola Aset (BPA) KM UII.
          </p>
        </div>
      </section>

      {/* 2. Search & Category Filter Navigation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 -mt-7 relative z-20">
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-elevated border border-slate-200/80">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input Bar */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari produk, gedung, sound, HT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-uii-blue-900 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === cat.value
                      ? 'bg-uii-blue-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-uii-blue-950'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 3. Products Catalog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 mt-10">
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto my-8">
            <p className="text-base font-bold text-slate-800 mb-1">Produk Tidak Ditemukan</p>
            <p className="text-xs text-slate-500 mb-4">Tidak ada produk yang cocok dengan kata kunci "{searchQuery}".</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('Semua'); }}
              className="px-4 py-2 rounded-xl bg-uii-blue-900 text-white text-xs font-bold"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          /* Grid / Container Produk: Dibuat kecil (compact ~320px) hanya berisi gambar, judul, deskripsi, harga, dan tombol sewa */
          <div className={filteredProducts.length === 1 ? "max-w-xs mx-auto" : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"}>
            {filteredProducts.map((product) => {
              const waText = encodeURIComponent(`Halo Pengelola BPA KM UII, saya ingin reservasi/sewa produk: ${product.name}`);

              return (
                <div
                  key={product.id}
                  onClick={(e) => handleSewaAction(e, product)}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    {/* Gambar Produk */}
                    <div className="relative h-44 overflow-hidden bg-slate-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className={`w-full h-full object-cover ${product.imagePosition || 'object-center'} group-hover:scale-105 transition-transform duration-500`}
                        onError={(e) => { e.target.src = '/images/banner/banner.jpg'; }}
                      />
                    </div>

                    {/* Konten: Judul Barang, Deskripsi, dan Harga */}
                    <div className="p-4 sm:p-5 space-y-2.5">
                      {/* Judul Barang */}
                      <h3 className="text-base font-bold text-uii-blue-950 font-heading group-hover:text-uii-blue-900 transition-colors leading-snug line-clamp-1">
                        {product.name}
                      </h3>

                      {/* Deskripsi Barang */}
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {product.description}
                      </p>

                      {/* Harga Barang */}
                      <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                        <span className="text-[11px] text-slate-400 font-medium">Harga Sewa</span>
                        <span className="text-sm font-extrabold text-uii-blue-900 font-heading">
                          {product.price || 'Rp 2.500.000 / hari'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tombol Aksi Sewa: Jika belum login langsung diarahkan ke page Login/Register, jika sudah login diarahkan ke SewaPage */}
                  <div className="p-4 sm:p-5 pt-0">
                    <button
                      onClick={(e) => handleSewaAction(e, product)}
                      className="w-full py-2.5 px-4 rounded-xl bg-uii-blue-900 hover:bg-uii-blue-950 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs hover:shadow-md flex items-center justify-center space-x-1.5 group/btn"
                    >
                      <CalendarCheck className="w-3.5 h-3.5 text-uii-gold group-hover/btn:scale-110 transition-transform" />
                      <span>Sewa</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Quick How-to-Rent Step Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 mt-16 pt-12 border-t border-slate-200/80">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-bold uppercase tracking-wider text-uii-blue-900 mb-1">
            Panduan Singkat
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-uii-blue-950 font-heading">
            Alur Pemesanan Aset BPA KM UII
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft">
            <span className="text-xs font-black text-uii-blue-900 bg-uii-blue-50 px-2.5 py-1 rounded-md">
              01
            </span>
            <h4 className="text-base font-bold text-uii-blue-950 font-heading mt-3 mb-1">
              Pilih Aset & Cek Jadwal
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tentukan venue gedung SCC atau peralatan event yang ingin disewa, lalu cek ketersediaan melalui CP resmi.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft">
            <span className="text-xs font-black text-uii-blue-900 bg-uii-blue-50 px-2.5 py-1 rounded-md">
              02
            </span>
            <h4 className="text-base font-bold text-uii-blue-950 font-heading mt-3 mb-1">
              Survey & Pembayaran DP 30%
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Lakukan survey kondisi fisik barang atau venue, fiksasi tanggal, dan bayar uang muka minimal 30% untuk kunci jadwal.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft">
            <span className="text-xs font-black text-uii-blue-900 bg-uii-blue-50 px-2.5 py-1 rounded-md">
              03
            </span>
            <h4 className="text-base font-bold text-uii-blue-950 font-heading mt-3 mb-1">
              Pelunasan & Serah Terima
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pelunasan H-7 sebelum acara. Serah terima barang dilakukan dengan uji coba fungsi dan checklist kelengkapan.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
