import mysql from 'mysql2/promise.js';

const config = {
  host: 'srv1752.hstgr.io',
  user: 'u154384799_Aurum',
  password: 'Aurum2025',
  database: 'u154384799_Ahc',
};

async function setupRBAC() {
  let conn;
  try {
    conn = await mysql.createConnection(config);
    
    // Step 1: Create roles table
    await conn.execute(`DROP TABLE IF EXISTS role_permissions`);
    await conn.execute(`DROP TABLE IF EXISTS user_roles`);
    await conn.execute(`DROP TABLE IF EXISTS permissions`);
    await conn.execute(`DROP TABLE IF EXISTS roles`);
    
    await conn.execute(`
      CREATE TABLE roles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) UNIQUE NOT NULL,
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Step 2: Create permissions table
    await conn.execute(`
      CREATE TABLE permissions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) UNIQUE NOT NULL,
        description VARCHAR(255),
        category VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Step 3: Create role_permissions table
    await conn.execute(`
      CREATE TABLE role_permissions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        role_id INT NOT NULL,
        permission_id INT NOT NULL,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
        UNIQUE KEY unique_role_permission (role_id, permission_id)
      )
    `);
    
    // Step 4: Create user_roles table
    await conn.execute(`
      CREATE TABLE user_roles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        role_id INT NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_role (user_id, role_id)
      )
    `);
    
    // Step 5: Insert roles
    await conn.execute(`INSERT INTO roles (name, description) VALUES
      ('super_admin', 'Full system control'),
      ('admin', 'Admin dashboard - appointments & users'),
      ('doctor', 'Doctor portal - view and edit appointments'),
      ('nurse', 'Nurse portal - view only'),
      ('patient', 'Patient portal - book appointments')
    `);
    
    // Step 6: Insert permissions
    await conn.execute(`INSERT INTO permissions (name, description, category) VALUES
      ('manage_users', 'Create, edit, delete users', 'users'),
      ('view_users', 'View all users', 'users'),
      ('manage_roles', 'Assign roles', 'users'),
      ('manage_appointments', 'Create, edit, delete any appointment', 'appointments'),
      ('edit_appointments', 'Edit appointments', 'appointments'),
      ('delete_appointments', 'Delete appointments', 'appointments'),
      ('view_appointments', 'View all appointments', 'appointments'),
      ('book_appointments', 'Book appointments', 'appointments'),
      ('enable_maintenance_mode', 'Enable maintenance mode', 'system'),
      ('view_system_status', 'View system status', 'system')
    `);
    
    // Step 7: Assign permissions to roles
    const [saRole] = await conn.execute('SELECT id FROM roles WHERE name = "super_admin"');
    const [adminRole] = await conn.execute('SELECT id FROM roles WHERE name = "admin"');
    const [docRole] = await conn.execute('SELECT id FROM roles WHERE name = "doctor"');
    const [nurseRole] = await conn.execute('SELECT id FROM roles WHERE name = "nurse"');
    const [patientRole] = await conn.execute('SELECT id FROM roles WHERE name = "patient"');
    
    // Super admin: all permissions
    const [allPerms] = await conn.execute('SELECT id FROM permissions');
    for (const perm of allPerms) {
      await conn.execute('INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)', [saRole[0].id, perm.id]);
    }
    
    // Admin: manage appointments, view users, manage roles
    const adminPerms = ['view_appointments', 'manage_appointments', 'edit_appointments', 'delete_appointments', 'view_users', 'manage_roles'];
    for (const pname of adminPerms) {
      const [p] = await conn.execute('SELECT id FROM permissions WHERE name = ?', [pname]);
      if (p.length) await conn.execute('INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)', [adminRole[0].id, p[0].id]);
    }
    
    // Doctor: view and edit appointments
    const docPerms = ['view_appointments', 'edit_appointments'];
    for (const pname of docPerms) {
      const [p] = await conn.execute('SELECT id FROM permissions WHERE name = ?', [pname]);
      if (p.length) await conn.execute('INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)', [docRole[0].id, p[0].id]);
    }
    
    // Nurse: view appointments only
    const [viewApt] = await conn.execute('SELECT id FROM permissions WHERE name = "view_appointments"');
    await conn.execute('INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)', [nurseRole[0].id, viewApt[0].id]);
    
    // Patient: book appointments
    const [bookApt] = await conn.execute('SELECT id FROM permissions WHERE name = "book_appointments"');
    await conn.execute('INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)', [patientRole[0].id, bookApt[0].id]);
    
    // Step 8: Assign users to roles
    await conn.execute('INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (5, ?)', [saRole[0].id]);
    await conn.execute('INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (6, ?)', [adminRole[0].id]);
    await conn.execute('INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (7, ?)', [docRole[0].id]);
    
    // All other users as patient
    const [otherUsers] = await conn.execute('SELECT id FROM users WHERE id NOT IN (SELECT user_id FROM user_roles)');
    for (const user of otherUsers) {
      await conn.execute('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [user.id, patientRole[0].id]);
    }
    
    console.log('✅ RBAC tables created successfully!');
    console.log('✅ Roles created: super_admin, admin, doctor, nurse, patient');
    console.log('✅ Permissions created: 10 permissions');
    console.log('✅ User roles assigned: User 5->super_admin, User 6->admin, User 7->doctor');
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    if (conn) await conn.end();
  }
}

setupRBAC();
