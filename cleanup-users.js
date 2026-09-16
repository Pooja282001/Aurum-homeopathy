const mysql = require('mysql2/promise');

async function cleanupAndRecreate() {
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
    
    // Delete old test users (IDs 5-9)
    await connection.execute('DELETE FROM users WHERE id IN (5, 6, 7, 8, 9)');
    console.log('✓ Deleted old test users');

    // Get crypto for hashing
    const crypto = require('crypto');
    
    // Create new test users with correct roles
    const testUsers = [
      { name: 'Super Admin User', email: 'superadmin@test.com', password: 'super123', role: 'super_admin' },
      { name: 'Admin User', email: 'admin@test.com', password: 'admin123', role: 'admin' },
      { name: 'Dr. Shelke', email: 'doctor@test.com', password: 'doctor123', role: 'doctor' },
      { name: 'Nurse Staff', email: 'nurse@test.com', password: 'nurse123', role: 'nurse' },
      { name: 'Patient User', email: 'patient@test.com', password: 'patient123', role: 'patient' }
    ];

    for (const user of testUsers) {
      const passwordHash = crypto.createHash('sha256').update(user.password).digest('hex');
      await connection.execute(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [user.name, user.email, passwordHash, user.role]
      );
      console.log(`✓ Created ${user.role}: ${user.email}`);
    }

    connection.release();
    console.log('\n✓ Test users recreated with correct roles!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

cleanupAndRecreate();
