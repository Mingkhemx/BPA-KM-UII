export const siteData = {
  meta: {
    facultyName: "Badan Pengelola Aset KM UII",
    universityName: "Universitas Islam Indonesia",
    tagline: "Badan Pengelola Aset Keluarga Mahasiswa Universitas Islam Indonesia",
    aboutShort: "BPA (Badan Pengelola Aset ) KM UII adalah sebuah organisasi yang telah berkembang yang awal mulanya disebut Tim Kerja Pengelola Aset SCC UII yang pertama kali dibentuk tahun 2014.",
    address: "Jalan Ngipiksari, Hargobinangun, Kec. Pakem, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55582",
    phone: "+6285233475595",
    fax: "+6285233475595",
    email: "bpa.km.uii@gmail.com",
    socials: {
      linkedin: "https://id.linkedin.com/company/badan-pengelola-aset-km-uii",
      instagram: "https://www.instagram.com/bpakmuii?igsh=aXFzZTc5OWhnZWZn",
      youtube: "https://youtube.com/@bpakmuii?si=-jrJDLgk9v5BAijs"
    }
  },

  heroSlides: [
    {
      id: 1,
      title: "Faculty of Industrial Technology",
      subtitle: "Welcome to FTI UII",
      description: "Pusat unggulan rekayasa dan teknologi berlandaskan nilai-nilai keislaman dan daya saing global berstandar internasional.",
      image: "/images/fit-uii.jpg",
      badge: "Islami & Berdaya Saing Global",
      ctaPrimary: { text: "Lihat Program Studi", action: "programs" },
      ctaSecondary: { text: "Kenali Lebih Dekat", action: "about" }
    },
    {
      id: 2,
      title: "Penerimaan Mahasiswa Baru",
      subtitle: "Bergabunglah Bersama Para Pemimpin Masa Depan",
      description: "Raih masa depan gemilang dengan pendidikan teknik dan industri terakreditasi internasional serta fasilitas riset modern.",
      image: "/images/Versi-Dekstop-1920x850-1.jpeg",
      badge: "PMB UII 2026/2027 Dibuka",
      ctaPrimary: { text: "Daftar PMB UII", link: "https://pmb.uii.ac.id/" },
      ctaSecondary: { text: "Pilihan Beasiswa", action: "scholarship" }
    },
    {
      id: 3,
      title: "Perguruan Tinggi Swasta #1 di Indonesia",
      subtitle: "Universitas Islam Indonesia",
      description: "Melangkah bersama kampus perjuangan yang berkomitmen mencetak teknokrat berakhlakul karimah dan siap bersaing di kancah dunia.",
      image: "/images/nomor-1-uii.png",
      badge: "Akreditasi Unggul BAN-PT & Internasional",
      ctaPrimary: { text: "Prestasi & Akreditasi", action: "stats" },
      ctaSecondary: { text: "Tur Kampus", action: "video" }
    },
    {
      id: 4,
      title: "Welcome Future Engineers!",
      subtitle: "Inovasi Tanpa Batas di FTI UII",
      description: "Laboratorium berteknologi tinggi, kemitraan industri nasional & global, serta program dual degree ke universitas mitra di luar negeri.",
      image: "/images/welcome-engineer.png",
      badge: "World-Class Engineering Faculty",
      ctaPrimary: { text: "Jelajahi Fasilitas", action: "facilities" },
      ctaSecondary: { text: "Pusat Riset", action: "services" }
    }
  ],

  stats: [
    { label: "Program Studi Unggulan", value: "10+", suffix: "Prodi", desc: "Sarjana, Magister, Doktor & Profesi" },
    { label: "Akreditasi Unggul & A", value: "100%", suffix: "Prodi", desc: "Standar BAN-PT, LAM-Teknik & IABEE" },
    { label: "Mahasiswa Aktif", value: "5.500+", suffix: "Orang", desc: "Dari seluruh pelosok Indonesia & dunia" },
    { label: "Mitra Industri & Global", value: "120+", suffix: "Mitra", desc: "Kerjasama dual degree & magang" },
  ],

  programs: [
    {
      id: "scc-hall",
      name: "Student Convention Center (SCC UII)",
      title: "Student Convention Center (SCC UII)",
      category: "Gedung & Venue",
      level: "Gedung Utama",
      tagline: "Convention Hall & Ruang Serbaguna Berkapasitas 1.500 Orang",
      image: "/images/asset-bpa/scc-uii.webp",
      imagePosition: "object-[center_38%]",
      description: "Student Convention Center (SCC) KM UII merupakan sarana representatif yang dikelola secara profesional untuk menyelenggarakan berbagai kegiatan berskala besar seperti seminar nasional, wisuda, pagelaran seni budaya, expo kewirausahaan, serta rapat akbar lembaga kemahasiswaan.",
      features: [
        "Kapasitas aula utama hingga 1.500 peserta",
        "Panggung modular luas dengan sistem pencahayaan panggung",
        "Sistem tata suara (sound system) akustik berstandar konvensi",
        "Pendingin ruangan terintegrasi (Full AC Central)",
        "Ruang transit VIP dan ruang ganti panitia khusus",
        "Area parkir luas dan aksesibilitas ramah disabilitas"
      ],
      tracks: [
        "Kapasitas 1.500 Orang",
        "Full AC Central",
        "VIP Lounge & Transit",
        "Acoustic Sound System"
      ],
      contactWa: "6281234567890",
      status: "Tersedia untuk Booking",
      price: "Rp 2.500.000 / hari"
    },
    {
      id: "sound-system",
      name: "Sewa Sound System & Speaker Aktif",
      title: "Sewa Sound System & Speaker Aktif",
      category: "Sewa Alat",
      level: "Audio & Visual",
      tagline: "Speaker Portable HTS P12E & Paket Audio Panggung",
      image: "/images/asset-bpa/sound-system.webp",
      imagePosition: "object-[center_22%]",
      description: "Penyewaan sound system portable HTS P12E lengkap dengan stand tripod, microphone wireless, dan kabel instalasi untuk kegiatan outdoor, rapat, senam, gathering, maupun panggung musyawarah.",
      features: [
        "Speaker aktif portable HTS P12E output bertenaga",
        "Stand tripod kokoh dengan pengaturan ketinggian fleksibel",
        "Konektivitas Bluetooth, USB, Aux, dan mic input ganda",
        "Microphone wireless jernih anti-interferensi",
        "Baterai rechargeable tahan lama untuk kebutuhan lapangan",
        "Mudah dimobilisasi dan siap pakai di berbagai titik lokasi"
      ],
      tracks: [
        "Portable HTS P12E",
        "Include Stand Tripod",
        "Mic Wireless Jernih",
        "Indoor & Outdoor"
      ],
      contactWa: "6281234567890",
      status: "Siap Digunakan"
    },
    {
      id: "handie-talkie",
      name: "Sewa Handie Talkie (HT) Event",
      title: "Sewa Handie Talkie (HT) Event",
      category: "Sewa Alat",
      level: "Komunikasi",
      tagline: "HT Baofeng & Toriphone Dual Band untuk Koordinasi Lapangan",
      image: "/images/asset-bpa/handie-talkie.webp",
      imagePosition: "object-[center_62%]",
      description: "Perangkat komunikasi HT dual band (Baofeng & Toriphone) dengan jangkauan sinyal luas, audio tajam, dan baterai prima untuk kelancaran koordinasi kepanitiaan acara dan pengamanan kegiatan.",
      features: [
        "HT Baofeng & Toriphone dual band VHF/UHF berdaya jangkau luas",
        "Baterai kapasitas tinggi siap pakai seharian penuh",
        "Kelengkapan charger dock, adapter, dan klip sabuk",
        "Handsfree / earpiece headset untuk komunikasi steril (opsional)",
        "Frekuensi terprogram dan bebas interferensi sinyal luar",
        "Tarif sewa ramah kantong khusus kepanitiaan mahasiswa"
      ],
      tracks: [
        "Baofeng & Toriphone",
        "Dual Band VHF/UHF",
        "Baterai Awet Seharian",
        "Include Charger & Klip"
      ],
      contactWa: "6281234567890",
      status: "Tersedia untuk Booking",
      price: "Rp 2.500.000 / hari"
    },
    {
      id: "jas-almamater",
      name: "Pengelolaan & Distribusi Jas Almamater",
      title: "Pengelolaan & Distribusi Jas Almamater",
      category: "Logistik Resmi",
      level: "Atribut Resmi",
      tagline: "Penyediaan Jas Almamater Resmi KM UII & Layanan Penukaran Ukuran",
      image: "/images/LEM-Pengembanngan-Karakter-Mahasiswa-1500x583.png",
      imagePosition: "object-center",
      description: "Unit pengadaan dan pelayanan resmi jas almamater bagi seluruh mahasiswa Universitas Islam Indonesia. Menjamin mutu bahan, ketepatan ukuran, dan kelancaran distribusi terpusat.",
      features: [
        "Bahan kain drill premium berstandar resmi universitas (adem dan kokoh)",
        "Bordir komputer logo UII presisi dan kancing logo embossed eksklusif",
        "Variasi ukuran lengkap mulai dari S, M, L, XL, XXL, hingga 4XL",
        "Posko penukaran ukuran (sizing exchange) dengan verifikasi cepat",
        "Terintegrasi dengan basis data mahasiswa KM UII"
      ],
      tracks: [
        "Bahan Drill Premium",
        "Emblem Bordir Presisi",
        "Size Lengkap S - 4XL",
        "Posko Penukaran Resmi"
      ],
      contactWa: "6281234567890",
      status: "Layanan Aktif"
    },
    {
      id: "tenda-lapangan",
      name: "Tenda Sarnafil & Peralatan Lapangan",
      title: "Tenda Sarnafil & Peralatan Lapangan",
      category: "Sewa Alat",
      level: "Logistik Acara",
      tagline: "Tenda Kerucut, Meja Display IBM & Kursi Chitose untuk Bazar",
      image: "/images/bantuan-logistik-2.jpg",
      description: "Penyewaan perlengkapan pameran, bazar kuliner, festival kemahasiswaan, dan stan outdoor. Tahan cuaca ekstrem dengan sistem perakitan cepat oleh kru logistik BPA.",
      features: [
        "Tenda kerucut (Sarnafil) ukuran 3x3 meter dan 5x5 meter warna putih bersih",
        "Meja lipat display IBM kokoh untuk stan pameran",
        "Kursi lipat Chitose berbusa nyaman",
        "Barikade pembatas antrean penonton konser / event",
        "Jasa antar, instalasi pemasangan, dan pembongkaran tepat waktu"
      ],
      tracks: [
        "Tenda Sarnafil 3x3 & 5x5",
        "Meja Display IBM",
        "Kursi Lipat Chitose",
        "Include Pemasangan"
      ],
      contactWa: "6281234567890",
      status: "Tersedia untuk Booking",
      price: "Rp 2.500.000 / hari"
    },
    {
      id: "sistem-informasi",
      name: "Sistem Informasi & Reservasi Aset",
      title: "Sistem Informasi & Reservasi Aset",
      category: "Digital & Kemitraan",
      level: "Layanan TI",
      tagline: "Platform Manajemen Aset & Peminjaman Online Terpadu",
      image: "/images/Slider-ImUII.png",
      description: "Layanan sistem informasi berbasis web yang memodernisasi tata kelola birokrasi peminjaman aset. Ormawa dapat memeriksa kalender ketersediaan ruangan secara real-time dan mengajukan perizinan tanpa kertas.",
      features: [
        "Kalender ketersediaan aset dan ruangan yang diperbarui secara langsung (real-time)",
        "Pengajuan perizinan dan booking online 24 jam",
        "Tracking status verifikasi dari pengelola BPA",
        "Sistem invoice digital dan transparansi biaya peminjaman",
        "Rekapitulasi utilisasi aset untuk pertanggungjawaban organisasi"
      ],
      tracks: [
        "Jadwal Real-Time",
        "Booking Online 24/7",
        "E-Perizinan Paperless",
        "Transparansi Tarif"
      ],
      contactWa: "6281234567890",
      status: "Platform Aktif"
    },
    {
      id: "space-kemitraan",
      name: "Space Promosi & Kemitraan Komersial",
      title: "Space Promosi & Kemitraan Komersial",
      category: "Digital & Kemitraan",
      level: "Media Kampus",
      tagline: "Titik Promosi Strategis & Booth Komersial di Lingkungan Kampus",
      image: "/images/Ruang-Kelas-FTI-UII-1500x1002.jpg",
      description: "Memberikan ruang promosi terpadu bagi perusahaan mitra, startup, maupun unit usaha mahasiswa untuk menjangkau puluhan ribu mahasiswa aktif UII melalui titik stan dan media luar ruang resmi.",
      features: [
        "Titik lokasi strategis di area lalu lintas padat mahasiswa (high-traffic zones)",
        "Opsi pemasangan standing banner, spanduk resmi, dan baliho promosi",
        "Paket aktivasi brand, sampling produk, dan open recruitment perusahaan",
        "Perizinan legal dan terkoordinasi dengan otoritas kampus",
        "Fleksibilitas durasi sewa (harian, mingguan, atau bulanan)"
      ],
      tracks: [
        "Titik High-Traffic",
        "Booth Aktivasi Brand",
        "Standing Banner Resmi",
        "Izin Legal Kampus"
      ],
      contactWa: "6281234567890",
      status: "Terbuka untuk Mitra"
    }
  ],

  news: [
    {
      id: 1,
      title: "BPA KM UII Gelar Pelatihan Manajemen Aset & Logistik Acara Mahasiswa 2026",
      category: "Pelatihan",
      date: "30 Oktober 2026",
      excerpt: "BPA KM UII menyelenggarakan workshop teknis manajemen logistik, standardisasi instalasi sound system, dan mitigasi resiko panggung bagi seluruh pengurus ormawa se-UII.",
      image: "/images/DSC02523_1MB.jpg",
      author: "Tim Litbang BPA",
      readTime: "3 min baca",
      content: `Yogyakarta, 30 Oktober 2026 – Badan Pengelola Aset Keluarga Mahasiswa Universitas Islam Indonesia (BPA KM UII) sukses menggelar pelatihan intensif bertajuk "Manajemen Aset & Keamanan Logistik Acara Kemahasiswaan 2026" di Hall Student Convention Center (SCC) UII.

Pelatihan ini diikuti oleh perwakilan divisi perlengkapan dari berbagai Lembaga Eksekutif Mahasiswa (LEM), Dewan Perwakilan Mahasiswa (DPM), serta Unit Kegiatan Mahasiswa (UKM) di lingkungan UII. Materi pelatihan meliputi teknik instalasi audio panggung berdaya besar, manajemen kelistrikan yang aman, protokol peminjaman HT frekuensi khusus kampus, serta prosedur pemeliharaan aset selama acara berlangsung.

"Tujuan kami adalah mengedukasi kawan-kawan panitia ormawa agar kegiatan kampus terselenggara dengan standar keselamatan tinggi, minim kendala teknis, dan aset mahasiswa tetap terawat secara optimal," ungkap Kepala Divisi Operasional BPA KM UII.`
    },
    {
      id: 2,
      title: "Corporate Social Responsibility (CSR): Optimalisasi Fasilitas Kampus Ramah Lingkungan & Inklusif",
      category: "CSR & Sinergi",
      date: "27 Oktober 2026",
      excerpt: "Komitmen BPA KM UII dalam merawat keberlanjutan fasilitas umum melalui modernisasi pencahayaan hemat energi serta penyediaan aksesibilitas gedung bagi mahasiswa disabilitas.",
      image: "/images/Bantuan-Untuk-Mahasiswa-Terdampak-Covid-19.jpg",
      author: "BPA Media Center",
      readTime: "4 min baca",
      content: `Yogyakarta, 27 Oktober 2026 – Sebagai wujud kepedulian sosial kemahasiswaan dan keberlanjutan lingkungan, BPA KM UII meluncurkan inisiatif program Corporate Social Responsibility (CSR) bertajuk "Green & Inclusive Campus Assets".

Melalui inisiatif ini, BPA KM UII telah meremajakan seluruh tata pencahayaan panggung gedung SCC UII menggunakan lampu LED hemat daya hingga 40%, serta memasang ramp aksesibilitas kursi roda terstandar di pintu masuk gedung convention center.

Selain itu, BPA KM UII juga mengalokasikan subsidi khusus biaya sewa inventaris untuk kegiatan kemahasiswaan yang bertemakan pengabdian masyarakat desa mitra dan bakti sosial mahasiswa kurang mampu.`
    },
    {
      id: 3,
      title: "Laporan Terbuka Utilisasi dan Pemeliharaan Gedung Student Convention Center (SCC UII)",
      category: "Laporan Aset",
      date: "22 Oktober 2026",
      excerpt: "Publikasi berkala rekapitulasi 50+ agenda ormawa, pemeliharaan sistem AC central 60 PK, kalibrasi audio, dan transparansi alokasi pendapatan sewa gedung.",
      image: "/images/asset-bpa/scc-uii.webp",
      author: "Sekretariat BPA",
      readTime: "5 min baca",
      content: `Yogyakarta, 22 Oktober 2026 – Menjunjung tinggi prinsip akuntabilitas dan tata kelola transparan, BPA KM UII secara terbuka merilis Laporan Berkala Utilisasi dan Pemeliharaan Fasilitas SCC UII untuk Triwulan Ketiga 2026.

Laporan ini memuat rekapitulasi pelaksanaan 52 kegiatan organisasi mahasiswa, pemeliharaan berkala 8 unit kompresor AC central 60 PK, pembersihan akustik dinding hall, serta kalibrasi perangkat speaker aktif panggung. Seluruh surplus hasil pengelolaan sewa dialokasikan kembali untuk peremajaan aset bersama mahasiswa UII.`
    },
    {
      id: 4,
      title: "Jadwal dan Panduan Pengambilan Atribut Resmi Jas Almamater Mahasiswa UII",
      category: "Pengumuman",
      date: "18 Oktober 2026",
      excerpt: "Biro Pengelolaan Aset KM UII merilis alur penukaran kupon dan protokol tertib pengambilan jas almamater untuk memastikan kepuasan dan kecocokan ukuran mahasiswa.",
      image: "/images/LEM-Pengembanngan-Karakter-Mahasiswa-1500x583.png",
      author: "Divisi Logistik",
      readTime: "3 min baca",
      content: `Yogyakarta, 18 Oktober 2026 – Menginformasikan kepada seluruh mahasiswa Universitas Islam Indonesia yang telah melakukan pemesanan atribut resmi Jas Almamater UII, bahwa loket pengambilan logistik di Kantor BPA KM UII resmi dibuka secara bergelombang.

Mahasiswa diharapkan membawa kartu mahasiswa (KTM) atau bukti pemesanan digital. Tersedia ruang fitting khusus untuk memastikan kenyamanan ukuran jas sebelum serah terima dilakukan secara sah.`
    }
  ],

  announcements: [
    {
      id: "a1",
      title: "Informasi Ujian Tengah Semester (UTS) Ganjil Tahun Akademik 2026/2027",
      date: "19 Oktober 2026",
      category: "Akademik",
      badge: "Penting",
      link: "#",
      desc: "Jadwal resmi, tata tertib kehadiran, penggunaan kartu ujian digital, dan petunjuk teknis pelaksanaan UTS bagi seluruh mahasiswa FTI UII."
    },
    {
      id: "a2",
      title: "Informasi Pembagian Kelompok Taklim & PDQ Mahasiswa FTI UII Angkatan 2026 [Update #2]",
      date: "12 Oktober 2026",
      category: "Keislaman",
      badge: "Wajib",
      link: "#",
      desc: "Daftar kelompok, ruang halaqah, nama pembimbing tahsin dan jadwal pertemuan mingguan Program Pendalaman Al-Qur'an (PDQ) mahasiswa baru."
    },
    {
      id: "a3",
      title: "FTI UII Siapkan Calon Wisudawan Periode Oktober 2026 Hadapi Dunia Profesional",
      date: "06 Oktober 2026",
      category: "Alumni",
      badge: "Wisuda",
      link: "#",
      desc: "Jadwal pengambilan toga, gladi bersih prosesi wisuda, dan pendaftaran tracer study angkatan terbaru."
    },
    {
      id: "a4",
      title: "Pendaftaran Mengulang & Remediasi Ujian Akhir PDQ FTI Periode September–November",
      date: "03 September 2026",
      category: "Ujian",
      badge: "Info",
      link: "#",
      desc: "Kesempatan bagi mahasiswa semester akhir untuk melengkapi syarat kelulusan sertifikasi membaca Al-Qur'an dan ibadah praktis."
    }
  ],

  agendas: [
    {
      id: "ag1",
      title: "Halal Supply Chain Management Forum 2026: Dari Sertifikasi Menuju Ekosistem Terintegrasi",
      date: "15 November 2026",
      time: "08:30 - 15:30 WIB",
      location: "Auditorium Gedung KH. Mas Mansyur FTI UII",
      badge: "Konferensi Internasional"
    },
    {
      id: "ag2",
      title: "Workshop Artificial Intelligence in Modern Engineering & IoT Industry",
      date: "22 November 2026",
      time: "09:00 - 13:00 WIB",
      location: "Lab Multimedia & Riset Informatika Lantai 3",
      badge: "Workshop Riset"
    },
    {
      id: "ag3",
      title: "Temu Wali Mahasiswa Angkatan 2026: Sinergi Kampus dan Orang Tua",
      date: "05 Desember 2026",
      time: "08:00 - 12:00 WIB",
      location: "Grand Auditorium UII & Live Zoom",
      badge: "Pertemuan Civitas"
    }
  ],

  deanGreeting: {
    name: "Prof. Dr. Sri Kusumadewi, S.Si., M.T.",
    title: "Dekan Fakultas Teknologi Industri UII",
    photo: "/images/dr-yudi-prayudi-fti-uii.jpg", // fallback/profile photo
    quote: "Puji syukur kehadirat Allah SWT. FTI UII selalu berupaya menjadikan institusi ini sebagai rahmatan lil 'alamin dengan menyelenggarakan pendidikan teknologi berkualitas tinggi berlandaskan karakter khairo ummah.",
    paragraphs: [
      "Fakultas Teknologi Industri sebagai bagian tak terpisahkan dari Universitas Islam Indonesia berkomitmen melahirkan lulusan teknik yang tidak hanya menguasai sains dan rekayasa terdepan, tetapi juga memiliki integritas moral, kepemimpinan etis, dan kepedulian sosial tinggi.",
      "Melalui kurikulum terintegrasi, riset bertaraf internasional, program dual-degree serta fasilitas modern, kami siap mengantarkan mahasiswa menjadi insan berdaya saing global yang siap memimpin transformasi teknologi di masa depan."
    ],
    videoUrl: "https://www.youtube.com/embed/zTBIOO68F8I",
    videoTitle: "Video Profil Fakultas Teknologi Industri UII"
  },

  leadership: [
    {
      name: "Prof. Dr. Sri Kusumadewi, S.Si., M.T.",
      role: "Dekan Fakultas Teknologi Industri",
      dept: "Guru Besar Teknik Informatika",
      image: "/images/FTI-kuning.png"
    },
    {
      name: "Dr. Ir. Muhammad Khafidh, S.T., M.T., IPP.",
      role: "Wakil Dekan Bidang Akademik, Riset, dan Rekognisi",
      dept: "Dosen Tetap Teknik Mesin",
      image: "/images/Dr.-Ir.-Muhammad-Khafidh-S.T.-M.T.-IPP-300x300.jpg"
    },
    {
      name: "Dr. Ir. Wahyudi Budi Pramono, S.T., M.Eng., IPM.",
      role: "Wakil Dekan Bidang Keuangan dan Sumber Daya",
      dept: "Dosen Tetap Teknik Elektro",
      image: "/images/Dr.-Ir.-Wahyudi-Budi-Pramono-S.T.-M.Eng_.-IPM-300x300.jpg"
    },
    {
      name: "Dr. Ir. Agus Mansur, S.T., M.Eng.Sc., IPU., ASEAN Eng.",
      role: "Wakil Dekan Bidang Kemahasiswaan, Keislaman & Kealumnian",
      dept: "Dosen Tetap Teknik Industri",
      image: "/images/Dr.-Ir.-Agus-Mansur-S.T.-M.Eng_.Sc_.-IPU.-ASEAN-Eng-300x300.jpg"
    }
  ],

  testimonials: [
    {
      id: 1,
      name: "Muhammad Fathur Rahman",
      role: "Ketua Panitia Seminar Nasional & Expo KM UII",
      assetRented: "Sewa Student Convention Center (SCC UII)",
      classYear: "Penyewa SCC UII",
      position: "Ketua Panitia Seminar Nasional & Expo KM UII",
      quote: "Gedung SCC UII sangat representatif untuk agenda besar kami dengan 1.000+ peserta. Tata suaranya akustik prima, AC sangat dingin merata, dan panggungnya luas. Pelayanan pengurus BPA KM UII dari proses booking, survey H-7, hingga gladi bersih sangat responsif dan suportif!",
      image: "/images/M.-Rakhmat-Kurniawan.jpg",
      rating: 5
    },
    {
      id: 2,
      name: "Nabila Larasati",
      role: "Divisi Acara & Perlengkapan Festival Budaya Mahasiswa",
      assetRented: "Sewa Paket Sound System & Mic Wireless",
      classYear: "Penyewa Sound System Portable",
      position: "Divisi Perlengkapan Festival Budaya",
      quote: "Paket sound system aktif BPA KM UII benar-benar menyelamatkan panggung kegiatan kami. Suaranya bertenaga, vokal mic jernih tanpa feedback atau distorsi, serta baterai rechargeable-nya awet tahan lama. Sangat recommended untuk kegiatan ormawa maupun komunitas kampus.",
      image: "/images/Ricky-Yanuardi.jpg",
      rating: 5
    },
    {
      id: 3,
      name: "Eko Prasetyo Wibowo",
      role: "Koordinator Keamanan & Lapangan Musyawarah Mahasiswa",
      assetRented: "Sewa 25 Unit Handie Talkie (HT) Event",
      classYear: "Penyewa Handie Talkie (HT)",
      position: "Koordinator Keamanan Acara",
      quote: "Koordinasi tim keamanan antar pos di seluruh area kampus terpadu jadi super cepat berkat unit HT dari BPA KM UII. Kondisi unit sangat prima, baterai full pack tahan seharian penuh, dan charging dock lengkap. Serah terima barang sangat rapi dan tertib.",
      image: "/images/Esa-Wisnu-Prabowo.jpg",
      rating: 5
    },
    {
      id: 4,
      name: "Annisa Rahmadani",
      role: "Koordinator Kontingen Delegasi Mahasiswa UII",
      assetRented: "Pengadaan & Distribusi Jas Almamater",
      classYear: "Pengadaan Jas Almamater Resmi",
      position: "Koordinator Kontingen Delegasi Lomba",
      quote: "Kualitas bahan drill jas almamater dari BPA KM UII sangat nyaman dipakai, jahitan kuat, dan bordir lambang UII presisi. Ketersediaan ukurannya lengkap dan pengurus BPA sangat membantu dalam pendataan ukuran seluruh anggota delegasi.",
      image: "/images/Profile-picture1.png",
      rating: 5
    }
  ],

  services: [
    {
      title: "Riset & Pusat Studi",
      desc: "Pusat unggulan riset kecerdasan buatan, biomaterial, smart grid, logistik halal, dan nanoteknologi.",
      icon: "FlaskConical",
      badge: "Inovasi Global",
      link: "https://fit.uii.ac.id/pusat-studi/"
    },
    {
      title: "Layanan Akademik & SISO",
      desc: "Sistem Informasi Surat Online (SISO), Rencana Akademik Semester (RAS), dan Kalender Akademik.",
      icon: "FileText",
      badge: "Layanan Cepat",
      link: "https://s.id/SISOFTIUII"
    },
    {
      title: "UKM & Minat Bakat",
      desc: "Wadah pengembangan potensi kepemimpinan mahasiswa di bidang robotika, mobil listrik, otomotif, dan seni.",
      icon: "Users",
      badge: "Kemahasiswaan",
      link: "https://fit.uii.ac.id/komunitas/"
    },
    {
      title: "Bursa Kerja & Karir",
      desc: "Jembatan karir menghubungkan mahasiswa dan lulusan fresh graduate dengan ratusan perusahaan mitra.",
      icon: "Briefcase",
      badge: "Karir & Alumni",
      link: "https://fit.uii.ac.id/bursa-kerja/"
    },
    {
      title: "Kemitraan & Kolaborasi",
      desc: "Peluang kerja sama industri, penelitian bersama perguruan tinggi ternama, dan program double degree.",
      icon: "Handshake",
      badge: "Kerjasama",
      link: "https://fit.uii.ac.id/kerjasama/"
    },
    {
      title: "Sertifikat Akreditasi",
      desc: "Download langsung dokumen resmi akreditasi BAN-PT, LAM-Teknik, dan sertifikat IABEE internasional.",
      icon: "Award",
      badge: "Dokumen Resmi",
      action: "downloads"
    }
  ],

  downloads: [
    { name: "Sertifikat Akreditasi Teknik Informatika Unggul 2022", file: "/docs/Sertifikat_akreditasi_Informatika_Unggul_2022.pdf" },
    { name: "Sertifikat Akreditasi Magister Teknik Industri 2022-2027", file: "/docs/Sertifikat-Akreditasi-Unggul-LAM-Teknik-Prodi-Magister-Teknik-Industri-2022-2027.pdf" },
    { name: "Sertifikat Akreditasi Teknik Kimia A 2021", file: "/docs/Sertifikat-Akreditasi-Teknik-Kimia-2021.pdf" },
    { name: "Sertifikat Akreditasi Rekayasa Tekstil 2022-2027", file: "/docs/Sertifikat-Akreditasi-LAM-Teknik-Prodi-Rekayasa-Tekstil-2022-2027.pdf" },
    { name: "SK Akreditasi Teknik Elektro Program Sarjana", file: "/docs/SK-Akreditasi-Teknik-Elektro-Program-Sarjana.pdf" },
    { name: "Sertifikat Akreditasi Magister Informatika 2023-2028", file: "/docs/Sertifikat-Akreditasi-Unggul-BAN-PT-Prodi-Magister-Informatika-2023-2028.pdf" },
  ]
};

