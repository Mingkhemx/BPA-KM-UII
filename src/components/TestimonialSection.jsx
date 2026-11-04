import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight, MessageSquareQuote, Star, Tag } from 'lucide-react';
import { siteData } from '../data/siteData';
import { adminStorage } from '../utils/adminStorage';

export const TestimonialSection = () => {
  const [current, setCurrent] = useState(0);
  const [testimonials] = useState(() => {
    try {
      const saved = adminStorage.getTestimonials();
      return saved && saved.length > 0 ? saved : siteData.testimonials;
    } catch {
      return siteData.testimonials;
    }
  });

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  };

  const t = testimonials[current];

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-slate-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-uii-blue-50 text-uii-blue-900 text-xs font-bold uppercase tracking-wider mb-2">
            <MessageSquareQuote className="w-3.5 h-3.5 text-uii-gold-600" />
            <span>Testimoni Penyewa</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-uii-blue-950 font-heading tracking-tight">
            Pengalaman & Kepuasan Penyewa
          </h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base">
            Mendengar langsung pengalaman lembaga kemahasiswaan, panitia kegiatan, dan mitra yang telah mempercayakan kebutuhan sewa venue dan inventaris acara kepada BPA KM UII.
          </p>
        </div>

        {/* Carousel Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-elevated border border-slate-200/80 relative">
            <div className="absolute top-6 right-8 text-uii-blue-100 hidden sm:block pointer-events-none">
              <Quote className="w-20 h-20 opacity-40" />
            </div>

            <div className="flex items-center space-x-1 text-amber-400 mb-6">
              {[...Array(t.rating || 5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                <blockquote className="text-base sm:text-xl font-medium text-slate-800 leading-relaxed italic">
                  "{t.quote}"
                </blockquote>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-slate-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-uii-gold shadow-md flex-shrink-0 bg-uii-blue-50">
                      <img
                        src={t.image}
                        alt={t.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = '/images/Profile-picture1.png'; }}
                      />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-uii-blue-950">{t.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">{t.role || t.position}</p>
                    </div>
                  </div>

                  {(t.assetRented || t.classYear) && (
                    <div className="self-start sm:self-center">
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-uii-blue-50 text-uii-blue-900 border border-uii-blue-200/70 text-xs font-semibold">
                        <Tag className="w-3.5 h-3.5 text-uii-gold-600 flex-shrink-0" />
                        <span>{t.assetRented || t.classYear}</span>
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-8 mt-6 border-t border-slate-100">
              <div className="flex items-center space-x-2">
                {testimonials.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrent(idx)}
                    className={`h-2.5 rounded-full transition-all ${
                      idx === current ? 'w-8 bg-uii-blue-900' : 'w-2.5 bg-slate-200'
                    }`}
                    aria-label={`Testimoni ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrev}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-uii-blue-900 hover:text-white text-slate-700 transition-colors"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-uii-blue-900 hover:text-white text-slate-700 transition-colors"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

