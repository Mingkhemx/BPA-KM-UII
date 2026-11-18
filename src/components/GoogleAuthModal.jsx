import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  Database,
  ChevronRight,
  UserPlus,
  KeyRound,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Check,
  Phone,
  Building,
  User
} from 'lucide-react';
import {
  saveGoogleUserToNeon,
  checkRegisteredUserByEmail,
  getGoogleClientId,
  setCustomGoogleClientId
} from '../services/googleAuth';

export const GoogleAuthModal = ({
  isOpen,
  onClose,
  onUserSuccess,
  mode = 'login',
  initialPendingProfile = null
}) => {
  const [step, setStep] = useState('choose'); // 'choose' | 'complete-profile'
  const [authStatus, setAuthStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [statusText, setStatusText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [infoBanner, setInfoBanner] = useState('');

  // Custom account email input on Step 1
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  // Step 2: Mandatory Registration Details (Origin/Masyarakat + WhatsApp)
  const [pendingGoogleAccount, setPendingGoogleAccount] = useState(null);
  const [regName, setRegName] = useState('');
  const [regCategory, setRegCategory] = useState('Masyarakat Umum');
  const [regOrg, setRegOrg] = useState('');
  const [regPhone, setRegPhone] = useState('');

  // Google Cloud Console Client ID config drawer
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);
  const [customClientIdInput, setCustomClientIdInput] = useState(() => getGoogleClientId());
  const [saveKeySuccess, setSaveKeySuccess] = useState(false);

  // Reset modal state saat dibuka/ditutup
  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage('');
    setAuthStatus('idle');
    setShowCustomForm(false);

    if (initialPendingProfile) {
      openCompleteProfileStep(
        initialPendingProfile,
        mode === 'login'
          ? 'Akun Google Anda belum terdaftar. Lengkapi asal pemohon & nomor WhatsApp untuk membuat akun.'
          : 'Satu langkah lagi! Pilih asal pemohon & masukkan nomor WhatsApp aktif untuk mendaftar.'
      );
    } else {
      setStep('choose');
      setPendingGoogleAccount(null);
      setInfoBanner('');
    }
  }, [isOpen, initialPendingProfile, mode]);

  if (!isOpen) return null;

  // Preset Google Accounts (Untuk pilihan cepat)
  const PRESET_ACCOUNTS = [
    {
      id: 'uii-student-01',
      name: 'Muhammad Fathir Al-Ghifari',
      email: 'fathir.alghifari@student.uii.ac.id',
      suggestedCategory: 'Mahasiswa Aktif UII',
      suggestedOrg: 'Informatika FTI UII',
      avatarBg: 'bg-blue-600',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-200',
      initials: 'MF'
    },
    {
      id: 'uii-staff-01',
      name: 'BPA Sarpras Kemahasiswaan',
      email: 'sarpras.fti@uii.ac.id',
      suggestedCategory: 'Organisasi / Lembaga UII',
      suggestedOrg: 'Biro Pengelolaan Aset KM UII',
      avatarBg: 'bg-amber-600',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
      initials: 'BP'
    },
    {
      id: 'general-user-01',
      name: 'Penyewa Mitra (Personal)',
      email: 'pengguna.bpa@gmail.com',
      suggestedCategory: 'Masyarakat Umum',
      suggestedOrg: '',
      avatarBg: 'bg-emerald-600',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
      initials: 'PM'
    }
  ];

  const openCompleteProfileStep = (account, bannerText) => {
    const emailLower = (account.email || '').toLowerCase();
    const isUiiStudent = emailLower.endsWith('@student.uii.ac.id');
    const isUiiStaff = emailLower.endsWith('@uii.ac.id');

    setPendingGoogleAccount(account);
    setRegName(account.name || '');
    setRegCategory(
      account.suggestedCategory ||
        (isUiiStudent
          ? 'Mahasiswa Aktif UII'
          : isUiiStaff
          ? 'Organisasi / Lembaga UII'
          : 'Masyarakat Umum')
    );
    setRegOrg(account.suggestedOrg || '');
    setRegPhone(''); // Kosongkan agar user wajib mengisi nomor WhatsApp asli
    setInfoBanner(bannerText);
    setErrorMessage('');
    setAuthStatus('idle');
    setStep('complete-profile');
  };

  // Langkah 1: Pilih akun Google -> cek apakah sudah terdaftar atau harus lengkapi data
  const handleSelectAccount = async (account) => {
    setErrorMessage('');
    setAuthStatus('loading');
    setStatusText('Memeriksa status akun Google di sistem...');

    try {
      const check = await checkRegisteredUserByEmail(account.email);

      if (mode === 'login' && check.exists && check.user) {
        // Sudah terdaftar -> langsung masuk menggunakan profil asli dari database
        setStatusText('Akun ditemukan! Masuk ke sistem...');
        setAuthStatus('success');
        setTimeout(() => {
          setAuthStatus('idle');
          onUserSuccess?.(check.user);
          onClose();
        }, 550);
        return;
      }

      // Jika mode register ATAU akun belum terdaftar saat login:
      // JANGAN langsung buat akun, wajib lengkapi Asal (Masyarakat/UII) & Nomor WhatsApp
      const banner =
        mode === 'login'
          ? 'Akun Google ini belum terdaftar. Silakan pilih asal pemohon & isi nomor WhatsApp aktif Anda untuk mendaftar.'
          : 'Silakan lengkapi asal pemohon (Masyarakat / UII) dan nomor WhatsApp aktif sebelum akun dibuat.';

      openCompleteProfileStep(account, banner);
    } catch (err) {
      setAuthStatus('idle');
      setErrorMessage('Gagal memeriksa akun Google: ' + err.message);
    }
  };

  // Submit email Google kustom pada Langkah 1
  const handleCustomEmailStep = (e) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes('@')) {
      setErrorMessage('Mohon masukkan alamat email Google / UII yang valid.');
      return;
    }

    const emailVal = customEmail.trim().toLowerCase();
    const displayName =
      customName.trim() ||
      emailVal
        .split('@')[0]
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

    handleSelectAccount({
      id: `custom-${Date.now()}`,
      name: displayName,
      email: emailVal
    });
  };

  // Langkah 2: Finalisasi pembuatan akun setelah mengisi kategori asal & nomor WhatsApp
  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regName.trim()) {
      setErrorMessage('Nama lengkap wajib diisi.');
      return;
    }

    const cleanPhone = regPhone.replace(/[^0-9+]/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      setErrorMessage('Mohon masukkan nomor WhatsApp aktif yang valid (minimal 9 digit angka).');
      return;
    }

    const isMasyarakatUmum = regCategory === 'Masyarakat Umum';
    if (!isMasyarakatUmum && !regOrg.trim()) {
      setErrorMessage(
        regCategory === 'Organisasi / Lembaga UII'
          ? 'Mohon isi nama Ormawa, UKM, atau Lembaga Anda.'
          : regCategory === 'Mahasiswa Aktif UII'
          ? 'Mohon isi Fakultas dan Program Studi Anda.'
          : 'Mohon isi Jurusan dan Angkatan kelulusan Anda.'
      );
      return;
    }

    setAuthStatus('loading');
    setStatusText('Mendaftarkan akun & menyimpan ke Neon PostgreSQL...');

    try {
      const googleUser = {
        id: pendingGoogleAccount?.id || `google-${Date.now()}`,
        name: regName.trim(),
        email: pendingGoogleAccount.email,
        identifier: pendingGoogleAccount.email,
        picture: pendingGoogleAccount.picture || '',
        phone: regPhone.trim(),
        category: regCategory,
        org: regOrg.trim() || (isMasyarakatUmum ? 'Masyarakat Umum (Personal)' : regCategory),
        status: 'Aktif',
        loginAt: new Date().toLocaleString('id-ID'),
        authProvider: 'google',
        googleId: pendingGoogleAccount.googleId || `g_${Date.now()}`
      };

      const savedUser = await saveGoogleUserToNeon(googleUser);

      setStatusText('Akun berhasil dibuat!');
      setAuthStatus('success');

      setTimeout(() => {
        setAuthStatus('idle');
        onUserSuccess?.(savedUser || googleUser);
        onClose();
      }, 650);
    } catch (err) {
      setAuthStatus('idle');
      setErrorMessage('Gagal menyimpan akun: ' + err.message);
    }
  };

  // Simpan Google Client ID dan Uji Popup Asli
  const handleSaveAndTestClientId = () => {
    setErrorMessage('');
    const id = customClientIdInput.trim();
    if (!id || id.includes('your-google-client-id')) {
      setErrorMessage('Harap tempelkan Web Client ID asli dari Google Cloud Console.');
      return;
    }

    setCustomGoogleClientId(id);
    setSaveKeySuccess(true);
    setTimeout(() => setSaveKeySuccess(false), 2500);

    if (window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: id,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              setErrorMessage(
                'Google OAuth dibatalkan: ' + (tokenResponse.error_description || tokenResponse.error)
              );
              return;
            }
            try {
              setAuthStatus('loading');
              setStatusText('Mengambil profil akun dari Google...');
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              });
              const profile = await res.json();

              const check = await checkRegisteredUserByEmail(profile.email);
              if (mode === 'login' && check.exists && check.user) {
                setAuthStatus('success');
                setStatusText('Berhasil masuk dengan Google!');
                setTimeout(() => {
                  onUserSuccess?.(check.user);
                  onClose();
                }, 600);
                return;
              }

              openCompleteProfileStep(
                {
                  id: `google-${profile.sub || Date.now()}`,
                  googleId: profile.sub,
                  name: profile.name || profile.given_name || 'Pengguna Google',
                  email: profile.email,
                  picture: profile.picture || ''
                },
                mode === 'login'
                  ? 'Akun Google Anda belum terdaftar. Lengkapi asal pemohon & nomor WhatsApp untuk membuat akun.'
                  : 'Satu langkah lagi! Pilih asal pemohon & masukkan nomor WhatsApp aktif Anda.'
              );
            } catch (err) {
              setErrorMessage('Gagal memproses data Google: ' + err.message);
              setAuthStatus('idle');
            }
          }
        });
        client.requestAccessToken();
      } catch (err) {
        setErrorMessage('Gagal membuka popup Google: ' + err.message);
      }
    } else {
      setErrorMessage('Google Identity SDK sedang dimuat. Silakan coba lagi.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => authStatus !== 'loading' && onClose()}
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm"
        />

        {/* Modal Dialog Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-200 my-8"
        >
          {/* Header */}
          <div className="p-6 sm:p-7 border-b border-slate-100 relative bg-white">
            <button
              onClick={onClose}
              disabled={authStatus === 'loading'}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3.5 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-white shadow-sm border border-slate-200/80 flex items-center justify-center p-2">
                <svg className="w-full h-full" viewBox="0 0 24 24">
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
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-uii-blue-900 bg-blue-50 px-2 py-0.5 rounded-md inline-block mb-0.5">
                  {step === 'complete-profile' ? 'Langkah 2 dari 2 • Lengkapi Profil' : 'Google Identity Services'}
                </span>
                <h3 className="text-lg font-black text-slate-900 font-heading">
                  {step === 'complete-profile'
                    ? 'Lengkapi Data Pendaftaran'
                    : mode === 'register'
                    ? 'Daftar dengan Akun Google'
                    : 'Login dengan Akun Google'}
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {step === 'complete-profile'
                ? 'Isi kategori asal pemohon (Masyarakat / UII) dan nomor WhatsApp aktif Anda sebelum akun dibuat.'
                : 'Pilih akun Google Anda untuk melanjutkan ke portal layanan BPA KM UII.'}
            </p>
          </div>

          {/* Modal Body */}
          <div className="p-6 sm:p-7 space-y-4 max-h-[68vh] overflow-y-auto">
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {authStatus === 'loading' && (
              <div className="py-10 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 border-2 border-blue-200 relative">
                  <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 font-heading">
                    Memproses...
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">{statusText}</p>
                </div>
              </div>
            )}

            {authStatus === 'success' && (
              <div className="py-8 text-center space-y-3">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 font-heading">
                    Berhasil!
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{statusText}</p>
                </div>
              </div>
            )}

            {/* STEP 1: PILIH AKUN GOOGLE */}
            {authStatus === 'idle' && step === 'choose' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">
                  <span>Pilih Akun Google:</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                    <Database className="w-3 h-3 text-emerald-600" />
                    Neon PostgreSQL
                  </span>
                </div>

                <div className="space-y-2">
                  {PRESET_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => handleSelectAccount(acc)}
                      className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-between group text-left cursor-pointer shadow-2xs hover:shadow-sm"
                    >
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-full ${acc.avatarBg} text-white font-black text-xs flex items-center justify-center shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform`}
                        >
                          {acc.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900 truncate">
                              {acc.name}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${acc.badgeColor} uppercase tracking-wider flex-shrink-0`}
                            >
                              {acc.suggestedCategory}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {acc.email}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-uii-blue-900 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
                    </button>
                  ))}
                </div>

                {/* Opsi: Gunakan Akun Google Lainnya */}
                <div className="pt-2">
                  {!showCustomForm ? (
                    <button
                      type="button"
                      onClick={() => setShowCustomForm(true)}
                      className="w-full py-3 px-4 rounded-2xl border border-dashed border-slate-300 hover:border-uii-blue-900/60 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all flex items-center justify-center space-x-2"
                    >
                      <UserPlus className="w-4 h-4 text-uii-blue-900" />
                      <span>Gunakan Akun Google / Email UII Lainnya</span>
                    </button>
                  ) : (
                    <form
                      onSubmit={handleCustomEmailStep}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 mt-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          Masukkan Email Google Anda:
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowCustomForm(false)}
                          className="text-[11px] text-slate-400 hover:text-slate-600 font-semibold"
                        >
                          Batal
                        </button>
                      </div>

                      <div>
                        <input
                          type="email"
                          required
                          value={customEmail}
                          onChange={(e) => setCustomEmail(e.target.value)}
                          placeholder="nama@gmail.com atau @student.uii.ac.id"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-900"
                        />
                      </div>

                      <div>
                        <input
                          type="text"
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          placeholder="Nama Lengkap (opsional)"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-900"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 rounded-xl bg-uii-blue-950 hover:bg-uii-blue-900 text-uii-gold font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all shadow-sm"
                      >
                        <span>Lanjutkan</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  )}
                </div>

                {/* Konfigurasi Google Cloud Console Client ID (OAuth Asli) */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowConfigDrawer(!showConfigDrawer)}
                    className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 hover:text-uii-blue-950 py-1"
                  >
                    <span className="flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-uii-gold" />
                      Punya Web Client ID dari Google Cloud Console?
                    </span>
                    <span>{showConfigDrawer ? '▲ Sembunyikan' : '▼ Sambungkan'}</span>
                  </button>

                  {showConfigDrawer && (
                    <div className="mt-2.5 p-3.5 rounded-2xl bg-slate-100/90 border border-slate-200 text-xs space-y-2.5">
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Jika Anda ingin memunculkan jendela <em>popup</em> resmi Google (<code>accounts.google.com</code>), tempelkan <strong>OAuth Web Client ID</strong> di bawah ini:
                      </p>

                      <input
                        type="text"
                        value={customClientIdInput}
                        onChange={(e) => setCustomClientIdInput(e.target.value)}
                        placeholder="xxxx.apps.googleusercontent.com"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono text-[11px] text-slate-800"
                      />

                      <button
                        type="button"
                        onClick={handleSaveAndTestClientId}
                        className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                      >
                        {saveKeySuccess ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Tersimpan! Membuka...</span>
                          </>
                        ) : (
                          <>
                            <span>Simpan & Buka Popup Google</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: LENGKAPI DATA ASAL (MASYARAKAT / UII) & NOMOR WHATSAPP */}
            {authStatus === 'idle' && step === 'complete-profile' && pendingGoogleAccount && (
              <form onSubmit={handleCompleteRegistration} className="space-y-4">
                {infoBanner && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold leading-relaxed">
                    {infoBanner}
                  </div>
                )}

                {/* Info Akun Google Terpilih */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Email Google Terhubung
                    </span>
                    <span className="text-xs font-black text-slate-900 truncate block">
                      {pendingGoogleAccount.email}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('choose');
                      setErrorMessage('');
                    }}
                    className="text-[11px] font-bold text-uii-blue-900 hover:underline flex items-center gap-1 flex-shrink-0"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Ganti Akun</span>
                  </button>
                </div>

                {/* Nama Lengkap */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nama Lengkap: *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Masukkan nama lengkap Anda"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-900"
                    />
                  </div>
                </div>

                {/* Kategori Asal (Masyarakat Umum / Mahasiswa UII / Ormawa / Alumni) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Jenis Akun / Asal Pemohon: *
                  </label>
                  <select
                    value={regCategory}
                    onChange={(e) => setRegCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-900 cursor-pointer"
                  >
                    <option value="Masyarakat Umum">Masyarakat Umum</option>
                    <option value="Mahasiswa Aktif UII">Mahasiswa Aktif UII</option>
                    <option value="Organisasi / Lembaga UII">Organisasi / Lembaga UII</option>
                    <option value="Alumni UII">Alumni UII</option>
                  </select>
                </div>

                {/* Asal Instansi / Fakultas / Ormawa */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {regCategory === 'Masyarakat Umum' ? (
                      <span>
                        Asal Masyarakat / Instansi{' '}
                        <span className="text-slate-400 font-normal lowercase">(opsional)</span>:
                      </span>
                    ) : (
                      <span>
                        Asal{' '}
                        {regCategory === 'Organisasi / Lembaga UII'
                          ? 'Ormawa / Lembaga'
                          : regCategory === 'Mahasiswa Aktif UII'
                          ? 'Fakultas / Prodi'
                          : 'Jurusan & Angkatan'}
                        : *
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required={regCategory !== 'Masyarakat Umum'}
                      value={regOrg}
                      onChange={(e) => setRegOrg(e.target.value)}
                      placeholder={
                        regCategory === 'Masyarakat Umum'
                          ? 'Contoh: Yogyakarta / Nama Instansi / Personal'
                          : regCategory === 'Organisasi / Lembaga UII'
                          ? 'Contoh: BEM FTI / DEMA / UKM'
                          : regCategory === 'Mahasiswa Aktif UII'
                          ? 'Contoh: Informatika FTI UII'
                          : 'Contoh: Alumni Arsitektur 2020'
                      }
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-900"
                    />
                  </div>
                </div>

                {/* Nomor WhatsApp Aktif (Wajib) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    No. WhatsApp Aktif: *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-900"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Wajib diisi untuk menerima konfirmasi persetujuan sewa dari staf BPA.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-2xl bg-uii-blue-950 hover:bg-uii-blue-900 text-uii-gold font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Buat Akun & Masuk</span>
                </button>
              </form>
            )}
          </div>

          {/* Footer Info Database Neon */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-slate-700">Tersinkronisasi ke Neon PostgreSQL</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400">
              FTI Universitas Islam Indonesia
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
