// Utility Storage Terpadu Admin Dashboard BPA KM UII
// Mengelola data live yang persisten di localStorage untuk CMS Website, Akun Pengguna, dan Laporan Sewa

import { siteData } from '../data/siteData';
import { OFFICIAL_PRODUCTS } from '../data/officialProducts';
import { INITIAL_DEMO_TRACKING_BOOKINGS } from '../data/trackingData';
import { neonApi } from '../services/neonDb';

// 1. DATA DEFAULT AWAL
const DEFAULT_BANNERS = [
  {
    id: 1,
    title: "Badan Pengelola Aset KM UII",
    subtitle: "Pusat Pengelolaan & Penyewaan Fasilitas Kampus",
    description: "Layanan resmi peminjaman sarana prasarana Student Convention Center (SCC), inventaris audio multimedia, dan logistik acara bagi civitas akademika UII dan umum.",
    image: "/images/produk/detail/scc-wide.jpg",
    badge: "Resmi BPA KM UII",
    active: true
  },
  {
    id: 2,
    title: "Gedung Student Convention Center",
    subtitle: "Aula Pertemuan Utama Berkapasitas 1.500 Orang",
    description: "Venue representatif berpendingin udara (Full AC) lengkap dengan panggung modular, ruang transit VIP, dan akustik standar konvensi nasional.",
    image: "/images/asset-bpa/scc-uii.webp",
    badge: "Fasilitas Unggulan",
    active: true
  },
  {
    id: 3,
    title: "Inventaris Multimedia & Audio Terpadu",
    subtitle: "Sound System, Handy Talky, & Proyektor Event",
    description: "Perangkat terawat dengan uji kelayakan fisik berkala dan pendampingan kru teknis lapangan siap menyukseskan agenda Anda.",
    image: "/images/produk/detail/proyektor-angle.jpg",
    badge: "Kesiapan Lapangan 100%",
    active: true
  }
];

const DEFAULT_TESTIMONIALS = [
  {
    id: 1,
    name: "Ahmad Rizky Pratama",
    role: "Ketua Panitia",
    org: "Seminar Nasional Kewirausahaan KM UII",
    content: "Reservasi Gedung SCC melalui BPA sangat teratur dan transparan. Kalender bebas bentrok benar-benar membantu kepastian izin venue kami.",
    rating: 5,
    asset: "Gedung SCC & Sound HTS",
    date: "12 Oktober 2026"
  },
  {
    id: 2,
    name: "Nabila Zahra",
    role: "Divisi Perlengkapan",
    org: "Festival Budaya Mahasiswa UII",
    content: "HT Baofeng 10 unit baterainya awet seharian penuh dan mic wireless TNW suaranya sangat jernih tanpa interferensi frekuensi selama acara.",
    rating: 5,
    asset: "HT Baofeng & Mic Wireless",
    date: "25 Oktober 2026"
  },
  {
    id: 3,
    name: "Fajar Wicaksono",
    role: "Koordinator Acara",
    org: "Pelatihan Kepemimpinan Mahasiswa",
    content: "Layanan staf BPA sangat tanggap via WhatsApp. Serah terima alat tepat waktu dan ada checklist fisik kondisi barang sebelum digunakan.",
    rating: 5,
    asset: "Proyektor Epson EB-X400",
    date: "28 Oktober 2026"
  }
];

const DEFAULT_ARTICLES = [
  {
    id: "art-1",
    title: "BPA KM UII Gelar Pelatihan Manajemen Aset & Logistik Acara Ormawa",
    category: "Pelatihan & Ormawa",
    date: "30 Oktober 2026",
    readTime: "3 min baca",
    author: "Tim Litbang BPA",
    image: "/images/artikel/pemberitahuan-pemilihan-rektor.jpg",
    views: 342,
    excerpt: "Workshop teknis manajemen sarana prasarana, standardisasi instalasi kelistrikan event, dan panduan reservasi digital bagi panitia kegiatan di kampus UII."
  },
  {
    id: "art-2",
    title: "Corporate Social Responsibility (CSR): Optimalisasi Fasilitas Ramah Disabilitas di SCC",
    category: "Sosial & Lingkungan",
    date: "27 Oktober 2026",
    readTime: "4 min baca",
    author: "BPA Media Center",
    image: "/images/gallery/csr-berkah.png",
    views: 520,
    excerpt: "Komitmen BPA KM UII dalam merawat keberlanjutan fasilitas umum melalui modernisasi ramp akses kursi roda dan toilet ramah disabilitas di Student Convention Center."
  },
  {
    id: "art-3",
    title: "Laporan Terbuka Utilisasi dan Pemeliharaan Gedung Student Convention Center TW 3",
    category: "Laporan & Transparansi",
    date: "22 Oktober 2026",
    readTime: "5 min baca",
    author: "Sekretariat BPA",
    image: "/images/asset-bpa/scc-uii.webp",
    views: 890,
    excerpt: "Publikasi berkala rekapitulasi 50+ agenda ormawa, pemeliharaan sistem AC central 60 PK, dan kalibrasi sistem tata suara aula utama."
  }
];

