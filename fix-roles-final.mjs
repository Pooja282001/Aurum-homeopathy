import mysql from 'mysql2/promise.js';

const connection = await mysql.createConnection({
  host: 'srv1752.hstgr.io',
  port: 3306,
  user: 'u154384799_Aurum',
  password: 'Aurum2025',
  database: 'u154384799_Ahc'
});

console.log('🔄 Fixing user roles in database...\n');

try {
  // Fix User 5: superadmin@test.com
  await connection.execute(
    'UPDATE users SET role = ? WHERE id = ?',
    ['super_admin', 5]
  );
  console.log('✅ User 5 (superadmin@test.com) → role: super_admin');

  // Fix User 6: admin@test.com
  await connection.execute(
    'UPDATE users SET role = ? WHERE id = ?',
    ['admin', 6]
  );
  console.log('✅ User 6 (admin@test.com) → role: admin');

  // Fix User 7: doctor@test.com
  await connection.execute(
    'UPDATE users SET role = ? WHERE id = ?',
    ['doctor', 7]
  );
  console.log('✅ User 7 (doctor@test.com) → role: doctor');

  // Verify the changes
  const [users] = await connection.execute('SELECT id, name, email, role FROM users WHERE id IN (5, 6, 7)');
  
  console.log('\n📋 VERIFICATION - Roles Updated:\n');
  users.forEach(user => {
    const icon = user.role === 'super_admin' ? '👑' : user.role === 'admin' ? '⚙️' : '👨‍⚕️';
    console.log(`${icon} ID ${user.id}: ${user.email} → role: ${user.role}`);
  });

  console.log('\n✅ All roles fixed successfully!\n');
  
} catch (error) {
  console.error('❌ Error:', error.message);
}

await connection.end();
