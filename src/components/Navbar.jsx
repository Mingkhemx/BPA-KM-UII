import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, User, Package, Linkedin, Instagram, Youtube
} from 'lucide-react';

export const Navbar = ({ 
  onOpenSearch, 
  onOpenAuth, 
  currentUser, 
  onNavigateSection, 
  currentPage = 'home' 
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isSolidHeader = isScrolled || currentPage !== 'home';

  useEffect(() => {
    if (currentPage === 'products') {
      setActiveSection('programs');
    } else if (currentPage === 'investor') {
      setActiveSection('investor');
    } else if (currentPage === 'gallery') {
      setActiveSection('galeri');
    } else if (currentPage === 'articles') {
      setActiveSection('news');
    } else if (currentPage === 'contact') {
      setActiveSection('contact');
    } else if (currentPage === 'about') {
      setActiveSection('about');
    } else if (currentPage === 'sewa') {
      setActiveSection('sewa');
    } else if (currentPage === 'tracking') {
      setActiveSection('tracking');
    } else if (currentPage === 'auth') {
      setActiveSection('auth');
    } else {
      setActiveSection('home');
    }
  }, [currentPage]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Menu navigasi: 'KONTAK' lalu di kanannya 'TENTANG KAMI'
  const navItems = [
    { title: "BERANDA", action: "home" },
    { title: "PRODUK KAMI", action: "programs" },
    { title: "INVESTOR", action: "investor" },
    { title: "GALERI", action: "galeri" },
    { title: "ARTIKEL", action: "news" },
    { title: "KONTAK", action: "contact" },
    { title: "TENTANG KAMI", action: "about" }
  ];

  const handleItemClick = (item) => {
    if (item.action) {
      setActiveSection(item.action);
      onNavigateSection(item.action);
    } else if (item.link) {
      window.open(item.link, '_blank');
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Signature top yellow accent stripe (sesuai identitas UII) */}
      <div className="w-full h-1 sm:h-1.5 bg-uii-gold shadow-xs" />

      {/* Main navigation header - Solid Blue di page produk/scroll, gradien halus di home banner */}
      <nav
        className={`transition-all duration-300 ease-in-out border-none ${isSolidHeader
            ? 'bg-uii-blue-900 shadow-md py-2.5 sm:py-3'
            : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-3 sm:py-4'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          {/* Logo brand */}
          <a
            href="#"
            onClick={(e) => { 
              e.preventDefault(); 
              setActiveSection('home');
              if (onNavigateSection) onNavigateSection('home');
              window.scrollTo({ top: 0, behavior: 'smooth' }); 
            }}
            className="flex items-center group py-0.5 focus:outline-none flex-shrink-0 mr-4"
          >
            <img
              src="/images/logo/logo.png"
              alt="FTI UII Logo"
              className={`w-auto object-contain transition-all duration-300 drop-shadow-md group-hover:scale-105 ${isSolidHeader ? 'h-9 sm:h-11 lg:h-12' : 'h-10 sm:h-12 lg:h-14'
                }`}
            />
          </a>

          {/* Desktop Navigation Links dengan Garis Bawah (Underline) rapi & whitespace-nowrap */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navItems.map((item, index) => {
              const isActive = activeSection === item.action;
              return (
                <button
                  key={index}
                  onClick={() => handleItemClick(item)}
                  className={`group relative px-2.5 xl:px-3.5 py-1.5 text-xs xl:text-sm font-bold tracking-wide uppercase transition-colors duration-200 outline-none focus:outline-none whitespace-nowrap ${
                    isActive 
                      ? 'text-uii-gold' 
                      : 'text-white hover:text-uii-gold'
                  }`}
                >
                  <span>{item.title}</span>

                  {/* Garis Bawah (Underline) smooth di bawah tulisan satu baris utuh */}
                  <span
                    className={`absolute bottom-0 left-2 right-2 h-0.5 bg-uii-gold rounded-full transition-all duration-300 ease-out origin-center pointer-events-none ${
                      isActive 
                        ? 'opacity-100 scale-x-100 shadow-glow' 
                        : 'opacity-0 scale-x-0 group-hover:opacity-40 group-hover:scale-x-75'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Action Buttons: Profile / Login / Register & Socials */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Profile / Auth Button (Arahkan ke New Page Login & Register) */}
            <button
              onClick={() => onNavigateSection && onNavigateSection('auth')}
              className={`p-2 rounded-xl text-white hover:text-uii-gold hover:bg-white/10 transition-colors focus:outline-none relative ${
                currentPage === 'auth' ? 'ring-2 ring-uii-gold text-uii-gold bg-white/20' : currentUser ? 'ring-2 ring-uii-gold/60 text-uii-gold bg-white/10' : ''
              }`}
              title={currentUser ? `Akun: ${currentUser.name}` : "Halaman Masuk / Daftar Akun BPA"}
              aria-label="Profil Pengguna"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              {currentUser && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-uii-blue-900" />
              )}
            </button>

            {/* Social media separator & circular white buttons (sesuai referensi: LinkedIn, Instagram, YouTube bulat putih) */}
            <div className="hidden lg:flex items-center space-x-2 pl-2 sm:pl-3 border-l border-white/20">
              <a
                href="https://id.linkedin.com/company/badan-pengelola-aset-km-uii"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-[#0c1f38] hover:bg-uii-gold transition-colors flex items-center justify-center shadow-sm flex-shrink-0"
                title="LinkedIn BPA KM UII"
              >
                <Linkedin className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
              </a>
              <a
                href="https://www.instagram.com/bpakmuii?igsh=aXFzZTc5OWhnZWZn"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-[#0c1f38] hover:bg-uii-gold transition-colors flex items-center justify-center shadow-sm flex-shrink-0"
                title="Instagram BPA KM UII"
              >
                <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
              <a
                href="https://youtube.com/@bpakmuii?si=-jrJDLgk9v5BAijs"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-[#0c1f38] hover:bg-uii-gold transition-colors flex items-center justify-center shadow-sm flex-shrink-0"
                title="YouTube BPA KM UII"
              >
                <Youtube className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
            </div>

            {/* Tombol Sewa Paling Kanan (Arahkan ke New Page Sewa) */}
            <div className="hidden sm:flex items-center pl-2">
              <button
                onClick={() => {
                  if (onNavigateSection) onNavigateSection('sewa');
                }}
                className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-sm ${
                  currentPage === 'sewa'
                    ? 'bg-uii-gold text-uii-blue-950 ring-2 ring-uii-gold/60 scale-105'
                    : 'bg-uii-gold hover:bg-yellow-400 text-uii-blue-950 hover:shadow-md hover:scale-105 active:scale-95'
                }`}
                title="Layanan Reservasi & Sewa Aset"
              >
                <Package className="w-3.5 h-3.5" />
                <span>Sewa</span>
              </button>
            </div>

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-white hover:text-uii-gold hover:bg-white/10 transition-colors focus:outline-none"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-uii-blue-950/98 backdrop-blur-md border-t border-uii-blue-800 px-4 pt-3 pb-6 space-y-2 overflow-hidden"
            >
              <div className="space-y-1">
                {navItems.map((item, idx) => {
                  const isActive = activeSection === item.action;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleItemClick(item)}
                      className={`w-full text-left py-2.5 px-3 text-sm font-bold tracking-wide uppercase border-b transition-colors ${
                        isActive
                          ? 'text-uii-gold border-uii-gold bg-white/5 pl-4'
                          : 'text-slate-100 hover:text-uii-gold border-uii-blue-900/60'
                      }`}
                    >
                      {item.title}
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 space-y-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onNavigateSection) onNavigateSection('auth');
                  }}
                  className="flex items-center justify-center space-x-2 w-full py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 transition-colors text-xs uppercase tracking-wider"
                >
                  <User className="w-4 h-4 text-uii-gold" />
                  <span>{currentUser ? `Akun: ${currentUser.name}` : 'Masuk / Daftar Akun'}</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onNavigateSection) onNavigateSection('sewa');
                  }}
                  className="flex items-center justify-center space-x-2 w-full py-2.5 bg-uii-gold text-uii-blue-950 font-bold rounded-xl shadow hover:bg-yellow-400 transition-colors text-xs uppercase tracking-wider"
                >
                  <Package className="w-4 h-4" />
                  <span>Sewa</span>
                </button>
              </div>

              {/* Mobile Social Media Icons */}
              <div className="pt-3 flex items-center justify-center space-x-3 border-t border-uii-blue-900/60 mt-3">
                <a
                  href="https://id.linkedin.com/company/badan-pengelola-aset-km-uii"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-white text-[#0c1f38] hover:bg-uii-gold transition-colors flex items-center justify-center shadow-sm"
                  title="LinkedIn BPA KM UII"
                >
                  <Linkedin className="w-4 h-4 fill-current" />
                </a>
                <a
                  href="https://www.instagram.com/bpakmuii?igsh=aXFzZTc5OWhnZWZn"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-white text-[#0c1f38] hover:bg-uii-gold transition-colors flex items-center justify-center shadow-sm"
                  title="Instagram BPA KM UII"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://youtube.com/@bpakmuii?si=-jrJDLgk9v5BAijs"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-white text-[#0c1f38] hover:bg-uii-gold transition-colors flex items-center justify-center shadow-sm"
                  title="YouTube BPA KM UII"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};
