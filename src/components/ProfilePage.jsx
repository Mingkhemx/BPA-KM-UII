import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Building,
  ShieldCheck,
  Package,
  Compass,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Save,
  Clock,
  ShoppingBag,
  Sparkles,
  Calendar,
  MapPin,
  ChevronRight,
  Edit3,
  FileText,
  KeyRound,
  RefreshCw,
  History,
  X,
  Camera,
  Upload,
  Trash2,
  Copy,
  Check,
  ArrowRight
} from 'lucide-react';
import { adminStorage } from '../utils/adminStorage';
import { neonApi } from '../services/neonDb';
import { getStoredTrackingBookings } from '../data/trackingData';

export const ProfilePage = ({
  currentUser,
  onUpdateUser,
  onLogout,
  onBackHome,
  onNavigateSewa,
  onNavigateTracking,
  onOpenCart,
  cartItems = [],
  activeBookings = []
}) => {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'bookings' | 'security'
  const [copiedBookingCode, setCopiedBookingCode] = useState(null);

  // Editable Profile State
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [category, setCategory] = useState(currentUser?.category || 'Masyarakat Umum');
  const [org, setOrg] = useState(currentUser?.org || '');
  const [picture, setPicture] = useState(currentUser?.picture || '');
  const [avatarError, setAvatarError] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [remoteBookings, setRemoteBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [selectedHistoryBooking, setSelectedHistoryBooking] = useState(null);

  // Sinkronkan form jika currentUser berubah
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setCategory(currentUser.category || 'Masyarakat Umum');
      setOrg(currentUser.org || '');
      setPicture(currentUser.picture || '');
      setAvatarError(false);
    }
  }, [currentUser]);

  // Ambil daftar booking dari Neon DB (jika tersedia)
  useEffect(() => {
    let mounted = true;
    const loadRemote = async () => {
      setLoadingBookings(true);
      try {
        const data = await neonApi.getBookings();
        if (mounted && Array.isArray(data)) {
          setRemoteBookings(data);
        }
      } catch {
        // Fallback ke local storage saja
      } finally {
        if (mounted) setLoadingBookings(false);
      }
    };
    loadRemote();
    const handleSync = () => {
      loadRemote();
    };
    window.addEventListener('bpa-data-updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      mounted = false;
      window.removeEventListener('bpa-data-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Gabungkan & filter riwayat reservasi milik pengguna ini
  const userBookings = useMemo(() => {
    // Sumber otoritatif adalah remoteBookings dari database Neon.
    // Hanya gunakan fallback local tracking jika server offline (remoteBookings belum didapat).
    const sourceBookings = Array.isArray(remoteBookings)
      ? remoteBookings
      : (getStoredTrackingBookings() || []);

    const userEmail = (currentUser?.email || '').toLowerCase().trim();
    const userName = (currentUser?.name || '').toLowerCase().trim();

    if (!userEmail && !userName) return [];

    return sourceBookings.filter((b) => {
      if (!b || !b.bookingCode) return false;
      const custEmail = (b.customer?.email || b.userEmail || '').toLowerCase().trim();
      const custName = (b.customer?.name || b.userName || '').toLowerCase().trim();
      if (userEmail && custEmail && custEmail === userEmail) return true;
      if (userName && custName && custName === userName) return true;
      return false;
    });
  }, [remoteBookings, currentUser]);

  // Daftar pesanan yang sedang dalam tahap progres (belum selesai / tidak ditolak)
  const inProgressBookings = useMemo(() => {
    const isPending = (b) => {
      const s = String(b?.status || '').toUpperCase();
      const pct = Number(b?.progressPercent ?? 0);
      return s !== 'SELESAI' && s !== 'DITOLAK' && pct < 100;
    };
    if (Array.isArray(activeBookings) && activeBookings.length > 0) {
      return activeBookings;
    }
    return userBookings.filter(isPending);
  }, [activeBookings, userBookings]);

  const activeInProgressCount = useMemo(() => {
    return inProgressBookings.length;
  }, [inProgressBookings]);

  const handleCopyCode = (code, e) => {
    e?.stopPropagation();
    if (!code) return;
    try {
      navigator.clipboard?.writeText(code);
      setCopiedBookingCode(code);
      showToast(`Kode #${code} berhasil disalin ke clipboard!`);
      setTimeout(() => setCopiedBookingCode(null), 2000);
    } catch {
      showToast(`Kode booking: ${code}`);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Kompres dan potong tengah gambar profil menjadi Data URL ringan (max 320x320)
  const compressImageToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
      reader.onload = (ev) => {
        const img = new Image();
        img.onerror = () => reject(new Error('Format gambar tidak didukung.'));
        img.onload = () => {
          const size = 320;
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          const minSide = Math.min(img.width, img.height);
          const sx = (img.width - minSide) / 2;
          const sy = (img.height - minSide) / 2;
          ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });

  const persistPictureUpdate = async (newPictureUrl, successMsg) => {
    setIsUploadingAvatar(true);
    setErrorMessage('');
    const updatedUser = {
      ...currentUser,
      picture: newPictureUrl,
      updatedAt: new Date().toLocaleString('id-ID')
    };

    try {
      const userIdOrEmail = currentUser?.id || currentUser?.email;
      if (userIdOrEmail) {
        const res = await neonApi.updateUserStatus(encodeURIComponent(userIdOrEmail), {
          picture: newPictureUrl
        });
        if (!res || !res.id) {
          await neonApi.saveUser({
            id: updatedUser.id || `usr-${Date.now()}`,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone || '',
            role: updatedUser.category || 'Masyarakat Umum',
            org: updatedUser.org || 'Masyarakat Umum (Personal)',
            status: 'Aktif',
            picture: newPictureUrl
          });
        }
      }

      setPicture(newPictureUrl);
      setAvatarError(false);
      onUpdateUser?.(updatedUser);
      showToast(successMsg);
    } catch (err) {
      setErrorMessage('Gagal menyimpan foto profil: ' + err.message);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Mohon pilih file gambar (JPG, PNG, atau WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Ukuran file foto maksimal 5 MB.');
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const compressedDataUrl = await compressImageToDataUrl(file);
      await persistPictureUpdate(compressedDataUrl, 'Foto profil berhasil diunggah & disimpan!');
    } catch (err) {
      setIsUploadingAvatar(false);
      setErrorMessage(err.message || 'Gagal memproses gambar.');
    }
  };

  const handleRemoveAvatar = async () => {
    await persistPictureUpdate('', 'Foto profil dihapus, kembali ke avatar inisial.');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Nama lengkap tidak boleh kosong.');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('Nomor WhatsApp aktif wajib diisi untuk koordinasi sarpras.');
      return;
    }

    const isUmum = category === 'Masyarakat Umum';
    if (!isUmum && !org.trim()) {
      setErrorMessage('Mohon isi asal Fakultas/Prodi, Ormawa/Lembaga, atau Instansi Anda.');
      return;
    }

    setIsSaving(true);
    const updatedUser = {
      ...currentUser,
      name: name.trim(),
      phone: phone.trim(),
      category,
      org: org.trim() || (isUmum ? 'Masyarakat Umum (Personal)' : category),
      picture,
      updatedAt: new Date().toLocaleString('id-ID')
    };

    try {
      // 1. Update di Neon PostgreSQL
      const userIdOrEmail = currentUser?.id || currentUser?.email;
      if (userIdOrEmail) {
        const res = await neonApi.updateUserStatus(encodeURIComponent(userIdOrEmail), {
          name: updatedUser.name,
          phone: updatedUser.phone,
          role: updatedUser.category,
          org: updatedUser.org,
          picture: updatedUser.picture,
          status: 'Aktif'
        });

        // Jika record belum ada di DB (mis. login lokal sebelumnya), buat/upsert via saveUser
        if (!res || !res.id) {
          await neonApi.saveUser({
            id: updatedUser.id || `usr-${Date.now()}`,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            role: updatedUser.category,
            org: updatedUser.org,
            picture: updatedUser.picture,
            status: 'Aktif'
          });
        }
      }

      // 2. Sinkronisasi ke adminStorage
      const existingUsers = adminStorage.getUsers();
      const idx = existingUsers.findIndex((u) => u.email === updatedUser.email);
      if (idx > -1) {
        const nextUsers = [...existingUsers];
        nextUsers[idx] = {
          ...nextUsers[idx],
          name: updatedUser.name,
          phone: updatedUser.phone,
          role: updatedUser.category,
          org: updatedUser.org
        };
        adminStorage.saveUsers(nextUsers);
      } else {
        adminStorage.saveUsers([
          {
            id: updatedUser.id || `usr-${Date.now()}`,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            role: updatedUser.category,
            org: updatedUser.org,
            status: 'Aktif',
            joinedDate: new Date().toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }),
            totalBookings: userBookings.length
          },
          ...existingUsers
        ]);
      }

      // 3. Perbarui state aplikasi & localStorage
      onUpdateUser?.(updatedUser);
      showToast('Profil Anda berhasil diperbarui & disinkronkan!');
    } catch (err) {
      setErrorMessage('Terjadi kesalahan saat menyimpan profil: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  const getStatusBadgeStyle = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'SELESAI' || s === 'SIAP DIGUNAKAN') {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    if (s === 'DITOLAK') {
      return 'bg-rose-100 text-rose-800 border-rose-200';
    }
    if (s === 'DISETUJUI' || s === 'SEDANG DISIAPKAN') {
      return 'bg-blue-100 text-blue-900 border-blue-200';
    }
    return 'bg-amber-100 text-amber-900 border-amber-200';
  };

  const userInitial = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-slate-50 pt-24 sm:pt-28 pb-20 selection:bg-uii-blue-900 selection:text-uii-gold">
      {/* Toast Notifikasi */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-2xl bg-uii-blue-950 text-uii-gold border border-uii-gold/40 shadow-2xl text-xs sm:text-sm font-bold flex items-center space-x-2"
          >
            <CheckCircle2 className="w-5 h-5 text-uii-gold flex-shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Breadcrumb / Back Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackHome}
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-uii-blue-950 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-2xs transition-all hover:shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </button>

          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
            Portal Akun & Profil Penyewa • BPA KM UII
          </span>
        </div>

        {/* HERO PROFILE BANNER */}
        <div className="bg-[#06152b] rounded-3xl shadow-xl overflow-hidden relative border border-uii-blue-900/40">
          {/* Background Pattern / Venue Image */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-luminosity pointer-events-none"
            style={{ backgroundImage: "url('/images/produk/detail/scc-wide.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#06152b] via-[#06152b]/95 to-uii-blue-900/80 pointer-events-none" />

          <div className="relative z-10 p-6 sm:p-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Avatar & Identity */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="relative flex-shrink-0 self-start sm:self-auto">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="relative group block rounded-3xl focus:outline-none"
                  title="Klik untuk upload foto profil"
                >
                  {picture && !avatarError ? (
                    <img
                      src={picture}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      onError={() => setAvatarError(true)}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-uii-gold shadow-xl"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-uii-blue-900 to-[#0a1f3f] text-uii-gold flex items-center justify-center text-3xl sm:text-4xl font-black border-2 border-uii-gold shadow-xl">
                      {userInitial}
                    </div>
                  )}

                  {/* Overlay hover & badge kamera */}
                  <div className="absolute inset-0 rounded-3xl bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <span className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-uii-gold text-uii-blue-950 border-2 border-[#06152b] shadow-md flex items-center justify-center group-hover:scale-110 transition-transform">
                    {isUploadingAvatar ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Camera className="w-3.5 h-3.5" />
                    )}
                  </span>
                </button>
              </div>

              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {(() => {
                    const r = String(currentUser.role || currentUser.category || '').toLowerCase();
                    const isStaff = r.includes('staf') || r.includes('staff');
                    if (isStaff) {
                      return (
                        <span className="px-3 py-1 rounded-full bg-amber-400 text-uii-blue-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs border border-amber-300">
                          <ShieldCheck className="w-3.5 h-3.5 text-uii-blue-950" />
                          <span>🛠️ Staf Operasional BPA</span>
                        </span>
                      );
                    }
                    return (
                      <span className="px-3 py-1 rounded-full bg-uii-gold text-uii-blue-950 text-[10px] font-black uppercase tracking-wider">
                        {currentUser.role || currentUser.category || 'Pengguna Terdaftar'}
                      </span>
                    );
                  })()}
                  {currentUser.authProvider === 'google' ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Terhubung Google</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-white/10 text-slate-200 border border-white/15 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-uii-gold" />
                      <span>Akun Aktif</span>
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white font-heading truncate">
                  {currentUser.name}
                </h1>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-uii-gold" />
                    <span>{currentUser.email}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-uii-gold" />
                    <span>{currentUser.org || 'Penyewa BPA KM UII'}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* OVERVIEW STATS STRIP */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-uii-blue-900 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Pengajuan
              </span>
              <span className="text-xl font-black text-uii-blue-950 font-heading">
                {userBookings.length} Sewa
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Sedang Berjalan
              </span>
              <span className="text-xl font-black text-uii-blue-950 font-heading">
                {activeInProgressCount} Aktif
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Keranjang Sewa
              </span>
              <span className="text-xl font-black text-uii-blue-950 font-heading">
                {cartItems.length} Item
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Status Akun
              </span>
              <span className="text-sm font-black text-emerald-700 truncate block">
                Aktif & Terverifikasi
              </span>
            </div>
          </div>
        </div>

        {/* BANNER AKSES DIVISI STAF OPERASIONAL */}
        {(() => {
          const r = String(currentUser.role || currentUser.category || '').toLowerCase();
          const isStaff = r.includes('staf') || r.includes('staff');
          if (!isStaff) return null;
          return (
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-uii-blue-950 via-[#0a1e3b] to-uii-blue-900 text-white border-2 border-uii-gold/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-uii-gold text-uii-blue-950 flex items-center justify-center font-black flex-shrink-0 shadow-md">
                  <ShieldCheck className="w-6 h-6 text-uii-blue-950" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-uii-gold text-uii-blue-950 text-[10px] font-black uppercase tracking-wider">
                      Hak Akses Staf Aktif
                    </span>
                    <span className="text-slate-300 text-xs">•</span>
                    <span className="text-xs text-slate-300 font-semibold">Divisi Operasional & Approval</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black font-heading text-white mt-0.5">
                    Panel Kerja Operasional & Pengelolaan Sewa Aset
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
                    Akun Anda memiliki hak akses Staf Operasional BPA. Anda dapat memverifikasi jadwal bentrok, approval pengajuan sewa, dan upload perkembangan kesiapan aset lapangan.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const staffSession = {
                    name: currentUser.name,
                    role: currentUser.role || 'Staf Operasional BPA',
                    email: currentUser.email,
                    division: currentUser.org || 'Divisi Operasional & Logistik BPA KM UII',
                    picture: currentUser.picture || currentUser.googlePicture,
                    loginTime: new Date().toLocaleString('id-ID')
                  };
                  try {
                    localStorage.setItem('bpa_staff_session', JSON.stringify(staffSession));
                  } catch {}
                  window.location.href = '/staff';
                }}
                className="px-5 py-3 rounded-2xl bg-uii-gold hover:bg-yellow-400 text-uii-blue-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition-transform hover:scale-105 active:scale-95 flex-shrink-0 cursor-pointer"
              >
                <span>Buka Panel Staf</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })()}

        {/* BANNER SEWA SEDANG BERJALAN & KODE BOOKING AKTIF */}
        {inProgressBookings.length > 0 && (
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-uii-blue-950 via-uii-blue-900 to-uii-blue-950 text-white shadow-xl border border-uii-gold/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-uii-gold text-uii-blue-950 flex items-center justify-center font-black flex-shrink-0 shadow-md">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black uppercase tracking-wider text-uii-gold font-heading">
                    {inProgressBookings.length} Reservasi Sedang Berjalan
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Pantau persiapan sarana atau klik kode di samping untuk langsung melacak progres sewa:
                </p>
              </div>
            </div>

            {/* Quick Pills Kode Booking */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {inProgressBookings.map((b) => (
                <div
                  key={b.bookingCode}
                  className="inline-flex items-center rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs overflow-hidden transition-colors shadow-2xs group/b"
                >
                  <button
                    type="button"
                    onClick={() => onNavigateTracking && onNavigateTracking(b.bookingCode)}
                    className="px-3 py-1.5 font-mono font-black text-xs text-uii-gold flex items-center space-x-1.5"
                    title={`Lacak detail progres kode #${b.bookingCode}`}
                  >
                    <span>#{b.bookingCode}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover/b:text-white group-hover/b:translate-x-0.5 transition-all" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleCopyCode(b.bookingCode, e)}
                    className="p-1.5 px-2 bg-black/20 hover:bg-black/40 border-l border-white/15 text-slate-300 hover:text-white transition-colors"
                    title="Salin kode booking"
                  >
                    {copiedBookingCode === b.bookingCode ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MAIN TABBED CONTENT AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sidebar Tab Navigation */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl p-3 border border-slate-200/90 shadow-2xs space-y-1.5">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full px-4 py-3.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === 'profile'
                    ? 'bg-uii-blue-950 text-uii-gold shadow-md'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-uii-blue-950'
                }`}
              >
                <span className="flex items-center space-x-3">
                  <User className="w-4 h-4" />
                  <span>Identitas & Edit Profil</span>
                </span>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>

              <button
                onClick={() => setActiveTab('bookings')}
                className={`w-full px-4 py-3.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === 'bookings'
                    ? 'bg-uii-blue-950 text-uii-gold shadow-md'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-uii-blue-950'
                }`}
              >
                <span className="flex items-center space-x-3">
                  <Package className="w-4 h-4" />
                  <span>Riwayat Reservasi Saya</span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === 'bookings'
                      ? 'bg-uii-gold text-uii-blue-950'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {userBookings.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`w-full px-4 py-3.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === 'security'
                    ? 'bg-uii-blue-950 text-uii-gold shadow-md'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-uii-blue-950'
                }`}
              >
                <span className="flex items-center space-x-3">
                  <KeyRound className="w-4 h-4" />
                  <span>Keamanan</span>
                </span>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>
            </div>
          </div>

          {/* Right Panel: Active Tab View */}
          <div className="lg:col-span-8">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-black text-uii-blue-950 font-heading flex items-center gap-2">
                      <Edit3 className="w-5 h-5 text-uii-gold" />
                      <span>Informasi Profil & Kontak</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Perbarui data diri Anda agar otomatis terisi saat mengajukan penyewaan aset.
                    </p>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Notifikasi Sewa Aktif jika Ada */}
                {inProgressBookings.length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-amber-800" />
                      </div>
                      <div>
                        <span className="text-amber-950 font-bold block">
                          Anda memiliki {inProgressBookings.length} pengajuan sewa yang sedang diproses.
                        </span>
                        <span className="text-[11px] text-amber-800">
                          Lihat progres persiapan atau salin kode booking Anda di samping:
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {inProgressBookings.map((b) => (
                        <button
                          key={b.bookingCode}
                          type="button"
                          onClick={() => onNavigateTracking && onNavigateTracking(b.bookingCode)}
                          className="px-2.5 py-1 rounded-xl bg-white border border-amber-300 font-mono font-black text-xs text-amber-950 hover:bg-amber-100 transition-colors flex items-center gap-1 shadow-2xs"
                        >
                          <span>#{b.bookingCode}</span>
                          <ArrowRight className="w-3 h-3 text-amber-700" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  {/* Upload / Ganti Foto Profil */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center space-x-3.5">
                      {picture && !avatarError ? (
                        <img
                          src={picture}
                          alt={currentUser.name}
                          onError={() => setAvatarError(true)}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-300 shadow-2xs flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-uii-blue-950 text-uii-gold flex items-center justify-center text-lg font-black border border-uii-gold/50 flex-shrink-0">
                          {userInitial}
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-black text-slate-900 block">
                          Foto Profil Akun
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Format JPG, PNG, atau WEBP (maks. 5 MB).
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="py-2 px-3.5 rounded-xl bg-uii-blue-950 hover:bg-uii-blue-900 text-uii-gold text-xs font-bold flex items-center space-x-1.5 transition-colors disabled:opacity-60"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingAvatar ? 'Mengunggah...' : 'Upload Foto'}</span>
                      </button>

                      {picture && !avatarError && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          disabled={isUploadingAvatar}
                          className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center space-x-1 transition-colors disabled:opacity-60"
                          title="Hapus foto profil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Nama Lengkap *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Nama lengkap Anda"
                          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Email Akun (ID)
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          disabled
                          value={currentUser.email || ''}
                          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-500 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        No. WhatsApp Aktif *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="081234567890"
                          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Kategori Pemohon *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-900 cursor-pointer"
                      >
                        <option value="Mahasiswa Aktif UII">Mahasiswa Aktif UII</option>
                        <option value="Organisasi / Lembaga UII">Organisasi / Lembaga UII</option>
                        <option value="Alumni UII">Alumni UII</option>
                        <option value="Masyarakat Umum">Masyarakat Umum</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {category === 'Masyarakat Umum'
                        ? 'Instansi / Komunitas / Event Organizer (Opsional)'
                        : 'Asal Fakultas / Prodi / Ormawa / Lembaga *'}
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required={category !== 'Masyarakat Umum'}
                        value={org}
                        onChange={(e) => setOrg(e.target.value)}
                        placeholder={
                          category === 'Organisasi / Lembaga UII'
                            ? 'Contoh: BEM FTI / DEMA / UKM'
                            : category === 'Mahasiswa Aktif UII'
                            ? 'Contoh: Informatika FTI UII'
                            : 'Personal / Nama Instansi'
                        }
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-900"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <span className="text-[11px] text-slate-400">
                      Terakhir masuk: <strong>{currentUser.loginAt || 'Baru saja'}</strong>
                    </span>

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="py-3.5 px-6 rounded-2xl bg-uii-blue-950 hover:bg-uii-blue-900 text-uii-gold font-black text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-60"
                    >
                      {isSaving ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan Profil'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-5">
                <div className="pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-black text-uii-blue-950 font-heading">
                      Riwayat & Progres Reservasi Aset
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pantau persetujuan staf dan persiapan sarana untuk setiap pengajuan Anda.
                    </p>
                  </div>
                </div>

                {loadingBookings && userBookings.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500">
                    Memuat riwayat reservasi...
                  </div>
                ) : userBookings.length === 0 ? (
                  <div className="py-12 px-4 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center mx-auto shadow-2xs">
                      <Package className="w-7 h-7" />
                    </div>
                    <h3 className="text-sm font-black text-slate-800 font-heading">
                      Belum Ada Riwayat Reservasi
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Anda belum mengajukan penyewaan gedung SCC, sound system, HT, atau perlengkapan acara lainnya.
                    </p>
                    <button
                      onClick={onNavigateSewa}
                      className="mt-2 py-3 px-5 rounded-2xl bg-uii-blue-950 text-uii-gold text-xs font-black uppercase tracking-wider inline-flex items-center space-x-2"
                    >
                      <Package className="w-4 h-4" />
                      <span>Lihat Katalog & Ajukan Sewa</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Ringkasan Kode Booking yang Masih Dalam Progres */}
                    {inProgressBookings.length > 0 && (
                      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/90 shadow-2xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                            <h3 className="text-xs font-black uppercase tracking-wider text-uii-blue-950 font-heading">
                              Kode Sewa Aktif ({inProgressBookings.length} Dalam Persiapan)
                            </h3>
                          </div>
                          <span className="text-[10px] text-blue-900 font-bold bg-white px-2 py-0.5 rounded-md border border-blue-200">
                            Klik ID untuk Lacak
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {inProgressBookings.map((b) => (
                            <div
                              key={b.bookingCode}
                              className="inline-flex items-center rounded-xl bg-white border border-blue-200/90 text-uii-blue-950 text-xs overflow-hidden shadow-2xs group/tag hover:border-uii-blue-950 transition-colors"
                            >
                              <button
                                type="button"
                                onClick={() => onNavigateTracking && onNavigateTracking(b.bookingCode)}
                                className="px-3 py-1.5 font-mono font-black text-xs text-uii-blue-950 hover:text-blue-700 flex items-center space-x-1.5"
                                title={`Lacak progres ${b.bookingCode}`}
                              >
                                <span>#{b.bookingCode}</span>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover/tag:text-blue-700 group-hover/tag:translate-x-0.5 transition-all" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleCopyCode(b.bookingCode, e)}
                                className="p-1.5 px-2 bg-slate-50 hover:bg-slate-100 border-l border-blue-100 text-slate-500 hover:text-slate-800 transition-colors"
                                title="Salin kode booking"
                              >
                                {copiedBookingCode === b.bookingCode ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {userBookings.map((b) => (
                      <div
                        key={b.bookingCode}
                        className="p-5 rounded-3xl bg-slate-50 border border-slate-200 hover:border-uii-blue-900/30 transition-all space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Kode Booking
                            </span>
                            <div className="flex items-center space-x-2 mt-0.5">
                              <span className="text-sm font-black text-uii-blue-950 font-mono tracking-wider bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
                                #{b.bookingCode}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleCopyCode(b.bookingCode, e)}
                                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold flex items-center space-x-1 transition-colors"
                                title="Salin kode booking"
                              >
                                {copiedBookingCode === b.bookingCode ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span className="text-emerald-700">Tersalin</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Salin</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadgeStyle(
                              b.status
                            )}`}
                          >
                            {b.status || 'MENUNGGU PERSETUJUAN'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="flex items-center space-x-2 text-slate-600">
                            <Calendar className="w-4 h-4 text-uii-blue-900 flex-shrink-0" />
                            <span className="truncate">
                              Acara: <strong className="text-slate-800">{b.eventDate || '-'}</strong>
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-slate-600">
                            <Package className="w-4 h-4 text-uii-blue-900 flex-shrink-0" />
                            <span>
                              Total Biaya:{' '}
                              <strong className="text-slate-900">
                                Rp {(b.totalCost || 0).toLocaleString('id-ID')}
                              </strong>
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {(() => {
                          const isPending = (b.status || '').toUpperCase() === 'MENUNGGU PERSETUJUAN';
                          const bookingPct = isPending ? 0 : Math.max(0, Math.min(100, Number(b.progressPercent ?? 0)));
                          return (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-semibold text-slate-600 truncate pr-2">
                                  {b.progressStage || 'Verifikasi Pengajuan'}
                                </span>
                                <span className="font-black text-uii-blue-950">
                                  {bookingPct}%
                                </span>
                              </div>
                              <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    bookingPct >= 100
                                      ? 'bg-emerald-600'
                                      : 'bg-uii-blue-900'
                                  }`}
                                  style={{ width: `${bookingPct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })()}

                        <div className="pt-1 flex justify-end">
                          {(b.status || '').toUpperCase() === 'SELESAI' ||
                          (b.progressPercent ?? 0) >= 100 ? (
                            <button
                              onClick={() => setSelectedHistoryBooking(b)}
                              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-2xs"
                            >
                              <History className="w-3.5 h-3.5" />
                              <span>Detail</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onNavigateTracking && onNavigateTracking(b.bookingCode)}
                              className="py-2.5 px-4 rounded-xl bg-uii-blue-950 hover:bg-uii-blue-900 text-uii-gold text-xs font-bold flex items-center space-x-1.5 transition-colors"
                            >
                              <Compass className="w-3.5 h-3.5" />
                              <span>Lacak Detail Progres</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-5">
                {/* Keamanan & Sesi Akun */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-4">
                  <h2 className="text-lg font-black text-uii-blue-950 font-heading pb-3 border-b border-slate-100">
                    Keamanan & Koneksi Akun
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Metode Autentikasi
                      </span>
                      <span className="font-black text-slate-800 block">
                        {currentUser.authProvider === 'google'
                          ? 'Google OAuth / Identity Services'
                          : 'Email & Kata Sandi BPA'}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Waktu Sesi Masuk
                      </span>
                      <span className="font-black text-slate-800 block">
                        {currentUser.loginAt || '-'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={onLogout}
                      className="w-full py-3.5 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs uppercase tracking-wider border border-rose-200 flex items-center justify-center space-x-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar dari Akun (Logout)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DETAIL & RIWAYAT PENYEWAAN SELESAI */}
      <AnimatePresence>
        {selectedHistoryBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedHistoryBooking(null)}
              className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-200 my-8"
            >
              {/* Modal Header */}
              <div className="bg-[#06152b] px-6 py-5 text-white flex items-start justify-between gap-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black uppercase tracking-wider">
                      {selectedHistoryBooking.status || 'SELESAI'}
                    </span>
                    <span className="text-xs font-mono text-uii-gold font-bold">
                      {selectedHistoryBooking.bookingCode}
                    </span>
                  </div>
                  <h3 className="text-lg font-black font-heading text-white">
                    Detail & Riwayat Penyewaan Aset
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Tanggal Acara: {selectedHistoryBooking.eventDate || '-'}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedHistoryBooking(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex-shrink-0"
                  aria-label="Tutup detail riwayat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 max-h-[72vh] overflow-y-auto">
                {/* Ringkasan Info & Biaya */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Tanggal Pengajuan
                    </span>
                    <span className="font-bold text-slate-800 block mt-0.5">
                      {selectedHistoryBooking.createdAt || '-'}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Lokasi / Venue
                    </span>
                    <span className="font-bold text-slate-800 block mt-0.5">
                      {selectedHistoryBooking.location || 'Kampus Terpadu UII'}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block">
                      Total Biaya Sewa
                    </span>
                    <span className="font-black text-emerald-900 text-sm block mt-0.5">
                      Rp {(selectedHistoryBooking.totalCost || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Daftar Sarana yang Pernah Disewa */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-black text-uii-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-uii-gold" />
                    <span>Aset / Sarana yang Disewa</span>
                  </h4>
                  {Array.isArray(selectedHistoryBooking.items) &&
                  selectedHistoryBooking.items.length > 0 ? (
                    <div className="space-y-2">
                      {selectedHistoryBooking.items.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0">
                            <p className="font-black text-slate-900 truncate">{item.name}</p>
                            <p className="text-[11px] text-slate-500">
                              {item.quantity || 1} unit • {item.days || 1} hari
                              {item.startDate ? ` (${item.startDate} s/d ${item.endDate || item.startDate})` : ''}
                            </p>
                          </div>
                          <span className="font-bold text-uii-blue-950 flex-shrink-0">
                            Rp{' '}
                            {(
                              (item.priceValue || 0) *
                              (item.quantity || 1) *
                              (item.days || 1)
                            ).toLocaleString('id-ID')}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      Rincian item tercatat pada berkas reservasi {selectedHistoryBooking.bookingCode}.
                    </p>
                  )}
                </div>

                {/* Riwayat Tahapan & Log Aktivitas */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-uii-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-4 h-4 text-uii-gold" />
                    <span>Riwayat Tahapan & Aktivitas Penyewaan</span>
                  </h4>

                  {Array.isArray(selectedHistoryBooking.timelineUpdates) &&
                  selectedHistoryBooking.timelineUpdates.length > 0 ? (
                    <div className="relative pl-5 border-l-2 border-emerald-200 space-y-4">
                      {selectedHistoryBooking.timelineUpdates.map((upd, idx) => (
                        <div key={upd.id || idx} className="relative">
                          <span className="w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-white absolute -left-[27px] top-1" />
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-black text-slate-900">
                                {upd.title || 'Pembaruan Status'}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400">
                                {upd.timestamp || '-'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {upd.message}
                            </p>
                            {upd.photo && (
                              <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 max-h-36">
                                <img
                                  src={upd.photo}
                                  alt={upd.title || 'Dokumentasi Lapangan'}
                                  className="w-full h-32 object-cover"
                                />
                              </div>
                            )}
                            {upd.sender && (
                              <p className="text-[10px] font-semibold text-slate-400 pt-0.5">
                                Petugas: {upd.sender} ({upd.senderRole || 'Staf BPA'})
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="relative pl-5 border-l-2 border-emerald-200 space-y-4">
                      <div className="relative">
                        <span className="w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-white absolute -left-[27px] top-1" />
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900">
                              Penyewaan Selesai & Serah Terima Kembali
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              100%
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">
                            {selectedHistoryBooking.progressStage ||
                              'Seluruh sarana telah selesai digunakan dan dikembalikan dalam kondisi baik.'}
                          </p>
                        </div>
                      </div>
                      <div className="relative">
                        <span className="w-3 h-3 rounded-full bg-uii-blue-900 ring-4 ring-white absolute -left-[27px] top-1" />
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900">
                              Formulir Pengajuan Diterima
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              {selectedHistoryBooking.createdAt || '-'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">
                            Reservasi diajukan oleh {selectedHistoryBooking.customer?.name || currentUser.name}.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  onClick={() => setSelectedHistoryBooking(null)}
                  className="py-2.5 px-5 rounded-xl bg-uii-blue-950 hover:bg-uii-blue-900 text-uii-gold text-xs font-black uppercase tracking-wider transition-colors"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
