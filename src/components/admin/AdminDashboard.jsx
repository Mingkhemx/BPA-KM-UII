import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Globe, 
  Users, 
  ShoppingBag, 
  LogOut, 
  ExternalLink, 
  ShieldCheck, 
  ChevronRight, 
  Menu, 
  X,
  Bell,
  Sparkles,
  BarChart3,
  CalendarCheck
} from 'lucide-react';
import { WebsiteCmsTab } from './tabs/WebsiteCmsTab';
import { UserManagementTab } from './tabs/UserManagementTab';
import { RentalReportsTab } from './tabs/RentalReportsTab';

export const AdminDashboard = ({ adminUser, onLogout, onGoToSite }) => {
  // 3 Kategori Utama Dashboard Admin sesuai Permintaan Pengguna:
  // 1. 'website' = Khusus Website (Banner, Testimoni, Produk, Artikel, Investor & Dokumen, Galeri)
  // 2. 'users' = Akun Pengguna
  // 3. 'rentals' = Bagian Sewa Produk & Laporan
  const [activeCategory, setActiveCategory] = useState('website');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navCategories = [
    {
      id: 'website',
      title: 'Khusus Website',
      subtitle: 'CMS Konten Beranda & Halaman',
      icon: Globe,
      badge: '6 Modul',
      badgeColor: 'bg-blue-100 text-blue-900'
    },
    {
      id: 'users',
      title: 'Akun Pengguna',
      subtitle: 'Manajemen Data Penyewa',
      icon: Users,
      badge: 'Data Pengguna',
      badgeColor: 'bg-emerald-100 text-emerald-900'
    },
    {
      id: 'rentals',
      title: 'Sewa Produk & Laporan',
      subtitle: 'Approval & Analisis Keuangan',
      icon: BarChart3,
      badge: 'Operasional',
      badgeColor: 'bg-amber-100 text-amber-900'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800 font-sans selection:bg-uii-blue-950 selection:text-uii-gold">
      
      {/* =========================================================================
          SIDEBAR ADMIN (KIRI)
         ========================================================================= */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-[#0c1f38] text-white flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div>
          {/* Header Sidebar dengan Logo BPA */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-md">
                <img
                  src="/images/logo/logo.png"
                  alt="Logo BPA KM UII"
                  className="h-full w-auto object-contain"
                />
              </div>
              <div>
                <h2 className="text-xs font-black text-white font-heading tracking-wide uppercase">
                  DASHBOARD ADMIN
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

          {/* Navigasi 3 Kategori Utama */}
          <div className="p-4 space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-1 block">
              3 Kategori Manajemen:
            </span>

            {navCategories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-center justify-between group ${
                    isActive
                      ? 'bg-gradient-to-r from-uii-blue-900 to-uii-blue-800 text-white shadow-md border border-uii-gold/40'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                      isActive ? 'bg-uii-gold text-uii-blue-950 font-black' : 'bg-white/10 text-slate-300 group-hover:text-uii-gold'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <span className="font-extrabold text-xs block leading-tight">{cat.title}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 truncate">{cat.subtitle}</span>
                    </div>
                  </div>

                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${
                    isActive ? 'bg-uii-gold text-uii-blue-950' : 'bg-white/10 text-slate-400'
                  }`}>
                    {cat.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Sidebar: Profil Admin & Tombol Logout */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-uii-blue-900 border border-uii-gold text-uii-gold font-black flex items-center justify-center text-sm flex-shrink-0">
              {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-black text-white block truncate">{adminUser?.name || 'Administrator BPA'}</span>
              <span className="text-[10px] text-uii-gold block font-semibold truncate">{adminUser?.role || 'Presiden Direktur'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onGoToSite}
              className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
              title="Kunjungi website publik"
            >
              <ExternalLink className="w-3.5 h-3.5 text-uii-gold" />
              <span>Lihat Web</span>
            </button>
            <button
              onClick={onLogout}
              className="py-2 px-3 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
              title="Keluar dari sesi admin"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop Sidebar untuk Mobile */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-2xs"
        />
      )}

      {/* =========================================================================
          MAIN CONTENT AREA (KANAN)
         ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Topbar Admin */}
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
                  Panel Kelola Terpadu
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-[10px] font-bold text-uii-blue-900 bg-blue-50 px-2 py-0.5 rounded-md">
                  Akses /admin
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-uii-blue-950 font-heading">
                {activeCategory === 'website' && 'Kategori 1: Khusus Website (CMS & Konten)'}
                {activeCategory === 'users' && 'Kategori 2: Akun Pengguna (User Management)'}
                {activeCategory === 'rentals' && 'Kategori 3: Bagian Sewa Produk & Laporan'}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onGoToSite}
              className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-bold text-uii-blue-950 hover:text-uii-blue-800 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-uii-gold-600" />
              <span>Lihat Website</span>
            </button>
          </div>
        </header>

        {/* Tab Body View */}
        <main className="p-4 sm:p-7 flex-1 overflow-y-auto">
          {activeCategory === 'website' && <WebsiteCmsTab />}
          {activeCategory === 'users' && <UserManagementTab />}
          {activeCategory === 'rentals' && <RentalReportsTab />}
        </main>

        {/* Footer Admin Bar */}
        <footer className="bg-white border-t border-slate-200 px-6 py-3.5 text-center text-xs text-slate-400">
          <span>Badan Pengelola Aset KM UII • Portal Manajemen Internal • Versi 2.0 (2026)</span>
        </footer>
      </div>

    </div>
  );
};
