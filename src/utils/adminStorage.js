// Utility Storage Terpadu Admin Dashboard BPA KM UII
// Mengelola data live yang persisten di localStorage & Neon PostgreSQL.
// Semua data awal kosong ([]) agar admin dapat memasukkan data satu per satu secara bersih.

import { neonApi } from '../services/neonDb';

const EMPTY_GALLERY = { photos: [], videos: [] };

const notifyDataUpdated = () => {
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bpa-data-updated'));
    }
  } catch {}
};

// HELPER FUNCTIONS UNTUK STORAGE & SINKRONISASI NEON POSTGRESQL
export const adminStorage = {
  // Sinkronisasi data live dari Neon PostgreSQL
  initNeonSync: async () => {
    try {
      const [
        neonUsers,
        neonBookings,
        neonBanners,
        neonTestimonials,
        neonProducts,
        neonArticles,
        neonTeam,
        neonDocs,
        neonGallery
      ] = await Promise.allSettled([
        neonApi.getUsers(),
        neonApi.getBookings(),
        neonApi.getBanners(),
        neonApi.getTestimonials(),
        neonApi.getProducts(),
        neonApi.getArticles(),
        neonApi.getTeam(),
        neonApi.getDocuments(),
        neonApi.getGallery()
      ]);

      if (neonUsers.status === 'fulfilled' && Array.isArray(neonUsers.value)) {
        localStorage.setItem('bpa_admin_users', JSON.stringify(neonUsers.value));
        if (neonUsers.value.length === 0) {
          localStorage.removeItem('bpa_auth_user');
        } else {
          try {
            const savedUser = localStorage.getItem('bpa_auth_user');
            if (savedUser) {
              const u = JSON.parse(savedUser);
              const exists = neonUsers.value.some(
                nu => (nu.id && nu.id === u.id) || (nu.email && nu.email.toLowerCase() === (u.email || '').toLowerCase())
              );
              if (!exists) {
                localStorage.removeItem('bpa_auth_user');
              }
            }
          } catch {}
        }
      }
      if (neonBookings.status === 'fulfilled' && Array.isArray(neonBookings.value)) {
        const serialized = JSON.stringify(neonBookings.value);
        localStorage.setItem('bpa_admin_bookings', serialized);
        localStorage.setItem('bpa_tracking_bookings', serialized);
        localStorage.setItem('bpa_tracking_db', serialized);
        if (neonBookings.value.length === 0) {
          localStorage.removeItem('bpa_latest_booking');
        } else {
          try {
            const latestRaw = localStorage.getItem('bpa_latest_booking');
            if (latestRaw) {
              const latest = JSON.parse(latestRaw);
              const exists = neonBookings.value.some(b => b?.bookingCode === latest?.bookingCode);
              if (!exists) {
                localStorage.removeItem('bpa_latest_booking');
              }
            }
          } catch {}
        }
      }
      if (neonBanners.status === 'fulfilled' && Array.isArray(neonBanners.value)) {
        localStorage.setItem('bpa_cms_banners', JSON.stringify(neonBanners.value));
      }
      if (neonTestimonials.status === 'fulfilled' && Array.isArray(neonTestimonials.value)) {
        localStorage.setItem('bpa_cms_testimonials', JSON.stringify(neonTestimonials.value));
      }
      if (neonProducts.status === 'fulfilled' && Array.isArray(neonProducts.value)) {
        localStorage.setItem('bpa_cms_products', JSON.stringify(neonProducts.value));
      }
      if (neonArticles.status === 'fulfilled' && Array.isArray(neonArticles.value)) {
        localStorage.setItem('bpa_cms_articles', JSON.stringify(neonArticles.value));
      }
      if (neonTeam.status === 'fulfilled' && Array.isArray(neonTeam.value)) {
        localStorage.setItem('bpa_cms_team', JSON.stringify(neonTeam.value));
      }
      if (neonDocs.status === 'fulfilled' && Array.isArray(neonDocs.value)) {
        localStorage.setItem('bpa_cms_docs', JSON.stringify(neonDocs.value));
      }
      if (neonGallery.status === 'fulfilled' && neonGallery.value) {
        localStorage.setItem(
          'bpa_cms_gallery',
          JSON.stringify({
            photos: Array.isArray(neonGallery.value.photos) ? neonGallery.value.photos : [],
            videos: Array.isArray(neonGallery.value.videos) ? neonGallery.value.videos : []
          })
        );
      }
      notifyDataUpdated();
    } catch (e) {
      console.warn('Neon sync warning:', e);
    }
  },

  // Banners
  getBanners: () => {
    try {
      const data = localStorage.getItem('bpa_cms_banners');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveBanners: (banners) => {
    try {
      localStorage.setItem('bpa_cms_banners', JSON.stringify(banners));
      notifyDataUpdated();
      neonApi.saveBanners(banners).catch(console.warn);
    } catch {}
  },

  // Testimonials
  getTestimonials: () => {
    try {
      const data = localStorage.getItem('bpa_cms_testimonials');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveTestimonials: (testimonials) => {
    try {
      localStorage.setItem('bpa_cms_testimonials', JSON.stringify(testimonials));
      notifyDataUpdated();
      neonApi.saveTestimonials(testimonials).catch(console.warn);
    } catch {}
  },

  // Products
  getProducts: () => {
    try {
      const data = localStorage.getItem('bpa_cms_products');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveProducts: (products) => {
    try {
      localStorage.setItem('bpa_cms_products', JSON.stringify(products));
      notifyDataUpdated();
      neonApi.saveProducts(products).catch(console.warn);
    } catch {}
  },

  // Articles
  getArticles: () => {
    try {
      const data = localStorage.getItem('bpa_cms_articles');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveArticles: (articles) => {
    try {
      localStorage.setItem('bpa_cms_articles', JSON.stringify(articles));
      notifyDataUpdated();
      neonApi.saveArticles(articles).catch(console.warn);
    } catch {}
  },

  // Investor Team & Documents
  getTeam: () => {
    try {
      const data = localStorage.getItem('bpa_cms_team');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveTeam: (team) => {
    try {
      localStorage.setItem('bpa_cms_team', JSON.stringify(team));
      notifyDataUpdated();
      neonApi.saveTeam(team).catch(console.warn);
    } catch {}
  },

  getDocuments: () => {
    try {
      const data = localStorage.getItem('bpa_cms_docs');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveDocuments: (docs) => {
    try {
      localStorage.setItem('bpa_cms_docs', JSON.stringify(docs));
      notifyDataUpdated();
      neonApi.saveDocuments(docs).catch(console.warn);
    } catch {}
  },

  // Gallery
  getGallery: () => {
    try {
      const data = localStorage.getItem('bpa_cms_gallery');
      if (!data) return EMPTY_GALLERY;
      const parsed = JSON.parse(data);
      return {
        photos: Array.isArray(parsed?.photos) ? parsed.photos : [],
        videos: Array.isArray(parsed?.videos) ? parsed.videos : []
      };
    } catch {
      return EMPTY_GALLERY;
    }
  },
  saveGallery: (gallery) => {
    try {
      localStorage.setItem('bpa_cms_gallery', JSON.stringify(gallery));
      notifyDataUpdated();
      neonApi.saveGallery(gallery).catch(console.warn);
    } catch {}
  },

  // Users
  getUsers: () => {
    try {
      const data = localStorage.getItem('bpa_admin_users');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveUsers: (users) => {
    try {
      localStorage.setItem('bpa_admin_users', JSON.stringify(users));
      notifyDataUpdated();
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
      const trackingDb = localStorage.getItem('bpa_tracking_db');
      if (trackingDb) return JSON.parse(trackingDb);
      const trackingData = localStorage.getItem('bpa_tracking_bookings');
      return trackingData ? JSON.parse(trackingData) : [];
    } catch {
      return [];
    }
  },
  saveBookings: (bookings) => {
    try {
      const serialized = JSON.stringify(bookings);
      localStorage.setItem('bpa_admin_bookings', serialized);
      localStorage.setItem('bpa_tracking_bookings', serialized);
      localStorage.setItem('bpa_tracking_db', serialized);
      notifyDataUpdated();
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
