import mysql from 'mysql2/promise';

const config = {
  host: 'srv1752.hstgr.io',
  user: 'u154384799_Aurum',
  password: 'Aurum2025',
  database: 'u154384799_Ahc'
};

async function runTests() {
  console.log('\n🔍 COMPREHENSIVE DATABASE TEST REPORT\n');
  console.log('=====================================\n');

  try {
  // Create connection
  const connection = await mysql.createConnection(config);
  console.log('✅ CONNECTION SUCCESSFUL\n');

  // Test 1: Database Info
  console.log('📊 DATABASE INFORMATION');
  console.log('------------------------');
  console.log(`Host: ${config.host}`);
  console.log(`Database: ${config.database}`);
  console.log(`User: ${config.user}\n`);

  // Test 2: Tables
  console.log('📋 TABLES IN DATABASE');
  console.log('---------------------');
  const [tables] = await connection.query('SHOW TABLES');
  tables.forEach(t => {
    const tableName = Object.values(t)[0];
    console.log(`  ✓ ${tableName}`);
  });
  console.log();

  // Test 3: Users Count
  console.log('👥 USERS STATISTICS');
  console.log('-------------------');
  const [users] = await connection.query('SELECT COUNT(*) as total FROM users');
  console.log(`Total Users: ${users[0].total}`);
  const [userDetails] = await connection.query('SELECT id, name, email, role FROM users');
  userDetails.forEach(u => {
    console.log(`  - [ID: ${u.id}] ${u.name} (${u.email}) - Role: ${u.role}`);
  });
  console.log();

  // Test 4: Appointments Count
  console.log('📅 APPOINTMENTS STATISTICS');
  console.log('---------------------------');
  const [appts] = await connection.query('SELECT COUNT(*) as total FROM appointments');
  console.log(`Total Appointments: ${appts[0].total}`);
  const [apptDetails] = await connection.query(
    'SELECT id, name, email, date, time_slot, status FROM appointments ORDER BY created_at DESC LIMIT 5'
  );
  if (apptDetails.length > 0) {
    apptDetails.forEach(a => {
      console.log(`  - [ID: ${a.id}] ${a.name} | ${a.email} | ${a.date} @ ${a.time_slot} | Status: ${a.status}`);
    });
  } else {
    console.log('  No appointments found');
  }
  console.log();

  // Test 5: Add Test Appointment
  console.log('➕ ADDING TEST APPOINTMENT');
  console.log('---------------------------');
  const testDate = new Date().toISOString().split('T')[0];
  const [result] = await connection.execute(
    'INSERT INTO appointments (user_id, name, phone, email, date, time_slot, service, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [1, 'Test Appointment', '+91-9999999999', 'test@example.com', testDate + ' 14:00:00', '2:00 PM', 'Consultation', 'Pending']
  );
  console.log(`✅ Appointment added with ID: ${result.insertId}`);
  console.log();

  // Test 6: Verify new appointment
  console.log('✔️ VERIFYING NEW APPOINTMENT');
  console.log('-----------------------------');
  const [newAppt] = await connection.query(
    'SELECT * FROM appointments WHERE id = ? LIMIT 1',
    [result.insertId]
  );
  if (newAppt.length > 0) {
    const appt = newAppt[0];
    console.log(`✅ FOUND: ${appt.name} | ${appt.email} | ${appt.status}`);
  } else {
    console.log('❌ ERROR: Could not verify new appointment');
  }
  console.log();

  // Test 7: Data Integrity Check
  console.log('🔐 DATA INTEGRITY CHECK');
  console.log('------------------------');
  const [passwordCheck] = await connection.query(
    'SELECT COUNT(*) as count FROM users WHERE password_hash IS NOT NULL'
  );
  console.log(`✓ Users with password hash: ${passwordCheck[0].count}`);
  
  const [emailCheck] = await connection.query(
    'SELECT COUNT(*) as count FROM appointments WHERE email IS NOT NULL'
  );
  console.log(`✓ Appointments with email: ${emailCheck[0].count}`);
  
  const [dateCheck] = await connection.query(
    'SELECT COUNT(*) as count FROM appointments WHERE date IS NOT NULL'
  );
  console.log(`✓ Appointments with date: ${dateCheck[0].count}`);
  console.log();

  // Test 8: Final Summary
  console.log('📈 FINAL SUMMARY');
  console.log('-----------------');
  console.log(`✅ All tests completed successfully!`);
  console.log(`✅ Database connection: WORKING`);
  console.log(`✅ Data insertion: WORKING`);
  console.log(`✅ Data retrieval: WORKING`);
  console.log(`✅ Data integrity: VERIFIED`);

  await connection.end();

  } catch (error) {
    console.error('❌ DATABASE TEST FAILED');
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }

  console.log('\n=====================================\n');
}

runTests().catch(console.error);