const DEFAULT_TEAM_MEMBERS = [
  { id: "tm-1", name: "IRFAN ARDIANSYAH", role: "PRESIDEN DIREKTUR", division: "Direksi Utama", image: "/images/INVESTOR/Irfan-ArdiansyahArdiansyah.webp" },
  { id: "tm-2", name: "SYAHRIANI CINTIA WARDANNI", role: "MANAJER ADKEU", division: "Administrasi & Keuangan", image: "/images/INVESTOR/Syahriani-Cintia-Wardanni-.png" },
  { id: "tm-3", name: "PUTRI NABILA QOTHRUNNADA", role: "STAFF ADMINISTRASI", division: "Administrasi & Keuangan", image: "/images/INVESTOR/Putri-Nabila-Qothrunnada.png" },
  { id: "tm-4", name: "DWI ANNISA NABILA", role: "STAFF INFLOW", division: "Administrasi & Keuangan", image: "/images/INVESTOR/Dwi-Annisa-Nabila.png" },
  { id: "tm-5", name: "AISYAH NAHDYA HAQ", role: "STAFF OUTFLOW", division: "Administrasi & Keuangan", image: "/images/INVESTOR/Aisyah-Nahdya-Haq.png" },
  { id: "tm-6", name: "FAKHRUL ZIDAN NURROHMAN", role: "MANAJER PUS", division: "Pengelolaan Unit Sarana", image: "/images/INVESTOR/Fakhrul-Zidan-Nurrohman.png" },
  { id: "tm-7", name: "ANNISA FIQRIANI FAUZIA", role: "STAFF CUSTOMER SERVICE SAC", division: "Pengelolaan Unit Sarana", image: "/images/INVESTOR/Annisa-Fiqriani-Fauzia.png" },
  { id: "tm-8", name: "HAICAL MUSTAFID AMNA", role: "STAFF WAREHOUSING", division: "Pengelolaan Unit Sarana", image: "/images/INVESTOR/Haical-Mustafid-Amna.png" },
  { id: "tm-9", name: "ARKAN ABBAD FALAH WIBOWO", role: "MANAJER PDP", division: "Pengembangan & Publikasi", image: "/images/INVESTOR/Arkan-Abbad-Falah-Wibowo.png" },
  { id: "tm-10", name: "MUHAMMAD RYAN FEBRIANSYAH", role: "MANAJER PSP", division: "Pengelolaan Sarana Prasarana", image: "/images/INVESTOR/Muhammad-Ryan-Febriansyah.png" },
  { id: "tm-11", name: "MUHAMMAD RAKHA NANDA RESWARA", role: "MANAJER PSDM", division: "Pengembangan Sumber Daya", image: "/images/INVESTOR/Muhammad-Rakha-Nanda-Reswara.png" }
];

