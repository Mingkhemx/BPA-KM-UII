import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { siteData } from '../data/siteData';

export const StudyProgramsSection = ({ onSelectProgram }) => {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const products = siteData.programs;

  const categories = [
    { id: 'ALL', label: 'Semua' },
    { id: 'Gedung & Venue', label: 'Gedung & Venue' },
    { id: 'Sewa Alat', label: 'Sewa Alat & Sound' },
    { id: 'Logistik Resmi', label: 'Jas Almamater' },
    { id: 'Digital & Kemitraan', label: 'Digital & Kemitraan' },
  ];

  const filteredProducts = activeCategory === 'ALL'
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <section id="programs" className="py-16 sm:py-24 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Header */}
        <div className="mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Produk & Layanan BPA KM UII
          </h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base max-w-2xl leading-relaxed">
            Fasilitas gedung, persewaan perlengkapan kegiatan, pengadaan atribut resmi, dan layanan digital di bawah pengelolaan Badan Pengelola Aset KM UII.
          </p>
        </div>

        {/* Minimalist Tabs */}
        <div className="flex items-center space-x-6 sm:space-x-8 border-b border-slate-200 mb-10 overflow-x-auto no-scrollbar text-sm">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`pb-3 font-semibold transition-colors whitespace-nowrap relative ${
                  isActive
                    ? 'text-uii-blue-900'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>{cat.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="productTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-uii-blue-900"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Clean Product Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <motion.div
                layout
                key={product.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => onSelectProgram(product)}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer"
              >
                {/* Clean Image - Pure Photo, No Badges Overlaid */}
                <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.src = '/images/fit-uii.jpg'; }}
                  />
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-amber-700 tracking-wide uppercase">
                      {product.category}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1 group-hover:text-uii-blue-900 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Key Highlights */}
                    {product.tracks && (
                      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                        {product.tracks.slice(0, 2).map((item, idx) => (
                          <span key={idx} className="flex items-center space-x-1.5">
                            <span className="w-1 h-1 rounded-full bg-slate-400" />
                            <span>{item}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Link */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">
                      {product.status}
                    </span>
                    <span className="inline-flex items-center space-x-1 text-sm font-semibold text-uii-blue-900 group-hover:translate-x-1 transition-transform">
                      <span>Lihat Detail</span>
                      <ArrowRight className="w-4 h-4 text-uii-blue-900" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Clean, Understated Footer Note */}
        <div className="mt-14 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-600 gap-4">
          <p>
            Membutuhkan informasi peminjaman barang atau paket khusus untuk kepanitiaan?
          </p>
          <a
            href="https://wa.me/6281234567890?text=Halo%20BPA%20KM%20UII,%20saya%20ingin%20konsultasi%20peminjaman%20barang/fasilitas"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-2 font-semibold text-uii-blue-900 hover:text-blue-700 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Hubungi Pengelola BPA</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

      </div>
    </section>
  );
};
