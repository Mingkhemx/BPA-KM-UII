import React, { useState, useMemo, useEffect } from 'react';
import { 
  Home, 
  Search, 
  Calendar, 
  Clock, 
  User, 
  ArrowRight, 
  Tag, 
  BookOpen, 
  Sparkles,
  Share2,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
import { adminStorage } from '../utils/adminStorage';

export const ArticlesPage = ({ onBackHome, onOpenArticle }) => {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState(() => adminStorage.getArticles());

  useEffect(() => {
    const syncArticles = () => setArticles(adminStorage.getArticles());
    window.addEventListener('bpa-data-updated', syncArticles);
    window.addEventListener('storage', syncArticles);
    return () => {
      window.removeEventListener('bpa-data-updated', syncArticles);
      window.removeEventListener('storage', syncArticles);
    };
  }, []);

  // Filter Categories dinamis dari artikel yang tersedia
  const categories = useMemo(() => {
    const unique = Array.from(new Set(articles.map((a) => a.category).filter(Boolean)));
    return ['Semua', ...unique];
  }, [articles]);

  // Filter Logic
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchCat = selectedCategory === 'Semua' || art.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        (art.title || '').toLowerCase().includes(q) || 
        (art.excerpt || '').toLowerCase().includes(q) || 
        (art.author || '').toLowerCase().includes(q) ||
        (art.category || '').toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [articles, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 selection:bg-uii-blue-900 selection:text-uii-gold">
      
      {/* 1. Hero Header Banner */}
      <section className="relative w-full pt-28 sm:pt-36 pb-16 sm:pb-24 bg-uii-blue-950 overflow-hidden text-center text-white select-none">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/asset-bpa/scc-uii.webp"
            alt="Artikel BPA KM UII"
            className="w-full h-full object-cover object-center filter brightness-40 blur-xs scale-105"
            onError={(e) => { e.target.src = '/images/banner/banner.jpg'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-uii-blue-950/85 to-uii-blue-950" />
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
            <span className="text-uii-gold font-bold">Artikel & Warta Resmi</span>
          </nav>

          {/* Big Bold Page Title */}
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-wider font-heading text-white drop-shadow-md">
            ARTIKEL & BERITA
          </h1>
          
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Pusat publikasi resmi, warta kegiatan organisasi, inisiatif CSR, laporan fasilitas kampus, dan panduan layanan Badan Pengelola Aset (BPA) KM UII.
          </p>
        </div>
      </section>

      {/* 2. Search & Category Filter Navigation Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 -mt-7 relative z-20 mb-12">
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-elevated border border-slate-200/80">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            
            {/* Search Input Bar */}
            <div className="relative w-full lg:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari artikel, kegiatan, CSR, fasilitas..."
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

            {/* Results Counter */}
            <div className="text-xs font-semibold text-slate-500 flex items-center space-x-1.5 self-end lg:self-center">
              <BookOpen className="w-4 h-4 text-uii-blue-900" />
              <span>Menampilkan <strong className="text-uii-blue-950 font-bold">{filteredArticles.length}</strong> artikel</span>
            </div>

          </div>

          {/* Category Filter Chips */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center space-x-2 overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center whitespace-nowrap">
              <Tag className="w-3.5 h-3.5 mr-1" />
              Kategori:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-uii-blue-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Articles Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredArticles.map((article) => (
              <article
                key={article.id}
                onClick={() => onOpenArticle && onOpenArticle(article)}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  {/* Card Image (Terkunci / Locked Aspect & Height: Rapi & Konsisten untuk Admin Upload) */}
                  <div className="relative w-full h-56 sm:h-60 md:h-64 bg-slate-100 overflow-hidden flex-shrink-0">
                    <img
                      src={article.image}
                      alt={article.title}
                      loading="lazy"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = '/images/banner/banner.jpg'; }}
                    />
                    
                    {/* Top Overlay Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-uii-blue-950/85 text-uii-gold backdrop-blur-md border border-white/10 shadow-xs">
                        {article.category}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 sm:p-6 space-y-3">
                    {/* Date & Read Time */}
                    <div className="flex items-center space-x-3 text-xs text-slate-400 font-semibold">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-uii-gold" />
                        <span>{article.date}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{article.readTime}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-extrabold text-uii-blue-950 text-base leading-snug font-heading group-hover:text-uii-blue-800 transition-colors line-clamp-2">
                      {article.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Author & Read CTA */}
                <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium flex items-center space-x-1.5 truncate max-w-[150px]">
                    <User className="w-3.5 h-3.5 text-uii-blue-900 flex-shrink-0" />
                    <span className="truncate">{article.author}</span>
                  </span>

                  <span className="inline-flex items-center space-x-1 text-uii-blue-900 font-bold group-hover:text-uii-gold transition-colors">
                    <span>Baca</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-700 font-bold">Belum ada artikel yang dipublikasikan.</p>
            <p className="text-xs text-slate-500 mt-1">Artikel dan berita resmi akan tampil setelah ditambahkan oleh admin.</p>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-bold">Tidak ada artikel yang cocok dengan filter atau kata kunci.</p>
            <button
              onClick={() => { setSelectedCategory('Semua'); setSearchQuery(''); }}
              className="mt-3 px-4 py-1.5 bg-uii-blue-900 text-white rounded-lg text-xs font-bold"
            >
              Reset Filter
            </button>
          </div>
        )}
      </section>

    </div>
  );
};

export default ArticlesPage;

