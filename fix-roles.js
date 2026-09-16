const mysql = require('mysql2/promise');

async function fixRoles() {
  const pool = mysql.createPool({
    host: 'srv1752.hstgr.io',
    user: 'u154384799_Aurum',
    password: 'Aurum2025',
    database: 'u154384799_Ahc',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    port: 3306,
  });

  try {
    const connection = await pool.getConnection();
    
    const updates = [
      { id: 5, role: 'super_admin' },
      { id: 6, role: 'admin' },
      { id: 7, role: 'doctor' },
      { id: 8, role: 'nurse' },
      { id: 9, role: 'patient' }
    ];

    for (const update of updates) {
      await connection.execute('UPDATE users SET role = ? WHERE id = ?', [update.role, update.id]);
      console.log(`✓ Updated user ${update.id} to role: ${update.role}`);
    }

    connection.release();
    console.log('\n✓ All roles updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

fixRoles();
