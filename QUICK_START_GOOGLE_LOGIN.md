# 🚀 Quick Start - Google Login Integration

Panduan cepat untuk mengintegrasikan Google Sign-In ke aplikasi Anda.

## ⏱️ Waktu Setup: ~5-10 Menit

## Step 1: Setup Database Schema (1 Menit)

Terminal:
```bash
npm run db:setup
```

✅ Ini akan membuat tabel `users`, `user_sessions`, dan `login_logs` di Neon PostgreSQL dengan kolom Google Auth.

---

## Step 2: Create Google OAuth Project (2-3 Menit)

### 2a. Akses Google Cloud Console
1. Buka: https://console.cloud.google.com/
2. Login dengan akun Google Anda
3. Klik dropdown "Select a Project" → "NEW PROJECT"
4. Nama: `BPA KM UII`
5. Klik "CREATE" dan tunggu ± 1 menit

### 2b. Setup OAuth Consent Screen
1. Menu ☰ (kiri) → Cari "OAuth consent screen"
2. Pilih User Type: **External**
3. Klik "CREATE"
4. Isi:
   - App name: `BPA KM UII`
   - User support email: alamat email Anda
   - Developer contact: email yang sama
5. Scopes → "ADD OR REMOVE SCOPES" → Cari & pilih:
   - `openid`
   - `email`
   - `profile`
6. Klik "SAVE AND CONTINUE" sampai selesai

---

## Step 3: Create OAuth 2.0 Client ID (2-3 Menit)

1. Menu ☰ (kiri) → Cari "Credentials"
2. Klik "CREATE CREDENTIALS" → "OAuth client ID"
3. Application type: **"Web application"**
4. Name: `BPA KM UII Web Client`

5. **Authorized JavaScript origins** - Tambahkan:
   ```
   http://localhost:5173
   http://localhost:3000
   http://127.0.0.1:5173
   http://127.0.0.1:3000
   ```

6. **Authorized redirect URIs** - Tambahkan URLs yang sama

7. Klik "CREATE"

8. **PENTING**: Popup akan muncul dengan:
   - `Client ID` (copy ini)
   - `Client Secret` (JANGAN di-share!)

---

## Step 4: Update .env (1 Menit)

Buka file `.env` dan update:

```env
VITE_GOOGLE_CLIENT_ID=PASTE_CLIENT_ID_HERE.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=PASTE_CLIENT_SECRET_HERE
```

Ganti `PASTE_CLIENT_ID_HERE` dan `PASTE_CLIENT_SECRET_HERE` dengan nilai dari Step 3.

⚠️ **Jangan commit .env ke git** (sudah ada di .gitignore)

---

## Step 5: Restart Servers (1 Menit)

Terminal 1 - Frontend:
```bash
npm run dev
```

Terminal 2 - Backend:
```bash
npm run server
```

---

## Step 6: Test Google Login (2 Menit)

1. Buka browser: http://localhost:5173
2. Klik tombol "Masuk dengan Google"
3. Pilih akun Google Anda
4. Berikan permission untuk email & profile
5. Seharusnya:
   ✅ Login berhasil
   ✅ Data tersimpan ke Neon PostgreSQL
   ✅ User profile muncul di halaman

---

## 🎉 Selesai!

User sekarang bisa login dengan Google yang:
- ✅ Terverifikasi langsung dari Google servers
- ✅ Data tersimpan di Neon PostgreSQL
- ✅ Token diverifikasi di backend (aman)
- ✅ Session tracking tersedia

---

## 📱 Production Deployment

Sebelum deploy ke production:

1. **Update .env di server production**
   ```env
   VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=xxx
   ```

2. **Di Google Console, tambahkan production domain:**
   
   Authorized JavaScript origins:
   ```
   https://yourdomain.com
   https://www.yourdomain.com
   ```
   
   Authorized redirect URIs:
   ```
   https://yourdomain.com
   https://www.yourdomain.com
   ```

3. **Test di production URL sebelum launch**

---

## ❓ Troubleshooting

### ❌ "Client ID is not registered"
- Pastikan `VITE_GOOGLE_CLIENT_ID` di .env benar
- Pastikan client ID matches dengan Google Console
- Restart frontend server

### ❌ "Redirect URI mismatch"
- Pastikan URL localhost Anda sudah di-add ke Google Console
- Jika menggunakan `127.0.0.1`, tambahkan juga ke authorized origins

### ❌ "Token verification failed"
- Check browser console untuk error message
- Pastikan backend server jalan (`npm run server`)
- Check server logs untuk error details

### ❌ User tidak tersimpan ke database
- Pastikan `npm run db:setup` sudah dijalankan
- Check Neon PostgreSQL connection di `.env`
- Lihat backend console logs untuk error

---

## 📚 Dokumentasi Lengkap

Lihat: `GOOGLE_OAUTH_SETUP.md` untuk panduan detail & advanced setup.

---

## 🎯 Fitur yang Sudah Implemented

✅ Google OAuth 2.0 login integration
✅ Token verification di backend (secure)
✅ User data auto-saved ke Neon PostgreSQL
✅ Auto-detect UII student/staff emails
✅ Session tracking & login logs
✅ Profile picture dari Google

---

## 🔒 Security Features

✅ Token signature verification dengan Google public keys
✅ Audience (Client ID) validation
✅ Issuer validation (hanya dari accounts.google.com)
✅ Client Secret hanya di backend (tidak di-expose ke frontend)
✅ Login audit logs untuk security tracking
✅ Session expiration handling

---

Selamat! Google Login sudah siap digunakan. 🎉
