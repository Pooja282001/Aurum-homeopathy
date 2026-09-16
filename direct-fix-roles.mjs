import mysql from 'mysql2/promise.js';

const config = {
  host: 'srv1752.hstgr.io',
  user: 'u154384799_Aurum',
  password: 'Aurum2025',
  database: 'u154384799_Ahc',
};

(async () => {
  console.log('🔌 Connecting to database...\n');
  
  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('✅ Connected!\n');

    // Update roles
    console.log('🔄 Updating roles...\n');
    
    const updates = [
      { id: 5, role: 'super_admin' },
      { id: 6, role: 'admin' },
      { id: 7, role: 'doctor' }
    ];

    for (const {id, role} of updates) {
      const [result] = await connection.execute(
        'UPDATE users SET role = ? WHERE id = ?',
        [role, id]
      );
      console.log(`✅ User ${id}: role → ${role} (affected: ${result.affectedRows})`);
    }

    // Verify
    console.log('\n📋 Verification - Current Roles:\n');
    const [users] = await connection.execute(
      'SELECT id, email, name, role FROM users WHERE id IN (5, 6, 7) ORDER BY id'
    );

    users.forEach(user => {
      const icon = user.role === 'super_admin' ? '👑' : user.role === 'admin' ? '⚙️' : '👨‍⚕️';
      console.log(`${icon} ID ${user.id}: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}\n`);
    });

    console.log('✅ All done! Roles should be fixed.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
})();
