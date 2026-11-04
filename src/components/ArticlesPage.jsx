import React, { useState, useMemo } from 'react';
import { 
  Home, 
  Search, 
  Calendar, 
  Clock, 
  User, 
  ArrowRight, 
  Tag, 
  BookOpen, 
  Sparkles,
  Share2,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';

export const ArticlesPage = ({ onBackHome, onOpenArticle }) => {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Koleksi Artikel & Berita Resmi BPA KM UII
  const articles = useMemo(() => [
    {
      id: 'art-1',
      title: 'Corporate Social Responsibility (CSR) BPA KM UII: Berkah Tumbuh Bersama Kita',
      category: 'CSR & Sosial',
      date: '15 Desember 2024',
      author: 'Humas BPA KM UII',
      readTime: '3 menit baca',
      image: '/images/artikel/csr-berkah.png',
      featured: true,
      excerpt: 'Program Corporate Social Responsibility (CSR) Badan Pengelola Aset KM UII bertajuk "Berkah Tumbuh Bersama Kita" kembali diselenggarakan sebagai wujud kepedulian nyata terhadap warga sekitar kampus UII.',
      content: `Program Corporate Social Responsibility (CSR) Badan Pengelola Aset KM UII bertajuk "Berkah Tumbuh Bersama Kita" kembali diselenggarakan sebagai wujud kepedulian nyata terhadap warga sekitar kampus UII.

Melalui kegiatan ini, fungsionaris BPA KM UII menyalurkan puluhan paket bahan pangan pokok dan bingkisan berkah kepada masyarakat yang membutuhkan di sekitar lingkungan kampus terpadu Universitas Islam Indonesia. Selain sebagai agenda rutin pengabdian masyarakat, kegiatan ini bertujuan mempererat tali silaturahmi antara civitas akademika keluarga mahasiswa dengan warga lokal.

Presiden Direktur BPA KM UII menyampaikan bahwa kepedulian sosial merupakan salah satu pilar nilai yang dipegang teguh oleh lembaga. Melalui pengelolaan aset kemahasiswaan yang berdaya guna, BPA KM UII berkomitmen terus memberikan dampak kebermanfaatan nyata bagi kemaslahatan umat.`
    },
    {
      id: 'art-2',
      title: 'Training Kelembagaan BPA KM UII 2024: Penguatan Sinergi & Tata Kelola Aset',
      category: 'Organisasi & Pelatihan',
      date: '23 November 2024',
      author: 'Divisi PSDM BPA KM UII',
      readTime: '4 menit baca',
      image: '/images/artikel/training-kelembagaan.jpg',
      excerpt: 'Seluruh fungsionaris BPA KM UII mengikuti agenda intensif Training Kelembagaan guna mengasah kompetensi kepemimpinan, akuntansi, dan operasional fasilitas kampus.',
      content: `Dalam rangka memperkuat kapasitas internal kepengurusan, seluruh fungsionaris Badan Pengelola Aset KM UII mengikuti agenda intensif Training Kelembagaan BPA KM UII 2024.

Pelatihan ini mencakup berbagai materi esensial, mulai dari manajemen operasional sarana kampus, akuntansi dan audit keuangan organisasi, standar pelayanan prima untuk penyewaan gedung SCC, hingga mitigasi risiko pemeliharaan perangkat audio dan komunikasi.

Kegiatan ini diharapkan mampu mencetak fungsionaris yang profesional, tangguh, dan akuntabel dalam menjalankan amanah pengelolaan aset milik seluruh mahasiswa Universitas Islam Indonesia.`
    },
    {
      id: 'art-3',
      title: 'Pembukaan Program Magang BPA KM UII Periode 2024/2025',
      category: 'Rekrutmen & Magang',
      date: '10 November 2024',
      author: 'Divisi PSDM BPA KM UII',
      readTime: '3 menit baca',
      image: '/images/artikel/program-magang.png',
      excerpt: 'BPA KM UII resmi membuka pendaftaran Program Magang bagi mahasiswa aktif UII yang ingin belajar manajemen event, akuntansi logistik, dan pengelolaan sarana kampus.',
      content: `Badan Pengelola Aset KM UII kembali membuka kesempatan emas bagi seluruh mahasiswa aktif Universitas Islam Indonesia melalui pembukaan Program Magang BPA KM UII periode 2024/2025.

Program ini menawarkan pengalaman berharga di berbagai divisi strategis, antara lain:
1. Administrasi & Keuangan (ADKEU)
2. Pengembangan Usaha Strategis (PUS)
3. Publikasi & Desain Promosi (PDP)
4. Pengelolaan Sarana Prasarana (PSP)
5. Pengembangan Sumber Daya Manusia (PSDM)

Peserta magang akan memperoleh pembinaan langsung dari manajer divisi, sertifikat resmi institusional, relasi kepemimpinan kampus, serta pengalaman nyata dalam mengelola fasilitas gedung berskala besar seperti Student Convention Center (SCC).`
    },
    {
      id: 'art-4',
      title: 'Pengadaan Booth Fitting Jas Almamater UII Secara Offline di Hall SCC',
      category: 'Layanan Mahasiswa',
      date: '18 September 2024',
      author: 'Divisi PUS BPA KM UII',
      readTime: '3 menit baca',
      image: '/images/artikel/fitting-almamater.png',
      excerpt: 'Fasilitasi fitting dan penukaran ukuran jas almamater resmi mahasiswa baru Universitas Islam Indonesia diselenggarakan secara tertib dan terjadwal di SCC.',
      content: `Guna memastikan kenyamanan dan kesesuaian atribut resmi mahasiswa baru Universitas Islam Indonesia, Badan Pengelola Aset KM UII menyelenggarakan layanan Booth Fitting Jas Almamater secara offline di Hall Student Convention Center (SCC).

Dalam layanan ini, mahasiswa baru dapat mencoba langsung berbagai ukuran jas almamater resmi (S, M, L, XL, hingga ukuran khusus) dengan bantuan staf logistik BPA. Sistem antrean digital dan pembagian sesi diterapkan untuk menjamin alur pelayanan berjalan tertib, cepat, dan nyaman.

Layanan ini merupakan bentuk komitmen BPA KM UII dalam memberikan pelayanan logistik kemahasiswaan yang prima, transparan, dan terstandarisasi.`
    },
    {
      id: 'art-5',
      title: 'Menelusuri Sejarah Gedung Student Convention Center (SCC UII)',
      category: 'Fasilitas & Sejarah',
      date: '12 September 2024',
      author: 'Tim Riset Sejarah BPA',
      readTime: '5 menit baca',
      image: '/images/artikel/sejarah-scc.png',
      excerpt: 'Rekam jejak berdirinya Student Convention Center (SCC) UII yang bermula dari Tim Kerja Pengelola Aset tahun 2014 hingga kini bertransformasi menjadi pusat kegiatan akbar mahasiswa.',
      content: `Gedung Student Convention Center (SCC) Universitas Islam Indonesia memiliki sejarah panjang yang lekat dengan denyut perjuangan kelembagaan mahasiswa.

Berawal pada tahun 2014 dengan dibentuknya Tim Kerja Pengelola Aset SCC UII, pengelolaan sarana ini terus berkembang hingga bertransformasi menjadi Badan Pengelola Aset (BPA) KM UII yang berbadan otonom dan profesional di bawah naungan Keluarga Mahasiswa UII.

Gedung yang memiliki daya tampung hingga 1.500 orang ini telah menjadi saksi bisu berbagai peristiwa bersejarah: wisuda universitas, seminar internasional, pentas seni budaya mahasiswa, hingga musyawarah kelembagaan. Penelusuran sejarah ini didokumentasikan sebagai bentuk dedikasi menjaga marwah dan kesinambungan aset kemahasiswaan bagi generasi mendatang.`
    },
    {
      id: 'art-6',
      title: 'Kolaborasi Inovatif: Sharing Session BPA KM UII Bersama Institut Pertanian Yogyakarta',
      category: 'Sinergi & Kemitraan',
      date: '20 Juni 2024',
      author: 'Humas BPA KM UII',
      readTime: '4 menit baca',
      image: '/images/artikel/sharing-instiper.png',
      excerpt: 'Sesi pertukaran wawasan dan studi banding tata kelola fasilitas kemahasiswaan antara perwakilan BPA KM UII dan Institut Pertanian Yogyakarta (INSTIPER).',
      content: `Sebagai wujud keterbukaan dan semangat kolaborasi antarkampus, Badan Pengelola Aset KM UII menerima kunjungan serta menyelenggarakan sharing session bersama delegasi kelembagaan mahasiswa Institut Pertanian Yogyakarta (INSTIPER).

Pertemuan ini membahas berbagai topik krusial mengenai digitalisasi reservasi fasilitas kampus, model bisnis kewirausahaan berbasis aset mahasiswa, pemeliharaan berkelanjutan perangkat audio panggung, serta pengelolaan inventaris tenda dan perlengkapan event.

Kegiatan ini diharapkan menjadi jembatan sinergi yang produktif dalam memperkuat jejaring kelembagaan mahasiswa di Daerah Istimewa Yogyakarta.`
    },
    {
      id: 'art-7',
      title: 'CSR Ramadhan BPA KM UII 2024: Pengajian Akbar dan Buka Puasa Bersama',
      category: 'CSR & Sosial',
      date: '28 Maret 2024',
      author: 'Humas BPA KM UII',
      readTime: '3 menit baca',
      image: '/images/artikel/ramadhan-berbagi.png',
      excerpt: 'Rangkaian silaturahmi keagamaan, pengajian penuh hikmah, dan buka puasa bersama fungsionaris serta anak yatim di bulan suci Ramadhan 1445 H.',
      content: `Menyemarakkan bulan suci Ramadhan 1445 H, Badan Pengelola Aset KM UII menggelar program CSR Ramadhan Berbagi yang diisi dengan pengajian akbar, santunan anak yatim, dan buka puasa bersama di lingkungan SCC UII.

Acara yang berlangsung khidmat ini dihadiri oleh jajaran pengurus, pembina, serta perwakilan lembaga kemahasiswaan tingkat universitas dan fakultas di UII.

Melalui program ini, BPA KM UII berikhtiar memupuk nilai-nilai religiusitas Islam, keikhlasan berkhidmat, dan kepedulian sosial di kalangan mahasiswa.`
    }
  ], []);

  // Filter Categories
  const categories = [
    'Semua',
    'CSR & Sosial',
    'Organisasi & Pelatihan',
    'Layanan Mahasiswa',
    'Fasilitas & Sejarah',
    'Sinergi & Kemitraan',
    'Rekrutmen & Magang'
  ];

  // Filter Logic
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchCat = selectedCategory === 'Semua' || art.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        art.title.toLowerCase().includes(q) || 
        art.excerpt.toLowerCase().includes(q) || 
        art.author.toLowerCase().includes(q) ||
        art.category.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [articles, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 selection:bg-uii-blue-900 selection:text-uii-gold">
      
      {/* 1. Hero Header Banner */}
      <section className="relative w-full pt-28 sm:pt-36 pb-16 sm:pb-24 bg-uii-blue-950 overflow-hidden text-center text-white select-none">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/asset-bpa/scc-uii.webp"
            alt="Artikel BPA KM UII"
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
            <span className="text-uii-gold font-bold">Artikel & Warta Resmi</span>
          </nav>

          {/* Big Bold Page Title */}
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-wider font-heading text-white drop-shadow-md">
            ARTIKEL & BERITA
          </h1>
          
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Pusat publikasi resmi, warta kegiatan organisasi, inisiatif CSR, laporan fasilitas kampus, dan panduan layanan Badan Pengelola Aset (BPA) KM UII.
          </p>
        </div>
      </section>

      {/* 2. Search & Category Filter Navigation Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 -mt-7 relative z-20 mb-12">
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-elevated border border-slate-200/80">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            
            {/* Search Input Bar */}
            <div className="relative w-full lg:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari artikel, kegiatan, CSR, fasilitas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-uii-blue-900 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Results Counter */}
            <div className="text-xs font-semibold text-slate-500 flex items-center space-x-1.5 self-end lg:self-center">
              <BookOpen className="w-4 h-4 text-uii-blue-900" />
              <span>Menampilkan <strong className="text-uii-blue-950 font-bold">{filteredArticles.length}</strong> artikel</span>
            </div>

          </div>

          {/* Category Filter Chips */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center space-x-2 overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center whitespace-nowrap">
              <Tag className="w-3.5 h-3.5 mr-1" />
              Kategori:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-uii-blue-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Articles Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredArticles.map((article) => (
              <article
                key={article.id}
                onClick={() => onOpenArticle && onOpenArticle(article)}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  {/* Card Image (Terkunci / Locked Aspect & Height: Rapi & Konsisten untuk Admin Upload) */}
                  <div className="relative w-full h-56 sm:h-60 md:h-64 bg-slate-100 overflow-hidden flex-shrink-0">
                    <img
                      src={article.image}
                      alt={article.title}
                      loading="lazy"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = '/images/banner/banner.jpg'; }}
                    />
                    
                    {/* Top Overlay Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-uii-blue-950/85 text-uii-gold backdrop-blur-md border border-white/10 shadow-xs">
                        {article.category}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 sm:p-6 space-y-3">
                    {/* Date & Read Time */}
                    <div className="flex items-center space-x-3 text-xs text-slate-400 font-semibold">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-uii-gold" />
                        <span>{article.date}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{article.readTime}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-extrabold text-uii-blue-950 text-base leading-snug font-heading group-hover:text-uii-blue-800 transition-colors line-clamp-2">
                      {article.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Author & Read CTA */}
                <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium flex items-center space-x-1.5 truncate max-w-[150px]">
                    <User className="w-3.5 h-3.5 text-uii-blue-900 flex-shrink-0" />
                    <span className="truncate">{article.author}</span>
                  </span>

                  <span className="inline-flex items-center space-x-1 text-uii-blue-900 font-bold group-hover:text-uii-gold transition-colors">
                    <span>Baca</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-bold">Tidak ada artikel yang cocok dengan filter atau kata kunci.</p>
            <button
              onClick={() => { setSelectedCategory('Semua'); setSearchQuery(''); }}
              className="mt-3 px-4 py-1.5 bg-uii-blue-900 text-white rounded-lg text-xs font-bold"
            >
              Reset Filter
            </button>
          </div>
        )}
      </section>

    </div>
  );
};

export default ArticlesPage;

