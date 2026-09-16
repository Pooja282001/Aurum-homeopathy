// Complete Database Rebuild Script
// Drops and recreates all tables with test data

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

console.log('[INIT] Starting database rebuild...');

// Database configuration for Hostinger
const pool = mysql.createPool({
  host: 'srv1752.hstgr.io',
  port: 3306,
  user: 'u154384799_Aurum',
  password: 'Aurum2025',
  database: 'u154384799_Ahc',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log('[INIT] Pool created, getting connection...');

async function rebuildDatabase() {
  let connection;
  try {
    console.log('[INIT] Attempting to connect to database...');
    connection = await pool.getConnection();
    console.log('[DB] ✅ Connected to Hostinger database');
    
    console.log('\n' + '='.repeat(80));
    console.log('  COMPLETE DATABASE REBUILD');
    console.log('  Dropping & Recreating All Tables');
    console.log('='.repeat(80) + '\n');

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'complete-database-rebuild.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Split queries and filter empty ones
    const queries = sqlContent
      .split(';')
      .map(q => q.trim())
      .filter(q => q && !q.startsWith('--'));

    let queryCount = 0;
    const startTime = Date.now();

    // Execute each query
    for (const query of queries) {
      if (query.length > 0) {
        try {
          console.log(`\n[${queryCount + 1}/${queries.length}] Executing: ${query.substring(0, 60)}...`);
          await connection.query(query);
          console.log('✅ Success');
          queryCount++;
        } catch (error) {
          console.error('❌ Error:', error.message);
        }
      }
    }

    const duration = Date.now() - startTime;

    // ========================================
    // VERIFICATION QUERIES
    // ========================================
    console.log('\n' + '='.repeat(80));
    console.log('  VERIFICATION - SHOWING ALL DATA');
    console.log('='.repeat(80) + '\n');

    // 1. Show Users
    console.log('\n📋 ALL USERS:');
    const users = await connection.query('SELECT id, name, email FROM users ORDER BY id');
    console.table(users[0]);

    // 2. Show Roles
    console.log('\n📋 ALL ROLES:');
    const roles = await connection.query('SELECT id, name, description FROM roles ORDER BY id');
    console.table(roles[0]);

    // 3. Show Permissions
    console.log('\n📋 ALL PERMISSIONS:');
    const permissions = await connection.query('SELECT id, name, category FROM permissions ORDER BY category, name');
    console.table(permissions[0]);

    // 4. Show User Roles Mapping
    console.log('\n📋 USER ROLES MAPPING:');
    const userRoles = await connection.query(`
      SELECT u.id, u.name, u.email, r.name as role
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      ORDER BY u.id
    `);
    console.table(userRoles[0]);

    // 5. Show Role Permissions Mapping
    console.log('\n📋 ROLE PERMISSIONS MAPPING:');
    const rolePerms = await connection.query(`
      SELECT r.id, r.name as role, GROUP_CONCAT(p.name SEPARATOR ', ') as permissions
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      GROUP BY r.id, r.name
      ORDER BY r.id
    `);
    console.table(rolePerms[0]);

    // 6. Show Appointments
    console.log('\n📋 ALL APPOINTMENTS:');
    const appointments = await connection.query('SELECT id, name, email, phone, date, time_slot, service, status FROM appointments ORDER BY id');
    console.table(appointments[0]);

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('  ✅ DATABASE REBUILD COMPLETE');
    console.log('='.repeat(80));
    console.log(`\nExecuted: ${queryCount} queries in ${duration}ms\n`);

    // Count records
    const counts = await connection.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM roles) as roles,
        (SELECT COUNT(*) FROM permissions) as permissions,
        (SELECT COUNT(*) FROM user_roles) as user_roles,
        (SELECT COUNT(*) FROM role_permissions) as role_permissions,
        (SELECT COUNT(*) FROM appointments) as appointments
    `);

    console.log('📊 RECORD COUNTS:');
    console.log(`   Users: ${counts[0][0].users}`);
    console.log(`   Roles: ${counts[0][0].roles}`);
    console.log(`   Permissions: ${counts[0][0].permissions}`);
    console.log(`   User Roles: ${counts[0][0].user_roles}`);
    console.log(`   Role Permissions: ${counts[0][0].role_permissions}`);
    console.log(`   Appointments: ${counts[0][0].appointments}`);

    console.log('\n🔐 TEST CREDENTIALS:');
    console.log('   Super Admin: superadmin@test.com / password: super123');
    console.log('   Admin: admin@test.com / password: super123');
    console.log('   Doctor: doctor@test.com / password: super123');
    console.log('   Nurse: nurse@test.com / password: super123');
    console.log('   Patient: patient@test.com / password: super123\n');

  } catch (error) {
    console.error('❌ Fatal Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    console.log('[CLEANUP] Releasing connection and closing pool...');
    if (connection) connection.release();
    await pool.end();
    console.log('[CLEANUP] Pool closed');
    process.exit(0);
  }
}

console.log('[MAIN] Calling rebuildDatabase()...');
rebuildDatabase().catch(err => {
  console.error('[MAIN] Uncaught error:', err);
  process.exit(1);
});
