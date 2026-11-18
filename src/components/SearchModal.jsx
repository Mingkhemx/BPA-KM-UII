import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Package, Newspaper, ArrowRight } from 'lucide-react';
import { adminStorage } from '../utils/adminStorage';

export const SearchModal = ({ isOpen, onClose, onSelectItem }) => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState(() => adminStorage.getProducts());
  const [articles, setArticles] = useState(() => adminStorage.getArticles());

  useEffect(() => {
    const syncData = () => {
      setProducts(adminStorage.getProducts());
      setArticles(adminStorage.getArticles());
    };
    window.addEventListener('bpa-data-updated', syncData);
    window.addEventListener('storage', syncData);
    return () => {
      window.removeEventListener('bpa-data-updated', syncData);
      window.removeEventListener('storage', syncData);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Search in products
  const matchedPrograms = q
    ? products.filter((p) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.cat || p.category || '').toLowerCase().includes(q) ||
        (p.desc || p.description || '').toLowerCase().includes(q)
      )
    : [];

  // Search in articles
  const matchedNews = q
    ? articles.filter((n) =>
        (n.title || '').toLowerCase().includes(q) ||
        (n.excerpt || '').toLowerCase().includes(q) ||
        (n.category || '').toLowerCase().includes(q)
      )
    : [];

  const totalResults = matchedPrograms.length + matchedNews.length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-16 sm:pt-24 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-uii-blue-950/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 border border-slate-100"
        >
          {/* Search Input Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center space-x-3">
            <Search className="w-5 h-5 text-uii-blue-900 flex-shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari program studi, berita, UTS, kalender akademik..."
              className="w-full text-base sm:text-lg outline-none text-slate-800 placeholder:text-slate-400"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200"
            >
              ESC
            </button>
          </div>

          {/* Results Area */}
          <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 space-y-6">
            {!query && (
              <div className="text-center py-8">
                <p className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Pencarian Populer</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['SCC', 'Sound System', 'Katering', 'HT', 'CSR'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="text-xs bg-slate-100 hover:bg-uii-blue-50 hover:text-uii-blue-900 px-3 py-1.5 rounded-lg text-slate-700 font-medium transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {query && totalResults === 0 && (
              <div className="text-center py-10 text-slate-500">
                <p className="text-sm font-semibold">Tidak ditemukan hasil untuk "{query}"</p>
                <p className="text-xs mt-1">Coba kata kunci lain atau periksa kembali katalog aset dan artikel.</p>
              </div>
            )}

            {/* Products results */}
            {matchedPrograms.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase text-uii-blue-900 tracking-wider flex items-center space-x-1.5">
                  <Package className="w-4 h-4" />
                  <span>Produk & Aset ({matchedPrograms.length})</span>
                </p>
                <div className="space-y-1.5">
                  {matchedPrograms.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => { onSelectItem(p); onClose(); }}
                      className="p-3 rounded-xl hover:bg-uii-blue-50 cursor-pointer flex items-center justify-between group transition-colors"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-uii-blue-900">{p.name}</h4>
                        <p className="text-xs text-slate-500">{p.cat || p.category || 'Aset'} • {p.priceText || p.price || ''}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-uii-blue-900" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* News results */}
            {matchedNews.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase text-uii-blue-900 tracking-wider flex items-center space-x-1.5">
                  <Newspaper className="w-4 h-4" />
                  <span>Artikel ({matchedNews.length})</span>
                </p>
                <div className="space-y-1.5">
                  {matchedNews.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => { onSelectItem(n); onClose(); }}
                      className="p-3 rounded-xl hover:bg-uii-blue-50 cursor-pointer flex items-center justify-between group transition-colors"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-uii-blue-900 line-clamp-1">{n.title}</h4>
                        <p className="text-xs text-slate-500">{n.date} • {n.category}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-uii-blue-900" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

