import mysql from 'mysql2/promise';

async function checkAppointments() {
  try {
    const connection = await mysql.createConnection({
      host: 'srv1752.hstgr.io',
      user: 'u154384799_Aurum',
      password: 'Aurum2025',
      database: 'u154384799_Ahc'
    });
    
    console.log('🔍 CHECKING DATABASE FOR APPOINTMENTS\n');

    const [appts] = await connection.query(
      'SELECT id, name, email, phone, date, time_slot, status, created_at FROM appointments ORDER BY created_at DESC'
    );
    
    console.log(`📊 Total Appointments: ${appts.length}\n`);
    console.log('All Appointments:');
    console.log('================');
    
    appts.forEach((a, idx) => {
      console.log(`\n${idx + 1}. ID: ${a.id}`);
      console.log(`   Name: ${a.name}`);
      console.log(`   Email: ${a.email}`);
      console.log(`   Phone: ${a.phone}`);
      console.log(`   Date: ${a.date}`);
      console.log(`   Time: ${a.time_slot}`);
      console.log(`   Status: ${a.status}`);
      console.log(`   Created: ${a.created_at}`);
    });

    await connection.end();

  } catch (err) {
    console.error('❌ ERROR:', err.message);
  }
}

checkAppointments();
