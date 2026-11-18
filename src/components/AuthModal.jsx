import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Building,
  CheckCircle2,
  AlertCircle,
  X,
  LogIn,
  UserPlus,
  LogOut,
  ShieldCheck,
  CreditCard,
  Compass,
  ArrowRight
} from 'lucide-react';
import { adminStorage } from '../utils/adminStorage';
import { neonApi } from '../services/neonDb';
import { GoogleAuthModal } from './GoogleAuthModal';
import { triggerGoogleAuthFlow } from '../services/googleAuth';

export const AuthModal = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  onNavigateTracking
}) => {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regCategory, setRegCategory] = useState('Mahasiswa Aktif UII');
  const [regOrg, setRegOrg] = useState('');
  const [regIdentifier, setRegIdentifier] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleAuthMode, setGoogleAuthMode] = useState('login');
  const [pendingGoogleProfile, setPendingGoogleProfile] = useState(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setErrorMessage('Mohon lengkapi email dan kata sandi Anda.');
      return;
    }

    const emailVal = loginIdentifier.trim().toLowerCase();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailVal, password: loginPassword })
      });
      const data = await res.json();

      if (res.ok && data.success && data.user) {
        onLogin(data.user);
        setSuccessMessage('Berhasil masuk ke akun!');
        setTimeout(() => {
          setSuccessMessage('');
          onClose();
        }, 1200);
        return;
      }

      if (data.notRegistered || res.status === 404) {
        setRegEmail(emailVal);
        setAuthMode('register');
        setErrorMessage(
          'Akun ini belum terdaftar. Silakan isi formulir daftar (asal pemohon / masyarakat & nomor WhatsApp) terlebih dahulu.'
        );
        return;
      }

      setErrorMessage(data.error || 'Email atau kata sandi tidak sesuai.');
    } catch {
      const existingUsers = adminStorage.getUsers() || [];
      const found = existingUsers.find((u) => (u.email || '').toLowerCase() === emailVal);
      if (found) {
        onLogin({
          id: found.id,
          name: found.name,
          email: found.email,
          identifier: found.email,
          category: found.role || 'Masyarakat Umum',
          phone: found.phone,
          org: found.org || 'Masyarakat Umum (Personal)',
          loginAt: new Date().toLocaleString('id-ID')
        });
        setSuccessMessage('Berhasil masuk ke akun!');
        setTimeout(() => {
          setSuccessMessage('');
          onClose();
        }, 1200);
      } else {
        setRegEmail(emailVal);
        setAuthMode('register');
        setErrorMessage(
          'Akun ini belum terdaftar. Silakan isi formulir daftar (asal pemohon / masyarakat & nomor WhatsApp) terlebih dahulu.'
        );
      }
    }
  };

  const handleGoogleAuth = async (mode = 'login') => {
    setGoogleAuthMode(mode);
    setPendingGoogleProfile(null);
    setErrorMessage('');

    const res = await triggerGoogleAuthFlow({
      mode,
      onUserSuccess: (user) => {
        onLogin(user);
        setSuccessMessage(
          mode === 'register'
            ? 'Akun Google terdaftar dan tersimpan di Neon PostgreSQL!'
            : 'Berhasil masuk dengan Akun Google!'
        );
        setTimeout(() => {
          setSuccessMessage('');
          onClose();
        }, 1200);
      },
      onNeedsRegistration: (profile) => {
        setPendingGoogleProfile(profile);
        setIsGoogleModalOpen(true);
      },
      onUserError: (err) => {
        setErrorMessage(err);
      }
    });

    if (res === 'SHOW_CONFIG_MODAL' || res === 'SHOW_GOOGLE_MODAL') {
      setIsGoogleModalOpen(true);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword.trim()) {
      setErrorMessage('Harap isi semua kolom wajib pendaftaran.');
      return;
    }

    const cleanPhone = regPhone.replace(/[^0-9+]/g, '');
    if (cleanPhone.length < 9) {
      setErrorMessage('Mohon masukkan nomor WhatsApp aktif yang valid (minimal 9 digit angka).');
      return;
    }

    // Validasi: Selain Masyarakat Umum, asal organisasi/lembaga/jurusan wajib diisi
    const isMasyarakatUmum = regCategory === 'Masyarakat Umum';
    if (!isMasyarakatUmum && !regOrg.trim()) {
      setErrorMessage(
        regCategory === 'Organisasi / Lembaga UII'
          ? 'Mohon tuliskan nama Ormawa, UKM, atau Lembaga Anda.'
          : regCategory === 'Mahasiswa Aktif UII'
          ? 'Mohon tuliskan Fakultas dan Program Studi Anda.'
          : 'Mohon tuliskan Jurusan dan Angkatan kelulusan Anda.'
      );
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Kata sandi dan konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Anda harus menyetujui Syarat dan Ketentuan.');
      return;
    }

    const userOrg = regOrg.trim() || (isMasyarakatUmum ? 'Masyarakat Umum (Personal)' : regCategory);
    const userId = `usr-${Date.now()}`;

    const newUser = {
      id: userId,
      name: regName.trim(),
      email: regEmail.trim().toLowerCase(),
      identifier: regEmail.trim().toLowerCase(),
      category: regCategory,
      org: userOrg,
      phone: regPhone.trim(),
      authProvider: 'local',
      loginAt: new Date().toLocaleString('id-ID')
    };

    try {
      await neonApi.saveUser({
        id: userId,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.category,
        org: newUser.org,
        status: 'Aktif',
        password: regPassword
      });
    } catch (err) {
      console.warn('Neon save user warning:', err);
    }

    // Sinkronisasi data ke penyimpanan admin agar divisi sarpras langsung mengetahui jenis peminjam
    try {
      const existingUsers = adminStorage.getUsers();
      const filtered = existingUsers.filter((u) => u.email !== newUser.email);
      const newAdminEntry = {
        id: userId,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.category,
        org: newUser.org,
        status: 'Aktif',
        joinedDate: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        totalBookings: 0
      };
      adminStorage.saveUsers([newAdminEntry, ...filtered]);
    } catch (err) {
      console.warn('Sync admin user error:', err);
    }

    onLogin(newUser);
    setSuccessMessage('Pendaftaran akun berhasil! Anda otomatis masuk.');
    setTimeout(() => {
      setSuccessMessage('');
      onClose();
    }, 1200);
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
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-200 my-8 flex flex-col max-h-[90vh]"
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

            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-uii-gold text-uii-blue-950 flex items-center justify-center font-black shadow-md">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-uii-gold block">
                  Portal Autentikasi
                </span>
                <h3 className="text-xl font-black font-heading text-white">
                  {currentUser ? 'Profil Pengguna' : authMode === 'login' ? 'Masuk ke Akun' : 'Daftar Akun Baru'}
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              {currentUser 
                ? 'Kelola data reservasi aset dan riwayat pengajuan Anda' 
                : authMode === 'login'
                ? 'Masukkan email dan kata sandi Anda untuk melanjutkan.'
                : 'Lengkapi formulir di bawah ini untuk membuat akun baru.'}
            </p>

            {/* TAB SELECTOR JIKA BELUM LOGIN */}
            {!currentUser && (
              <div className="mt-5 grid grid-cols-2 p-1 rounded-2xl bg-black/30 border border-white/10 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setErrorMessage(''); }}
                  className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                    authMode === 'login'
                      ? 'bg-uii-gold text-uii-blue-950 shadow-md font-black'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Masuk ke Akun</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setErrorMessage(''); }}
                  className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                    authMode === 'register'
                      ? 'bg-uii-gold text-uii-blue-950 shadow-md font-black'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Daftar Akun Baru</span>
                </button>
              </div>
            )}
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            
            {/* Feedback Alerts */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* ======================================================== */}
            {/* 1. TAMPILAN JIKA USER SUDAH LOGIN (PROFIL PENGGUNA) */}
            {/* ======================================================== */}
            {currentUser ? (
              <div className="space-y-5">
                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-uii-blue-950 to-uii-blue-900 text-uii-gold flex items-center justify-center text-xl font-black shadow-md border-2 border-uii-gold">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-black uppercase tracking-wider inline-block mb-1">
                      {currentUser.category || 'Pengguna Terdaftar'}
                    </span>
                    <h4 className="text-base font-black text-uii-blue-950 truncate font-heading">
                      {currentUser.name}
                    </h4>
                    <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{currentUser.org || 'Penyewa Terdaftar BPA'}</p>
                  </div>
                </div>

                {/* Detail Identitas */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-white border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">ID Akun</span>
                    <span className="font-extrabold text-slate-800 truncate block">{currentUser.identifier || currentUser.email || '-'}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">No. WhatsApp</span>
                    <span className="font-extrabold text-slate-800">{currentUser.phone || '-'}</span>
                  </div>
                </div>

                {/* Akses Cepat ke Pelacakan Sewa */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-950 font-heading">
                      Status Sewa Aset Terakhir
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-amber-950 px-2 py-0.5 rounded-md">
                      Terhubung
                    </span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    Pantau progres kesiapan fasilitas kampus secara langsung di portal pelacakan BPA KM UII.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      if (onNavigateTracking) onNavigateTracking();
                    }}
                    className="w-full mt-2 py-2 px-3.5 rounded-xl bg-uii-blue-950 hover:bg-uii-blue-900 text-uii-gold text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all shadow-sm"
                  >
                    <Compass className="w-3.5 h-3.5 text-uii-gold" />
                    <span>Buka Portal Pelacakan Progres</span>
                  </button>
                </div>

                {/* Tombol Logout */}
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs uppercase tracking-wider border border-rose-200 flex items-center justify-center space-x-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar dari Akun (Logout)</span>
                </button>
              </div>
            ) : authMode === 'login' ? (
              /* ======================================================== */
              /* 2. FORM LOGIN (MASUK) */
              /* ======================================================== */
              <div className="space-y-4">
                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email:
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="nama@gmail.com"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Kata Sandi:
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Masukkan kata sandi akun Anda"
                        className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center space-x-2 cursor-pointer text-slate-600">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 text-uii-blue-900 focus:ring-uii-gold"
                      />
                      <span>Ingat Saya</span>
                    </label>
                    <a href="#" onClick={(e) => { e.preventDefault(); alert('Silakan hubungi admin BPA via WhatsApp di +6285233475595 untuk pemulihan akun.'); }} className="text-uii-blue-900 font-bold hover:underline">
                      Lupa sandi?
                    </a>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-2xl bg-uii-blue-950 hover:bg-uii-blue-900 text-uii-gold font-black text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Masuk ke Akun</span>
                  </button>

                  {/* LOGIN CEPAT GOOGLE */}
                  <div className="pt-2">
                    <div className="relative my-3 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                      </div>
                      <div className="relative bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Atau Masuk Dengan
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleGoogleAuth('login')}
                      className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs shadow-2xs hover:shadow-sm transition-all flex items-center justify-center space-x-3 group"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span className="text-slate-700 font-bold group-hover:text-uii-blue-950 transition-colors">
                        Masuk dengan Google
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* ======================================================== */
              /* 3. FORM REGISTER (DAFTAR AKUN BARU) */
              /* ======================================================== */
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nama Lengkap: *
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Contoh: Muhammad Fathir Al-Ghifari"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-900"
                  />
                </div>

                {/* JENIS AKUN & ASAL PENDAFTAR */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Jenis Akun / Asal: *
                    </label>
                    <select
                      value={regCategory}
                      onChange={(e) => setRegCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-900 cursor-pointer"
                    >
                      <option value="Mahasiswa Aktif UII">Mahasiswa Aktif UII</option>
                      <option value="Organisasi / Lembaga UII">Organisasi / Lembaga UII</option>
                      <option value="Alumni UII">Alumni UII</option>
                      <option value="Masyarakat Umum">Masyarakat Umum</option>
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Status identitas pemohon.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 truncate">
                      {regCategory === 'Masyarakat Umum' ? (
                        <span>Instansi <span className="text-slate-400 font-normal lowercase">(opsional)</span>:</span>
                      ) : (
                        <span>Asal {regCategory === 'Organisasi / Lembaga UII' ? 'Ormawa' : regCategory === 'Mahasiswa Aktif UII' ? 'Prodi' : 'Angkatan'}: *</span>
                      )}
                    </label>
                    <input
                      type="text"
                      required={regCategory !== 'Masyarakat Umum'}
                      value={regOrg}
                      onChange={(e) => setRegOrg(e.target.value)}
                      placeholder={
                        regCategory === 'Organisasi / Lembaga UII'
                          ? 'Contoh: BEM / UKM'
                          : regCategory === 'Mahasiswa Aktif UII'
                          ? 'Contoh: Informatika'
                          : regCategory === 'Alumni UII'
                          ? 'Contoh: Alumni 2020'
                          : 'Boleh kosong / nama EO'
                      }
                      className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-900 ${
                        regCategory === 'Masyarakat Umum'
                          ? 'bg-slate-50 border-slate-200'
                          : 'bg-amber-50/40 border-amber-300'
                      }`}
                    />
                    <p className="text-[10px] mt-1 leading-snug">
                      {regCategory === 'Masyarakat Umum' ? (
                        <span className="text-slate-400">Opsional: Boleh kosong untuk personal.</span>
                      ) : (
                        <span className="text-amber-700 font-semibold">* Wajib diisi.</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Email: *
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="nama@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      No. WhatsApp Aktif: *
                    </label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="081234567890"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Kata Sandi: *
                    </label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Konfirmasi Sandi: *
                    </label>
                    <input
                      type="password"
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Ulangi kata sandi"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-900"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-start space-x-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-uii-blue-900 focus:ring-uii-gold"
                    />
                    <span className="leading-snug">
                      Saya menyetujui Syarat & Ketentuan serta Kebijakan Privasi yang berlaku.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-2xl bg-uii-blue-950 hover:bg-uii-blue-900 text-uii-gold font-black text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 mt-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Daftar Akun</span>
                </button>

                {/* REGISTER CEPAT GOOGLE */}
                <div className="pt-1">
                  <div className="relative my-3 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Atau Daftar Dengan
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGoogleAuth('register')}
                    className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs shadow-2xs hover:shadow-sm transition-all flex items-center justify-center space-x-3 group"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span className="text-slate-700 font-bold group-hover:text-uii-blue-950 transition-colors">
                      Daftar dengan Google
                    </span>
                  </button>
                </div>
              </form>
            )}

          </div>

          {/* Footer note */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Layanan Reservasi & Akun Terpadu</span>
            </span>
            <button
              onClick={onClose}
              className="text-slate-600 hover:text-slate-900 font-bold"
            >
              Tutup
            </button>
          </div>

        </motion.div>
      </div>

      {/* Modal Google Auth Terhubung Neon PostgreSQL */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => {
          setIsGoogleModalOpen(false);
          setPendingGoogleProfile(null);
        }}
        mode={googleAuthMode}
        initialPendingProfile={pendingGoogleProfile}
        onUserSuccess={(user) => {
          onLogin(user);
          setSuccessMessage(
            googleAuthMode === 'register'
              ? 'Akun Google berhasil terdaftar & tersimpan di Neon PostgreSQL!'
              : 'Berhasil masuk dengan Akun Google!'
          );
          setTimeout(() => {
            setSuccessMessage('');
            onClose();
          }, 1200);
        }}
      />
    </AnimatePresence>
  );
};

