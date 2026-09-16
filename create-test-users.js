import mysql from 'mysql2/promise';
import crypto from 'crypto';

const pool = mysql.createPool({
  host: 'srv1752.hstgr.io',
  user: 'u154384799_Aurum',
  password: 'Aurum2025',
  database: 'u154384799_Ahc',
});

async function createTestUsers() {
  try {
    const connection = await pool.getConnection();
    
    // Create a super admin user
    const adminPassword = 'admin123';
    const adminHash = crypto.createHash('sha256').update(adminPassword).digest('hex');
    
    await connection.execute(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Admin User', 'admin@example.com', adminHash, 'super_admin']
    );
    console.log('✅ Created: admin@example.com / admin123 (Super Admin)');
    
    // Create a doctor user
    const doctorPassword = 'doctor123';
    const doctorHash = crypto.createHash('sha256').update(doctorPassword).digest('hex');
    
    await connection.execute(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Dr. Shelke', 'shelke@example.com', doctorHash, 'doctor']
    );
    console.log('✅ Created: shelke@example.com / doctor123 (Doctor)');
    
    // Create a nurse user
    const nursePassword = 'nurse123';
    const nurseHash = crypto.createHash('sha256').update(nursePassword).digest('hex');
    
    await connection.execute(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Nurse Staff', 'nurse@example.com', nurseHash, 'nurse']
    );
    console.log('✅ Created: nurse@example.com / nurse123 (Nurse)');
    
    connection.release();
    
    console.log('\n📋 Test Credentials Created:');
    console.log('  Admin: admin@example.com / admin123 (Can create users)');
    console.log('  Doctor: shelke@example.com / doctor123 (Can review appointments)');
    console.log('  Nurse: nurse@example.com / nurse123 (View only)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestUsers();
