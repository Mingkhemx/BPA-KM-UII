import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  PackageCheck,
  BarChart3,
  DollarSign,
  LogOut,
  ExternalLink,
  Menu,
  X,
  User,
  CheckCircle2,
  Sparkles,
  Loader2,
  Edit3,
  ChevronRight
} from 'lucide-react';
import { AssetOrdersTab } from './tabs/AssetOrdersTab';
import { RentalReportsTab } from './tabs/RentalReportsTab';
import { RentalRevenueTab } from './tabs/RentalRevenueTab';
import { EditProfileModal } from './EditProfileModal';
import { adminStorage } from '../../utils/adminStorage';
import { neonApi } from '../../services/neonDb';
import { triggerGoogleAuthFlow, getGoogleClientId } from '../../services/googleAuth';

export const StaffLoginPage = ({ onLoginSuccess, onBackToSite }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Google Staff Sign-In modal state
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  // First-time Staff Onboarding Modal state (isi nama saja)
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [onboardingStaffTarget, setOnboardingStaffTarget] = useState(null);
  const [onboardingName, setOnboardingName] = useState('');
  const [onboardingError, setOnboardingError] = useState('');
  const [savingOnboarding, setSavingOnboarding] = useState(false);

  // Available staff accounts for Google quick select in modal
  const [availableStaffUsers, setAvailableStaffUsers] = useState([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const neonUsers = await neonApi.getUsers();
        if (Array.isArray(neonUsers) && neonUsers.length > 0) {
          const staffOnly = neonUsers.filter((u) => {
            const role = String(u.role || u.category || '').toLowerCase();
            return role.includes('staf') || role.includes('staff');
          });
          setAvailableStaffUsers(staffOnly);
          return;
        }
      } catch {}
      const localUsers = adminStorage.getUsers() || [];
      const staffOnly = localUsers.filter((u) => {
        const role = String(u.role || u.category || '').toLowerCase();
        return role.includes('staf') || role.includes('staff');
      });
      setAvailableStaffUsers(staffOnly);
    };
    loadUsers();
  }, [isGoogleModalOpen]);

  // Core verification function for both Google and Email/Password login
  const processStaffVerification = async (account, loginMethod = 'password') => {
    setErrorMsg('');
    setLoading(true);

    const cleanEmail = (account.email || '').trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('Mohon masukkan email yang valid.');
      setLoading(false);
      return;
    }

    try {
      // 1. Ambil data pengguna terbaru dari Neon DB & local cache
      let allUsers = [];
      try {
        const neonUsers = await neonApi.getUsers();
        if (Array.isArray(neonUsers) && neonUsers.length > 0) {
          allUsers = neonUsers;
        }
      } catch (e) {
        console.warn('Gagal fetch users dari neon:', e);
      }

      if (allUsers.length === 0) {
        allUsers = adminStorage.getUsers() || [];
      }

      let matched = allUsers.find(
        (u) => (u.email || '').trim().toLowerCase() === cleanEmail
      );

      // Fallback: jika belum ada di cache/list, panggil endpoint langsung
      if (!matched) {
        try {
          const checkRes = await fetch(`/api/auth/check?email=${encodeURIComponent(cleanEmail)}`);
          if (checkRes.ok) {
            const checkData = await checkRes.json();
            if (checkData.exists && checkData.user) {
              matched = checkData.user;
            }
          }
        } catch (fetchErr) {
          console.warn('Direct check fallback warning:', fetchErr);
        }
      }

      // KASUS 1: Akun belum terdaftar di sistem sama sekali
      if (!matched) {
        setErrorMsg(
          `Akses Ditolak: Akun (${account.email}) belum terdaftar di sistem. Anda harus didaftarkan dan diberikan role Staf Operasional terlebih dahulu oleh Admin di Panel Admin.`
        );
        setLoading(false);
        return;
      }

      // KASUS 2: Akun berstatus Nonaktif
      if (matched.status === 'Nonaktif') {
        setErrorMsg(
          `Akses Ditolak: Akun staf Anda (${matched.email}) sedang dinonaktifkan oleh Administrator.`
        );
        setLoading(false);
        return;
      }

      // KASUS 3: Akun terdaftar tetapi role BUKAN Staf
      const roleStr = String(matched.role || matched.category || '').toLowerCase();
      const isStaff = roleStr.includes('staf') || roleStr.includes('staff');
      if (!isStaff) {
        setErrorMsg(
          `Akses Ditolak: Akun (${account.email}) hanya memiliki akses sebagai "${matched.role || matched.category || 'Penyewa'}", bukan Staf Operasional. Hubungi Administrator di Panel Admin untuk memberikan hak akses Staf.`
        );
        setLoading(false);
        return;
      }

      // KASUS 3B: Penanganan Metode Masuk
      const isGoogleRegistered =
        matched.authProvider === 'google' ||
        matched.auth_provider === 'google' ||
        Boolean(matched.googleId) ||
        Boolean(matched.google_id) ||
        String(matched.id || '').startsWith('google-');

      // Jika login via password tapi akun merupakan Google murni tanpa password lokal
      if (loginMethod === 'password') {
        if (isGoogleRegistered && !matched.password) {
          setErrorMsg(
            `Akun staf (${account.email}) terdaftar menggunakan Akun Google di website utama. Silakan masuk menggunakan tombol "Masuk dengan Akun Google" di bawah.`
          );
          setLoading(false);
          return;
        }
      }

      // Jika login via Google: pastikan provider tersinkronisasi sebagai google
      if (loginMethod === 'google') {
        if (matched.authProvider !== 'google') {
          neonApi.updateUserStatus(matched.id || matched.email, { auth_provider: 'google' }).catch(() => {});
        }
      }

      // KASUS 4: Akun adalah Staf yang sah! Cek apakah pertama kali (butuh Onboarding Nama Saja)
      const needsOnboarding = !matched.staffOnboarded && !matched.staff_onboarded;

      if (needsOnboarding) {
        setIsGoogleModalOpen(false);
        setOnboardingStaffTarget({
          ...matched,
          googlePicture: account.picture || matched.googlePicture || matched.picture
        });
        setOnboardingName(matched.name || account.name || '');
        setOnboardingError('');
        setIsOnboardingModalOpen(true);
        setLoading(false);
        return;
      }

      // KASUS 5: Staf yang sudah pernah onboard -> Langsung masuk
      setIsGoogleModalOpen(false);
      const staffUser = {
        id: matched.id,
        name: matched.name,
        role: matched.role || matched.category || 'Staf Operasional BPA',
        email: matched.email,
        division: matched.org || 'Divisi Operasional & Logistik BPA KM UII',
        picture: account.picture || matched.picture || matched.googlePicture,
        loginTime: new Date().toLocaleString('id-ID')
      };
      onLoginSuccess(staffUser);
      setLoading(false);
    } catch (err) {
      console.error('Staff verification error:', err);
      setErrorMsg('Terjadi kesalahan verifikasi staf: ' + err.message);
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password.trim()) {
      setErrorMsg('Mohon masukkan email staf dan kata sandi.');
      return;
    }
    processStaffVerification({ email: cleanEmail }, 'password');
  };

  const handleGoogleSignInClick = async () => {
    setErrorMsg('');
    const clientId = getGoogleClientId();
    const isRealClientId =
      clientId &&
      !clientId.includes('your-google-client-id') &&
      clientId.includes('.apps.googleusercontent.com');

    if (window.google?.accounts?.oauth2 && isRealClientId) {
      setLoading(true);
      await triggerGoogleAuthFlow({
        mode: 'login',
        onUserSuccess: (user) => {
          processStaffVerification(user, 'google');
        },
        onNeedsRegistration: (profile) => {
          processStaffVerification(profile, 'google');
        },
        onUserError: (err) => {
          setLoading(false);
          setErrorMsg(err);
        }
      });
      return;
    }

    // Buka modal pemilih akun Google khusus Staf
    setIsGoogleModalOpen(true);
  };

  const handleSelectGoogleStaff = (acc) => {
    processStaffVerification(acc, 'google');
  };

  const handleCustomGoogleStaffSubmit = (e) => {
    e.preventDefault();
    if (!customGoogleEmail.trim()) {
      setErrorMsg('Masukkan email Google staf.');
      return;
    }
    processStaffVerification({
      email: customGoogleEmail.trim(),
      name: customGoogleName.trim()
    }, 'google');
  };

  const handleSaveOnboarding = async (e) => {
    e.preventDefault();
    if (!onboardingName.trim()) {
      setOnboardingError('Nama lengkap staf resmi wajib diisi!');
      return;
    }

    setSavingOnboarding(true);
    setOnboardingError('');

    try {
      const finalName = onboardingName.trim();
      const targetId = onboardingStaffTarget?.id || onboardingStaffTarget?.email;

      // 1. Simpan perubahan ke Neon Database (set staff_onboarded = true dan name)
      await neonApi.updateUserStatus(targetId, {
        name: finalName,
        staff_onboarded: true
      });

      // 2. Simpan perubahan ke local storage adminStorage
      const localUsers = adminStorage.getUsers() || [];
      const updatedLocal = localUsers.map((u) => {
        if (
          (u.email || '').toLowerCase() === (onboardingStaffTarget.email || '').toLowerCase() ||
          u.id === targetId
        ) {
          return {
            ...u,
            name: finalName,
            staffOnboarded: true,
            staff_onboarded: true
          };
        }
        return u;
      });
      adminStorage.saveUsers(updatedLocal);

      // 3. Masuk ke Dashboard Staf dengan nama baru
      const staffUser = {
        name: finalName,
        role: onboardingStaffTarget.role || 'Staf Operasional BPA',
        email: onboardingStaffTarget.email,
        division: onboardingStaffTarget.org || 'Divisi Operasional & Logistik BPA KM UII',
        picture: onboardingStaffTarget.googlePicture || onboardingStaffTarget.picture,
        loginTime: new Date().toLocaleString('id-ID')
      };

      setIsOnboardingModalOpen(false);
      onLoginSuccess(staffUser);
    } catch (err) {
      console.error('Save staff onboarding error:', err);
      setOnboardingError('Gagal menyimpan nama ke sistem. Silakan coba lagi.');
    } finally {
      setSavingOnboarding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07172f] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-uii-gold selection:text-uii-blue-950">
      <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-uii-blue-900/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-uii-gold/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md mb-4 flex justify-between items-center relative z-10">
        <button
          onClick={onBackToSite}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-300 hover:text-uii-gold transition-colors py-1.5 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Website Utama</span>
        </button>

        <span className="text-[11px] font-bold text-uii-gold tracking-wider">
          PORTAL OPERASIONAL
        </span>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative z-10 text-slate-800">
        {/* Header Biru UII dengan Logo Resmi (Tanpa Card Putih) */}
        <div className="bg-[#0c1f38] px-7 py-7 text-center relative border-b-2 border-uii-gold/30">
          <div className="w-20 h-20 mx-auto mb-2 flex items-center justify-center">
            <img
              src="/images/logo/Logo-BPA-KM-UII-removebg.png"
              alt="Logo BPA KM UII"
              className="h-full w-full object-contain filter drop-shadow-md"
              onError={(e) => {
                if (!e.currentTarget.dataset.retried) {
                  e.currentTarget.dataset.retried = 'true';
                  e.currentTarget.src = '/images/logo/logo.png';
                }
              }}
            />
          </div>
          <h2 className="text-xl font-black text-white font-heading tracking-wide">
            PANEL STAF & APPROVAL
          </h2>
          <p className="text-xs text-uii-gold font-bold tracking-wider uppercase mt-1">
            Divisi Operasional & Sarpras BPA KM UII
          </p>
          <p className="text-[11px] text-slate-300 mt-1 max-w-xs mx-auto">
            Akses Khusus Approval Jadwal, Cek Pesanan Aset & Upload Perkembangan
          </p>
        </div>

        <div className="p-7 sm:p-8 space-y-5 bg-white">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Akun / ID Staf Operasional:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ID Akun atau Email Staf..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-900 focus:bg-white"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-900 focus:bg-white"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-uii-blue-950 hover:bg-uii-blue-900 text-uii-gold font-black text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4 text-uii-gold" />
              <span>{loading ? 'Memverifikasi...' : 'Masuk ke Panel Staf'}</span>
            </button>
          </form>

          {/* Tombol Masuk dengan Akun Google */}
          <div className="pt-1">
            <div className="relative my-3 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Atau Masuk Melalui
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignInClick}
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 text-slate-800 font-extrabold text-xs transition-all shadow-2xs hover:shadow-sm flex items-center justify-center space-x-3 group disabled:opacity-50"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span className="group-hover:text-uii-blue-950 transition-colors">
                Masuk dengan Akun Google
              </span>
            </button>
          </div>

          {/* Tips Panduan Metode Masuk Sesuai Registrasi Awal */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 text-xs space-y-2">
            <div className="flex items-center space-x-2 text-amber-950 font-black text-[11px] uppercase tracking-wider">
              <span className="text-sm">💡</span>
              <span>Tips Metode Masuk Portal Staf:</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-amber-900/90 leading-relaxed list-disc list-inside">
              <li>
                <span className="font-bold text-amber-950">Daftar lewat Google di Web Utama:</span> Masuk wajib menggunakan tombol <span className="font-bold text-uii-blue-950">"Masuk dengan Akun Google"</span>.
              </li>
              <li>
                <span className="font-bold text-amber-950">Daftar mandiri di Web Utama:</span> Jika saat di web utama membuat akun sendiri (Email & Sandi), masuk menggunakan formulir <span className="font-bold text-uii-blue-950">Email & Kata Sandi</span> di atas.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL PEMILIH / LOGIN AKUN GOOGLE UNTUK STAF */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isGoogleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGoogleModalOpen(false)}
              className="fixed inset-0 bg-uii-blue-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 text-slate-800"
            >
              {/* Header Modal */}
              <div className="p-5 bg-gradient-to-r from-uii-blue-950 via-[#0c1f38] to-uii-blue-950 text-white flex items-center justify-between border-b-2 border-uii-gold/40">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white p-1 flex items-center justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white font-heading">
                      Masuk dengan Akun Google
                    </h3>
                    <p className="text-[10px] text-uii-gold font-bold uppercase tracking-wider">
                      Portal Khusus Staf BPA UII
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGoogleModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px] leading-relaxed">
                  <span className="font-bold block text-blue-950 mb-0.5">Ketentuan Akses Staf:</span>
                  Hanya akun Google yang telah didaftarkan dan diberikan <span className="font-black text-uii-blue-950">Role Staf Operasional</span> oleh Administrator di Panel Admin yang diizinkan masuk.
                </div>

                {/* Daftar Akun Staf Terdaftar jika ada */}
                {availableStaffUsers.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      Pilih Akun Staf Terdaftar:
                    </span>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {availableStaffUsers.map((staf) => (
                        <button
                          key={staf.id || staf.email}
                          type="button"
                          onClick={() => handleSelectGoogleStaff(staf)}
                          className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200 hover:border-amber-300 text-left transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-uii-blue-950 text-uii-gold font-black text-xs flex items-center justify-center flex-shrink-0">
                              {staf.name ? staf.name.charAt(0).toUpperCase() : 'S'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs font-bold text-slate-800 block truncate group-hover:text-uii-blue-950">
                                {staf.name}
                              </span>
                              <span className="text-[10px] text-slate-500 block truncate font-mono">
                                {staf.email}
                              </span>
                            </div>
                          </div>
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 ml-2 flex-shrink-0">
                            Staf
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Form Input Akun Google Kustom / Manual */}
                <form onSubmit={handleCustomGoogleStaffSubmit} className="pt-2 space-y-3">
                  <div className="relative my-2 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative bg-white px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Atau Masukkan Email Google
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Email Akun Google Staf:
                    </label>
                    <input
                      type="email"
                      required
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      placeholder="nama.staf@uii.ac.id atau nama@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-950"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-uii-blue-950 hover:bg-uii-blue-900 text-uii-gold font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Verifikasi & Masuk Akun Google</span>
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* POP-UP / OVERLAY ONBOARDING: PENGISIAN NAMA SAJA UNTUK STAF BARU */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isOnboardingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-uii-blue-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-uii-gold/40 overflow-hidden z-10 text-slate-800"
            >
              {/* Header Modal Onboarding */}
              <div className="bg-gradient-to-r from-uii-blue-950 via-[#0c1f38] to-uii-blue-950 px-6 py-6 text-white text-center relative border-b-2 border-uii-gold">
                <div className="w-14 h-14 mx-auto mb-3 bg-uii-gold text-uii-blue-950 rounded-2xl flex items-center justify-center shadow-lg font-black">
                  <Sparkles className="w-7 h-7 text-uii-blue-950" />
                </div>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-uii-gold/20 border border-uii-gold/40 text-uii-gold text-[10px] font-black uppercase tracking-wider mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Aktivasi Role Staf Operasional</span>
                </div>
                <h3 className="text-lg font-black text-white font-heading">
                  Lengkapi Nama Resmi Staf BPA
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
                  Selamat bergabung di Divisi Operasional! Karena Anda baru pertama kali diberikan role Staf oleh Admin, silakan masukkan nama lengkap resmi Anda.
                </p>
              </div>

              {/* Form Onboarding Nama Saja */}
              <form onSubmit={handleSaveOnboarding} className="p-6 sm:p-7 space-y-4">
                {/* Informasi Akun Terverifikasi */}
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] uppercase tracking-wider text-amber-900">
                      Akun Terotorisasi:
                    </span>
                    <span className="text-[10px] font-black bg-uii-blue-950 text-uii-gold px-2 py-0.5 rounded-md">
                      {onboardingStaffTarget?.role || 'Staf Operasional BPA'}
                    </span>
                  </div>
                  <p className="font-mono text-slate-700 font-semibold truncate">
                    {onboardingStaffTarget?.email}
                  </p>
                </div>

                {onboardingError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                    <span>{onboardingError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                    Nama Lengkap Staf Resmi: <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      autoFocus
                      value={onboardingName}
                      onChange={(e) => setOnboardingName(e.target.value)}
                      placeholder="Contoh: Muhammad Fathur, S.T."
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-950 focus:bg-white"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Nama ini akan tercantum di riwayat verifikasi, berita acara sarana, dan approval jadwal peminjaman.
                  </p>
                </div>

                <div className="pt-2 flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOnboardingModalOpen(false);
                      setErrorMsg('');
                    }}
                    className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all text-center"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={savingOnboarding}
                    className="flex-2 py-3 px-4 rounded-2xl bg-uii-blue-950 hover:bg-uii-blue-900 text-uii-gold font-black text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {savingOnboarding ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-uii-gold" />
                        <span>Menyimpan Nama...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-uii-gold" />
                        <span>Simpan & Masuk ke Panel Staf</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const StaffPortalDashboard = ({ staffUser, onLogout, onGoToSite, onUpdateProfile }) => {
  const [currentStaff, setCurrentStaff] = useState(staffUser);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  useEffect(() => {
    setCurrentStaff(staffUser);
  }, [staffUser]);

  const [activeTab, setActiveTab] = useState('asset-orders'); // 'asset-orders' | 'rentals'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    {
      id: 'asset-orders',
      title: 'Cek Pesanan Aset',
      subtitle: 'Stok, Bentrok & Upload Progres',
      icon: PackageCheck,
      badge: 'Smart Ops'
    },
    {
      id: 'rentals',
      title: 'Approval & Laporan Sewa',
      subtitle: 'Setujui, Tolak & Tandai Selesai',
      icon: BarChart3,
      badge: 'Approval'
    },
    {
      id: 'revenue',
      title: 'Pendapatan Sewa',
      subtitle: 'Total & Rincian Barang Tersewa',
      icon: DollarSign,
      badge: 'Keuangan'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800 font-sans selection:bg-uii-blue-950 selection:text-uii-gold">
      {/* Sidebar Staf (Fixed di Desktop) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#0c1f38] text-white flex flex-col justify-between overflow-y-auto transition-transform duration-300 md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                <img
                  src="/images/logo/Logo-BPA-KM-UII-removebg.png"
                  alt="Logo BPA KM UII"
                  className="h-full w-full object-contain filter drop-shadow-md"
                  onError={(e) => {
                    if (!e.currentTarget.dataset.retried) {
                      e.currentTarget.dataset.retried = 'true';
                      e.currentTarget.src = '/images/logo/logo.png';
                    }
                  }}
                />
              </div>
              <div>
                <h2 className="text-xs font-black text-white font-heading tracking-wide uppercase">
                  PANEL STAF & APPROVAL
                </h2>
                <p className="text-[10px] text-uii-gold font-bold uppercase tracking-wider">
                  BPA KM UII
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-1 block">
              Menu Operasional Staf:
            </span>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-center justify-between group ${
                    isActive
                      ? 'bg-gradient-to-r from-uii-blue-900 to-uii-blue-800 text-white shadow-md border border-uii-gold/40'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        isActive
                          ? 'bg-uii-gold text-uii-blue-950 font-black'
                          : 'bg-white/10 text-slate-300 group-hover:text-uii-gold'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-extrabold text-xs block leading-tight truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                        {item.subtitle}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-black px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${
                      isActive ? 'bg-uii-gold text-uii-blue-950' : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Sidebar: Profil Staf (Bisa Diklik untuk Edit Profil & Foto) */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <button
            type="button"
            onClick={() => setIsEditProfileOpen(true)}
            className="w-full p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-uii-gold/50 flex items-center space-x-3 text-left transition-all group relative cursor-pointer shadow-xs"
            title="Klik untuk edit profil & foto akun staf"
          >
            <div className="relative flex-shrink-0">
              {currentStaff?.picture ? (
                <img
                  src={currentStaff.picture}
                  alt={currentStaff.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-uii-gold"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-uii-blue-900 border border-uii-gold text-uii-gold font-black flex items-center justify-center text-sm">
                  {currentStaff?.name ? currentStaff.name.charAt(0).toUpperCase() : 'S'}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-uii-gold text-uii-blue-950 flex items-center justify-center shadow-xs">
                <Edit3 className="w-2.5 h-2.5" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-black text-white block truncate group-hover:text-uii-gold transition-colors">
                {currentStaff?.name || 'Staf Operasional'}
              </span>
              <span className="text-[10px] text-uii-gold block font-semibold truncate">
                {currentStaff?.role || 'Divisi Approval'}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onGoToSite}
              className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-uii-gold" />
              <span>Lihat Web</span>
            </button>
            <button
              onClick={onLogout}
              className="py-2 px-3 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-2xs"
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-72">
        <header className="bg-white border-b border-slate-200/90 sticky top-0 z-20 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Portal Operasional Staf
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Akses /staff • /approval
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-uii-blue-950 font-heading">
                {activeTab === 'asset-orders' && 'Cek Pesanan Aset & Upload Perkembangan'}
                {activeTab === 'rentals' && 'Approval Pengajuan Sewa & Laporan'}
                {activeTab === 'revenue' && 'Pendapatan Dari Semua Barang Tersewa'}
              </h1>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-7 flex-1 overflow-y-auto">
          {activeTab === 'asset-orders' && <AssetOrdersTab adminUser={currentStaff} />}
          {activeTab === 'rentals' && <RentalReportsTab adminUser={currentStaff} />}
          {activeTab === 'revenue' && <RentalRevenueTab />}
        </main>
      </div>

      {/* Modal Edit Profil Staf */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentUser={currentStaff}
        portalType="staff"
        onSave={(updated) => {
          setCurrentStaff(updated);
          onUpdateProfile?.(updated);
        }}
      />
    </div>
  );
};
