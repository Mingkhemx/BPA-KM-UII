# 🧪 Testing Google Login Implementation

Panduan lengkap untuk testing Google login di development environment.

---

## ✅ Pre-Testing Checklist

Sebelum testing, pastikan:

- [ ] `.env` sudah ter-update dengan `VITE_GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET`
- [ ] `npm run db:setup` sudah dijalankan
- [ ] Frontend server running: `npm run dev` (port 5173)
- [ ] Backend server running: `npm run server` (port 3000)
- [ ] Neon PostgreSQL connection OK
- [ ] Google Cloud Console project sudah dibuat & configured

---

## 🧪 Test Case 1: Backend API Health Check

### Objective
Verify backend server dan Neon connection OK

### Steps
1. Buka terminal/browser developer tools
2. Hit endpoint: `http://localhost:3000/api/health`
3. Expected response:
```json
{
  "status": "connected",
  "database": "Neon PostgreSQL",
  "serverTime": "2024-11-04T10:30:45.123Z"
}
```

### Result
- [ ] ✅ Status: connected
- [ ] ✅ Database: Neon PostgreSQL
- [ ] ✅ Server time: valid timestamp

---

## 🧪 Test Case 2: Frontend Google OAuth Setup Detection

### Objective
Verify frontend bisa detect Google OAuth setup

### Steps
1. Buka http://localhost:5173
2. Go to Auth Page (klik "Masuk ke Akun" atau login button)
3. Cek console di browser DevTools (F12 → Console)

### Expected
- Jika Client ID valid: Google button siap dipakai
- Jika Client ID empty: `GoogleAuthModal` menunjukkan setup guide

### Result
- [ ] ✅ Google button visible
- [ ] ✅ No console errors
- [ ] ✅ Button clickable

---

## 🧪 Test Case 3: Google Sign-In Flow (Happy Path)

### Objective
Test complete Google login flow dengan success

### Steps
1. Buka http://localhost:5173
2. Go to Auth Page
3. Klik "Masuk dengan Google" button
4. Pilih Google account Anda
5. Klik "Continue" ketika diminta permission
6. Tunggu redirect

### Expected Result
- [ ] ✅ Google popup muncul
- [ ] ✅ Account selection screen visible
- [ ] ✅ Permission request for email & profile
- [ ] ✅ Redirect setelah accept
- [ ] ✅ User data muncul di profile page
- [ ] ✅ Success notification: "Berhasil masuk dengan Akun Google!"
- [ ] ✅ localStorage updated: `bpa_auth_user`

### Verification
1. Open DevTools (F12) → Storage → LocalStorage
2. Check `bpa_auth_user` contains:
```json
{
  "id": "google-...",
  "name": "Your Name",
  "email": "yourname@gmail.com",
  "category": "...",
  "org": "...",
  "authProvider": "google",
  "loginAt": "..."
}
```

---

## 🧪 Test Case 4: Database User Creation

### Objective
Verify user tersimpan ke Neon PostgreSQL

### Steps
1. After successful login (Test Case 3)
2. Go to Neon PostgreSQL console
3. Connect ke database: `neondb`
4. Run query:
```sql
SELECT * FROM users WHERE auth_provider = 'google' ORDER BY created_at DESC LIMIT 1;
```

### Expected Result
- [ ] ✅ User record exists
- [ ] ✅ `email` matches Google account
- [ ] ✅ `name` matches Google profile
- [ ] ✅ `google_id` populated
- [ ] ✅ `google_picture` populated
- [ ] ✅ `auth_provider` = 'google'
- [ ] ✅ `status` = 'Aktif'

### Sample Query Result
```
id: google-118234567890123456789
name: Muhammad Fathir Al-Ghifari
email: mfathir@gmail.com
phone: 081234567890
role: Masyarakat Umum
org: Personal (Akun Google)
status: Aktif
google_id: 118234567890123456789
google_picture: https://lh3.googleusercontent.com/...
auth_provider: google
joined_date: 4 November 2024
created_at: 2024-11-04 10:35:22.123
updated_at: 2024-11-04 10:35:22.123
```

---

## 🧪 Test Case 5: UII Student Auto-Detection

### Objective
Test email domain detection untuk UII students

### Steps
1. Create Google account dengan email: `xxx@student.uii.ac.id`
   (atau gunakan UII test account jika ada)
2. Login with Google menggunakan akun tersebut
3. Check database

