import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  Calendar, 
  Send, 
  CheckCircle2, 
  ArrowRight,
  PackageCheck,
  AlertCircle,
  Lock,
  UserCheck,
  LogIn,
  UserPlus
} from 'lucide-react';

export const RentalCartDrawer = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onNavigateProduct,
  onSubmitBooking,
  currentUser,
  onRequireAuth,
  onNavigateAuth
}) => {
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerOrg, setCustomerOrg] = useState(currentUser?.org || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [orderNotes, setOrderNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Prefill otomatis data pemesan saat akun login tersedia
  useEffect(() => {
    if (currentUser) {
      if (!customerName) setCustomerName(currentUser.name || '');
      if (!customerOrg) setCustomerOrg(currentUser.org || 'Pribadi / Lembaga Mahasiswa');
      if (!customerPhone) setCustomerPhone(currentUser.phone || '');
    }
  }, [currentUser, isOpen]);

  // Hitung total estimasi biaya
  const totalCost = cartItems.reduce((acc, item) => {
    const days = Math.max(1, item.days || 1);
    const qty = Math.max(1, item.quantity || 1);
    return acc + (item.priceValue * qty * days);
  }, 0);

  const totalItemsCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const handleCheckoutWA = () => {
    // Intersepsi Autentikasi: Wajib login sebelum reservasi sewa
    if (!currentUser) {
      if (onRequireAuth) {
        onRequireAuth('checkout dan reservasi dari Keranjang Belanja');
      }
      return;
    }

    if (!customerName.trim()) {
      setFormError('Mohon isi nama lengkap pemesan terlebih dahulu.');
      return;
    }
    if (!customerPhone.trim()) {
      setFormError('Mohon isi nomor WhatsApp Anda.');
      return;
    }
    setFormError('');

    const bookingCode = `BPA-REV-${Date.now().toString().slice(-6)}`;
    const newBooking = {
      bookingCode,
      createdAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB',
      status: 'MENUNGGU PERSETUJUAN',
      items: [...cartItems],
      customer: {
        name: customerName.trim(),
        org: customerOrg.trim() || 'Pribadi / Umum',
        phone: customerPhone.trim(),
        notes: orderNotes.trim()
      },
      totalCost
    };

    if (onSubmitBooking) {
      onSubmitBooking(newBooking);
    }

    let text = `Halo Tim Pengelola BPA KM UII, saya ingin mengajukan permohonan sewa dari *Keranjang Belanja BPA KM UII*:\n\n`;
    text += `📋 *KODE REGISTRASI: ${bookingCode}*\n`;
    text += `👤 *DATA PEMESAN:*\n`;
    text += `• Nama: ${customerName.trim()}\n`;
    text += `• Lembaga/Organisasi: ${customerOrg.trim() || 'Pribadi / Umum'}\n`;
    text += `• No. WhatsApp: ${customerPhone.trim()}\n`;
    if (orderNotes.trim()) {
      text += `• Catatan/Keperluan: ${orderNotes.trim()}\n`;
    }
    text += `\n📦 *DAFTAR ASET YANG DISEWA (${cartItems.length} Jenis Barang):*\n`;

    cartItems.forEach((it, idx) => {
      const days = Math.max(1, it.days || 1);
      const subtotal = it.priceValue * it.quantity * days;
      text += `\n${idx + 1}. *${it.name}* (${it.quantity} Unit)\n`;
      text += `   - Periode: ${it.startDate} s/d ${it.endDate} (${days} hari)\n`;
      text += `   - Subtotal: Rp ${subtotal.toLocaleString('id-ID')}\n`;
    });

    text += `\n💰 *TOTAL ESTIMASI BIAYA SEWA: Rp ${totalCost.toLocaleString('id-ID')}*\n\n`;
    text += `⏳ *Status: Menunggu Persetujuan / Review Staf*\n`;
    text += `Mohon konfirmasi ketersediaan jadwal serta memberi tahu apakah pengajuan sewa ini *DISETUJUI* atau *TIDAK*. Terima kasih!`;

    const waUrl = `https://wa.me/6285233475595?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-uii-blue-950/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 240 }}
            className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full z-10 border-l border-slate-200"
          >
            {/* Header Drawer */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-uii-blue-950 via-uii-blue-900 to-uii-blue-950 text-white flex items-center justify-between border-b border-uii-blue-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-uii-gold/20 flex items-center justify-center text-uii-gold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base text-white flex items-center gap-2">
                    Keranjang Sewa Aset
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-uii-gold text-uii-blue-950">
                      {totalItemsCount}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">BPA KM Universitas Islam Indonesia</p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Tutup Keranjang"
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content: List Item atau Kosong */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4 border border-dashed border-slate-300">
                    <ShoppingBag className="w-10 h-10" />
                  </div>
                  <h4 className="text-base font-bold text-slate-800 font-heading">
                    Keranjang Sewa Kosong
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xs mt-1 mb-6 leading-relaxed">
                    Anda belum memasukkan aset atau peralatan kegiatan apa pun ke keranjang sewa.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-xl bg-uii-blue-900 text-uii-gold font-bold text-xs uppercase tracking-wider hover:bg-uii-blue-950 transition-all shadow-sm flex items-center space-x-2"
                  >
                    <span>Pilih Aset Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                    <span className="font-semibold text-slate-500">Item Terpilih ({cartItems.length})</span>
                    <button
                      onClick={onClearCart}
                      className="text-red-500 hover:text-red-700 font-bold flex items-center gap-1 text-[11px]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Kosongkan</span>
                    </button>
                  </div>

                  {cartItems.map((item) => {
                    const days = Math.max(1, item.days || 1);
                    const subtotal = item.priceValue * item.quantity * days;

                    return (
                      <div
                        key={item.cartItemId}
                        className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-uii-blue-900/40 transition-all flex flex-col space-y-3"
                      >
                        <div className="flex items-start space-x-3">
                          {/* Foto Kecil */}
                          <div 
                            onClick={() => {
                              if (onNavigateProduct) {
                                onNavigateProduct(item);
                                onClose();
                              }
                            }}
                            className="w-16 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden flex-shrink-0 cursor-pointer p-1"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-contain"
                              onError={(e) => { e.target.src = '/images/asset-bpa/scc-uii.webp'; }}
                            />
                          </div>

                          {/* Info Barang */}
                          <div className="flex-1 min-w-0">
                            <span className="inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-uii-blue-900 text-uii-gold">
                              {item.cat}
                            </span>
                            <h4 
                              onClick={() => {
                                if (onNavigateProduct) {
                                  onNavigateProduct(item);
                                  onClose();
                                }
                              }}
                              className="text-xs sm:text-sm font-bold text-slate-900 font-heading hover:text-uii-blue-900 transition-colors cursor-pointer truncate mt-0.5"
                            >
                              {item.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {item.priceText}
                            </p>
                          </div>

                          {/* Tombol Hapus */}
                          <button
                            onClick={() => onRemoveItem(item.cartItemId)}
                            className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                            title="Hapus dari keranjang"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Durasi & Tanggal */}
                        <div className="bg-white rounded-xl p-2.5 border border-slate-200/60 text-[11px] text-slate-600 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 truncate">
                            <Calendar className="w-3.5 h-3.5 text-uii-blue-900 flex-shrink-0" />
                            <span className="truncate">{item.startDate} s/d {item.endDate}</span>
                          </div>
                          <span className="font-bold text-uii-blue-950 flex-shrink-0 bg-slate-100 px-2 py-0.5 rounded-md">
                            {days} hari
                          </span>
                        </div>

                        {/* Kontrol Qty & Subtotal */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => onUpdateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))}
                              className="w-7 h-7 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-black text-slate-900 w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                              className="w-7 h-7 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block">Subtotal</span>
                            <span className="text-xs sm:text-sm font-extrabold text-uii-blue-900 font-heading">
                              Rp {subtotal.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Form Pemesan untuk WhatsApp */}
                  <div className="mt-6 pt-5 border-t border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-black uppercase tracking-wider text-uii-blue-950 font-heading flex items-center gap-1.5">
                        <PackageCheck className="w-4 h-4 text-uii-gold" />
                        Informasi Pemesan (Penyewa)
                      </h5>
                      {currentUser && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Akun Terverifikasi
                        </span>
                      )}
                    </div>

                    {formError && (
                      <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{formError}</span>
                      </div>
                    )}

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Nama Lengkap *
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Contoh: Muhammad Fathur"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-uii-blue-900/30"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Lembaga / Organisasi / Fakultas
                      </label>
                      <input
                        type="text"
                        value={customerOrg}
                        onChange={(e) => setCustomerOrg(e.target.value)}
                        placeholder="Contoh: DPM KM UII / FTI"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-uii-blue-900/30"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Nomor WhatsApp *
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="08xxxxxxxxxx"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-uii-blue-900/30"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Catatan Khusus Acara
                      </label>
                      <textarea
                        rows="2"
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        placeholder="Tuliskan nama kegiatan, teknis gladi bersih, dsb..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-uii-blue-900/30"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer Drawer: Total & Checkout Action */}
            {cartItems.length > 0 && (
              <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-200 space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500 font-semibold">Total Estimasi Biaya</span>
                  <div className="text-right">
                    <span className="text-lg sm:text-xl font-black text-uii-blue-950 font-heading">
                      Rp {totalCost.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-normal">
                      *Belum termasuk deposit / potongan resmi jika ada
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckoutWA}
                  className="w-full py-3.5 px-5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 group"
                >
                  <Send className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                  <span>Checkout Pesanan via WhatsApp</span>
                </button>

                <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dihubungkan langsung ke WhatsApp Resmi BPA (+62 852-3347-5595)</span>
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
