// Dataset & Manager Data Pelacakan Progres Sewa & Persiapan Aset BPA KM UII
// Data awal kosong agar admin dan pengguna memasukkan data secara langsung.

export const INITIAL_DEMO_TRACKING_BOOKINGS = [];

// Helper Format Nomor Telepon ke Format WhatsApp Internasional (+62)
export const formatWhatsAppNumber = (phone) => {
  if (!phone) return '6285233475595';
  const clean = String(phone).replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    return '62' + clean.slice(1);
  }
  if (clean.startsWith('62')) {
    return clean;
  }
  if (clean.startsWith('8')) {
    return '62' + clean;
  }
  return clean || '6285233475595';
};

// Helper Mendapatkan Data Profil Staf PIC yang Sedang Login / Mengklaim Aset
export const getActiveStaffPIC = (adminUser = null) => {
  let user = adminUser;
  if (!user || !user.name) {
    try {
      const raw = localStorage.getItem('bpa_auth_user');
      if (raw) user = JSON.parse(raw);
    } catch {}
  }

  let phone = user?.phone || '';
  if (!phone) {
    try {
      const usersRaw = localStorage.getItem('bpa_admin_users');
      if (usersRaw) {
        const list = JSON.parse(usersRaw);
        const found = list.find(u => 
          (user?.email && u.email?.toLowerCase() === user.email.toLowerCase()) ||
          (user?.name && u.name?.toLowerCase() === user.name.toLowerCase())
        );
        if (found?.phone) phone = found.phone;
      }
    } catch {}
  }

  return {
    id: user?.id || `staff-${Date.now()}`,
    name: user?.name || 'Miki Mangkunegara',
    email: user?.email || '',
    role: user?.role || 'Staf Operasional BPA KM UII',
    phone: phone || '08332423423',
    avatar: user?.picture || user?.avatar || user?.google_picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    claimedAt: new Date().toISOString()
  };
};

// Helper Mengambil Database Tracking dari LocalStorage
export const getStoredTrackingBookings = () => {
  try {
    const raw = localStorage.getItem('bpa_tracking_db');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading tracking DB', e);
  }
  return [];
};

// Helper Menyimpan Database Tracking ke LocalStorage
export const saveStoredTrackingBookings = (bookings) => {
  try {
    const serialized = JSON.stringify(bookings);
    localStorage.setItem('bpa_tracking_db', serialized);
    localStorage.setItem('bpa_tracking_bookings', serialized);
    if (localStorage.getItem('bpa_admin_bookings')) {
      localStorage.setItem('bpa_admin_bookings', serialized);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bpa-data-updated'));
    }
  } catch (e) {
    console.error('Error saving tracking DB', e);
  }
};

// Helper Menggabungkan Booking Tracking & Admin Storage agar Selalu Sinkron
export const getAllMergedTrackingBookings = (remoteBookings = null) => {
  // Jika remoteBookings sudah disediakan dari server / database Neon, jadikan sebagai sumber kebenaran tunggal
  if (Array.isArray(remoteBookings)) {
    return remoteBookings;
  }

  // Fallback hanya saat server offline / inisialisasi awal sebelum fetch
  const mergedMap = new Map();
  const addItems = (list) => {
    if (!Array.isArray(list)) return;
    list.forEach((b) => {
      if (b && b.bookingCode && !mergedMap.has(b.bookingCode)) {
        mergedMap.set(b.bookingCode, b);
      }
    });
  };

  try {
    const adminRaw = localStorage.getItem('bpa_admin_bookings');
    if (adminRaw) addItems(JSON.parse(adminRaw));
  } catch {}
  addItems(getStoredTrackingBookings());

  return Array.from(mergedMap.values());
};

// Generator ID Sewa Singkat Berurutan (Format: BPA-01, BPA-02, ... BPA-99, BPA-100)
export const generateShortBookingCode = (extraBookings = []) => {
  const existingCodes = new Set();

  const addBooking = (b) => {
    if (!b) return;
    const code = b.bookingCode || b.booking_code || b.id;
    if (code) {
      existingCodes.add(String(code).trim().toUpperCase());
    }
  };

  if (Array.isArray(extraBookings)) {
    extraBookings.forEach(addBooking);
  } else if (extraBookings) {
    addBooking(extraBookings);
  }

  // Periksa database tracking lokal
  try {
    getStoredTrackingBookings().forEach(addBooking);
  } catch {}

  // Periksa daftar booking admin lokal
  try {
    const adminRaw = localStorage.getItem('bpa_admin_bookings');
    if (adminRaw) {
      const parsed = JSON.parse(adminRaw);
      if (Array.isArray(parsed)) parsed.forEach(addBooking);
    }
  } catch {}

  // Periksa booking terbaru lokal
  try {
    const latestRaw = localStorage.getItem('bpa_latest_booking');
    if (latestRaw) {
      const parsed = JSON.parse(latestRaw);
      addBooking(parsed);
    }
  } catch {}

  // Cari angka terendah yang belum digunakan mulai dari 01 (format 2 digit: BPA-01)
  for (let num = 1; num <= 9999; num++) {
    const formatted = String(num).padStart(2, '0');
    const candidate = `BPA-${formatted}`;
    if (!existingCodes.has(candidate)) {
      return candidate;
    }
  }

  return `BPA-${Date.now().toString().slice(-4)}`;
};