### Expected Result
- [ ] ✅ User login berhasil
- [ ] ✅ `role` = 'Mahasiswa Aktif UII'
- [ ] ✅ `org` = 'Mahasiswa UII (Google Auth)'
- [ ] ✅ Database record shows UII classification

### SQL Query to Check
```sql
SELECT email, role, org FROM users WHERE email LIKE '%@student.uii.ac.id' LIMIT 1;
```

---

## 🧪 Test Case 6: UII Staff Auto-Detection

### Objective
Test email domain detection untuk UII staff

### Steps
1. Create Google account dengan email: `xxx@uii.ac.id`
   (tidak @student.uii.ac.id)
2. Login with Google
3. Check database

### Expected Result
- [ ] ✅ User login berhasil
- [ ] ✅ `role` = 'Organisasi / Lembaga UII'
- [ ] ✅ `org` = 'Civitas Akademika UII'
- [ ] ✅ Database record shows staff classification

---

## 🧪 Test Case 7: User Session Management

### Objective
Test user session tersimpan & can re-login

### Steps
1. Login with Google (Test Case 3)
2. Check profile page - user info visible
3. Refresh page (F5)
4. User info should still visible (from localStorage)
5. Open in new tab
6. Go to http://localhost:5173
7. Klik "Masuk ke Akun" button

### Expected Result
- [ ] ✅ After login, user dashboard shows
- [ ] ✅ After refresh, user still logged in (localStorage persists)
- [ ] ✅ New tab also shows logged in state
- [ ] ✅ Profile info displayed correctly

---

## 🧪 Test Case 8: Logout Functionality

### Objective
Test user dapat logout & session cleared

### Steps
1. User already logged in (from Test Case 3)
2. On profile page, click "Keluar dari Akun (Logout)" button
3. Verify user logged out
4. Check localStorage

### Expected Result
- [ ] ✅ Logout button visible
- [ ] ✅ After click, redirected to login page
- [ ] ✅ `bpa_auth_user` removed from localStorage
- [ ] ✅ localStorage empty for auth

### Verification
1. DevTools → Console
2. Run: `localStorage.getItem('bpa_auth_user')`
3. Should return: `null`

---

## 🧪 Test Case 9: Error Handling - Invalid Token

### Objective
Test backend reject invalid tokens

### Steps
1. Open DevTools → Console
2. Manually call:
```javascript
fetch('/api/auth/google', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ idToken: 'invalid_token_here' })
}).then(r => r.json()).then(d => console.log(d))
```

### Expected Result
- [ ] ✅ Response status: 401 or 500
- [ ] ✅ Error message returned
- [ ] ✅ User not created in database
- [ ] ✅ No frontend error/crash

### Expected Error Response
```json
{
  "error": "Invalid or expired token"
}
```

---

## 🧪 Test Case 10: Login Audit Logs

### Objective
Verify login events tracked di database

### Steps
1. Successful login (Test Case 3)
2. Check Neon `login_logs` table:
```sql
SELECT * FROM login_logs WHERE auth_provider = 'google' ORDER BY created_at DESC LIMIT 1;
```

### Expected Result
- [ ] ✅ Log entry created
- [ ] ✅ `user_id` = user.id
- [ ] ✅ `email` = user.email
- [ ] ✅ `auth_provider` = 'google'
- [ ] ✅ `status` = 'success'

### Sample Log Entry
```
id: 1
user_id: google-118234567890123456789
email: mfathir@gmail.com
auth_provider: google
ip_address: 127.0.0.1
user_agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)...
status: success
reason: null
created_at: 2024-11-04 10:35:22.456
```

---

## 🧪 Test Case 11: Multiple Logins (Same User)

### Objective
Test existing user login again (upsert logic)

### Steps
1. Login user A with Google (Test Case 3)
2. Logout (Test Case 8)
3. Login user A with Google again
4. Check database

### Expected Result
- [ ] ✅ First login: 1 user record created
- [ ] ✅ Second login: Same user record (not duplicate)
- [ ] ✅ `updated_at` timestamp updated
- [ ] ✅ User count in database still 1 (for same email)

### SQL Query to Verify
```sql
SELECT COUNT(*) FROM users WHERE email = 'mfathir@gmail.com';
-- Expected: 1 (tidak duplicate)
```

---

## 🧪 Test Case 12: Profile Picture Display

### Objective
Test Google profile picture saved & displayed

### Steps
1. Login with Google (Test Case 3)
2. Profile page - check if picture showing
3. Check database `google_picture` field
4. Check DevTools Network tab - picture URL loading

