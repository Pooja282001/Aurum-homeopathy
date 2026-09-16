const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: 'srv1752.hstgr.io',
      user: 'u154384799_Aurum',
      password: 'Aurum2025',
      database: 'u154384799_Ahc'
    });

    console.log('🔄 Updating test user roles...\n');

    // Update roles for test users
    const updates = [
      { email: 'superadmin@test.com', role: 'super_admin' },
      { email: 'admin@test.com', role: 'admin' },
      { email: 'doctor@test.com', role: 'doctor' },
      { email: 'nurse@test.com', role: 'nurse' },
      { email: 'patient@test.com', role: 'patient' }
    ];

    for (const {email, role} of updates) {
      const [result] = await conn.execute(
        'UPDATE users SET role = ? WHERE email = ?',
        [role, email]
      );
      console.log(`✓ ${email} → ${role}`);
    }

    // Verify the updates
    console.log('\n📋 Verification:');
    const [users] = await conn.execute(
      'SELECT id, email, role FROM users WHERE email IN (?, ?, ?, ?, ?)',
      ['superadmin@test.com', 'admin@test.com', 'doctor@test.com', 'nurse@test.com', 'patient@test.com']
    );
    
    console.table(users);

    await conn.end();
    console.log('\n✅ All roles updated successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
