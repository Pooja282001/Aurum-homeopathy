#!/usr/bin/env node
/**
 * Aurum Homeopathy Backend Test Script
 * Tests all backend endpoints and reports status
 */

const https = require('https');
const http = require('http');

const tests = [
  {
    name: 'Production Health Check',
    url: 'https://aurumhomeopathy.com/backend.php?action=health',
    method: 'GET',
    timeout: 10000
  },
  {
    name: 'Production Login Test (admin)',
    url: 'https://aurumhomeopathy.com/backend.php?action=login',
    method: 'POST',
    body: { email: 'admin@example.com', password: 'admin123' },
    timeout: 10000
  },
  {
    name: 'Production Get Users',
    url: 'https://aurumhomeopathy.com/backend.php?action=users',
    method: 'GET',
    timeout: 10000
  }
];

async function runTests() {
  console.log('🧪 Testing Aurum Homeopathy Backend\n');
  console.log('=' .repeat(60));
  
  for (const test of tests) {
    await runTest(test);
  }
  
  console.log('=' .repeat(60));
  console.log('\n✅ Tests complete');
}

function runTest(test) {
  return new Promise((resolve) => {
    console.log(`\n📝 Test: ${test.name}`);
    console.log(`URL: ${test.url}`);
    console.log(`Method: ${test.method}`);
    
    const protocol = test.url.startsWith('https') ? https : http;
    const startTime = Date.now();
    
    const opts = {
      method: test.method,
      timeout: test.timeout,
      rejectUnauthorized: false
    };
    
    const req = protocol.request(test.url, opts, (res) => {
      let data = '';
      
      console.log(`\n📊 Response Headers:`);
      console.log(`  Status: ${res.statusCode}`);
      console.log(`  Content-Type: ${res.headers['content-type']}`);
      console.log(`  CORS Allow Origin: ${res.headers['access-control-allow-origin'] || 'NOT SET'}`);
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const elapsed = Date.now() - startTime;
        console.log(`\n⏱️  Response Time: ${elapsed}ms`);
        
        try {
          const json = JSON.parse(data);
          console.log(`✅ Valid JSON Response:`);
          console.log(`  ${JSON.stringify(json).substring(0, 200)}...`);
        } catch (e) {
          console.log(`❌ Invalid JSON - First 200 chars:`);
          console.log(`  ${data.substring(0, 200)}...`);
        }
        
        console.log('\n' + '-'.repeat(60));
        resolve();
      });
    });
    
    req.on('error', (err) => {
      const elapsed = Date.now() - startTime;
      console.log(`\n❌ ERROR after ${elapsed}ms:`);
      console.log(`  ${err.code}: ${err.message}`);
      console.log('\n' + '-'.repeat(60));
      resolve();
    });
    
    req.on('timeout', () => {
      console.log(`\n⏱️  TIMEOUT - request exceeded ${test.timeout}ms`);
      req.destroy();
      console.log('\n' + '-'.repeat(60));
      resolve();
    });
    
    if (test.body) {
      req.write(JSON.stringify(test.body));
    }
    
    req.end();
  });
}

runTests().catch(console.error);
