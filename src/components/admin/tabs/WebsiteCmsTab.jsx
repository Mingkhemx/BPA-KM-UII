import React, { useState, useEffect, useRef } from 'react';
import { 
  Image, 
  MessageSquare, 
  Package, 
  FileText, 
  Users, 
  Film, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  ExternalLink, 
  Upload,
  Calendar,
  Eye,
  Star,
  Download,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { adminStorage } from '../../../utils/adminStorage';
import { AdminCardOverlayModal, AdminConfirmOverlayModal } from '../AdminOverlayModal';

const PhotoUploadField = ({ label, required = false, value, onChange, onError, className = 'md:col-span-2' }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onError?.('Mohon pilih file gambar yang valid (JPG, PNG, atau WEBP).');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new window.Image();
      img.onload = () => {
        const maxWidth = 1200;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        onChange(canvas.toDataURL('image/jpeg', 0.82));
        setIsProcessing(false);
      };
      img.onerror = () => {
        setIsProcessing(false);
        onError?.('Gagal memproses file gambar.');
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={className}>
      <label className="block font-bold text-slate-700 mb-1">
        {label}{required ? ' *' : ''}
      </label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
          <img
            src={value}
            alt={label}
            className="w-full h-40 object-cover"
          />
          <div className="absolute top-2 right-2 flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-lg bg-white/90 hover:bg-white text-uii-blue-950 text-[10px] font-bold shadow-sm border border-slate-200 flex items-center space-x-1"
            >
              <Upload className="w-3 h-3" />
              <span>Ganti Foto</span>
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
              title="Hapus Foto"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={isProcessing}
          onClick={() => inputRef.current?.click()}
          className="w-full py-4 px-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-uii-blue-900 bg-slate-50 hover:bg-blue-50/40 transition-colors flex flex-col items-center justify-center space-y-1 text-slate-600"
        >
          <Upload className="w-5 h-5 text-uii-blue-900" />
          <span className="font-bold text-xs">
            {isProcessing ? 'Memproses gambar...' : 'Pilih / Upload Foto dari Perangkat'}
          </span>
          <span className="text-[10px] text-slate-400">
            Mendukung JPG, PNG, WEBP (Otomatis dikompres)
          </span>
        </button>
      )}
    </div>
  );
};

