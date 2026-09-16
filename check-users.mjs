#!/usr/bin/env node

import mysql from 'mysql2/promise';

async function checkUsers() {
  const pool = mysql.createPool({
    host: 'srv1752.hstgr.io',
    user: 'u154384799_Aurum',
    password: 'Aurum2025',
    database: 'u154384799_Ahc',
    waitForConnections: true,
    connectionLimit: 2,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelayMs: 0
  });
  
  try {
    console.log('Connecting to database...');
    const connection = await Promise.race([
      pool.getConnection(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000))
    ]);
    
    console.log('Getting users...');
    const [users] = await connection.execute('SELECT id, name, email, role FROM users LIMIT 15');
    
    console.log('\nCurrent users in database:');
    console.log('='.repeat(60));
    users.forEach(u => {
      console.log(`ID: ${u.id} | Email: ${u.email} | Role: ${u.role}`);
    });
    
    connection.release();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkUsers();
