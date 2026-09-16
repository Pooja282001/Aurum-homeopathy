#!/usr/bin/env node

/**
 * System Status Table Verification Script
 * Tests API endpoints and database updates
 */

import fetch from 'node-fetch';
import mysql from 'mysql2/promise';

const API_URL = 'http://localhost:3001';
const DB_CONFIG = {
  host: 'srv1752.hstgr.io',
  user: 'u154384799_Aurum',
  password: 'Aurum2025',
  database: 'u154384799_Ahc'
};

let connection;

async function log(title, message) {
  const time = new Date().toLocaleTimeString();
  console.log(`\n[${time}] ${title}`);
  console.log(`${message}`);
}

async function dbQuery(query) {
  try {
    const [rows] = await connection.execute(query);
    return rows;
  } catch (error) {
    console.error('❌ DB Error:', error.message);
    return null;
  }
}

async function apiCall(method, endpoint, body = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('❌ API Error:', error.message);
    return { ok: false, status: 0, data: null };
  }
}

async function test1_CheckTableExists() {
  await log('TEST 1: Check if system_status table exists', 'Querying database schema...');
  
  const result = await dbQuery(`
    SELECT TABLE_NAME FROM information_schema.TABLES 
    WHERE TABLE_SCHEMA = 'u154384799_Ahc' AND TABLE_NAME = 'system_status'
  `);
  
  if (result && result.length > 0) {
    console.log('✅ Table EXISTS');
    return true;
  } else {
    console.log('❌ Table DOES NOT EXIST');
    return false;
  }
}

