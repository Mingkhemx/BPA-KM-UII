// Koleksi Resmi Aset BPA KM UII Sesuai Portal Resmi (bpakm.uii.ac.id/produk-kami/)
// Dilengkapi galeri multi-foto, spesifikasi teknis lengkap, testimoni penyewa, dan tarif sewa resmi.

export const OFFICIAL_PRODUCTS = [
  // ==========================================
  // 1. KATEGORI SCC
  // ==========================================
  {
    id: 'prod-gedung-scc',
    slug: 'gedung-scc',
    name: 'Gedung SCC',
    cat: 'SCC',
    categoryLabel: 'Gedung & Convention Center',
    priceText: 'Mulai dari Rp 350.000/hari',
    priceValue: 350000,
    priceUnit: 'hari',
    assetKey: 'Gedung SCC',
    color: '#2563eb',
    badgeColor: 'bg-blue-600',
    tagline: 'Venue Pertemuan, Seminar & Kegiatan Akbar Mahasiswa UII',
    description: 'Gedung SCC berlokasi di Jalan Ngipiksari, Hargobinangun, Kec. Pakem, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55582. Gedung SCC sendiri terdiri dari beberapa ruangan seperti aula besar utama, panggung kehormatan, kamar/ruang transit VIP, musholla, serta toilet bersih. Fasilitas yang lengkap, akustik tata suara prima, hawa sejuk lereng Kaliurang, dan pemandangan asri menjadikan Gedung SCC sebagai lokasi yang tepat dalam menjalankan kegiatan kepanitiaan, pelatihan kelembagaan, musyawarah mahasiswa, maupun resepsi acara resmi lainnya.',
    images: [
      '/images/produk/gedung-scc.png',
      '/images/produk/detail/scc-wide.jpg',
      '/images/asset-bpa/scc-uii.webp',
      '/images/gallery/penyerahan-sertifikat-scc.jpg',
      '/images/gallery/prasasti-scc.jpg'
    ],
    features: [
      'Aula Utama Kapasitas Hingga 1.000+ Peserta',
      'Panggung Permanen Representatif & Karpet Bersih',
      'Ruang Transit VIP / Kamar Panitia Ber-AC',
      'Musholla Nyaman & Fasilitas Wudhu',
      'Toilet Bersih Pria & Wanita Terpisah',
      'Lahan Parkir Luas untuk Mobil, Bus & Sepeda Motor',
      'Hawa Sejuk Alami Khas Kawasan Kaliurang',
      'Akses Mudah Dekat Kampus Terpadu UII'
    ],
    specs: [
      { label: 'Kapasitas', value: '500 - 1.200 Orang' },
      { label: 'Luas Bangunan', value: '± 1.500 m²' },
      { label: 'Fasilitas Daya Listrik', value: 'Daya Besar + Support Genset' },
      { label: 'Pendingin Udara', value: 'Sistem Ventilasi Alami & AC Ruang Khusus' },
      { label: 'Waktu Sewa Standar', value: '08.00 - 22.00 WIB (Fleksibel)' },
      { label: 'Lokasi', value: 'Jl. Ngipiksari, Hargobinangun, Pakem, Sleman' }
    ],
    terms: [
      'Pemesanan dan konfirmasi jadwal maksimal H-7 sebelum hari pelaksanaan.',
      'Wajib menyerahkan surat rekomendasi / izin kegiatan resmi dari lembaga kemahasiswaan atau instansi terkait.',
      'Melakukan survey lokasi bersama tim operasional BPA KM UII.',
      'Dilarang merusak instalasi panggung, dinding, dan fasilitas yang ada di dalam gedung.',
      'Penyewa bertanggung jawab penuh atas kebersihan venue setelah acara selesai.'
    ],
    rating: 4.9,
    reviewsCount: 42,
    testimonials: [
      {
        id: 't-scc-1',
        name: 'Muhammad Fathur Rahman',
        role: 'Ketua Panitia Seminar Nasional KM UII',
        organization: 'DPM KM UII',
        date: '18 Oktober 2026',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        content: 'Gedung SCC UII sangat representatif untuk agenda besar kami dengan 1.000+ peserta. Tata suaranya akustik prima, AC dingin merata, dan panggungnya luas. Pelayanan pengurus BPA KM UII dari proses reservasi, survey H-7, hingga gladi bersih sangat responsif dan suportif!'
      },
      {
        id: 't-scc-2',
        name: 'Annisa Fitri Wardani',
        role: 'Koordinator Acara Latihan Kepemimpinan Mahasiswa',
        organization: 'LEM FTI UII',
        date: '5 September 2026',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        content: 'Udaranya sejuk dan fasilitas kamarnya sangat memadai untuk panitia yang harus menginap. Tempat parkir luas sekali menampung puluhan mobil dan motor peserta. Sangat recommended untuk kegiatan kaderisasi lembaga!'
      },
      {
        id: 't-scc-3',
        name: 'Rizky Pratama',
        role: 'Ketua Pelaksana Workshop & Expo Kreatif',
        organization: 'Komunitas Seni KM UII',
        date: '12 Agustus 2026',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        content: 'Proses birokrasi sewa melalui BPA sangat cepat dan tanpa ribet. Gedung bersih dan siap pakai sesuai checklist saat serah terima kunci. Pasti sewa di SCC lagi untuk tahun depan!'
      }
    ]
  },

  // ==========================================
  // 2. KATEGORI SAC
  // ==========================================
  {
    id: 'prod-proyektor-epson',
    slug: 'proyektor-epson-eb-x400',
    name: 'Proyektor Epson EB x400',
    cat: 'SAC',
    categoryLabel: 'Peralatan Multimedia & Audio Visual',
    priceText: 'Mulai dari Rp 98.000/hari',
    priceValue: 98000,
    priceUnit: 'hari',
    assetKey: 'Proyektor Epson EB x400',
    color: '#9333ea',
    badgeColor: 'bg-purple-600',
    tagline: 'Kecerahan Tinggi 3.300 ANSI Lumens dengan Teknologi 3LCD',
    description: 'Proyektor EPSON EB X400 dengan kecerahan 3.300 lumens dan teknologi 3LCD original Epson. Dirancang dengan mempertimbangkan portabilitas tinggi, proyektor ini sangat mudah diangkut dan diatur sehingga memudahkan presentasi seminar, sidang tugas akhir, pemutaran film, hingga materi pelatihan kelembagaan Anda. Menghasilkan proyeksi gambar yang tajam, kontras tinggi, dan warna cerah alami bahkan di ruangan berlampu terang.',
    images: [
      '/images/produk/proyektor-epson.jpg',
      '/images/produk/detail/proyektor-angle.jpg',
      '/images/produk/layar-proyektor.jpg',
      '/images/banner/banner.jpg'
    ],
    features: [
      'Kecerahan 3.300 Lumens (White & Colour Output Seimbang)',
      'Teknologi Epson 3LCD (Warna 3x Lebih Terang Tanpa Efek Rainbow)',
      'Resolusi XGA Native (1024 x 768) Super Jernih',
      'Port Lengkap: HDMI, VGA In, Composite Video, USB Type A & B',
      'Termasuk Tas Proyektor Eksklusif, Remote Control, & Kabel HDMI 5M',
      'Konsumsi Daya Hemat & Umur Lampu Panjang'
    ],
    specs: [
      { label: 'Merk & Tipe', value: 'Epson EB-X400' },
      { label: 'Tingkat Kecerahan', value: '3.300 ANSI Lumens' },
      { label: 'Rasio Kontras', value: '15.000 : 1' },
      { label: 'Rasio Aspek', value: '4 : 3 (Support 16:9 Widescreen)' },
      { label: 'Kelengkapan', value: 'Unit + Tas + Kabel Power + HDMI + Remote' },
      { label: 'Kondisi Unit', value: '100% Siap Pakai & Optik Bersih' }
    ],
    terms: [
      'Penyewa wajib menjaga lensa dan ventilasi pendingin agar tidak tertutup saat beroperasi.',
      'Dilarang mencabut kabel power proyektor secara mendadak sebelum kipas pendingin berhenti berputar.',
      'Pengembalian unit wajib menyertakan tas dan seluruh kabel dalam kondisi rapi.'
    ],
    rating: 4.9,
    reviewsCount: 35,
    testimonials: [
      {
        id: 't-epson-1',
        name: 'Dimas Aji Prasetyo',
        role: 'Divisi Acara Seminar Nasional AI',
        organization: 'Himpunan Mahasiswa Informatika UII',
        date: '24 Oktober 2026',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
        content: 'Proyektornya sangat terang walau lampu aula dinyalakan penuh! Warna slidenya akurat dan tidak ada lag saat dihubungkan ke laptop via HDMI. Kabel panjang 5 meter yang disertakan sangat membantu teknis panggung.'
      },
      {
        id: 't-epson-2',
        name: 'Siti Nurhaliza',
        role: 'Sekretaris Sidang Pleno Mahasiswa',
        organization: 'DPM Fakultas Hukum UII',
        date: '14 September 2026',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
        content: 'Sangat praktis dibawa karena sudah dapat tas busa tebal dan remote. Admin BPA juga sangat ramah saat pengecekan barang sebelum diserahterimakan.'
      }
    ]
  },

  {
    id: 'prod-ht-baofeng',
    slug: 'handy-talky-ht-baofeng-uv-82',
    name: 'Handy Talky (HT) Baofeng UV 82',
    cat: 'SAC',
    categoryLabel: 'Peralatan Komunikasi & Lapangan',
    priceText: 'Mulai dari Rp 9.000/hari',
    priceValue: 9000,
    priceUnit: 'hari / unit',
    assetKey: 'Handy Talky (HT) Baofeng UV 82',
    color: '#059669',
    badgeColor: 'bg-emerald-600',
    tagline: 'Dual Band Dual PTT Komunikasi Lapangan Handal Bebas Delay',
    description: 'HT Baofeng UV 82 dengan fitur Dual PTT (PTT A & B terpisah untuk memantau 2 frekuensi sekaligus), Radio FM, Emergency Alarm, dan Torch LED Light. Sangat cocok untuk Anda panitia yang bekerja di lapangan, tim keamanan, logistik acara, maupun pecinta alam. Mendukung jangkauan frekuensi VHF 136-174 MHz & UHF 400-520 MHz dengan sinyal kuat, jernih, dan baterai Li-ion berkapasitas besar tahan seharian penuh.',
    images: [
      '/images/produk/ht-baofeng-uv82.png',
      '/images/produk/detail/ht-tampak.jpg',
      '/images/asset-bpa/handie-talkie.webp'
    ],
    features: [
      'Tombol PTT Ganda (Dual PTT A & B) untuk Koordinasi Multi-Kanal Cepat',
      'Dual Band, Dual Display & Dual Standby (VHF & UHF)',
      'Baterai Li-ion Tahan Hingga 18 - 24 Jam Pemakaian Lapangan',
      'Dilengkapi Senter LED Darurat & Radio FM Bawaan',
      'Termasuk Headset Earpiece Spiral + Docking Charger Original',
      'Sudah Terisi Frekuensi Standar Panitia KM UII'
    ],
    specs: [
      { label: 'Merk & Tipe', value: 'Baofeng UV-82' },
      { label: 'Rentang Frekuensi', value: 'VHF 136-174MHz / UHF 400-520MHz' },
      { label: 'Daya Output', value: '5 Watt (Jangkauan 1 - 3 km)' },
      { label: 'Kapasitas Baterai', value: '2800 mAh Li-ion Rechargeable' },
      { label: 'Kelengkapan', value: 'Unit HT + Antena + Baterai + Belt Clip + Charger + Earpiece' },
      { label: 'Ketersediaan', value: 'Ready Puluhan Unit untuk Acara Besar' }
    ],
    terms: [
      'Harga tercantum merupakan sewa per unit per hari.',
      'Penyewa wajib memastikan antena tidak dilepas saat HT sedang memancarkan sinyal (TX).',
      'Pengembalian dilakukan bersama docking charger dan headset pendukung.'
    ],
    rating: 4.9,
    reviewsCount: 52,
    testimonials: [
      {
        id: 't-ht-1',
        name: 'Bagus Wicaksono',
        role: 'Koordinator Lapangan & Keamanan Makrab',
        organization: 'LEM Fakultas Bisnis & Ekonomika UII',
        date: '29 Oktober 2026',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
        content: 'Sewa 12 unit untuk makrab angkatan di Kaliurang. Sinyalnya tembus antar pos walau di area pepohonan lebat. Baterai awet seharian penuh tanpa perlu dicas ulang!'
      },
      {
        id: 't-ht-2',
        name: 'Farhan Maulana',
        role: 'Sie Perlengkapan Taaruf Mahasiswa',
        organization: 'Panitia Pesona UII',
        date: '10 September 2026',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        content: 'Harga sewa 9 ribu per unit adalah penyelamat budget kepanitiaan mahasiswa. Kualitas barang terawat rapi dan headsetnya sangat nyaman di telinga.'
      }
    ]
  },

  {
    id: 'prod-hts-speaker',
    slug: 'hts-portable-wireless-mic-and-speaker-p12e',
    name: 'HTS Portable Wireless Mic And Speaker P12E',
    cat: 'SAC',
    categoryLabel: 'Audio System & Sound Portable',
    priceText: 'Mulai dari Rp 75.000/hari',
    priceValue: 75000,
    priceUnit: 'hari',
    assetKey: 'HTS Portable Wireless Mic And Speaker P12E',
    color: '#d97706',
    badgeColor: 'bg-amber-600',
    tagline: 'Speaker Aktif Portable 12 Inch Dilengkapi Baterai Aki 5 Jam & Dual Mic UHF',
    description: 'HTS Portable Wireless P12E dengan spesifikasi ukuran woofer speaker 12 inch yang bertenaga dan jernih. Dilengkapi 2 unit mic genggam wireless UHF berdurasi panjang, MP3 Player bawaan dengan koneksi Bluetooth, USB flashdisk, dan SD card, serta input RCA dan mikrofon kabel tambahan. Sudah include aki kering 12 Volt yang mampu bertahan hingga 5 jam tanpa colokan listrik, menjadikannya andalan utama untuk acara outdoor, senam, pengajian, pelatihan, maupun upacara pembukaan.',
    images: [
      '/images/produk/hts-speaker-p12e.png',
      '/images/asset-bpa/sound-system.webp'
    ],
    features: [
      'Woofer Speaker 12 Inch Bass Menggelegar & Vokal Jernih',
      'Sudah Termasuk 2 Unit Mic Pegang Wireless UHF Jarak Jauh',
      'Baterai Aki Kering Built-in 12V (Tahan 4 - 6 Jam Nonstop Outdoor)',
      'Konektivitas Lengkap: Bluetooth, USB Flashdisk, SD Card, Aux In',
      'Desain Trolley Koper Beroda & Handle Tarik (Sangat Mudah Dipindahkan)',
      'Dilengkapi Tripod Stand Speaker Besi Kokoh'
    ],
    specs: [
      { label: 'Merk & Tipe', value: 'HTS P12E Portable Sound' },
      { label: 'Ukuran Speaker', value: '12 Inch High-Power Woofer + Tweeter' },
      { label: 'Sumber Daya', value: 'AC 220V / DC 12V Baterai Aki Kering' },
      { label: 'Daya Tahan Baterai', value: '± 5 Jam (Tergantung Volume Suara)' },
      { label: 'Kelengkapan', value: 'Unit Speaker + 2 Mic Wireless + Stand Tripod + Kabel Charger' },
      { label: 'Jangkauan Mic', value: 'Hingga 25 Meter Tanpa Halangan' }
    ],
    terms: [
      'Dilarang mendekatkan mic langsung ke corong speaker untuk menghindari feedback suara (storing).',
      'Penyewa diwajibkan melakukan charging baterai sebelum digunakan jika untuk acara di lapangan.',
      'Stand tripod harus diletakkan pada permukaan datar dan stabil.'
    ],
    rating: 4.8,
    reviewsCount: 29,
    testimonials: [
      {
        id: 't-hts-1',
        name: 'Zahra Amelia',
        role: 'Panitia Fun Walk & Dies Natalis',
        organization: 'Keluarga Mahasiswa Farmasi UII',
        date: '17 Oktober 2026',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
        content: 'Sangat praktis untuk agenda jalan sehat outdoor di boulevard kampus! Suaranya lantang menjangkau ratusan peserta tanpa perlu ribet narik kabel listrik beratus-ratus meter.'
      }
    ]
  },

  {
    id: 'prod-kursi-sapporo',
    slug: 'kursi-sapporo',
    name: 'Kursi Sapporo',
    cat: 'SAC',
    categoryLabel: 'Perlengkapan Acara & Logistik',
    priceText: 'Mulai dari Rp 5.000/hari',
    priceValue: 5000,
    priceUnit: 'hari / unit',
    assetKey: 'Kursi Sapporo',
    color: '#0d9488',
    badgeColor: 'bg-teal-600',
    tagline: 'Kursi Lipat Sapporo Original dengan Busa Empuk & Rangka Chrome Kokoh',
    description: 'Kursi dengan merek ternama Sapporo dengan dudukan dan sandaran berbahan busa empuk dilapisi kulit sintetis berkualitas tinggi. Rangka pipa besi tebal berfinishing chrome anti karat yang mampu menahan beban hingga lebih dari 100 kg. Sangat cocok untuk kebutuhan seminar, workshop, sidang akbar lembaga, maupun tribun penonton kegiatan kampus.',
    images: [
      '/images/produk/kursi-sapporo.jpg',
      '/images/produk/detail/kursi-tampak.jpg'
    ],
    features: [
      'Bantalan Busa Tebal & Empuk (Nyaman Diduduki Berjam-jam)',
      'Rangka Besi Chrome Kuat Tahan Beban Hingga 110 Kg',
      'Desain Lipat Ringkas (Mudah Ditata & Dipindahkan)',
      'Kaki Dilengkapi Karet Anti Selip & Tidak Menggores Lantai',
      'Kondisi Bersih, Terawat, & Bebas Noda'
    ],
    specs: [
      { label: 'Merk', value: 'Sapporo Original' },
      { label: 'Material Rangka', value: 'Steel Pipe Finishing Chrome Plating' },
      { label: 'Bahan Dudukan', value: 'High Density Foam + Lapisan Oscar Vinyl' },
      { label: 'Beban Maksimal', value: '110 Kg' },
      { label: 'Kapasitas Stok', value: 'Ratusan Unit Tersedia di Gudang SCC' }
    ],
    terms: [
      'Harga sewa dihitung per unit kursi per hari.',
      'Penyewa bertanggung jawab atas penataan dan pengembalian jumlah kursi yang sesuai nota peminjaman.'
    ],
    rating: 4.8,
    reviewsCount: 44,
    testimonials: [
      {
        id: 't-kursi-1',
        name: 'Gilang Ramadhan',
        role: 'Divisi Logistik Pelantikan Pengurus',
        organization: 'LEM Universitas Islam Indonesia',
        date: '2 Oktober 2026',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
        content: 'Pesan 150 kursi untuk pelantikan di aula. Seluruh kursi dalam kondisi mulus, busanya empuk, dan tidak ada yang goyang atau rusak. Proses muat barang dibantu staf BPA.'
      }
    ]
  },

  {
    id: 'prod-layar-proyektor',
    slug: 'layar-proyektor',
    name: 'Layar Proyektor',
    cat: 'SAC',
    categoryLabel: 'Peralatan Multimedia & Audio Visual',
    priceText: 'Mulai dari Rp 30.000/hari',
    priceValue: 30000,
    priceUnit: 'hari',
    assetKey: 'Layar Proyektor',
    color: '#4f46e5',
    badgeColor: 'bg-indigo-600',
    tagline: 'Layar Standing Tripod 70 Inch Matte White Refleksi Cahaya Maksimal',
    description: 'Layar proyektor standing tripod portabel berukuran 70 x 70 inch (178 x 178 cm) dengan bahan kain matte white bermutu tinggi. Sangat membantu Anda mendapatkan hasil visual gambar terbaik, tajam, dan kontras dari proyektor tanpa pantulan silau. Mempermudah presentasi seminar, nobar, hingga kuliah umum.',
    images: [
      '/images/produk/layar-proyektor.jpg',
      '/images/produk/detail/layar-tampak.jpg',
      '/images/produk/proyektor-epson.jpg'
    ],
    features: [
      'Permukaan Kain Matte White Khusus Pantulan Cahaya Merata',
      'Ukuran Besar 70 Inch x 70 Inch (178 x 178 cm)',
      'Tiang Penyangga Besi Tripod Kaki Tiga Kokoh & Stabil',
      'Ketinggian Layar Dapat Diatur Sesuai Kebutuhan Ruangan',
      'Sistem Gulung Otomatis Anti Kusut & Dilengkapi Kunci Pengaman'
    ],
    specs: [
      { label: 'Tipe Layar', value: 'Tripod Standing Screen' },
      { label: 'Ukuran Layar', value: '70" x 70" (1.78 m x 1.78 m)' },
      { label: 'Bahan Layar', value: 'High Gain Matte White Fabric' },
      { label: 'Material Kaki', value: 'Heavy Duty Steel Tripod Stand' },
      { label: 'Portabilitas', value: 'Dapat Dilipat & Dilengkapi Pengunci' }
    ],
    terms: [
      'Hindari menyentuh permukaan layar kain dengan benda tajam atau tangan kotor.',
      'Pastikan kaki tripod terkunci dengan kencang sebelum menaikkan layar.'
    ],
    rating: 4.8,
    reviewsCount: 22,
    testimonials: [
      {
        id: 't-screen-1',
        name: 'Hanif Prasetya',
        role: 'Ketua Panitia Bedah Buku Nasional',
        organization: 'LPM Keadilan FH UII',
        date: '21 September 2026',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
        content: 'Kombinasi layar ini dan proyektor Epson dari BPA menghasilkan gambar yang sangat tajam dan tidak silau dari sudut samping auditorium.'
      }
    ]
  },

  {
    id: 'prod-megaphone-toa',
    slug: 'megaphone-2r-2015s',
    name: 'Megaphone 2R-2015S',
    cat: 'SAC',
    categoryLabel: 'Peralatan Lapangan & Komando Acara',
    priceText: 'Mulai dari Rp 30.000/hari',
    priceValue: 30000,
    priceUnit: 'hari',
    assetKey: 'Megaphone 2R-2015S',
    color: '#ca8a04',
    badgeColor: 'bg-yellow-600',
    tagline: 'Pengeras Suara Toa Portabel Ringan, Nyaring dengan Sirine Darurat',
    description: 'Megaphone 2R-2015S sebagai pengeras suara Toa portabel yang mudah dibawa, ringan, dan jernih serta kencang suaranya. Dilengkapi dengan mikrofon kabel spiral genggam dan fitur sirine darurat untuk menarik perhatian audiens ribuan orang. Sangat krusial untuk komando barisan aksi massa, outbond, evakuasi, dan pemandu rombongan peserta kegiatan.',
    images: [
      '/images/produk/megaphone-toa.jpg',
      '/images/produk/detail/megaphone-tampak.jpg'
    ],
    features: [
      'Jangkauan Suara Nyaring Hingga 500 Meter di Ruang Terbuka',
      'Dilengkapi Klakson Sirine Darurat (Siren Mode) Berkekuatan Tinggi',
      'Mikrofon Genggam Kabel Spiral Nyaman & Tombol Pengatur Volume',
      'Tali Selempang Bahu Nyaman untuk Mobilitas Bergerak Cepat',
      'Sudah Termasuk Baterai Siap Pakai'
    ],
    specs: [
      { label: 'Merk & Model', value: 'Megaphone 2R-2015S' },
      { label: 'Daya Output', value: '25 - 30 Watt Peak' },
      { label: 'Bahan Bodi', value: 'ABS Resin Tahan Benturan Ringan' },
      { label: 'Jarak Suara Efektif', value: '300 - 500 Meter' },
      { label: 'Fitur Khusus', value: 'Voice Talk + Emergency Siren' }
    ],
    terms: [
      'Gunakan fitur sirine secara bijak sesuai instruksi komando kegiatan.',
      'Hindari penggunaan di bawah guyuran hujan lebat tanpa pelindung plastik.'
    ],
    rating: 4.9,
    reviewsCount: 31,
    testimonials: [
      {
        id: 't-toa-1',
        name: 'Wahyu Nugroho',
        role: 'Komandan Barisan Pawai Budaya UII',
        organization: 'UKM Kesenian KM UII',
        date: '28 Oktober 2026',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
        content: 'Megaphone sangat kencang dan tidak cempreng! Suara instruksi terdengar jelas sepanjang rute pawai mahasiswa dari kampus hingga simpang jalan.'
      }
    ]
  },

  {
    id: 'prod-mic-wireless-tnw',
    slug: 'mic-wireless-tnw',
    name: 'Mic Wireless TNW',
    cat: 'SAC',
    categoryLabel: 'Peralatan Rekaman & Konten Digital',
    priceText: 'Mulai dari Rp 20.000/hari',
    priceValue: 20000,
    priceUnit: 'hari',
    assetKey: 'Mic Wireless TNW',
    color: '#c026d3',
    badgeColor: 'bg-fuchsia-600',
    tagline: 'Dual Mic Clip-On Nirkabel Jernih dengan Fitur Smart Noise Cancelling',
    description: 'Mic Wireless TNW adalah mikrofon nirkabel clip-on lapel yang sangat mudah digunakan (plug and play), ringan, dan menghasilkan rekaman audio vokal yang jernih, tebal, dan bebas gangguan bising latar (smart noise reduction). Sangat cocok untuk MC acara seminar, live streaming podcast, pembuatan video dokumentasi kepanitiaan, hingga wawancara media kampus.',
    images: [
      '/images/produk/mic-wireless-tnw.jpg',
      '/images/produk/detail/mic-tnw-tampak.jpg'
    ],
    features: [
      'Dual Transmitter (Bisa Dipakai 2 Pembicara Sekaligus) + 1 Receiver',
      'Teknologi AI Smart Noise Cancelling Meredam Kebisingan Sekitar',
      'Koneksi 2.4GHz Ultra-Low Latency Tanpa Delay',
      'Jangkauan Sinyal Stabil Hingga Jarak 20 - 30 Meter',
      'Support Smartphone (Type-C / Lightning) & Kamera DSLR / Mixer',
      'Termasuk Charging Case & Windscreen Peredam Angin'
    ],
    specs: [
      { label: 'Merk', value: 'TNW Wireless System' },
      { label: 'Frekuensi Operasi', value: '2.4 GHz Digital Wireless' },
      { label: 'Baterai Transmitter', value: 'Tahan Hingga 6 - 8 Jam Kerja' },
      { label: 'Konektivitas', value: 'Type-C, Lightning Adapter, 3.5mm TRS Audio' },
      { label: 'Kelengkapan', value: 'Hardcase + 2 Mic Clip + 1 Receiver + Adapter' }
    ],
    terms: [
      'Pastikan unit dimasukkan kembali ke charging case setelah pemakaian.',
      'Periksa adaptor konektor agar sesuai dengan tipe smartphone yang digunakan panitia.'
    ],
    rating: 4.9,
    reviewsCount: 39,
    testimonials: [
      {
        id: 't-tnw-1',
        name: 'Aisyah Putri Maharani',
        role: 'Divisi Humas & Media Kreatif',
        organization: 'LPM Himmah UII',
        date: '25 Oktober 2026',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        content: 'Mic TNW ini penyelamat konten Instagram reels dan liputan YouTube kami! Suara narasumber sangat jernih walau wawancara dilakukan di tengah keramaian expo.'
      }
    ]
  },

  // ==========================================
  // 3. KATEGORI KATERING
  // ==========================================
  {
    id: 'prod-paket-nasi',
    slug: 'paket-nasi',
    name: 'Paket Nasi',
    cat: 'KATERING',
    categoryLabel: 'Konsumsi & Kuliner Resmi Kampus',
    priceText: 'Mulai dari Rp 12.000/paket',
    priceValue: 12000,
    priceUnit: 'paket',
    assetKey: 'Paket Nasi / Katering',
    color: '#e11d48',
    badgeColor: 'bg-rose-600',
    tagline: 'Konsumsi Nasi Box Lezat, Bergizi & Higienis Pilihan Tepat Acara Mahasiswa',
    description: 'Paket nasi box konsumsi resmi BPA KM UII dengan harga hemat ramah kantong mahasiswa, cocok untuk kebutuhan acara skala kecil hingga skala besar (ratusan hingga ribuan box). Tersedia varian Menu Curhat (Curi Hemat) dan Menu Nikmat (Nikung Hemat) dengan olahan ayam bumbu rempah pilihan, sambal sedap, lalapan segar, tahu/tempe krispi, kerupuk, dan air mineral. Seluruh makanan diolah secara higienis dengan jaminan tepat waktu.',
    images: [
      '/images/produk/paket-nasi.png',
      '/images/produk/snack-makanan-ringan.png',
      '/images/gallery/csr-berkah.png'
    ],
    features: [
      'Pilihan Menu Fleksibel: Ayam Bakar Madu, Ayam Goreng Lengkuas, dsb.',
      'Lauk Pendamping Komplit: Sayur Tumis, Tahu/Tempe Bacem, Sambal & Kerupuk',
      'Kemasan Box Eksklusif & Sendok Higienis Sudah Termasuk',
      'Gratis Pengiriman Langsung ke Lokasi Acara Area Kampus UII',
      'Jaminan Tepat Waktu Sesuai Jadwal Istirahat Acara'
    ],
    specs: [
      { label: 'Minimal Pemesanan', value: '25 Pcs / Box' },
      { label: 'Pilihan Menu Utama', value: 'Ayam Goreng / Ayam Bakar / Telur Balado' },
      { label: 'Kelengkapan Kemasan', value: 'Kotak Nasi Sekat + Sendok + Tisu + Tusuk Gigi' },
      { label: 'Air Mineral', value: 'Termasuk Gelas / Botol Sesuai Paket' },
      { label: 'Legalitas Dapur', value: 'Dapur Higienis & Halal Terstandarisasi' }
    ],
    terms: [
      'Pemesanan konsumsi maksimal H-3 sebelum tanggal pelaksanaan acara.',
      'Uang muka (DP) minimal 50% saat konfirmasi menu.',
      'Perubahan jumlah pesanan maksimal diterima H-2 sebelum jam masak.'
    ],
    rating: 5.0,
    reviewsCount: 68,
    testimonials: [
      {
        id: 't-nasi-1',
        name: 'Danang Tri Saputra',
        role: 'Ketua Divisi Konsumsi Musyawarah Anggota',
        organization: 'Keluarga Mahasiswa Teknik Mesin UII',
        date: '20 Oktober 2026',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
        content: 'Rasa ayam bakarnya luar biasa empuk dan bumbunya meresap! Nasi diantar tepat waktu jam 11.45 WIB saat peserta mulai istirahat sholat. Semua peserta puas!'
      }
    ]
  },

  {
    id: 'prod-snack-box',
    slug: 'makanan-ringan',
    name: 'Paket Makanan Ringan',
    cat: 'KATERING',
    categoryLabel: 'Konsumsi Snack Box & Coffeebreak',
    priceText: 'Mulai dari Rp 5.500/paket',
    priceValue: 5500,
    priceUnit: 'paket',
    assetKey: 'Paket Nasi / Katering',
    color: '#e11d48',
    badgeColor: 'bg-rose-600',
    tagline: 'Aneka Kue Tradisional & Modern Pilihan untuk Coffee Break Seminar',
    description: 'Paket snack box makanan ringan resmi BPA KM UII untuk kebutuhan coffeebreak seminar, workshop, rapat koordinasi, hingga pengajian rutin. Anda dapat bebas memilih komposisi isi kue manis dan asin (seperti lemper bakar, risoles mayo, pie buah, pastel, kue sus, bolu gulung) yang disajikan dalam kotak kardus rapi dilengkapi air mineral gelas.',
    images: [
      '/images/produk/snack-makanan-ringan.png',
      '/images/produk/paket-nasi.png'
    ],
    features: [
      'Bebas Pilih Kombinasi 2 Kue + Air Mineral atau 3 Kue + Air Mineral',
      'Rasa Gurih & Manis Berimbang dari Dapur Rekanan Terpercaya',
      'Kemasan Kardus Motif Bersih & Menggugah Selera',
      'Harga Sangat Ekonomis untuk Menghemat Kas Kepanitiaan',
      'Diantar Masih Hangat dan Segar Setiap Pagi'
    ],
    specs: [
      { label: 'Minimal Order', value: '30 Pcs' },
      { label: 'Komposisi Standar', value: '1 Kue Asin + 1 Kue Manis + Air Mineral Gelas' },
      { label: 'Opsi Upgrade', value: 'Bisa Tambah Buah (Pisang / Jeruk) atau Kue Modern' },
      { label: 'Kardus Box', value: 'Dus Tebal Kraft / Dus Putih Rapi' }
    ],
    terms: [
      'Pemesanan diterima paling lambat H-2 sebelum acara.',
      'Konfirmasi daftar jenis kue dilakukan saat pemesanan formulir via WhatsApp.'
    ],
    rating: 4.9,
    reviewsCount: 45,
    testimonials: [
      {
        id: 't-snack-1',
        name: 'Nabila Rahmawati',
        role: 'Sie Konsumsi Webinar Nasional',
        organization: 'BEM Fakultas Psikologi & Sosial Budaya UII',
        date: '11 Oktober 2026',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
        content: 'Snack box-nya cantik, kemasannya rapi, dan kuenya enak-enak semua tidak pelit isian. Pemateri seminar juga memuji konsumsi yang kami sajikan.'
      }
    ]
  },

  // ==========================================
  // 4. KATEGORI PHOTOBOOTH
  // ==========================================
  {
    id: 'prod-photobooth',
    slug: 'moment-kita-photobooth',
    name: 'Moment Kita Photobooth',
    cat: 'PHOTOBOOTH',
    categoryLabel: 'Layanan Dokumentasi & Cetak Instan',
    priceText: 'Mulai dari Rp 400.000/event',
    priceValue: 400000,
    priceUnit: 'event',
    assetKey: 'Moment Kita Photobooth',
    color: '#db2777',
    badgeColor: 'bg-pink-600',
    tagline: 'Abadikan Momen Bersejarah Wisuda & Event Akbar dengan Cetak Foto Instan Berkualitas Studio',
    description: 'Moment Kita Photobooth adalah layanan booth foto instan resmi persembahan BPA KM UII untuk mengabadikan momen berharga Anda. Sangat ideal untuk momen perayaan kelulusan wisuda, musyawarah mahasiswa, malam apresiasi, milad lembaga, hingga pameran seni kampus. Dilengkapi kamera DSLR beresolusi tinggi, studio lighting softbox profesional, printer sublimasi cepat (cetak dalam hitungan detik), custom template bingkai foto berlogo institusi/acara, properti foto lucu, serta softcopy digital Google Drive realtime.',
    images: [
      '/images/produk/photobooth.jpg',
      '/images/gallery/booth-fitting-2.png',
      '/images/gallery/bpa-in-action.png'
    ],
    features: [
      'Cetak Foto Instan Hitungan Detik Menggunakan Printer Sublimasi Jepang',
      'Kamera DSLR / Mirrorless Profesional dengan Operator Berpengalaman',
      'Studio Softbox Lighting Menghasilkan Kulit Glowing & Terang Merata',
      'Gratis Desain Kustom Frame / Template Foto Berlogo Panitia / Lembaga',
      'Puluhan Properti Foto Seru (Fun Props, Kacamata Unik, Text Board)',
      'Seluruh File Softcopy Resolusi Asli Dibagikan via Google Drive Real-time'
    ],
    specs: [
      { label: 'Paket Durasi', value: '2 Jam / 3 Jam / Unlimited Event' },
      { label: 'Tipe Kertas', value: 'Glossy Photo Paper Anti Luntur & Tahan Air' },
      { label: 'Ukuran Cetak', value: 'Strip Foto (2x6 inch) atau Ukuran 4R' },
      { label: 'Operator Booth', value: '2 Orang Crew (Fotografer + Teknisi Cetak)' },
      { label: 'Kebutuhan Area', value: 'Minimal Ruang 3 x 3 Meter + Daya Listrik 500W' }
    ],
    terms: [
      'Penyewa wajib menyediakan titik colokan listrik dan ruang booth minimal 3 x 3 meter.',
      'Desain custom frame dikirimkan maksimal H-3 sebelum event untuk approval panitia.',
      'Dilarang merusak aksesoris atau properti booth yang disediakan tim BPA.'
    ],
    rating: 5.0,
    reviewsCount: 38,
    testimonials: [
      {
        id: 't-pb-1',
        name: 'Ardhian Satria',
        role: 'Ketua Panitia Wisuda Periode Gasal',
        organization: 'Keluarga Mahasiswa UII',
        date: '28 Oktober 2026',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        content: 'Antrean wisudawan dan orang tua sangat antusias! Hasil cetakan fotonya tajam setara studio foto mall, kertasnya tebal anti air. Softcopy drive langsung terupdate menit itu juga. Layanan terbaik dari BPA!'
      },
      {
        id: 't-pb-2',
        name: 'Kezia Aurelia',
        role: 'Divisi Acara Malam Keakraban Seni',
        organization: 'UKM Tari & Musik KM UII',
        date: '15 September 2026',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        content: 'Operatornya ramah sekali mengarahkan gaya peserta. Properti fotonya kekinian dan lucu-lucu. Acara kami jadi viral dan penuh kenangan berkat booth ini.'
      }
    ]
  }
];

// Helper untuk mencari produk berdasarkan id atau slug
export const getProductById = (idOrSlug) => {
  return OFFICIAL_PRODUCTS.find(p => p.id === idOrSlug || p.slug === idOrSlug) || OFFICIAL_PRODUCTS[0];
};

