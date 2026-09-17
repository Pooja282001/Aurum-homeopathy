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

async function addUpdatedAtColumn() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('Adding updated_at column to media table...');
    
    try {
      await conn.execute(`
        ALTER TABLE media ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      `);
      console.log('✅ updated_at column added');
    } catch (e) {
      if (e.message.includes('Duplicate column')) {
        console.log('ℹ️ updated_at column already exists');
      } else {
        throw e;
      }
    }
    
    conn.release();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (conn) conn.release();
    process.exit(1);
  }
}

addUpdatedAtColumn();
