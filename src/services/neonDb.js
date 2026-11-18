// Neon PostgreSQL Frontend Client Service
// Menghubungkan website BPA KM UII ke Database Neon PostgreSQL melalui endpoint /api/*

export const neonApi = {
  // 1. Health check
  checkHealth: async () => {
    try {
      const res = await fetch('/api/health');
      return await res.json();
    } catch (err) {
      console.warn('Neon DB Health Check Error:', err);
      return { status: 'offline', error: err.message };
    }
  },

  // 2. Users (Akun Pengguna)
  getUsers: async () => {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      return await res.json();
    } catch (err) {
      console.warn('Fetch users from Neon error, using cache:', err);
      return null;
    }
  },

  saveUser: async (user) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      if (!res.ok) throw new Error('Failed to save user to Neon');
      return await res.json();
    } catch (err) {
      console.warn('Save user to Neon error:', err);
      return null;
    }
  },

  updateUserStatus: async (userId, data) => {
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(userId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update user in Neon');
      return await res.json();
    } catch (err) {
      console.warn('Update user in Neon error:', err);
      return null;
    }
  },

  deleteUser: async (userId) => {
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(userId)}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete user in Neon');
      return await res.json();
    } catch (err) {
      console.warn('Delete user in Neon error:', err);
      return null;
    }
  },

  // 3. Rental Bookings (Laporan & Reservasi Sewa)
  getBookings: async () => {
    try {
      const res = await fetch('/api/bookings');
      if (!res.ok) throw new Error('Failed to fetch bookings');
      return await res.json();
    } catch (err) {
      console.warn('Fetch bookings from Neon error, using cache:', err);
      return null;
    }
  },

  saveBooking: async (booking) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking)
      });
      if (!res.ok) throw new Error('Failed to save booking to Neon');
      return await res.json();
    } catch (err) {
      console.warn('Save booking to Neon error:', err);
      return null;
    }
  },

  updateBooking: async (bookingId, data) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update booking in Neon');
      return await res.json();
    } catch (err) {
      console.warn('Update booking in Neon error:', err);
      return null;
    }
  },

  // 4. Banners
  getBanners: async () => {
    try {
      const res = await fetch('/api/banners');
      if (!res.ok) throw new Error('Failed to fetch banners');
      return await res.json();
    } catch (err) {
      console.warn('Fetch banners from Neon error:', err);
      return null;
    }
  },

  saveBanners: async (banners) => {
    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(banners)
      });
      if (!res.ok) throw new Error('Failed to save banners to Neon');
      return await res.json();
    } catch (err) {
      console.warn('Save banners to Neon error:', err);
      return null;
    }
  },

  // 5. Testimonials
  getTestimonials: async () => {
    try {
      const res = await fetch('/api/testimonials');
      if (!res.ok) throw new Error('Failed to fetch testimonials');
      return await res.json();
    } catch (err) {
      console.warn('Fetch testimonials from Neon error:', err);
      return null;
    }
  },

  saveTestimonial: async (testimonial) => {
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testimonial)
      });
      if (!res.ok) throw new Error('Failed to save testimonial to Neon');
      return await res.json();
    } catch (err) {
      console.warn('Save testimonial to Neon error:', err);
      return null;
    }
  },

  saveTestimonials: async (testimonials) => {
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testimonials)
      });
      if (!res.ok) throw new Error('Failed to sync testimonials to Neon');
      return await res.json();
    } catch (err) {
      console.warn('Sync testimonials to Neon error:', err);
      return null;
    }
  },

  // 6. Products
  getProducts: async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      return await res.json();
    } catch (err) {
      console.warn('Fetch products from Neon error:', err);
      return null;
    }
  },

  saveProducts: async (products) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(products)
      });
      if (!res.ok) throw new Error('Failed to sync products to Neon');
      return await res.json();
    } catch (err) {
      console.warn('Sync products to Neon error:', err);
      return null;
    }
  },

  // 7. Articles
  getArticles: async () => {
    try {
      const res = await fetch('/api/articles');
      if (!res.ok) throw new Error('Failed to fetch articles');
      return await res.json();
    } catch (err) {
      console.warn('Fetch articles from Neon error:', err);
      return null;
    }
  },

  saveArticle: async (article) => {
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(article)
      });
      if (!res.ok) throw new Error('Failed to save article to Neon');
      return await res.json();
    } catch (err) {
      console.warn('Save article to Neon error:', err);
      return null;
    }
  },

  saveArticles: async (articles) => {
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articles)
      });
      if (!res.ok) throw new Error('Failed to sync articles to Neon');
      return await res.json();
    } catch (err) {
      console.warn('Sync articles to Neon error:', err);
      return null;
    }
  },

  // 8. Investor Team
  getTeam: async () => {
    try {
      const res = await fetch('/api/team');
      if (!res.ok) throw new Error('Failed to fetch team');
      return await res.json();
    } catch (err) {
      console.warn('Fetch team from Neon error:', err);
      return null;
    }
  },

  saveTeam: async (team) => {
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(team)
      });
      if (!res.ok) throw new Error('Failed to sync team to Neon');
      return await res.json();
    } catch (err) {
      console.warn('Sync team to Neon error:', err);
      return null;
    }
  },

  // 9. Investor Documents
  getDocuments: async () => {
    try {
      const res = await fetch('/api/documents');
      if (!res.ok) throw new Error('Failed to fetch documents');
      return await res.json();
    } catch (err) {
      console.warn('Fetch documents from Neon error:', err);
      return null;
    }
  },

  saveDocuments: async (documents) => {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(documents)
      });
      if (!res.ok) throw new Error('Failed to sync documents to Neon');
      return await res.json();
    } catch (err) {
      console.warn('Sync documents to Neon error:', err);
      return null;
    }
  },

  // 10. Gallery
  getGallery: async () => {
    try {
      const res = await fetch('/api/gallery');
      if (!res.ok) throw new Error('Failed to fetch gallery');
      return await res.json();
    } catch (err) {
      console.warn('Fetch gallery from Neon error:', err);
      return null;
    }
  },

  saveGallery: async (gallery) => {
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gallery)
      });
      if (!res.ok) throw new Error('Failed to sync gallery to Neon');
      return await res.json();
    } catch (err) {
      console.warn('Sync gallery to Neon error:', err);
      return null;
    }
  }
};

