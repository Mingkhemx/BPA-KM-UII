import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Camera,
  Trash2,
  User,
  Mail,
  Phone,
  Briefcase,
  Building,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { neonApi } from '../../services/neonDb';
import { adminStorage } from '../../utils/adminStorage';

/**
 * Kompres gambar avatar ke ukuran optimal (maks 256x256 base64 JPEG)
 */
const compressAvatarImage = (file, maxSize = 256, quality = 0.85) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Gagal membaca gambar.'));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error('Gagal memuat file.'));
    reader.readAsDataURL(file);
  });

export const EditProfileModal = ({
  isOpen,
  onClose,
  currentUser,
  portalType = 'admin', // 'admin' | 'staff'
  onSave
}) => {
  const fileInputRef = useRef(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [division, setDivision] = useState('');
  const [picture, setPicture] = useState('');

  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sinkronisasi data saat modal dibuka
  useEffect(() => {
    if (isOpen && currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
      setRole(currentUser.role || (portalType === 'admin' ? 'Administrator Utama' : 'Staf Operasional BPA'));
      setDivision(currentUser.division || currentUser.org || (portalType === 'admin' ? 'Presiden Direktur BPA KM UII' : 'Divisi Operasional & Sarpras BPA KM UII'));
      setPicture(currentUser.picture || currentUser.googlePicture || currentUser.google_picture || '');
      setErrorMsg('');
      setToastMsg('');
    }
  }, [isOpen, currentUser, portalType]);

  if (!isOpen) return null;

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Mohon pilih file gambar yang valid (JPG, PNG, atau WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Ukuran file foto maksimal 5 MB.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const compressedDataUrl = await compressAvatarImage(file);
      setPicture(compressedDataUrl);
      setToastMsg('Foto profil berhasil diunggah.');
      setTimeout(() => setToastMsg(''), 2500);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal memproses gambar foto.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPicture('');
    setToastMsg('Foto profil dikembalikan ke inisial huruf.');
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Nama lengkap wajib diisi.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Email wajib diisi.');
      return;
    }

    setLoading(true);

    try {
      const updatedUser = {
        ...currentUser,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: role.trim(),
        division: division.trim(),
        org: division.trim(),
        picture: picture || ''
      };

      // 1. Simpan ke database Neon PostgreSQL jika akun ada di tabel users
      try {
        const targetId = updatedUser.id || updatedUser.email;
        await neonApi.updateUserStatus(targetId, {
          name: updatedUser.name,
          phone: updatedUser.phone,
          role: updatedUser.role,
          org: updatedUser.division,
          picture: updatedUser.picture
        });
      } catch (neonErr) {
        console.warn('Sync profile update ke Neon warning:', neonErr);
      }

      // 2. Perbarui cache pengguna adminStorage jika terdaftar
      try {
        const localUsers = adminStorage.getUsers() || [];
        const foundIndex = localUsers.findIndex(
          (u) => (u.email || '').toLowerCase() === updatedUser.email.toLowerCase() || u.id === updatedUser.id
        );
        if (foundIndex >= 0) {
          localUsers[foundIndex] = {
            ...localUsers[foundIndex],
            name: updatedUser.name,
            phone: updatedUser.phone,
            role: updatedUser.role,
            org: updatedUser.division,
            picture: updatedUser.picture
          };
          adminStorage.saveUsers(localUsers);
        }
      } catch (cacheErr) {
        console.warn('Update adminStorage users warning:', cacheErr);
      }

      // 3. Simpan ke sesi auth masing-masing portal
      if (portalType === 'admin') {
        adminStorage.saveAdminAuth(updatedUser);
      } else {
        try {
          localStorage.setItem('bpa_staff_session', JSON.stringify(updatedUser));
        } catch {}
      }

      // 4. Callback ke komponen parent untuk instant reactivity
      if (onSave) {
        onSave(updatedUser);
      }

      setToastMsg('Profil berhasil diperbarui!');
      setTimeout(() => {
        setToastMsg('');
        onClose();
      }, 700);
    } catch (err) {
      console.error('Save profile error:', err);
      setErrorMsg('Gagal menyimpan profil: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const initialLetter = name ? name.trim().charAt(0).toUpperCase() : (portalType === 'admin' ? 'A' : 'S');

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
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 text-slate-800"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-uii-blue-950 via-[#0c1f38] to-uii-blue-950 text-white flex items-center justify-between border-b-2 border-uii-gold/40">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-uii-gold text-uii-blue-950 flex items-center justify-center font-black shadow-md">
                <Sparkles className="w-5 h-5 text-uii-blue-950" />
              </div>
              <div>
                <h3 className="text-base font-black text-white font-heading">
                  Edit Profil & Foto
                </h3>
                <p className="text-[10px] text-uii-gold font-bold uppercase tracking-wider">
                  {portalType === 'admin' ? 'Panel Administrator BPA' : 'Panel Staf Operasional & Approval'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5">
            {/* Toast / Error */}
            {toastMsg && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{toastMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* SEKSI GANTI FOTO PROFIL */}
            <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5">
              <div className="relative group">
                {picture ? (
                  <img
                    src={picture}
                    alt={name}
                    className="w-20 h-20 rounded-full object-cover border-3 border-uii-gold shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-uii-blue-950 text-uii-gold font-black text-2xl flex items-center justify-center border-3 border-uii-gold shadow-md">
                    {initialLetter}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-uii-gold text-uii-blue-950 hover:scale-110 transition-transform shadow-md border-2 border-white"
                  title="Pilih foto baru"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Foto Profil Akun
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Unggah foto formal atau kasual Anda. Format JPG/PNG/WEBP (Maks 5 MB).
                  </p>
                </div>

                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="py-1.5 px-3 rounded-xl bg-uii-blue-950 hover:bg-uii-blue-900 text-uii-gold text-xs font-bold transition-colors inline-flex items-center space-x-1.5 shadow-2xs"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Unggah Foto</span>
                  </button>

                  {picture && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors inline-flex items-center space-x-1.5 border border-rose-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Foto</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* FIELD INPUT */}
            <div className="space-y-3.5">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Lengkap & Gelar: <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Muhammad Fathur Rahman, S.T."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-950 focus:bg-white"
                  />
                </div>
              </div>

              {/* Email & Telepon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Akun: <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@uii.ac.id"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-950 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Nomor WhatsApp / HP:
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0812-3456-7890"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-950 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Jabatan / Peran & Divisi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Jabatan / Role:
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="Contoh: Koordinator Approval & Sarpras"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-950 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Divisi / Unit Kerja:
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={division}
                      onChange={(e) => setDivision(e.target.value)}
                      placeholder="Contoh: Divisi Operasional BPA KM UII"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-950 focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tombol Simpan & Batal */}
            <div className="pt-3 flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors text-center"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-2 py-3 px-4 rounded-2xl bg-uii-blue-950 hover:bg-uii-blue-900 text-uii-gold font-black text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-uii-gold" />
                    <span>Menyimpan Profil...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-uii-gold" />
                    <span>Simpan Perubahan Profil</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
