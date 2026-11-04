/**
 * Setup Database Schema untuk Google OAuth Authentication
 * Jalankan: node scripts/setupGoogleAuthSchema.js
 */

import { pool, query } from '../server/db.js';

async function setupSchema() {
  try {
    console.log('🔧 Setting up Google Auth schema...');

    // 1. Check & Create users table dengan kolom Google Auth
    console.log('📋 Creating/updating users table...');
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(100) DEFAULT 'Pengguna',
        org VARCHAR(255),
        status VARCHAR(50) DEFAULT 'Aktif',
        password VARCHAR(255),
        
        -- Google OAuth Columns
        google_id VARCHAR(255) UNIQUE,
        google_picture VARCHAR(500),
        auth_provider VARCHAR(50) DEFAULT 'local', -- 'local', 'google', 'github', etc.
        
        -- Timestamps
        joined_date VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Users table created/updated');

    // 2. Create index untuk faster email lookup
    console.log('🔍 Creating indexes...');
    
    // Check if columns exist sebelum create index
    try {
      await query(`
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      `);
    } catch (e) {
      console.log('   Index email already exists or column not ready');
    }
    
    try {
      await query(`
        CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
      `);
    } catch (e) {
      console.log('   Index google_id already exists or column not ready');
    }

    console.log('✅ Indexes created');

    // 3. Create sessions table untuk track login sessions (optional)
    console.log('📋 Creating sessions table...');
    await query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(500),
        auth_provider VARCHAR(50),
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    console.log('✅ Sessions table created');

    // 4. Create login audit log table untuk security tracking
    console.log('📋 Creating login audit logs table...');
    await query(`
      CREATE TABLE IF NOT EXISTS login_logs (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        auth_provider VARCHAR(50),
        ip_address VARCHAR(45),
        user_agent VARCHAR(500),
        status VARCHAR(50) DEFAULT 'success', -- 'success', 'failed'
        reason VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);

    console.log('✅ Login audit logs table created');

    // 5. Verify koneksi dengan data
    const usersCount = await query('SELECT COUNT(*) as count FROM users');
    console.log(`\n📊 Current users count: ${usersCount.rows[0].count}`);

    console.log('\n✨ Database schema setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Add VITE_GOOGLE_CLIENT_ID to .env');
    console.log('   2. Add GOOGLE_CLIENT_SECRET to .env (backend only)');
    console.log('   3. Configure Google Cloud Console (see GOOGLE_OAUTH_SETUP.md)');
    console.log('   4. Restart frontend & backend servers');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error setting up schema:', err);
    process.exit(1);
  }
}

setupSchema();
