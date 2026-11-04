import React, { useState } from 'react';
import { 
  Home, 
  CheckCircle2, 
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ContactPage = ({ onBackHome }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulasi pengiriman pesan
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', subject: '', message: '' });
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-[#f4f7f9] pb-24 selection:bg-uii-blue-900 selection:text-uii-gold">
      
      {/* 1. Hero Header Banner */}
      <section className="relative w-full pt-28 sm:pt-36 pb-16 sm:pb-20 bg-uii-blue-950 overflow-hidden text-center text-white select-none">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/asset-bpa/scc-uii.webp"
            alt="Kontak BPA KM UII"
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
            <span className="text-uii-gold font-bold">Kontak Kami</span>
          </nav>

          {/* Big Bold Page Title */}
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-wider font-heading text-white drop-shadow-md">
            HUBUNGI KAMI
          </h1>
          
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Hubungi pengelola Badan Pengelola Aset (BPA) KM UII untuk informasi reservasi gedung Student Convention Center (SCC), sewa logistik event, kerjasama mitra, maupun pertanyaan kelembagaan.
          </p>
        </div>
      </section>

      {/* 2. Main Form Container (Sesuai Referensi Foto Pengguna: bpakm.uii.ac.id/kontak/) */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 -mt-8 relative z-20">
        
        {/* Formulir Kontak Utama */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-10">
          
          {/* Title Header Sesuai Referensi Gambar */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#192a3d] font-heading mb-6 tracking-tight">
            Kontak Kami
          </h2>

          <AnimatePresence mode="wait">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Field 1: Nama */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Nama
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    placeholder="Nama Lengkap"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-md border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                  />
                </div>

                {/* Field 2: Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    placeholder="E-Mail"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-md border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                  />
                </div>

                {/* Field 3: Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    required
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-md border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                  />
                </div>

                {/* Field 4: Pesan (Textarea) */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Pesan
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={8}
                    placeholder="Pesan"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-md border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all resize-y"
                  />
                </div>

                {/* Submit Button (Sesuai Referensi: Tombol Biru Lebar 'Kirim Pesan') */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-md bg-[#2872fa] hover:bg-blue-600 text-white font-bold text-sm sm:text-base shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
                  >
                    {loading ? (
                      <span className="inline-flex items-center space-x-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Mengirim Pesan...</span>
                      </span>
                    ) : (
                      <span>Kirim Pesan</span>
                    )}
                  </button>
                </div>

              </form>
            ) : (
              /* Success Banner State */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-10 text-center space-y-4"
              >
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#192a3d] font-heading">
                    Pesan Berhasil Terkirim!
                  </h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    Terima kasih telah menghubungi Badan Pengelola Aset (BPA) KM UII. Tim kami akan segera menindaklanjuti pesan Anda melalui email <strong>{formData.email}</strong>.
                  </p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleReset}
                    className="px-6 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-colors"
                  >
                    Kirim Pesan Lain
                  </button>
                  <a
                    href="https://wa.me/6282226122024?text=Halo%20BPA%20KM%20UII,%20saya%20sudah%20mengirimkan%20pesan%20via%20website"
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-colors inline-flex items-center space-x-2 shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Lanjut Chat via WhatsApp</span>
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
};

export default ContactPage;

