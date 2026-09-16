const mysql = require('mysql2/promise');
const crypto = require('crypto');

async function fixUsers() {
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
    
    // First, let's verify current state
    const [currentUsers] = await connection.execute('SELECT id, email, role FROM users WHERE id IN (5, 6, 7, 8, 9)');
    console.log('Current users before update:');
    currentUsers.forEach(u => console.log(`  ID ${u.id}: ${u.email} = ${u.role}`));
    
    // Update each user individually
    const roleMap = {
      5: 'super_admin',
      6: 'admin',
      7: 'doctor',
      8: 'nurse',
      9: 'patient'
    };

    for (const [userId, newRole] of Object.entries(roleMap)) {
      const [result] = await connection.execute(
        'UPDATE users SET role = ? WHERE id = ?',
        [newRole, userId]
      );
      console.log(`Updated user ${userId} to ${newRole}: ${result.changedRows} rows affected`);
    }

    // Verify after update
    const [updatedUsers] = await connection.execute('SELECT id, email, role FROM users WHERE id IN (5, 6, 7, 8, 9)');
    console.log('\nUpdated users after update:');
    updatedUsers.forEach(u => console.log(`  ID ${u.id}: ${u.email} = ${u.role}`));
    
    connection.release();
    console.log('\n✓ Complete!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

fixUsers();
