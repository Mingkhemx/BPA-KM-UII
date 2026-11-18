import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  PackageCheck,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Upload,
  Camera,
  Calendar,
  Sparkles,
  Check,
  X,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Package,
  Phone,
  Building,
  User
} from 'lucide-react';
import { adminStorage } from '../../../utils/adminStorage';
import { neonApi } from '../../../services/neonDb';
import {
  getStoredTrackingBookings,
  saveStoredTrackingBookings,
  getActiveStaffPIC,
  formatWhatsAppNumber
} from '../../../data/trackingData';
import { AdminCardOverlayModal, AdminConfirmOverlayModal } from '../AdminOverlayModal';

// Helper: parse tanggal YYYY-MM-DD menjadi timestamp aman
const parseDateMs = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const clean = dateStr.trim().slice(0, 10);
  const ms = Date.parse(clean);
  return Number.isNaN(ms) ? null : ms;
};

// Helper: cek apakah dua rentang tanggal tumpang tindih
const rangesOverlap = (startA, endA, startB, endB) => {
  const sA = parseDateMs(startA);
  const eA = parseDateMs(endA || startA);
  const sB = parseDateMs(startB);
  const eB = parseDateMs(endB || startB);
  if (sA === null || eA === null || sB === null || eB === null) return false;
  return sA <= eB && sB <= eA;
};

// Helper: normalisasi ID/nama aset agar produk DB & demo cocok tanpa duplikat
const normalizeAssetKey = (str) =>
  String(str || '')
    .toLowerCase()
    .replace(/^prod-/, '')
    .replace(/[^a-z0-9]/g, '');

// Helper: hitung status otomatis berdasarkan persentase progres
const deriveStatusFromPercent = (percent, currentStatus) => {
  const p = Number(percent);
  if ((currentStatus || '').toUpperCase() === 'DITOLAK' && p === 0) return 'DITOLAK';
  if (p >= 100) return 'SELESAI';
  if (p >= 85) return 'SIAP DIGUNAKAN';
  if (p >= 30) return 'SEDANG DISIAPKAN';
  if (p >= 20) return 'DISETUJUI';
  return 'MENUNGGU PERSETUJUAN';
};

