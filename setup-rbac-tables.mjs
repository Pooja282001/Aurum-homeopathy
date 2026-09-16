import mysql from 'mysql2/promise.js';

const config = {
  host: 'srv1752.hstgr.io',
  user: 'u154384799_Aurum',
  password: 'Aurum2025',
  database: 'u154384799_Ahc',
};

async function createRBACSchema() {
  let connection;
  
  try {
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database\n');

    // ============================================
    // 1. CREATE ROLES TABLE
    // ============================================
    console.log('📝 Creating roles table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) UNIQUE NOT NULL,
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert default roles
    await connection.execute(`
      INSERT IGNORE INTO roles (name, description) VALUES
      ('super_admin', 'Full system control - can manage users, roles, permissions, and all appointments'),
      ('admin', 'Admin dashboard - can manage appointments and view user data'),
      ('doctor', 'Doctor portal - can view and edit appointments, update patient info'),
      ('nurse', 'Nurse portal - can view appointments and patient information (read-only)'),
      ('patient', 'Patient portal - can book appointments and view own appointments')
    `);
    console.log('✅ Roles table created with 5 roles\n');

    // ============================================
    // 2. CREATE PERMISSIONS TABLE
    // ============================================
    console.log('📝 Creating permissions table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS permissions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) UNIQUE NOT NULL,
        description VARCHAR(255),
        category VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert permissions
    await connection.execute(`
      INSERT IGNORE INTO permissions (name, description, category) VALUES
      ('manage_users', 'Create, edit, delete users', 'users'),
      ('view_users', 'View all users', 'users'),
      ('manage_roles', 'Assign and change user roles', 'users'),
      ('disable_users', 'Disable/enable user accounts', 'users'),
      ('manage_appointments', 'Create, edit, delete any appointment', 'appointments'),
      ('edit_appointments', 'Edit appointments', 'appointments'),
      ('delete_appointments', 'Delete appointments', 'appointments'),
      ('view_appointments', 'View all appointments', 'appointments'),
      ('book_appointments', 'Book new appointments', 'appointments'),
      ('enable_maintenance_mode', 'Enable/disable maintenance mode', 'system'),
      ('view_system_status', 'View system health and status', 'system'),
      ('manage_permissions', 'Manage user permissions', 'system')
    `);
    console.log('✅ Permissions table created with 12 permissions\n');

    // ============================================
    // 3. CREATE ROLE_PERMISSIONS JOIN TABLE
    // ============================================
    console.log('📝 Creating role_permissions table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        role_id INT NOT NULL,
        permission_id INT NOT NULL,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
        UNIQUE KEY unique_role_permission (role_id, permission_id)
      )
    `);
    
    // Clear existing permissions
    await connection.execute('DELETE FROM role_permissions');
    
    // Super Admin: ALL permissions
    await connection.execute(`
      INSERT INTO role_permissions (role_id, permission_id) 
      SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'super_admin'
    `);
    
    // Admin: Can manage appointments, view users
    await connection.execute(`
      INSERT INTO role_permissions (role_id, permission_id) 
      SELECT r.id, p.id FROM roles r, permissions p 
      WHERE r.name = 'admin' AND p.name IN (
        'view_appointments', 'manage_appointments', 'edit_appointments', 'delete_appointments',
        'view_users', 'book_appointments'
      )
    `);
    
    // Doctor: Can view and edit appointments
    await connection.execute(`
      INSERT INTO role_permissions (role_id, permission_id) 
      SELECT r.id, p.id FROM roles r, permissions p 
      WHERE r.name = 'doctor' AND p.name IN (
        'view_appointments', 'edit_appointments', 'book_appointments'
      )
    `);
    
    // Nurse: Can view appointments only
    await connection.execute(`
      INSERT INTO role_permissions (role_id, permission_id) 
      SELECT r.id, p.id FROM roles r, permissions p 
      WHERE r.name = 'nurse' AND p.name IN (
        'view_appointments'
      )
    `);
    
    // Patient: Can book and view own appointments
    await connection.execute(`
      INSERT INTO role_permissions (role_id, permission_id) 
      SELECT r.id, p.id FROM roles r, permissions p 
      WHERE r.name = 'patient' AND p.name IN (
        'book_appointments'
      )
    `);
    
    console.log('✅ Role permissions assigned\n');

    // ============================================
    // 4. CREATE USER_ROLES JOIN TABLE
    // ============================================
    console.log('📝 Creating user_roles table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        role_id INT NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_role (user_id, role_id)
      )
    `);
    
    // Clear existing user roles
    await connection.execute('DELETE FROM user_roles');
    
    // Assign roles to users
    await connection.execute(`
      INSERT INTO user_roles (user_id, role_id) 
      VALUES (5, (SELECT id FROM roles WHERE name = 'super_admin'))
    `);
    
    await connection.execute(`
      INSERT INTO user_roles (user_id, role_id) 
      VALUES (6, (SELECT id FROM roles WHERE name = 'admin'))
    `);
    
    await connection.execute(`
      INSERT INTO user_roles (user_id, role_id) 
      VALUES (7, (SELECT id FROM roles WHERE name = 'doctor'))
    `);
    
    // All other users as patient
    await connection.execute(`
      INSERT IGNORE INTO user_roles (user_id, role_id)
      SELECT u.id, r.id FROM users u, roles r 
      WHERE r.name = 'patient' 
      AND u.id NOT IN (SELECT user_id FROM user_roles)
    `);
    
    console.log('✅ User roles assigned\n');

    // ============================================
    // VERIFICATION
    // ============================================
    console.log('📋 VERIFICATION\n');
    console.log('--- ROLES ---');
    const [roles] = await connection.execute('SELECT id, name, description FROM roles ORDER BY id');
    roles.forEach(role => {
      console.log(`  ${role.id}. ${role.name}: ${role.description}`);
    });
    
    console.log('\n--- PERMISSIONS ---');
    const [permissions] = await connection.execute('SELECT id, name, category FROM permissions ORDER BY category, name');
    permissions.forEach(perm => {
      console.log(`  ${perm.id}. [${perm.category}] ${perm.name}`);
    });
    
    console.log('\n--- USER ROLES ---');
    const [userRoles] = await connection.execute(`
      SELECT u.id, u.email, r.name as role
      FROM user_roles ur
      JOIN users u ON ur.user_id = u.id
      JOIN roles r ON ur.role_id = r.id
      ORDER BY u.id
    `);
    userRoles.forEach(ur => {
      const icon = ur.role === 'super_admin' ? '👑' : ur.role === 'admin' ? '⚙️' : '👨‍⚕️';
      console.log(`  ${icon} User ${ur.id}: ${ur.email} → ${ur.role}`);
    });
    
    console.log('\n--- ROLE PERMISSIONS (Sample) ---');
    const [rolePerm] = await connection.execute(`
      SELECT r.name as role, p.name as permission
      FROM role_permissions rp
      JOIN roles r ON rp.role_id = r.id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE r.name IN ('super_admin', 'admin', 'doctor')
      ORDER BY r.name, p.name
      LIMIT 15
    `);
    rolePerm.forEach(rp => {
      console.log(`  ${rp.role} → ${rp.permission}`);
    });
    
    console.log('\n✅ ✅ ✅ RBAC SCHEMA CREATED SUCCESSFULLY! ✅ ✅ ✅\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Details:', error);
  } finally {
    if (connection) await connection.end();
  }
}

createRBACSchema();
