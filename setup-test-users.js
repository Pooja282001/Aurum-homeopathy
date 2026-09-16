import mysql from 'mysql2/promise';
import crypto from 'crypto';

const pool = mysql.createPool({
  host: 'srv1752.hstgr.io',
  user: 'u154384799_Aurum',
  password: 'Aurum2025',
  database: 'u154384799_Ahc',
});

async function setup() {
  try {
    const connection = await pool.getConnection();
    
    // First, check existing users
    console.log('[INFO] Checking existing users...\n');
    const [existingUsers] = await connection.execute('SELECT id, name, email, role FROM users LIMIT 10');
    console.log('Current users in database:');
    existingUsers.forEach(u => {
      console.log(`  - ${u.email} (${u.role})`);
    });
    console.log('');
    
    // Clear old test users if they exist
    console.log('[INFO] Clearing old test users...');
    await connection.execute('DELETE FROM users WHERE email IN (?, ?, ?, ?, ?)', 
      ['admin@test.com', 'doctor@test.com', 'nurse@test.com', 'patient@test.com', 'superadmin@test.com']);
    
    // Create new test users with proper hashes
    const testUsers = [
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
      },
      {
        name: 'Nurse Staff',
        email: 'nurse@test.com',
        password: 'nurse123',
        role: 'nurse'
      },
      {
        name: 'Patient User',
        email: 'patient@test.com',
        password: 'patient123',
        role: 'patient'
      }
    ];
    
    console.log('[INFO] Creating new test users with proper password hashes...\n');
    
    for (const user of testUsers) {
      const passwordHash = crypto.createHash('sha256').update(user.password).digest('hex');
      
      await connection.execute(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [user.name, user.email, passwordHash, user.role]
      );
      
      console.log(`[SUCCESS] Created ${user.role.toUpperCase()}:`);
      console.log(`    Email: ${user.email}`);
      console.log(`    Password: ${user.password}`);
      console.log(`    Hash: ${passwordHash}\n`);
    }
    
    // Verify they were created
    const [newUsers] = await connection.execute('SELECT email, role FROM users WHERE email LIKE ?', ['%@test.com%']);
    console.log('\n[VERIFY] Total test users created: ' + newUsers.length);
    
    connection.release();
    process.exit(0);
    
  } catch (error) {
    console.error('[ERROR]', error.message);
    process.exit(1);
  }
}

setup();
