import mysql from 'mysql2/promise.js';
import fs from 'fs';

const logFile = './rbac-setup.log';
const log = (msg) => {
  const line = new Date().toISOString() + ' | ' + msg + '\n';
  fs.appendFileSync(logFile, line);
  console.log(msg);
};

const config = {
  host: 'srv1752.hstgr.io',
  user: 'u154384799_Aurum',
  password: 'Aurum2025',
  database: 'u154384799_Ahc',
};

async function setupRBAC() {
  // Clear log file
  fs.writeFileSync(logFile, '');
  
  let conn;
  try {
    log('Connecting to database...');
    conn = await mysql.createConnection(config);
    log('✅ Connected');
    
    // Create tables
    log('Creating roles table...');
    await conn.execute(`DROP TABLE IF EXISTS role_permissions`);
    await conn.execute(`DROP TABLE IF EXISTS user_roles`);
    await conn.execute(`DROP TABLE IF EXISTS permissions`);
    await conn.execute(`DROP TABLE IF EXISTS roles`);
    
    await conn.execute(`
      CREATE TABLE roles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) UNIQUE NOT NULL,
        description VARCHAR(255)
      )
    `);
    log('✅ Roles table created');
    
    log('Creating permissions table...');
    await conn.execute(`
      CREATE TABLE permissions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) UNIQUE NOT NULL,
        description VARCHAR(255),
        category VARCHAR(50)
      )
    `);
    log('✅ Permissions table created');
    
    log('Creating role_permissions table...');
    await conn.execute(`
      CREATE TABLE role_permissions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        role_id INT,
        permission_id INT,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
      )
    `);
    log('✅ Role permissions table created');
    
    log('Creating user_roles table...');
    await conn.execute(`
      CREATE TABLE user_roles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        role_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
      )
    `);
    log('✅ User roles table created');
    
    // Insert data
    log('\nInserting roles...');
    await conn.execute(`INSERT INTO roles (name, description) VALUES
      ('super_admin', 'Full system control'),
      ('admin', 'Admin dashboard'),
      ('doctor', 'Doctor portal'),
      ('nurse', 'Nurse portal'),
      ('patient', 'Patient portal')
    `);
    log('✅ 5 roles inserted');
    
    log('Inserting permissions...');
    await conn.execute(`INSERT INTO permissions (name, description, category) VALUES
      ('manage_users', 'Create, edit, delete', 'users'),
      ('view_users', 'View users', 'users'),
      ('manage_appointments', 'Manage appointments', 'appointments'),
      ('view_appointments', 'View appointments', 'appointments'),
      ('book_appointments', 'Book appointments', 'appointments'),
      ('enable_maintenance', 'Maintenance mode', 'system'),
      ('view_system', 'View system', 'system')
    `);
    log('✅ 7 permissions inserted');
    
    // Verify
    const [roles] = await conn.execute('SELECT * FROM roles');
    const [perms] = await conn.execute('SELECT * FROM permissions');
    const [users] = await conn.execute('SELECT id FROM users LIMIT 5');
    
    log(`\n📊 VERIFICATION:`);
    log(`Roles in DB: ${roles.length}`);
    log(`Permissions in DB: ${perms.length}`);
    log(`Users in DB: ${users.length}`);
    
    log('\n✅ RBAC SETUP COMPLETE!');
    
  } catch (err) {
    log('❌ ERROR: ' + err.message);
  } finally {
    if (conn) await conn.end();
    log('\nLog file saved to: ' + logFile);
  }
}

setupRBAC();