// Helper: bangun milestone otomatis dari persentase
const buildSmartMilestones = (percent, existingMilestones) => {
  const p = Number(percent);
  const base =
    Array.isArray(existingMilestones) && existingMilestones.length === 6
      ? existingMilestones
      : [
          { id: 1, label: 'Formulir Diterima', desc: 'Data reservasi & rincian sewa tercatat' },
          { id: 2, label: 'Persetujuan Staf BPA', desc: 'Jadwal diverifikasi bebas bentrok & disetujui' },
          { id: 3, label: 'Konfirmasi DP & Administrasi', desc: 'Kwitansi DP terbit & berkas izin disiapkan' },
          { id: 4, label: 'Pengecekan Fisik & Uji Teknis', desc: 'Pembersihan aula, uji audio & perangkat' },
          { id: 5, label: 'Penataan Lapangan & Gladi', desc: 'Standby operator sarpras & serah terima kunci' },
          { id: 6, label: 'Aset Siap & Selesai', desc: 'Acara berlangsung lancar & pengembalian aset' }
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

// Smart Stage Presets
const SMART_STAGE_PRESETS = [
  {
    percent: 15,
    label: '15% Validasi',
    stage: 'Tahap 1: Verifikasi Jadwal & Validasi Data oleh Staf BPA KM UII',
    title: 'Verifikasi Jadwal & Validasi Data Pengajuan',
    note: 'Staf BPA sedang memverifikasi formulir peminjaman dan mengecek ketersediaan jadwal aset.'
  },
  {
    percent: 35,
    label: '35% Disetujui',
    stage: 'Tahap 2: Jadwal Disetujui Staf BPA & Menunggu Konfirmasi DP',
    title: 'Jadwal Terverifikasi & Disetujui',
    note: 'Staf BPA telah memverifikasi jadwal dan ketersediaan aset bebas bentrok. Silakan selesaikan administrasi DP.'
  },
  {
    percent: 50,
    label: '50% DP & Berkas',
    stage: 'Tahap 3: DP Terverifikasi & Berkas Administrasi Terbit',
    title: 'Konfirmasi DP & Administrasi Selesai',
    note: 'Pembayaran DP telah kami terima dan berkas izin pemakaian aset telah diterbitkan untuk tim operasional.'
  },
  {
    percent: 75,
    label: '75% Uji Teknis',
    stage: 'Tahap 4: Pengecekan Fisik, Kebersihan & Uji Teknis Sarpras',
    title: 'Pengecekan Fisik & Uji Perangkat',
    note: 'Tim teknis telah mengecek fungsi perangkat, kelengkapan kabel/baterai, serta kebersihan area penggunaan.'
  },
  {
    percent: 90,
    label: '90% Siap Pakai',
    stage: 'Tahap 5: Penataan Lapangan Selesai & Aset Siap Digunakan',
    title: 'Aset Siap Digunakan di Lokasi',
    note: 'Seluruh unit telah ditata sesuai layout acara dan siap diserahterimakan kepada panitia/penyewa.'
  },
  {
    percent: 100,
    label: '100% Selesai',
    stage: 'Tahap 6: Acara Selesai, Serah Terima Kembali & Checklist Lengkap',
    title: 'Penyewaan Selesai & Pengembalian Aman',
    note: 'Seluruh aset telah dikembalikan dalam kondisi lengkap dan baik. Terima kasih telah menggunakan layanan BPA KM UII.'
  }
];

export const AssetOrdersTab = ({ adminUser }) => {
  const loadMergedBookings = () => {
    const adminList = adminStorage.getBookings() || [];
    const trackingList = getStoredTrackingBookings() || [];
    const map = new Map();
    [...adminList, ...trackingList].forEach((b) => {
      if (b && b.bookingCode && !map.has(b.bookingCode)) {
        map.set(b.bookingCode, b);
      }
    });
    return Array.from(map.values());
  };

  const [bookings, setBookings] = useState(loadMergedBookings);
  const [products, setProducts] = useState(() => adminStorage.getProducts());

  const [selectedAssetFilter, setSelectedAssetFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Modal Detail Pesanan
  const [detailOrder, setDetailOrder] = useState(null);

  // Modal Upload Perkembangan
  const [activeOrderForProgress, setActiveOrderForProgress] = useState(null);
  const [progressPercent, setProgressPercent] = useState(50);
  const [progressStage, setProgressStage] = useState('');
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  const [uploadedPhoto, setUploadedPhoto] = useState('');
  const [itemStatuses, setItemStatuses] = useState({});
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const photoInputRef = useRef(null);

  // Modal Konfirmasi Tolak
  const [rejectTarget, setRejectTarget] = useState(null);

  const activeStaff = useMemo(() => getActiveStaffPIC(adminUser), [adminUser]);

  // Sinkronisasi live Neon DB
  useEffect(() => {
    let active = true;
    Promise.allSettled([neonApi.getBookings(), neonApi.getProducts()]).then(
      ([resBookings, resProducts]) => {
        if (!active) return;
        if (
          resBookings.status === 'fulfilled' &&
          Array.isArray(resBookings.value)
        ) {
          setBookings(resBookings.value);
          localStorage.setItem('bpa_admin_bookings', JSON.stringify(resBookings.value));
          saveStoredTrackingBookings(resBookings.value);
        }
        if (
          resProducts.status === 'fulfilled' &&
          Array.isArray(resProducts.value)
        ) {
          setProducts(resProducts.value);
          localStorage.setItem('bpa_cms_products', JSON.stringify(resProducts.value));
        }
      }
    );
    return () => {
      active = false;
    };
  }, []);

  const showNotification = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const persistBookings = (updatedList, updatedBooking) => {
    setBookings(updatedList);
    adminStorage.saveBookings(updatedList);
    saveStoredTrackingBookings(updatedList);

    if (updatedBooking) {
      neonApi.saveBooking(updatedBooking).catch(() => {});
    }
  };

  // =========================================================================
  // SMART LOGIC: PETA STOK & DETEKSI BENTROK JADWAL YANG AKURAT
  // =========================================================================
  const assetAnalytics = useMemo(() => {
    // Gabungkan katalog resmi + produk DB agar stok akurat (mis. HT = 10 unit, Kursi = 300 unit)
    const catalogMap = new Map();
    products.forEach((p) => {
      const key = normalizeAssetKey(p.slug || p.id || p.name);
      if (!key) return;
      const existing = catalogMap.get(key);
      const parsedStock =
        Number(p.stock) ||
        (key.includes('ht') ? 20 : key.includes('kursi') ? 300 : 2);
      catalogMap.set(key, {
        key,
        id: p.id || key,
        name: existing?.name || p.name,
        stock: Math.max(existing?.stock || 0, parsedStock)
      });
    });

    // Helper mencari key katalog dari item booking
    const resolveAssetForItem = (item) => {
      const idKey = normalizeAssetKey(item.id);
      const nameKey = normalizeAssetKey(item.name);
      if (catalogMap.has(idKey)) return catalogMap.get(idKey);
      if (catalogMap.has(nameKey)) return catalogMap.get(nameKey);

      for (const entry of catalogMap.values()) {
        if (
          (idKey && (entry.key.includes(idKey) || idKey.includes(entry.key))) ||
          (nameKey && (entry.key.includes(nameKey) || nameKey.includes(entry.key)))
        ) {
          return entry;
        }
      }

      const fallbackKey = idKey || nameKey || 'aset-lain';
      const created = {
        key: fallbackKey,
        id: fallbackKey,
        name: item.name || 'Aset BPA',
        stock: Math.max(1, Number(item.quantity) || 1)
      };
      catalogMap.set(fallbackKey, created);
      return created;
    };

    const activeBookings = bookings.filter(
      (b) => !['DITOLAK', 'SELESAI'].includes((b.status || '').toUpperCase())
    );

    const conflictByBooking = new Map();
    const assetOrderCount = new Map();

    // Hitung jumlah pesanan per aset & deteksi bentrok antar 2+ pesanan di tanggal sama
    activeBookings.forEach((bA, idxA) => {
      (bA.items || []).forEach((itemA) => {
        const asset = resolveAssetForItem(itemA);
        assetOrderCount.set(asset.key, (assetOrderCount.get(asset.key) || 0) + 1);

        const qtyA = Number(itemA.quantity) || 1;
        let concurrentUnits = qtyA;
        const overlappingCodes = [];

        activeBookings.forEach((bB, idxB) => {
          if (idxA === idxB) return;
          const itemB = (bB.items || []).find(
            (it) => resolveAssetForItem(it).key === asset.key
          );
          if (
            itemB &&
            rangesOverlap(
              itemA.startDate,
              itemA.endDate,
              itemB.startDate,
              itemB.endDate
            )
          ) {
            concurrentUnits += Number(itemB.quantity) || 1;
            overlappingCodes.push(bB.bookingCode);
          }
        });

        // Hanya tandai bentrok jika benar-benar bertabrakan dengan pesanan lain DAN melebihi stok
        if (overlappingCodes.length > 0 && concurrentUnits > asset.stock) {
          const prev = conflictByBooking.get(bA.bookingCode) || [];
          conflictByBooking.set(bA.bookingCode, [
            ...prev,
            `${asset.name}: total ${concurrentUnits} unit terpakai bersamaan dengan ${overlappingCodes.join(', ')} (stok: ${asset.stock} unit)`
          ]);
        }
      });
    });

    // Daftar aset untuk dropdown filter yang bersih (tanpa duplikat)
    const filterAssets = Array.from(catalogMap.values())
      .map((a) => ({
        ...a,
        totalOrders: bookings.filter((b) =>
          (b.items || []).some((it) => resolveAssetForItem(it).key === a.key)
        ).length
      }))
      .filter((a) => a.totalOrders > 0)
      .sort((a, b) => b.totalOrders - a.totalOrders);

    return { filterAssets, conflictByBooking, resolveAssetForItem };
  }, [bookings, products]);

  // Filter pesanan
  const filteredOrders = useMemo(() => {
    return bookings.filter((b) => {
      const matchesAsset =
        selectedAssetFilter === 'ALL' ||
        (b.items || []).some(
          (it) => assetAnalytics.resolveAssetForItem(it).key === selectedAssetFilter
        );

      const conflicts = assetAnalytics.conflictByBooking.get(b.bookingCode) || [];
      const upperStatus = (b.status || '').toUpperCase();
      const matchesStatus =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'CONFLICT'
          ? conflicts.length > 0
          : statusFilter === 'IN_PROGRESS'
          ? ['DISETUJUI', 'SEDANG DISIAPKAN', 'SIAP DIGUNAKAN'].includes(upperStatus)
          : upperStatus === statusFilter;

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (b.bookingCode || '').toLowerCase().includes(q) ||
        (b.customer?.name || b.userName || '').toLowerCase().includes(q) ||
        (b.customer?.org || b.userOrg || '').toLowerCase().includes(q) ||
        (b.items || []).some((it) => (it.name || '').toLowerCase().includes(q));

      return matchesAsset && matchesStatus && matchesSearch;
    });
  }, [bookings, selectedAssetFilter, statusFilter, searchQuery, assetAnalytics]);

  // Ringkasan KPI cepat
  const stats = useMemo(() => {
    const pending = bookings.filter((b) => (b.status || '').toUpperCase() === 'MENUNGGU PERSETUJUAN').length;
    const active = bookings.filter((b) =>
      ['DISETUJUI', 'SEDANG DISIAPKAN', 'SIAP DIGUNAKAN'].includes((b.status || '').toUpperCase())
    ).length;
    const completed = bookings.filter((b) => (b.status || '').toUpperCase() === 'SELESAI').length;
    return {
      total: bookings.length,
      pending,
      active,
      completed,
      conflicts: assetAnalytics.conflictByBooking.size
    };
  }, [bookings, assetAnalytics]);

  // Buka Modal Upload Perkembangan
  const handleOpenProgressModal = (booking) => {
    const isPending = (booking.status || '').toUpperCase() === 'MENUNGGU PERSETUJUAN';
    const currentPct = isPending ? 0 : Number(booking.progressPercent ?? 0);
    const nextPreset =
      SMART_STAGE_PRESETS.find((p) => p.percent > currentPct) ||
      SMART_STAGE_PRESETS[SMART_STAGE_PRESETS.length - 1];

    const initialItemMap = {};
    (booking.items || []).forEach((it, idx) => {
      initialItemMap[it.id || idx] = it.itemStatus || 'Dalam Pengecekan';
    });

    setActiveOrderForProgress(booking);
    setProgressPercent(nextPreset.percent);
    setProgressStage(nextPreset.stage);
    setUpdateTitle(nextPreset.title);
    setUpdateMessage(nextPreset.note);
    setUploadedPhoto('');
    setItemStatuses(initialItemMap);
  };

  const handleApplyPreset = (preset) => {
    setProgressPercent(preset.percent);
    setProgressStage(preset.stage);
    setUpdateTitle(preset.title);
    setUpdateMessage(preset.note);
  };

  const handlePhotoFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('Mohon pilih file gambar (JPG, PNG, atau WEBP).');
      return;
    }

    setIsProcessingPhoto(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 800;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setUploadedPhoto(canvas.toDataURL('image/jpeg', 0.8));
        setIsProcessingPhoto(false);
      };
      img.onerror = () => {
        setIsProcessingPhoto(false);
        showNotification('Format gambar tidak dapat dibaca.');
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitProgressUpdate = (e) => {
    e.preventDefault();
    if (!activeOrderForProgress) return;

    const pct = Number(progressPercent);
    const nextStatus = deriveStatusFromPercent(pct, activeOrderForProgress.status);

    const newTimelineEntry = {
      id: `upd-${Date.now()}`,
      timestamp:
        new Date().toLocaleString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) + ' WIB',
      sender: adminUser?.name || 'Tim Operasional BPA',
      senderRole: adminUser?.role || 'Staf Sarpras BPA KM UII',
      title: updateTitle.trim() || `Pembaruan Kesiapan (${pct}%)`,
      message: updateMessage.trim() || progressStage.trim(),
      percent: pct,
      badgeType: pct >= 100 ? 'success' : pct >= 70 ? 'prep' : 'info',
      photo: uploadedPhoto || ''
    };

    const staffPic = activeOrderForProgress.picStaff?.name ? activeOrderForProgress.picStaff : getActiveStaffPIC(adminUser);

    let updatedBookingObj = null;
    const updatedList = bookings.map((b) => {
      if (b.bookingCode !== activeOrderForProgress.bookingCode) return b;

      const updatedItems = (b.items || []).map((it, idx) => ({
        ...it,
        itemStatus:
          pct >= 100
            ? 'Selesai & Dikembalikan (100%)'
            : itemStatuses[it.id || idx] || it.itemStatus || 'Siap Diproses'
      }));

      updatedBookingObj = {
        ...b,
        status: nextStatus,
        progressPercent: pct,
        progressStage: progressStage.trim(),
        progressDescription: updateMessage.trim(),
        picStaff: staffPic,
        items: updatedItems,
        milestones: buildSmartMilestones(pct, b.milestones),
        timelineUpdates: [newTimelineEntry, ...(b.timelineUpdates || [])]
      };
      return updatedBookingObj;
    });

    persistBookings(updatedList, updatedBookingObj);
    setActiveOrderForProgress(null);
    showNotification(
      `Perkembangan ${activeOrderForProgress.bookingCode} (${pct}% • ${nextStatus}) berhasil diunggah!`
    );
  };

  const handleClaimAssetAsPIC = (booking) => {
    const staffPic = getActiveStaffPIC(adminUser);
    const now = new Date();
    const timeStr =
      now.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' WIB';

    const newTimelineEntry = {
      id: `upd-${Date.now()}`,
      timestamp: timeStr,
      sender: staffPic.name,
      senderRole: staffPic.role,
      title: 'Penanggung Jawab Aset (PIC) Ditugaskan',
      message: `${staffPic.name} telah mengambil alih penugasan sebagai staf penanggung jawab (PIC) lapangan untuk agenda ini. Penyewa dapat berkoordinasi via WhatsApp: ${staffPic.phone}`,
      percent: booking.progressPercent || 35,
      badgeType: 'info'
    };

    let updatedBookingObj = null;
    const updatedList = bookings.map((b) => {
      if (b.bookingCode !== booking.bookingCode) return b;
      updatedBookingObj = {
        ...b,
        picStaff: staffPic,
        timelineUpdates: [newTimelineEntry, ...(b.timelineUpdates || [])]
      };
      return updatedBookingObj;
    });

    persistBookings(updatedList, updatedBookingObj);
    showNotification(`Anda (${staffPic.name}) berhasil mengklaim ${booking.bookingCode} sebagai PIC!`);
  };

  const handleQuickApprove = (booking) => {
    const preset = SMART_STAGE_PRESETS[1] || SMART_STAGE_PRESETS[0];
    const staffPic = booking.picStaff?.name ? booking.picStaff : getActiveStaffPIC(adminUser);
    let updatedBookingObj = null;
    const updatedList = bookings.map((b) => {
      if (b.bookingCode !== booking.bookingCode) return b;
      updatedBookingObj = {
        ...b,
        status: 'DISETUJUI',
        progressPercent: preset.percent,
        progressStage: preset.stage,
        progressDescription: preset.note,
        picStaff: staffPic,
        milestones: buildSmartMilestones(preset.percent, b.milestones),
        timelineUpdates: [
          {
            id: `upd-${Date.now()}`,
            timestamp: new Date().toLocaleString('id-ID'),
            sender: adminUser?.name || 'Staf BPA',
            senderRole: 'Koordinator Approval BPA',
            title: preset.title,
            message: preset.note,
            percent: preset.percent,
            badgeType: 'info'
          },
          ...(b.timelineUpdates || [])
        ]
      };
      return updatedBookingObj;
    });

    persistBookings(updatedList, updatedBookingObj);
    showNotification(`Pesanan ${booking.bookingCode} disetujui & ditugaskan ke PIC ${staffPic.name}!`);
  };

  const handleConfirmReject = () => {
    if (!rejectTarget) return;
    let updatedBookingObj = null;
    const updatedList = bookings.map((b) => {
      if (b.bookingCode !== rejectTarget.bookingCode) return b;
      updatedBookingObj = {
        ...b,
        status: 'DITOLAK',
        progressPercent: 0,
        progressStage: 'Pengajuan Ditolak (Jadwal Bentrok / Syarat Tidak Terpenuhi)',
        timelineUpdates: [
          {
            id: `upd-${Date.now()}`,
            timestamp: new Date().toLocaleString('id-ID'),
            sender: adminUser?.name || 'Staf BPA',
            senderRole: 'Koordinator Approval BPA',
            title: 'Pengajuan Reservasi Ditolak',
            message: 'Mohon maaf, jadwal/stok aset pada tanggal tersebut tidak tersedia.',
            percent: 0,
            badgeType: 'danger'
          },
          ...(b.timelineUpdates || [])
        ]
      };
      return updatedBookingObj;
    });

    persistBookings(updatedList, updatedBookingObj);
    showNotification(`Pesanan ${rejectTarget.bookingCode} telah ditolak.`);
    setRejectTarget(null);
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'SELESAI' || s === 'SIAP DIGUNAKAN') {
      return 'bg-emerald-100 text-emerald-900 border-emerald-200';
    }
    if (s === 'DITOLAK') {
      return 'bg-rose-100 text-rose-900 border-rose-200';
    }
    if (s === 'DISETUJUI' || s === 'SEDANG DISIAPKAN') {
      return 'bg-blue-100 text-blue-900 border-blue-200';
    }
    return 'bg-amber-100 text-amber-900 border-amber-200';
  };

  return (
    <div className="space-y-5">
      {/* Toast Notifikasi */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 px-5 py-3 rounded-2xl bg-uii-blue-950 text-uii-gold border border-uii-gold/40 shadow-2xl text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-uii-gold flex-shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. RINGKASAN STATISTIK PESANAN (RAPI 4 KOLOM) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`bg-white p-4 sm:p-5 rounded-2xl border text-left transition-all flex items-center space-x-3.5 shadow-2xs ${
            statusFilter === 'ALL' ? 'border-uii-blue-900 ring-1 ring-uii-blue-900/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-uii-blue-900 flex items-center justify-center flex-shrink-0">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Pesanan
            </span>
            <span className="text-xl font-black text-uii-blue-950 font-heading">{stats.total}</span>
          </div>
        </button>

        <button
          onClick={() => setStatusFilter('MENUNGGU PERSETUJUAN')}
          className={`bg-white p-4 sm:p-5 rounded-2xl border text-left transition-all flex items-center space-x-3.5 shadow-2xs ${
            statusFilter === 'MENUNGGU PERSETUJUAN'
              ? 'border-amber-500 ring-1 ring-amber-400/40'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Menunggu Approval
            </span>
            <span className="text-xl font-black text-amber-700 font-heading">{stats.pending}</span>
          </div>
        </button>

        <button
          onClick={() => setStatusFilter('IN_PROGRESS')}
          className={`bg-white p-4 sm:p-5 rounded-2xl border text-left transition-all flex items-center space-x-3.5 shadow-2xs ${
            statusFilter === 'IN_PROGRESS'
              ? 'border-blue-600 ring-1 ring-blue-500/30'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Sedang Berjalan
            </span>
            <span className="text-xl font-black text-indigo-700 font-heading">{stats.active}</span>
          </div>
        </button>

        <button
          onClick={() => setStatusFilter(stats.conflicts > 0 ? 'CONFLICT' : 'SELESAI')}
          className={`bg-white p-4 sm:p-5 rounded-2xl border text-left transition-all flex items-center space-x-3.5 shadow-2xs ${
            statusFilter === 'CONFLICT' || statusFilter === 'SELESAI'
              ? 'border-emerald-600 ring-1 ring-emerald-500/30'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              stats.conflicts > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {stats.conflicts > 0 ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {stats.conflicts > 0 ? 'Bentrok Jadwal' : 'Selesai'}
            </span>
            <span
              className={`text-xl font-black font-heading ${
                stats.conflicts > 0 ? 'text-rose-600' : 'text-emerald-700'
              }`}
            >
              {stats.conflicts > 0 ? stats.conflicts : stats.completed}
            </span>
          </div>
        </button>
      </div>

      {/* 2. FILTER BAR BERSIH (SEARCH + PILIH ASET + FILTER STATUS) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode booking, nama penyewa, organisasi, atau aset..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-uii-blue-900/20 focus:bg-white"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <select
            value={selectedAssetFilter}
            onChange={(e) => setSelectedAssetFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-uii-blue-900/20"
          >
            <option value="ALL">Semua Aset ({bookings.length} Pesanan)</option>
            {assetAnalytics.filterAssets.map((asset) => (
              <option key={asset.key} value={asset.key}>
                {asset.name} ({asset.totalOrders} pesanan • Stok {asset.stock})
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-uii-blue-900/20"
          >
            <option value="ALL">Semua Status</option>
            <option value="MENUNGGU PERSETUJUAN">Menunggu Persetujuan</option>
            <option value="IN_PROGRESS">Sedang Berjalan</option>
            <option value="SIAP DIGUNAKAN">Siap Digunakan</option>
            <option value="SELESAI">Selesai</option>
            <option value="DITOLAK">Ditolak</option>
            {stats.conflicts > 0 && (
              <option value="CONFLICT">Bentrok Jadwal ({stats.conflicts})</option>
            )}
          </select>
        </div>
      </div>

      {/* 3. DAFTAR PESANAN RAPI (FULL-WIDTH CLEAN LIST) */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
          <PackageCheck className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-black text-slate-700 font-heading">
            Tidak Ada Pesanan yang Cocok
          </p>
          <p className="text-xs text-slate-400">
            Coba pilih "Semua Aset" atau ubah kata kunci pencarian.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((b) => {
            const conflicts = assetAnalytics.conflictByBooking.get(b.bookingCode) || [];
            const isPending = (b.status || '').toUpperCase() === 'MENUNGGU PERSETUJUAN';
            const pct = isPending ? 0 : Number(b.progressPercent ?? 0);
            const items = b.items || [];

            return (
              <div
                key={b.bookingCode}
                className={`bg-white rounded-2xl p-4 sm:p-5 border shadow-2xs transition-all hover:shadow-sm ${
                  conflicts.length > 0 ? 'border-rose-300 bg-rose-50/15' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Kolom Kiri: Kode, Penyewa & Jadwal */}
                  <div className="space-y-1.5 min-w-0 lg:w-1/3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black text-uii-blue-950 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                        {b.bookingCode}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(
                          b.status
                        )}`}
                      >
                        {b.status}
                      </span>
                      {conflicts.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-black flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" />
                          <span>Bentrok</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-black text-slate-900 truncate">
                      {b.customer?.name || b.userName || 'Penyewa'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                      <span className="truncate">{b.customer?.org || b.userOrg || 'Personal'}</span>
                      <span>•</span>
                      <span>{b.customer?.phone || b.userPhone || '-'}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-slate-600 pt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-uii-blue-900 flex-shrink-0" />
                      <span className="truncate">{b.eventDate || '-'}</span>
                    </div>

                    {/* Badge PIC Penanggung Jawab */}
                    <div className="pt-1">
                      {b.picStaff?.name ? (
                        <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-900">
                          <ShieldCheck className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                          <span className="truncate">PIC: {b.picStaff.name}</span>
                          {b.picStaff.phone && (
                            <span className="text-emerald-700 font-mono text-[9px]">
                              ({formatWhatsAppNumber(b.picStaff.phone)})
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[10px] font-medium text-slate-500">
                          <User className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span>Belum Ada PIC</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Kolom Tengah: Ringkasan Aset & Progres Bar */}
                  <div className="flex-1 space-y-2.5 min-w-0">
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((it, idx) => (
                        <span
                          key={it.id || idx}
                          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-800"
                        >
                          <Package className="w-3 h-3 text-uii-blue-900 flex-shrink-0" />
                          <span className="truncate max-w-[200px]">{it.name}</span>
                          <span className="text-slate-500 font-semibold">×{it.quantity || 1}</span>
                        </span>
                      ))}
                    </div>

                    {b.status !== 'DITOLAK' && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-600 truncate pr-2">
                            {b.progressStage || 'Menunggu Verifikasi Staf'}
                          </span>
                          <span className="font-black text-uii-blue-950 flex-shrink-0">{pct}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              pct >= 100 ? 'bg-emerald-600' : 'bg-uii-blue-900'
                            }`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {conflicts.length > 0 && (
                      <p className="text-[11px] text-rose-700 font-semibold bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                        ⚠️ {conflicts[0]}
                      </p>
                    )}
                  </div>

                  {/* Kolom Kanan: Tombol Aksi Rapi */}
                  <div className="flex flex-wrap items-center gap-2 lg:justify-end flex-shrink-0">
                    <button
                      onClick={() => setDetailOrder(b)}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1.5 transition-colors"
                      title="Lihat detail item & riwayat foto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Detail</span>
                    </button>

                    {/* Tombol Klaim PIC */}
                    {b.status !== 'DITOLAK' && (
                      <button
                        type="button"
                        onClick={() => handleClaimAssetAsPIC(b)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                          b.picStaff?.email && adminUser?.email && b.picStaff.email.toLowerCase() === adminUser.email.toLowerCase()
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                        title="Klaim penanggung jawab aset ini agar nama & WhatsApp Anda otomatis muncul di halaman tracking penyewa"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                        <span>
                          {b.picStaff?.email && adminUser?.email && b.picStaff.email.toLowerCase() === adminUser.email.toLowerCase()
                            ? 'PIC Anda'
                            : b.picStaff?.name
                            ? 'Ganti PIC'
                            : 'Klaim PIC'}
                        </span>
                      </button>
                    )}

                    {b.status === 'MENUNGGU PERSETUJUAN' && (
                      <>
                        <button
                          onClick={() => handleQuickApprove(b)}
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Setujui</span>
                        </button>
                        <button
                          onClick={() => setRejectTarget(b)}
                          className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center space-x-1 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Tolak</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CARD OVERLAY MODAL: DETAIL ITEM & RIWAYAT PERKEMBANGAN */}
      <AdminCardOverlayModal
        isOpen={Boolean(detailOrder)}
        onClose={() => setDetailOrder(null)}
        title={`Detail Pesanan (${detailOrder?.bookingCode || ''})`}
        subtitle={`Penyewa: ${detailOrder?.customer?.name || detailOrder?.userName || '-'}`}
      >
        {detailOrder && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-uii-blue-900 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Penyewa</span>
                  <span className="font-black text-slate-900">
                    {detailOrder.customer?.name || detailOrder.userName}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-uii-blue-900 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">WhatsApp</span>
                  <span className="font-black text-slate-900">
                    {detailOrder.customer?.phone || detailOrder.userPhone || '-'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-uii-blue-900 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Organisasi</span>
                  <span className="font-bold text-slate-800">
                    {detailOrder.customer?.org || detailOrder.userOrg || 'Personal'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-uii-blue-900 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Jadwal Acara</span>
                  <span className="font-bold text-slate-800">{detailOrder.eventDate || '-'}</span>
                </div>
              </div>
            </div>

            {/* Kartu Informasi PIC Penanggung Jawab */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-uii-blue-950 to-uii-blue-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center space-x-3 min-w-0">
                {detailOrder.picStaff?.picture ? (
                  <img
                    src={detailOrder.picStaff.picture}
                    alt={detailOrder.picStaff.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-uii-gold flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-uii-gold text-uii-blue-950 font-black flex items-center justify-center text-sm flex-shrink-0">
                    {detailOrder.picStaff?.name ? detailOrder.picStaff.name.charAt(0).toUpperCase() : 'P'}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] text-uii-gold uppercase font-black tracking-wider">
                      Penanggung Jawab Aset (PIC BPA)
                    </span>
                    {detailOrder.picStaff?.name && (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30">
                        Aktif
                      </span>
                    )}
                  </div>
                  <p className="font-black text-white text-xs truncate">
                    {detailOrder.picStaff?.name || 'Belum ada staf yang mengklaim'}
                  </p>
                  <p className="text-[10px] text-slate-300">
                    {detailOrder.picStaff?.role || 'Staf Operasional BPA KM UII'} • WA:{' '}
                    <span className="font-mono font-bold text-uii-gold">
                      {detailOrder.picStaff?.phone ? formatWhatsAppNumber(detailOrder.picStaff.phone) : 'Belum diisi'}
                    </span>
                  </p>
                </div>
              </div>

              {detailOrder.status !== 'DITOLAK' && (
                <button
                  type="button"
                  onClick={() => {
                    handleClaimAssetAsPIC(detailOrder);
                    setDetailOrder((prev) =>
                      prev ? { ...prev, picStaff: getActiveStaffPIC(adminUser) } : null
                    );
                  }}
                  className="px-3 py-1.5 rounded-xl bg-uii-gold hover:bg-yellow-400 text-uii-blue-950 font-black text-xs flex items-center justify-center space-x-1.5 shadow-2xs self-start sm:self-auto flex-shrink-0 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Klaim Sebagai PIC</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              <span className="font-black text-slate-700 uppercase tracking-wider text-[11px] block">
                Daftar Aset & Status Kesiapan:
              </span>
              {(detailOrder.items || []).map((it, idx) => (
                <div
                  key={it.id || idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                >
                  <div>
                    <p className="font-black text-slate-900">{it.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {it.quantity || 1} unit • {it.startDate || '-'} s/d {it.endDate || it.startDate || '-'}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-bold text-[11px] text-slate-700">
                    {it.itemStatus || 'Terjadwal'}
                  </span>
                </div>
              ))}
            </div>

            {Array.isArray(detailOrder.timelineUpdates) && detailOrder.timelineUpdates.length > 0 && (
              <div className="space-y-2">
                <span className="font-black text-slate-700 uppercase tracking-wider text-[11px] block">
                  Riwayat Perkembangan Terbaru:
                </span>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {detailOrder.timelineUpdates.map((upd, idx) => (
                    <div key={upd.id || idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex gap-3">
                      {upd.photo && (
                        <img
                          src={upd.photo}
                          alt={upd.title}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-black text-slate-900 truncate">{upd.title}</span>
                          <span className="text-[10px] text-slate-400 flex-shrink-0">{upd.timestamp}</span>
                        </div>
                        <p className="text-slate-600 mt-0.5 leading-relaxed">{upd.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              {detailOrder.status !== 'DITOLAK' && (
                <button
                  type="button"
                  onClick={() => {
                    const target = detailOrder;
                    setDetailOrder(null);
                    handleOpenProgressModal(target);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-uii-blue-950 text-uii-gold font-black text-xs flex items-center space-x-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Progres</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setDetailOrder(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </AdminCardOverlayModal>

      {/* CARD OVERLAY MODAL: SMART UPLOAD PERKEMBANGAN & DOKUMENTASI FOTO */}
      <AdminCardOverlayModal
        isOpen={Boolean(activeOrderForProgress)}
        onClose={() => setActiveOrderForProgress(null)}
        title={`Upload Perkembangan Aset (${activeOrderForProgress?.bookingCode || ''})`}
        subtitle={`Penyewa: ${activeOrderForProgress?.customer?.name || '-'} • Tersinkron ke Neon DB & Pelacakan`}
      >
        {activeOrderForProgress && (
          <form onSubmit={handleSubmitProgressUpdate} className="space-y-4 text-xs">
            {/* PIC BPA Info & Auto-assignment notice */}
            <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3 min-w-0">
                {activeOrderForProgress.picStaff?.picture || activeStaff.picture ? (
                  <img
                    src={activeOrderForProgress.picStaff?.picture || activeStaff.picture}
                    alt={activeOrderForProgress.picStaff?.name || activeStaff.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-amber-400 flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-uii-blue-900 text-uii-gold font-black flex items-center justify-center text-sm flex-shrink-0">
                    {(activeOrderForProgress.picStaff?.name || activeStaff.name || 'S').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] text-amber-950 font-black uppercase tracking-wider">
                      Staf PIC Penanggung Jawab
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-200/70 text-amber-950 text-[9px] font-black">
                      Tersinkron ke User
                    </span>
                  </div>
                  <p className="font-black text-slate-900 text-xs truncate">
                    {activeOrderForProgress.picStaff?.name || activeStaff.name}
                  </p>
                  <p className="text-[10px] text-slate-600">
                    {activeOrderForProgress.picStaff?.role || activeStaff.role} • WA:{' '}
                    <span className="font-mono font-bold text-slate-900">
                      {formatWhatsAppNumber(activeOrderForProgress.picStaff?.phone || activeStaff.phone)}
                    </span>
                  </p>
                </div>
              </div>

              {!activeOrderForProgress.picStaff?.name && (
                <button
                  type="button"
                  onClick={() => {
                    handleClaimAssetAsPIC(activeOrderForProgress);
                    setActiveOrderForProgress((prev) =>
                      prev ? { ...prev, picStaff: activeStaff } : null
                    );
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center space-x-1 shadow-2xs self-start sm:self-auto flex-shrink-0"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Klaim Sebagai PIC</span>
                </button>
              )}
            </div>
            {/* Smart Preset Tahap SOP */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-black text-uii-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-uii-gold" />
                  <span>Pilih Tahap Kesiapan (Tahap 1 s/d Akhir):</span>
                </label>
                <span className="text-[10px] font-bold text-slate-400">
                  Otomatis atur status & milestone
                </span>
              </div>
              <div className="relative">
                <select
                  value={SMART_STAGE_PRESETS.find((p) => p.percent === Number(progressPercent))?.percent || 'custom'}
                  onChange={(e) => {
                    const found = SMART_STAGE_PRESETS.find((p) => String(p.percent) === e.target.value);
                    if (found) handleApplyPreset(found);
                  }}
                  className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 text-xs focus:ring-2 focus:ring-uii-blue-900 focus:outline-none cursor-pointer shadow-2xs"
                >
                  {SMART_STAGE_PRESETS.map((preset, idx) => (
                    <option key={preset.percent} value={preset.percent}>
                      Tahap {idx + 1} ({preset.percent}%) - {preset.stage.split(':')[1]?.trim() || preset.label}
                    </option>
                  ))}
                  <option value="custom">-- Kustom / Atur Manual --</option>
                </select>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {SMART_STAGE_PRESETS.map((preset) => (
                  <button
                    key={preset.percent}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                      Number(progressPercent) === preset.percent
                        ? 'bg-uii-blue-950 text-uii-gold border-uii-blue-950 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider Persentase + Auto Status Preview */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Persentase Kesiapan:</span>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-black text-[10px]">
                    Status: {deriveStatusFromPercent(progressPercent, activeOrderForProgress.status)}
                  </span>
                  <span className="text-sm font-black text-uii-blue-950">{progressPercent}%</span>
                </div>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={progressPercent}
                onChange={(e) => setProgressPercent(Number(e.target.value))}
                className="w-full accent-uii-blue-950"
              />
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Judul Pembaruan Timeline: *
                </label>
                <input
                  type="text"
                  required
                  value={updateTitle}
                  onChange={(e) => setUpdateTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Label Tahap Kesiapan: *
                </label>
                <input
                  type="text"
                  required
                  value={progressStage}
                  onChange={(e) => setProgressStage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan Perkembangan untuk Penyewa: *
                </label>
                <textarea
                  rows={2}
                  required
                  value={updateMessage}
                  onChange={(e) => setUpdateMessage(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Checklist Status Per-Item Aset */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-700">
                Status Kesiapan Per-Item Aset:
              </label>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {(activeOrderForProgress.items || []).map((it, idx) => {
                  const key = it.id || idx;
                  return (
                    <div
                      key={key}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-2"
                    >
                      <span className="font-bold text-slate-800 flex-1 truncate">{it.name}</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={itemStatuses[key] || ''}
                          onChange={(e) =>
                            setItemStatuses({ ...itemStatuses, [key]: e.target.value })
                          }
                          placeholder="Status unit..."
                          className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-[11px] w-44"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setItemStatuses({
                              ...itemStatuses,
                              [key]: 'Siap & Lolos Uji (100%)'
                            })
                          }
                          className="px-2 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[10px] flex-shrink-0"
                        >
                          Siap
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upload Foto Dokumentasi */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-700">
                Upload Foto Bukti Perkembangan (Opsional):
              </label>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoFileChange}
                className="hidden"
              />

              {uploadedPhoto ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img
                    src={uploadedPhoto}
                    alt="Preview dokumentasi"
                    className="w-full h-40 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setUploadedPhoto('')}
                    className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md"
                    title="Hapus foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={isProcessingPhoto}
                  className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-uii-blue-900 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold flex items-center justify-center space-x-2 transition-colors"
                >
                  <Camera className="w-4 h-4 text-uii-blue-900" />
                  <span>
                    {isProcessingPhoto
                      ? 'Mengompresi gambar...'
                      : 'Pilih / Upload Foto Dokumentasi Persiapan'}
                  </span>
                </button>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveOrderForProgress(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-uii-blue-950 hover:bg-uii-blue-900 text-uii-gold text-xs font-black flex items-center space-x-1.5 shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Simpan & Publikasikan</span>
              </button>
            </div>
          </form>
        )}
      </AdminCardOverlayModal>

      {/* CARD OVERLAY KONFIRMASI TOLAK */}
      <AdminConfirmOverlayModal
        isOpen={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleConfirmReject}
        title="Tolak Pengajuan Aset"
        message={`Yakin ingin menolak pesanan ${rejectTarget?.bookingCode || ''}?`}
        confirmLabel="Ya, Tolak Pesanan"
        variant="warning"
      />
    </div>
  );
};
