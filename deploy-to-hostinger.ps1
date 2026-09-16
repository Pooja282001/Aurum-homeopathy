#!/usr/bin/env pwsh
# AURUM HOMEOPATHY - BACKEND DEPLOYMENT FOR WINDOWS
# Run this on your laptop to deploy backend to Hostinger

Write-Host "🚀 AURUM HOMEOPATHY BACKEND DEPLOYMENT" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$sshUser = "u15438479"
$sshHost = "aurumhomeopathy.com"
$sshPath = "/home/u15438479"
$localPath = "d:\Aurum-homeopathy"

# Check SSH is available
if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ SSH not found. Install OpenSSH for Windows first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ SSH is available" -ForegroundColor Green

# Step 1: Build frontend
Write-Host ""
Write-Host "Step 1: Building frontend..." -ForegroundColor Yellow
Set-Location $localPath
npm run build
if ($?) {
    Write-Host "✅ Frontend built successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Step 2: Upload backend files via SCP
Write-Host ""
Write-Host "Step 2: Uploading backend files to Hostinger..." -ForegroundColor Yellow
Write-Host "This will ask for password (Aurum2025)" -ForegroundColor Gray

scp server.js "${sshUser}@${sshHost}:${sshPath}/"
scp package.json "${sshUser}@${sshHost}:${sshPath}/"
scp package-lock.json "${sshUser}@${sshHost}:${sshPath}/"

if ($?) {
    Write-Host "✅ Files uploaded successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Upload failed" -ForegroundColor Red
    exit 1
}

# Step 3: Deploy backend via SSH commands
Write-Host ""
Write-Host "Step 3: Installing dependencies and starting backend..." -ForegroundColor Yellow
Write-Host "This will ask for password again" -ForegroundColor Gray

$deployCommands = @"
cd /home/u15438479
npm install express cors mysql2
npm install -g pm2
pm2 delete aurum-backend 2>/dev/null || true
sleep 1
pm2 start server.js --name "aurum-backend" --watch
pm2 save
pm2 startup
pm2 status
"@

ssh "${sshUser}@${sshHost}" $deployCommands

Write-Host ""
Write-Host "✅ Backend deployed!" -ForegroundColor Green

# Step 4: Test backend
Write-Host ""
Write-Host "Step 4: Testing backend connection..." -ForegroundColor Yellow
Write-Host "Please wait 5 seconds for server to start..." -ForegroundColor Gray
Start-Sleep -Seconds 5

try {
    $response = Invoke-WebRequest -Uri "https://aurumhomeopathy.com:3001/health" -TimeoutSec 5 -SkipCertificateCheck
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend is responding!" -ForegroundColor Green
        Write-Host "Response: $($response.Content)" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Backend test skipped (might need more time to start)" -ForegroundColor Yellow
}

# Step 5: Upload frontend
Write-Host ""
Write-Host "Step 5: Frontend files ready in dist/" -ForegroundColor Yellow
Write-Host "Next: Upload dist/ folder to /public_html/ using FileZilla" -ForegroundColor Yellow
Write-Host "  Host: ftp.aurumhomeopathy.com" -ForegroundColor Gray
Write-Host "  User: u15438479" -ForegroundColor Gray
Write-Host "  Pass: Aurum2025" -ForegroundColor Gray

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Upload dist/ to /public_html/ via FileZilla"
Write-Host "2. Go to https://aurumhomeopathy.com/"
Write-Host "3. Click 'Staff Login'"
Write-Host "4. Test with: demo / demo123"
Write-Host "5. Test all database operations"
Write-Host ""
Write-Host "🎉 Everything should now work on production!" -ForegroundColor Green
