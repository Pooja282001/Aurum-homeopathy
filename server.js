import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';

// Load environment variables from .env or .env.local
dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`\n📨 [REQUEST] ${req.method.toUpperCase()} ${req.path}`);
  console.log(`⏰ [TIME] ${new Date().toISOString()}`);
  if (req.body && Object.keys(req.body).length > 0) console.log('📦 [BODY]', req.body);
  next();
});

// Database connection pool
// Use localhost because backend is deployed ON Hostinger same server
// If backend deployed OUTSIDE Hostinger, use: srv1752.hstgr.io
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'u154384799_Aurum',
  password: process.env.DB_PASS || 'Aurum2025',
  database: process.env.DB_NAME || 'u154384799_Ahc',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize RBAC schema on server start
async function initializeRBAC() {
  let conn;
  try {
    conn = await pool.getConnection();
    
    // Check if roles table exists
    const [tables] = await conn.execute(`
      SELECT TABLE_NAME FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'u154384799_Ahc' AND TABLE_NAME = 'roles'
    `);
    
    if (tables.length === 0) {
      console.log('[INIT] Creating RBAC tables...');
      
      // Create roles table
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS roles (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(50) UNIQUE NOT NULL,
          description VARCHAR(255)
        )
      `);
      
      // Create permissions table
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS permissions (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(50) UNIQUE NOT NULL,
          description VARCHAR(255),
          category VARCHAR(50)
        )
      `);
      
      // Create role_permissions table
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS role_permissions (
          id INT PRIMARY KEY AUTO_INCREMENT,
          role_id INT NOT NULL,
          permission_id INT NOT NULL,
          FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
          FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
          UNIQUE KEY uq_role_perm (role_id, permission_id)
        )
      `);
      
      // Create user_roles table
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS user_roles (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          role_id INT NOT NULL,
          assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
          UNIQUE KEY uq_user_role (user_id, role_id)
        )
      `);
      
      // Insert default roles
      await conn.execute(`
        INSERT IGNORE INTO roles (name, description) VALUES
        ('super_admin', 'Full system control'),
        ('admin', 'Admin dashboard'),
        ('doctor', 'Doctor portal'),
        ('nurse', 'Nurse portal'),
        ('patient', 'Patient portal')
      `);
      
      // Insert permissions
      await conn.execute(`
        INSERT IGNORE INTO permissions (name, description, category) VALUES
        ('manage_users', 'Manage users', 'users'),
        ('view_users', 'View users', 'users'),
        ('manage_appointments', 'Manage appointments', 'appointments'),
        ('view_appointments', 'View appointments', 'appointments'),
        ('book_appointments', 'Book appointments', 'appointments'),
        ('enable_maintenance', 'Maintenance mode', 'system')
      `);
      
      // Assign permissions to roles
      const [superAdmin] = await conn.execute('SELECT id FROM roles WHERE name = "super_admin"');
      const [admin] = await conn.execute('SELECT id FROM roles WHERE name = "admin"');
      const [doctor] = await conn.execute('SELECT id FROM roles WHERE name = "doctor"');
      const [nurse] = await conn.execute('SELECT id FROM roles WHERE name = "nurse"');
      const [patient] = await conn.execute('SELECT id FROM roles WHERE name = "patient"');
      
      const [allPerms] = await conn.execute('SELECT id FROM permissions');
      for (const perm of allPerms) {
        await conn.execute('INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)', 
          [superAdmin[0].id, perm.id]);
      }
      
      // Assign existing users to roles
      await conn.execute('INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (5, ?)', [superAdmin[0].id]);
      await conn.execute('INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (6, ?)', [admin[0].id]);
      await conn.execute('INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (7, ?)', [doctor[0].id]);
      
      // Assign all other users to patient role if they don't have a role yet
      await conn.execute(`
        INSERT IGNORE INTO user_roles (user_id, role_id)
        SELECT u.id, ? FROM users u
        WHERE u.id NOT IN (SELECT user_id FROM user_roles)
      `, [patient[0].id]);
      
      console.log('[INIT] ✅ RBAC tables created successfully');
    } else {
      console.log('[INIT] ✅ RBAC tables already exist');
      
      // Ensure users are assigned to roles
      try {
        const [superAdmin] = await conn.execute('SELECT id FROM roles WHERE name = "super_admin"');
        const [admin] = await conn.execute('SELECT id FROM roles WHERE name = "admin"');
        const [doctor] = await conn.execute('SELECT id FROM roles WHERE name = "doctor"');
        const [patient] = await conn.execute('SELECT id FROM roles WHERE name = "patient"');
        
        // Assign specific users if they don't have roles yet
        await conn.execute('INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (5, ?)', [superAdmin[0].id]);
        await conn.execute('INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (6, ?)', [admin[0].id]);
        await conn.execute('INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (7, ?)', [doctor[0].id]);
        
        // Assign all other users to patient role if they don't have a role yet
        await conn.execute(`
          INSERT IGNORE INTO user_roles (user_id, role_id)
          SELECT u.id, ? FROM users u
          WHERE u.id NOT IN (SELECT user_id FROM user_roles)
        `, [patient[0].id]);
        
        console.log('[INIT] ✅ User roles verified and assigned');
      } catch (e) {
        console.log('[INIT] User roles already assigned');
      }
    }
    
    // Initialize gallery settings table
    try {
      const [settingsTables] = await conn.execute(`
        SELECT TABLE_NAME FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = 'u154384799_Ahc' AND TABLE_NAME = 'gallery_settings'
      `);
      
      if (settingsTables.length === 0) {
        console.log('[INIT] Creating gallery_settings table...');
        await conn.execute(`
          CREATE TABLE IF NOT EXISTS gallery_settings (
            id INT PRIMARY KEY AUTO_INCREMENT,
            setting_key VARCHAR(50) UNIQUE NOT NULL,
            setting_value INT NOT NULL DEFAULT 1,
            description VARCHAR(255),
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);
        
        // Insert default settings
        await conn.execute(`
          INSERT IGNORE INTO gallery_settings (setting_key, setting_value, description)
          VALUES 
            ('videos_visible', 1, 'Show/Hide video section'),
            ('photos_visible', 1, 'Show/Hide photo section')
        `);
        
        console.log('[INIT] ✅ Gallery settings table created successfully');
      } else {
        console.log('[INIT] ✅ Gallery settings table already exists');
        
        // Ensure default settings exist
        await conn.execute(`
          INSERT IGNORE INTO gallery_settings (setting_key, setting_value, description)
          VALUES 
            ('videos_visible', 1, 'Show/Hide video section'),
            ('photos_visible', 1, 'Show/Hide photo section')
        `);
      }
    } catch (e) {
      console.error('[INIT] ❌ Gallery settings initialization error:', e.message);
    }
    
    conn.release();
  } catch (error) {
    console.error('[INIT] ❌ RBAC initialization error:', error.message);
  }
}

// Global error handlers
process.on('unhandledRejection', (err) => {
  console.error('[UNHANDLED REJECTION]', err);
});

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
});

// Test connection
app.get('/health', async (req, res) => {
  console.log('🏥 [HEALTH] Health check requested');
  try {
    console.log('🔗 [HEALTH] Getting database connection...');
    const connection = await pool.getConnection();
    console.log('✅ [HEALTH] Connection obtained');
    
    console.log('🔍 [HEALTH] Pinging database...');
    await connection.ping();
    console.log('✅ [HEALTH] Database ping successful');
    
    connection.release();
    console.log('✅ [HEALTH] Connection released');
    
    const response = { ok: true, database: 'connected', message: '✅ Database connection successful!', timestamp: new Date().toISOString() };
    console.log('📤 [HEALTH] Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('❌ [HEALTH] Database connection failed:', error.message, error.stack);
    res.status(500).json({ error: 'Database connection failed', message: error.message });
  }
});

// Diagnostic endpoint - Check system status and users
app.get('/diagnose', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    
    // Get system status
    const [systemStatus] = await conn.execute('SELECT * FROM system_status WHERE id = 1');
    
    // Get all users with roles
    const [users] = await conn.execute(`
      SELECT u.id, u.username, u.email, u.name,
             GROUP_CONCAT(r.name SEPARATOR ', ') as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      GROUP BY u.id
      LIMIT 20
    `);
    
    // Get available roles
    const [roles] = await conn.execute('SELECT id, name, description FROM roles');
    
    conn.release();
    
    res.json({
      system_status: systemStatus.length > 0 ? {
        is_online: systemStatus[0].is_online === 1,
        maintenance_mode: systemStatus[0].maintenance_mode === 1,
        comment: systemStatus[0].comment,
        last_updated: systemStatus[0].last_updated
      } : 'NO_RECORD',
      users: users,
      roles: roles,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Diagnosis failed', message: error.message });
  }
});

// Get all users
app.get('/users', async (req, res) => {
  try {
    console.log('👥 [GET_USERS] Fetching all users...');
    
    console.log('🔗 [GET_USERS] Getting database connection...');
    const connection = await pool.getConnection();
    console.log('✅ [GET_USERS] Connection obtained');
    
    console.log('🔍 [GET_USERS] Executing query to fetch users with roles...');
    const [rows] = await connection.execute(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.created_at,
        GROUP_CONCAT(r.name SEPARATOR ',') as role,
        GROUP_CONCAT(r.id SEPARATOR ',') as role_ids
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      GROUP BY u.id
      ORDER BY u.id
    `);
    
    console.log('📊 [GET_USERS] Query returned', rows.length, 'user(s)');
    if (rows.length > 0) {
      console.log('📋 [GET_USERS] Users:', rows.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })));
    }
    
    connection.release();
    console.log('✅ [GET_USERS] Connection released');
    
    const response = { users: rows };
    console.log('📤 [GET_USERS] Sending response with', rows.length, 'users');
    res.json(response);
  } catch (error) {
    console.error('❌ [GET_USERS] ERROR:', error.message);
    console.error('📋 [GET_USERS] Stack trace:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Get appointments
app.get('/appointments', async (req, res) => {
  try {
    console.log('📅 [GET_APPOINTMENTS] Fetching all appointments...');
    
    console.log('🔗 [GET_APPOINTMENTS] Getting database connection...');
    const connection = await pool.getConnection();
    console.log('✅ [GET_APPOINTMENTS] Connection obtained');
    
    console.log('🔍 [GET_APPOINTMENTS] Executing query...');
    const [rows] = await connection.query('SELECT * FROM appointments');
    console.log('📊 [GET_APPOINTMENTS] Retrieved', rows.length, 'appointment(s)');
    
    connection.release();
    console.log('✅ [GET_APPOINTMENTS] Connection released');
    
    const response = { appointments: rows };
    console.log('📤 [GET_APPOINTMENTS] Sending response');
    res.json(response);
  } catch (error) {
    console.error('❌ [GET_APPOINTMENTS] ERROR:', error.message);
    console.error('📋 [GET_APPOINTMENTS] Stack trace:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Add appointment (POST)
app.post('/appointments', async (req, res) => {
  try {
    const { user_id, name, phone, email, date, time_slot, service, status } = req.body;
    
    console.log('📅 [POST_APPOINTMENT] Creating new appointment');
    console.log('📝 [POST_APPOINTMENT] Data:', { name, email, phone, date, time_slot, service });
    
    // Validation
    if (!name || !email || !phone || !date || !time_slot) {
      console.warn('⚠️ [POST_APPOINTMENT] Missing required fields');
      return res.status(422).json({ 
        error: 'Missing required fields: name, email, phone, date, time_slot' 
      });
    }
    
    console.log('🔗 [POST_APPOINTMENT] Getting database connection...');
    const connection = await pool.getConnection();
    console.log('✅ [POST_APPOINTMENT] Connection obtained');
    
    console.log('🔍 [POST_APPOINTMENT] Inserting appointment into database...');
    const [result] = await connection.execute(
      'INSERT INTO appointments (user_id, name, phone, email, date, time_slot, service, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id || null, name, phone, email, date, time_slot, service || 'General consultation', status || 'New']
    );
    console.log('✅ [POST_APPOINTMENT] Appointment inserted with ID:', result.insertId);
    
    connection.release();
    console.log('✅ [POST_APPOINTMENT] Connection released');
    
    const response = { 
      id: result.insertId, 
      message: '✅ Appointment booked successfully!',
      appointment: {
        id: result.insertId,
        name,
        email,
        phone,
        date,
        time_slot,
        service,
        status: status || 'New'
      }
    };
    console.log('📤 [POST_APPOINTMENT] SUCCESS! Appointment created:', response);
    res.status(201).json(response);
  } catch (error) {
    console.error('❌ [POST_APPOINTMENT] ERROR:', error.message);
    console.error('📋 [POST_APPOINTMENT] Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Failed to book appointment: ' + error.message 
    });
  }
});

// Register user (with RBAC - creates user_roles entry)
app.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log('[NEW REGISTER]', { name, email, role: role || 'patient' });
    
    if (!name || !email || !password) {
      return res.status(422).json({ error: 'Name, email, and password required' });
    }

    const userRole = role && ['patient', 'doctor', 'nurse', 'admin', 'super_admin'].includes(role) ? role : 'patient';

    const connection = await pool.getConnection();
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    
    // Create user (without role column)
    const [result] = await connection.execute(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, passwordHash]
    );
    
    const userId = result.insertId;

    // Get role_id from roles table
    const [roleData] = await connection.execute(
      'SELECT id FROM roles WHERE name = ?',
      [userRole]
    );
    
    if (roleData.length > 0) {
      // Insert into user_roles
      await connection.execute(
        'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
        [userId, roleData[0].id]
      );
    }

    connection.release();
    
    console.log('[SUCCESS] USER REGISTERED - ID:', userId, 'ROLE:', userRole);
    res.status(201).json({ id: userId, message: '✅ Registration successful!', role: userRole });
  } catch (error) {
    console.error('❌ REGISTER ERROR:', error.message);
    res.status(500).json({ error: 'Email already registered or error occurred' });
  }
});

// Get system status (online/offline/maintenance)
app.get('/system-status', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Create table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS system_status (
        id INT PRIMARY KEY AUTO_INCREMENT,
        is_online TINYINT(1) DEFAULT 1,
        maintenance_mode TINYINT(1) DEFAULT 0,
        comment VARCHAR(500) DEFAULT '',
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Get or create status record
    const [existing] = await connection.execute('SELECT * FROM system_status WHERE id = 1');
    
    if (existing.length === 0) {
      await connection.execute(
        'INSERT INTO system_status (id, is_online, maintenance_mode, comment) VALUES (1, 1, 0, "")'
      );
    }
    
    const [rows] = await connection.execute('SELECT is_online, maintenance_mode, comment FROM system_status WHERE id = 1');
    
    connection.release();
    
    res.json({
      isOnline: rows[0].is_online === 1,
      maintenanceMode: rows[0].maintenance_mode === 1,
      comment: rows[0].comment || ''
    });
  } catch (error) {
    console.error('❌ SYSTEM STATUS ERROR:', error.message);
    res.status(500).json({ error: 'Failed to fetch system status' });
  }
});

