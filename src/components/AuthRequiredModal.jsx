import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  UserCheck,
  UserPlus,
  LogIn,
  X,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  PackageCheck
} from 'lucide-react';

export const AuthRequiredModal = ({
  isOpen,
  onClose,
  onNavigateLogin,
  onNavigateRegister,
  customMessage = ''
}) => {
  if (!isOpen) return null;

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

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-200 my-8 flex flex-col"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-uii-blue-950 via-uii-blue-900 to-uii-blue-950 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-uii-blue-950 flex items-center justify-center font-black shadow-lg mb-3">
              <Lock className="w-6 h-6 text-uii-blue-950" />
            </div>

            <span className="text-[10px] font-black uppercase tracking-wider text-uii-gold block">
              Pemberitahuan Sistem Sewa BPA KM UII
            </span>
            <h3 className="text-xl sm:text-2xl font-black font-heading text-white mt-1">
              Anda Belum Bisa Melakukan Sewa
            </h3>
            <p className="text-xs text-blue-200 mt-1">
              Silakan Masuk (Login) atau Daftar Akun Terlebih Dahulu
            </p>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-4">
            
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-950 text-xs leading-relaxed space-y-2">
              <div className="flex items-start space-x-2.5">
                <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-amber-950 text-xs">
                    Akses Sewa Terkunci
                  </p>
                  <p className="text-amber-900 leading-relaxed">
                    {customMessage || 'Anda tidak dapat mengajukan sewa sarana dan fasilitas kampus sebelum masuk ke akun Anda. Hal ini diperlukan agar data peminjam dan verifikasi jadwal acara tercatat secara resmi oleh staf BPA KM UII.'}
                  </p>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/80 border border-amber-200 text-slate-700 text-[11px] leading-relaxed">
                <strong>Belum memiliki akun?</strong> Anda dapat mendaftar (register) akun baru secara gratis hanya dalam beberapa detik.
              </div>
            </div>

            {/* Keuntungan akun resmi */}
            <div className="space-y-2 pt-1 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Terhubung dengan persetujuan resmi staf & jadwal UII</span>
              </div>
              <div className="flex items-center space-x-2">
                <PackageCheck className="w-4 h-4 text-uii-blue-900 flex-shrink-0" />
                <span>Pelacakan progres persiapan sarpras secara real-time</span>
              </div>
            </div>

            {/* Tombol Aksi Login & Register */}
            <div className="space-y-2.5 pt-3">
              <button
                onClick={() => {
                  onClose();
                  if (onNavigateLogin) onNavigateLogin();
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-uii-blue-950 hover:bg-uii-blue-900 text-uii-gold font-black text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 group"
              >
                <LogIn className="w-4 h-4 text-uii-gold" />
                <span>Masuk ke Akun Saya (Login)</span>
                <ArrowRight className="w-4 h-4 text-uii-gold group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  if (onNavigateRegister) onNavigateRegister();
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-amber-400 hover:bg-yellow-400 text-uii-blue-950 font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2"
              >
                <UserPlus className="w-4 h-4 text-uii-blue-950" />
                <span>Daftar Akun Baru (Register)</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-bold transition-colors text-center"
              >
                Tutup / Nanti Saja
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

