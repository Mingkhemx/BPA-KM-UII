import React, { useState, useEffect } from 'react';
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
  CalendarCheck,
  PackageCheck,
  DollarSign,
  Edit3
} from 'lucide-react';
import { WebsiteCmsTab } from './tabs/WebsiteCmsTab';
import { UserManagementTab } from './tabs/UserManagementTab';
import { RentalReportsTab } from './tabs/RentalReportsTab';
import { AssetOrdersTab } from './tabs/AssetOrdersTab';
import { RentalRevenueTab } from './tabs/RentalRevenueTab';
import { EditProfileModal } from './EditProfileModal';

export const AdminDashboard = ({ adminUser, onLogout, onGoToSite, onUpdateProfile }) => {
  const [currentUser, setCurrentUser] = useState(adminUser);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  useEffect(() => {
    setCurrentUser(adminUser);
  }, [adminUser]);

  // Kategori Utama Dashboard Admin:
  // 1. 'website' = Khusus Website (Banner, Testimoni, Produk, Artikel, Investor & Dokumen, Galeri)
  // 2. 'users' = Akun Pengguna
  // 3. 'rentals' = Bagian Sewa Produk & Laporan
  // 4. 'asset-orders' = Cek Pesanan Aset & Upload Perkembangan
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
    },
    {
      id: 'asset-orders',
      title: 'Cek Pesanan Aset',
      subtitle: 'Monitor Stok & Upload Progres',
      icon: PackageCheck,
      badge: 'Smart Ops',
      badgeColor: 'bg-indigo-100 text-indigo-900'
    },
    {
      id: 'revenue',
      title: 'Pendapatan Sewa',
      subtitle: 'Total & Rincian Barang Tersewa',
      icon: DollarSign,
      badge: 'Keuangan',
      badgeColor: 'bg-emerald-100 text-emerald-900'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800 font-sans selection:bg-uii-blue-950 selection:text-uii-gold">
      
      {/* =========================================================================
          SIDEBAR ADMIN (KIRI - FIXED DI DESKTOP)
         ========================================================================= */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-[#0c1f38] text-white flex flex-col justify-between overflow-y-auto transition-transform duration-300 md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div>
          {/* Header Sidebar dengan Logo BPA */}
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

          {/* Navigasi 4 Kategori Utama */}
          <div className="p-4 space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-1 block">
              Menu Manajemen:
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

        {/* Footer Sidebar: Profil Admin (Bisa Diklik untuk Edit Profil & Foto) */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <button
            type="button"
            onClick={() => setIsEditProfileOpen(true)}
            className="w-full p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-uii-gold/50 flex items-center space-x-3 text-left transition-all group relative cursor-pointer shadow-xs"
            title="Klik untuk edit profil & foto akun admin"
          >
            <div className="relative flex-shrink-0">
              {currentUser?.picture ? (
                <img
                  src={currentUser.picture}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-uii-gold"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-uii-blue-900 border border-uii-gold text-uii-gold font-black flex items-center justify-center text-sm">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-uii-gold text-uii-blue-950 flex items-center justify-center shadow-xs">
                <Edit3 className="w-2.5 h-2.5" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-black text-white block truncate group-hover:text-uii-gold transition-colors">
                {currentUser?.name || 'Administrator BPA'}
              </span>
              <span className="text-[10px] text-uii-gold block font-semibold truncate">
                {currentUser?.role || 'Presiden Direktur'}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>

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
      <div className="flex-1 flex flex-col min-w-0 md:pl-72">
        
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
                {activeCategory === 'asset-orders' && 'Kategori 4: Cek Pesanan Aset & Upload Perkembangan'}
                {activeCategory === 'revenue' && 'Kategori 5: Pendapatan Dari Semua Barang Tersewa'}
              </h1>
            </div>
          </div>
        </header>

        {/* Tab Body View */}
        <main className="p-4 sm:p-7 flex-1 overflow-y-auto">
          {activeCategory === 'website' && <WebsiteCmsTab />}
          {activeCategory === 'users' && <UserManagementTab />}
          {activeCategory === 'rentals' && <RentalReportsTab adminUser={currentUser} />}
          {activeCategory === 'asset-orders' && <AssetOrdersTab adminUser={currentUser} />}
          {activeCategory === 'revenue' && <RentalRevenueTab />}
        </main>

        {/* Footer Admin Bar */}
        <footer className="bg-white border-t border-slate-200 px-6 py-3.5 text-center text-xs text-slate-400">
          <span>Badan Pengelola Aset KM UII • Portal Manajemen Internal • Versi 2.0 (2026)</span>
        </footer>
      </div>

      {/* Modal Edit Profil Admin */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentUser={currentUser}
        portalType="admin"
        onSave={(updated) => {
          setCurrentUser(updated);
          onUpdateProfile?.(updated);
        }}
      />
    </div>
  );
};
