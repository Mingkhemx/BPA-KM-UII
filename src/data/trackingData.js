// Dataset & Manager Data Pelacakan Progres Sewa & Persiapan Aset BPA KM UII
// Menyimpan riwayat progres, persentase persiapan, milestone tahapan, dan timeline dari staf BPA.

export const INITIAL_DEMO_TRACKING_BOOKINGS = [
  {
    bookingCode: 'BPA-20261102-7492',
    status: 'SEDANG DISIAPKAN', // 'MENUNGGU PERSETUJUAN' | 'DISETUJUI' | 'SEDANG DISIAPKAN' | 'SIAP DIGUNAKAN' | 'SELESAI' | 'DITOLAK'
    progressPercent: 75,
    progressStage: 'Tahap 4: Penataan Hall SCC, Pengecekan AC & Uji Sound System',
    createdAt: '02 November 2026, 09:15 WIB',
    eventDate: '05 November 2026 (08.00 - 17.00 WIB)',
    location: 'Gedung Student Convention Center (SCC) Lantai 1 & Halaman Utama',
    picStaff: {
      name: 'Fathur Rahman, S.T.',
      role: 'Koordinator Sarpras & Logistik BPA KM UII',
      phone: '6285233475595',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    },
    customer: {
      name: 'Muhammad Fathir Al-Ghifari',
      org: 'Panitia Seminar Nasional & Expo KM UII 2026',
      phone: '081234567890',
      email: 'panitia.semnas@uii.ac.id',
      notes: 'Kebutuhan panggung utama, 300 kursi Sapporo rapi, 4 mic wireless, sound system standby operator H-2 jam.'
    },
    items: [
      {
        id: 'gedung-scc',
        name: 'Gedung SCC (Student Convention Center)',
        quantity: 1,
        startDate: '2026-11-05',
        endDate: '2026-11-05',
        days: 1,
        priceValue: 350000,
        image: '/images/produk/gedung-scc.png',
        itemStatus: 'Hall Siap & Dibersihkan (85%)'
      },
      {
        id: 'sound-hts-p12e',
        name: 'HTS Portable Wireless Mic & Speaker P12E',
        quantity: 1,
        startDate: '2026-11-05',
        endDate: '2026-11-05',
        days: 1,
        priceValue: 75000,
        image: '/images/produk/hts-speaker-p12e.png',
        itemStatus: 'Uji Soundcheck Clear (100%)'
      },
      {
        id: 'ht-baofeng-uv82',
        name: 'Handy Talky (HT) Baofeng UV-82 (10 Unit)',
        quantity: 10,
        startDate: '2026-11-05',
        endDate: '2026-11-05',
        days: 1,
        priceValue: 9000,
        image: '/images/produk/ht-baofeng-uv82.png',
        itemStatus: 'Baterai Full & Channel Terkunci (100%)'
      },
      {
        id: 'proyektor-epson-x400',
        name: 'Proyektor Epson EB-x400',
        quantity: 1,
        startDate: '2026-11-05',
        endDate: '2026-11-05',
        days: 1,
        priceValue: 98000,
        image: '/images/produk/proyektor-epson.jpg',
        itemStatus: 'Pemasangan Rigging & HDMI (80%)'
      }
    ],
    totalCost: 613000,
    downPayment: 'Rp 300.000 (Terverifikasi Lunas)',
    remainingPayment: 'Rp 313.000 (Pelunasan saat Gladi Resik)',
    milestones: [
      { id: 1, label: 'Formulir Diterima', desc: 'Data reservasi & rincian sewa tercatat', completed: true, current: false },
      { id: 2, label: 'Persetujuan Staf BPA', desc: 'Jadwal diverifikasi bebas bentrok & disetujui', completed: true, current: false },
      { id: 3, label: 'Konfirmasi DP & Administrasi', desc: 'Kwitansi DP terbit & SK Izin diterbitkan', completed: true, current: false },
      { id: 4, label: 'Pengecekan Fisik & Uji Teknis', desc: 'Pembersihan aula, uji audio & perangkat', completed: true, current: true },
      { id: 5, label: 'Penataan Lapangan & Gladi', desc: 'Standby operator sarpras & serah terima kunci', completed: false, current: false },
      { id: 6, label: 'Aset Siap Digunakan', desc: 'Acara berlangsung lancar & pengembalian', completed: false, current: false }
    ],
    timelineUpdates: [
      {
        id: 'upd-4',
        timestamp: 'Hari ini, 15:20 WIB',
        sender: 'Fathur Rahman (Koordinator Sarpras)',
        senderRole: 'Staf Logistik BPA KM UII',
        title: 'Penataan 300 Kursi & Setting Ruang Hall SCC',
        message: 'Tim operasional BPA telah menata 300 kursi Sapporo berjejer rapi menghadap panggung. Lantai telah dipel dengan disinfektan. AC sentral telah diuji running stabil pada suhu 20°C.',
        percent: 75,
        badgeType: 'prep',
        photo: '/images/produk/detail/scc-wide.jpg'
      },
      {
        id: 'upd-3',
        timestamp: 'Hari ini, 11:45 WIB',
        sender: 'M. Rizky Pratama',
        senderRole: 'Teknisi Audio & Multimedia BPA',
        title: 'Pengecekan Baterai HT Baofeng & Mic Wireless',
        message: '10 unit HT Baofeng UV-82 telah dicharge 100% penuh. Channel komunikasi disetel pada frekuensi khusus KM UII (Channel 1-4) tanpa interferensi. 2 unit mic wireless dan speaker HTS P12E clear tanpa dengung.',
        percent: 60,
        badgeType: 'prep',
        photo: '/images/produk/detail/ht-tampak.jpg'
      },
      {
        id: 'upd-2',
        timestamp: '02 Nov 2026, 10:00 WIB',
        sender: 'Aisyah Nahdya Haq',
        senderRole: 'Bendahara & Administrasi BPA KM UII',
        title: 'Pembayaran DP Terverifikasi & Kwitansi Diterbitkan',
        message: 'DP sebesar Rp 300.000 telah masuk ke rekening resmi BPA KM UII. Surat Izin Peminjaman Sarana Prasarana (SIPP) telah ditandatangani secara digital.',
        percent: 40,
        badgeType: 'admin',
        photo: '/images/produk/detail/proyektor-angle.jpg'
      },
      {
        id: 'upd-1',
        timestamp: '02 Nov 2026, 09:30 WIB',
        sender: 'Putri Nabila Qothrunnada',
        senderRole: 'Kepala Divisi Layanan Aset BPA KM UII',
        title: 'Pengajuan Sewa Resmi DISETUJUI',
        message: 'Pengecekan kalender internal selesai, tidak ada agenda kemahasiswaan lain pada 05 November 2026. Permohonan resmi disetujui untuk dipersiapkan tim logistik.',
        percent: 25,
        badgeType: 'approval',
        photo: '/images/produk/gedung-scc.png'
      }
    ]
  },
  {
    bookingCode: 'BPA-HT-5520',
    status: 'SIAP DIGUNAKAN',
    progressPercent: 100,
    progressStage: 'Tahap 6: Aset Siap Digunakan / Serah Terima di Kantor BPA',
    createdAt: '01 November 2026, 13:00 WIB',
    eventDate: '03 November 2026 (07.00 - 18.00 WIB)',
    location: 'Kantor BPA KM UII (Lantai 1 Gedung SCC)',
    picStaff: {
      name: 'Budi Prasetyo',
      role: 'Staff Inventaris & Pemeliharaan BPA',
      phone: '6285233475595',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    },
    customer: {
      name: 'Aditya Pratama',
      org: 'Kepanitiaan Lomba Tari Tradisional UII',
      phone: '085712349988',
      email: 'aditya@student.uii.ac.id',
      notes: 'Pengambilan HT Baofeng UV-82 sebanyak 6 unit dan Megaphone TOA.'
    },
    items: [
      {
        id: 'ht-baofeng-uv82',
        name: 'Handy Talky (HT) Baofeng UV-82 (6 Unit)',
        quantity: 6,
        startDate: '2026-11-03',
        endDate: '2026-11-03',
        days: 1,
        priceValue: 9000,
        image: '/images/produk/ht-baofeng-uv82.png',
        itemStatus: 'Siap Ambil di Meja Resepsionis BPA'
      },
      {
        id: 'megaphone-toa',
        name: 'Megaphone 2R-2015S (TOA)',
        quantity: 1,
        startDate: '2026-11-03',
        endDate: '2026-11-03',
        days: 1,
        priceValue: 35000,
        image: '/images/produk/megaphone-toa.jpg',
        itemStatus: 'Baterai Baru & Sirene Berfungsi'
      }
    ],
    totalCost: 89000,
    downPayment: 'Rp 89.000 (Lunas 100%)',
    remainingPayment: 'Rp 0',
    milestones: [
      { id: 1, label: 'Formulir Diterima', desc: 'Data reservasi lengkap', completed: true, current: false },
      { id: 2, label: 'Persetujuan Staf BPA', desc: 'Disetujui', completed: true, current: false },
      { id: 3, label: 'Konfirmasi DP & Administrasi', desc: 'Lunas', completed: true, current: false },
      { id: 4, label: 'Pengecekan Fisik & Uji Teknis', desc: 'Semua unit dites', completed: true, current: false },
      { id: 5, label: 'Pengemasan & Box Inventaris', desc: 'Box tersegel siap bawa', completed: true, current: false },
      { id: 6, label: 'Siap Digunakan / Ambil', desc: 'Silakan ambil di SCC Lt 1', completed: true, current: true }
    ],
    timelineUpdates: [
      {
        id: 'upd-ready',
        timestamp: 'Hari ini, 08:30 WIB',
        sender: 'Budi Prasetyo',
        senderRole: 'Staff Inventaris BPA',
        title: 'Unit Telah Dikemas & Siap Diambil di Kantor BPA',
        message: '6 unit HT lengkap dengan charger dock, headset earpiece, dan 1 unit Megaphone TOA sudah dimasukkan ke dalam Hardcase BPA. Siap diambil penyewa di kantor BPA KM UII (SCC Lt 1). Bawa kartu KTM / KTP asli sebagai jaminan.',
        percent: 100,
        badgeType: 'ready',
        photo: '/images/produk/detail/ht-tampak.jpg'
      }
    ]
  }
];