async function test2_CheckTableStructure() {
  await log('TEST 2: Verify table structure', 'Checking columns...');
  
  const result = await dbQuery('DESCRIBE system_status');
  
  if (result) {
    console.log('✅ Table Structure:');
    result.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} (Default: ${col.Default})`);
    });
    return true;
  }
  return false;
}

async function test3_CheckTableData() {
  await log('TEST 3: Check current data in table', 'Querying system_status record...');
  
  const result = await dbQuery('SELECT * FROM system_status WHERE id = 1');
  
  if (result && result.length > 0) {
    const row = result[0];
    console.log('✅ Current Status:');
    console.log(`   - ID: ${row.id}`);
    console.log(`   - Online: ${row.is_online === 1 ? '✅ YES' : '❌ NO'}`);
    console.log(`   - Maintenance: ${row.maintenance_mode === 1 ? '⚙️ ON' : '⭕ OFF'}`);
    console.log(`   - Comment: "${row.comment || '(empty)'}"`);
    console.log(`   - Last Updated: ${row.last_updated}`);
    return true;
  }
  return false;
}

async function test4_APIFetchStatus() {
  await log('TEST 4: Test GET /system-status API', 'Calling API endpoint...');
  
  const result = await apiCall('GET', '/system-status');
  
  if (result.ok) {
    console.log('✅ API Response:');
    console.log(`   - isOnline: ${result.data.isOnline ? '✅ YES' : '❌ NO'}`);
    console.log(`   - maintenanceMode: ${result.data.maintenanceMode ? '⚙️ ON' : '⭕ OFF'}`);
    console.log(`   - comment: "${result.data.comment || '(empty)'}"`);
    return true;
  } else {
    console.log(`❌ API Error (Status ${result.status}):`, result.data);
    return false;
  }
}

async function test5_APIUpdateStatus() {
  await log('TEST 5: Test PUT /system-status API (Toggle Offline)', 'Updating status...');
  
  const updateData = {
    isOnline: false,
    maintenanceMode: false,
    comment: 'Test: System offline for database backup',
    userId: 1  // Super admin ID
  };
  
  const result = await apiCall('PUT', '/system-status', updateData);
  
  if (result.ok) {
    console.log('✅ Update Successful:');
    console.log(`   - isOnline: ${result.data.isOnline ? '✅ YES' : '❌ NO'}`);
    console.log(`   - maintenanceMode: ${result.data.maintenanceMode ? '⚙️ ON' : '⭕ OFF'}`);
    console.log(`   - comment: "${result.data.comment}"`);
    return true;
  } else {
    console.log(`❌ API Error (Status ${result.status}):`, result.data);
    return false;
  }
}

async function test6_VerifyDatabaseUpdated() {
  await log('TEST 6: Verify database was actually updated', 'Checking database...');
  
  const result = await dbQuery('SELECT * FROM system_status WHERE id = 1');
  
  if (result && result.length > 0) {
    const row = result[0];
    console.log('✅ Database Status After Update:');
    console.log(`   - Online: ${row.is_online === 1 ? '✅ YES' : '❌ NO'}`);
    console.log(`   - Maintenance: ${row.maintenance_mode === 1 ? '⚙️ ON' : '⭕ OFF'}`);
    console.log(`   - Comment: "${row.comment}"`);
    console.log(`   - Last Updated: ${row.last_updated}`);
    
    // Verify values match what we sent
    if (row.is_online === 0 && row.comment.includes('database backup')) {
      console.log('✅ Values match expected update!');
      return true;
    }
    return false;
  }
  return false;
}

async function test7_APIUpdateMaintenance() {
  await log('TEST 7: Test PUT /system-status API (Enable Maintenance)', 'Updating to maintenance mode...');
  
  const updateData = {
    isOnline: true,
    maintenanceMode: true,
    comment: 'Test: Server maintenance in progress. ETA: 30 minutes',
    userId: 1
  };
  
  const result = await apiCall('PUT', '/system-status', updateData);
  
  if (result.ok) {
    console.log('✅ Maintenance Mode Enabled:');
    console.log(`   - isOnline: ${result.data.isOnline ? '✅ YES' : '❌ NO'}`);
    console.log(`   - maintenanceMode: ${result.data.maintenanceMode ? '⚙️ ON' : '⭕ OFF'}`);
    console.log(`   - comment: "${result.data.comment}"`);
    return true;
  } else {
    console.log(`❌ API Error (Status ${result.status}):`, result.data);
    return false;
  }
}

async function test8_VerifyMaintenanceInDB() {
  await log('TEST 8: Verify maintenance update in database', 'Checking database...');
  
  const result = await dbQuery('SELECT * FROM system_status WHERE id = 1');
  
  if (result && result.length > 0) {
    const row = result[0];
    console.log('✅ Database Status After Maintenance Update:');
    console.log(`   - Online: ${row.is_online === 1 ? '✅ YES' : '❌ NO'}`);
    console.log(`   - Maintenance: ${row.maintenance_mode === 1 ? '⚙️ ON' : '⭕ OFF'}`);
    console.log(`   - Comment: "${row.comment}"`);
    
    if (row.maintenance_mode === 1 && row.comment.includes('maintenance')) {
      console.log('✅ Maintenance values correctly stored!');
      return true;
    }
    return false;
  }
  return false;
}

async function test9_APIReturnToOnline() {
  await log('TEST 9: Test PUT /system-status API (Return to Online)', 'Updating to online...');
  
  const updateData = {
    isOnline: true,
    maintenanceMode: false,
    comment: '',
    userId: 1
  };
  
  const result = await apiCall('PUT', '/system-status', updateData);
  
  if (result.ok) {
    console.log('✅ System Back Online:');
    console.log(`   - isOnline: ${result.data.isOnline ? '✅ YES' : '❌ NO'}`);
    console.log(`   - maintenanceMode: ${result.data.maintenanceMode ? '⚙️ ON' : '⭕ OFF'}`);
    console.log(`   - comment: "${result.data.comment || '(empty)'}"`);
    return true;
  } else {
    console.log(`❌ API Error (Status ${result.status}):`, result.data);
    return false;
  }
}

async function test10_FinalStatus() {
  await log('TEST 10: Final verification - System should be ONLINE', 'Checking final state...');
  
  const dbResult = await dbQuery('SELECT * FROM system_status WHERE id = 1');
  const apiResult = await apiCall('GET', '/system-status');
  
  if (dbResult && dbResult.length > 0 && apiResult.ok) {
    const dbRow = dbResult[0];
    console.log('✅ FINAL STATUS:');
    console.log('\nDatabase:');
    console.log(`   - Online: ${dbRow.is_online === 1 ? '✅ YES' : '❌ NO'}`);
    console.log(`   - Maintenance: ${dbRow.maintenance_mode === 1 ? '⚙️ ON' : '⭕ OFF'}`);
    console.log(`   - Comment: "${dbRow.comment || '(empty)'}"`);
    
    console.log('\nAPI Response:');
    console.log(`   - isOnline: ${apiResult.data.isOnline ? '✅ YES' : '❌ NO'}`);
    console.log(`   - maintenanceMode: ${apiResult.data.maintenanceMode ? '⚙️ ON' : '⭕ OFF'}`);
    console.log(`   - comment: "${apiResult.data.comment || '(empty)'}"`);
    
    return true;
  }
  return false;
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('  SYSTEM STATUS TABLE VERIFICATION TEST SUITE');
  console.log('='.repeat(60));
  
  try {
    // Connect to database
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Database connected');
    
    // Run all tests
    const tests = [
      test1_CheckTableExists,
      test2_CheckTableStructure,
      test3_CheckTableData,
      test4_APIFetchStatus,
      test5_APIUpdateStatus,
      test6_VerifyDatabaseUpdated,
      test7_APIUpdateMaintenance,
      test8_VerifyMaintenanceInDB,
      test9_APIReturnToOnline,
      test10_FinalStatus
    ];
    
    let passed = 0;
    for (const test of tests) {
      try {
        const result = await test();
        if (result) passed++;
      } catch (error) {
        console.error('❌ Test error:', error.message);
      }
      await new Promise(r => setTimeout(r, 500));
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log(`  SUMMARY: ${passed}/${tests.length} tests passed`);
    console.log('='.repeat(60) + '\n');
    
    if (passed === tests.length) {
      console.log('🎉 ALL TESTS PASSED! System status table is working correctly!\n');
    } else {
      console.log(`⚠️  ${tests.length - passed} test(s) failed. Check the output above.\n`);
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  } finally {
    if (connection) await connection.end();
    process.exit();
  }
}

main();
