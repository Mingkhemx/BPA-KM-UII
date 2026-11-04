# 🔐 Setup Google OAuth 2.0 untuk Login Real

Panduan lengkap untuk mengintegrasikan Google Sign-In ke aplikasi Anda menggunakan Google Cloud Console.

## 1️⃣ Buat Project di Google Cloud Console

### Step 1: Akses Google Cloud Console
- Buka https://console.cloud.google.com/
- Login dengan akun Google Anda

### Step 2: Buat Project Baru
1. Klik dropdown "Select a Project" di bagian atas
2. Klik "NEW PROJECT"
3. Masukkan nama: `BPA KM UII Login`
4. Klik "CREATE"
5. Tunggu project dibuat (± 1-2 menit)

---

## 2️⃣ Setup OAuth 2.0 Consent Screen

### Step 1: Buka OAuth Consent Screen
1. Klik menu ☰ (hamburger) di kiri atas
2. Cari "APIs & Services" → Click "OAuth consent screen"
3. Pilih User Type: **External**
4. Klik "CREATE"

### Step 2: Isi Form Consent Screen

**App Information:**
- App name: `BPA KM UII`
- User support email: Masukkan email Anda (bisa Gmail)
- Developer contact information: Masukkan email yang sama

**Scopes:**
- Klik "ADD OR REMOVE SCOPES"
- Cari dan pilih:
  - `openid`
  - `email`
  - `profile`
- Klik "UPDATE"

**Test Users (opsional untuk development):**
- Tambahkan email Google yang akan Anda gunakan untuk testing

Klik "SAVE AND CONTINUE"

---

## 3️⃣ Buat OAuth 2.0 Credentials (Client ID)

### Step 1: Pergi ke Credentials
1. Di menu sebelah kiri, klik "Credentials"
2. Klik "CREATE CREDENTIALS"
3. Pilih "OAuth client ID"

### Step 2: Setup Web Application
1. Application type: Pilih **"Web application"**
2. Name: `BPA KM UII Web Client`

3. **Authorized JavaScript origins** - Tambahkan URLs:
   - `http://localhost:3000`
   - `http://localhost:5173` (untuk Vite dev server)
   - `http://127.0.0.1:3000`
   - `http://127.0.0.1:5173`
   - (Nanti saat production: tambahkan URL domain Anda)

4. **Authorized redirect URIs** - Tambahkan:
   - `http://localhost:3000`
   - `http://localhost:5173`
   - `http://127.0.0.1:3000`
   - `http://127.0.0.1:5173`

5. Klik "CREATE"

### Step 3: Copy Client ID
Akan muncul popup dengan:
- **Client ID** (copy ini)
- **Client Secret** (JANGAN BAGIKAN, hanya untuk backend)

---

## 4️⃣ Update .env di Project Anda

```env
# Neon PostgreSQL
DATABASE_URL=postgresql://...

# Google OAuth 2.0 - DARI GOOGLE CONSOLE
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com

# Backend Server Secret (JANGAN di-expose ke frontend!)
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
```

---

## 5️⃣ Enable Google+ API (Optional tapi recommended)

1. Di Google Cloud Console, cari "Google+ API"
2. Klik "Enable"

---

## 6️⃣ Testing Google Login

### Local Development:
```bash
npm run dev    # Jalankan frontend di http://localhost:5173
npm run server # Jalankan backend di http://localhost:3000
```

### Testing Steps:
1. Buka aplikasi di browser
2. Klik tombol "Masuk dengan Google"
3. Pilih akun Google Anda
4. Berikan permission untuk email & profile
5. Setelah sukses:
   - User akan login
   - Data disimpan ke Neon PostgreSQL
   - Local storage di update

---

## 🔒 Keamanan Backend

Backend sekarang akan:
1. Menerima ID Token dari frontend
2. Verify token signature dengan Google Public Keys
3. Check token expiry & valid claims
4. Save user data ke database
5. Return session token

Jangan pernah expose `GOOGLE_CLIENT_SECRET` ke frontend!

---

## 📱 Production Deployment

Sebelum deploy ke production:
1. Add domain Anda ke "Authorized JavaScript origins"
2. Add callback URL ke "Authorized redirect URIs"
3. Update `.env` di server production
4. Test Google login di production URL

Contoh untuk domain `bpa.uii.ac.id`:
- Origins: `https://bpa.uii.ac.id`
- Redirect: `https://bpa.uii.ac.id`

---

## ❓ Troubleshooting

### Error: "Client ID is not registered"
→ Pastikan Client ID di .env benar dan matches dengan Google Console

### Error: "Redirect URI mismatch"
→ Tambahkan URL yang Anda gunakan ke "Authorized redirect URIs" di Google Console

### Token Expired
→ Frontend akan refresh otomatis, atau user perlu login ulang

### User tidak tersimpan di database
→ Check console di browser untuk error message
→ Pastikan Neon PostgreSQL connection OK
→ Pastikan table `users` sudah ada dengan schema yang benar

---

## 📚 Reference Docs
- Google Identity: https://developers.google.com/identity
- OAuth 2.0 Flow: https://developers.google.com/identity/protocols/oauth2
- Token Verification: https://developers.google.com/identity/sign-in/web/backend-auth
