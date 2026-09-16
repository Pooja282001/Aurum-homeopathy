import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execute = async () => {
  console.log('[INIT] Starting database rebuild...');
  
  const conn = await mysql.createConnection({
    host: 'srv1752.hstgr.io',
    port: 3306,
    user: 'u154384799_Aurum',
    password: 'Aurum2025',
    database: 'u154384799_Ahc',
    multipleStatements: true
  });

  console.log('[DB] ✅ Connected!');

  const sqlFile = path.join(__dirname, 'complete-database-rebuild.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');
  
  console.log('[SQL] Executing complete rebuild...');
  await conn.query(sql);
  
  console.log('[VERIFY] Checking results...');
  
  // Show counts
  const [counts] = await conn.query(`
    SELECT 
      (SELECT COUNT(*) FROM users) as users,
      (SELECT COUNT(*) FROM roles) as roles,
      (SELECT COUNT(*) FROM permissions) as permissions,
      (SELECT COUNT(*) FROM user_roles) as user_roles,
      (SELECT COUNT(*) FROM role_permissions) as role_permissions,
      (SELECT COUNT(*) FROM appointments) as appointments
  `);

  console.log('\n✅ DATABASE REBUILD COMPLETE!\n');
  console.log('📊 Record Counts:');
  console.log(`   Users: ${counts[0].users}`);
  console.log(`   Roles: ${counts[0].roles}`);
  console.log(`   Permissions: ${counts[0].permissions}`);
  console.log(`   User Roles: ${counts[0].user_roles}`);
  console.log(`   Role Permissions: ${counts[0].role_permissions}`);
  console.log(`   Appointments: ${counts[0].appointments}`);
  
  console.log('\n🔐 TEST CREDENTIALS:');
  console.log('   Super Admin: superadmin@test.com');
  console.log('   Admin: admin@test.com');
  console.log('   Doctor: doctor@test.com');
  console.log('   Nurse: nurse@test.com');
  console.log('   Patient: patient@test.com');
  console.log('   Password (all): super123\n');

  await conn.end();
  console.log('[DONE] ✅ All done!');
};

execute().catch(err => {
  console.error('[ERROR]', err.message);
  process.exit(1);
});
