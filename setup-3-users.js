const mysql = require('mysql2/promise');
const crypto = require('crypto');

// Hash password using SHA256
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

(async () => {
  try {
    console.log('🔌 Connecting to database...\n');
    const conn = await mysql.createConnection({
      host: 'srv1752.hstgr.io',
      user: 'u154384799_Aurum',
      password: 'Aurum2025',
      database: 'u154384799_Ahc'
    });

    // Step 1: Delete all users
    console.log('🗑️  Deleting all users...');
    const [deleteResult] = await conn.execute('DELETE FROM users');
    console.log(`✓ Deleted ${deleteResult.affectedRows} users\n`);

    // Step 2: Create 3 new users with correct roles
    console.log('👤 Creating 3 new users with correct roles...\n');
    
    const users = [
      {
        name: 'Super Admin User',
        email: 'superadmin@test.com',
        password: 'super123',
        role: 'super_admin'
      },
      {
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        name: 'Dr. Shelke',
        email: 'doctor@test.com',
        password: 'doctor123',
        role: 'doctor'
      }
    ];

    for (const user of users) {
      const passwordHash = hashPassword(user.password);
      const [result] = await conn.execute(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [user.name, user.email, passwordHash, user.role]
      );
      console.log(`✓ Created: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  ID: ${result.insertId}\n`);
    }

    // Step 3: Verify all users
    console.log('📋 Verification - All users in database:');
    const [allUsers] = await conn.execute(
      'SELECT id, name, email, role FROM users ORDER BY id'
    );
    
    console.table(allUsers);

    // Verify roles are correct
    console.log('\n✅ Role verification:');
    allUsers.forEach(u => {
      const expectedRole = 
        u.email === 'superadmin@test.com' ? 'super_admin' :
        u.email === 'admin@test.com' ? 'admin' :
        u.email === 'doctor@test.com' ? 'doctor' : 'unknown';
      
      const status = u.role === expectedRole ? '✓' : '✗';
      console.log(`${status} ${u.email}: ${u.role} (expected: ${expectedRole})`);
    });

    await conn.end();
    console.log('\n🎉 Setup complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
