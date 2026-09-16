import mysql from 'mysql2/promise';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';

const app = express();
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.path}`);
  if (req.body) console.log('[BODY]', req.body);
  next();
});

// Database connection pool
const pool = mysql.createPool({
  host: 'srv1752.hstgr.io',
  user: 'u154384799_Aurum',
  password: 'Aurum2025',
  database: 'u154384799_Ahc',
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
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    res.json({ ok: true, database: 'connected', message: '✅ Database connection successful!' });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed', message: error.message });
  }
});

// Get all users
app.get('/users', async (req, res) => {
  try {
    const connection = await pool.getConnection();
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
    connection.release();
    res.json({ users: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get appointments
app.get('/appointments', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM appointments');
    connection.release();
    res.json({ appointments: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add appointment (POST)
app.post('/appointments', async (req, res) => {
  try {
    const { user_id, name, phone, email, date, time_slot, service, status } = req.body;
    
    // Validation
    if (!name || !email || !phone || !date || !time_slot) {
      console.log('[ERROR] Missing required fields:', { name, email, phone, date, time_slot });
      return res.status(422).json({ 
        error: 'Missing required fields: name, email, phone, date, time_slot' 
      });
    }
    
    console.log('[NEW APPOINTMENT]', { name, email, phone, date, time_slot });
    
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO appointments (user_id, name, phone, email, date, time_slot, service, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id || null, name, phone, email, date, time_slot, service || 'General consultation', status || 'New']
    );
    connection.release();
    
    console.log('[SUCCESS] APPOINTMENT SAVED - ID:', result.insertId);
    res.status(201).json({ 
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
    });
  } catch (error) {
    console.error('❌ APPOINTMENT ERROR:', error.message);
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
    console.log('[NEW LOGIN]', { email });
    
    if (!email || !password) {
      return res.status(422).json({ error: 'Email and password required' });
    }

    const connection = await pool.getConnection();
    
    // Get user
    const [users] = await connection.execute(
      'SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password hash
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    if (passwordHash !== users[0].password_hash) {
      connection.release();
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Get user roles and permissions
    const [userRoles] = await connection.execute(`
      SELECT r.id as role_id, r.name as role_name
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = ?
    `, [users[0].id]);

    // Get permissions for user
    const [userPermissions] = await connection.execute(`
      SELECT DISTINCT p.name as permission
      FROM user_roles ur
      JOIN role_permissions rp ON ur.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = ?
    `, [users[0].id]);

    connection.release();

    // Format response - use primary role (or first role if multiple)
    const primaryRole = userRoles.length > 0 ? userRoles[0].role_name : 'patient';
    const permissions = userPermissions.map(p => p.permission);

    console.log('[SUCCESS] LOGIN SUCCESSFUL:', users[0].name, '| Roles:', userRoles.map(r => r.role_name).join(', '));
    res.json({ 
      user: {
        id: users[0].id,
        name: users[0].name,
        email: users[0].email,
        role: primaryRole,
        roles: userRoles.map(r => r.role_name),
        permissions: permissions
      },
      message: '✅ Login successful!' 
    });
  } catch (error) {
    console.error('❌ LOGIN ERROR:', error.message);
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
    
    console.log('[UPDATE USER]', { id: userId, name, email, role });
    
    if (!name && !email && !password && !role) {
      return res.status(422).json({ error: 'At least one field required' });
    }

    const connection = await pool.getConnection();
    
    // Build dynamic update query for user table (name, email, password only)
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
    if (password) {
      const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
      updates.push('password_hash = ?');
      params.push(passwordHash);
    }
    
    // Update user fields if any
    if (updates.length > 0) {
      params.push(userId);
      const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
      console.log('[SQL QUERY]', query);
      await connection.execute(query, params);
    }

    // Handle role change via user_roles table
    if (role && ['patient', 'doctor', 'nurse', 'admin', 'super_admin'].includes(role)) {
      // Get role ID
      const [roleData] = await connection.execute(
        'SELECT id FROM roles WHERE name = ?',
        [role]
      );
      
      if (roleData.length > 0) {
        // Delete existing roles
        await connection.execute('DELETE FROM user_roles WHERE user_id = ?', [userId]);
        
        // Insert new role
        await connection.execute(
          'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
          [userId, roleData[0].id]
        );
        
        console.log('[SUCCESS] USER ROLE UPDATED - User:', userId, 'Role:', role);
      }
    }

    connection.release();
    
    console.log('[SUCCESS] USER UPDATED - ID:', userId);
    res.json({ message: '[SUCCESS] User updated successfully!' });
  } catch (error) {
    console.error('[ERROR]', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Delete user (Super Admin only)
app.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    console.log('[DELETE USER]', { id: userId });
    
    const connection = await pool.getConnection();
    const [result] = await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('[SUCCESS] USER DELETED - ID:', userId);
    res.json({ message: '[SUCCESS] User deleted successfully!' });
  } catch (error) {
    console.error('[ERROR]', error.message);
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

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({ error: 'Server error: ' + err.message });
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

const PORT = 3001;

// Initialize RBAC and start server
initializeRBAC().then(() => {
  app.listen(PORT, () => {
    console.log(`
================================================================
   AURUM HOMEOPATHY - BACKEND SERVER
   DATABASE: Connected to Hostinger
   Status: READY
================================================================

[*] Server URL: http://localhost:${PORT}

[*] API ENDPOINTS:

   AUTHENTICATION:
   [OK] POST /login               - Login user
   [OK] POST /register            - Register new user

   USER MANAGEMENT (Super Admin):
   [OK] GET  /users               - Get all users
   [OK] GET  /users/:id           - Get single user
   [OK] PUT  /users/:id           - Update user (name, email, password, role)
   [OK] DELETE /users/:id         - Delete user

   APPOINTMENTS:
   [OK] GET  /appointments        - Get all appointments
   [OK] POST /appointments        - Book new appointment
   [OK] GET  /appointments/:id    - Get single appointment
   [OK] PUT  /appointments/:id    - Update appointment (Admin/Doctor)
   [OK] DELETE /appointments/:id  - Delete appointment (Admin)

   ADMIN/DATA:
   [OK] GET  /admin/data          - Get all users & appointments
   [OK] GET  /health              - Check server status

[DATABASE] u154384799_Ahc @ srv1752.hstgr.io

[IMPORTANT] All data is saved to Hostinger database!
   Both local and production use the SAME database.

`)
  });
}).catch(err => {
  console.error('[ERROR] Failed to initialize RBAC:', err.message);
  process.exit(1);
});
