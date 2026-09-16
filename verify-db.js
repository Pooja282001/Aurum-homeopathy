import mysql from 'mysql2/promise';

async function verify() {
  const db = await mysql.createConnection({
    host: 'srv1752.hstgr.io',
    user: 'u154384799_Aurum',
    password: 'Aurum2025',
    database: 'u154384799_Ahc'
  });

  console.log('\n✅ DATABASE CHECK');
  const [appts] = await db.query('SELECT COUNT(*) as total FROM appointments');
  console.log(`Total Appointments: ${appts[0].total}`);
  
  const [latest] = await db.query('SELECT id, name, email, date, time_slot FROM appointments ORDER BY id DESC LIMIT 1');
  if (latest.length > 0) {
    const a = latest[0];
    console.log(`\nLatest: [ID ${a.id}] ${a.name} | ${a.email} | ${a.date}\n`);
  }
  
  await db.end();
}

verify();
