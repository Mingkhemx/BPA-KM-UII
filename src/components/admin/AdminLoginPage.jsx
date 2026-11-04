import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2,
  Sparkles,
  KeyRound
} from 'lucide-react';

export const AdminLoginPage = ({ onLoginSuccess, onBackToSite }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Mohon masukkan email admin dan kata sandi.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // Validasi kredensial (admin demo atau kredensial BPA)
      if (
        (email.toLowerCase().includes('admin') || email.toLowerCase().includes('bpa')) &&
        (password === 'adminbpa2026' || password === 'admin' || password === 'admin123')
      ) {
        const adminUser = {
          name: 'Irfan Ardiansyah',
          role: 'Administrator Utama',
          email: email.trim(),
          division: 'Presiden Direktur BPA KM UII',
          loginTime: new Date().toLocaleString('id-ID')
        };
        onLoginSuccess(adminUser);
      } else {
        // Fallback untuk kemudahan pengujian jika kredensial bebas dimasukkan
        const adminUser = {
          name: email.split('@')[0] || 'Staff Admin BPA',
          role: 'Administrator Portal',
          email: email.trim(),
          division: 'Biro Pengelolaan Aset UII',
          loginTime: new Date().toLocaleString('id-ID')
        };
        onLoginSuccess(adminUser);
      }
      setLoading(false);
    }, 400);
  };

  const handleQuickDemoLogin = () => {
    setEmail('admin@bpa.uii.ac.id');
    setPassword('adminbpa2026');
    setLoading(true);

    setTimeout(() => {
      const demoAdmin = {
        name: 'Irfan Ardiansyah',
        role: 'Administrator Utama BPA',
        email: 'admin@bpa.uii.ac.id',
        division: 'Presiden Direktur BPA KM UII',
        avatar: '/images/INVESTOR/Irfan-ArdiansyahArdiansyah.webp',
        loginTime: new Date().toLocaleString('id-ID')
      };
      onLoginSuccess(demoAdmin);
      setLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#07172f] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-uii-gold selection:text-uii-blue-950">
      
      {/* Background Subtle Gradient & Grid Scrim */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-uii-blue-900/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-uii-gold/10 rounded-full blur-3xl pointer-events-none" />

      {/* Tombol Kembali ke Website */}
      <div className="w-full max-w-md mb-4 flex justify-between items-center relative z-10">
        <button
          onClick={onBackToSite}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-300 hover:text-uii-gold transition-colors py-1.5 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Website Utama</span>
        </button>

        <span className="text-[11px] font-bold text-slate-400 tracking-wider">
          PORTAL INTERNAL
        </span>
      </div>

      {/* Main Container Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative z-10 text-slate-800">
        
        {/* Header Biru UII dengan Logo Resmi */}
        <div className="bg-[#0c1f38] px-7 py-7 text-center relative border-b-2 border-uii-gold/30">
          <div className="w-16 h-16 mx-auto mb-3 bg-white p-2 rounded-2xl shadow-lg border border-white/20 flex items-center justify-center">
            <img
              src="/images/logo/logo.png"
              alt="Logo BPA KM UII"
              className="h-12 w-auto object-contain"
            />
          </div>
          <h2 className="text-xl font-black text-white font-heading tracking-wide">
            PORTAL ADMIN BPA
          </h2>
          <p className="text-xs text-uii-gold font-bold tracking-wider uppercase mt-1">
            Badan Pengelola Aset KM UII
          </p>
          <p className="text-[11px] text-slate-300 mt-1 max-w-xs mx-auto">
            Sistem Manajemen Terpadu Website, Akun Pengguna & Laporan Sewa
          </p>
        </div>

        {/* Form Body */}
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
                Email / Akun Staf:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bpa.uii.ac.id"
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
              <span>{loading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}</span>
            </button>
          </form>

          {/* Opsi Login Cepat Demo Admin */}
          <div className="pt-2">
            <div className="relative my-3 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Akses Cepat Pengujian
              </div>
            </div>

            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="w-full py-3 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border border-amber-300 text-amber-950 font-extrabold text-xs transition-all shadow-xs flex items-center justify-center space-x-2 group"
            >
              <ShieldCheck className="w-4 h-4 text-amber-700 group-hover:scale-110 transition-transform" />
              <span>Masuk sebagai Admin Demo BPA</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              Kredensial Demo: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">admin@bpa.uii.ac.id</code> / <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">adminbpa2026</code>
            </p>
          </div>
        </div>

        {/* Footer Card */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500">
          <span>Hak Akses Terbatas Divisi Operasional & Presdir BPA KM UII</span>
        </div>
      </div>

    </div>
  );
};
