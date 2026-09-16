const mysql = require('mysql2/promise');
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

(async () => {
  let conn;
  try {
    console.log('🔌 Connecting to database...');
    conn = await mysql.createConnection({
      host: 'srv1752.hstgr.io',
      user: 'u154384799_Aurum',
      password: 'Aurum2025',
      database: 'u154384799_Ahc'
    });
    console.log('✓ Connected\n');

    // Check current users
    console.log('📊 Current users before deletion:');
    let [beforeUsers] = await conn.execute('SELECT COUNT(*) as count FROM users');
    console.log(`  Total: ${beforeUsers[0].count} users\n`);

    // Try to delete with foreign key check
    console.log('🗑️  Deleting all users...');
    await conn.execute('SET FOREIGN_KEY_CHECKS=0');
    let [deleteResult] = await conn.execute('DELETE FROM users WHERE id > 0');
    await conn.execute('SET FOREIGN_KEY_CHECKS=1');
    console.log(`✓ Deleted ${deleteResult.affectedRows} users\n`);

    // Verify deletion
    [beforeUsers] = await conn.execute('SELECT COUNT(*) as count FROM users');
    console.log(`📊 Users remaining: ${beforeUsers[0].count}\n`);

    // Create new users
    console.log('👤 Creating 3 new users:\n');
    
    const users = [
      { name: 'Super Admin', email: 'superadmin@test.com', password: 'super123', role: 'super_admin' },
      { name: 'Admin', email: 'admin@test.com', password: 'admin123', role: 'admin' },
      { name: 'Doctor', email: 'doctor@test.com', password: 'doctor123', role: 'doctor' }
    ];

    for (const user of users) {
      const passwordHash = hashPassword(user.password);
      let [result] = await conn.execute(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [user.name, user.email, passwordHash, user.role]
      );
      console.log(`✓ ${user.role.toUpperCase()}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Pass: ${user.password}\n`);
    }

    // Final verification
    console.log('✅ FINAL VERIFICATION:\n');
    const [finalUsers] = await conn.execute('SELECT id, name, email, role FROM users ORDER BY id');
    finalUsers.forEach(u => {
      console.log(`ID ${u.id}: ${u.email}`);
      console.log(`  Name: ${u.name}`);
      console.log(`  Role: ${u.role}\n`);
    });

    console.log('🎉 Setup complete! All 3 users ready to test.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) console.error('Code:', error.code);
  } finally {
    if (conn) await conn.end();
  }
})();
