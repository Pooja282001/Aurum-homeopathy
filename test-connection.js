console.log('Starting...');

const mysql = require('mysql2/promise');

async function test() {
  try {
    console.log('Creating pool...');
    const pool = mysql.createPool({
      host: 'srv1752.hstgr.io',
      port: 3306,
      user: 'u154384799_Aurum',
      password: 'Aurum2025',
      database: 'u154384799_Ahc'
    });

    console.log('Getting connection...');
    const conn = await pool.getConnection();
    console.log('Connected!');

    const result = await conn.query('SELECT 1 as test');
    console.log('Query result:', result[0]);

    conn.release();
    pool.end();
    console.log('Done!');
  } catch (e) {
    console.error('ERROR:', e.message);
  }
}

test();
