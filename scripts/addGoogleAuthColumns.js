/**
 * Add Google OAuth columns to existing users table
 * Jalankan: node scripts/addGoogleAuthColumns.js
 */

import { query } from '../server/db.js';

async function addGoogleColumns() {
  try {
    console.log('🔧 Adding Google OAuth columns to users table...');

    // 1. Add google_id column
    try {
      await query(`
        ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;
      `);
      console.log('✅ Added google_id column');
    } catch (e) {
      if (e.code === '42701') {
        console.log('ℹ️ google_id column already exists');
      } else {
        throw e;
      }
    }

    // 2. Add google_picture column
    try {
      await query(`
        ALTER TABLE users ADD COLUMN google_picture VARCHAR(500);
      `);
      console.log('✅ Added google_picture column');
    } catch (e) {
      if (e.code === '42701') {
        console.log('ℹ️ google_picture column already exists');
      } else {
        throw e;
      }
    }

    // 3. Add auth_provider column
    try {
      await query(`
        ALTER TABLE users ADD COLUMN auth_provider VARCHAR(50) DEFAULT 'local';
      `);
      console.log('✅ Added auth_provider column');
    } catch (e) {
      if (e.code === '42701') {
        console.log('ℹ️ auth_provider column already exists');
      } else {
        throw e;
      }
    }

    // 4. Create index for google_id
    try {
      await query(`
        CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
      `);
      console.log('✅ Created index for google_id');
    } catch (e) {
      console.log('ℹ️ Index already exists');
    }

    console.log('\n✨ Google OAuth columns added successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error adding columns:', err);
    process.exit(1);
  }
}

addGoogleColumns();
