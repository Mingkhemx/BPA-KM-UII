import { query } from './db.js';
import { verifyGoogleToken } from './googleAuth.js';
import { hashPassword, verifyPassword } from './security.js';

// Helper to parse JSON body from incoming Node HTTP request
export async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', err => reject(err));
  });
}

// JSON response helper
function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export async function handleApiRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;
  const method = req.method.toUpperCase();

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }

  // 1. Health Check
  if (pathname === '/api/health' && method === 'GET') {
    try {
      const dbRes = await query('SELECT NOW() as current_time');
      sendJson(res, 200, {
        status: 'connected',
        database: 'Neon PostgreSQL',
        serverTime: dbRes.rows[0].current_time
      });
    } catch (err) {
      sendJson(res, 500, { status: 'error', message: err.message });
    }
    return true;
  }

  // 1.5 Google Auth Verification Endpoint: /api/auth/google
  if (pathname === '/api/auth/google' && method === 'POST') {
    try {
      const body = await parseBody(req);
      const { idToken, user: directUser, mode } = body;

      let userInfo = null;
      if (idToken) {
        // Verify token dengan Google servers & extract user info
        userInfo = await verifyGoogleToken(idToken);
        if (!userInfo) {
          sendJson(res, 401, { error: 'Token Google tidak valid atau kedaluwarsa' });
          return true;
        }
      } else if (directUser && directUser.email) {
        userInfo = {
          sub: directUser.googleId || directUser.id || `g_${Date.now()}`,
          email: directUser.email.trim().toLowerCase(),
          name: directUser.name || directUser.email.split('@')[0],
          picture: directUser.picture || '',
          phone: directUser.phone || '081234567890',
          category: directUser.category,
          org: directUser.org
        };
      } else {
        sendJson(res, 400, { error: 'ID Token atau data profil Google diperlukan' });
        return true;
      }

      // Generate user ID untuk database
      const userId = `google-${userInfo.sub}`;
      const isUiiStudent = userInfo.email?.endsWith('@student.uii.ac.id');
      const isUiiStaff = userInfo.email?.endsWith('@uii.ac.id');

      const userCategory = userInfo.category || (isUiiStudent ? 'Mahasiswa Aktif UII' : isUiiStaff ? 'Organisasi / Lembaga UII' : 'Masyarakat Umum');
      const userOrg = userInfo.org || (isUiiStudent ? 'Mahasiswa UII (Google Auth)' : isUiiStaff ? 'Civitas Akademika UII' : 'Personal (Akun Google)');
      const userPhone = userInfo.phone || '081234567890';

      // Upsert (insert or update) user ke database
      const result = await query(`
        INSERT INTO users (id, name, email, phone, role, org, status, google_id, google_picture, auth_provider, joined_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          phone = COALESCE(NULLIF(EXCLUDED.phone, ''), users.phone),
          role = CASE 
            WHEN LOWER(users.role) LIKE '%staf%' OR LOWER(users.role) LIKE '%staff%' OR LOWER(users.role) LIKE '%admin%' 
            THEN users.role 
            ELSE EXCLUDED.role 
          END,
          org = CASE 
            WHEN LOWER(users.role) LIKE '%staf%' OR LOWER(users.role) LIKE '%staff%' OR LOWER(users.role) LIKE '%admin%' 
            THEN users.org 
            ELSE EXCLUDED.org 
          END,
          google_id = COALESCE(EXCLUDED.google_id, users.google_id),
          google_picture = CASE WHEN users.google_picture LIKE 'data:%' THEN users.google_picture ELSE COALESCE(NULLIF(EXCLUDED.google_picture, ''), users.google_picture) END,
          auth_provider = 'google',
          updated_at = NOW()
        RETURNING id, name, email, phone, role, org, status, google_picture as "picture", staff_onboarded as "staffOnboarded", auth_provider as "authProvider", joined_date as "joinedDate"
      `, [
        userId,
        userInfo.name || userInfo.given_name || 'Pengguna Google',
        userInfo.email,
        userPhone,
        userCategory,
        userOrg,
        'Aktif',
        userInfo.sub,
        userInfo.picture || '',
        'google',
        new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      ]);

      const user = result.rows[0];

      // Audit Log pencatatan login
      try {
        await query(`
          INSERT INTO login_logs (user_id, email, auth_provider, ip_address, user_agent, status)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          user.id,
          user.email,
          'google',
          req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1',
          req.headers['user-agent'] || 'Web Client',
          'success'
        ]);
      } catch (logErr) {
        // Abaikan jika audit log table belum sinkron
      }
      
      // Return user data + session token
      sendJson(res, 200, {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          category: user.role,
          org: user.org,
          picture: user.picture,
          staffOnboarded: user.staffOnboarded ?? false,
          identifier: user.email,
          authProvider: 'google',
          loginAt: new Date().toLocaleString('id-ID')
        }
      });
    } catch (err) {
      console.error('Google Auth Error:', err);
      sendJson(res, 500, { error: 'Authentication failed: ' + err.message });
    }
    return true;
  }

  // 1.6 Check if user exists by email: /api/auth/check?email=...
  if (pathname === '/api/auth/check' && method === 'GET') {
    const email = (url.searchParams.get('email') || '').trim().toLowerCase();
    if (!email) {
      sendJson(res, 400, { error: 'Email diperlukan' });
      return true;
    }
    try {
      const result = await query(
        `SELECT id, name, email, phone, role, org, status, google_id as "googleId", google_picture as "picture", auth_provider as "authProvider", staff_onboarded as "staffOnboarded"
         FROM users WHERE LOWER(email) = $1 LIMIT 1`,
        [email]
      );
      if (result.rows.length > 0) {
        const u = result.rows[0];
        const isGoogleAccount = Boolean(u.googleId) || String(u.id || '').startsWith('google-');
        sendJson(res, 200, {
          exists: true,
          user: {
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            role: u.role,
            category: u.role,
            org: u.org,
            picture: u.picture || '',
            googleId: u.googleId,
            staffOnboarded: u.staffOnboarded ?? false,
            identifier: u.email,
            authProvider: isGoogleAccount ? 'google' : (u.authProvider || 'local'),
            loginAt: new Date().toLocaleString('id-ID')
          }
        });
      } else {
        sendJson(res, 200, { exists: false });
      }
    } catch (err) {
      sendJson(res, 500, { error: err.message });
    }
    return true;
  }

  // 1.7 Local Email & Password Login: /api/auth/login
  if (pathname === '/api/auth/login' && method === 'POST') {
    try {
      const body = await parseBody(req);
      const email = (body.email || '').trim().toLowerCase();
      const password = body.password || '';

      if (!email || !password) {
        sendJson(res, 400, { error: 'Mohon lengkapi email dan kata sandi Anda.' });
        return true;
      }

      const result = await query(
        `SELECT id, name, email, phone, role, org, status, password, google_picture as "picture", auth_provider as "authProvider"
         FROM users WHERE LOWER(email) = $1 LIMIT 1`,
        [email]
      );

      if (result.rows.length === 0) {
        sendJson(res, 404, {
          notRegistered: true,
          error: 'Akun dengan email ini belum terdaftar. Silakan daftar akun terlebih dahulu.'
        });
        return true;
      }

      const u = result.rows[0];

      if (!u.password) {
        sendJson(res, 400, { error: 'Akun ini terdaftar via Google. Silakan masuk menggunakan tombol Google.' });
        return true;
      }

      if (!verifyPassword(password, u.password)) {
        sendJson(res, 401, { error: 'Kata sandi yang Anda masukkan salah.' });
        return true;
      }

      sendJson(res, 200, {
        success: true,
        user: {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          category: u.role,
          org: u.org,
          picture: u.picture || '',
          identifier: u.email,
          authProvider: u.authProvider || 'local',
          loginAt: new Date().toLocaleString('id-ID')
        }
      });
    } catch (err) {
      sendJson(res, 500, { error: err.message });
    }
    return true;
  }

  // 1.8 Administrator Login Endpoint: /api/admin/login
  if (pathname === '/api/admin/login' && method === 'POST') {
    try {
      const body = await parseBody(req);
      const identifier = (body.email || body.identifier || body.username || '').trim().toLowerCase();
      const password = body.password || '';

      if (!identifier || !password) {
        sendJson(res, 400, { error: 'Mohon masukkan akun administrator dan kata sandi.' });
        return true;
      }

      // Cari user berdasarkan email, username (bagian sebelum @), atau id
      const result = await query(
        `SELECT id, name, email, phone, role, org, status, password, google_picture as "picture"
         FROM users 
         WHERE (LOWER(email) = $1 
            OR LOWER(SPLIT_PART(email, '@', 1)) = $1 
            OR LOWER(id) = $1)
         LIMIT 1`,
        [identifier]
      );

      if (result.rows.length === 0) {
        sendJson(res, 401, { error: 'Akun administrator tidak ditemukan. Periksa kembali akun Anda.' });
        return true;
      }

      const u = result.rows[0];

      if (u.status === 'Nonaktif') {
        sendJson(res, 403, { error: 'Akun administrator dinonaktifkan oleh sistem.' });
        return true;
      }

      const roleLower = String(u.role || '').toLowerCase();
      const isPrivileged = roleLower.includes('admin') || roleLower.includes('presiden') || roleLower.includes('direktur');
      if (!isPrivileged) {
        sendJson(res, 403, { error: 'Akun ini tidak memiliki hak akses administrator BPA.' });
        return true;
      }

      if (!u.password) {
        sendJson(res, 401, { error: 'Kata sandi akun admin belum disetel.' });
        return true;
      }

      const isValid = verifyPassword(password, u.password);
      if (!isValid) {
        sendJson(res, 401, { error: 'Kata sandi yang Anda masukkan salah.' });
        return true;
      }

      // Record audit log
      try {
        await query(
          `INSERT INTO login_logs (user_id, email, auth_provider, ip_address, user_agent, status)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            u.id,
            u.email,
            'local_admin',
            req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1',
            req.headers['user-agent'] || 'Admin Web Client',
            'success'
          ]
        );
      } catch (logErr) {}

      sendJson(res, 200, {
        success: true,
        user: {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          division: u.org || 'Presiden Direktur BPA KM UII',
          picture: u.picture || '',
          loginTime: new Date().toLocaleString('id-ID')
        }
      });
    } catch (err) {
      console.error('Admin login error:', err);
      sendJson(res, 500, { error: 'Terjadi kesalahan sistem saat login: ' + err.message });
    }
    return true;
  }

  // 2. Users Endpoint: /api/users
  if (pathname === '/api/users') {
    if (method === 'GET') {
      try {
        const result = await query(`
          SELECT id, name, email, phone, role, org, status, google_id as "googleId", google_picture as "picture", staff_onboarded as "staffOnboarded", 
                 CASE WHEN google_id IS NOT NULL OR id LIKE 'google-%' THEN 'google' ELSE COALESCE(auth_provider, 'local') END as "authProvider", 
                 joined_date as "joinedDate", created_at as "createdAt" 
          FROM users ORDER BY created_at DESC
        `);
        sendJson(res, 200, result.rows);
      } catch (err) {
        sendJson(res, 500, { error: err.message });
      }
      return true;
    }

    if (method === 'POST') {
      try {
        const body = await parseBody(req);
        const { id, name, email, phone, role, org, status, joinedDate, password, picture, staffOnboarded, staff_onboarded, authProvider, auth_provider } = body;
        const userId = id || `usr-${Date.now()}`;
        const joined = joinedDate || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        const isOnboarded = staffOnboarded ?? staff_onboarded ?? false;
        const provider = authProvider || auth_provider || 'local';

        // Hash password jika diberikan dan belum dalam format pbkdf2
        const rawPassword = password || '';
        const securePassword = rawPassword && !rawPassword.startsWith('pbkdf2$')
          ? hashPassword(rawPassword)
          : rawPassword;

        const result = await query(`
          INSERT INTO users (id, name, email, phone, role, org, status, joined_date, password, google_picture, staff_onboarded, auth_provider)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (email) DO UPDATE SET
            name = EXCLUDED.name,
            phone = EXCLUDED.phone,
            role = EXCLUDED.role,
            org = EXCLUDED.org,
            status = EXCLUDED.status,
            password = CASE WHEN EXCLUDED.password <> '' THEN EXCLUDED.password ELSE users.password END,
            google_picture = COALESCE(NULLIF(EXCLUDED.google_picture, ''), users.google_picture),
            staff_onboarded = COALESCE(EXCLUDED.staff_onboarded, users.staff_onboarded),
            auth_provider = COALESCE(EXCLUDED.auth_provider, users.auth_provider)
          RETURNING id, name, email, phone, role, org, status, google_picture as "picture", staff_onboarded as "staffOnboarded", auth_provider as "authProvider", joined_date as "joinedDate"
        `, [userId, name, email, phone, role || 'Mahasiswa Aktif UII', org || 'Personal', status || 'Aktif', joined, securePassword, picture || '', isOnboarded, provider]);

        sendJson(res, 201, result.rows[0]);
      } catch (err) {
        sendJson(res, 500, { error: err.message });
      }
      return true;
    }
  }

  // PUT /api/users/:id or /api/users/status
  if (pathname.startsWith('/api/users/') && method === 'PUT') {
    const id = decodeURIComponent(pathname.replace('/api/users/', ''));
    try {
      const body = await parseBody(req);
      const { name, phone, status, role, org, picture, staffOnboarded, staff_onboarded, authProvider, auth_provider, password } = body;
      const onboardVal = staffOnboarded !== undefined ? staffOnboarded : staff_onboarded !== undefined ? staff_onboarded : null;
      const providerVal = authProvider || auth_provider || null;

      // Hash password jika disertakan
      const securePassword = password ? (password.startsWith('pbkdf2$') ? password : hashPassword(password)) : null;

      const result = await query(`
        UPDATE users
        SET name = COALESCE($1, name),
            phone = COALESCE($2, phone),
            status = COALESCE($3, status),
            role = COALESCE($4, role),
            org = COALESCE($5, org),
            google_picture = COALESCE($6, google_picture),
            staff_onboarded = COALESCE($7, staff_onboarded),
            auth_provider = COALESCE($8, auth_provider),
            password = COALESCE($9, password),
            updated_at = NOW()
        WHERE id = $10 OR email = $10
        RETURNING id, name, email, phone, role, org, status, google_picture as "picture", staff_onboarded as "staffOnboarded", auth_provider as "authProvider", joined_date as "joinedDate"
      `, [name ?? null, phone ?? null, status ?? null, role ?? null, org ?? null, picture !== undefined ? picture : null, onboardVal, providerVal, securePassword, id]);

      sendJson(res, 200, result.rows[0] || { success: true });
    } catch (err) {
      sendJson(res, 500, { error: err.message });
    }
    return true;
  }

  // DELETE /api/users/:id
  if (pathname.startsWith('/api/users/') && method === 'DELETE') {
    const id = decodeURIComponent(pathname.replace('/api/users/', ''));
    try {
      await query('DELETE FROM users WHERE id = $1 OR email = $1', [id]);
      sendJson(res, 200, { success: true, deletedId: id });
    } catch (err) {
      sendJson(res, 500, { error: err.message });
    }
    return true;
  }

  // Helper mapper untuk rental_bookings <-> frontend rich tracking format
  const mapBookingRow = (r) => {
    const parsedItems = Array.isArray(r.items_json) ? r.items_json : [];
    const parsedCost = Number(r.total_cost) || Number(String(r.total_price || '').replace(/[^0-9]/g, '')) || 0;
    return {
      id: r.id,
      bookingCode: r.booking_code,
      userName: r.user_name,
      userEmail: r.user_email,
      userPhone: r.user_phone,
      userCategory: r.user_category,
      userOrg: r.user_org,
      assetName: r.asset_name,
      eventName: r.event_name,
      eventDate: r.event_date,
      status: r.status,
      totalPrice: r.total_price || `Rp ${parsedCost.toLocaleString('id-ID')}`,
      totalCost: parsedCost,
      paymentStatus: r.payment_status,
      notes: r.notes,
      progressPercent: (r.status || '').toUpperCase() === 'MENUNGGU PERSETUJUAN'
        ? 0 
        : (r.progress_percent !== null && r.progress_percent !== undefined ? Number(r.progress_percent) : 0),
      progressStage: r.progress_stage || 'Tahap 1: Verifikasi Jadwal & Validasi Data oleh Staf BPA KM UII',
      location: r.location || 'Gedung Student Convention Center (SCC) Kampus Terpadu UII',
      downPayment: r.down_payment || r.payment_status || 'Menunggu Konfirmasi Staf',
      remainingPayment: r.remaining_payment || `Rp ${parsedCost.toLocaleString('id-ID')}`,
      customer: {
        name: r.user_name,
        email: r.user_email,
        phone: r.user_phone,
        org: r.user_org,
        notes: r.notes || ''
      },
      items: parsedItems.length > 0 ? parsedItems : [{
        id: (r.asset_name || 'aset').toLowerCase().replace(/\s+/g, '-'),
        name: r.asset_name || 'Aset BPA',
        quantity: 1,
        days: 1,
        priceValue: parsedCost,
        startDate: r.event_date || ''
      }],
      milestones: Array.isArray(r.milestones_json) ? r.milestones_json : [],
      timelineUpdates: Array.isArray(r.timeline_updates_json) ? r.timeline_updates_json : [],
      picStaff: r.pic_staff_json && r.pic_staff_json.name ? r.pic_staff_json : undefined,
      createdAt: r.created_at
    };
  };

  // 3. Rental Bookings Endpoint: /api/bookings
  if (pathname === '/api/bookings') {
    if (method === 'GET') {
      try {
        const result = await query('SELECT * FROM rental_bookings ORDER BY created_at DESC');
        sendJson(res, 200, result.rows.map(mapBookingRow));
      } catch (err) {
        sendJson(res, 500, { error: err.message });
      }
      return true;
    }

    if (method === 'POST') {
      try {
        const body = await parseBody(req);
        let bookingCode = body.bookingCode;
        if (!bookingCode) {
          try {
            const existingRes = await query(`
              SELECT booking_code FROM rental_bookings WHERE booking_code ~* '^BPA-[0-9]+$'
            `);
            const existingNums = new Set(
              (existingRes.rows || [])
                .map((r) => parseInt(String(r.booking_code || '').replace(/^bpa-/i, ''), 10))
                .filter((n) => !isNaN(n))
            );
            let nextNum = 1;
            while (existingNums.has(nextNum)) {
              nextNum++;
            }
            bookingCode = `BPA-${String(nextNum).padStart(2, '0')}`;
          } catch {
            bookingCode = `BPA-01`;
          }
        }
        const bookingId = body.id || bookingCode;
        const cust = body.customer || {};
        const items = Array.isArray(body.items) ? body.items : [];
        const totalCost = Number(body.totalCost) || Number(String(body.totalPrice || '').replace(/[^0-9]/g, '')) || 0;
        const totalPrice = body.totalPrice || `Rp ${totalCost.toLocaleString('id-ID')}`;

        const result = await query(`
          INSERT INTO rental_bookings (
            id, booking_code, user_name, user_email, user_phone, user_category, user_org,
            asset_name, event_name, event_date, status, total_price, total_cost,
            payment_status, notes, progress_percent, progress_stage, location,
            down_payment, remaining_payment, items_json, milestones_json,
            timeline_updates_json, pic_staff_json
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
            $14, $15, $16, $17, $18, $19, $20, $21::jsonb, $22::jsonb, $23::jsonb, $24::jsonb
          )
          ON CONFLICT (booking_code) DO UPDATE SET
            status = COALESCE(EXCLUDED.status, rental_bookings.status),
            progress_percent = COALESCE(EXCLUDED.progress_percent, rental_bookings.progress_percent),
            progress_stage = COALESCE(EXCLUDED.progress_stage, rental_bookings.progress_stage),
            total_price = COALESCE(EXCLUDED.total_price, rental_bookings.total_price),
            total_cost = COALESCE(EXCLUDED.total_cost, rental_bookings.total_cost),
            payment_status = COALESCE(EXCLUDED.payment_status, rental_bookings.payment_status),
            notes = COALESCE(EXCLUDED.notes, rental_bookings.notes),
            items_json = COALESCE(EXCLUDED.items_json, rental_bookings.items_json),
            milestones_json = COALESCE(EXCLUDED.milestones_json, rental_bookings.milestones_json),
            timeline_updates_json = COALESCE(EXCLUDED.timeline_updates_json, rental_bookings.timeline_updates_json),
            pic_staff_json = CASE 
              WHEN EXCLUDED.pic_staff_json IS NOT NULL AND EXCLUDED.pic_staff_json::text <> '{}' AND EXCLUDED.pic_staff_json::text <> 'null' 
              THEN EXCLUDED.pic_staff_json 
              ELSE rental_bookings.pic_staff_json 
            END,
            updated_at = NOW()
          RETURNING *
        `, [
          bookingId,
          bookingCode,
          cust.name || body.userName || body.name || 'Penyewa',
          cust.email || body.userEmail || body.email || '',
          cust.phone || body.userPhone || body.phone || '',
          body.userCategory || body.category || 'Mahasiswa Aktif UII',
          cust.org || body.userOrg || body.org || 'Personal',
          (items[0]?.name) || body.assetName || 'Gedung SCC',
          body.eventName || cust.org || 'Agenda Acara',
          body.eventDate || (items[0]?.startDate ? `${items[0].startDate} s/d ${items[0].endDate || items[0].startDate}` : new Date().toLocaleDateString('id-ID')),
          body.status || 'MENUNGGU PERSETUJUAN',
          totalPrice,
          totalCost,
          body.paymentStatus || body.downPayment || 'Menunggu DP',
          cust.notes || body.notes || '',
          ((body.status || 'MENUNGGU PERSETUJUAN').toUpperCase() === 'MENUNGGU PERSETUJUAN') ? 0 : (body.progressPercent ?? 0),
          body.progressStage || 'Tahap 1: Verifikasi Jadwal & Validasi Data oleh Staf BPA KM UII',
          body.location || 'Gedung Student Convention Center (SCC) Kampus Terpadu UII',
          body.downPayment || 'Menunggu Konfirmasi Staf',
          body.remainingPayment || totalPrice,
          JSON.stringify(items),
          JSON.stringify(Array.isArray(body.milestones) ? body.milestones : []),
          JSON.stringify(Array.isArray(body.timelineUpdates) ? body.timelineUpdates : []),
          JSON.stringify(body.picStaff || {})
        ]);

        sendJson(res, 201, mapBookingRow(result.rows[0]));
      } catch (err) {
        sendJson(res, 500, { error: err.message });
      }
      return true;
    }
  }

  // PUT /api/bookings/:id
  if (pathname.startsWith('/api/bookings/') && method === 'PUT') {
    const id = decodeURIComponent(pathname.replace('/api/bookings/', ''));
    try {
      const body = await parseBody(req);
      const result = await query(`
        UPDATE rental_bookings
        SET status = COALESCE($1, status),
            payment_status = COALESCE($2, payment_status),
            total_price = COALESCE($3, total_price),
            total_cost = COALESCE($4, total_cost),
            notes = COALESCE($5, notes),
            progress_percent = COALESCE($6, progress_percent),
            progress_stage = COALESCE($7, progress_stage),
            items_json = COALESCE($8::jsonb, items_json),
            milestones_json = COALESCE($9::jsonb, milestones_json),
            timeline_updates_json = COALESCE($10::jsonb, timeline_updates_json),
            pic_staff_json = COALESCE($11::jsonb, pic_staff_json),
            updated_at = NOW()
        WHERE id = $12 OR booking_code = $12
        RETURNING *
      `, [
        body.status ?? null,
        body.paymentStatus ?? null,
        body.totalPrice ?? null,
        body.totalCost !== undefined ? Number(body.totalCost) : null,
        body.notes ?? null,
        body.progressPercent !== undefined ? Number(body.progressPercent) : null,
        body.progressStage ?? null,
        body.items ? JSON.stringify(body.items) : null,
        body.milestones ? JSON.stringify(body.milestones) : null,
        body.timelineUpdates ? JSON.stringify(body.timelineUpdates) : null,
        body.picStaff ? JSON.stringify(body.picStaff) : null,
        id
      ]);

      sendJson(res, 200, result.rows[0] ? mapBookingRow(result.rows[0]) : { success: true });
    } catch (err) {
      sendJson(res, 500, { error: err.message });
    }
    return true;
  }

  // DELETE /api/bookings/:id
  if (pathname.startsWith('/api/bookings/') && method === 'DELETE') {
    const id = decodeURIComponent(pathname.replace('/api/bookings/', ''));
    try {
      await query('DELETE FROM rental_bookings WHERE id = $1 OR booking_code = $1', [id]);
      sendJson(res, 200, { success: true });
    } catch (err) {
      sendJson(res, 500, { error: err.message });
    }
    return true;
  }

  // 4. Banners Endpoint: /api/banners
  if (pathname === '/api/banners') {
    if (method === 'GET') {
      try {
        const result = await query('SELECT * FROM banners ORDER BY id ASC');
        sendJson(res, 200, result.rows);
      } catch (err) {
        sendJson(res, 500, { error: err.message });
      }
      return true;
    }

    if (method === 'POST') {
      try {
        const body = await parseBody(req);
        if (Array.isArray(body)) {
          await query('DELETE FROM banners');
          for (const b of body) {
            await query(
              'INSERT INTO banners (title, subtitle, description, image, badge, active) VALUES ($1, $2, $3, $4, $5, $6)',
              [b.title || '', b.subtitle || '', b.description || '', b.image || '', b.badge || '', b.active !== false]
            );
          }
          const updated = await query('SELECT * FROM banners ORDER BY id ASC');
          sendJson(res, 200, updated.rows);
        } else {
          const result = await query(
            'INSERT INTO banners (title, subtitle, description, image, badge, active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [body.title || '', body.subtitle || '', body.description || '', body.image || '', body.badge || '', body.active !== false]
          );
          sendJson(res, 201, result.rows[0]);
        }
      } catch (err) {
        sendJson(res, 500, { error: err.message });
      }
      return true;
    }
  }

  // 5. Testimonials Endpoint: /api/testimonials
  if (pathname === '/api/testimonials') {
    if (method === 'GET') {
      try {
        const result = await query('SELECT * FROM testimonials ORDER BY id DESC');
        sendJson(res, 200, result.rows);
      } catch (err) {
        sendJson(res, 500, { error: err.message });
      }
      return true;
    }

    if (method === 'POST') {
      try {
        const body = await parseBody(req);
        if (Array.isArray(body)) {
          await query('DELETE FROM testimonials');
          for (const t of body) {
            await query(
              'INSERT INTO testimonials (name, role, org, content, rating, asset, date) VALUES ($1, $2, $3, $4, $5, $6, $7)',
              [t.name || '', t.role || '', t.org || '', t.content || '', Number(t.rating) || 5, t.asset || '', t.date || new Date().toLocaleDateString('id-ID')]
            );
          }
          const updated = await query('SELECT * FROM testimonials ORDER BY id DESC');
          sendJson(res, 200, updated.rows);
        } else {
          const result = await query(
            'INSERT INTO testimonials (name, role, org, content, rating, asset, date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [body.name, body.role, body.org, body.content, body.rating || 5, body.asset, body.date || new Date().toLocaleDateString('id-ID')]
          );
          sendJson(res, 201, result.rows[0]);
        }
      } catch (err) {
        sendJson(res, 500, { error: err.message });
      }
      return true;
    }
  }

  // 6. Products Endpoint: /api/products
  if (pathname === '/api/products') {
    if (method === 'GET') {
      try {
        const result = await query('SELECT * FROM products ORDER BY created_at ASC');
        const mapped = result.rows.map(r => ({
          id: r.id,
          slug: r.slug || r.id,
          name: r.name,
          cat: r.category || 'Gedung',
          priceText: r.price || `Rp ${Number(r.price_value || 0).toLocaleString('id-ID')} / hari`,
          priceValue: Number(r.price_value) || 0,
          stock: Number(r.stock) || 1,
          unit: r.unit || 'hari',
          image: r.image || '',
          images: r.image ? [r.image] : [],
          desc: r.description || '',
          specs: Array.isArray(r.features) ? r.features : []
        }));
        sendJson(res, 200, mapped);
      } catch (err) {
        sendJson(res, 500, { error: err.message });
      }
      return true;
    }

    if (method === 'POST') {
      try {
        const body = await parseBody(req);
        if (Array.isArray(body)) {
          await query('DELETE FROM products');
          for (const p of body) {
            await query(
              `INSERT INTO products (id, slug, name, category, price, price_value, stock, unit, image, description, features, available, status)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, true, 'Tersedia')`,
              [
                p.id || `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                p.slug || p.id || '',
                p.name || 'Produk',
                p.cat || p.category || 'Gedung',
                p.priceText || p.price || `Rp ${Number(p.priceValue || 0).toLocaleString('id-ID')} / hari`,
                Number(p.priceValue) || 0,
                Number(p.stock) || 1,
                p.unit || 'hari',
                p.image || (p.images && p.images[0]) || '',
                p.desc || p.description || '',
                JSON.stringify(p.specs || p.features || [])
              ]
            );
          }
          sendJson(res, 200, { success: true, count: body.length });
        } else {
          const prodId = body.id || `prod-${Date.now()}`;
          const result = await query(
            `INSERT INTO products (id, slug, name, category, price, price_value, stock, unit, image, description, features)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb)
             ON CONFLICT (id) DO UPDATE SET
               name = EXCLUDED.name,
               category = EXCLUDED.category,
               price = EXCLUDED.price,
               price_value = EXCLUDED.price_value,
               stock = EXCLUDED.stock,
               image = EXCLUDED.image,
               description = EXCLUDED.description
             RETURNING *`,
            [
              prodId,
              body.slug || prodId,
              body.name,
              body.cat || body.category || 'Gedung',
              body.priceText || `Rp ${Number(body.priceValue || 0).toLocaleString('id-ID')} / hari`,
              Number(body.priceValue) || 0,
              Number(body.stock) || 1,
              body.unit || 'hari',
              body.image || '',
              body.desc || body.description || '',
              JSON.stringify(body.specs || body.features || [])
            ]
          );
          sendJson(res, 201, result.rows[0]);
        }
      } catch (err) {
        sendJson(res, 500, { error: err.message });
      }
      return true;
    }
  }

  // 7. Articles Endpoint: /api/articles
  if (pathname === '/api/articles') {
    if (method === 'GET') {
      try {
        const result = await query('SELECT * FROM articles ORDER BY created_at DESC');
        const mapped = result.rows.map(a => ({
          id: a.id,
          title: a.title,
          category: a.category,
          date: a.date,
          author: a.author,
          readTime: a.read_time,
          image: a.image,
          excerpt: a.excerpt,
          content: a.content,
          views: a.views || 0
        }));
        sendJson(res, 200, mapped);
      } catch (err) {
        sendJson(res, 500, { error: err.message });
      }
      return true;
    }

    if (method === 'POST') {
      try {
        const body = await parseBody(req);
        if (Array.isArray(body)) {
          await query('DELETE FROM articles');
          for (const a of body) {
            await query(
              'INSERT INTO articles (id, title, category, date, author, read_time, image, excerpt, content, views) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
              [
                String(a.id || `art-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`),
                a.title || '',
                a.category || 'Berita',
                a.date || new Date().toLocaleDateString('id-ID'),
                a.author || 'Admin BPA',
                a.readTime || a.read_time || '3 min baca',
                a.image || '',
                a.excerpt || '',
                a.content || '',
                Number(a.views) || 0
              ]
            );
          }
          sendJson(res, 200, { success: true, count: body.length });
        } else {
          const artId = String(body.id || `art-${Date.now()}`);
          const result = await query(
            `INSERT INTO articles (id, title, category, date, author, read_time, image, excerpt, content, views)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             ON CONFLICT (id) DO UPDATE SET
               title = EXCLUDED.title,
               category = EXCLUDED.category,
               date = EXCLUDED.date,
               author = EXCLUDED.author,
               image = EXCLUDED.image,
               excerpt = EXCLUDED.excerpt,
               content = EXCLUDED.content
             RETURNING *`,
            [artId, body.title, body.category || 'Berita', body.date || new Date().toLocaleDateString('id-ID'), body.author || 'Admin BPA', body.readTime || body.read_time || '3 Menit', body.image || '', body.excerpt || '', body.content || '', Number(body.views) || 0]
          );
          sendJson(res, 201, result.rows[0]);
        }
      } catch (err) {
        sendJson(res, 500, { error: err.message });
      }
      return true;
    }
  }

  // 8. Investor Team Endpoint: /api/team
  if (pathname === '/api/team') {
    if (method === 'GET') {
      try {
        const result = await query('SELECT * FROM investor_members ORDER BY id ASC');
        const mapped = result.rows.map(m => ({
          id: m.member_key || `tm-${m.id}`,
          name: m.name,
          role: m.role,
          division: m.department || m.period || 'Pengurus BPA',
          image: m.photo || ''
        }));
        sendJson(res, 200, mapped);
      } catch (err) {
        sendJson(res, 500, { error: err.message });
      }
      return true;
    }

    if (method === 'POST') {
      try {
        const body = await parseBody(req);
        if (Array.isArray(body)) {
          await query('DELETE FROM investor_members');
          for (const m of body) {
            await query(
              'INSERT INTO investor_members (member_key, name, role, department, photo) VALUES ($1, $2, $3, $4, $5)',
              [String(m.id || `tm-${Date.now()}`), m.name || '', m.role || '', m.division || m.department || '', m.image || m.photo || '']
            );
          }
          sendJson(res, 200, { success: true, count: body.length });
        }
      } catch (err) {
        sendJson(res, 500, { error: err.message });
      }
      return true;
    }
  }

  // 9. Investor Documents Endpoint: /api/documents
  if (pathname === '/api/documents') {
    if (method === 'GET') {
      try {
        const result = await query('SELECT * FROM investor_documents ORDER BY id DESC');
        const mapped = result.rows.map(d => ({
          id: d.doc_key || `doc-${d.id}`,
          title: d.title,
          type: d.type || 'LPJ',
          period: d.period || 'Triwulan',
          date: d.upload_date || '',
          fileImage: d.file_image || '/images/INVESTOR/lpj-tw4.png',
          downloadUrl: d.download_url || d.file_name || ''
        }));
        sendJson(res, 200, mapped);
      } catch (err) {
        sendJson(res, 500, { error: err.message });
      }
      return true;
    }

    if (method === 'POST') {
      try {
        const body = await parseBody(req);
        if (Array.isArray(body)) {
          await query('DELETE FROM investor_documents');
          for (const d of body) {
            await query(
              'INSERT INTO investor_documents (doc_key, title, type, period, upload_date, file_image, download_url) VALUES ($1, $2, $3, $4, $5, $6, $7)',
              [String(d.id || `doc-${Date.now()}`), d.title || '', d.type || 'LPJ', d.period || '', d.date || '', d.fileImage || '', d.downloadUrl || '']
            );
          }
          sendJson(res, 200, { success: true, count: body.length });
        }
      } catch (err) {
        sendJson(res, 500, { error: err.message });
      }
      return true;
    }
  }

  // 10. Gallery Endpoint: /api/gallery
  if (pathname === '/api/gallery') {
    if (method === 'GET') {
      try {
        const result = await query('SELECT * FROM gallery ORDER BY id DESC');
        const photos = [];
        const videos = [];
        result.rows.forEach(g => {
          if (g.type === 'video') {
            videos.push({
              id: g.item_key || `gv-${g.id}`,
              title: g.title,
              category: g.category,
              date: g.date,
              youtubeId: g.youtube_id,
              description: g.description
            });
          } else {
            photos.push({
              id: g.item_key || `gp-${g.id}`,
              title: g.title,
              category: g.category,
              date: g.date,
              image: g.media_url,
              description: g.description
            });
          }
        });
        sendJson(res, 200, { photos, videos });
      } catch (err) {
        sendJson(res, 500, { error: err.message });
      }
      return true;
    }

    if (method === 'POST') {
      try {
        const body = await parseBody(req);
        const photos = Array.isArray(body?.photos) ? body.photos : [];
        const videos = Array.isArray(body?.videos) ? body.videos : [];
        await query('DELETE FROM gallery');
        for (const p of photos) {
          await query(
            'INSERT INTO gallery (item_key, title, category, type, date, media_url, description) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [String(p.id || `gp-${Date.now()}`), p.title || '', p.category || '', 'photo', p.date || '', p.image || '', p.description || '']
          );
        }
        for (const v of videos) {
          await query(
            'INSERT INTO gallery (item_key, title, category, type, date, youtube_id, description) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [String(v.id || `gv-${Date.now()}`), v.title || '', v.category || '', 'video', v.date || '', v.youtubeId || '', v.description || '']
          );
        }
        sendJson(res, 200, { success: true, count: photos.length + videos.length });
      } catch (err) {
        sendJson(res, 500, { error: err.message });
      }
      return true;
    }
  }

  // Not handled by API
  return false;
}

