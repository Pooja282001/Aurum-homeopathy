const mysql = require('mysql2/promise');

(async () => {
  try {
    console.log('🔌 Connecting to database...');
    const conn = await mysql.createConnection({
      host: 'srv1752.hstgr.io',
      user: 'u154384799_Aurum',
      password: 'Aurum2025',
      database: 'u154384799_Ahc',
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0
    });

    console.log('✓ Connected!\n');

    const updates = [
      { id: 5, email: 'superadmin@test.com', role: 'super_admin' },
      { id: 6, email: 'admin@test.com', role: 'admin' },
      { id: 7, email: 'doctor@test.com', role: 'doctor' },
      { id: 8, email: 'nurse@test.com', role: 'nurse' },
      { id: 9, email: 'patient@test.com', role: 'patient' }
    ];

    console.log('🔄 Updating roles...');
    for (const {id, email, role} of updates) {
      try {
        const query = 'UPDATE users SET role = ? WHERE id = ?';
        const [result] = await conn.execute(query, [role, id]);
        console.log(`✓ ID ${id} (${email}): ${role} - Affected: ${result.affectedRows}`);
      } catch (e) {
        console.error(`✗ ID ${id} (${email}): ${e.message}`);
      }
    }

    console.log('\n📋 Verifying updates...');
    const [users] = await conn.execute(
      'SELECT id, email, role FROM users WHERE id IN (5, 6, 7, 8, 9) ORDER BY id'
    );
    
    users.forEach(u => {
      console.log(`  ID ${u.id}: ${u.email} → ${u.role}`);
    });

    await conn.end();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error);
    process.exit(1);
  }
})();
