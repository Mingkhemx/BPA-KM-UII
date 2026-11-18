import React, { useState, useMemo, useEffect } from 'react';
import { 
  Home, 
  Camera, 
  Film, 
  Search, 
  Maximize2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Tag, 
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminStorage } from '../utils/adminStorage';

export const GalleryPage = ({ onBackHome }) => {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'photo' | 'video'
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [gallery, setGallery] = useState(() => adminStorage.getGallery());

  useEffect(() => {
    const syncGallery = () => setGallery(adminStorage.getGallery());
    window.addEventListener('bpa-data-updated', syncGallery);
    window.addEventListener('storage', syncGallery);
    return () => {
      window.removeEventListener('bpa-data-updated', syncGallery);
      window.removeEventListener('storage', syncGallery);
    };
  }, []);

  const photos = useMemo(() => Array.isArray(gallery?.photos) ? gallery.photos : [], [gallery]);
  const videos = useMemo(() => Array.isArray(gallery?.videos) ? gallery.videos : [], [gallery]);

  // Filter Categories dinamis dari foto yang tersedia
  const categories = useMemo(() => {
    const unique = Array.from(new Set(photos.map((p) => p.category).filter(Boolean)));
    return ['Semua', ...unique];
  }, [photos]);

  // Filtered Photos
  const filteredPhotos = useMemo(() => {
    return photos.filter((p) => {
      const matchCat = activeCategory === 'Semua' || p.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || (p.title || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [photos, activeCategory, searchQuery]);

  // Filtered Videos
  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      const q = searchQuery.toLowerCase().trim();
      return !q || (v.title || '').toLowerCase().includes(q) || (v.description || '').toLowerCase().includes(q) || (v.category || '').toLowerCase().includes(q);
    });
  }, [videos, searchQuery]);

  // Lightbox Navigation Handlers
  const handleNextPhoto = (e) => {
    if (e) e.stopPropagation();
    if (lightboxIndex !== null && filteredPhotos.length > 0) {
      setLightboxIndex((lightboxIndex + 1) % filteredPhotos.length);
    }
  };

  const handlePrevPhoto = (e) => {
    if (e) e.stopPropagation();
    if (lightboxIndex !== null && filteredPhotos.length > 0) {
      setLightboxIndex((lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length);
    }
  };

  // Keyboard navigation for Lightbox
  React.useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        handleNextPhoto();
      } else if (e.key === 'ArrowLeft') {
        handlePrevPhoto();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredPhotos.length]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 selection:bg-uii-blue-900 selection:text-uii-gold">
      
      {/* 1. Hero Header Banner (Konsisten dengan Standar Portal UII) */}
      <section className="relative w-full pt-28 sm:pt-36 pb-16 sm:pb-24 bg-uii-blue-950 overflow-hidden text-center text-white select-none">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/asset-bpa/scc-uii.webp"
            alt="Galeri BPA KM UII"
            className="w-full h-full object-cover object-center filter brightness-40 blur-xs scale-105"
            onError={(e) => { e.target.src = '/images/banner/banner.jpg'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-uii-blue-950/85 to-uii-blue-950" />
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
            <span className="text-uii-gold font-bold">Galeri Foto & Video</span>
          </nav>

          {/* Big Bold Page Title */}
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-wider font-heading text-white drop-shadow-md">
            GALERI DOKUMENTASI
          </h1>
          
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Dokumentasi visual rangkaian kegiatan fungsionaris, program bakti sosial CSR, fasilitas Student Convention Center (SCC), dan produksi media kreatif BPA KM UII.
          </p>
        </div>
      </section>

      {/* 2. Interactive Navigation Filter Tabs & Search */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 -mt-7 relative z-20 mb-12">
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-elevated border border-slate-200/80">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            
            {/* Primary Media Mode Tabs (Semua / Foto / Video) */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'bg-uii-blue-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Semua Media</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === 'all' ? 'bg-uii-gold text-uii-blue-950 font-black' : 'bg-slate-200 text-slate-700'
                }`}>
                  {photos.length + videos.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('photo')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === 'photo'
                    ? 'bg-uii-blue-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Galeri Foto</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === 'photo' ? 'bg-uii-gold text-uii-blue-950 font-black' : 'bg-slate-200 text-slate-700'
                }`}>
                  {photos.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('video')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === 'video'
                    ? 'bg-uii-blue-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Film className="w-4 h-4" />
                <span>Galeri Video</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === 'video' ? 'bg-uii-gold text-uii-blue-950 font-black' : 'bg-slate-200 text-slate-700'
                }`}>
                  {videos.length}
                </span>
              </button>
            </div>

            {/* Live Search Input Bar */}
            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari dokumentasi foto atau video..."
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

          </div>

          {/* Secondary Sub-Category Filter Badges (Aktif ketika tab 'all' atau 'photo') */}
          {activeTab !== 'video' && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center space-x-2 overflow-x-auto pb-1">
              <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center whitespace-nowrap">
                <Tag className="w-3.5 h-3.5 mr-1" />
                Kategori:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    activeCategory === cat
                      ? 'bg-sky-100 text-sky-800 border border-sky-300 shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. Galeri Foto Section */}
      {(activeTab === 'all' || activeTab === 'photo') && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 mb-20">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center space-x-2 text-sky-700 font-extrabold text-xs uppercase tracking-wider mb-1">
                <Camera className="w-4 h-4" />
                <span>Dokumentasi Visual</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-uii-blue-950 font-heading">
                Galeri Foto
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 sm:mt-0 max-w-md">
              Menampilkan {filteredPhotos.length} foto kegiatan fungsionaris, program kerja, dan inventaris fasilitas BPA KM UII.
            </p>
          </div>

          {/* Photos Grid (3 Columns) */}
          {filteredPhotos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  onClick={() => setLightboxIndex(index)}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                >
                  {/* Photo Container */}
                  <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={photo.image}
                      alt={photo.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = '/images/banner/banner.jpg'; }}
                    />
                    
                    {/* Top Overlay Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-uii-blue-950/80 text-white backdrop-blur-md border border-white/20 shadow-xs">
                        {photo.category}
                      </span>
                    </div>

                    {/* Hover Zoom Icon Pill */}
                    <div className="absolute inset-0 bg-uii-blue-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="px-4 py-2 rounded-xl bg-white/90 backdrop-blur-md text-uii-blue-950 text-xs font-bold flex items-center space-x-1.5 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                        <Maximize2 className="w-3.5 h-3.5 text-sky-700" />
                        <span>Perbesar Foto</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Info Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Date Badge */}
                      <div className="flex items-center space-x-1 text-[11px] font-bold text-slate-400 mb-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{photo.date}</span>
                      </div>

                      {/* Title */}
                      <h3 className="font-extrabold text-slate-800 text-base sm:text-lg group-hover:text-sky-700 transition-colors leading-snug font-heading mb-2">
                        {photo.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                        {photo.description}
                      </p>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-600 group-hover:text-sky-700">
                      <span>Lihat Rincian</span>
                      <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
              <Camera className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-700 font-bold">Belum ada foto dokumentasi.</p>
              <p className="text-xs text-slate-500 mt-1">Foto dokumentasi akan tampil setelah ditambahkan oleh admin.</p>
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <Camera className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-bold">Tidak ada foto yang cocok dengan pencarian.</p>
              <button
                onClick={() => { setActiveCategory('Semua'); setSearchQuery(''); }}
                className="mt-3 px-4 py-1.5 bg-uii-blue-900 text-white rounded-lg text-xs font-bold"
              >
                Reset Filter
              </button>
            </div>
          )}
        </section>
      )}

      {/* 4. Galeri Video Section */}
      {(activeTab === 'all' || activeTab === 'video') && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center space-x-2 text-rose-600 font-extrabold text-xs uppercase tracking-wider mb-1">
                <Film className="w-4 h-4" />
                <span>Media Kreatif & Pelantikan</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-uii-blue-950 font-heading">
                Galeri Video
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 sm:mt-0 max-w-md">
              Kompilasi dokumentasi video pelantikan resmi, talkshow inspiratif, dan web series produksi BPA KM UII.
            </p>
          </div>

          {/* Videos Grid (3 Columns) */}
          {filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Responsive 16:9 YouTube Embed */}
                  <div className="relative aspect-video w-full bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.youtubeId}`}
                      title={video.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>

                  {/* Card Info Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Title */}
                      <h3 className="font-extrabold text-slate-800 text-base leading-snug font-heading mb-2">
                        {video.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
                        {video.description}
                      </p>
                    </div>

                    {/* Bottom Action: Watch on YouTube */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <a
                        href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
                      >
                        <span>Tonton di YouTube</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <span className="text-[11px] text-slate-400 font-semibold">
                        {video.date}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
              <Film className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-700 font-bold">Belum ada video dokumentasi.</p>
              <p className="text-xs text-slate-500 mt-1">Video dokumentasi akan tampil setelah ditambahkan oleh admin.</p>
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <Film className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-bold">Tidak ada video yang cocok dengan kata kunci.</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 px-4 py-1.5 bg-uii-blue-900 text-white rounded-lg text-xs font-bold"
              >
                Hapus Pencarian
              </button>
            </div>
          )}
        </section>
      )}

      {/* 5. Fullscreen Lightbox Modal untuk Preview Foto HD */}
      <AnimatePresence>
        {lightboxIndex !== null && filteredPhotos[lightboxIndex] && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-md"
            onClick={() => setLightboxIndex(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/20 flex flex-col"
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-white/10 text-white">
                <div className="flex items-center space-x-3">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider bg-uii-gold text-uii-blue-950">
                    {filteredPhotos[lightboxIndex].category}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">
                    Foto {lightboxIndex + 1} dari {filteredPhotos.length}
                  </span>
                </div>

                <button
                  onClick={() => setLightboxIndex(null)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="Tutup foto"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* HD Image View with Navigation Arrows */}
              <div className="relative flex-1 bg-black flex items-center justify-center min-h-[300px] max-h-[70vh] overflow-hidden">
                <img
                  src={filteredPhotos[lightboxIndex].image}
                  alt={filteredPhotos[lightboxIndex].title}
                  className="max-h-[68vh] w-auto max-w-full object-contain select-none"
                />

                {/* Left Arrow Button */}
                {filteredPhotos.length > 1 && (
                  <button
                    onClick={handlePrevPhoto}
                    className="absolute left-4 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-all border border-white/20 hover:scale-105"
                    aria-label="Foto Sebelumnya"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}

                {/* Right Arrow Button */}
                {filteredPhotos.length > 1 && (
                  <button
                    onClick={handleNextPhoto}
                    className="absolute right-4 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-all border border-white/20 hover:scale-105"
                    aria-label="Foto Selanjutnya"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
              </div>

              {/* Modal Bottom Caption */}
              <div className="p-6 bg-slate-950 text-white border-t border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-lg sm:text-xl font-bold font-heading text-white">
                    {filteredPhotos[lightboxIndex].title}
                  </h3>
                  <div className="flex items-center space-x-1.5 text-xs text-uii-gold font-bold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{filteredPhotos[lightboxIndex].date}</span>
                  </div>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {filteredPhotos[lightboxIndex].description}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default GalleryPage;
