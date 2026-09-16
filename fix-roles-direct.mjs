import mysql from 'mysql2/promise';
import crypto from 'crypto';

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

    // Delete all users
    console.log('🗑️  Deleting all users...');
    const [deleteRes] = await conn.execute('DELETE FROM users');
    console.log(`✓ Deleted ${deleteRes.affectedRows} users\n`);

    // Create 3 users with correct roles
    console.log('👤 Creating 3 test users:\n');
    const users = [
      { name: 'Super Admin', email: 'superadmin@test.com', password: 'super123', role: 'super_admin' },
      { name: 'Admin User', email: 'admin@test.com', password: 'admin123', role: 'admin' },
      { name: 'Dr. Shelke', email: 'doctor@test.com', password: 'doctor123', role: 'doctor' }
    ];

    for (const user of users) {
      const hash = hashPassword(user.password);
      const [res] = await conn.execute(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [user.name, user.email, hash, user.role]
      );
      console.log(`✓ ${user.role.toUpperCase()}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Pass: ${user.password}\n`);
    }

    // Verify
    console.log('✅ VERIFICATION:\n');
    const [users_] = await conn.execute('SELECT id, name, email, role FROM users ORDER BY id');
    users_.forEach((u, i) => {
      console.log(`${i + 1}. ${u.name} (${u.role})`);
      console.log(`   ${u.email}\n`);
    });

    await conn.end();
    console.log('🎉 Setup complete!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
