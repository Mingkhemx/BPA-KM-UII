import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSlider } from './components/HeroSlider';
import { DeanGreetingSection } from './components/DeanGreetingSection';
import { NewsAndAnnouncements } from './components/NewsAndAnnouncements';
import { RentalProcedureSection } from './components/RentalProcedureSection';
import { TestimonialSection } from './components/TestimonialSection';
import { LatestArticlesSection } from './components/LatestArticlesSection';
import { ProductsPage } from './components/ProductsPage';
import { InvestorPage } from './components/InvestorPage';
import { GalleryPage } from './components/GalleryPage';
import { ArticlesPage } from './components/ArticlesPage';
import { ContactPage } from './components/ContactPage';
import { AboutPage } from './components/AboutPage';
import { SewaPage } from './components/SewaPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { TrackingPage } from './components/TrackingPage';
import { FloatingHub } from './components/FloatingHub';
import { RentalCartDrawer } from './components/RentalCartDrawer';
import { ApprovalNotificationModal } from './components/ApprovalNotificationModal';
import { AuthRequiredModal } from './components/AuthRequiredModal';
import { AuthPage } from './components/AuthPage';
import { DetailModal } from './components/DetailModal';
import { SearchModal } from './components/SearchModal';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { adminStorage } from './utils/adminStorage';
import { X, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { OFFICIAL_PRODUCTS, getProductById } from './data/officialProducts';
import { registerNewBookingToTracking } from './data/trackingData';

export function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    try {
      const p = new URLSearchParams(window.location.search).get('page');
      return p || 'home';
    } catch {
      return 'home';
    }
  }); // 'home' | 'products' | 'sewa' | 'product-detail' | 'auth'
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState(() => OFFICIAL_PRODUCTS[0]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isAuthRequiredModalOpen, setIsAuthRequiredModalOpen] = useState(false);
  const [authRequiredContext, setAuthRequiredContext] = useState('');
  const [authPageInitialMode, setAuthPageInitialMode] = useState('login');
  const [trackingBookingCode, setTrackingBookingCode] = useState('');

  // Routing Akses Khusus Admin Dashboard (/admin atau ?page=admin atau #admin)
  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    try {
      const path = window.location.pathname.toLowerCase();
      const p = new URLSearchParams(window.location.search).get('page');
      const hash = window.location.hash.toLowerCase();
      return path === '/admin' || path.startsWith('/admin') || p === 'admin' || hash === '#admin';
    } catch {
      return false;
    }
  });

  const [adminUser, setAdminUser] = useState(() => adminStorage.getAdminAuth());

  React.useEffect(() => {
    const handleUrlChange = () => {
      try {
        const path = window.location.pathname.toLowerCase();
        const p = new URLSearchParams(window.location.search).get('page');
        const hash = window.location.hash.toLowerCase();
        if (path === '/admin' || path.startsWith('/admin') || p === 'admin' || hash === '#admin') {
          setIsAdminRoute(true);
        } else {
          setIsAdminRoute(false);
        }
      } catch {}
    };

    // Inisialisasi sinkronisasi live data dari Neon PostgreSQL
    adminStorage.initNeonSync();

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Status Akun Pengguna / User Profile (Login / Register)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('bpa_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleRequireAuth = (contextReason = '', preferredMode = 'login') => {
    setAuthRequiredContext(contextReason);
    setAuthPageInitialMode(preferredMode);
    setIsAuthRequiredModalOpen(true);
  };

  const handleNavigateToAuth = (mode = 'login') => {
    setIsCartOpen(false);
    setAuthPageInitialMode(mode);
    setCurrentPage('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginUser = (userData) => {
    setCurrentUser(userData);
    try {
      localStorage.setItem('bpa_auth_user', JSON.stringify(userData));
    } catch {}
  };

  const handleLogoutUser = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('bpa_auth_user');
    } catch {}
  };

  // Status Pengajuan Terakhir (Menunggu Persetujuan Staf)
  const [activeBooking, setActiveBooking] = useState(() => {
    try {
      const saved = localStorage.getItem('bpa_latest_booking');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Keranjang Sewa (Tersimpan di LocalStorage)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('bpa_rental_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Handler Pengajuan Sewa (Masuk ke Proses Approval Staf & Database Tracking)
  const handleSubmitBooking = (bookingData) => {
    setActiveBooking(bookingData);
    setTrackingBookingCode(bookingData.bookingCode);
    try {
      registerNewBookingToTracking(bookingData);
      localStorage.setItem('bpa_latest_booking', JSON.stringify(bookingData));
    } catch {}
    setIsApprovalModalOpen(true);
    handleClearCart();
  };

  // Aksi Masuk Keranjang
  const handleAddToCart = (product, quantity, startDate, endDate, days, notes) => {
    setCartItems(prev => {
      const cartItemId = `${product.id}-${startDate}-${endDate}`;
      const existingIdx = prev.findIndex(item => item.cartItemId === cartItemId);
      let updated;
      if (existingIdx > -1) {
        updated = [...prev];
        updated[existingIdx].quantity += quantity;
        if (notes) updated[existingIdx].notes = notes;
      } else {
        updated = [
          ...prev,
          {
            cartItemId,
            id: product.id,
            slug: product.slug,
            name: product.name,
            cat: product.cat,
            priceText: product.priceText,
            priceValue: product.priceValue,
            image: (product.images && product.images[0]) || product.image,
            quantity,
            startDate,
            endDate,
            days,
            notes
          }
        ];
      }
      try {
        localStorage.setItem('bpa_rental_cart', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleUpdateCartQty = (cartItemId, newQty) => {
    setCartItems(prev => {
      const updated = prev.map(it => {
        if (it.cartItemId === cartItemId) {
          return { ...it, quantity: Math.max(1, newQty) };
        }
        return it;
      });
      try {
        localStorage.setItem('bpa_rental_cart', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleRemoveCartItem = (cartItemId) => {
    setCartItems(prev => {
      const updated = prev.filter(it => it.cartItemId !== cartItemId);
      try {
        localStorage.setItem('bpa_rental_cart', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleClearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem('bpa_rental_cart');
    } catch {}
  };

  // Navigasi ke Halaman Detail Produk Baru (Tanpa Overlay Modal)
  const handleOpenProductDetail = (prod) => {
    setIsCartOpen(false);
    const full = getProductById(prod.slug || prod.id) || prod;
    setSelectedProductForDetail(full);
    setCurrentPage('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateSection = (sectionId) => {
    setIsCartOpen(false);
    // Navigasi ke halaman produk terpisah
    if (sectionId === 'programs' || sectionId === 'products') {
      setCurrentPage('products');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Navigasi ke halaman investor / struktur organisasi terpisah
    if (sectionId === 'investor') {
      setCurrentPage('investor');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Navigasi ke halaman galeri foto & video terpisah
    if (sectionId === 'galeri' || sectionId === 'gallery') {
      setCurrentPage('gallery');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Navigasi ke halaman artikel & warta terpisah
    if (sectionId === 'artikel' || sectionId === 'news' || sectionId === 'articles') {
      setCurrentPage('articles');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Navigasi ke halaman kontak terpisah
    if (sectionId === 'contact' || sectionId === 'kontak') {
      setCurrentPage('contact');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Navigasi ke halaman tentang kami terpisah
    if (sectionId === 'about' || sectionId === 'tentang') {
      setCurrentPage('about');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Navigasi ke halaman sewa / reservasi aset terpisah
    if (sectionId === 'sewa' || sectionId === 'rental' || sectionId === 'booking') {
      setCurrentPage('sewa');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Navigasi ke halaman pelacakan progres persiapan sewa terpisah
    if (sectionId === 'tracking' || sectionId === 'lacak') {
      setCurrentPage('tracking');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Navigasi ke halaman login & register terpisah (New Page)
    if (sectionId === 'auth' || sectionId === 'login' || sectionId === 'register' || sectionId === 'profile') {
      setCurrentPage('auth');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Jika sedang di halaman lain dan mengklik beranda
    if (sectionId === 'home') {
      setCurrentPage('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (sectionId === 'video') {
      setIsVideoModalOpen(true);
      return;
    }

    // Jika mengklik menu section lain saat sedang di halaman produk/investor, balik ke beranda dulu
    if (currentPage !== 'home') {
      setCurrentPage('home');
      setTimeout(() => {
        executeScroll(sectionId);
      }, 100);
      return;
    }

    executeScroll(sectionId);
  };

  const executeScroll = (sectionId) => {
    if (sectionId === 'contact' || sectionId === 'kontak' || sectionId === 'downloads') {
      document.querySelector('footer')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (sectionId === 'artikel' || sectionId === 'news' || sectionId === 'announcements' || sectionId === 'agendas') {
      document.getElementById('news')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (sectionId === 'about' || sectionId === 'dean' || sectionId === 'leadership' || sectionId === 'facilities') {
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const targetElement = document.getElementById(sectionId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // JIKA SEDANG DIAKSES LEWAT /admin ATAU ?page=admin: TAMPILKAN PORTAL ADMIN
  if (isAdminRoute) {
    if (adminUser) {
      return (
        <AdminDashboard
          adminUser={adminUser}
          onLogout={() => {
            adminStorage.clearAdminAuth();
            setAdminUser(null);
          }}
          onGoToSite={() => {
            setIsAdminRoute(false);
            setCurrentPage('home');
            try {
              window.history.pushState({}, '', '/');
            } catch {}
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      );
    } else {
      return (
        <AdminLoginPage
          onLoginSuccess={(user) => {
            adminStorage.saveAdminAuth(user);
            setAdminUser(user);
          }}
          onBackToSite={() => {
            setIsAdminRoute(false);
            setCurrentPage('home');
            try {
              window.history.pushState({}, '', '/');
            } catch {}
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-uii-blue-900 selection:text-uii-gold">
      {/* Top Navbar */}
      <Navbar 
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        currentUser={currentUser}
        onNavigateSection={handleNavigateSection}
        currentPage={currentPage}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {currentPage === 'products' ? (
          /* Dedicated Products Page (Klik Sewa diarahkan ke Login/Register jika belum login, atau ke SewaPage jika sudah login) */
          <ProductsPage
            onBackHome={() => {
              setCurrentPage('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenDetail={(item) => setSelectedItem(item)}
            onNavigateSewa={() => {
              setCurrentPage('sewa');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            currentUser={currentUser}
            onNavigateAuth={(mode) => handleNavigateToAuth(mode || 'login')}
          />
        ) : currentPage === 'product-detail' ? (
          /* Dedicated Product Detail Page (Tanpa Overlay Modal) */
          <ProductDetailPage
            product={selectedProductForDetail}
            onBack={() => {
              setCurrentPage('sewa');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateProduct={handleOpenProductDetail}
            onAddToCart={handleAddToCart}
            onOpenCart={() => setIsCartOpen(true)}
            onSubmitBooking={handleSubmitBooking}
            currentUser={currentUser}
            onRequireAuth={(reason) => handleRequireAuth(reason, 'login')}
            onNavigateAuth={(mode) => handleNavigateToAuth(mode)}
          />
        ) : currentPage === 'investor' ? (
          /* Dedicated Investor / Struktur Organisasi Page */
          <InvestorPage
            onBackHome={() => {
              setCurrentPage('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : currentPage === 'gallery' ? (
          /* Dedicated Gallery & Video Documentation Page */
          <GalleryPage
            onBackHome={() => {
              setCurrentPage('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : currentPage === 'articles' ? (
          /* Dedicated Articles & News Page */
          <ArticlesPage
            onBackHome={() => {
              setCurrentPage('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenArticle={(art) => setSelectedItem(art)}
          />
        ) : currentPage === 'contact' ? (
          /* Dedicated Contact Us Page */
          <ContactPage
            onBackHome={() => {
              setCurrentPage('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : currentPage === 'about' ? (
          /* Dedicated About Us Page */
          <AboutPage
            onBackHome={() => {
              setCurrentPage('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : currentPage === 'sewa' ? (
          /* Dedicated Sewa / Reservasi Kalender & Produk Page */
          <SewaPage
            onBackHome={() => {
              setCurrentPage('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateSection={handleNavigateSection}
            onOpenProductDetail={handleOpenProductDetail}
            cartItems={cartItems}
            onOpenCart={() => setIsCartOpen(true)}
            onAddToCart={handleAddToCart}
            activeBooking={activeBooking}
            onOpenApprovalModal={(b) => {
              setActiveBooking(b);
              setIsApprovalModalOpen(true);
            }}
            onNavigateTracking={(code) => {
              if (code) setTrackingBookingCode(code);
              setCurrentPage('tracking');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : currentPage === 'tracking' ? (
          /* Dedicated Live Tracking & Preparation Page (User & Staff Views) */
          <TrackingPage
            onBackHome={() => {
              setCurrentPage('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateSewa={() => {
              setCurrentPage('sewa');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            initialBookingCode={trackingBookingCode}
            activeBooking={activeBooking}
          />
        ) : currentPage === 'auth' ? (
          /* Dedicated Login, Register & Profil Pengguna New Page */
          <AuthPage
            onBackHome={() => {
              setCurrentPage('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateSewa={() => {
              setCurrentPage('sewa');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateTracking={(code) => {
              if (code) setTrackingBookingCode(code);
              setCurrentPage('tracking');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            currentUser={currentUser}
            onLogin={handleLoginUser}
            onLogout={handleLogoutUser}
            initialMode={authPageInitialMode}
          />
        ) : (
          /* Main Landing Page Sections */
          <>
            {/* 1. Full-bleed Hero Photo Slider */}
            <HeroSlider />

            {/* 2. Dean's Greeting, Video Tour & Vision Mission */}
            <DeanGreetingSection onOpenVideoModal={() => setIsVideoModalOpen(true)} />

            {/* 3. Products & Services Preview (BPA KM UII) */}
            <NewsAndAnnouncements 
              onOpenArticle={(art) => setSelectedItem(art)}
              onNavigateSewa={() => {
                setCurrentPage('sewa');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              currentUser={currentUser}
              onNavigateAuth={(mode) => handleNavigateToAuth(mode || 'login')}
            />

            {/* 4. Rental Procedures & Workflow */}
            <RentalProcedureSection />

            {/* 5. Renters Testimonials */}
            <TestimonialSection />

            {/* 6. Latest Articles & News */}
            <LatestArticlesSection 
              onOpenArticle={(art) => setSelectedItem(art)}
              onViewAllArticles={() => handleNavigateSection('news')}
            />
          </>
        )}
      </main>

      {/* Comprehensive Footer */}
      <Footer onNavigateSection={handleNavigateSection} />

      {/* Floating Action Hub (Tombol Lingkaran: Klik Muncul Keranjang & Lacak, bisa di-X tutup) */}
      <FloatingHub
        cartItems={cartItems}
        onOpenCart={() => setIsCartOpen(true)}
        onNavigateTracking={(code) => {
          if (code) setTrackingBookingCode(code);
          setCurrentPage('tracking');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        activeBooking={activeBooking}
      />

      {/* Rental Cart Slide-Over Drawer */}
      <RentalCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onNavigateProduct={handleOpenProductDetail}
        onSubmitBooking={handleSubmitBooking}
        currentUser={currentUser}
        onRequireAuth={(reason) => handleRequireAuth(reason, 'login')}
        onNavigateAuth={(mode) => handleNavigateToAuth(mode)}
      />

      {/* Modal Notifikasi Wajib Login / Register untuk Sewa */}
      <AuthRequiredModal
        isOpen={isAuthRequiredModalOpen}
        onClose={() => setIsAuthRequiredModalOpen(false)}
        customMessage={authRequiredContext ? `Untuk mengajukan ${authRequiredContext}, Anda wajib masuk ke akun terlebih dahulu agar riwayat pengajuan, persetujuan staf, dan bukti reservasi tercatat dengan resmi.` : ''}
        onNavigateLogin={() => {
          setIsAuthRequiredModalOpen(false);
          handleNavigateToAuth('login');
        }}
        onNavigateRegister={() => {
          setIsAuthRequiredModalOpen(false);
          handleNavigateToAuth('register');
        }}
      />

      {/* Modal Notifikasi Proses Approval Sewa (Disetujui / Tidak oleh Staf) */}
      <ApprovalNotificationModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        booking={activeBooking}
        onNavigateTracking={(code) => {
          setIsApprovalModalOpen(false);
          if (code) setTrackingBookingCode(code);
          setCurrentPage('tracking');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Detail Reader Modal */}
      <DetailModal
        item={selectedItem}
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
      />

      {/* Search Live Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectItem={(item) => {
          if (item.category || item.status) {
            setSelectedItem(item);
          } else {
            setSelectedItem(item);
          }
        }}
      />



      {/* YouTube Video Tour Modal */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/20"
            >
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black text-white transition-colors"
                aria-label="Tutup video"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="relative aspect-video w-full">
                <iframe
                  src="https://www.youtube.com/embed/zTBIOO68F8I?autoplay=1"
                  title="Video Profil BPA KM UII"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
