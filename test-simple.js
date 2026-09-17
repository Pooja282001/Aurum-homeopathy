const https = require('https');

console.log('🧪 Testing: https://aurumhomeopathy.com/backend.php?action=health\n');

const req = https.get('https://aurumhomeopathy.com/backend.php?action=health', {
  timeout: 5000,
  rejectUnauthorized: false
}, (res) => {
  console.log(`✅ Connected`);
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers:`, Object.keys(res.headers).map(k => `${k}: ${res.headers[k]}`).join(', '));
  
  let data = '';
  res.on('data', chunk => {
    console.log(`📦 Received ${chunk.length} bytes`);
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`\n📄 Response Body (${data.length} bytes):`);
    console.log(data);
    process.exit(0);
  });
});

req.on('timeout', () => {
  console.log('❌ TIMEOUT after 5000ms');
  req.destroy();
  process.exit(1);
});

req.on('error', (err) => {
  console.log(`❌ ERROR: ${err.code} - ${err.message}`);
  process.exit(1);
});
