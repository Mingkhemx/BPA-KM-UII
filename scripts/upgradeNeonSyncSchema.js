import { query } from '../server/db.js';
import { OFFICIAL_PRODUCTS } from '../src/data/officialProducts.js';
import { INITIAL_DEMO_TRACKING_BOOKINGS } from '../src/data/trackingData.js';

async function upgrade() {
  console.log('🔧 Upgrading Neon PostgreSQL schema for full website & admin sync...');

  // 1. Upgrade rental_bookings
  await query(`
    ALTER TABLE rental_bookings
      ADD COLUMN IF NOT EXISTS progress_percent INTEGER DEFAULT 15,
      ADD COLUMN IF NOT EXISTS progress_stage TEXT,
      ADD COLUMN IF NOT EXISTS total_cost INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS location TEXT,
      ADD COLUMN IF NOT EXISTS down_payment TEXT,
      ADD COLUMN IF NOT EXISTS remaining_payment TEXT,
      ADD COLUMN IF NOT EXISTS items_json JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS milestones_json JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS timeline_updates_json JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS pic_staff_json JSONB DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
  `);

  // 2. Upgrade products
  await query(`
    ALTER TABLE products
      ADD COLUMN IF NOT EXISTS slug VARCHAR(255),
      ADD COLUMN IF NOT EXISTS price_value INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 1;
  `);

  // 3. Upgrade articles
  await query(`
    ALTER TABLE articles
      ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
  `);

  // 4. Upgrade investor_members, investor_documents, gallery
  await query(`
    ALTER TABLE investor_members
      ADD COLUMN IF NOT EXISTS member_key VARCHAR(100);
  `);

  await query(`
    ALTER TABLE investor_documents
      ADD COLUMN IF NOT EXISTS doc_key VARCHAR(100),
      ADD COLUMN IF NOT EXISTS period VARCHAR(100),
      ADD COLUMN IF NOT EXISTS file_image TEXT,
      ADD COLUMN IF NOT EXISTS download_url TEXT;
  `);

  await query(`
    ALTER TABLE gallery
      ADD COLUMN IF NOT EXISTS item_key VARCHAR(100);
  `);

  // 5. Seed products if empty
  const prodCount = await query('SELECT COUNT(*) FROM products');
  if (parseInt(prodCount.rows[0].count, 10) === 0) {
    console.log('📦 Seeding products table from OFFICIAL_PRODUCTS...');
    for (const p of OFFICIAL_PRODUCTS) {
      await query(
        `INSERT INTO products (id, slug, name, category, price, price_value, stock, unit, image, description, features, available, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, true, 'Tersedia')
         ON CONFLICT (id) DO NOTHING`,
        [
          p.id,
          p.slug || p.id,
          p.name,
          p.cat || 'Aset',
          p.priceText || `Rp ${(p.priceValue || 0).toLocaleString('id-ID')} / hari`,
          p.priceValue || 0,
          p.stock || 1,
          p.unit || 'hari',
          p.image || (p.images && p.images[0]) || '',
          p.desc || p.fullDesc || '',
          JSON.stringify(p.specs || p.features || [])
        ]
      );
    }
  }

  // 6. Seed demo tracking booking into rental_bookings with full JSONB if missing
  for (const demo of INITIAL_DEMO_TRACKING_BOOKINGS) {
    await query(
      `INSERT INTO rental_bookings (
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
        items_json = COALESCE(NULLIF(rental_bookings.items_json, '[]'::jsonb), EXCLUDED.items_json),
        milestones_json = COALESCE(NULLIF(rental_bookings.milestones_json, '[]'::jsonb), EXCLUDED.milestones_json),
        timeline_updates_json = COALESCE(NULLIF(rental_bookings.timeline_updates_json, '[]'::jsonb), EXCLUDED.timeline_updates_json),
        progress_percent = COALESCE(rental_bookings.progress_percent, EXCLUDED.progress_percent),
        progress_stage = COALESCE(rental_bookings.progress_stage, EXCLUDED.progress_stage),
        total_cost = GREATEST(COALESCE(rental_bookings.total_cost, 0), EXCLUDED.total_cost),
        location = COALESCE(rental_bookings.location, EXCLUDED.location),
        down_payment = COALESCE(rental_bookings.down_payment, EXCLUDED.down_payment),
        remaining_payment = COALESCE(rental_bookings.remaining_payment, EXCLUDED.remaining_payment),
        pic_staff_json = COALESCE(rental_bookings.pic_staff_json, EXCLUDED.pic_staff_json)`,
      [
        demo.bookingCode,
        demo.bookingCode,
        demo.customer?.name || 'Penyewa',
        demo.customer?.email || '',
        demo.customer?.phone || '',
        'Mahasiswa Aktif UII',
        demo.customer?.org || 'Personal',
        (demo.items && demo.items[0]?.name) || 'Gedung SCC',
        demo.customer?.org || 'Agenda Acara',
        demo.eventDate || '',
        demo.status || 'SEDANG DISIAPKAN',
        `Rp ${(demo.totalCost || 0).toLocaleString('id-ID')}`,
        demo.totalCost || 0,
        demo.downPayment || 'Menunggu DP',
        demo.customer?.notes || '',
        demo.progressPercent ?? 75,
        demo.progressStage || '',
        demo.location || '',
        demo.downPayment || '',
        demo.remainingPayment || '',
        JSON.stringify(demo.items || []),
        JSON.stringify(demo.milestones || []),
        JSON.stringify(demo.timelineUpdates || []),
        JSON.stringify(demo.picStaff || {})
      ]
    );
  }

  console.log('✨ Schema upgrade & seeding completed!');
  process.exit(0);
}

upgrade().catch((err) => {
  console.error('❌ Upgrade error:', err);
  process.exit(1);
});