const DEFAULT_DOCUMENTS = [
  { id: "doc-1", title: "SK Pengesahan LPJ Triwulan 1 BPA KM UII", type: "SK", period: "Triwulan 1", date: "Maret 2026", fileImage: "/images/INVESTOR/sk-lpj-tw2.png", downloadUrl: "/docs/SK-Akreditasi-Teknik-Elektro-Program-Sarjana.pdf" },
  { id: "doc-2", title: "SK Pengesahan LPJ Triwulan 2 BPA KM UII", type: "SK", period: "Triwulan 2", date: "Juni 2026", fileImage: "/images/INVESTOR/sk-lpj-tw2.png", downloadUrl: "/docs/SK-Akreditasi-Teknik-Elektro-Program-Sarjana.pdf" },
  { id: "doc-3", title: "SK Pengesahan LPJ Triwulan 3 BPA KM UII", type: "SK", period: "Triwulan 3", date: "September 2026", fileImage: "/images/INVESTOR/sk-lpj-tw4.png", downloadUrl: "/docs/SK-Akreditasi-Teknik-Elektro-Program-Sarjana.pdf" },
  { id: "doc-4", title: "SK Pengesahan LPJ Triwulan 4 BPA KM UII", type: "SK", period: "Triwulan 4", date: "Desember 2026", fileImage: "/images/INVESTOR/sk-lpj-tw4.png", downloadUrl: "/docs/SK-Akreditasi-Teknik-Elektro-Program-Sarjana.pdf" },
  { id: "doc-5", title: "Laporan Pertanggungjawaban (LPJ) TW 1 BPA KM UII", type: "LPJ", period: "Triwulan 1", date: "Maret 2026", fileImage: "/images/INVESTOR/lpj-tw1.png", downloadUrl: "/docs/SK-Akreditasi-Teknik-Elektro-Program-Sarjana.pdf" },
  { id: "doc-6", title: "Laporan Pertanggungjawaban (LPJ) TW 2 BPA KM UII", type: "LPJ", period: "Triwulan 2", date: "Juni 2026", fileImage: "/images/INVESTOR/lpj-tw2.png", downloadUrl: "/docs/SK-Akreditasi-Teknik-Elektro-Program-Sarjana.pdf" },
  { id: "doc-7", title: "Laporan Pertanggungjawaban (LPJ) TW 3 BPA KM UII", type: "LPJ", period: "Triwulan 3", date: "September 2026", fileImage: "/images/INVESTOR/lpj-tw3.png", downloadUrl: "/docs/SK-Akreditasi-Teknik-Elektro-Program-Sarjana.pdf" },
  { id: "doc-8", title: "Laporan Pertanggungjawaban (LPJ) TW 4 BPA KM UII", type: "LPJ", period: "Triwulan 4", date: "Desember 2026", fileImage: "/images/INVESTOR/lpj-tw4.png", downloadUrl: "/docs/SK-Akreditasi-Teknik-Elektro-Program-Sarjana.pdf" }
];

const DEFAULT_GALLERY = {
  photos: [
    { id: "gp-1", title: "CSR BPA KM UII: Berkah Tumbuh Bersama Kita", category: "Kegiatan & CSR", date: "Desember 2024", image: "/images/gallery/csr-berkah.png", description: "Program bakti sosial pembagian berkah bagi masyarakat sekitar kampus UII." },
    { id: "gp-2", title: "Booth Fitting Almamater UII Ke-2", category: "Layanan & Kemitraan", date: "Desember 2024", image: "/images/gallery/booth-fitting-2.png", description: "Fitting dan distribusi jas almamater gelombang kedua untuk mahasiswa baru UII di SCC." },
    { id: "gp-3", title: "BPA In Action: One Vision & Synergy", category: "Organisasi", date: "Desember 2024", image: "/images/gallery/bpa-in-action.png", description: "Upgrading fungsionaris BPA KM UII guna memperkuat sinergi organisasi." },
    { id: "gp-4", title: "Pemasangan Kaca Prasasti Gedung SCC UII", category: "Fasilitas & Gedung", date: "September 2024", image: "/images/gallery/prasasti-scc.jpg", description: "Pemeliharaan berkala Student Convention Center (SCC) KM UII." }
  ],
  videos: [
    { id: "gv-1", title: "Pelantikan Virtual Fungsionaris BPA KM UII 2022", category: "Pelantikan Organisasi", date: "Dokumentasi 2022", youtubeId: "xvbcBVoYb6w", description: "Momen khidmat pengucapan ikrar kepengurusan BPA KM UII." },
    { id: "gv-2", title: "Company Profile BPA KM UII: Solusi Sarana Terpadu", category: "Profil Lembaga", date: "Dokumentasi 2023", youtubeId: "yAoLSRbwxL8", description: "Pengenalan tupoksi, layanan peminjaman aset, dan tata kelola gedung SCC." }
  ]
};

