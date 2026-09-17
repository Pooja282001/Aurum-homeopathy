const https = require('https');

console.log('Starting test...');

const req = https.get('https://aurumhomeopathy.com/backend.php?action=health', {
  rejectUnauthorized: false,
  timeout: 10000
}, (res) => {
  console.log('Connected. Status:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Response:', data.substring(0, 200));
    process.exit(0);
  });
});

req.on('error', e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('TIMEOUT');
  req.destroy();
  process.exit(1);
});

console.log('Request sent, waiting for response...');
