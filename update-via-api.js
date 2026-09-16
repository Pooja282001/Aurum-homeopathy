#!/usr/bin/env node

const http = require('http');

const updates = [
  { id: 5, role: 'super_admin' },
  { id: 6, role: 'admin' },
  { id: 7, role: 'doctor' },
  { id: 8, role: 'nurse' },
  { id: 9, role: 'patient' }
];

async function updateRole(id, role) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ role });
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: `/users/${id}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          console.log(`[${res.statusCode}] Updated user ${id} to role: ${role}`);
          resolve(true);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

(async () => {
  console.log('🔄 Updating user roles via API...\n');
  
  for (const { id, role } of updates) {
    try {
      await updateRole(id, role);
    } catch (error) {
      console.error(`✗ Error updating user ${id}: ${error.message}`);
    }
  }
  
  console.log('\n✅ Role updates submitted!');
})();