// Helper Mengambil Database Tracking dari LocalStorage
export const getStoredTrackingBookings = () => {
  try {
    const raw = localStorage.getItem('bpa_tracking_db');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading tracking DB', e);
  }
  // Default jika belum ada
  saveStoredTrackingBookings(INITIAL_DEMO_TRACKING_BOOKINGS);
  return INITIAL_DEMO_TRACKING_BOOKINGS;
};

// Helper Menyimpan Database Tracking ke LocalStorage
export const saveStoredTrackingBookings = (bookings) => {
  try {
    localStorage.setItem('bpa_tracking_db', JSON.stringify(bookings));
  } catch (e) {
    console.error('Error saving tracking DB', e);
  }
};

// Helper Menambahkan / Sinkronisasi Booking Baru yang Diajukan User
export const registerNewBookingToTracking = (newBooking) => {
  const all = getStoredTrackingBookings();
  const existingIdx = all.findIndex(b => b.bookingCode === newBooking.bookingCode);

  const trackingRecord = {
    bookingCode: newBooking.bookingCode,
    status: newBooking.status || 'MENUNGGU PERSETUJUAN',
    progressPercent: 15,
    progressStage: 'Tahap 1: Verifikasi Jadwal & Validasi Data oleh Staf BPA KM UII',
    createdAt: newBooking.createdAt || new Date().toLocaleString('id-ID'),
    eventDate: newBooking.items && newBooking.items[0] 
      ? `${newBooking.items[0].startDate} s/d ${newBooking.items[0].endDate}` 
      : 'Sesuai Formulir',
    location: 'Gedung Student Convention Center (SCC) Kampus Terpadu UII',
    picStaff: {
      name: 'Fathur Rahman, S.T.',
      role: 'Koordinator Sarpras & Logistik BPA KM UII',
      phone: '6285233475595',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    },
    customer: newBooking.customer || {
      name: 'Pemohon Sewa',
      org: '-',
      phone: '08xxxxxxxxxx',
      email: '-',
      notes: '-'
    },
    items: newBooking.items || [],
    totalCost: newBooking.totalCost || 0,
    downPayment: 'Menunggu Konfirmasi Staf',
    remainingPayment: `Rp ${(newBooking.totalCost || 0).toLocaleString('id-ID')}`,
    milestones: [
      { id: 1, label: 'Formulir Diterima', desc: 'Rincian aset & data pemesan telah tercatat di sistem', completed: true, current: true },
      { id: 2, label: 'Persetujuan Staf BPA', desc: 'Pengecekan jadwal & keputusan approve/reject staf', completed: false, current: false },
      { id: 3, label: 'Konfirmasi DP & Administrasi', desc: 'Verifikasi tanda jadi DP & penerbitan berkas sewa', completed: false, current: false },
      { id: 4, label: 'Pengecekan Fisik & Uji Teknis', desc: 'Uji alat, soundcheck, dan sterilisasi venue', completed: false, current: false },
      { id: 5, label: 'Penataan Lapangan & Gladi', desc: 'Layout ruangan & gladi resik dengan panitia', completed: false, current: false },
      { id: 6, label: 'Aset Siap Digunakan', desc: 'Serah terima resmi & pelaksanaan kegiatan', completed: false, current: false }
    ],
    timelineUpdates: [
      {
        id: `upd-${Date.now()}`,
        timestamp: 'Baru saja',
        sender: 'Sistem Reservasi BPA KM UII',
        senderRole: 'Layanan Terpadu BPA',
        title: 'Formulir Pengajuan Sewa Berhasil Diterima',
        message: 'Pengajuan sewa telah masuk ke antrean verifikasi staf BPA KM UII. Staf kami akan segera menghubungi nomor pemesan untuk memberitahukan apakah permohonan disetujui atau tidak.',
        percent: 15,
        badgeType: 'info',
        photo: (newBooking.items && newBooking.items[0] && newBooking.items[0].image) || '/images/produk/gedung-scc.png'
      }
    ]
  };

  let updatedList;
  if (existingIdx > -1) {
    updatedList = [...all];
    updatedList[existingIdx] = { ...updatedList[existingIdx], ...trackingRecord };
  } else {
    updatedList = [trackingRecord, ...all];
  }

  saveStoredTrackingBookings(updatedList);
  return trackingRecord;
};

