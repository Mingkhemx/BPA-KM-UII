import React from 'react';

export const DeanGreetingSection = () => {
  const unitUsahaList = [
    "Penyewaan SCC UII",
    "Pengelolaan Jas Almamater",
    "Layanan Sistem Informasi",
    "Usaha Strategis Lainnya"
  ];

  return (
    <section id="about" className="py-16 sm:py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Clean Content Card Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-white rounded-3xl p-6 sm:p-12 shadow-soft border border-slate-100">
          
          {/* Logo Visual (Left) - Pure Logo Image */}
          <div className="lg:col-span-5 flex justify-center items-center p-4">
            <img
              src="/images/logo/Logo-BPA-KM-UII.png"
              alt="Logo BPA KM UII"
              className="w-full max-w-xs sm:max-w-sm h-auto object-contain drop-shadow-sm hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* About Text Content (Right) */}
          <div className="lg:col-span-7 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-uii-blue-900">
              Seputar Tentang Kami
            </p>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-uii-blue-950 font-heading tracking-tight leading-snug">
              Badan Pengelola Aset (BPA) KM UII
            </h2>

            <div className="space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed">
              <p>
                <strong>BPA (Badan Pengelola Aset) KM UII</strong> adalah sebuah organisasi yang awalnya disebut Tim Kerja Pengelola Aset SCC UII yang pertama kali dibentuk tahun 2014.
              </p>
              <p>
                Terbentuknya BPA KM UII didasari atas kepentingan jangka panjang Lembaga KM UII yaitu dalam upaya mewujudkan kemandirian, serta proses perbaikan sistem kelembagaan sehingga dapat meningkatkan tata kelola di Lembaga KM UII.
              </p>
              <p>
                Unit Usaha BPA yang awalnya hanya mengandalkan penyewaan SCC, sekarang terus berkembang hingga pada usaha-usaha lain diantaranya pengelolaan jas almamater, layanan sistem informasi, dan usaha strategis lainnya.
              </p>
            </div>

            {/* Unit Usaha Highlights */}
            <div className="pt-4 mt-6 border-t border-slate-200/80">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5">
                Unit Usaha & Layanan Strategis
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {unitUsahaList.map((unit, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center space-x-3 pl-3 py-1.5 border-l-2 border-uii-blue-900/25 hover:border-uii-blue-900 transition-colors group"
                  >
                    <span className="text-xs font-mono font-bold text-amber-600 group-hover:text-amber-700">
                      0{idx + 1}
                    </span>
                    <span className="text-sm font-semibold text-slate-800 group-hover:text-uii-blue-950 transition-colors">
                      {unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
