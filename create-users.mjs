// Quick test of login endpoint
const testCredentials = [
  { email: 'superadmin@test.com', password: 'super123', role: 'super_admin' },
  { email: 'admin@test.com', password: 'admin123', role: 'admin' },
  { email: 'doctor@test.com', password: 'doctor123', role: 'doctor' },
  { email: 'nurse@test.com', password: 'nurse123', role: 'nurse' },
  { email: 'patient@test.com', password: 'patient123', role: 'patient' }
];

console.log('TEST CREDENTIALS FOR LOGIN:');
console.log('================================================\n');

testCredentials.forEach((cred, index) => {
  console.log(`${index + 1}. ${cred.role.toUpperCase()}`);
  console.log(`   Email: ${cred.email}`);
  console.log(`   Password: ${cred.password}`);
  console.log(`   Role: ${cred.role}`);
  console.log('');
});

console.log('================================================');
console.log('\nIMPORTANT: These users must be created first!');
console.log('Check the database to see current users.\n');

// Try to connect and create users
import mysql from 'mysql2/promise';
import crypto from 'crypto';

async function createUsers() {
  try {
    const pool = mysql.createPool({
      host: 'srv1752.hstgr.io',
      user: 'u154384799_Aurum',
      password: 'Aurum2025',
      database: 'u154384799_Ahc',
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0
    });
    
    const connection = await pool.getConnection();
    
    console.log('[*] Connected to database\n');
    
    // Check what's already there
    const [existing] = await connection.execute(
      'SELECT email, role FROM users WHERE email LIKE ?',
      ['%@test.com%']
    );
    
    if (existing.length > 0) {
      console.log('Found existing test users:');
      existing.forEach(u => console.log(`  - ${u.email} (${u.role})`));
      console.log('');
      connection.release();
      pool.end();
      process.exit(0);
    }
    
    console.log('[*] Creating test users...\n');
    
    // Create each user
    for (const cred of testCredentials) {
      const hash = crypto.createHash('sha256').update(cred.password).digest('hex');
      
      await connection.execute(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [
          cred.role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          cred.email,
          hash,
          cred.role
        ]
      );
      console.log(`[SUCCESS] Created ${cred.email}`);
    }
    
    console.log('\n[SUCCESS] All test users created!');
    console.log('\nNow try logging in with these credentials at http://localhost:5174/');
    
    connection.release();
    pool.end();
    
  } catch (error) {
    console.error('[ERROR]', error.message);
  }
  
  process.exit(0);
}

createUsers();
