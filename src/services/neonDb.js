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
      const res = await fetch(`/api/users/${userId}`, {
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

  // 6. Articles
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
  }
};

