import http from 'http';

async function updateUserRole(userId, role) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ role });
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: `/users/${userId}`,
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
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
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

  const updates = [
    { id: 5, email: 'superadmin@test.com', role: 'super_admin' },
    { id: 6, email: 'admin@test.com', role: 'admin' },
    { id: 7, email: 'doctor@test.com', role: 'doctor' }
  ];

  for (const { id, email, role } of updates) {
    try {
      const res = await updateUserRole(id, role);
      console.log(`✓ ${email} → ${role} [${res.status}]`);
    } catch (error) {
      console.error(`✗ ${email}: ${error.message}`);
    }
  }

  // Verify
  console.log('\n✅ Verification (wait 1 second)...');
  await new Promise(r => setTimeout(r, 1000));

  const getRes = await new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/users',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({});
        }
      });
    });

    req.end();
  });

  if (getRes.users) {
    console.log('\n📋 Current users (IDs 5-7):\n');
    getRes.users.filter(u => u.id >= 5 && u.id <= 7).forEach(u => {
      console.log(`${u.id}. ${u.name} (${u.email})`);
      console.log(`   Role: ${u.role}\n`);
    });
  }

  console.log('🎉 Done!');
})();