const DEFAULT_USERS = [
  { id: "usr-1", name: "Muhammad Fathir Al-Ghifari", email: "fathir.ghifari@gmail.com", phone: "081234567890", role: "Penyewa Mahasiswa", org: "Kepanitiaan Semnas KM UII", status: "Aktif", joinedDate: "12 Oktober 2026", totalBookings: 2 },
  { id: "usr-2", name: "Muhammad Farhan", email: "muhammad.farhan@gmail.com", phone: "081398765432", role: "Penyewa Mahasiswa", org: "Penyewa Mandiri", status: "Aktif", joinedDate: "18 Oktober 2026", totalBookings: 1 },
  { id: "usr-3", name: "DPM KM UII Komisi IV", email: "dpm.komisi4@uii.ac.id", phone: "082155443322", role: "Ormawa / Lembaga", org: "Dewan Permusyawaratan Mahasiswa", status: "Aktif", joinedDate: "01 September 2026", totalBookings: 5 },
  { id: "usr-4", name: "Kukuh Prasetyo", email: "kukuh.prasetyo@eventjogja.com", phone: "087766554433", role: "Penyewa Umum", org: "EO Wisata Edukasi Sleman", status: "Aktif", joinedDate: "25 Oktober 2026", totalBookings: 1 },
  { id: "usr-5", name: "Ahmad Zaki", email: "zaki.ahmad@gmail.com", phone: "081999887766", role: "Penyewa Mahasiswa", org: "Himpunan Mahasiswa Informatika", status: "Nonaktif", joinedDate: "05 Agustus 2026", totalBookings: 0 }
];

