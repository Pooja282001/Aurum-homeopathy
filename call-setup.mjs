import http from 'http';

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/setup/clean',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': 0
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Response Status:', res.statusCode);
    try {
      const parsed = JSON.parse(data);
      console.log('\n✅ Setup Complete!\n');
      if (parsed.users) {
        console.log('📝 Created Users:\n');
        parsed.users.forEach((u, i) => {
          console.log(`${i + 1}. ${u.role.toUpperCase()}`);
          console.log(`   Email: ${u.email}`);
          console.log(`   Password: ${u.password}\n`);
        });
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.end();
console.log('🚀 Calling /setup/clean endpoint...\n');
