import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'srv1752.hstgr.io',
  user: 'u154384799_Aurum',
  password: 'Aurum2025',
  database: 'u154384799_Ahc',
});

try {
  const connection = await pool.getConnection();
  const [users] = await connection.query('SELECT id, name, email, role FROM users');
  connection.release();
  
  console.log('\n=== USERS IN DATABASE ===');
  users.forEach(user => {
    console.log(`ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
  });
  
  process.exit(0);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
