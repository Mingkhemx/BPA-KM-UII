import React from 'react';
import { 
  Home, 
  Shield, 
  Compass, 
  Target, 
  History, 
  CheckCircle2, 
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  HeartHandshake
} from 'lucide-react';
import { motion } from 'framer-motion';

export const AboutPage = ({ onBackHome }) => {
  const missionPoints = [
    "Mengoptimalkan pengelolaan aset lembaga berdasarkan prinsip-prinsip badan usaha yang professional, akuntabel dan transparan.",
    "Memperkuat sumber daya keuangan lembaga KM UII melalui sumbangan bagi hasil usaha.",
    "Mewujudkan SDM yang unggul, terampil, professional dalam menjalankan fungsi dan perannya sebagai pengelola aset lembaga.",
    "Mengoptimalkan pemanfaatan sistem informasi, kearsipan dan administrasi data organisasi.",
    "Menyelenggarakan usaha-usaha yang mampu menciptakan manfaat bagi mahasiswa dan masyarakat umum."
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24 selection:bg-uii-blue-900 selection:text-uii-gold">
      
      {/* 1. Hero Header Banner */}
      <section className="relative w-full pt-28 sm:pt-36 pb-16 sm:pb-24 bg-uii-blue-950 overflow-hidden text-center text-white select-none">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/asset-bpa/scc-uii.webp"
            alt="Tentang BPA KM UII"
            className="w-full h-full object-cover object-center filter brightness-40 blur-xs scale-105"
            onError={(e) => { e.target.src = '/images/banner/banner.jpg'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-uii-blue-950/85 to-uii-blue-950" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8">
          {/* Breadcrumb Navigation */}
          <nav className="inline-flex items-center space-x-2 text-xs text-blue-200 mb-6 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/15">
            <button 
              onClick={onBackHome}
              className="hover:text-uii-gold transition-colors flex items-center space-x-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </button>
            <span className="text-white/40">/</span>
            <span className="text-uii-gold font-bold">Tentang Kami</span>
          </nav>

          {/* Big Bold Page Title */}
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-wider font-heading text-white drop-shadow-md">
            TENTANG KAMI
          </h1>
          
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Mengenal filosofi identitas logo, arah visi misi kelembagaan, serta sejarah panjang transformasi Badan Pengelola Aset (BPA) Keluarga Mahasiswa Universitas Islam Indonesia.
          </p>
        </div>
      </section>

      {/* 2. Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 -mt-8 relative z-20 space-y-12 sm:space-y-16">
        
        {/* SECTION 1: Filosofi Logo BPA KM UII (Sesuai Referensi Gambar) */}
        <section className="bg-white rounded-3xl p-6 sm:p-12 border border-slate-200/90 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Teks Filosofi Logo (Kiri) */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center space-x-2 text-sky-700 font-extrabold text-xs uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>Identitas Lembaga</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-uii-blue-950 font-heading leading-tight">
                Filosofi Logo BPA KM UII
              </h2>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed text-justify sm:text-left">
                <strong>3 pilar utama BPA</strong> bermakna bahwa BPA sebagai organisasi yang menjalankan kegiatannya berdasarkan asas <em>best practices for transparency, professionalism,</em> dan <em>accountability</em>. Asas tersebut merupakan landasan dari BPA dalam menjalankan kegiatan organisasi.
              </p>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed text-justify sm:text-left">
                <strong>Segitiga ke atas</strong> bermakna bahwa BPA akan selalu mendukung segala upaya menuju perbaikan untuk mencapai tujuan organisasi. <strong>Segitiga ke bawah</strong> bermakna bahwa BPA akan selalu memperhatikan masyarakat, terutama membantu dalam pengabdian masyarakat dan sosial.
              </p>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed text-justify sm:text-left">
                <strong>Warna kuning</strong> yang artinya harapan. <strong>Warna biru</strong> berarti ketegasan, atau kewibawaan. <strong>Perisai</strong> bermakna bahwa BPA akan menjaga komitmen untuk mewujudkan tujuan lembaga KM UII.
              </p>

              {/* Nilai Utama Pills */}
              <div className="pt-2 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  Transparansi
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200">
                  Profesionalisme
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200">
                  Akuntabilitas
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Pengabdian Sosial
                </span>
              </div>
            </div>

            {/* Gambar Logo BPA KM UII (Kanan) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-50/70 rounded-2xl border border-slate-100">
              <img
                src="/images/tentang/logo-bpa-km-uii.png"
                alt="Logo BPA KM UII"
                className="w-64 sm:w-80 h-auto object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
                onError={(e) => { e.target.src = '/images/logo/Logo-BPA-KM-UII.png'; }}
              />
              <span className="mt-4 text-xs font-bold text-slate-400 tracking-wider uppercase text-center">
                Lambang Resmi BPA KM UII
              </span>
            </div>

          </div>
        </section>

        {/* SECTION 2: Visi BPA KM UII (Sesuai Referensi Gambar) */}
        <section className="bg-white rounded-3xl p-6 sm:p-12 border border-slate-200/90 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Gambar Compass Vision (Kiri) */}
            <div className="lg:col-span-5 flex items-center justify-center order-2 lg:order-1">
              <div className="w-full rounded-2xl overflow-hidden shadow-md border border-slate-100 bg-slate-900">
                <img
                  src="/images/tentang/visi-compass.png"
                  alt="Visi BPA KM UII"
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.target.src = '/images/banner/banner.jpg'; }}
                />
              </div>
            </div>

            {/* Teks Visi (Kanan) */}
            <div className="lg:col-span-7 space-y-4 order-1 lg:order-2">
              <div className="flex items-center space-x-2 text-uii-gold-600 font-extrabold text-xs uppercase tracking-wider">
                <Compass className="w-4 h-4 text-uii-gold" />
                <span>Arah Masa Depan</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-uii-blue-950 font-heading leading-tight">
                Visi BPA KM UII
              </h2>

              <blockquote className="p-5 sm:p-6 rounded-2xl bg-slate-50 border-l-4 border-uii-gold text-slate-700 text-base sm:text-lg font-medium leading-relaxed shadow-xs">
                "Menjadi organisasi yang secara berkelanjutan mengembangkan diri dan memberikan manfaat kepada umat dalam rangka mewujudkan tujuan lembaga KM UII melalui pengelolaan aset lembaga yang professional, akuntabel dan transparan."
              </blockquote>
            </div>

          </div>
        </section>

        {/* SECTION 3: Misi BPA KM UII (Sesuai Referensi Gambar) */}
        <section className="bg-white rounded-3xl p-6 sm:p-12 border border-slate-200/90 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Teks Misi (Kiri) */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center space-x-2 text-rose-600 font-extrabold text-xs uppercase tracking-wider">
                <Target className="w-4 h-4" />
                <span>Misi Strategis</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-uii-blue-950 font-heading leading-tight">
                Misi BPA KM UII
              </h2>

              <div className="space-y-3.5 pt-1">
                {missionPoints.map((point, index) => (
                  <div key={index} className="flex items-start space-x-3.5 group">
                    <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-uii-blue-900 text-uii-gold font-extrabold text-xs flex items-center justify-center shadow-xs mt-0.5 group-hover:scale-110 transition-transform">
                      {index + 1}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-0.5">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Gambar Target Misi (Kanan) */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="w-full rounded-2xl overflow-hidden shadow-md border border-slate-100 bg-slate-900">
                <img
                  src="/images/tentang/misi-target.png"
                  alt="Misi BPA KM UII"
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.target.src = '/images/banner/banner.jpg'; }}
                />
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 4: Sejarah BPA KM UII (Sesuai Referensi Gambar) */}
        <section className="bg-white rounded-3xl p-6 sm:p-12 border border-slate-200/90 shadow-sm">
          <div className="space-y-6">
            
            <div className="max-w-3xl">
              <div className="flex items-center space-x-2 text-blue-700 font-extrabold text-xs uppercase tracking-wider mb-2">
                <History className="w-4 h-4" />
                <span>Napak Tilas Perjalanan</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-uii-blue-950 font-heading leading-tight mb-4">
                Sejarah BPA KM UII
              </h2>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed text-justify sm:text-left">
                <strong>BPA (Badan Pengelola Aset ) KM UII</strong> adalah sebuah organisasi yang awalnya disebut <em>Tim Kerja Pengelola Aset SCC UII</em> yang pertama kali dibentuk tahun 2014. Terbentuknya BPA KM UII didasari atas kepentingan jangka panjang Lembaga KM UII yaitu dalam upaya mewujudkan kemandirian, serta proses perbaikan sistem kelembagaan sehingga dapat meningkatkan tata kelola di Lembaga KM UII.
              </p>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed text-justify sm:text-left mt-3">
                Unit Usaha BPA yang awalnya hanya mengandalkan penyewaan gedung SCC, sekarang terus berkembang hingga pada usaha-usaha lain diantaranya pengelolaan jas almamater, layanan sistem informasi, dan usaha strategis lainnya.
              </p>
            </div>

            {/* Gambar Ilustrasi Sejarah & Garis Waktu */}
            <div className="w-full rounded-2xl overflow-hidden shadow-md border border-slate-200/80 bg-slate-100">
              <img
                src="/images/tentang/sejarah-timeline.png"
                alt="Sejarah BPA KM UII"
                className="w-full h-auto object-contain block hover:scale-102 transition-transform duration-300"
                onError={(e) => { e.target.src = '/images/banner/banner.jpg'; }}
              />
            </div>

          </div>
        </section>

      </div>

    </div>
  );
};

export default AboutPage;