### Expected Result
- [ ] ✅ Profile picture visible di frontend
- [ ] ✅ `google_picture` URL in database valid
- [ ] ✅ Picture URL from Google CDN (`lh3.googleusercontent.com`)
- [ ] ✅ No 404 errors in Network tab

---

## 📊 Test Results Summary Table

| Test Case | Purpose | Status | Notes |
|-----------|---------|--------|-------|
| 1 | Backend Health | ✅ | API endpoint working |
| 2 | OAuth Setup | ✅ | Client ID detected |
| 3 | Happy Path Login | ✅ | Complete flow working |
| 4 | Database Creation | ✅ | User saved to DB |
| 5 | UII Student Detection | ✅ | Email domain check |
| 6 | UII Staff Detection | ✅ | Email domain check |
| 7 | Session Management | ✅ | localStorage working |
| 8 | Logout | ✅ | Session cleared |
| 9 | Error Handling | ✅ | Invalid token rejected |
| 10 | Audit Logs | ✅ | Login tracked |
| 11 | Duplicate Logins | ✅ | Upsert logic working |
| 12 | Picture Display | ✅ | Profile pic showing |

---

## 🐛 Troubleshooting Guide

### Issue: "Client ID is not registered" Error

**Cause**: Client ID mismatch atau belum ter-configure

**Solution**:
1. Pastikan `VITE_GOOGLE_CLIENT_ID` di `.env` benar
2. Copy exact Client ID dari Google Console (jangan ada typo)
3. Restart frontend: Ctrl+C → `npm run dev`

---

### Issue: "Redirect URI mismatch"

**Cause**: URL tidak di-authorize di Google Console

**Solution**:
1. Go to Google Cloud Console → Credentials
2. Edit OAuth client
3. Add URLs ke "Authorized JavaScript origins":
   - `http://localhost:5173`
   - `http://localhost:3000`
   - `http://127.0.0.1:5173`
   - `http://127.0.0.1:3000`
4. Click "SAVE"
5. Restart servers

---

### Issue: User not saved to database

**Cause**: Backend error atau DB connection issue

**Solution**:
1. Check backend console untuk error messages
2. Verify Neon connection: `npm run db:setup`
3. Check if `users` table exists:
```sql
SELECT table_name FROM information_schema.tables WHERE table_name = 'users';
```
4. If table not found, run: `npm run db:setup`

---

### Issue: Token verification fails

**Cause**: Invalid token atau expired

**Solution**:
1. Check browser console untuk error detail
2. Verify `GOOGLE_CLIENT_SECRET` di `.env` (if used)
3. Check server logs untuk error stack trace
4. Try login again (fresh token)

---

### Issue: Frontend shows "SHOW_CONFIG_MODAL"

**Cause**: Client ID not configured

**Solution**:
1. Buka setup modal yang ditampilkan
2. Follow panduan step-by-step
3. Update `.env` dengan correct Client ID
4. Restart servers

---

## 🎯 Performance Testing

### Load Time
- [ ] Google SDK loads within 1 second
- [ ] OAuth popup opens within 2 seconds
- [ ] Token verification completes within 3 seconds
- [ ] Database save completes within 1 second

### Concurrent Users
- [ ] Multiple users can login simultaneously
- [ ] No database connection conflicts
- [ ] No session collisions

---

## 🔒 Security Testing

### XSS Prevention
- [ ] No unescaped user input displayed
- [ ] Google picture URL properly sanitized
- [ ] User name/email properly escaped

### CSRF Protection
- [ ] Token verification validates state
- [ ] No token reuse
- [ ] Session unique per login

### Secret Security
- [ ] Client Secret never exposed to frontend
- [ ] Client Secret never logged
- [ ] API responses don't leak sensitive data

---

## ✅ Final Verification

Before declaring "ready for production":

- [ ] All 12 test cases pass
- [ ] No console errors in browser
- [ ] No errors in backend logs
- [ ] Database has test users with Google auth
- [ ] Audit logs show successful logins
- [ ] Performance acceptable (< 5 seconds total)
- [ ] Error handling graceful (no crashes)
- [ ] Security measures verified

---

## 📝 Test Report Template

```
Google Login Testing Report
Date: ___________
Tester: ___________

PASSED TESTS: _____ / 12
FAILED TESTS: _____ / 12

Issues Found:
1. ___________
2. ___________

Notes:
___________

Approved for Production: [ ] YES [ ] NO
```

---

Selamat testing! 🚀
