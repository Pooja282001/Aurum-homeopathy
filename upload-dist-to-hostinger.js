#!/usr/bin/env node
/**
 * Automated FTP Upload Script for Hostinger
 * Uploads dist/ folder contents to /public_html/
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('basic-ftp');

const FTP_CONFIG = {
  host: 'ftp.aurumhomeopathy.com',
  user: 'u15438479',
  password: 'Aurum2025',
  port: 21
};

const LOCAL_DIST = path.join(__dirname, 'dist');
const REMOTE_PATH = '/public_html';

async function uploadDistToHostinger() {
  const client = new Client();
  
  try {
    console.log('🔌 Connecting to Hostinger FTP...');
    console.log(`   Host: ${FTP_CONFIG.host}`);
    console.log(`   User: ${FTP_CONFIG.user}`);
    
    await client.access(FTP_CONFIG);
    console.log('✅ Connected to Hostinger\n');

    // Change to public_html directory
    await client.cd(REMOTE_PATH);
    console.log(`📂 Changed to remote directory: ${REMOTE_PATH}\n`);

    // Upload all files from dist/
    console.log('📤 Uploading dist folder contents...\n');
    
    const uploadedFiles = [];
    const failedFiles = [];

    // Upload index.html
    try {
      const indexPath = path.join(LOCAL_DIST, 'index.html');
      if (fs.existsSync(indexPath)) {
        await client.uploadFrom(indexPath, 'index.html');
        uploadedFiles.push('✅ index.html');
        console.log('✅ index.html uploaded');
      }
    } catch (err) {
      failedFiles.push(`❌ index.html: ${err.message}`);
    }

    // Upload assets folder
    try {
      const assetsPath = path.join(LOCAL_DIST, 'assets');
      if (fs.existsSync(assetsPath)) {
        await uploadDirectory(client, assetsPath, 'assets');
        uploadedFiles.push('✅ assets/ folder');
        console.log('✅ assets/ folder uploaded');
      }
    } catch (err) {
      failedFiles.push(`❌ assets/: ${err.message}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 UPLOAD SUMMARY');
    console.log('='.repeat(60));
    
    if (uploadedFiles.length > 0) {
      console.log('\n✅ Successfully Uploaded:');
      uploadedFiles.forEach(f => console.log('   ' + f));
    }
    
    if (failedFiles.length > 0) {
      console.log('\n❌ Failed Uploads:');
      failedFiles.forEach(f => console.log('   ' + f));
    }

    console.log('\n📍 Remote Location: /public_html/');
    console.log('🌐 Website: https://aurumhomeopathy.com/\n');

    console.log('✅ Upload complete! Your site will update within 1-2 minutes.');
    console.log('   Next: Refresh https://aurumhomeopathy.com/ with Ctrl+Shift+R\n');

  } catch (error) {
    console.error('❌ FTP Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 FTP connection closed');
  }
}

async function uploadDirectory(client, localDir, remoteDir) {
  try {
    // Create directory if it doesn't exist
    await client.ensureDir(remoteDir);
    
    // List all files in local directory
    const files = fs.readdirSync(localDir);
    
    for (const file of files) {
      const localPath = path.join(localDir, file);
      const stat = fs.statSync(localPath);
      
      if (stat.isDirectory()) {
        // Recursively upload subdirectories
        await uploadDirectory(client, localPath, `${remoteDir}/${file}`);
      } else {
        // Upload file
        const remotePath = `${remoteDir}/${file}`;
        await client.uploadFrom(localPath, remotePath);
        console.log(`   ✓ ${remotePath}`);
      }
    }
  } catch (err) {
    throw new Error(`Failed to upload directory ${remoteDir}: ${err.message}`);
  }
}

// Run the upload
console.log('\n' + '='.repeat(60));
console.log('🚀 AURUM HOMEOPATHY - DIST UPLOAD TO HOSTINGER');
console.log('='.repeat(60) + '\n');

uploadDistToHostinger().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
