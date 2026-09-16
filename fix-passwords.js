import crypto from 'crypto';
import mysql from 'mysql2/promise';

// Hash function - matches backend
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const testPassword = 'super123';
const hashedPassword = hashPassword(testPassword);

console.log(`Password: ${testPassword}`);
console.log(`SHA256 Hash: ${hashedPassword}`);

// Update database with correct hashes
async function updatePasswords() {
  const conn = await mysql.createConnection({
    host: 'srv1752.hstgr.io',
    port: 3306,
    user: 'u154384799_Aurum',
    password: 'Aurum2025',
    database: 'u154384799_Ahc'
  });

  console.log('\n[DB] Connected...\n');

  // Update all test users with the same password hash
  const sql = `UPDATE users SET password_hash = ? WHERE email LIKE '%@test.com' OR email LIKE '%@example.com'`;
  
  const [result] = await conn.execute(sql, [hashedPassword]);
  
  console.log(`[UPDATE] Modified ${result.affectedRows} users`);

  // Verify the update
  const [users] = await conn.query(`
    SELECT id, name, email, password_hash 
    FROM users 
    WHERE email LIKE '%@test.com' OR email LIKE '%@example.com'
    ORDER BY id
  `);

  console.log('\n[VERIFY] Password hashes updated:');
  users.forEach(user => {
    console.log(`  ID ${user.id}: ${user.email} - ${user.password_hash.substring(0, 16)}...`);
  });

  await conn.end();
  console.log('\n✅ All passwords updated successfully!\n');
}

console.log('[INIT] Starting password fix...\n');

updatePasswords()
  .then(() => {
    console.log('[SUCCESS] Done!');
    process.exit(0);
  })
  .catch(err => {
    console.error('[ERROR]', err.message);
    console.error(err.stack);
    process.exit(1);
  });
