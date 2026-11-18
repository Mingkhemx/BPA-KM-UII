// Layanan Google Authentication & Sinkronisasi ke Database Neon PostgreSQL
// Mendukung Google Identity Services (GIS) resmi Google Cloud Console & Verifikasi Pendaftaran

import { adminStorage } from '../utils/adminStorage';

/**
 * Mendapatkan Google OAuth Client ID (dari localStorage atau .env)
 */
export const getGoogleClientId = () => {
  try {
    const stored = localStorage.getItem('bpa_custom_google_client_id');
    if (stored && stored.trim()) return stored.trim();
  } catch {}
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
};

/**
 * Menyimpan Client ID kustom ke localStorage
 */
export const setCustomGoogleClientId = (id) => {
  try {
    if (id && id.trim()) {
      localStorage.setItem('bpa_custom_google_client_id', id.trim());
    } else {
      localStorage.removeItem('bpa_custom_google_client_id');
    }
  } catch {}
};

/**
 * Mengecek apakah email sudah terdaftar di Neon PostgreSQL atau cache lokal
 */
export async function checkRegisteredUserByEmail(email) {
  const normalized = (email || '').trim().toLowerCase();
  if (!normalized) return { exists: false };

  try {
    const res = await fetch(`/api/auth/check?email=${encodeURIComponent(normalized)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.exists && data.user) {
        return { exists: true, user: data.user };
      }
      return { exists: false };
    }
  } catch (err) {
    console.warn('Cek user ke Neon DB gagal, cek cache lokal:', err);
  }

  // Fallback check cache adminStorage jika API offline
  try {
    const localUsers = adminStorage.getUsers() || [];
    const found = localUsers.find((u) => (u.email || '').toLowerCase() === normalized);
    if (found) {
      return {
        exists: true,
        user: {
          id: found.id,
          name: found.name,
          email: found.email,
          phone: found.phone,
          category: found.role || 'Masyarakat Umum',
          org: found.org || 'Personal',
          identifier: found.email,
          authProvider: 'google',
          loginAt: new Date().toLocaleString('id-ID')
        }
      };
    }
  } catch {}

  return { exists: false };
}

/**
 * Menyimpan data pengguna Google langsung ke Database Neon PostgreSQL melalui endpoint /api/auth/google
 */
export async function saveGoogleUserToNeon(googleUser) {
  try {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: googleUser })
    });

    const data = await res.json();
    const savedUser = data.user || googleUser;

    // Perbarui cache adminStorage untuk sinkronisasi admin sarpras
    try {
      const existing = adminStorage.getUsers();
      const filtered = existing.filter((u) => u.email !== savedUser.email);
      const newEntry = {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        phone: savedUser.phone || '',
        role: savedUser.category || 'Masyarakat Umum',
        org: savedUser.org || 'Masyarakat Umum (Personal)',
        status: 'Aktif',
        joinedDate: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        totalBookings: 0
      };
      adminStorage.saveUsers([newEntry, ...filtered]);
    } catch (e) {
      console.warn('Cache admin sync warning:', e);
    }

    return savedUser;
  } catch (err) {
    console.warn('Gagal menyimpan pengguna Google ke Neon:', err);
    return googleUser;
  }
}

/**
 * Inisialisasi dan pemicu alur Google OAuth 2.0
 */
export async function triggerGoogleAuthFlow({
  onUserSuccess,
  onUserError,
  onNeedsRegistration,
  mode = 'login'
}) {
  const clientId = getGoogleClientId();

  // Cek apakah ada Client ID resmi dari Google Cloud Console
  const isRealClientId =
    clientId &&
    !clientId.includes('your-google-client-id') &&
    clientId.includes('.apps.googleusercontent.com');

  if (window.google?.accounts?.oauth2 && isRealClientId) {
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            onUserError?.(tokenResponse.error_description || tokenResponse.error);
            return;
          }

          try {
            // Ambil data profil terverifikasi langsung dari Google
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
            });
            const profile = await res.json();

            // Cek apakah akun sudah terdaftar
            const check = await checkRegisteredUserByEmail(profile.email);

            if (mode === 'login' && check.exists && check.user) {
              onUserSuccess?.(check.user);
              return;
            }

            // Jika mode register ATAU akun belum terdaftar, wajib lengkapi asal & WhatsApp dulu
            onNeedsRegistration?.({
              id: `google-${profile.sub || Date.now()}`,
              googleId: profile.sub,
              name: profile.name || profile.given_name || 'Pengguna Google',
              email: profile.email,
              picture: profile.picture || ''
            });
          } catch (err) {
            console.error('Error Google UserInfo:', err);
            onUserError?.('Gagal mengambil data akun dari Google: ' + err.message);
          }
        }
      });

      client.requestAccessToken();
      return 'TRIGGERED_POPUP';
    } catch (err) {
      console.warn('Gagal memicu Google OAuth Client:', err);
    }
  }

  // Tampilkan pemilih akun Google
  return 'SHOW_GOOGLE_MODAL';
}
