import React from 'react';
import { Home, Users, User, ArrowLeft, Download } from 'lucide-react';

export const InvestorPage = ({ onBackHome }) => {
  // Data Anggota & Pengurus BPA KM UII 2024/2025
  const presdir = {
    name: "IRFAN ARDIANSYAH",
    role: "PRESIDEN DIREKTUR",
    image: "/images/INVESTOR/Irfan-ArdiansyahArdiansyah.webp"
  };

  const adkeuTeam = [
    {
      name: "SYAHRIANI CINTIA WARDANNI",
      role: "MANAJER ADKEU",
      image: "/images/INVESTOR/Syahriani-Cintia-Wardanni-.png"
    },
    {
      name: "PUTRI NABILA QOTHRUNNADA",
      role: "STAFF ADMINISTRASI",
      image: "/images/INVESTOR/Putri-Nabila-Qothrunnada.png"
    },
    {
      name: "DWI ANNISA NABILA",
      role: "STAFF INFLOW",
      image: "/images/INVESTOR/Dwi-Annisa-Nabila.png"
    },
    {
      name: "AISYAH NAHDYA HAQ",
      role: "STAFF OUTFLOW",
      image: "/images/INVESTOR/Aisyah-Nahdya-Haq.png"
    }
  ];

  const pusTeam = [
    {
      name: "FAKHRUL ZIDAN NURROHMAN",
      role: "MANAJER PUS",
      image: "/images/INVESTOR/Fakhrul-Zidan-Nurrohman.png"
    },
    {
      name: "ANNISA FIQRIANI FAUZIA",
      role: "STAFF CUSTOMER SERVICE SAC",
      image: "/images/INVESTOR/Annisa-Fiqriani-Fauzia.png"
    },
    {
      name: "HAICAL MUSTAFID AMNA",
      role: "STAFF WAREHOUSING ALMAMATER DAN CATERING",
      image: "/images/INVESTOR/Haical-Mustafid-Amna.png"
    },
    {
      name: "RIZKI AHMAD FAUZI",
      role: "STAFF PENGELOLAAN ASET",
      image: "/images/INVESTOR/Rizki-Ahmad-Fauzi.png"
    }
  ];

  const pdpTeam = [
    {
      name: "ARKAN ABBAD FALAH WIBOWO",
      role: "MANAJER PDP",
      image: "/images/INVESTOR/Arkan-Abbad-Falah-Wibowo.png"
    },
    {
      name: "ANAIA GAIZKA MAULANA",
      role: "STAFF MARKETING OFFLINE",
      image: "/images/INVESTOR/Anaia-Gaizka-Maulana.png"
    },
    {
      name: "ANINDYA ARBA'ATUNNISA HIMAWAN",
      role: "STAFF MARKETING ONLINE",
      image: "/images/INVESTOR/Anindya-Arbaatunnisa-Himawan.png"
    },
    {
      name: "IKHSAN ARIFIANTO",
      role: "STAFF PUBLIKASI WEBSITE DAN MEDIA SOSIAL",
      image: "/images/INVESTOR/Ikhsan-Arifianto.png"
    }
  ];

  const pspTeam = [
    {
      name: "MUHAMMAD RYAN FEBRIANSYAH",
      role: "MANAJER PSP",
      image: "/images/INVESTOR/Muhammad-Ryan-Febriansyah.png"
    },
    {
      name: "AFFIQ LEKSONO NUGROHO",
      role: "STAFF CUSTOMER SERVICE PHOTOBOOTH",
      image: "/images/INVESTOR/Affiq-Leksono-Nugroho.png"
    },
    {
      name: "YANUAR VATOMY",
      role: "STAFF INVENTARIS",
      image: "/images/INVESTOR/Yanuar-Vatomy.png"
    }
  ];

  const psdmTeam = [
    {
      name: "MUHAMMAD RAKHA NANDA RESWARA",
      role: "MANAJER PSDM",
      image: "/images/INVESTOR/Muhammad-Rakha-Nanda-Reswara.png"
    },
    {
      name: "SALMA KUSUMA RACHMAWATI",
      role: "STAFF REKRUTMEN",
      image: "/images/INVESTOR/Salma-Kusuma-Rachmawati.png"
    },
    {
      name: "HUSEIN AL-HAIDAR",
      role: "STAFF PENILAIAN",
      image: "/images/INVESTOR/Husein-Al-Haidar.png"
    },
    {
      name: "PAQUITA AURELLIA PUTRI WIJAYA",
      role: "STAFF PENGEMBANGAN",
      image: "/images/INVESTOR/Paquita-Aurellia-Putri-Wijaya.png"
    },
    {
      name: "HISYAM ADHI MAULANA",
      role: "STAFF FUNGSIONARIS",
      image: "/images/INVESTOR/Hisyam-Adhi-Maulana.png"
    }
  ];

  // Komponen Card Anggota Organisasi (Sesuai Referensi Foto)
  const MemberCard = ({ member }) => {
    const [imgError, setImgError] = React.useState(false);

    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col items-center justify-between text-center w-full max-w-[250px] mx-auto group">
        <div>
          {/* Bingkai Foto Oval / Kapsul dengan Efek Dark Backdrop */}
          <div className="w-28 h-36 rounded-[48px] overflow-hidden bg-slate-700 mx-auto relative shadow-inner border-2 border-slate-100 flex items-center justify-center">
            {!imgError ? (
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-slate-600 to-slate-800 flex flex-col items-center justify-center text-white/70">
                <User className="w-12 h-12 text-slate-300" />
                <span className="text-[10px] font-bold text-slate-300 mt-1 uppercase tracking-wider">
                  {member.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </span>
              </div>
            )}
          </div>

          {/* Nama Anggota */}
          <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm font-heading tracking-wide uppercase mt-4 mb-1 leading-snug line-clamp-2">
            {member.name}
          </h4>
        </div>

        {/* Jabatan / Divisi */}
        <p className="text-[10px] sm:text-[11px] font-bold text-sky-600 uppercase tracking-wider mt-1">
          {member.role}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 sm:pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">

        {/* 1. Header Judul Halaman */}
        <div className="text-center mb-10 sm:mb-12">
          <h1 className="text-3xl sm:text-5xl font-black text-uii-blue-950 font-heading tracking-tight leading-tight">
            Struktur Organisasi
            <span className="block text-uii-blue-900 mt-1">BPA KM UII</span>
          </h1>
        </div>

        {/* 2. Bagan / Gambar Struktur Organisasi Resmi (Sesuai Referensi Foto bpakm.uii.ac.id/investor/) */}
        <div className="max-w-4xl mx-auto mb-10">
          <div className="rounded-3xl overflow-hidden shadow-elevated border border-slate-200/80 bg-[#122844]">
            <img
              src="/images/INVESTOR/DPM-UII-Komisi-IV.png"
              alt="Struktur Organisasi BPA KM UII"
              className="w-full h-auto object-contain block"
            />
          </div>
        </div>

        {/* 3. Teks Keterangan Pengantar */}
        <p className="text-center text-sm sm:text-base text-slate-600 max-w-3xl mx-auto mb-14 leading-relaxed">
          Struktur Organisasi BPA KM UII 2024/2025 Tahun ini dipimpin oleh seorang presiden direktur dan dibantu oleh lima manajer di setiap divisi.
        </p>

        {/* 4. Bagian Daftar Anggota per Divisi */}
        
        {/* Divisi: Presiden Direktur */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-uii-blue-950 font-heading text-center mb-6">
            Presiden Direktur
          </h2>
          <div className="flex justify-center">
            <MemberCard member={presdir} />
          </div>
        </section>

        {/* Divisi: Administrasi dan Keuangan (ADKEU) */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-uii-blue-950 font-heading text-center mb-8">
            Administrasi dan Keuangan (ADKEU)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {adkeuTeam.map((m, idx) => (
              <MemberCard key={idx} member={m} />
            ))}
          </div>
        </section>

        {/* Divisi: Pengembangan Usaha Strategis (PUS) */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-uii-blue-950 font-heading text-center mb-8">
            Pengembangan Usaha Strategis (PUS)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {pusTeam.map((m, idx) => (
              <MemberCard key={idx} member={m} />
            ))}
          </div>
        </section>

        {/* Divisi: Publikasi dan Pemasaran (PDP) */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-uii-blue-950 font-heading text-center mb-8">
            Publikasi dan Pemasaran (PDP)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {pdpTeam.map((m, idx) => (
              <MemberCard key={idx} member={m} />
            ))}
          </div>
        </section>

        {/* Divisi: Pengembangan Strategis dan Pengelolaan (PSP) */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-uii-blue-950 font-heading text-center mb-8">
            Pengembangan Strategis dan Pengelolaan (PSP)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {pspTeam.map((m, idx) => (
              <MemberCard key={idx} member={m} />
            ))}
          </div>
        </section>

        {/* Divisi: Pengembangan Sumber Daya Manusia (PSDM) */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-uii-blue-950 font-heading text-center mb-8">
            Pengembangan Sumber Daya Manusia (PSDM)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {psdmTeam.map((m, idx) => (
              <MemberCard key={idx} member={m} />
            ))}
          </div>
        </section>

        {/* 5. Bagian Surat Keputusan (SK) BPA KM UII (Sesuai Referensi Foto) */}
        <section className="mb-16 pt-10 border-t border-slate-200">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-uii-blue-950 font-heading mb-8">
            Surat Keputusan BPA KM UII
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* SK LPJ TW 2 */}
            <div className="flex flex-col space-y-3 max-w-[260px]">
              <div className="bg-white rounded-xl p-2.5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex items-center justify-center bg-slate-50 overflow-hidden group">
                <img
                  src="/images/INVESTOR/sk-lpj-tw2.png"
                  alt="SK Pengesahan LPJ TW 2 BPA KM UII"
                  className="w-full h-auto max-h-[320px] object-contain group-hover:scale-102 transition-transform duration-300"
                />
              </div>
              <h4 className="text-sm font-extrabold text-uii-blue-950 font-heading leading-snug">
                SK Pengesahan LPJ TW 2 BPA KM UII
              </h4>
              <a
                href="/docs/SK-Akreditasi-Teknik-Elektro-Program-Sarjana.pdf"
                download
                className="w-full py-2.5 px-4 rounded-md bg-[#38bdf8] hover:bg-[#0ea5e9] text-white font-bold text-xs transition-colors text-center inline-flex items-center justify-center space-x-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Laporan</span>
              </a>
            </div>

            {/* SK LPJ TW 4 */}
            <div className="flex flex-col space-y-3 max-w-[260px]">
              <div className="bg-white rounded-xl p-2.5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex items-center justify-center bg-slate-50 overflow-hidden group">
                <img
                  src="/images/INVESTOR/sk-lpj-tw4.png"
                  alt="SK Pengesahan LPJ TW 4 BPA KM UII"
                  className="w-full h-auto max-h-[320px] object-contain group-hover:scale-102 transition-transform duration-300"
                />
              </div>
              <h4 className="text-sm font-extrabold text-uii-blue-950 font-heading leading-snug">
                SK Pengesahan LPJ TW 4 BPA KM UII
              </h4>
              <a
                href="/docs/SK-Akreditasi-Teknik-Elektro-Program-Sarjana.pdf"
                download
                className="w-full py-2.5 px-4 rounded-md bg-[#38bdf8] hover:bg-[#0ea5e9] text-white font-bold text-xs transition-colors text-center inline-flex items-center justify-center space-x-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Laporan</span>
              </a>
            </div>
          </div>
        </section>

        {/* 6. Bagian Laporan Pertanggungjawaban (LPJ) BPA KM UII (Sesuai Referensi Foto) */}
        <section className="mb-16 pt-10 border-t border-slate-200">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-uii-blue-950 font-heading leading-tight">
              Laporan Pertanggung
              <span className="block">Jawaban BPA KM UII</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* LPJ TW 1 */}
            <div className="flex flex-col space-y-3 max-w-[260px]">
              <div className="rounded-xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-all group">
                <img
                  src="/images/INVESTOR/lpj-tw1.png"
                  alt="LPJ TW 1 BPA KM UII"
                  className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-300"
                />
              </div>
              <h4 className="text-sm font-extrabold text-uii-blue-950 font-heading leading-snug">
                LPJ TW 1 BPA KM UII
              </h4>
              <a
                href="/docs/SK-Akreditasi-Teknik-Elektro-Program-Sarjana.pdf"
                download
                className="w-full py-2.5 px-4 rounded-md bg-[#38bdf8] hover:bg-[#0ea5e9] text-white font-bold text-xs transition-colors text-center inline-flex items-center justify-center space-x-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Laporan</span>
              </a>
            </div>

            {/* LPJ TW 2 */}
            <div className="flex flex-col space-y-3 max-w-[260px]">
              <div className="rounded-xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-all group">
                <img
                  src="/images/INVESTOR/lpj-tw2.png"
                  alt="LPJ TW 2 BPA KM UII"
                  className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-300"
                />
              </div>
              <h4 className="text-sm font-extrabold text-uii-blue-950 font-heading leading-snug">
                LPJ TW 2 BPA KM UII
              </h4>
              <a
                href="/docs/SK-Akreditasi-Teknik-Elektro-Program-Sarjana.pdf"
                download
                className="w-full py-2.5 px-4 rounded-md bg-[#38bdf8] hover:bg-[#0ea5e9] text-white font-bold text-xs transition-colors text-center inline-flex items-center justify-center space-x-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Laporan</span>
              </a>
            </div>

            {/* LPJ TW 3 */}
            <div className="flex flex-col space-y-3 max-w-[260px]">
              <div className="rounded-xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-all group">
                <img
                  src="/images/INVESTOR/lpj-tw3.png"
                  alt="LPJ TW 3 BPA KM UII"
                  className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-300"
                />
              </div>
              <h4 className="text-sm font-extrabold text-uii-blue-950 font-heading leading-snug">
                LPJ TW 3 BPA KM UII
              </h4>
              <a
                href="/docs/SK-Akreditasi-Teknik-Elektro-Program-Sarjana.pdf"
                download
                className="w-full py-2.5 px-4 rounded-md bg-[#38bdf8] hover:bg-[#0ea5e9] text-white font-bold text-xs transition-colors text-center inline-flex items-center justify-center space-x-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Laporan</span>
              </a>
            </div>

            {/* LPJ TW 4 */}
            <div className="flex flex-col space-y-3 max-w-[260px]">
              <div className="rounded-xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-all group">
                <img
                  src="/images/INVESTOR/lpj-tw4.png"
                  alt="LPJ TW 4 BPA KM UII"
                  className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-300"
                />
              </div>
              <h4 className="text-sm font-extrabold text-uii-blue-950 font-heading leading-snug">
                LPJ TW 4 BPA KM UII
              </h4>
              <a
                href="/docs/SK-Akreditasi-Teknik-Elektro-Program-Sarjana.pdf"
                download
                className="w-full py-2.5 px-4 rounded-md bg-[#38bdf8] hover:bg-[#0ea5e9] text-white font-bold text-xs transition-colors text-center inline-flex items-center justify-center space-x-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Laporan</span>
              </a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
