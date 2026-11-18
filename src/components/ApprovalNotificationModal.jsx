import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  PhoneCall,
  Calendar,
  Package,
  ShieldCheck,
  FileText,
  User,
  Building,
  Copy,
  Check
} from 'lucide-react';

export const ApprovalNotificationModal = ({
  isOpen,
  onClose,
  booking,
  onNavigateTracking
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !booking) return null;

  const handleCopyBookingCode = () => {
    try {
      navigator.clipboard?.writeText(booking.bookingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleOpenWhatsAppStaff = () => {
    let msg = `Halo Staf Pengelola BPA KM UII, saya ingin mengonfirmasi pengajuan sewa yang baru saja saya kirim melalui Web BPA:\n\n`;
    msg += `📋 *KODE REGISTRASI: ${booking.bookingCode}*\n`;
    msg += `👤 *Nama Pemesan:* ${booking.customer.name}\n`;
    msg += `🏢 *Lembaga/Organisasi:* ${booking.customer.org || 'Pribadi / Umum'}\n`;
    msg += `📱 *No. WhatsApp:* ${booking.customer.phone}\n`;
    if (booking.customer.notes) {
      msg += `📝 *Catatan Acara:* ${booking.customer.notes}\n`;
    }
    msg += `\n📦 *DAFTAR ASET YANG DIAJUKAN:*\n`;

    booking.items.forEach((it, idx) => {
      const days = Math.max(1, it.days || 1);
      const subtotal = it.priceValue * it.quantity * days;
      msg += `${idx + 1}. ${it.name} (${it.quantity} Unit) - ${it.startDate} s/d ${it.endDate} (${days} hari) = Rp ${subtotal.toLocaleString('id-ID')}\n`;
    });

    msg += `\n💰 *Total Estimasi: Rp ${booking.totalCost.toLocaleString('id-ID')}*\n`;
    msg += `⏳ *Status Saat Ini: Menunggu Persetujuan / Review Staf*\n\n`;
    msg += `Mohon konfirmasi ketersediaan dan informasi apakah pengajuan sewa ini *DISETUJUI* atau *TIDAK*. Terima kasih!`;

    const waUrl = `https://wa.me/6285233475595?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
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

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-200 my-8 flex flex-col max-h-[90vh]"
        >
          {/* Header Status */}
          <div className="p-6 bg-gradient-to-r from-uii-blue-950 via-uii-blue-900 to-uii-blue-950 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Pulsing Status Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Menunggu Persetujuan Staf</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black font-heading text-white mt-1">
              Pengajuan Sewa Berhasil Dikirim!
            </h3>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/10 border border-uii-gold/40">
                <span className="text-[11px] text-slate-300">ID Lacak Sewa:</span>
                <strong className="text-sm text-uii-gold tracking-wider font-mono">{booking.bookingCode}</strong>
              </div>
              <button
                type="button"
                onClick={handleCopyBookingCode}
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-uii-gold hover:bg-yellow-400 text-uii-blue-950 text-[11px] font-black transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin ID'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-300 mt-1.5">
              Simpan ID singkat di atas untuk memasukkan & melacak progres sewa ini secara mandiri.
            </p>
          </div>

          {/* Modal Body (Scrollable) */}
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            
            {/* KOTAK NOTIFIKASI UTAMA (PESAN RESMI DARI STAF) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/90 shadow-2xs space-y-2.5">
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-amber-950 font-heading">
                    Pemberitahuan Proses Persetujuan (Approval)
                  </h4>
                  <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                    Pengajuan sewa Anda telah kami terima dan saat ini sedang dalam <strong>proses verifikasi jadwal & kelayakan oleh staf pengelola BPA KM UII</strong>.
                  </p>
                  <p className="text-xs text-amber-950 font-bold mt-2 bg-white/80 p-2.5 rounded-xl border border-amber-200 leading-relaxed">
                    📢 <strong>Anda akan segera dihubungi oleh staf BPA KM UII melalui WhatsApp / Telepon untuk memberi tahu apakah permohonan sewa ini DISETUJUI atau TIDAK.</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Stepper Alur Proses Approval */}
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80">
              <h5 className="text-xs font-black uppercase tracking-wider text-uii-blue-950 font-heading mb-3 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-uii-blue-900" />
                Tahapan Verifikasi Sewa Aset:
              </h5>

              <div className="space-y-3 text-xs">
                {/* Step 1 */}
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    ✓
                  </div>
                  <div className="pt-0.5">
                    <span className="font-bold text-slate-800 block">1. Formulir Pengajuan Diterima Sistem</span>
                    <span className="text-[11px] text-slate-500">Rincian aset & data pemesan telah tercatat.</span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 animate-pulse">
                    2
                  </div>
                  <div className="pt-0.5">
                    <span className="font-bold text-amber-900 block">2. Pengecekan Jadwal & Syarat oleh Staf (Sedang Berjalan)</span>
                    <span className="text-[11px] text-slate-500">Staf memastikan tidak ada jadwal bentrok pada kalender inventaris.</span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    3
                  </div>
                  <div className="pt-0.5">
                    <span className="font-bold text-slate-600 block">3. Notifikasi Persetujuan (Disetujui / Ditolak)</span>
                    <span className="text-[11px] text-slate-500">Staf menghubungi kontak WhatsApp pemesan untuk hasil verifikasi.</span>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    4
                  </div>
                  <div className="pt-0.5">
                    <span className="font-bold text-slate-600 block">4. Pembayaran DP & Serah Terima Aset</span>
                    <span className="text-[11px] text-slate-500">Pengambilan barang atau penggunaan venue di Gedung SCC Kampus UII.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rincian Pemesan & Aset */}
            <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-white">
              <h5 className="text-xs font-black uppercase tracking-wider text-uii-blue-950 font-heading">
                Rincian Pemesanan:
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Nama Pemesan:</span>
                  <span className="font-bold text-slate-800">{booking.customer.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Lembaga / Organisasi:</span>
                  <span className="font-bold text-slate-800">{booking.customer.org || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Nomor WhatsApp:</span>
                  <span className="font-bold text-slate-800">{booking.customer.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Waktu Pengajuan:</span>
                  <span className="font-semibold text-slate-700">{booking.createdAt}</span>
                </div>
              </div>

              {/* Daftar Aset */}
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Aset yang Diajukan ({booking.items.length} Item):
                </span>
                {booking.items.map((it, i) => {
                  const days = Math.max(1, it.days || 1);
                  const subtotal = it.priceValue * it.quantity * days;
                  return (
                    <div key={i} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50">
                      <div>
                        <span className="font-bold text-slate-800">{it.name}</span>
                        <span className="text-[11px] text-slate-500 block">
                          {it.quantity} Unit • {it.startDate} s/d {it.endDate} ({days} hari)
                        </span>
                      </div>
                      <span className="font-extrabold text-uii-blue-900">
                        Rp {subtotal.toLocaleString('id-ID')}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Total Biaya */}
              <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
                <span className="text-xs font-bold text-slate-600">Total Estimasi Biaya:</span>
                <span className="text-base font-black text-uii-blue-950 font-heading">
                  Rp {booking.totalCost.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-200 space-y-2.5">
            {onNavigateTracking && (
              <button
                onClick={() => onNavigateTracking('')}
                className="w-full py-3.5 px-4 rounded-2xl bg-uii-blue-950 hover:bg-uii-blue-900 text-uii-gold font-extrabold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 border border-uii-gold/30"
              >
                <span>🔍 Lacak Progres Persiapan Aset (Tracking Page)</span>
              </button>
            )}

            <button
              onClick={handleOpenWhatsAppStaff}
              className="w-full py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-sm hover:shadow-md flex items-center justify-center space-x-2 group"
            >
              <Send className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              <span>Hubungi Staf via WhatsApp untuk Fast-Track</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider border border-slate-200 transition-all text-center"
            >
              Tutup & Kembali ke Kalender
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

