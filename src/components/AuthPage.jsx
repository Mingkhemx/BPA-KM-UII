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
  LogIn,
  UserPlus,
  LogOut,
  ShieldCheck,
  Compass,
  ArrowRight,
  Sparkles,
  Layers,
  Package,
  Calendar,
  CalendarCheck,
  ShoppingBag,
  Clock,
  MapPin
} from 'lucide-react';
import { adminStorage } from '../utils/adminStorage';
import { GoogleAuthModal } from './GoogleAuthModal';
import { triggerGoogleAuthFlow } from '../services/googleAuth';

export const AuthPage = ({
  onBackHome,
  onNavigateSewa,
  onNavigateTracking,
  currentUser,
  onLogin,
  onLogout,
  initialMode = 'login'
}) => {
  const [authMode, setAuthMode] = useState(initialMode); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    if (initialMode) {
      setAuthMode(initialMode);
    }
  }, [initialMode]);

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

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setErrorMessage('Mohon lengkapi email dan kata sandi Anda.');
      return;
    }

    const emailVal = loginIdentifier.trim();
    const displayName = emailVal.includes('@') ? emailVal.split('@')[0] : emailVal;

    const userData = {
      name: displayName,
      email: emailVal,
      identifier: emailVal,
      category: 'Pengguna',
      phone: '081234567890',
      org: 'Penyewa BPA',
      loginAt: new Date().toLocaleString('id-ID')
    };

    onLogin(userData);
    setSuccessMessage('Berhasil masuk ke akun!');
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleAuthMode, setGoogleAuthMode] = useState('login');

  const handleGoogleAuth = async (mode = 'login') => {
    setGoogleAuthMode(mode);
    setErrorMessage('');

    const res = await triggerGoogleAuthFlow({
      mode,
      onUserSuccess: (user) => {
        onLogin(user);
        setSuccessMessage(
          mode === 'register'
            ? 'Pendaftaran akun dengan Google berhasil & tersimpan ke Neon PostgreSQL!'
            : 'Berhasil masuk dengan Akun Google!'
        );
        setTimeout(() => setSuccessMessage(''), 3000);
      },
      onUserError: (err) => {
        setErrorMessage(err);
      }
    });

    if (res === 'SHOW_CONFIG_MODAL' || res === 'SHOW_GOOGLE_MODAL') {
      setIsGoogleModalOpen(true);
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword.trim()) {
      setErrorMessage('Harap isi semua kolom wajib pendaftaran.');
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

    const newUser = {
      name: regName.trim(),
      email: regEmail.trim(),
      identifier: regEmail.trim(),
      category: regCategory,
      org: userOrg,
      phone: regPhone.trim(),
      loginAt: new Date().toLocaleString('id-ID')
    };

    // Sinkronisasi data ke penyimpanan admin agar divisi sarpras langsung mengetahui jenis peminjam
    try {
      const existingUsers = adminStorage.getUsers();
      const newAdminEntry = {
        id: `usr-${Date.now()}`,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.category,
        org: newUser.org,
        status: 'Aktif',
        joinedDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        totalBookings: 0
      };
      adminStorage.saveUsers([newAdminEntry, ...existingUsers]);
    } catch (err) {
      console.warn('Sync admin user error:', err);
    }

    onLogin(newUser);
    setSuccessMessage('Pendaftaran akun berhasil! Anda otomatis masuk.');
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 sm:pt-28 pb-20 selection:bg-uii-blue-900 selection:text-uii-gold">
      
      {/* Toast Notifikasi */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-2xl bg-uii-blue-950 text-uii-gold border border-uii-gold/40 shadow-2xl text-xs sm:text-sm font-bold flex items-center space-x-2"
          >
            <CheckCircle2 className="w-5 h-5 text-uii-gold" />
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* MAIN CONTAINER: DUA KOLOM BESAR (BRANDING & FORMULIR) */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
          {/* KOLOM KIRI (5/12): VISUAL ATMOSFER & IDENTITAS RESMI */}
          <div className="relative lg:col-span-5 bg-[#06152b] text-white p-8 sm:p-10 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-200/10">
            {/* Background Venue Photography with Vignette & Gradient */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105 pointer-events-none"
              style={{ backgroundImage: "url('/images/produk/detail/scc-wide.jpg')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06152b] via-[#06152b]/85 to-[#06152b]/65 pointer-events-none" />

            {/* Header: Logo Resmi */}
            <div className="relative z-10 pb-6 border-b border-white/10">
              <img
                src="/images/logo/logo.png"
                alt="Logo BPA KM UII"
                className="h-12 w-auto object-contain drop-shadow"
              />
            </div>

            {/* Editorial Feature (Humanist & Dignified, Non-AI-Slop) */}
            <div className="relative z-10 my-auto py-10 space-y-4">
              <div className="w-12 h-1 bg-uii-gold rounded-full mb-6" />
              <span className="text-[11px] font-bold text-uii-gold uppercase tracking-widest block">
                Fasilitas & Sarana Kampus
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-heading leading-tight tracking-tight">
                Student Convention Center
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-sm font-normal">
                Pusat sarana representatif dan fasilitas penunjang agenda resmi, musyawarah kemahasiswaan, seminar nasional, serta pagelaran karya di lingkungan Universitas Islam Indonesia.
              </p>
            </div>

            {/* Footer Kolom Kiri: Lokasi Kampus */}
            <div className="relative z-10 pt-6 border-t border-white/10 space-y-2 text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-uii-gold flex-shrink-0" />
                <span className="font-medium text-slate-200">Gedung SCC Lantai 1, Kampus Terpadu UII</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Yogyakarta, Indonesia</span>
                <span className="text-uii-gold font-semibold">Layanan Terpadu BPA</span>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN (7/12): KONTEN UTAMA (PROFIL / LOGIN / REGISTER) */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white">
            
            {/* JIKA SUDAH LOGIN: TAMPILKAN DASHBOARD PROFIL */}
            {currentUser ? (
              <div className="space-y-6 max-w-lg mx-auto w-full">
                <div className="flex items-center space-x-4 pb-6 border-b border-slate-100">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-uii-blue-950 to-uii-blue-900 text-uii-gold flex items-center justify-center text-2xl font-black shadow-lg border-2 border-uii-gold flex-shrink-0">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-black uppercase tracking-wider inline-block mb-1">
                      {currentUser.category || 'Pengguna Terdaftar'}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-uii-blue-950 truncate font-heading">
                      {currentUser.name}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{currentUser.org || 'Penyewa Terdaftar BPA'}</p>
                  </div>
                </div>

                {/* Detail Identitas */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">ID Akun:</span>
                    <span className="font-extrabold text-slate-800 text-sm truncate block">{currentUser.identifier || currentUser.email || '-'}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">No. WhatsApp:</span>
                    <span className="font-extrabold text-slate-800 text-sm">{currentUser.phone || '-'}</span>
                  </div>
                </div>

                {/* Aksi Cepat Pengguna */}
                <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-amber-950 font-heading">
                      Layanan Reservasi & Pelacakan Aset
                    </h4>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-amber-950 px-2 py-0.5 rounded-md">
                      Aktif
                    </span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    Ajukan sewa aset baru atau pantau perkembangan persiapan sarana acara Anda secara real-time.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <button
                      onClick={onNavigateSewa}
                      className="py-3 px-4 rounded-2xl bg-uii-gold hover:bg-yellow-400 text-uii-blue-950 text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all shadow-sm"
                    >
                      <Package className="w-4 h-4" />
                      <span>Ajukan Sewa Aset</span>
                    </button>

                    <button
                      onClick={() => onNavigateTracking && onNavigateTracking()}
                      className="py-3 px-4 rounded-2xl bg-uii-blue-950 hover:bg-uii-blue-900 text-uii-gold text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all shadow-sm"
                    >
                      <Compass className="w-4 h-4 text-uii-gold" />
                      <span>Lacak Progres Sewa</span>
                    </button>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  className="w-full py-3.5 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs uppercase tracking-wider border border-rose-200 flex items-center justify-center space-x-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar dari Akun (Logout)</span>
                </button>
              </div>
            ) : (
              /* ======================================================== */
              /* BELUM LOGIN: FORM MASUK ATAU FORM DAFTAR */
              /* ======================================================== */
              <div className="max-w-md mx-auto w-full space-y-5">
                
                {/* Header Formulir */}
                <div>
                  <h3 className="text-xl font-black text-uii-blue-950 font-heading">
                    {authMode === 'login' ? 'Masuk ke Akun' : 'Daftar Akun Baru'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {authMode === 'login'
                      ? 'Masukkan email dan kata sandi Anda untuk melanjutkan.'
                      : 'Lengkapi formulir di bawah ini untuk membuat akun baru.'}
                  </p>
                </div>

                {/* TAB SWITCHER BESAR */}
                <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setErrorMessage(''); }}
                    className={`py-3 rounded-xl transition-all flex items-center justify-center space-x-2 ${
                      authMode === 'login'
                        ? 'bg-uii-blue-950 text-uii-gold shadow-md font-black'
                        : 'text-slate-600 hover:text-uii-blue-950'
                    }`}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Masuk ke Akun</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register'); setErrorMessage(''); }}
                    className={`py-3 rounded-xl transition-all flex items-center justify-center space-x-2 ${
                      authMode === 'register'
                        ? 'bg-uii-blue-950 text-uii-gold shadow-md font-black'
                        : 'text-slate-600 hover:text-uii-blue-950'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Daftar Akun Baru</span>
                  </button>
                </div>

                {/* ALERTS */}
                {errorMessage && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {authMode === 'login' ? (
                  /* FORMULIR LOGIN */
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Email:
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          placeholder="nama@gmail.com"
                          className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-900 shadow-2xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Kata Sandi:
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Masukkan kata sandi akun"
                          className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-900 shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                        <span>Ingat saya di perangkat ini</span>
                      </label>
                      <a href="#" onClick={(e) => { e.preventDefault(); alert('Silakan hubungi WhatsApp resmi BPA KM UII di +6285233475595 untuk bantuan pemulihan akun.'); }} className="text-uii-blue-900 font-bold hover:underline">
                        Lupa sandi?
                      </a>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 px-4 rounded-2xl bg-uii-blue-950 hover:bg-uii-blue-900 text-uii-gold font-black text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-xl flex items-center justify-center space-x-2"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Masuk ke Akun</span>
                    </button>

                    {/* LOGIN CEPAT GOOGLE */}
                    <div className="pt-2">
                      <div className="relative my-4 flex items-center justify-center">
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
                        className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs shadow-2xs hover:shadow-sm transition-all flex items-center justify-center space-x-3 group"
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
                ) : (
                  /* FORMULIR REGISTER */
                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
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
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-900 shadow-2xs"
                      />
                    </div>

                    {/* JENIS AKUN & ASAL PENDAFTAR */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Jenis Akun / Asal: *
                        </label>
                        <select
                          value={regCategory}
                          onChange={(e) => setRegCategory(e.target.value)}
                          className="w-full px-3.5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-900 shadow-2xs cursor-pointer"
                        >
                          <option value="Mahasiswa Aktif UII">Mahasiswa Aktif UII</option>
                          <option value="Organisasi / Lembaga UII">Organisasi / Lembaga UII</option>
                          <option value="Alumni UII">Alumni UII</option>
                          <option value="Masyarakat Umum">Masyarakat Umum</option>
                        </select>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Pilih kategori identitas pemohon sewa.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          {regCategory === 'Masyarakat Umum' ? (
                            <span>Instansi / Lembaga <span className="text-slate-400 font-normal lowercase">(opsional)</span>:</span>
                          ) : (
                            <span>Asal {regCategory === 'Organisasi / Lembaga UII' ? 'Ormawa / Lembaga' : regCategory === 'Mahasiswa Aktif UII' ? 'Fakultas / Prodi' : 'Jurusan & Angkatan'}: *</span>
                          )}
                        </label>
                        <input
                          type="text"
                          required={regCategory !== 'Masyarakat Umum'}
                          value={regOrg}
                          onChange={(e) => setRegOrg(e.target.value)}
                          placeholder={
                            regCategory === 'Organisasi / Lembaga UII'
                              ? 'Contoh: BEM FTI / DEMA / UKM'
                              : regCategory === 'Mahasiswa Aktif UII'
                              ? 'Contoh: Informatika FTI UII'
                              : regCategory === 'Alumni UII'
                              ? 'Contoh: Alumni Arsitektur 2020'
                              : 'Boleh kosong jika sewa personal / nama EO'
                          }
                          className={`w-full px-4 py-3 rounded-2xl border text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-900 shadow-2xs ${
                            regCategory === 'Masyarakat Umum'
                              ? 'bg-slate-50 border-slate-200'
                              : 'bg-amber-50/40 border-amber-300'
                          }`}
                        />
                        <p className="text-[10px] mt-1 leading-snug">
                          {regCategory === 'Masyarakat Umum' ? (
                            <span className="text-slate-400">Opsional: Boleh dikosongkan jika menyewa atas nama pribadi/personal.</span>
                          ) : regCategory === 'Organisasi / Lembaga UII' ? (
                            <span className="text-amber-700 font-semibold">* Wajib: Tuliskan nama ormawa, UKM, atau kepanitiaan resmi Anda.</span>
                          ) : regCategory === 'Mahasiswa Aktif UII' ? (
                            <span className="text-amber-700 font-semibold">* Wajib: Tuliskan Fakultas dan Program Studi Anda.</span>
                          ) : (
                            <span className="text-amber-700 font-semibold">* Wajib: Tuliskan Program Studi dan tahun kelulusan Anda.</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                          className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-900 shadow-2xs"
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
                          className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-900 shadow-2xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                          className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-900 shadow-2xs"
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
                          className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-900 shadow-2xs"
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
                      className="w-full py-4 px-4 rounded-2xl bg-uii-blue-950 hover:bg-uii-blue-900 text-uii-gold font-black text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-xl flex items-center justify-center space-x-2 mt-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Daftar Akun</span>
                    </button>

                    {/* REGISTER CEPAT GOOGLE */}
                    <div className="pt-2">
                      <div className="relative my-4 flex items-center justify-center">
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
                        className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs shadow-2xs hover:shadow-sm transition-all flex items-center justify-center space-x-3 group"
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
            )}

          </div>

        </div>

      </div>

      {/* Modal Autentikasi Google Terintegrasi Neon PostgreSQL */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        mode={googleAuthMode}
        onUserSuccess={(user) => {
          onLogin(user);
          setSuccessMessage(
            googleAuthMode === 'register'
              ? 'Akun Google berhasil terdaftar & tersimpan di Neon PostgreSQL!'
              : 'Berhasil masuk dengan Akun Google!'
          );
          setTimeout(() => setSuccessMessage(''), 3000);
        }}
      />
    </div>
  );
};
