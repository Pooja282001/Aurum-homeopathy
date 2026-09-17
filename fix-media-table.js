import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config({ path: '.env.local' });
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'u154384799_Aurum',
  password: process.env.DB_PASS || 'Aurum2025',
  database: process.env.DB_NAME || 'u154384799_Ahc',
  port: process.env.DB_PORT || 3306
});

async function fixMediaTable() {
  let conn;
  try {
    conn = await pool.getConnection();
    
    console.log('🔍 Checking media table schema...');
    
    // Get current columns
    const [columns] = await conn.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'media' AND TABLE_SCHEMA = 'u154384799_Ahc'
    `);
    
    const columnNames = columns.map(c => c.COLUMN_NAME);
    console.log('Current columns:', columnNames);
    
    // Check if description column exists
    if (!columnNames.includes('description')) {
      console.log('➕ Adding description column...');
      await conn.execute(`
        ALTER TABLE media ADD COLUMN description LONGTEXT AFTER title
      `);
      console.log('✅ Description column added');
    }
    
    // Check if is_featured column exists
    if (!columnNames.includes('is_featured')) {
      console.log('➕ Adding is_featured column...');
      await conn.execute(`
        ALTER TABLE media ADD COLUMN is_featured BOOLEAN DEFAULT FALSE
      `);
      console.log('✅ is_featured column added');
    }
    
    // Check if thumbnail_url exists
    if (!columnNames.includes('thumbnail_url')) {
      console.log('➕ Adding thumbnail_url column...');
      await conn.execute(`
        ALTER TABLE media ADD COLUMN thumbnail_url TEXT AFTER url
      `);
      console.log('✅ thumbnail_url column added');
    }
    
    // Check if display_order exists
    if (!columnNames.includes('display_order')) {
      console.log('➕ Adding display_order column...');
      await conn.execute(`
        ALTER TABLE media ADD COLUMN display_order INT DEFAULT 0
      `);
      console.log('✅ display_order column added');
    }
    
    // Check if created_by exists
    if (!columnNames.includes('created_by')) {
      console.log('➕ Adding created_by column...');
      await conn.execute(`
        ALTER TABLE media ADD COLUMN created_by INT UNSIGNED
      `);
      console.log('✅ created_by column added');
    }
    
    console.log('\n✅ Media table migration completed successfully!');
    conn.release();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (conn) conn.release();
    process.exit(1);
  }
}

fixMediaTable();
