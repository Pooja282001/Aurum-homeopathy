import mysql from 'mysql2/promise';

async function test() {
  try {
    const connection = await mysql.createConnection({
      host: 'srv1752.hstgr.io',
      user: 'u154384799_Aurum',
      password: 'Aurum2025',
      database: 'u154384799_Ahc'
    });
    
    console.log('✅ CONNECTION SUCCESSFUL\n');

    // Get users
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    console.log(`📊 Total Users: ${users[0].count}`);

    // Get appointments
    const [appts] = await connection.query('SELECT COUNT(*) as count FROM appointments');
    console.log(`📅 Total Appointments: ${appts[0].count}`);

    // List users
    const [userList] = await connection.query('SELECT id, name, email, role FROM users');
    console.log('\n👥 Users:');
    userList.forEach(u => console.log(`   ${u.id}. ${u.name} (${u.role})`));

    // List recent appointments
    const [apptList] = await connection.query('SELECT id, name, email, status FROM appointments ORDER BY created_at DESC LIMIT 3');
    console.log('\n📅 Recent Appointments:');
    apptList.forEach(a => console.log(`   ${a.id}. ${a.name} - Status: ${a.status}`));

    console.log('\n✅ ALL TESTS PASSED - DATABASE IS WORKING!\n');
    await connection.end();

  } catch (err) {
    console.error('❌ ERROR:', err.message);
  }
}

test();
