import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Compass,
  X,
  ChevronRight,
  Layers,
  Sparkles,
  ArrowRight,
  Clock,
  MessageCircle
} from 'lucide-react';

export const FloatingHub = ({
  cartItems = [],
  onOpenCart,
  onNavigateTracking,
  activeBooking = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hubRef = useRef(null);

  const totalCartCount = cartItems.reduce((acc, it) => acc + (it.quantity || 1), 0);
  const totalCartCost = cartItems.reduce((acc, it) => {
    const days = Math.max(1, it.days || 1);
    return acc + (it.priceValue * (it.quantity || 1) * days);
  }, 0);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (hubRef.current && !hubRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleOpenCartAction = () => {
    setIsOpen(false);
    if (onOpenCart) onOpenCart();
  };

  const handleNavigateTrackingAction = () => {
    setIsOpen(false);
    if (onNavigateTracking) onNavigateTracking(activeBooking?.bookingCode || '');
  };

  return (
    <div ref={hubRef} className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      
      {/* POPUP MENU KARTU KERANJANG & LACAK (MUNCUL KETIKA LINGKARAN DIKLIK) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="mb-3 w-72 sm:w-80 bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col"
          >
            {/* Header Popup Menu */}
            <div className="p-4 bg-gradient-to-r from-uii-blue-950 via-uii-blue-900 to-uii-blue-950 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-uii-gold animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider font-heading text-uii-gold">
                  Layanan Cepat BPA UII
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Tutup Menu"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Menu Items List */}
            <div className="p-3 space-y-2 bg-slate-50/50">
              
              {/* 1. KARTU KERANJANG SEWA */}
              <button
                onClick={handleOpenCartAction}
                className="w-full text-left p-3.5 rounded-2xl bg-white hover:bg-amber-50/70 border border-slate-200 hover:border-amber-300 transition-all flex items-center space-x-3 group shadow-2xs"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-uii-blue-950 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-5 h-5 text-uii-blue-950" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-black text-uii-blue-950 font-heading">
                      Keranjang Sewa
                    </h4>
                    {totalCartCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-uii-blue-950 text-uii-gold text-[10px] font-black">
                        {totalCartCount} Item
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {totalCartCount > 0 
                      ? `Total Rp ${totalCartCost.toLocaleString('id-ID')}`
                      : 'Keranjang kosong (Pilih aset)'}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>

              {/* 2. KARTU LACAK PROGRES SEWA */}
              <button
                onClick={handleNavigateTrackingAction}
                className="w-full text-left p-3.5 rounded-2xl bg-white hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 transition-all flex items-center space-x-3 group shadow-2xs"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-uii-blue-950 to-uii-blue-800 text-uii-gold flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <Compass className="w-5 h-5 text-uii-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-black text-uii-blue-950 font-heading">
                      Lacak Progres Sewa
                    </h4>
                    {activeBooking && (
                      <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[9px] font-bold">
                        Aktif
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {activeBooking 
                      ? `Kode #${activeBooking.bookingCode}` 
                      : 'Pantau kesiapan sarana & prasarana'}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-uii-blue-900 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>

              {/* 3. FAST CONTACT KONSULTASI WA (OPSIONAL RINGAN) */}
              <a
                href="https://wa.me/6285233475595?text=Halo%20BPA%20KM%20UII,%20saya%20ingin%20konsultasi%20mengenai%20sewa%20sarana%20prasarana"
                target="_blank"
                rel="noreferrer"
                className="w-full text-left p-2.5 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100/90 border border-emerald-200 transition-all flex items-center space-x-2.5 text-xs font-bold text-emerald-900"
              >
                <div className="w-7 h-7 rounded-xl bg-[#25D366] text-white flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 fill-current" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-[11px] font-bold text-emerald-950">Konsultasi Staf WhatsApp</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
              </a>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LINGKARAN UTAMA FLOATING BUTTON (BISA DI-KLIK MUNCULKAN KERANJANG & LACAK, KEMUDIAN BERUBAH JADI 'X') */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Tutup Menu Layanan" : "Buka Menu Keranjang & Lacak"}
        className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 border-2 ${
          isOpen
            ? 'bg-rose-600 hover:bg-rose-700 text-white border-white rotate-90 ring-4 ring-rose-200'
            : 'bg-uii-blue-950 hover:bg-uii-blue-900 text-uii-gold border-uii-gold ring-4 ring-uii-gold/20'
        }`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close-icon"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6 text-white stroke-[2.5]" />
            </motion.div>
          ) : (
            <motion.div
              key="menu-icon"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center relative"
            >
              <ShoppingBag className="w-6 h-6 text-uii-gold" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live Cart Counter Badge (Di Atas Lingkaran jika belum dibuka dan ada isi keranjang) */}
        {!isOpen && totalCartCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-uii-gold text-uii-blue-950 text-[11px] font-black flex items-center justify-center shadow-md border border-uii-blue-950 animate-bounce">
            {totalCartCount}
          </span>
        )}
      </motion.button>

    </div>
  );
};

