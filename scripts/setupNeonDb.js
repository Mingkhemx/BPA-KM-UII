import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_hL69OFDAZGYd@ep-still-hall-a16xkdey-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function setup() {
  console.log('Connecting to Neon PostgreSQL...');
  const client = await pool.connect();

  try {
    console.log('Creating tables in Neon database...');

    // 1. Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        role VARCHAR(100) DEFAULT 'Mahasiswa Aktif UII',
        org VARCHAR(255) DEFAULT 'Personal',
        status VARCHAR(50) DEFAULT 'Aktif',
        joined_date VARCHAR(100),
        password VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Rental Bookings Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS rental_bookings (
        id VARCHAR(100) PRIMARY KEY,
        booking_code VARCHAR(100) UNIQUE NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        user_email VARCHAR(255),
        user_phone VARCHAR(50),
        user_category VARCHAR(100),
        user_org VARCHAR(255),
        asset_name VARCHAR(255) NOT NULL,
        event_name VARCHAR(255),
        event_date VARCHAR(100),
        status VARCHAR(100) DEFAULT 'Pengajuan',
        total_price VARCHAR(100),
        payment_status VARCHAR(100) DEFAULT 'Menunggu DP',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Banners Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS banners (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255),
        description TEXT,
        image TEXT,
        badge VARCHAR(100),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Testimonials Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255),
        org VARCHAR(255),
        content TEXT,
        rating INT DEFAULT 5,
        asset VARCHAR(255),
        date VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Products Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        price VARCHAR(100),
        unit VARCHAR(100),
        image TEXT,
        description TEXT,
        features JSONB,
        available BOOLEAN DEFAULT true,
        status VARCHAR(50) DEFAULT 'Tersedia',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Articles Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        date VARCHAR(100),
        author VARCHAR(255),
        read_time VARCHAR(50),
        image TEXT,
        excerpt TEXT,
        content TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Investor Members Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS investor_members (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255),
        period VARCHAR(100),
        photo TEXT,
        department VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 8. Investor Documents Table (LPJ & SK)
    await client.query(`
      CREATE TABLE IF NOT EXISTS investor_documents (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(100),
        file_name VARCHAR(255),
        file_size VARCHAR(100),
        upload_date VARCHAR(100),
        status VARCHAR(100) DEFAULT 'Terverifikasi',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 9. Gallery Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS gallery (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        type VARCHAR(50),
        date VARCHAR(100),
        media_url TEXT,
        youtube_id VARCHAR(100),
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Tables created successfully!');

    // Seed Initial Users if empty
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count, 10) === 0) {
      console.log('Seeding initial users...');
      const initialUsers = [
        ['usr-1', 'Muhammad Fathir Al-Ghifari', 'fathir.ghifari@gmail.com', '081234567890', 'Mahasiswa Aktif UII', 'Kepanitiaan Semnas KM UII', 'Aktif', '12 Oktober 2026'],
        ['usr-2', 'Muhammad Farhan', 'muhammad.farhan@gmail.com', '081398765432', 'Mahasiswa Aktif UII', 'Teknik Informatika UII', 'Aktif', '18 Oktober 2026'],
        ['usr-3', 'DPM KM UII Komisi IV', 'dpm.komisi4@uii.ac.id', '082155443322', 'Organisasi / Lembaga UII', 'Dewan Permusyawaratan Mahasiswa', 'Aktif', '01 September 2026'],
        ['usr-4', 'Kukuh Prasetyo', 'kukuh.prasetyo@eventjogja.com', '087766554433', 'Masyarakat Umum', 'EO Wisata Edukasi Sleman', 'Aktif', '25 Oktober 2026'],
        ['usr-5', 'Ahmad Zaki', 'zaki.ahmad@gmail.com', '081999887766', 'Alumni UII', 'Alumni Arsitektur 2020', 'Aktif', '05 Agustus 2026']
      ];

      for (const u of initialUsers) {
        await client.query(
          'INSERT INTO users (id, name, email, phone, role, org, status, joined_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          u
        );
      }
      console.log('Seeded users.');
    }

    // Seed Initial Bookings if empty
    const bookingCount = await client.query('SELECT COUNT(*) FROM rental_bookings');
    if (parseInt(bookingCount.rows[0].count, 10) === 0) {
      console.log('Seeding initial rental bookings...');
      const initialBookings = [
        ['bpa-book-001', 'BPA-202611-001', 'Muhammad Fathir Al-Ghifari', 'fathir.ghifari@gmail.com', '081234567890', 'Mahasiswa Aktif UII', 'Kepanitiaan Semnas KM UII', 'Gedung Student Convention Center (SCC)', 'Seminar Nasional Technopreneur 2026', '20 November 2026', 'Menunggu Approval', 'Rp 2.500.000', 'Menunggu DP', 'Memerlukan setting proyektor & audio sound system'],
        ['bpa-book-002', 'BPA-202611-002', 'DPM KM UII Komisi IV', 'dpm.komisi4@uii.ac.id', '082155443322', 'Organisasi / Lembaga UII', 'DPM KM UII', 'Sound System HTS & 10 Mic Wireless', 'Musyawarah Perwakilan Mahasiswa UII', '15 November 2026', 'Disetujui', 'Rp 1.200.000', 'DP Lunas (50%)', 'Pengambilan h-1 di sekretariat BPA'],
        ['bpa-book-003', 'BPA-202611-003', 'Kukuh Prasetyo', 'kukuh.prasetyo@eventjogja.com', '087766554433', 'Masyarakat Umum', 'EO Wisata Edukasi Sleman', 'Proyektor Epson EB-E01 3300 Lumens', 'Workshop Pembuatan Konten Edukasi', '10 November 2026', 'Setting Lapangan', 'Rp 450.000', 'Lunas (100%)', 'Disertai kru teknisi setting']
      ];

      for (const b of initialBookings) {
        await client.query(
          'INSERT INTO rental_bookings (id, booking_code, user_name, user_email, user_phone, user_category, user_org, asset_name, event_name, event_date, status, total_price, payment_status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
          b
        );
      }
      console.log('Seeded rental bookings.');
    }

    // Seed Banners if empty
    const bannerCount = await client.query('SELECT COUNT(*) FROM banners');
    if (parseInt(bannerCount.rows[0].count, 10) === 0) {
      console.log('Seeding initial banners...');
      const banners = [
        ['Badan Pengelola Aset KM UII', 'Pusat Pengelolaan & Penyewaan Fasilitas Kampus', 'Layanan resmi peminjaman sarana prasarana Student Convention Center (SCC), inventaris audio multimedia, dan logistik acara bagi civitas akademika UII dan umum.', '/images/produk/detail/scc-wide.jpg', 'Resmi BPA KM UII', true],
        ['Gedung Student Convention Center', 'Aula Pertemuan Utama Berkapasitas 1.500 Orang', 'Venue representatif berpendingin udara (Full AC) lengkap dengan panggung modular, ruang transit VIP, dan akustik standar konvensi nasional.', '/images/asset-bpa/scc-uii.webp', 'Fasilitas Unggulan', true],
        ['Inventaris Multimedia & Audio Terpadu', 'Sound System, Handy Talky, & Proyektor Event', 'Perangkat terawat dengan uji kelayakan fisik berkala dan pendampingan kru teknis lapangan siap menyukseskan agenda Anda.', '/images/produk/detail/proyektor-angle.jpg', 'Kesiapan Lapangan 100%', true]
      ];
      for (const bn of banners) {
        await client.query(
          'INSERT INTO banners (title, subtitle, description, image, badge, active) VALUES ($1, $2, $3, $4, $5, $6)',
          bn
        );
      }
      console.log('Seeded banners.');
    }

    // Seed Testimonials if empty
    const testCount = await client.query('SELECT COUNT(*) FROM testimonials');
    if (parseInt(testCount.rows[0].count, 10) === 0) {
      console.log('Seeding initial testimonials...');
      const testimonials = [
        ['Ahmad Rizky Pratama', 'Ketua Panitia', 'Seminar Nasional Kewirausahaan KM UII', 'Reservasi Gedung SCC melalui BPA sangat teratur dan transparan. Kalender bebas bentrok benar-benar membantu kepastian izin venue kami.', 5, 'Gedung SCC & Sound HTS', '12 Oktober 2026'],
        ['Siti Nurhaliza', 'Sekretaris Umum', 'DPM KM UII', 'Peralatan audio sound system dan HT dalam kondisi sangat prima. Kru teknis BPA sangat sigap saat gladi resik musyawarah ormawa.', 5, 'Sound System HTS & 10 Mic Wireless', '05 Oktober 2026'],
        ['Dimas Arya Wicaksana', 'Sie Perlengkapan', 'Festival Musik Kampus UII', 'Proses sewa alat cepat dan tanpa birokrasi berbelit. Invoice dan bukti reservasi langsung terverifikasi dengan rapi.', 5, 'Proyektor Epson & Paket Panggung', '28 September 2026']
      ];
      for (const t of testimonials) {
        await client.query(
          'INSERT INTO testimonials (name, role, org, content, rating, asset, date) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          t
        );
      }
      console.log('Seeded testimonials.');
    }

    // Seed Articles if empty
    const articleCount = await client.query('SELECT COUNT(*) FROM articles');
    if (parseInt(articleCount.rows[0].count, 10) === 0) {
      console.log('Seeding initial articles...');
      const articles = [
        ['art-1', 'SOP dan Prosedur Resmi Pengajuan Sewa Gedung SCC UII untuk Ormawa', 'Panduan', '28 Oktober 2026', 'Tim Sekretariat BPA', '4 Menit Baca', '/images/produk/detail/scc-wide.jpg', 'Panduan lengkap tata cara perizinan dan reservasi Gedung Student Convention Center (SCC) UII bagi seluruh ormawa dan kepanitiaan kampus.', 'Artikel lengkap panduan sewa gedung SCC...'],
        ['art-2', 'Pemeliharaan Rutin Aset Audio & Multimedia BPA KM UII', 'Kegiatan BPA', '15 Oktober 2026', 'Divisi Sarpras & Teknisi', '3 Menit Baca', '/images/produk/detail/proyektor-angle.jpg', 'Divisi operasional BPA melakukan kalibrasi proyektor, pengecekan daya baterai mic wireless, dan perawatan berkala audio mixer.', 'Rincian pemeliharaan sarana...'],
        ['art-3', 'Laporan Pertanggungjawaban Aset Tengah Periode Kepengurusan', 'Transparansi', '02 Oktober 2026', 'BPA KM UII', '5 Menit Baca', '/images/asset-bpa/scc-uii.webp', 'Keterbukaan informasi pengelolaan aset publik mahasiswa dengan rincian pemanfaatan gedung dan peremajaan inventaris.', 'Rincian transparansi pengelolaan...']
      ];
      for (const a of articles) {
        await client.query(
          'INSERT INTO articles (id, title, category, date, author, read_time, image, excerpt, content) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
          a
        );
      }
      console.log('Seeded articles.');
    }

    console.log('Database setup and initial seeding complete!');
  } catch (err) {
    console.error('Database setup error:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

setup().then(() => {
  console.log('Neon Database is 100% READY!');
  process.exit(0);
}).catch((err) => {
  console.error('Failed to setup DB:', err);
  process.exit(1);
});