// Update system status (only for super admin)
app.put('/system-status', async (req, res) => {
  try {
    const { isOnline, maintenanceMode, comment, userId } = req.body;
    
    // Check if user is super admin
    const connection = await pool.getConnection();
    
    const [userRoles] = await connection.execute(`
      SELECT r.name FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = ?
    `, [userId]);
    
    const isSuperAdmin = userRoles.some(ur => ur.name === 'super_admin');
    
    if (!isSuperAdmin) {
      connection.release();
      return res.status(403).json({ error: 'Only super admin can update system status' });
    }
    
    // Update system status
    await connection.execute(`
      UPDATE system_status 
      SET is_online = ?, maintenance_mode = ?, comment = ?
      WHERE id = 1
    `, [
      isOnline ? 1 : 0,
      maintenanceMode ? 1 : 0,
      comment || ''
    ]);
    
    connection.release();
    
    res.json({
      ok: true,
      message: '✅ System status updated',
      isOnline,
      maintenanceMode,
      comment
    });
  } catch (error) {
    console.error('❌ UPDATE SYSTEM STATUS ERROR:', error.message);
    res.status(500).json({ error: 'Failed to update system status' });
  }
});

// Login user (with RBAC - fetches roles from user_roles table)
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 [LOGIN] Attempting login with email:', email);
    
    if (!email || !password) {
      console.warn('⚠️ [LOGIN] Missing email or password');
      return res.status(422).json({ error: 'Email and password required' });
    }

    console.log('🔗 [LOGIN] Getting database connection...');
    const connection = await pool.getConnection();
    console.log('✅ [LOGIN] Connection obtained');
    
    // Get user
    console.log('🔍 [LOGIN] Querying users table for email:', email);
    const [users] = await connection.execute(
      'SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    console.log('📊 [LOGIN] Query result:', users.length, 'user(s) found');

    if (users.length === 0) {
      console.warn('❌ [LOGIN] User not found for email:', email);
      connection.release();
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password hash
    console.log('🔒 [LOGIN] Verifying password hash...');
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    if (passwordHash !== users[0].password_hash) {
      console.warn('❌ [LOGIN] Password hash mismatch for user:', email);
      connection.release();
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    console.log('✅ [LOGIN] Password verified successfully');

    // Get user roles and permissions
    console.log('🔍 [LOGIN] Fetching user roles...');
    const [userRoles] = await connection.execute(`
      SELECT r.id as role_id, r.name as role_name
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = ?
    `, [users[0].id]);
    console.log('📊 [LOGIN] Found', userRoles.length, 'role(s):', userRoles.map(r => r.role_name).join(', '));

    // Get permissions for user
    console.log('🔍 [LOGIN] Fetching user permissions...');
    const [userPermissions] = await connection.execute(`
      SELECT DISTINCT p.name as permission
      FROM user_roles ur
      JOIN role_permissions rp ON ur.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = ?
    `, [users[0].id]);
    console.log('📊 [LOGIN] Found', userPermissions.length, 'permission(s)');

    connection.release();
    console.log('✅ [LOGIN] Connection released');

    // Format response - use primary role (or first role if multiple)
    const primaryRole = userRoles.length > 0 ? userRoles[0].role_name : 'patient';
    const permissions = userPermissions.map(p => p.permission);

    console.log('✅ [LOGIN] SUCCESS! User:', users[0].name, '| Role:', primaryRole);
    const response = { 
      user: {
        id: users[0].id,
        name: users[0].name,
        email: users[0].email,
        role: primaryRole,
        roles: userRoles.map(r => r.role_name),
        permissions: permissions
      },
      message: '✅ Login successful!' 
    };
    console.log('📤 [LOGIN] Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('❌ [LOGIN] ERROR:', error.message);
    console.error('📋 [LOGIN] Stack trace:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Get all data for admin (with RBAC - includes roles and permissions)
app.get('/admin/data', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Get all users with their roles
    const [users] = await connection.execute(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        GROUP_CONCAT(r.name SEPARATOR ',') as role,
        GROUP_CONCAT(r.id SEPARATOR ',') as role_ids
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      GROUP BY u.id
      ORDER BY u.id
    `);

    const [appointments] = await connection.query('SELECT * FROM appointments ORDER BY created_at DESC');
    
    // Get all roles and permissions
    const [roles] = await connection.execute(`
      SELECT 
        r.id, 
        r.name, 
        r.description,
        COUNT(rp.id) as permission_count
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      GROUP BY r.id
    `);

    const [permissions] = await connection.query('SELECT id, name, category FROM permissions ORDER BY category');
    
    connection.release();
    
    res.json({ 
      users,
      appointments,
      roles,
      permissions,
      stats: {
        total_users: users.length,
        total_appointments: appointments.length,
        total_roles: roles.length,
        total_permissions: permissions.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ====== USER MANAGEMENT ENDPOINTS ======

// Get single user
app.get('/users/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.query(`
      SELECT u.id, u.name, u.email, u.created_at,
        GROUP_CONCAT(r.name SEPARATOR ',') as role,
        GROUP_CONCAT(p.name SEPARATOR ',') as permissions
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      WHERE u.id = ?
      GROUP BY u.id
    `, [req.params.id]);
    connection.release();
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: users[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user (Super Admin only)
app.put('/users/:id', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const userId = req.params.id;
    
    console.log('✏️ [PUT_USER] Updating user ID:', userId);
    console.log('📝 [PUT_USER] Update data:', { name, email, role, hasPassword: !!password });
    
    if (!name && !email && !password && !role) {
      console.warn('⚠️ [PUT_USER] No fields provided for update');
      return res.status(422).json({ error: 'At least one field required' });
    }

    console.log('🔗 [PUT_USER] Getting database connection...');
    const connection = await pool.getConnection();
    console.log('✅ [PUT_USER] Connection obtained');
    
    // Build dynamic update query for user table (name, email, password only)
    const updates = [];
    const params = [];
    
    if (name) {
      updates.push('name = ?');
      params.push(name);
      console.log('📝 [PUT_USER] Will update name to:', name);
    }
    if (email) {
      updates.push('email = ?');
      params.push(email);
      console.log('📝 [PUT_USER] Will update email to:', email);
    }
    if (password) {
      console.log('🔒 [PUT_USER] Hashing password...');
      const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
      updates.push('password_hash = ?');
      params.push(passwordHash);
      console.log('✅ [PUT_USER] Password hashed');
    }
    
    // Update user fields if any
    if (updates.length > 0) {
      params.push(userId);
      const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
      console.log('🔍 [PUT_USER] Executing update query...');
      await connection.execute(query, params);
      console.log('✅ [PUT_USER] User table updated successfully');
    }

    // Handle role change via user_roles table
    if (role && ['patient', 'doctor', 'nurse', 'admin', 'super_admin'].includes(role)) {
      console.log('👤 [PUT_USER] Updating role to:', role);
      // Get role ID
      const [roleData] = await connection.execute(
        'SELECT id FROM roles WHERE name = ?',
        [role]
      );
      
      if (roleData.length > 0) {
        console.log('🔍 [PUT_USER] Found role ID:', roleData[0].id);
        
        // Delete existing roles
        console.log('🗑️ [PUT_USER] Deleting existing roles for user ID:', userId);
        await connection.execute('DELETE FROM user_roles WHERE user_id = ?', [userId]);
        console.log('✅ [PUT_USER] Existing roles deleted');
        
        // Insert new role
        console.log('➕ [PUT_USER] Inserting new role assignment...');
        await connection.execute(
          'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
          [userId, roleData[0].id]
        );
        console.log('✅ [PUT_USER] Role updated successfully');
      } else {
        console.warn('⚠️ [PUT_USER] Role not found in database:', role);
      }
    }

    connection.release();
    console.log('✅ [PUT_USER] Connection released');
    
    console.log('✅ [PUT_USER] SUCCESS! User ID', userId, 'updated completely');
    const response = { message: '✅ User updated successfully!', userId };
    console.log('📤 [PUT_USER] Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('❌ [PUT_USER] ERROR:', error.message);
    console.error('📋 [PUT_USER] Stack trace:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Delete user (Super Admin only)
app.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    console.log('🗑️ [DELETE_USER] Deleting user ID:', userId);
    
    console.log('🔗 [DELETE_USER] Getting database connection...');
    const connection = await pool.getConnection();
    console.log('✅ [DELETE_USER] Connection obtained');
    
    // First delete user roles
    console.log('🔍 [DELETE_USER] Deleting user_roles for user ID:', userId);
    await connection.execute('DELETE FROM user_roles WHERE user_id = ?', [userId]);
    console.log('✅ [DELETE_USER] User roles deleted');
    
    // Then delete user
    console.log('🔍 [DELETE_USER] Deleting user from users table...');
    const [result] = await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
    console.log('📊 [DELETE_USER] Affected rows:', result.affectedRows);
    
    connection.release();
    console.log('✅ [DELETE_USER] Connection released');
    
    if (result.affectedRows === 0) {
      console.warn('❌ [DELETE_USER] User not found for ID:', userId);
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('✅ [DELETE_USER] SUCCESS! User ID', userId, 'deleted completely');
    const response = { message: '✅ User deleted successfully!', userId };
    console.log('📤 [DELETE_USER] Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('❌ [DELETE_USER] ERROR:', error.message);
    console.error('📋 [DELETE_USER] Stack trace:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// ====== APPOINTMENT MANAGEMENT ENDPOINTS ======

// Get single appointment
app.get('/appointments/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [appointments] = await connection.query('SELECT * FROM appointments WHERE id = ?', [req.params.id]);
    connection.release();
    
    if (appointments.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.json({ appointment: appointments[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update appointment (Admin, Doctor can edit)
app.put('/appointments/:id', async (req, res) => {
  try {
    const { name, email, phone, date, time_slot, service, status } = req.body;
    const appointmentId = req.params.id;
    
    console.log('[UPDATE APPOINTMENT]', { id: appointmentId, status });
    
    if (!status && !date && !time_slot && !name) {
      return res.status(422).json({ error: 'At least one field required' });
    }

    const connection = await pool.getConnection();
    
    const updates = [];
    const params = [];
    
    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (email) {
      updates.push('email = ?');
      params.push(email);
    }
    if (phone) {
      updates.push('phone = ?');
      params.push(phone);
    }
    if (date) {
      updates.push('date = ?');
      params.push(date);
    }
    if (time_slot) {
      updates.push('time_slot = ?');
      params.push(time_slot);
    }
    if (service) {
      updates.push('service = ?');
      params.push(service);
    }
    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    
    params.push(appointmentId);
    
    const query = `UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`;
    const [result] = await connection.execute(query, params);
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    console.log('[SUCCESS] APPOINTMENT UPDATED - ID:', appointmentId);
    res.json({ message: '[SUCCESS] Appointment updated successfully!' });
  } catch (error) {
    console.error('[ERROR]', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Delete appointment (Admin only)
app.delete('/appointments/:id', async (req, res) => {
  try {
    const appointmentId = req.params.id;
    console.log('[DELETE APPOINTMENT]', { id: appointmentId });
    
    const connection = await pool.getConnection();
    const [result] = await connection.execute('DELETE FROM appointments WHERE id = ?', [appointmentId]);
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    console.log('[SUCCESS] APPOINTMENT DELETED - ID:', appointmentId);
    res.json({ message: '[SUCCESS] Appointment deleted successfully!' });
  } catch (error) {
    console.error('[ERROR]', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Full database test report
app.get('/test/full', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    const [appointments] = await connection.query('SELECT COUNT(*) as count FROM appointments');
    const [tables] = await connection.query('SHOW TABLES');
    
    connection.release();
    
    res.json({
      status: '✅ Database Connected',
      database: 'u154384799_Ahc',
      tables: tables.map(t => Object.values(t)[0]),
      statistics: {
        total_users: users[0].count,
        total_appointments: appointments[0].count
      },
      endpoints: {
        health: 'GET /health',
        users: 'GET /users',
        appointments: 'GET /appointments',
        add_appointment: 'POST /appointments',
        test: 'GET /test/full'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Temporary fix roles endpoint
app.get('/fix-test-roles', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const roleMap = {
      5: 'super_admin',
      6: 'admin',
      7: 'doctor',
      8: 'nurse',
      9: 'patient'
    };

    const updates = [];
    for (const [userId, role] of Object.entries(roleMap)) {
      const [result] = await connection.execute(
        'UPDATE users SET role = ? WHERE id = ?',
        [role, userId]
      );
      updates.push({userId, role, changedRows: result.changedRows});
    }

    // Verify the update
    const [users] = await connection.execute(`
      SELECT u.id, u.email, GROUP_CONCAT(r.name SEPARATOR ',') as role
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.id IN (5, 6, 7, 8, 9)
      GROUP BY u.id
    `);
    connection.release();

    res.json({ updates, verifyUsers: users });
  } catch (error) {
    console.error('FIX ROLES ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Setup endpoint: Clean all users and create 3 test users
app.post('/setup/clean', async (req, res) => {
  try {
    console.log('[SETUP] Starting clean setup...');
    const connection = await pool.getConnection();
    
    // Disable foreign key checks to allow deletion
    await connection.execute('SET FOREIGN_KEY_CHECKS=0');
    
    // Truncate users table
    const [truncateResult] = await connection.execute('TRUNCATE TABLE users');
    console.log('[SETUP] Truncated users table');
    
    // Re-enable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS=1');
    
    // Create 3 new users with correct roles
    const users = [
      {
        name: 'Super Admin',
        email: 'superadmin@test.com',
        password: 'super123',
        role: 'super_admin'
      },
      {
        name: 'Admin',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        name: 'Doctor',
        email: 'doctor@test.com',
        password: 'doctor123',
        role: 'doctor'
      }
    ];
    
    const createdUsers = [];
    for (const user of users) {
      const passwordHash = crypto.createHash('sha256').update(user.password).digest('hex');
      const [result] = await connection.execute(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [user.name, user.email, passwordHash, user.role]
      );
      createdUsers.push({
        id: result.insertId,
        name: user.name,
        email: user.email,
        role: user.role,
        password: user.password
      });
      console.log(`[SETUP] Created user: ${user.email} (${user.role})`);
    }
    
    connection.release();
    
    console.log('[SETUP] Complete! 3 users ready.');
    res.json({
      success: true,
      message: 'Setup complete! All users cleared and 3 new users created.',
      users: createdUsers
    });
  } catch (error) {
    console.error('[SETUP ERROR]', error.message);
    res.status(500).json({ error: 'Setup failed', message: error.message });
  }
});

// Setup endpoint: Create media table if it doesn't exist
app.post('/setup/create-media-table', async (req, res) => {
  try {
    console.log('[SETUP] Creating media table...');
    const connection = await pool.getConnection();

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS media (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description LONGTEXT,
        type ENUM('image', 'video') NOT NULL DEFAULT 'image',
        url TEXT NOT NULL,
        thumbnail_url TEXT,
        is_featured BOOLEAN DEFAULT FALSE,
        display_order INT DEFAULT 0,
        created_by INT UNSIGNED,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_type (type),
        INDEX idx_is_featured (is_featured),
        INDEX idx_display_order (display_order),
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    connection.release();
    console.log('[SETUP] Media table created successfully');
    res.json({
      success: true,
      message: '✨ Media table created successfully!'
    });
  } catch (error) {
    console.error('[SETUP ERROR]', error.message);
    res.status(500).json({ error: 'Setup failed', message: error.message });
  }
});

// Setup endpoint: Add demo media for testing
app.post('/setup/demo-media', async (req, res) => {
  try {
    console.log('[SETUP] Starting demo media insertion...');
    const connection = await pool.getConnection();

    const demoVideos = [
      { title: 'Homeopathy Treatment Success Story', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      { title: 'Dr. Consultation Session', type: 'video', url: 'https://www.w3schools.com/html/movie.mp4' },
      { title: 'Chronic Pain Relief Case', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      { title: 'Skin Condition Improvement', type: 'video', url: 'https://www.w3schools.com/html/movie.mp4' },
      { title: 'Clinic Tour and Facilities', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      { title: 'Women\'s Health Treatment', type: 'video', url: 'https://www.w3schools.com/html/movie.mp4' },
      { title: 'Allergy Management Session', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      { title: 'Child Immunity Boost Program', type: 'video', url: 'https://www.w3schools.com/html/movie.mp4' },
      { title: 'Digestive Health Treatment', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      { title: 'Patient Reviews and Testimonials', type: 'video', url: 'https://www.w3schools.com/html/movie.mp4' }
    ];

    const demoPhotos = [
      { title: 'Modern Clinic Interior', type: 'image', url: 'https://picsum.photos/600/400?random=1' },
      { title: 'Treatment Room Setup', type: 'image', url: 'https://picsum.photos/600/400?random=2' },
      { title: 'Homeopathic Medicines', type: 'image', url: 'https://picsum.photos/600/400?random=3' },
      { title: 'Patient Waiting Area', type: 'image', url: 'https://picsum.photos/600/400?random=4' },
      { title: 'Consultation Setup', type: 'image', url: 'https://picsum.photos/600/400?random=5' },
      { title: 'Medical Equipment', type: 'image', url: 'https://picsum.photos/600/400?random=6' },
      { title: 'Clinic Exterior', type: 'image', url: 'https://picsum.photos/600/400?random=7' },
      { title: 'Health Records Storage', type: 'image', url: 'https://picsum.photos/600/400?random=8' },
      { title: 'Sterilization Station', type: 'image', url: 'https://picsum.photos/600/400?random=9' },
      { title: 'Doctor\'s Office', type: 'image', url: 'https://picsum.photos/600/400?random=10' }
    ];

    let addedCount = 0;

    // Insert videos
    for (const video of demoVideos) {
      try {
        await connection.execute(
          `INSERT INTO media (title, type, url) 
           VALUES (?, ?, ?)`,
          [video.title, video.type, video.url]
        );
        addedCount++;
        console.log(`[SETUP] ✅ Added video: ${video.title}`);
      } catch (error) {
        console.error(`[SETUP] ❌ Failed to add video ${video.title}:`, error.message);
      }
    }

    // Insert photos
    for (const photo of demoPhotos) {
      try {
        await connection.execute(
          `INSERT INTO media (title, type, url) 
           VALUES (?, ?, ?)`,
          [photo.title, photo.type, photo.url]
        );
        addedCount++;
        console.log(`[SETUP] ✅ Added photo: ${photo.title}`);
      } catch (error) {
        console.error(`[SETUP] ❌ Failed to add photo ${photo.title}:`, error.message);
      }
    }

    connection.release();

    console.log(`[SETUP] Complete! ${addedCount} media items added.`);
    res.json({
      success: true,
      message: `✨ Demo media setup complete! Added ${addedCount} media items (10 videos + 10 photos).`,
      itemsAdded: addedCount
    });
  } catch (error) {
    console.error('[SETUP ERROR]', error.message);
    res.status(500).json({ error: 'Setup failed', message: error.message });
  }
});

// ====== MEDIA GALLERY MANAGEMENT ENDPOINTS ======

// Get all media (public - anyone can view)
app.get('/media', async (req, res) => {
  try {
    console.log('📸 [GET_MEDIA] Fetching all media items...');
    const connection = await pool.getConnection();
    
    const [media] = await connection.execute(`
      SELECT 
        id,
        title,
        description,
        type,
        url,
        thumbnail_url,
        is_featured,
        display_order,
        created_by,
        created_at,
        updated_at
      FROM media
      ORDER BY created_at DESC, id DESC
    `);
    
    connection.release();
    console.log('✅ [GET_MEDIA] Found', media.length, 'media items');
    res.json(media);
  } catch (error) {
    console.error('❌ [GET_MEDIA] ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get single media item
app.get('/media/:id', async (req, res) => {
  try {
    const mediaId = req.params.id;
    console.log('📸 [GET_MEDIA_SINGLE] Fetching media ID:', mediaId);
    
    const connection = await pool.getConnection();
    
    const [media] = await connection.execute(`
      SELECT 
        id,
        title,
        type,
        url
      FROM media
      WHERE id = ?
    `, [mediaId]);
    
    connection.release();
    
    if (media.length === 0) {
      console.warn('⚠️ [GET_MEDIA_SINGLE] Media not found:', mediaId);
      return res.status(404).json({ error: 'Media not found' });
    }
    
    console.log('✅ [GET_MEDIA_SINGLE] Found:', media[0].title);
    res.json(media[0]);
  } catch (error) {
    console.error('❌ [GET_MEDIA_SINGLE] ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Create media (Admin & Super Admin only)
app.post('/media', async (req, res) => {
  try {
    const { title, description, type, url, thumbnail_url, is_featured, display_order, created_by } = req.body;
    
    console.log('📸 [CREATE_MEDIA] Creating new media:', { title, type });
    
    if (!title || !type || !url) {
      console.warn('⚠️ [CREATE_MEDIA] Missing required fields');
      return res.status(422).json({ error: 'Title, type, and URL are required' });
    }
    
    if (!['image', 'video'].includes(type)) {
      console.warn('⚠️ [CREATE_MEDIA] Invalid type:', type);
      return res.status(422).json({ error: 'Type must be "image" or "video"' });
    }
    
    const connection = await pool.getConnection();
    
    // Check if user exists and has admin/super_admin role
    if (created_by) {
      const [userRoles] = await connection.execute(`
        SELECT r.name FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = ?
      `, [created_by]);
      
      const roles = userRoles.map(r => r.name);
      if (!roles.includes('admin') && !roles.includes('super_admin')) {
        connection.release();
        console.warn('⚠️ [CREATE_MEDIA] User not authorized:', created_by);
        return res.status(403).json({ error: 'Only admin and super_admin can create media' });
      }
    }
    
    const [result] = await connection.execute(`
      INSERT INTO media (title, description, type, url, thumbnail_url, is_featured, display_order, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title,
      description || null,
      type,
      url,
      thumbnail_url || null,
      is_featured ? 1 : 0,
      display_order || 0,
      created_by || null
    ]);
    
    connection.release();
    
    console.log('✅ [CREATE_MEDIA] Media created with ID:', result.insertId);
    res.status(201).json({ 
      message: '✅ Media created successfully!',
      mediaId: result.insertId
    });
  } catch (error) {
    console.error('❌ [CREATE_MEDIA] ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Update media (Admin & Super Admin only)
app.put('/media/:id', async (req, res) => {
  try {
    const mediaId = req.params.id;
    const { title, description, type, url, thumbnail_url, is_featured, display_order, updated_by } = req.body;
    
    console.log('📸 [UPDATE_MEDIA] Updating media ID:', mediaId);
    
    const connection = await pool.getConnection();
    
    // Verify user authorization
    if (updated_by) {
      const [userRoles] = await connection.execute(`
        SELECT r.name FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = ?
      `, [updated_by]);
      
      const roles = userRoles.map(r => r.name);
      if (!roles.includes('admin') && !roles.includes('super_admin')) {
        connection.release();
        console.warn('⚠️ [UPDATE_MEDIA] User not authorized:', updated_by);
        return res.status(403).json({ error: 'Only admin and super_admin can update media' });
      }
    }
    
    // Build dynamic update query
    const updates = [];
    const params = [];
    
    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (type !== undefined) {
      updates.push('type = ?');
      params.push(type);
    }
    if (url !== undefined) {
      updates.push('url = ?');
      params.push(url);
    }
    if (thumbnail_url !== undefined) {
      updates.push('thumbnail_url = ?');
      params.push(thumbnail_url);
    }
    if (is_featured !== undefined) {
      updates.push('is_featured = ?');
      params.push(is_featured ? 1 : 0);
    }
    if (display_order !== undefined) {
      updates.push('display_order = ?');
      params.push(display_order);
    }
    
    if (updates.length === 0) {
      connection.release();
      return res.status(422).json({ error: 'At least one field required for update' });
    }
    
    // Always update the timestamp
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(mediaId);
    
    const query = `UPDATE media SET ${updates.join(', ')} WHERE id = ?`;
    const [result] = await connection.execute(query, params);
    
    connection.release();
    
    if (result.affectedRows === 0) {
      console.warn('⚠️ [UPDATE_MEDIA] Media not found:', mediaId);
      return res.status(404).json({ error: 'Media not found' });
    }
    
    console.log('✅ [UPDATE_MEDIA] Media ID', mediaId, 'updated successfully');
    res.json({ message: '✅ Media updated successfully!' });
  } catch (error) {
    console.error('❌ [UPDATE_MEDIA] ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Delete media (Admin & Super Admin only)
app.delete('/media/:id', async (req, res) => {
  try {
    const mediaId = req.params.id;
    const deleted_by = req.body?.deleted_by;
    
    console.log('📸 [DELETE_MEDIA] Deleting media ID:', mediaId);
    
    const connection = await pool.getConnection();
    
    // Verify user authorization
    if (deleted_by) {
      const [userRoles] = await connection.execute(`
        SELECT r.name FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = ?
      `, [deleted_by]);
      
      const roles = userRoles.map(r => r.name);
      if (!roles.includes('admin') && !roles.includes('super_admin')) {
        connection.release();
        console.warn('⚠️ [DELETE_MEDIA] User not authorized:', deleted_by);
        return res.status(403).json({ error: 'Only admin and super_admin can delete media' });
      }
    }
    
    const [result] = await connection.execute('DELETE FROM media WHERE id = ?', [mediaId]);
    connection.release();
    
    if (result.affectedRows === 0) {
      console.warn('⚠️ [DELETE_MEDIA] Media not found:', mediaId);
      return res.status(404).json({ error: 'Media not found' });
    }
    
    console.log('✅ [DELETE_MEDIA] Media ID', mediaId, 'deleted successfully');
    res.json({ message: '✅ Media deleted successfully!' });
  } catch (error) {
    console.error('❌ [DELETE_MEDIA] ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Reorder media (Admin & Super Admin only)
app.put('/media/reorder/all', async (req, res) => {
  try {
    const { items, updated_by } = req.body;
    
    console.log('📸 [REORDER_MEDIA] Reordering', items.length, 'items');
    
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(422).json({ error: 'Items array required' });
    }
    
    const connection = await pool.getConnection();
    
    // Verify user authorization
    if (updated_by) {
      const [userRoles] = await connection.execute(`
        SELECT r.name FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = ?
      `, [updated_by]);
      
      const roles = userRoles.map(r => r.name);
      if (!roles.includes('admin') && !roles.includes('super_admin')) {
        connection.release();
        return res.status(403).json({ error: 'Only admin and super_admin can reorder media' });
      }
    }
    
    // Update display_order for each item
    for (const item of items) {
      await connection.execute(
        'UPDATE media SET display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [item.order, item.id]
      );
    }
    
    connection.release();
    
    console.log('✅ [REORDER_MEDIA] Successfully reordered', items.length, 'items');
    res.json({ message: '✅ Media reordered successfully!' });
  } catch (error) {
    console.error('❌ [REORDER_MEDIA] ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ====== GALLERY VISIBILITY SETTINGS ======

// Initialize gallery settings table (call this once)
app.post('/setup/init-gallery-settings', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Create table if not exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS gallery_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        setting_key VARCHAR(50) UNIQUE NOT NULL,
        setting_value VARCHAR(50) NOT NULL DEFAULT '1',
        description VARCHAR(255),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Insert default settings if not exist
    await connection.execute(`
      INSERT IGNORE INTO gallery_settings (setting_key, setting_value, description)
      VALUES 
        ('videos_visible', '1', 'Show/Hide video section'),
        ('photos_visible', '1', 'Show/Hide photo section')
    `);
    
    connection.release();
    
    console.log('✅ [INIT_SETTINGS] Gallery settings table initialized');
    res.json({ message: '✅ Gallery settings initialized successfully!' });
  } catch (error) {
    console.error('❌ [INIT_SETTINGS] ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ====== SIMPLIFIED GALLERY SETTINGS ENDPOINTS ======

// SIMPLE DEBUG TEST
app.get('/ping', (req, res) => {
  console.log('🔔 PING received');
  res.json({ status: 'alive', timestamp: new Date().toISOString() });
});

// Get all gallery visibility settings
app.get('/gallery-settings-get', async (req, res) => {
  try {
    console.log('🔔 GET /gallery-settings-get received');
    const connection = await pool.getConnection();
    const [settings] = await connection.execute(`SELECT setting_key, setting_value FROM gallery_settings WHERE setting_key IN ('videos_visible', 'photos_visible')`);
    connection.release();
    
    const result = { videos_visible: 1, photos_visible: 1 };
    settings.forEach(s => { 
      // Ensure values are stored as proper integers (0 or 1)
      result[s.setting_key] = parseInt(s.setting_value) === 1 ? 1 : 0;
    });
    
    console.log('✅ [GET_SETTINGS] Returned:', result);
    res.json(result);
  } catch (error) {
    console.error('❌ [GET_SETTINGS] ERROR:', error.message);
    res.json({ videos_visible: 1, photos_visible: 1 });
  }
});

// Update gallery visibility setting - SIMPLIFIED POST
app.post('/gallery-settings-update', async (req, res) => {
  try {
    const { key, value } = req.body;
    
    console.log(`🔔 POST /gallery-settings-update received: key=${key}, value=${value}`);
    
    if (!key || !['videos_visible', 'photos_visible'].includes(key)) {
      return res.status(400).json({ error: 'Invalid key' });
    }
    
    const connection = await pool.getConnection();
    const dbValue = value ? 1 : 0;
    
    await connection.execute(
      'INSERT INTO gallery_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = CURRENT_TIMESTAMP',
      [key, dbValue, dbValue]
    );
    
    connection.release();
    
    console.log(`✅ [UPDATE_SETTINGS] Successfully set ${key} = ${dbValue}`);
    res.json({ success: true, [key]: dbValue });
  } catch (error) {
    console.error('❌ [UPDATE_SETTINGS] ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 404 handler (catch-all for undefined routes)
app.use((req, res) => {
  console.warn(`⚠️ [404] Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// Error handler middleware (must be defined AFTER all routes and 404 handler)
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({ error: 'Server error: ' + err.message });
});

const PORT = 3001;

// Initialize RBAC and start server
initializeRBAC().then(() => {
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║         🚀 AURUM HOMEOPATHY - BACKEND SERVER 🚀               ║
╚════════════════════════════════════════════════════════════════╝

📊 DATABASE CONNECTION INFO:
   Host:     ${process.env.DB_HOST || 'localhost'}
   Port:     ${process.env.DB_PORT || 3306}
   User:     ${process.env.DB_USER || 'u154384799_Aurum'}
   Database: ${process.env.DB_NAME || 'u154384799_Ahc'}
   Status:   🟢 CONNECTED

🌍 SERVER STATUS:
   Protocol: http://
   Host:     localhost
   Port:     ${PORT}
   URL:      http://localhost:${PORT}
   Status:   🟢 READY

⏰ Started at: ${new Date().toISOString()}

🔗 API ENDPOINTS:

   HEALTH & DIAGNOSTICS:
   [✓] GET  /health               - Health check
   [✓] GET  /diagnose             - Full diagnostics

   AUTHENTICATION:
   [✓] POST /login                - Login user with email/password
   [✓] POST /register             - Register new user with role

   USER MANAGEMENT (Super Admin):
   [✓] GET  /users                - Get all users with roles
   [✓] POST /users                - Create new user
   [✓] GET  /users/:id            - Get single user
   [✓] PUT  /users/:id            - Update user details/role
   [✓] DELETE /users/:id          - Delete user

   APPOINTMENT MANAGEMENT:
   [✓] GET  /appointments         - Get all appointments
   [✓] POST /appointments         - Create new appointment
   [✓] GET  /appointments/:id     - Get single appointment
   [✓] PUT  /appointments/:id     - Update appointment
   [✓] DELETE /appointments/:id   - Delete appointment

   SYSTEM CONTROL:
   [✓] GET  /system-status        - Get system status
   [✓] PUT  /system-status        - Update system status

📝 LOGGING:
   All requests logged with 🔐 [METHOD] prefix
   Database operations logged in detail
   Errors logged with ❌ prefix

🎯 Ready to accept connections!
`);
  });
}).catch((err) => {
  console.error('❌ [FATAL] Failed to initialize RBAC:', err.message);
  process.exit(1);
});
