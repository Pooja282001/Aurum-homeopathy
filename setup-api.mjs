import http from 'http';

const baseURL = 'http://localhost:3001';

async function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

(async () => {
  console.log('🚀 Starting clean setup via API...\n');

  try {
    // Get all users
    console.log('📊 Fetching all users...');
    const getUsersRes = await makeRequest('GET', '/users');
    const allUsers = getUsersRes.body?.users || [];
    console.log(`Found ${allUsers.length} users\n`);

    // Delete all users
    console.log('🗑️  Deleting all users...');
    for (const user of allUsers) {
      const deleteRes = await makeRequest('DELETE', `/users/${user.id}`);
      console.log(`✓ Deleted user ${user.id} (${user.email})`);
    }
    console.log();

    // Create 3 new users
    console.log('👤 Creating 3 new users...\n');

    const newUsers = [
      { name: 'Super Admin', email: 'superadmin@test.com', password: 'super123', role: 'super_admin' },
      { name: 'Admin', email: 'admin@test.com', password: 'admin123', role: 'admin' },
      { name: 'Doctor', email: 'doctor@test.com', password: 'doctor123', role: 'doctor' }
    ];

    for (const user of newUsers) {
      const registerRes = await makeRequest('POST', '/register', {
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role
      });
      
      if (registerRes.status === 200 || registerRes.status === 201) {
        console.log(`✓ Created ${user.role.toUpperCase()}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Pass: ${user.password}\n`);
      } else {
        console.log(`✗ Failed to create ${user.email}`);
        console.log(`  Response: ${JSON.stringify(registerRes.body)}\n`);
      }
    }

    // Verify final state
    console.log('✅ FINAL VERIFICATION:\n');
    const finalRes = await makeRequest('GET', '/users');
    const finalUsers = finalRes.body?.users || [];
    
    finalUsers.forEach((u, idx) => {
      console.log(`${idx + 1}. ${u.name}`);
      console.log(`   Email: ${u.email}`);
      console.log(`   Role: ${u.role}\n`);
    });

    console.log('🎉 Setup complete!');
    console.log('\n📝 Test these credentials:\n');
    newUsers.forEach(u => {
      console.log(`${u.role.padEnd(12)} | ${u.email.padEnd(25)} | ${u.password}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})();
