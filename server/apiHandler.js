import { query } from './db.js';
import { verifyGoogleToken } from './googleAuth.js';

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
          role = EXCLUDED.role,
          org = EXCLUDED.org,
          google_id = COALESCE(EXCLUDED.google_id, users.google_id),
          google_picture = COALESCE(EXCLUDED.google_picture, users.google_picture),
          auth_provider = 'google',
          updated_at = NOW()
        RETURNING id, name, email, phone, role, org, status, google_picture as "picture", joined_date as "joinedDate"
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
          category: user.role,
          org: user.org,
          picture: user.picture,
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

  // 2. Users Endpoint: /api/users
  if (pathname === '/api/users') {
    if (method === 'GET') {
      try {
        const result = await query('SELECT id, name, email, phone, role, org, status, joined_date as "joinedDate", created_at as "createdAt" FROM users ORDER BY created_at DESC');
        sendJson(res, 200, result.rows);
      } catch (err) {
        sendJson(res, 500, { error: err.message });
      }
      return true;
    }

    if (method === 'POST') {
      try {
        const body = await parseBody(req);
        const { id, name, email, phone, role, org, status, joinedDate, password } = body;
        const userId = id || `usr-${Date.now()}`;
        const joined = joinedDate || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

        const result = await query(`
          INSERT INTO users (id, name, email, phone, role, org, status, joined_date, password)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (email) DO UPDATE SET
            name = EXCLUDED.name,
            phone = EXCLUDED.phone,
            role = EXCLUDED.role,
            org = EXCLUDED.org,
            status = EXCLUDED.status
          RETURNING id, name, email, phone, role, org, status, joined_date as "joinedDate"
        `, [userId, name, email, phone, role || 'Mahasiswa Aktif UII', org || 'Personal', status || 'Aktif', joined, password || '']);

        sendJson(res, 201, result.rows[0]);
      } catch (err) {
        sendJson(res, 500, { error: err.message });
      }
      return true;
    }
  }

  // PUT /api/users/:id or /api/users/status
  if (pathname.startsWith('/api/users/') && method === 'PUT') {
    const id = pathname.replace('/api/users/', '');
    try {
      const body = await parseBody(req);
      const { status, role, org } = body;
      const result = await query(`
        UPDATE users
        SET status = COALESCE($1, status),
            role = COALESCE($2, role),
            org = COALESCE($3, org)
        WHERE id = $4
        RETURNING id, name, email, phone, role, org, status, joined_date as "joinedDate"
      `, [status, role, org, id]);

      sendJson(res, 200, result.rows[0] || { success: true });
    } catch (err) {
      sendJson(res, 500, { error: err.message });
    }
    return true;
  }

  // 3. Rental Bookings Endpoint: /api/bookings
  if (pathname === '/api/bookings') {
    if (method === 'GET') {
      try {
        const result = await query('SELECT * FROM rental_bookings ORDER BY created_at DESC');
        // map db columns to camelCase expected by frontend
        const mapped = result.rows.map(r => ({
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
          totalPrice: r.total_price,
          paymentStatus: r.payment_status,
          notes: r.notes,
          createdAt: r.created_at
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
        const bookingId = body.id || `bpa-book-${Date.now()}`;
        const bookingCode = body.bookingCode || `BPA-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(100 + Math.random() * 900))}`;
        
        const result = await query(`
          INSERT INTO rental_bookings (
            id, booking_code, user_name, user_email, user_phone, user_category, user_org,
            asset_name, event_name, event_date, status, total_price, payment_status, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (booking_code) DO NOTHING
          RETURNING *
        `, [
          bookingId,
          bookingCode,
          body.userName || body.name || 'Penyewa',
          body.userEmail || body.email || '',
          body.userPhone || body.phone || '',
          body.userCategory || body.category || 'Mahasiswa Aktif UII',
          body.userOrg || body.org || 'Personal',
          body.assetName || 'Gedung SCC',
          body.eventName || 'Agenda Acara',
          body.eventDate || new Date().toLocaleDateString('id-ID'),
          body.status || 'Pengajuan',
          body.totalPrice || 'Rp 0',
          body.paymentStatus || 'Menunggu DP',
          body.notes || ''
        ]);

        sendJson(res, 201, result.rows[0] || { success: true });
      } catch (err) {
        sendJson(res, 500, { error: err.message });
      }
      return true;
    }
  }

  // PUT /api/bookings/:id
  if (pathname.startsWith('/api/bookings/') && method === 'PUT') {
    const id = pathname.replace('/api/bookings/', '');
    try {
      const body = await parseBody(req);
      const result = await query(`
        UPDATE rental_bookings
        SET status = COALESCE($1, status),
            payment_status = COALESCE($2, payment_status),
            total_price = COALESCE($3, total_price),
            notes = COALESCE($4, notes)
        WHERE id = $5 OR booking_code = $5
        RETURNING *
      `, [body.status, body.paymentStatus, body.totalPrice, body.notes, id]);

      sendJson(res, 200, result.rows[0] || { success: true });
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
          // Bulk replace banners
          await query('DELETE FROM banners');
          for (const b of body) {
            await query(
              'INSERT INTO banners (title, subtitle, description, image, badge, active) VALUES ($1, $2, $3, $4, $5, $6)',
              [b.title, b.subtitle, b.description, b.image, b.badge, b.active !== false]
            );
          }
          const updated = await query('SELECT * FROM banners ORDER BY id ASC');
          sendJson(res, 200, updated.rows);
        } else {
          const result = await query(
            'INSERT INTO banners (title, subtitle, description, image, badge, active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [body.title, body.subtitle, body.description, body.image, body.badge, body.active !== false]
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
        const result = await query(
          'INSERT INTO testimonials (name, role, org, content, rating, asset, date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
          [body.name, body.role, body.org, body.content, body.rating || 5, body.asset, body.date || new Date().toLocaleDateString('id-ID')]
        );
        sendJson(res, 201, result.rows[0]);
      } catch (err) {
        sendJson(res, 500, { error: err.message });
      }
      return true;
    }
  }

  // 6. Articles Endpoint: /api/articles
  if (pathname === '/api/articles') {
    if (method === 'GET') {
      try {
        const result = await query('SELECT * FROM articles ORDER BY created_at DESC');
        sendJson(res, 200, result.rows);
      } catch (err) {
        sendJson(res, 500, { error: err.message });
      }
      return true;
    }

    if (method === 'POST') {
      try {
        const body = await parseBody(req);
        const artId = body.id || `art-${Date.now()}`;
        const result = await query(
          'INSERT INTO articles (id, title, category, date, author, read_time, image, excerpt, content) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
          [artId, body.title, body.category || 'Berita', body.date || new Date().toLocaleDateString('id-ID'), body.author || 'Admin BPA', body.readTime || body.read_time || '3 Menit', body.image || '', body.excerpt || '', body.content || '']
        );
        sendJson(res, 201, result.rows[0]);
      } catch (err) {
        sendJson(res, 500, { error: err.message });
      }
      return true;
    }
  }

  // Not handled by API
  return false;
}

