import http from 'http';

async function updateRole(userId, role) {
  return new Promise((resolve) => {
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
      res.on('end', () => resolve({ status: res.statusCode }));
    });

    req.on('error', () => resolve({ status: 0 }));
    req.write(data);
    req.end();
  });
}

async function checkRole(userId) {
  return new Promise((resolve) => {
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
          const data = JSON.parse(body);
          const user = data.users?.find(u => u.id === userId);
          resolve(user?.role || 'unknown');
        } catch {
          resolve('error');
        }
      });
    });

    req.end();
  });
}

(async () => {
  console.log('🔄 Updating user roles...\n');

  // Update roles
  await updateRole(5, 'super_admin');
  console.log('✓ Updated user 5');

  await updateRole(6, 'admin');
  console.log('✓ Updated user 6');

  await updateRole(7, 'doctor');
  console.log('✓ Updated user 7');

  // Wait a second
  await new Promise(r => setTimeout(r, 1500));

  // Verify
  console.log('\n📋 Verification:');
  const role5 = await checkRole(5);
  const role6 = await checkRole(6);
  const role7 = await checkRole(7);

  console.log(`User 5: ${role5} (expect: super_admin)`);
  console.log(`User 6: ${role6} (expect: admin)`);
  console.log(`User 7: ${role7} (expect: doctor)`);

  if (role5 === 'super_admin' && role6 === 'admin' && role7 === 'doctor') {
    console.log('\n✅ All roles updated successfully!');
  } else {
    console.log('\n⚠️  Roles may not have updated. Check database.');
  }
})();
