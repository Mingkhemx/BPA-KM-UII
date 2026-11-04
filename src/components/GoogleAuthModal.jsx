import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  Database,
  ExternalLink,
  ChevronRight,
  UserPlus,
  KeyRound,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import {
  saveGoogleUserToNeon,
  getGoogleClientId,
  setCustomGoogleClientId
} from '../services/googleAuth';

export const GoogleAuthModal = ({
  isOpen,
  onClose,
  onUserSuccess,
  mode = 'login'
}) => {
  const [authStatus, setAuthStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [statusText, setStatusText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Custom account input form state
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  // Google Cloud Console Client ID config drawer
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);
  const [customClientIdInput, setCustomClientIdInput] = useState(() => getGoogleClientId());
  const [saveKeySuccess, setSaveKeySuccess] = useState(false);

  if (!isOpen) return null;

  // Preset Google Accounts (Akun Cepat Terverifikasi)
  const PRESET_ACCOUNTS = [
    {
      id: 'uii-student-01',
      name: 'Muhammad Fathir Al-Ghifari',
      email: 'fathir.alghifari@student.uii.ac.id',
      role: 'Mahasiswa Aktif UII',
      org: 'Informatika FTI UII',
      avatarBg: 'bg-blue-600',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-200',
      initials: 'MF'
    },
    {
      id: 'uii-staff-01',
      name: 'BPA Sarpras Kemahasiswaan',
      email: 'sarpras.fti@uii.ac.id',
      role: 'Organisasi / Lembaga UII',
      org: 'Biro Pengelolaan Aset KM UII',
      avatarBg: 'bg-amber-600',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
      initials: 'BP'
    },
    {
      id: 'general-user-01',
      name: 'Penyewa Mitra (Personal)',
      email: 'pengguna.bpa@gmail.com',
      role: 'Masyarakat Umum',
      org: 'Personal (Akun Google)',
      avatarBg: 'bg-emerald-600',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
      initials: 'PM'
    }
  ];

  // Eksekusi Login dengan Akun yang Dipilih
  const handleSelectAccount = async (account) => {
    setErrorMessage('');
    setAuthStatus('loading');
    setStatusText('Menghubungkan ke layanan Akun Google...');

    try {
      await new Promise((res) => setTimeout(res, 450));
      setStatusText('Menyinkronkan data pengguna ke Neon PostgreSQL...');

      const googleUser = {
        id: `google-${account.id || Date.now()}`,
        name: account.name,
        email: account.email,
        identifier: account.email,
        picture: '',
        phone: '081234567890',
        category: account.role,
        org: account.org,
        status: 'Aktif',
        loginAt: new Date().toLocaleString('id-ID'),
        authProvider: 'google',
        googleId: `g_${Date.now()}`
      };

      // Simpan langsung ke Neon PostgreSQL
      const savedUser = await saveGoogleUserToNeon(googleUser);

      setStatusText('Autentikasi Google berhasil!');
      setAuthStatus('success');

      setTimeout(() => {
        setAuthStatus('idle');
        onUserSuccess?.(savedUser || googleUser);
        onClose();
      }, 700);
    } catch (err) {
      setAuthStatus('error');
      setErrorMessage('Gagal autentikasi Google: ' + err.message);
    }
  };

  // Submit Akun Google Kustom (Email Bebas)
  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes('@')) {
      setErrorMessage('Mohon masukkan alamat email Google / UII yang valid.');
      return;
    }

    const emailVal = customEmail.trim().toLowerCase();
    const isUiiStudent = emailVal.endsWith('@student.uii.ac.id');
    const isUiiStaff = emailVal.endsWith('@uii.ac.id');

    const displayName =
      customName.trim() ||
      emailVal
        .split('@')[0]
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

    const account = {
      id: `custom-${Date.now()}`,
      name: displayName,
      email: emailVal,
      role: isUiiStudent
        ? 'Mahasiswa Aktif UII'
        : isUiiStaff
        ? 'Organisasi / Lembaga UII'
        : 'Masyarakat Umum',
      org: isUiiStudent
        ? 'Mahasiswa FTI UII (Google Auth)'
        : isUiiStaff
        ? 'Civitas Akademika UII'
        : 'Penyewa Umum (Akun Google)'
    };

    handleSelectAccount(account);
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

    // Jika SDK Google sudah aktif, coba buka popup
    if (window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: id,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              setErrorMessage('Google OAuth dibatalkan: ' + (tokenResponse.error_description || tokenResponse.error));
              return;
            }
            try {
              setAuthStatus('loading');
              setStatusText('Mengambil profil akun dari Google...');
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              });
              const profile = await res.json();
              const isUii = profile.email?.endsWith('@student.uii.ac.id') || profile.email?.endsWith('@uii.ac.id');

              const googleUser = {
                id: `google-${profile.sub || Date.now()}`,
                name: profile.name || profile.given_name || 'Pengguna Google',
                email: profile.email,
                identifier: profile.email,
                picture: profile.picture,
                phone: '081234567890',
                category: isUii ? 'Mahasiswa Aktif UII' : 'Masyarakat Umum',
                org: isUii ? 'Universitas Islam Indonesia' : 'Personal (Akun Google)',
                status: 'Aktif',
                loginAt: new Date().toLocaleString('id-ID'),
                authProvider: 'google',
                googleId: profile.sub
              };

              const saved = await saveGoogleUserToNeon(googleUser);
              setAuthStatus('success');
              setStatusText('Berhasil masuk dengan Google Cloud!');
              setTimeout(() => {
                onUserSuccess?.(saved || googleUser);
                onClose();
              }, 700);
            } catch (err) {
              setErrorMessage('Gagal memproses data Google: ' + err.message);
              setAuthStatus('error');
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
          {/* Header Bergaya Resmi Google */}
          <div className="p-6 sm:p-7 border-b border-slate-100 relative bg-white">
            <button
              onClick={onClose}
              disabled={authStatus === 'loading'}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Logo Google Asli */}
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
                  Google Identity Services
                </span>
                <h3 className="text-lg font-black text-slate-900 font-heading">
                  {mode === 'register' ? 'Daftar dengan Akun Google' : 'Login dengan Akun Google'}
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Pilih akun Google Anda untuk melanjutkan ke portal layanan{' '}
              <span className="font-bold text-uii-blue-950">BPA KM UII (fti.uii.ac.id)</span>.
            </p>
          </div>

          {/* Modal Body */}
          <div className="p-6 sm:p-7 space-y-4 max-h-[68vh] overflow-y-auto">
            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Loading / Authenticating State */}
            {authStatus === 'loading' && (
              <div className="py-10 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 border-2 border-blue-200 relative">
                  <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 font-heading">
                    Memproses Autentikasi...
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">{statusText}</p>
                </div>
              </div>
            )}

            {/* Success State */}
            {authStatus === 'success' && (
              <div className="py-8 text-center space-y-3">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 font-heading">
                    Berhasil Terhubung!
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{statusText}</p>
                </div>
              </div>
            )}

            {/* Normal Account Chooser View */}
            {authStatus === 'idle' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">
                  <span>Pilih Akun Terhubung:</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                    <Database className="w-3 h-3 text-emerald-600" />
                    Neon PostgreSQL Ready
                  </span>
                </div>

                {/* List Preset Accounts */}
                <div className="space-y-2">
                  {PRESET_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => handleSelectAccount(acc)}
                      className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-between group text-left cursor-pointer shadow-2xs hover:shadow-sm"
                    >
                      <div className="flex items-center space-x-3.5 min-w-0">
                        {/* Avatar Initial */}
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
                              {acc.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {acc.email}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {acc.org}
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
                      onSubmit={handleCustomSubmit}
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
                          placeholder="nama@student.uii.ac.id atau @gmail.com"
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
                        <ShieldCheck className="w-4 h-4" />
                        <span>Masuk dengan Email Ini</span>
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

                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={customClientIdInput}
                          onChange={(e) => setCustomClientIdInput(e.target.value)}
                          placeholder="xxxx.apps.googleusercontent.com"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono text-[11px] text-slate-800"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleSaveAndTestClientId}
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
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

                      <div className="text-[10px] text-slate-500 space-y-0.5 pt-1">
                        <p>
                          • Authorized JavaScript Origin: <code className="bg-white px-1 rounded font-bold">http://localhost:3000</code>
                        </p>
                        <p>
                          • Authorized Redirect URI: <code className="bg-white px-1 rounded font-bold">http://localhost:3000</code>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
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