// 2. HELPER FUNCTIONS UNTUK STORAGE & SINKRONISASI NEON POSTGRESQL
export const adminStorage = {
  // Sinkronisasi data live dari Neon PostgreSQL
  initNeonSync: async () => {
    try {
      const [neonUsers, neonBookings, neonBanners, neonTestimonials, neonArticles] = await Promise.allSettled([
        neonApi.getUsers(),
        neonApi.getBookings(),
        neonApi.getBanners(),
        neonApi.getTestimonials(),
        neonApi.getArticles()
      ]);

      if (neonUsers.status === 'fulfilled' && Array.isArray(neonUsers.value) && neonUsers.value.length > 0) {
        localStorage.setItem('bpa_admin_users', JSON.stringify(neonUsers.value));
      }
      if (neonBookings.status === 'fulfilled' && Array.isArray(neonBookings.value) && neonBookings.value.length > 0) {
        localStorage.setItem('bpa_admin_bookings', JSON.stringify(neonBookings.value));
        localStorage.setItem('bpa_tracking_bookings', JSON.stringify(neonBookings.value));
      }
      if (neonBanners.status === 'fulfilled' && Array.isArray(neonBanners.value) && neonBanners.value.length > 0) {
        localStorage.setItem('bpa_cms_banners', JSON.stringify(neonBanners.value));
      }
      if (neonTestimonials.status === 'fulfilled' && Array.isArray(neonTestimonials.value) && neonTestimonials.value.length > 0) {
        localStorage.setItem('bpa_cms_testimonials', JSON.stringify(neonTestimonials.value));
      }
      if (neonArticles.status === 'fulfilled' && Array.isArray(neonArticles.value) && neonArticles.value.length > 0) {
        localStorage.setItem('bpa_cms_articles', JSON.stringify(neonArticles.value));
      }
    } catch (e) {
      console.warn('Neon sync warning:', e);
    }
  },

  // Banners
  getBanners: () => {
    try {
      const data = localStorage.getItem('bpa_cms_banners');
      return data ? JSON.parse(data) : DEFAULT_BANNERS;
    } catch {
      return DEFAULT_BANNERS;
    }
  },
  saveBanners: (banners) => {
    try {
      localStorage.setItem('bpa_cms_banners', JSON.stringify(banners));
      neonApi.saveBanners(banners).catch(console.warn);
    } catch {}
  },

  // Testimonials
  getTestimonials: () => {
    try {
      const data = localStorage.getItem('bpa_cms_testimonials');
      return data ? JSON.parse(data) : DEFAULT_TESTIMONIALS;
    } catch {
      return DEFAULT_TESTIMONIALS;
    }
  },
  saveTestimonials: (testimonials) => {
    try {
      localStorage.setItem('bpa_cms_testimonials', JSON.stringify(testimonials));
      if (Array.isArray(testimonials) && testimonials.length > 0) {
        neonApi.saveTestimonial(testimonials[0]).catch(console.warn);
      }
    } catch {}
  },

  // Products
  getProducts: () => {
    try {
      const data = localStorage.getItem('bpa_cms_products');
      return data ? JSON.parse(data) : OFFICIAL_PRODUCTS;
    } catch {
      return OFFICIAL_PRODUCTS;
    }
  },
  saveProducts: (products) => {
    try {
      localStorage.setItem('bpa_cms_products', JSON.stringify(products));
    } catch {}
  },

  // Articles
  getArticles: () => {
    try {
      const data = localStorage.getItem('bpa_cms_articles');
      return data ? JSON.parse(data) : DEFAULT_ARTICLES;
    } catch {
      return DEFAULT_ARTICLES;
    }
  },
  saveArticles: (articles) => {
    try {
      localStorage.setItem('bpa_cms_articles', JSON.stringify(articles));
      if (Array.isArray(articles) && articles.length > 0) {
        neonApi.saveArticle(articles[0]).catch(console.warn);
      }
    } catch {}
  },

  // Investor Team & Documents
  getTeam: () => {
    try {
      const data = localStorage.getItem('bpa_cms_team');
      return data ? JSON.parse(data) : DEFAULT_TEAM_MEMBERS;
    } catch {
      return DEFAULT_TEAM_MEMBERS;
    }
  },
  saveTeam: (team) => {
    try {
      localStorage.setItem('bpa_cms_team', JSON.stringify(team));
    } catch {}
  },

  getDocuments: () => {
    try {
      const data = localStorage.getItem('bpa_cms_docs');
      return data ? JSON.parse(data) : DEFAULT_DOCUMENTS;
    } catch {
      return DEFAULT_DOCUMENTS;
    }
  },
  saveDocuments: (docs) => {
    try {
      localStorage.setItem('bpa_cms_docs', JSON.stringify(docs));
    } catch {}
  },

  // Gallery
  getGallery: () => {
    try {
      const data = localStorage.getItem('bpa_cms_gallery');
      return data ? JSON.parse(data) : DEFAULT_GALLERY;
    } catch {
      return DEFAULT_GALLERY;
    }
  },
  saveGallery: (gallery) => {
    try {
      localStorage.setItem('bpa_cms_gallery', JSON.stringify(gallery));
    } catch {}
  },

  // Users
  getUsers: () => {
    try {
      const data = localStorage.getItem('bpa_admin_users');
      return data ? JSON.parse(data) : DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  },
  saveUsers: (users) => {
    try {
      localStorage.setItem('bpa_admin_users', JSON.stringify(users));
      if (Array.isArray(users) && users.length > 0) {
        neonApi.saveUser(users[0]).catch(console.warn);
      }
    } catch {}
  },

  // Rental Bookings
  getBookings: () => {
    try {
      const data = localStorage.getItem('bpa_admin_bookings');
      if (data) return JSON.parse(data);
      // fallback to tracking bookings
      const trackingData = localStorage.getItem('bpa_tracking_bookings');
      return trackingData ? JSON.parse(trackingData) : INITIAL_DEMO_TRACKING_BOOKINGS;
    } catch {
      return INITIAL_DEMO_TRACKING_BOOKINGS;
    }
  },
  saveBookings: (bookings) => {
    try {
      localStorage.setItem('bpa_admin_bookings', JSON.stringify(bookings));
      localStorage.setItem('bpa_tracking_bookings', JSON.stringify(bookings));
      if (Array.isArray(bookings) && bookings.length > 0) {
        neonApi.saveBooking(bookings[0]).catch(console.warn);
      }
    } catch {}
  },

  // Admin Auth Session
  getAdminAuth: () => {
    try {
      const session = localStorage.getItem('bpa_admin_session');
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  },
  saveAdminAuth: (user) => {
    try {
      localStorage.setItem('bpa_admin_session', JSON.stringify(user));
    } catch {}
  },
  clearAdminAuth: () => {
    try {
      localStorage.removeItem('bpa_admin_session');
    } catch {}
  }
};