// Helper Menambahkan / Sinkronisasi Booking Baru yang Diajukan User
export const registerNewBookingToTracking = (newBooking) => {
  const all = getStoredTrackingBookings();
  const existingIdx = all.findIndex(b => b.bookingCode === newBooking.bookingCode);

  const trackingRecord = {
    bookingCode: newBooking.bookingCode,
    status: newBooking.status || 'MENUNGGU PERSETUJUAN',
    progressPercent: 0,
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
        percent: 0,
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

// Standar 6 Tahap Kesiapan Sarpras BPA KM UII (Tahap 1 hingga Akhir)
export const PROGRESS_STAGES = [
  {
    tahap: 1,
    percent: 15,
    label: 'Tahap 1 (15%) - Formulir & Verifikasi Data',
    title: 'Verifikasi Jadwal & Validasi Pengajuan',
    stage: 'Tahap 1: Verifikasi Jadwal & Validasi Data oleh Staf BPA KM UII',
    note: 'Staf BPA sedang memverifikasi formulir peminjaman dan mengecek ketersediaan jadwal aset.',
    badgeType: 'info'
  },
  {
    tahap: 2,
    percent: 35,
    label: 'Tahap 2 (35%) - Persetujuan Staf & Menunggu DP',
    title: 'Jadwal Terverifikasi & Disetujui',
    stage: 'Tahap 2: Jadwal Disetujui Staf BPA & Menunggu Konfirmasi DP',
    note: 'Jadwal sewa disetujui staf BPA KM UII, menunggu pembayaran uang muka (DP) penyewa.',
    badgeType: 'info'
  },
  {
    tahap: 3,
    percent: 50,
    label: 'Tahap 3 (50%) - Konfirmasi DP & Administrasi',
    title: 'Konfirmasi DP & Administrasi Selesai',
    stage: 'Tahap 3: DP Terverifikasi & Berkas Administrasi Terbit',
    note: 'Pembayaran DP telah diterima dan berkas izin pemakaian aset telah diterbitkan untuk tim operasional.',
    badgeType: 'prep'
  },
  {
    tahap: 4,
    percent: 75,
    label: 'Tahap 4 (75%) - Pengecekan Fisik & Uji Teknis',
    title: 'Pengecekan Fisik & Uji Teknis Sarpras',
    stage: 'Tahap 4: Pengecekan Fisik, Kebersihan & Uji Teknis Sarpras',
    note: 'Tim teknis telah mengecek fungsi perangkat, kelengkapan kabel/baterai, serta kebersihan area venue.',
    badgeType: 'prep'
  },
  {
    tahap: 5,
    percent: 90,
    label: 'Tahap 5 (90%) - Penataan Lapangan & Siap Pakai',
    title: 'Aset Siap Digunakan di Lokasi',
    stage: 'Tahap 5: Penataan Lapangan Selesai & Aset Siap Digunakan',
    note: 'Seluruh unit telah ditata rapi sesuai tata letak acara dan siap diserahterimakan kepada panitia/penyewa.',
    badgeType: 'ready'
  },
  {
    tahap: 6,
    percent: 100,
    label: 'Tahap 6 (100%) - Acara Selesai & Pengembalian Aman',
    title: 'Penyewaan Selesai & Pengembalian Aman',
    stage: 'Tahap 6: Acara Selesai, Serah Terima Kembali & Checklist Lengkap',
    note: 'Seluruh aset telah dikembalikan dalam kondisi lengkap dan baik. Agenda pemakaian selesai.',
    badgeType: 'ready'
  }
];

// Helper: hitung status otomatis berdasarkan persentase kesiapan
export const deriveStatusFromPercent = (percent, currentStatus) => {
  const p = Number(percent);
  if ((currentStatus || '').toUpperCase() === 'DITOLAK' && p === 0) return 'DITOLAK';
  if (p >= 100) return 'SELESAI';
  if (p >= 85) return 'SIAP DIGUNAKAN';
  if (p >= 30) return 'SEDANG DISIAPKAN';
  if (p >= 20) return 'DISETUJUI';
  return 'MENUNGGU PERSETUJUAN';
};

// Helper: bangun milestone otomatis dari persentase
export const buildSmartMilestones = (percent, existingMilestones) => {
  const p = Number(percent);
  const base =
    Array.isArray(existingMilestones) && existingMilestones.length === 6
      ? existingMilestones
      : [
          { id: 1, label: 'Formulir Diterima', desc: 'Rincian aset & data pemesan telah tercatat di sistem' },
          { id: 2, label: 'Persetujuan Staf BPA', desc: 'Pengecekan jadwal & keputusan approve/reject staf' },
          { id: 3, label: 'Konfirmasi DP & Administrasi', desc: 'Verifikasi tanda jadi DP & penerbitan berkas sewa' },
          { id: 4, label: 'Pengecekan Fisik & Uji Teknis', desc: 'Uji alat, soundcheck, dan sterilisasi venue' },
          { id: 5, label: 'Penataan Lapangan & Gladi', desc: 'Layout ruangan & gladi resik dengan panitia' },
          { id: 6, label: 'Aset Siap Digunakan', desc: 'Serah terima resmi & pelaksanaan kegiatan' }
        ];

  const thresholds = [10, 25, 45, 70, 85, 100];
  let activeIdx = -1;
  thresholds.forEach((t, idx) => {
    if (p >= t) activeIdx = idx;
  });

  return base.map((m, idx) => ({
    ...m,
    completed: idx <= activeIdx,
    current: idx === activeIdx && p < 100
  }));
};


