import React from 'react';
import { 
  Linkedin, 
  Instagram, 
  Youtube, 
  MessageCircle
} from 'lucide-react';
import { siteData } from '../data/siteData';

export const Footer = ({ onNavigateSection }) => {
  const { meta } = siteData;

  const navLinks = [
    { title: "Beranda", action: "home" },
    { title: "Produk Kami", action: "programs" },
    { title: "Layanan Sewa Aset", action: "sewa" },
    { title: "Lacak Progres Sewa", action: "tracking" },
    { title: "Investor", action: "investor" },
    { title: "Galeri", action: "galeri" },
    { title: "Artikel", action: "news" },
    { title: "Kontak", action: "contact" },
    { title: "Tentang Kami", action: "about" }
  ];

  const handleLinkClick = (action) => {
    if (onNavigateSection) {
      onNavigateSection(action);
    } else {
      const el = document.getElementById(action);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer id="contact" className="bg-[#0c1f38] text-slate-300 relative border-t-2 border-white/10">
      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          
          {/* Column 1: Logo, Short About, Social Media (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center">
              <img
                src="/images/logo/logo.png"
                alt="Badan Pengelola Aset KM UII"
                className="h-16 sm:h-20 w-auto object-contain drop-shadow"
              />
            </div>

            <p className="text-sm text-slate-300 leading-relaxed max-w-md">
              BPA (Badan Pengelola Aset ) KM UII adalah sebuah organisasi yang telah berkembang yang awal mulanya disebut Tim Kerja Pengelola Aset SCC UII yang pertama kali dibentuk tahun 2014.
            </p>

            {/* Social Media Circular Buttons (sesuai referensi: bulat putih dengan ikon) */}
            <div className="pt-2 flex items-center space-x-3">
              <a
                href={meta.socials.linkedin || "https://linkedin.com"}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white text-[#0c1f38] hover:bg-uii-gold transition-colors flex items-center justify-center shadow-sm"
                title="LinkedIn BPA KM UII"
              >
                <Linkedin className="w-4 h-4 fill-current" />
              </a>
              <a
                href={meta.socials.instagram || "https://instagram.com"}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white text-[#0c1f38] hover:bg-uii-gold transition-colors flex items-center justify-center shadow-sm"
                title="Instagram BPA KM UII"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={meta.socials.youtube || "https://youtube.com"}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white text-[#0c1f38] hover:bg-uii-gold transition-colors flex items-center justify-center shadow-sm"
                title="YouTube BPA KM UII"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Information Links (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-lg font-bold text-white font-heading tracking-wide">
              Information
            </h3>
            <ul className="space-y-2.5 text-sm">
              {navLinks.map((link, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => handleLinkClick(link.action)}
                    className="text-slate-300 hover:text-uii-gold transition-colors text-left"
                  >
                    {link.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Kontak Kami (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-lg font-bold text-white font-heading tracking-wide">
              Kontak Kami
            </h3>

            <div className="space-y-3.5 text-sm text-slate-300 leading-relaxed">
              <p>
                {meta.address}
              </p>

              <p>
                <span>Telepon: </span>
                <a 
                  href={`tel:${meta.phone.replace(/[^0-9+]/g, '')}`} 
                  className="hover:text-uii-gold transition-colors font-medium text-white"
                >
                  {meta.phone}
                </a>
              </p>

              <p>
                <span>Email: </span>
                <a 
                  href={`mailto:${meta.email}`} 
                  className="hover:text-uii-gold transition-colors font-medium text-white"
                >
                  {meta.email}
                </a>
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Socket Bottom Copyright Bar */}
      <div className="border-t border-white/10 py-5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-slate-400 gap-4">
          <p>
            Copyright © 2024 Badan Pengelola Aset KM UII
          </p>
        </div>
      </div>
    </footer>
  );
};
