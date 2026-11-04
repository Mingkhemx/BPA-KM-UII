import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, Tag, ExternalLink, Share2, Check } from 'lucide-react';

export const DetailModal = ({ item, isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !item) return null;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-uii-blue-950/80 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header Image if any */}
          {item.image && (
            <div className="relative h-56 sm:h-64 w-full bg-uii-blue-950 flex-shrink-0">
              <img
                src={item.image}
                alt={item.title || item.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = '/images/fit-uii.jpg'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {item.category && (
                <span className="absolute top-4 left-4 bg-uii-blue-900 text-uii-gold text-xs font-bold px-3 py-1 rounded-full uppercase">
                  {item.category}
                </span>
              )}
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Content */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-4 flex-1">
            {/* Meta tags */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              {item.date && (
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4 text-uii-blue-900" />
                  <span>{item.date}</span>
                </span>
              )}
              {item.author && (
                <span className="flex items-center space-x-1">
                  <User className="w-4 h-4 text-uii-blue-900" />
                  <span>{item.author}</span>
                </span>
              )}
              {item.accreditation && (
                <span className="flex items-center space-x-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  <Tag className="w-3.5 h-3.5" />
                  <span>{item.accreditation}</span>
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-uii-blue-950 leading-tight">
              {item.title || item.name}
            </h2>

            {/* Text Content */}
            <div className="text-slate-700 text-sm sm:text-base leading-relaxed space-y-3 whitespace-pre-line border-t border-slate-100 pt-4">
              {item.content || item.description || item.desc}
            </div>

            {/* Full Features list if available */}
            {item.features && (
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-2 mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-uii-blue-900">
                  Rincian & Fasilitas Layanan:
                </p>
                <div className="space-y-1.5 pt-1">
                  {item.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start space-x-2 text-xs sm:text-sm text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-uii-blue-900 mt-2 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extra details / tags */}
            {item.tracks && !item.features && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2 mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-uii-blue-900">
                  Spesifikasi & Fitur:
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.tracks.map((t, idx) => (
                    <span key={idx} className="bg-white border border-slate-200 px-3 py-1 rounded-lg text-xs font-medium text-slate-800">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-uii-blue-900 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Tautan Disalin!' : 'Bagikan Info'}</span>
            </button>

            <div className="flex items-center space-x-2">
              {item.contactWa && (
                <a
                  href={`https://wa.me/${item.contactWa}?text=${encodeURIComponent(`Halo BPA KM UII, saya ingin info peminjaman/sewa: ${item.title || item.name}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                >
                  <span>Chat WA Pengelola</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-uii-blue-900 text-white hover:bg-uii-blue-950 text-xs font-bold transition-colors"
                >
                  <span>Kunjungi Situs Resmi</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

