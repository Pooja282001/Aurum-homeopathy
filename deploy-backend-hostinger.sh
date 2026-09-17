#!/bin/bash
# FINAL BACKEND DEPLOYMENT SCRIPT FOR HOSTINGER
# Run this script on your Hostinger server via SSH terminal

echo "🚀 AURUM BACKEND DEPLOYMENT - FINAL FIX"
echo "======================================"
echo ""

# Step 1: Navigate to home directory
echo "[1] Setting up backend directory..."
mkdir -p ~/backend
cd ~/backend
echo "✅ Backend directory created at: $(pwd)"
echo ""

# Step 2: Initialize Node.js project
echo "[2] Initializing Node.js project..."
npm init -y
echo "✅ package.json created"
echo ""

# Step 3: Install dependencies
echo "[3] Installing dependencies..."
npm install express cors mysql2
echo "✅ Dependencies installed"
echo ""

# Step 4: Install PM2 globally
echo "[4] Installing PM2 for persistent running..."
npm install -g pm2
echo "✅ PM2 installed"
echo ""

# Step 5: Create server.js file
echo "[5] Creating server.js..."
cat > server.js << 'SERVERJS'
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

// Test endpoint
app.get('/health', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute('SELECT 1');
    conn.release();
    res.json({ ok: true, database: 'connected' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Diagnose endpoint
app.get('/diagnose', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute('SELECT 1');
    conn.release();
    res.json({ 
      status: 'ok',
      backend: 'running',
      database: 'connected',
      port: 3001,
      cors: 'enabled'
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// GET Users
app.get('/users', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute(`
      SELECT u.id, u.username, u.email, u.name, u.created_at,
             GROUP_CONCAT(r.name SEPARATOR ',') as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    conn.release();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const conn = await pool.getConnection();
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    const [rows] = await conn.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (rows.length === 0 || rows[0].password_hash !== hash) {
      conn.release();
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = rows[0];
    const [roleRows] = await conn.execute(`
      SELECT r.name FROM roles r
      JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = ?
    `, [user.id]);
    
    conn.release();
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      roles: roleRows.map(r => r.name)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Register
app.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const conn = await pool.getConnection();
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    
    const [result] = await conn.execute(
      'INSERT INTO users (name, email, username, password_hash) VALUES (?, ?, ?, ?)',
      [name, email, email, hash]
    );
    
    const [roleRows] = await conn.execute(
      'SELECT id FROM roles WHERE name = ?',
      [role || 'patient']
    );
    
    if (roleRows.length > 0) {
      await conn.execute(
        'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
        [result.insertId, roleRows[0].id]
      );
    }
    
    conn.release();
    res.json({ id: result.insertId, email, name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Update User
app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, role, password } = req.body;
  try {
    const conn = await pool.getConnection();
    
    if (password) {
      const hash = crypto.createHash('sha256').update(password).digest('hex');
      await conn.execute(
        'UPDATE users SET name = ?, email = ?, password_hash = ? WHERE id = ?',
        [name, email, hash, id]
      );
    } else {
      await conn.execute(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        [name, email, id]
      );
    }
    
    if (role) {
      await conn.execute('DELETE FROM user_roles WHERE user_id = ?', [id]);
      const [roleRows] = await conn.execute(
        'SELECT id FROM roles WHERE name = ?',
        [role]
      );
      if (roleRows.length > 0) {
        await conn.execute(
          'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
          [id, roleRows[0].id]
        );
      }
    }
    
    conn.release();
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE User
app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const conn = await pool.getConnection();
    await conn.execute('DELETE FROM user_roles WHERE user_id = ?', [id]);
    await conn.execute('DELETE FROM users WHERE id = ?', [id]);
    conn.release();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Appointments
app.get('/appointments', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute(
      'SELECT * FROM appointments ORDER BY date DESC, time_slot ASC'
    );
    conn.release();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Appointment
app.post('/appointments', async (req, res) => {
  const { name, email, phone, date, time_slot, service } = req.body;
  try {
    const conn = await pool.getConnection();
    const [result] = await conn.execute(
      'INSERT INTO appointments (name, email, phone, date, time_slot, service, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, phone, date, time_slot, service, 'scheduled']
    );
    conn.release();
    res.json({ id: result.insertId, success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Update Appointment
app.put('/appointments/:id', async (req, res) => {
  const { id } = req.params;
  const { status, date, time_slot, service } = req.body;
  try {
    const conn = await pool.getConnection();
    await conn.execute(
      'UPDATE appointments SET status = ?, date = ?, time_slot = ?, service = ? WHERE id = ?',
      [status, date, time_slot, service, id]
    );
    conn.release();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Appointment
app.delete('/appointments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const conn = await pool.getConnection();
    await conn.execute('DELETE FROM appointments WHERE id = ?', [id]);
    conn.release();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET System Status
app.get('/system-status', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute('SELECT * FROM system_status LIMIT 1');
    conn.release();
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.json({ id: 1, is_online: 1, maintenance_mode: 0 });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Update System Status
app.put('/system-status', async (req, res) => {
  const { is_online, maintenance_mode, comment } = req.body;
  try {
    const conn = await pool.getConnection();
    await conn.execute(
      'UPDATE system_status SET is_online = ?, maintenance_mode = ?, comment = ?, last_updated = NOW() WHERE id = 1',
      [is_online, maintenance_mode, comment]
    );
    conn.release();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`🌍 http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
SERVERJS

echo "✅ server.js created"
echo ""

# Step 6: Start with PM2
echo "[6] Starting backend with PM2..."
pm2 start server.js --name "aurum-backend"
pm2 save
pm2 startup
echo "✅ Backend started with PM2"
echo ""

# Step 7: Check status
echo "[7] Checking backend status..."
pm2 status
echo ""

# Step 8: Test health
echo "[8] Testing health endpoint..."
sleep 2
curl http://localhost:3001/health
echo ""
echo ""

echo "======================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "======================================"
echo ""
echo "Backend is now running on:"
echo "- Internal: http://localhost:3001"
echo "- External: https://aurumhomeopathy.com:3001"
echo ""
echo "Test endpoints:"
echo "- Health: https://aurumhomeopathy.com:3001/health"
echo "- Users: https://aurumhomeopathy.com:3001/users"
echo "- Diagnose: https://aurumhomeopathy.com:3001/diagnose"
echo ""
echo "Monitor with: pm2 logs aurum-backend"
echo ""
