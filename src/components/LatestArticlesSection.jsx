import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  ArrowRight, 
  User,
  FileText
} from 'lucide-react';
import { adminStorage } from '../utils/adminStorage';

export const LatestArticlesSection = ({ onOpenArticle, onViewAllArticles }) => {
  const [allArticles, setAllArticles] = useState(() => adminStorage.getArticles());

  useEffect(() => {
    const syncArticles = () => setAllArticles(adminStorage.getArticles());
    window.addEventListener('bpa-data-updated', syncArticles);
    window.addEventListener('storage', syncArticles);
    return () => {
      window.removeEventListener('bpa-data-updated', syncArticles);
      window.removeEventListener('storage', syncArticles);
    };
  }, []);

  const articles = allArticles.slice(0, 4);

  return (
    <section id="news" className="py-16 sm:py-24 bg-white relative overflow-hidden border-t border-slate-200/80">
      {/* Background Decorative Blobs */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-blue-50/50 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-amber-50/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        
        {/* Header with Title & View All Button */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-12 gap-4">
          <div className="max-w-3xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-uii-blue-950 font-heading tracking-tight leading-tight">
              Artikel Terbaru BPA KM UII
            </h2>
            <p className="mt-2.5 text-slate-600 text-sm sm:text-base leading-relaxed">
              Ikuti liputan kegiatan, pelatihan logistik, inisiatif CSR, laporan utilisasi fasilitas, serta pengumuman resmi pengelolaan aset mahasiswa.
            </p>
          </div>
          {onViewAllArticles && (
            <button
              onClick={onViewAllArticles}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-uii-blue-900 text-white hover:bg-uii-blue-800 text-xs sm:text-sm font-bold shadow-sm transition-all whitespace-nowrap self-start sm:self-end"
            >
              <span>Lihat Semua Artikel</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 4-Card Grid (1 Line Horizontal on Desktop) */}
        {articles.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-2.5">
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Belum ada artikel yang dipublikasikan</h3>
            <p className="text-xs text-slate-500">
              Berita, liputan kegiatan, dan pengumuman resmi akan tampil setelah ditambahkan oleh admin.
            </p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.map((article) => (
            <article
              key={article.id}
              onClick={() => onOpenArticle && onOpenArticle(article)}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-soft hover:shadow-elevated transition-all duration-300 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                {/* Image Header with Zoom Effect & Category Badge */}
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={article.image || '/images/fit-uii.jpg'}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = '/images/fit-uii.jpg'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  
                  {/* Category Pill Tag */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-uii-blue-900/90 backdrop-blur-md text-uii-gold text-[11px] font-bold tracking-wide shadow-sm">
                    {article.category || 'Berita'}
                  </span>
                </div>

                {/* Content Body */}
                <div className="p-5 sm:p-6 space-y-3">
                  {/* Date & Reading Time */}
                  <div className="flex items-center space-x-3 text-xs text-slate-500 font-medium">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-uii-gold-600" />
                      <span>{article.date || '-'}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{article.readTime || '3 menit'}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-uii-blue-950 font-heading leading-snug line-clamp-2 group-hover:text-uii-blue-900 transition-colors">
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                    {article.excerpt || ''}
                  </p>
                </div>
              </div>

              {/* Bottom Footer: Author & Read CTA */}
              <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center space-x-1.5 font-medium truncate max-w-[140px]">
                  <User className="w-3.5 h-3.5 text-uii-gold-600 flex-shrink-0" />
                  <span className="truncate">{article.author || 'Humas BPA'}</span>
                </span>

                <span className="inline-flex items-center space-x-1 text-uii-blue-900 font-bold group-hover:text-uii-blue-700 transition-colors">
                  <span>Baca</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </article>
          ))}
        </div>
        )}
      </div>
    </section>
  );
};