export const WebsiteCmsTab = () => {
  const [subTab, setSubTab] = useState('banners'); // 'banners' | 'testimonials' | 'products' | 'articles' | 'investor' | 'gallery'
  const [toastMsg, setToastMsg] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null); // { title, message, onConfirm }

  // Live state from storage
  const [banners, setBanners] = useState(() => adminStorage.getBanners());
  const [testimonials, setTestimonials] = useState(() => adminStorage.getTestimonials());
  const [products, setProducts] = useState(() => adminStorage.getProducts());
  const [articles, setArticles] = useState(() => adminStorage.getArticles());
  const [team, setTeam] = useState(() => adminStorage.getTeam());
  const [documents, setDocuments] = useState(() => adminStorage.getDocuments());
  const [gallery, setGallery] = useState(() => adminStorage.getGallery());

  useEffect(() => {
    const syncAll = () => {
      setBanners(adminStorage.getBanners());
      setTestimonials(adminStorage.getTestimonials());
      setProducts(adminStorage.getProducts());
      setArticles(adminStorage.getArticles());
      setTeam(adminStorage.getTeam());
      setDocuments(adminStorage.getDocuments());
      setGallery(adminStorage.getGallery());
    };
    window.addEventListener('bpa-data-updated', syncAll);
    window.addEventListener('storage', syncAll);
    return () => {
      window.removeEventListener('bpa-data-updated', syncAll);
      window.removeEventListener('storage', syncAll);
    };
  }, []);

  const showNotification = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  /* =========================================================================
     1. BANNER BERANDA HANDLERS
     ========================================================================= */
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState(null);
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    image: '',
    badge: 'Resmi BPA KM UII',
    active: true
  });

  const handleSaveBanner = (e) => {
    e.preventDefault();
    if (!bannerForm.title.trim() || !bannerForm.image.trim()) {
      showNotification('Judul dan Foto Banner wajib diisi!');
      return;
    }

    let updated;
    if (editingBannerId) {
      updated = banners.map(b => b.id === editingBannerId ? { ...b, ...bannerForm } : b);
      showNotification('Banner berhasil diperbarui!');
    } else {
      const newBanner = {
        id: Date.now(),
        ...bannerForm
      };
      updated = [newBanner, ...banners];
      showNotification('Banner baru berhasil ditambahkan!');
    }
    setBanners(updated);
    adminStorage.saveBanners(updated);
    setIsAddingBanner(false);
    setEditingBannerId(null);
    setBannerForm({ title: '', subtitle: '', description: '', image: '', badge: '', active: true });
  };

  const handleDeleteBanner = (id) => {
    setConfirmDelete({
      title: 'Hapus Banner Beranda',
      message: 'Yakin ingin menghapus banner ini dari halaman beranda?',
      onConfirm: () => {
        const updated = banners.filter(b => b.id !== id);
        setBanners(updated);
        adminStorage.saveBanners(updated);
        showNotification('Banner berhasil dihapus.');
      }
    });
  };

  /* =========================================================================
     2. TESTIMONI HANDLERS
     ========================================================================= */
  const [isAddingTesti, setIsAddingTesti] = useState(false);
  const [editingTestiId, setEditingTestiId] = useState(null);
  const [testiForm, setTestiForm] = useState({
    name: '',
    role: '',
    org: '',
    content: '',
    rating: 5,
    asset: 'Gedung SCC',
    date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  });

  const handleSaveTesti = (e) => {
    e.preventDefault();
    let updated;
    if (editingTestiId) {
      updated = testimonials.map(t => t.id === editingTestiId ? { ...t, ...testiForm } : t);
      showNotification('Testimoni berhasil diubah!');
    } else {
      const newTesti = { id: Date.now(), ...testiForm };
      updated = [newTesti, ...testimonials];
      showNotification('Testimoni baru berhasil ditambahkan!');
    }
    setTestimonials(updated);
    adminStorage.saveTestimonials(updated);
    setIsAddingTesti(false);
    setEditingTestiId(null);
    setTestiForm({ name: '', role: '', org: '', content: '', rating: 5, asset: 'Gedung SCC', date: '' });
  };

  const handleDeleteTesti = (id) => {
    setConfirmDelete({
      title: 'Hapus Testimoni',
      message: 'Yakin ingin menghapus ulasan testimoni ini?',
      onConfirm: () => {
        const updated = testimonials.filter(t => t.id !== id);
        setTestimonials(updated);
        adminStorage.saveTestimonials(updated);
        showNotification('Testimoni berhasil dihapus.');
      }
    });
  };

  /* =========================================================================
     3. PRODUK / ASET SEWA HANDLERS
     ========================================================================= */
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProdId, setEditingProdId] = useState(null);
  const [prodForm, setProdForm] = useState({
    name: '',
    cat: 'Gedung',
    priceText: 'Rp 350.000 / hari',
    priceValue: 350000,
    stock: 1,
    image: '',
    desc: ''
  });

  const handleSaveProduct = (e) => {
    e.preventDefault();
    let updated;
    if (editingProdId) {
      updated = products.map(p => p.id === editingProdId ? { ...p, ...prodForm } : p);
      showNotification('Data produk sewa berhasil diperbarui!');
    } else {
      const newProd = {
        id: `prod-${Date.now()}`,
        slug: prodForm.name.toLowerCase().replace(/\s+/g, '-'),
        ...prodForm
      };
      updated = [newProd, ...products];
      showNotification('Produk sewa baru berhasil ditambahkan!');
    }
    setProducts(updated);
    adminStorage.saveProducts(updated);
    setIsAddingProduct(false);
    setEditingProdId(null);
    setProdForm({ name: '', cat: 'Gedung', priceText: '', priceValue: 0, stock: 1, image: '', desc: '' });
  };

  const handleDeleteProduct = (id) => {
    setConfirmDelete({
      title: 'Hapus Produk Sewa',
      message: 'Yakin ingin menghapus produk ini dari katalog sewa BPA?',
      onConfirm: () => {
        const updated = products.filter(p => p.id !== id);
        setProducts(updated);
        adminStorage.saveProducts(updated);
        showNotification('Produk berhasil dihapus.');
      }
    });
  };

  /* =========================================================================
     4. ARTIKEL BERITA HANDLERS
     ========================================================================= */
  const [isAddingArticle, setIsAddingArticle] = useState(false);
  const [editingArtId, setEditingArtId] = useState(null);
  const [articleForm, setArticleForm] = useState({
    title: '',
    category: 'Kegiatan BPA',
    date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    author: 'Sekretariat BPA',
    readTime: '3 min baca',
    image: '',
    excerpt: ''
  });

  const handleSaveArticle = (e) => {
    e.preventDefault();
    let updated;
    if (editingArtId) {
      updated = articles.map(a => a.id === editingArtId ? { ...a, ...articleForm } : a);
      showNotification('Artikel berhasil diperbarui!');
    } else {
      const newArt = { id: `art-${Date.now()}`, views: 0, ...articleForm };
      updated = [newArt, ...articles];
      showNotification('Artikel baru berhasil dipublikasikan!');
    }
    setArticles(updated);
    adminStorage.saveArticles(updated);
    setIsAddingArticle(false);
    setEditingArtId(null);
    setArticleForm({ title: '', category: 'Kegiatan BPA', date: '', author: '', readTime: '', image: '', excerpt: '' });
  };

  const handleDeleteArticle = (id) => {
    setConfirmDelete({
      title: 'Hapus Artikel Berita',
      message: 'Yakin ingin menghapus artikel berita ini?',
      onConfirm: () => {
        const updated = articles.filter(a => a.id !== id);
        setArticles(updated);
        adminStorage.saveArticles(updated);
        showNotification('Artikel telah dihapus.');
      }
    });
  };

  /* =========================================================================
     5. INVESTOR: STRUKTUR ANGGOTA & DOKUMEN LPJ / SK HANDLERS
     ========================================================================= */
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [memberForm, setMemberForm] = useState({
    name: '',
    role: '',
    division: 'Pengurus Harian',
    image: ''
  });

  const handleSaveMember = (e) => {
    e.preventDefault();
    let updated;
    if (editingMemberId) {
      updated = team.map(m => m.id === editingMemberId ? { ...m, ...memberForm } : m);
      showNotification('Data pengurus berhasil diubah!');
    } else {
      const newMem = { id: `tm-${Date.now()}`, ...memberForm };
      updated = [...team, newMem];
      showNotification('Anggota pengurus baru berhasil ditambahkan!');
    }
    setTeam(updated);
    adminStorage.saveTeam(updated);
    setIsAddingMember(false);
    setEditingMemberId(null);
    setMemberForm({ name: '', role: '', division: '', image: '' });
  };

  const handleDeleteMember = (id) => {
    setConfirmDelete({
      title: 'Hapus Anggota Pengurus',
      message: 'Yakin ingin menghapus anggota ini dari struktur organisasi?',
      onConfirm: () => {
        const updated = team.filter(m => m.id !== id);
        setTeam(updated);
        adminStorage.saveTeam(updated);
        showNotification('Anggota pengurus berhasil dihapus.');
      }
    });
  };

  // Dokumen SK & LPJ
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [docForm, setDocForm] = useState({
    title: '',
    type: 'LPJ',
    period: 'Triwulan 4',
    date: 'Desember 2026',
    fileImage: '',
    downloadUrl: '/docs/SK-Akreditasi-Teknik-Elektro-Program-Sarjana.pdf'
  });

  const handleSaveDoc = (e) => {
    e.preventDefault();
    const newDoc = { id: `doc-${Date.now()}`, ...docForm };
    const updated = [newDoc, ...documents];
    setDocuments(updated);
    adminStorage.saveDocuments(updated);
    setIsAddingDoc(false);
    setDocForm({ title: '', type: 'LPJ', period: 'Triwulan 4', date: '', fileImage: '', downloadUrl: '' });
    showNotification('Dokumen SK/LPJ baru berhasil diunggah!');
  };

  const handleDeleteDoc = (id) => {
    setConfirmDelete({
      title: 'Hapus Dokumen SK / LPJ',
      message: 'Yakin ingin menghapus dokumen resmi ini?',
      onConfirm: () => {
        const updated = documents.filter(d => d.id !== id);
        setDocuments(updated);
        adminStorage.saveDocuments(updated);
        showNotification('Dokumen berhasil dihapus.');
      }
    });
  };

  /* =========================================================================
     6. GALERI FOTO & VIDEO HANDLERS
     ========================================================================= */
  const [isAddingGallery, setIsAddingGallery] = useState(false);
  const [galleryType, setGalleryType] = useState('photo'); // 'photo' | 'video'
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    category: 'Kegiatan & Dokumentasi',
    date: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
    image: '',
    youtubeId: '',
    description: ''
  });

  const handleSaveGallery = (e) => {
    e.preventDefault();
    const updated = { ...gallery };
    if (galleryType === 'photo') {
      if (!galleryForm.image) {
        showNotification('Mohon unggah foto dokumentasi terlebih dahulu.');
        return;
      }
      const newPhoto = {
        id: `gp-${Date.now()}`,
        title: galleryForm.title,
        category: galleryForm.category,
        date: galleryForm.date,
        image: galleryForm.image,
        description: galleryForm.description
      };
      updated.photos = [newPhoto, ...updated.photos];
      showNotification('Foto galeri baru berhasil diposting!');
    } else {
      // Ekstrak youtube ID jika yang dimasukkan URL lengkap
      let yId = galleryForm.youtubeId.trim();
      if (yId.includes('v=')) {
        yId = yId.split('v=')[1].split('&')[0];
      } else if (yId.includes('youtu.be/')) {
        yId = yId.split('youtu.be/')[1].split('?')[0];
      }

      const newVideo = {
        id: `gv-${Date.now()}`,
        title: galleryForm.title,
        category: galleryForm.category,
        date: galleryForm.date,
        youtubeId: yId || 'xvbcBVoYb6w',
        description: galleryForm.description
      };
      updated.videos = [newVideo, ...updated.videos];
      showNotification('Video dokumentasi baru berhasil ditambahkan!');
    }
    setGallery(updated);
    adminStorage.saveGallery(updated);
    setIsAddingGallery(false);
    setGalleryForm({ title: '', category: '', date: '', image: '', youtubeId: '', description: '' });
  };

  const handleDeletePhoto = (id) => {
    setConfirmDelete({
      title: 'Hapus Foto Galeri',
      message: 'Yakin ingin menghapus foto ini dari galeri dokumentasi?',
      onConfirm: () => {
        const updated = { ...gallery, photos: gallery.photos.filter(p => p.id !== id) };
        setGallery(updated);
        adminStorage.saveGallery(updated);
        showNotification('Foto galeri berhasil dihapus.');
      }
    });
  };

  const handleDeleteVideo = (id) => {
    setConfirmDelete({
      title: 'Hapus Video Galeri',
      message: 'Yakin ingin menghapus video dokumentasi ini dari galeri?',
      onConfirm: () => {
        const updated = { ...gallery, videos: gallery.videos.filter(v => v.id !== id) };
        setGallery(updated);
        adminStorage.saveGallery(updated);
        showNotification('Video galeri berhasil dihapus.');
      }
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notifikasi Aksi CMS */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 px-5 py-3 rounded-2xl bg-uii-blue-950 text-uii-gold border border-uii-gold/40 shadow-2xl text-xs font-bold flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-uii-gold" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* SUB-NAVBAR KONTEN WEBSITE (6 SUBMENU RAPI) */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/90 shadow-2xs flex flex-wrap gap-1.5 items-center">
        {[
          { key: 'banners', label: 'Banner Beranda', icon: Image, count: banners.length },
          { key: 'testimonials', label: 'Testimoni Penyewa', icon: MessageSquare, count: testimonials.length },
          { key: 'products', label: 'Produk & Aset Sewa', icon: Package, count: products.length },
          { key: 'articles', label: 'Artikel Berita', icon: FileText, count: articles.length },
          { key: 'investor', label: 'Investor, Pengurus & LPJ/SK', icon: Users, count: team.length + documents.length },
          { key: 'gallery', label: 'Galeri Foto & Video', icon: Film, count: gallery.photos.length + gallery.videos.length }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = subTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                setSubTab(item.key);
                setIsAddingBanner(false);
                setIsAddingTesti(false);
                setIsAddingProduct(false);
                setIsAddingArticle(false);
                setIsAddingMember(false);
                setIsAddingDoc(false);
                setIsAddingGallery(false);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
                isActive
                  ? 'bg-uii-blue-950 text-uii-gold shadow-xs'
                  : 'text-slate-600 hover:text-uii-blue-950 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                isActive ? 'bg-uii-gold text-uii-blue-950' : 'bg-slate-200 text-slate-700'
              }`}>
                {item.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          SUB-TAB 1: BANNER BERANDA
         ========================================================================= */}
      {subTab === 'banners' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200">
            <div>
              <h3 className="text-base font-black text-uii-blue-950 font-heading">
                Kelola Banner & Foto Hero Slider Beranda
              </h3>
              <p className="text-xs text-slate-500">
                Atur foto latar, judul, dan pesan utama yang pertama kali dilihat pengunjung di beranda web BPA.
              </p>
            </div>
            <button
              onClick={() => {
                setIsAddingBanner(true);
                setEditingBannerId(null);
                setBannerForm({ title: '', subtitle: '', description: '', image: '', badge: 'Resmi BPA KM UII', active: true });
              }}
              className="px-4 py-2.5 rounded-xl bg-uii-blue-950 text-uii-gold font-bold text-xs flex items-center space-x-2 shadow-xs hover:bg-uii-blue-900 self-start"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Banner Baru</span>
            </button>
          </div>

          {/* Card Overlay Modal Tambah & Edit Banner */}
          <AdminCardOverlayModal
            isOpen={isAddingBanner}
            onClose={() => {
              setIsAddingBanner(false);
              setEditingBannerId(null);
            }}
            title={editingBannerId ? 'Edit Banner Beranda' : 'Tambah Banner Baru'}
            subtitle="Atur tampilan foto latar, judul, dan badge pada Hero Slider beranda."
          >
            <form onSubmit={handleSaveBanner} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Judul Banner (Title): *</label>
                  <input
                    type="text"
                    required
                    value={bannerForm.title}
                    onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                    placeholder="Contoh: Gedung Student Convention Center"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subjudul (Subtitle):</label>
                  <input
                    type="text"
                    value={bannerForm.subtitle}
                    onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                    placeholder="Contoh: Pusat Kegiatan Mahasiswa & Pagelaran Seni"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                  />
                </div>
                <PhotoUploadField
                  label="Upload Foto Banner:"
                  required
                  value={bannerForm.image}
                  onChange={(val) => setBannerForm({ ...bannerForm, image: val })}
                  onError={showNotification}
                />
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Badge Teks:</label>
                  <input
                    type="text"
                    value={bannerForm.badge}
                    onChange={(e) => setBannerForm({ ...bannerForm, badge: e.target.value })}
                    placeholder="Contoh: Kesiapan Lapangan 100%"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Deskripsi Singkat:</label>
                  <textarea
                    rows={2}
                    value={bannerForm.description}
                    onChange={(e) => setBannerForm({ ...bannerForm, description: e.target.value })}
                    placeholder="Tuliskan keterangan fasilitas atau ajakan sewa..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingBanner(false);
                    setEditingBannerId(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-uii-blue-950 text-uii-gold text-xs font-black shadow-xs hover:bg-uii-blue-900"
                >
                  Simpan Banner
                </button>
              </div>
            </form>
          </AdminCardOverlayModal>

          {/* Grid List Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {banners.map((b) => (
              <div key={b.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between">
                <div className="relative h-44 bg-slate-800">
                  <img
                    src={b.image}
                    alt={b.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/images/produk/detail/scc-wide.jpg'; }}
                  />
                  <div className="absolute top-2.5 left-2.5 bg-uii-gold text-uii-blue-950 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {b.badge || 'Banner'}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h4 className="font-extrabold text-sm text-uii-blue-950 font-heading leading-tight">{b.title}</h4>
                    <p className="text-[11px] font-bold text-uii-blue-900 mt-0.5">{b.subtitle}</p>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{b.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Aktif di Beranda
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setEditingBannerId(b.id);
                          setBannerForm(b);
                          setIsAddingBanner(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-uii-blue-900 hover:bg-slate-100"
                        title="Edit Banner"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(b.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Hapus Banner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 2: CRUD TESTIMONI
         ========================================================================= */}
      {subTab === 'testimonials' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200">
            <div>
              <h3 className="text-base font-black text-uii-blue-950 font-heading">
                Kelola Testimoni & Review Penyewa
              </h3>
              <p className="text-xs text-slate-500">
                Tambah, edit, dan hapus review kepuasan ormawa serta penyewa umum yang tampil di beranda.
              </p>
            </div>
            <button
              onClick={() => {
                setIsAddingTesti(true);
                setEditingTestiId(null);
                setTestiForm({ name: '', role: 'Panitia Acara', org: '', content: '', rating: 5, asset: 'Gedung SCC', date: new Date().toLocaleDateString('id-ID') });
              }}
              className="px-4 py-2.5 rounded-xl bg-uii-blue-950 text-uii-gold font-bold text-xs flex items-center space-x-2 shadow-xs hover:bg-uii-blue-900 self-start"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Testimoni</span>
            </button>
          </div>

          <AdminCardOverlayModal
            isOpen={isAddingTesti}
            onClose={() => {
              setIsAddingTesti(false);
              setEditingTestiId(null);
            }}
            title={editingTestiId ? 'Edit Testimoni Penyewa' : 'Tambah Testimoni Baru'}
            subtitle="Tampilkan ulasan resmi dari mahasiswa, ormawa, maupun masyarakat umum."
          >
            <form onSubmit={handleSaveTesti} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Penyewa: *</label>
                  <input
                    type="text"
                    required
                    value={testiForm.name}
                    onChange={(e) => setTestiForm({ ...testiForm, name: e.target.value })}
                    placeholder="Contoh: Muhammad Farhan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jabatan / Role:</label>
                  <input
                    type="text"
                    value={testiForm.role}
                    onChange={(e) => setTestiForm({ ...testiForm, role: e.target.value })}
                    placeholder="Contoh: Ketua Panitia / Divisi Logistik"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Organisasi / Lembaga:</label>
                  <input
                    type="text"
                    value={testiForm.org}
                    onChange={(e) => setTestiForm({ ...testiForm, org: e.target.value })}
                    placeholder="Contoh: Seminar Nasional FTI UII"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Aset yang Disewa:</label>
                  <input
                    type="text"
                    value={testiForm.asset}
                    onChange={(e) => setTestiForm({ ...testiForm, asset: e.target.value })}
                    placeholder="Contoh: Gedung SCC & Sound HTS"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rating Bintang (1 - 5):</label>
                  <select
                    value={testiForm.rating}
                    onChange={(e) => setTestiForm({ ...testiForm, rating: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Bintang - Sangat Puas)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Bintang - Puas)</option>
                    <option value={3}>⭐⭐⭐ (3 Bintang - Cukup)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Review:</label>
                  <input
                    type="text"
                    value={testiForm.date}
                    onChange={(e) => setTestiForm({ ...testiForm, date: e.target.value })}
                    placeholder="Contoh: 12 Oktober 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Kutipan Ulasan / Testimoni: *</label>
                  <textarea
                    rows={3}
                    required
                    value={testiForm.content}
                    onChange={(e) => setTestiForm({ ...testiForm, content: e.target.value })}
                    placeholder="Tuliskan pengalaman penyewa terhadap fasilitas dan bantuan operasional BPA..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingTesti(false);
                    setEditingTestiId(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-uii-blue-950 text-uii-gold text-xs font-black shadow-xs hover:bg-uii-blue-900"
                >
                  Simpan Testimoni
                </button>
              </div>
            </form>
          </AdminCardOverlayModal>

          {/* Grid Testimoni */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex text-amber-400">
                      {[...Array(t.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      {t.asset}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 italic leading-relaxed">"{t.content}"</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <h5 className="font-extrabold text-xs text-uii-blue-950">{t.name}</h5>
                    <p className="text-[10px] text-slate-400">{t.role} • {t.org}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setEditingTestiId(t.id);
                        setTestiForm(t);
                        setIsAddingTesti(true);
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-uii-blue-900 hover:bg-slate-100"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTesti(t.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 3: CRUD PRODUK / ASET SEWA
         ========================================================================= */}
      {subTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200">
            <div>
              <h3 className="text-base font-black text-uii-blue-950 font-heading">
                Kelola Inventaris & Tarif Aset Sewa
              </h3>
              <p className="text-xs text-slate-500">
                Atur ketersediaan aset (Gedung SCC, HT Baofeng, Proyektor, Kursi Sapporo, Katering, Photobooth).
              </p>
            </div>
            <button
              onClick={() => {
                setIsAddingProduct(true);
                setEditingProdId(null);
                setProdForm({ name: '', cat: 'Gedung', priceText: 'Rp 250.000 / hari', priceValue: 250000, stock: 1, image: '', desc: '' });
              }}
              className="px-4 py-2.5 rounded-xl bg-uii-blue-950 text-uii-gold font-bold text-xs flex items-center space-x-2 shadow-xs hover:bg-uii-blue-900 self-start"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Aset Sewa</span>
            </button>
          </div>

          <AdminCardOverlayModal
            isOpen={isAddingProduct}
            onClose={() => {
              setIsAddingProduct(false);
              setEditingProdId(null);
            }}
            title={editingProdId ? 'Edit Produk Aset' : 'Tambah Produk Aset Baru'}
            subtitle="Atur harga sewa, stok unit, foto, dan spesifikasi aset sarpras."
          >
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Aset / Layanan: *</label>
                  <input
                    type="text"
                    required
                    value={prodForm.name}
                    onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                    placeholder="Contoh: Sound System HTS P12E"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori:</label>
                  <select
                    value={prodForm.cat}
                    onChange={(e) => setProdForm({ ...prodForm, cat: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                  >
                    <option value="Gedung">Gedung / Venue</option>
                    <option value="Audio">Audio & Tata Suara</option>
                    <option value="Visual">Visual & Proyektor</option>
                    <option value="Komunikasi">Komunikasi & HT</option>
                    <option value="Logistik">Logistik & Kursi</option>
                    <option value="Katering">Katering / Konsumsi</option>
                    <option value="Dokumentasi">Photobooth & Media</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tarif Sewa (Angka Rp): *</label>
                  <input
                    type="number"
                    required
                    value={prodForm.priceValue}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setProdForm({ ...prodForm, priceValue: val, priceText: `Rp ${val.toLocaleString('id-ID')} / hari` });
                    }}
                    placeholder="Contoh: 350000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Label Tarif Teks:</label>
                  <input
                    type="text"
                    value={prodForm.priceText}
                    onChange={(e) => setProdForm({ ...prodForm, priceText: e.target.value })}
                    placeholder="Rp 350.000 / hari"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jumlah Unit Tersedia:</label>
                  <input
                    type="number"
                    value={prodForm.stock || 1}
                    onChange={(e) => setProdForm({ ...prodForm, stock: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                  />
                </div>
                <PhotoUploadField
                  label="Upload Foto Produk:"
                  value={prodForm.image}
                  onChange={(val) => setProdForm({ ...prodForm, image: val })}
                  onError={showNotification}
                />
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Deskripsi Singkat Aset:</label>
                  <textarea
                    rows={2}
                    value={prodForm.desc}
                    onChange={(e) => setProdForm({ ...prodForm, desc: e.target.value })}
                    placeholder="Jelaskan spesifikasi, kapasitas, atau kelengkapan alat..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingProduct(false);
                    setEditingProdId(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-uii-blue-950 text-uii-gold text-xs font-black shadow-xs hover:bg-uii-blue-900"
                >
                  Simpan Aset
                </button>
              </div>
            </form>
          </AdminCardOverlayModal>

          {/* Tabel List Produk */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Aset</th>
                    <th className="py-3.5 px-4">Kategori</th>
                    <th className="py-3.5 px-4">Tarif Resmi</th>
                    <th className="py-3.5 px-4">Stok</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-contain bg-slate-50 p-1 border border-slate-200 flex-shrink-0"
                            onError={(e) => { e.target.src = '/images/produk/gedung-scc.png'; }}
                          />
                          <div>
                            <span className="font-extrabold text-uii-blue-950 block">{p.name}</span>
                            <span className="text-[10px] text-slate-400 block line-clamp-1">{p.desc || p.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-uii-blue-900 font-bold text-[10px]">
                          {p.cat || 'Umum'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-black text-amber-900">
                        {p.priceText || `Rp ${Number(p.priceValue || 0).toLocaleString('id-ID')}`}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-600">
                        {p.stock || 1} Unit
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center space-x-1">
                          <button
                            onClick={() => {
                              setEditingProdId(p.id);
                              setProdForm({
                                name: p.name,
                                cat: p.cat || 'Gedung',
                                priceText: p.priceText,
                                priceValue: p.priceValue,
                                stock: p.stock || 1,
                                image: p.image,
                                desc: p.desc || ''
                              });
                              setIsAddingProduct(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-uii-blue-900 hover:bg-slate-100"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 4: POST & KELOLA ARTIKEL
         ========================================================================= */}
      {subTab === 'articles' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200">
            <div>
              <h3 className="text-base font-black text-uii-blue-950 font-heading">
                Publikasi & Manajemen Artikel Berita
              </h3>
              <p className="text-xs text-slate-500">
                Kelola rilis berita, liputan kegiatan ormawa, dan pengumuman resmi BPA KM UII.
              </p>
            </div>
            <button
              onClick={() => {
                setIsAddingArticle(true);
                setEditingArtId(null);
                setArticleForm({
                  title: '',
                  category: 'Kegiatan BPA',
                  date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
                  author: 'Sekretariat BPA',
                  readTime: '3 min baca',
                  image: '',
                  excerpt: ''
                });
              }}
              className="px-4 py-2.5 rounded-xl bg-uii-blue-950 text-uii-gold font-bold text-xs flex items-center space-x-2 shadow-xs hover:bg-uii-blue-900 self-start"
            >
              <Plus className="w-4 h-4" />
              <span>Tulis Artikel Baru</span>
            </button>
          </div>

          <AdminCardOverlayModal
            isOpen={isAddingArticle}
            onClose={() => {
              setIsAddingArticle(false);
              setEditingArtId(null);
            }}
            title={editingArtId ? 'Edit Artikel Berita' : 'Tulis Artikel Berita Baru'}
            subtitle="Publikasikan warta kegiatan, CSR, maupun pengumuman resmi BPA KM UII."
          >
            <form onSubmit={handleSaveArticle} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Judul Artikel: *</label>
                  <input
                    type="text"
                    required
                    value={articleForm.title}
                    onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                    placeholder="Judul berita atau pengumuman..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori:</label>
                  <input
                    type="text"
                    value={articleForm.category}
                    onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
                    placeholder="Contoh: Berita Ormawa / CSR"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Penulis / Redaksi:</label>
                  <input
                    type="text"
                    value={articleForm.author}
                    onChange={(e) => setArticleForm({ ...articleForm, author: e.target.value })}
                    placeholder="BPA Media Center"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Publikasi:</label>
                  <input
                    type="text"
                    value={articleForm.date}
                    onChange={(e) => setArticleForm({ ...articleForm, date: e.target.value })}
                    placeholder="03 November 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                  />
                </div>
                <PhotoUploadField
                  label="Upload Foto Thumbnail:"
                  value={articleForm.image}
                  onChange={(val) => setArticleForm({ ...articleForm, image: val })}
                  onError={showNotification}
                />
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Ringkasan / Isi Berita: *</label>
                  <textarea
                    rows={4}
                    required
                    value={articleForm.excerpt}
                    onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })}
                    placeholder="Tuliskan isi atau ringkasan berita..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingArticle(false);
                    setEditingArtId(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-uii-blue-950 text-uii-gold text-xs font-black shadow-xs hover:bg-uii-blue-900"
                >
                  Publikasikan Artikel
                </button>
              </div>
            </form>
          </AdminCardOverlayModal>

          {/* Grid List Artikel */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((a) => (
              <div key={a.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between">
                <div className="relative h-40 bg-slate-800">
                  <img
                    src={a.image}
                    alt={a.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/images/artikel/pemberitahuan-pemilihan-rektor.jpg'; }}
                  />
                  <span className="absolute top-2 left-2 bg-uii-blue-950 text-uii-gold text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {a.category}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">{a.date} • Oleh {a.author}</span>
                    <h4 className="font-extrabold text-xs sm:text-sm text-uii-blue-950 font-heading leading-snug mt-1">
                      {a.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">{a.excerpt}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">{a.views || 0} pembaca</span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setEditingArtId(a.id);
                          setArticleForm(a);
                          setIsAddingArticle(true);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-uii-blue-900 hover:bg-slate-100"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(a.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 5: INVESTOR / STRUKTUR ORGANISASI & DOKUMEN LPJ / SK
         ========================================================================= */}
      {subTab === 'investor' && (
        <div className="space-y-6">
          
          {/* SECTION A: PENGURUS & ANGGOTA STRUKTUR */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200">
              <div>
                <h3 className="text-base font-black text-uii-blue-950 font-heading">
                  1. Struktur Pengurus & Fungsionaris BPA KM UII
                </h3>
                <p className="text-xs text-slate-500">
                  Edit foto, nama, dan jabatan anggota, serta tambahkan anggota baru bila ada pergantian kepengurusan.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddingMember(true);
                  setEditingMemberId(null);
                  setMemberForm({ name: '', role: '', division: 'Staff Pengelolaan Aset', image: '' });
                }}
                className="px-4 py-2.5 rounded-xl bg-uii-blue-950 text-uii-gold font-bold text-xs flex items-center space-x-2 shadow-xs hover:bg-uii-blue-900 self-start"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Anggota Pengurus</span>
              </button>
            </div>

            <AdminCardOverlayModal
              isOpen={isAddingMember}
              onClose={() => {
                setIsAddingMember(false);
                setEditingMemberId(null);
              }}
              title={editingMemberId ? 'Edit Anggota Pengurus' : 'Tambah Anggota Pengurus Baru'}
              subtitle="Perbarui nama, jabatan resmi, divisi, dan foto profil pengurus BPA KM UII."
            >
              <form onSubmit={handleSaveMember} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Anggota: *</label>
                    <input
                      type="text"
                      required
                      value={memberForm.name}
                      onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value.toUpperCase() })}
                      placeholder="CONTOH: MUHAMMAD FARHAN"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jabatan / Role Resmi: *</label>
                    <input
                      type="text"
                      required
                      value={memberForm.role}
                      onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value.toUpperCase() })}
                      placeholder="CONTOH: STAFF OPERASIONAL SARPRAS"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Divisi / Unit:</label>
                    <input
                      type="text"
                      value={memberForm.division}
                      onChange={(e) => setMemberForm({ ...memberForm, division: e.target.value })}
                      placeholder="Contoh: Pengelolaan Unit Sarana (PUS)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                    />
                  </div>
                  <PhotoUploadField
                    label="Upload Foto Formal:"
                    value={memberForm.image}
                    onChange={(val) => setMemberForm({ ...memberForm, image: val })}
                    onError={showNotification}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingMember(false);
                      setEditingMemberId(null);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-uii-blue-950 text-uii-gold text-xs font-black shadow-xs hover:bg-uii-blue-900"
                  >
                    Simpan Anggota
                  </button>
                </div>
              </form>
            </AdminCardOverlayModal>

            {/* Grid Kartu Pengurus */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {team.map((m) => (
                <div key={m.id} className="bg-white p-4 rounded-2xl border border-slate-200 text-center flex flex-col justify-between shadow-2xs group">
                  <div className="w-20 h-24 rounded-3xl overflow-hidden bg-slate-800 mx-auto mb-2.5 border-2 border-slate-100 shadow-inner">
                    <img
                      src={m.image}
                      alt={m.name}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => { e.target.src = '/images/INVESTOR/Irfan-ArdiansyahArdiansyah.webp'; }}
                    />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-[11px] text-uii-blue-950 leading-tight truncate">{m.name}</h5>
                    <p className="text-[10px] font-bold text-uii-gold-600 mt-0.5 truncate">{m.role}</p>
                    <span className="text-[9px] text-slate-400 block mt-0.5">{m.division}</span>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingMemberId(m.id);
                        setMemberForm(m);
                        setIsAddingMember(true);
                      }}
                      className="p-1 rounded-md text-slate-500 hover:text-uii-blue-900 hover:bg-slate-100"
                      title="Edit Nama/Foto/Jabatan"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMember(m.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Hapus Anggota"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION B: UPLOAD SURAT KEPUTUS (SK) & LAPORAN PERTANGGUNGJAWABAN (LPJ) */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200">
              <div>
                <h3 className="text-base font-black text-uii-blue-950 font-heading">
                  2. Dokumen Surat Keputusan (SK) & Laporan Pertanggungjawaban (LPJ)
                </h3>
                <p className="text-xs text-slate-500">
                  Upload dan kelola dokumen transparansi LPJ Triwulan dan SK Pengesahan resmi BPA KM UII.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddingDoc(true);
                  setDocForm({
                    title: '',
                    type: 'LPJ',
                    period: 'Triwulan 4',
                    date: 'Desember 2026',
                    fileImage: '',
                    downloadUrl: '/docs/SK-Akreditasi-Teknik-Elektro-Program-Sarjana.pdf'
                  });
                }}
                className="px-4 py-2.5 rounded-xl bg-uii-blue-950 text-uii-gold font-bold text-xs flex items-center space-x-2 shadow-xs hover:bg-uii-blue-900 self-start"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Dokumen Baru</span>
              </button>
            </div>

            <AdminCardOverlayModal
              isOpen={isAddingDoc}
              onClose={() => setIsAddingDoc(false)}
              title="Upload Dokumen SK / LPJ Baru"
              subtitle="Tambahkan dokumen resmi SK pengesahan atau Laporan Pertanggungjawaban."
            >
              <form onSubmit={handleSaveDoc} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Judul Dokumen: *</label>
                    <input
                      type="text"
                      required
                      value={docForm.title}
                      onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                      placeholder="Contoh: Laporan Pertanggungjawaban (LPJ) TW 4 BPA KM UII"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jenis Dokumen:</label>
                    <select
                      value={docForm.type}
                      onChange={(e) => setDocForm({ ...docForm, type: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                    >
                      <option value="LPJ">LPJ (Laporan Pertanggungjawaban)</option>
                      <option value="SK">SK (Surat Keputusan Pengesahan)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Periode Triwulan:</label>
                    <input
                      type="text"
                      value={docForm.period}
                      onChange={(e) => setDocForm({ ...docForm, period: e.target.value })}
                      placeholder="Triwulan 1 / TW 2 / Akhir Periode"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                    />
                  </div>
                  <PhotoUploadField
                    label="Upload Foto Sampul Dokumen:"
                    value={docForm.fileImage}
                    onChange={(val) => setDocForm({ ...docForm, fileImage: val })}
                    onError={showNotification}
                  />
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">URL File Download (PDF):</label>
                    <input
                      type="text"
                      value={docForm.downloadUrl}
                      onChange={(e) => setDocForm({ ...docForm, downloadUrl: e.target.value })}
                      placeholder="/docs/SK-Akreditasi-Teknik-Elektro-Program-Sarjana.pdf"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddingDoc(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-uii-blue-950 text-uii-gold text-xs font-black shadow-xs hover:bg-uii-blue-900"
                  >
                    Simpan Dokumen
                  </button>
                </div>
              </form>
            </AdminCardOverlayModal>

            {/* Grid Dokumen SK & LPJ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {documents.map((d) => (
                <div key={d.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3">
                  <div className="h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 p-2 flex items-center justify-center">
                    <img
                      src={d.fileImage}
                      alt={d.title}
                      className="max-h-full w-auto object-contain"
                      onError={(e) => { e.target.src = '/images/INVESTOR/lpj-tw4.png'; }}
                    />
                  </div>
                  <div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                      d.type === 'SK' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {d.type} • {d.period}
                    </span>
                    <h5 className="font-extrabold text-xs text-uii-blue-950 leading-tight mt-1 line-clamp-2">
                      {d.title}
                    </h5>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <a
                      href={d.downloadUrl}
                      download
                      className="text-sky-600 font-bold hover:underline flex items-center space-x-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                    <button
                      onClick={() => handleDeleteDoc(d.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 6: GALERI FOTO & VIDEO
         ========================================================================= */}
      {subTab === 'gallery' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200">
            <div>
              <h3 className="text-base font-black text-uii-blue-950 font-heading">
                Kelola Galeri Foto & Video Dokumentasi
              </h3>
              <p className="text-xs text-slate-500">
                Post foto dokumentasi kegiatan CSR, operasional aset, serta sematkan video YouTube profil BPA.
              </p>
            </div>
            <button
              onClick={() => {
                setIsAddingGallery(true);
                setGalleryForm({
                  title: '',
                  category: 'Kegiatan & CSR',
                  date: 'November 2026',
                  image: '',
                  youtubeId: '',
                  description: ''
                });
              }}
              className="px-4 py-2.5 rounded-xl bg-uii-blue-950 text-uii-gold font-bold text-xs flex items-center space-x-2 shadow-xs hover:bg-uii-blue-900 self-start"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Foto / Video Baru</span>
            </button>
          </div>

          <AdminCardOverlayModal
            isOpen={isAddingGallery}
            onClose={() => setIsAddingGallery(false)}
            title="Tambah Konten Galeri Baru"
            subtitle="Unggah foto dokumentasi kegiatan atau tautan video YouTube BPA KM UII."
          >
            <form onSubmit={handleSaveGallery} className="space-y-4">
              <div className="flex items-center space-x-4 mb-2 text-xs font-bold">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gtype"
                    checked={galleryType === 'photo'}
                    onChange={() => setGalleryType('photo')}
                    className="text-uii-blue-950"
                  />
                  <span>Foto Dokumentasi</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gtype"
                    checked={galleryType === 'video'}
                    onChange={() => setGalleryType('video')}
                    className="text-uii-blue-950"
                  />
                  <span>Video YouTube</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Judul Dokumentasi: *</label>
                  <input
                    type="text"
                    required
                    value={galleryForm.title}
                    onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                    placeholder="Contoh: CSR Berkah Bersama BPA KM UII"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori:</label>
                  <input
                    type="text"
                    value={galleryForm.category}
                    onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}
                    placeholder="Contoh: Kegiatan & CSR / Pelantikan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                  />
                </div>

                {galleryType === 'photo' ? (
                  <PhotoUploadField
                    label="Upload Foto Dokumentasi:"
                    required
                    value={galleryForm.image}
                    onChange={(val) => setGalleryForm({ ...galleryForm, image: val })}
                    onError={showNotification}
                  />
                ) : (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">YouTube Video ID / URL: *</label>
                    <input
                      type="text"
                      required
                      value={galleryForm.youtubeId}
                      onChange={(e) => setGalleryForm({ ...galleryForm, youtubeId: e.target.value })}
                      placeholder="Contoh: xvbcBVoYb6w atau https://youtube.com/watch?v=..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal / Periode Kegiatan:</label>
                  <input
                    type="text"
                    value={galleryForm.date}
                    onChange={(e) => setGalleryForm({ ...galleryForm, date: e.target.value })}
                    placeholder="November 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Keterangan / Deskripsi Singkat:</label>
                  <textarea
                    rows={2}
                    value={galleryForm.description}
                    onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
                    placeholder="Tuliskan gambaran kegiatan..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingGallery(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-uii-blue-950 text-uii-gold text-xs font-black shadow-xs hover:bg-uii-blue-900"
                >
                  Simpan Konten Galeri
                </button>
              </div>
            </form>
          </AdminCardOverlayModal>

          {/* List Foto */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
              Foto Dokumentasi ({gallery.photos.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.photos.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between">
                  <div className="h-40 bg-slate-800 relative">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/images/gallery/csr-berkah.png'; }}
                    />
                    <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {p.category}
                    </span>
                  </div>
                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h5 className="font-extrabold text-xs text-uii-blue-950 line-clamp-1">{p.title}</h5>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{p.description}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{p.date}</span>
                      <button
                        onClick={() => handleDeletePhoto(p.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* List Video */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
              Video Dokumentasi YouTube ({gallery.videos.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gallery.videos.map((v) => (
                <div key={v.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${v.youtubeId}`}
                      title={v.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-extrabold text-xs sm:text-sm text-uii-blue-950 font-heading leading-tight">{v.title}</h5>
                      <span className="text-[10px] font-bold text-slate-400">{v.category} • {v.date}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteVideo(v.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Card Overlay Konfirmasi Hapus Konten CMS */}
      <AdminConfirmOverlayModal
        isOpen={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete?.onConfirm?.()}
        title={confirmDelete?.title || 'Konfirmasi Hapus'}
        message={confirmDelete?.message || 'Yakin ingin menghapus data ini?'}
        confirmLabel="Ya, Hapus"
      />
    </div>
  );
};
