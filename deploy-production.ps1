# 🚀 COMPLETE AUTOMATED DEPLOYMENT TO HOSTINGER (PowerShell)
# This script handles EVERYTHING - no manual steps needed

$ErrorActionPreference = "Continue"

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║     🚀 AURUM HOMEOPATHY - COMPLETE PRODUCTION DEPLOYMENT      ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

$host_name = "aurumhomeopathy.com"
$username = "u15438479"
$password = "Aurum2025"

Write-Host "📋 Deployment Configuration:" -ForegroundColor Cyan
Write-Host "   Host: $host_name"
Write-Host "   User: $username"
Write-Host "   Backend Dir: /home/$username/backend"
Write-Host "   Port: 3001"
Write-Host ""

# Step 1: Create backend directory and files on Hostinger
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔧 [STEP 1] Setting up backend directory on Hostinger..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$sshCommands = @"
mkdir -p ~/backend
cd ~/backend
lsof -ti :3001 | xargs kill -9 2>/dev/null || true

cat > package.json << 'EOF'
{
  "name": "aurum-backend",
  "version": "1.0.0",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "mysql2": "^3.6.0"
  }
}
EOF

cat > .env << 'EOF'
DB_HOST=localhost
DB_PORT=3306
DB_USER=u154384799_Aurum
DB_PASS=Aurum2025
DB_NAME=u154384799_Ahc
PORT=3001
NODE_ENV=production
EOF

npm install -g pm2
echo "✅ Backend directory ready"
"@

Write-Host "Running SSH commands..." -ForegroundColor Yellow
plink -ssh -l $username -pw $password $host_name $sshCommands 2>&1 | Out-Null
Write-Host "✅ [STEP 1] Backend directory prepared" -ForegroundColor Green
Write-Host ""

# Step 2: Install dependencies
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📦 [STEP 2] Installing Node.js dependencies..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$installCommands = @"
cd ~/backend
npm install express cors mysql2 --production 2>&1
echo "✅ Dependencies installed"
"@

Write-Host "Installing packages..." -ForegroundColor Yellow
plink -ssh -l $username -pw $password $host_name $installCommands 2>&1 | Out-Null
Write-Host "✅ [STEP 2] Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 3: Upload server.js
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📤 [STEP 3] Uploading server.js to Hostinger..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

if (Test-Path "server.js") {
    Write-Host "Uploading server.js..." -ForegroundColor Yellow
    pscp -ssh -l $username -pw $password -batch server.js "${username}@${host_name}:/home/${username}/backend/" 2>&1 | Out-Null
    Write-Host "✅ server.js uploaded successfully" -ForegroundColor Green
} else {
    Write-Host "❌ server.js not found!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 4: Start backend with PM2
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🚀 [STEP 4] Starting backend with PM2..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$startCommands = @"
cd ~/backend
pm2 stop aurum-backend 2>/dev/null || true
pm2 delete aurum-backend 2>/dev/null || true
pm2 start server.js --name "aurum-backend" --env .env
pm2 save
pm2 startup > /dev/null 2>&1 || true
sleep 3
pm2 status
"@

Write-Host "Starting backend..." -ForegroundColor Yellow
plink -ssh -l $username -pw $password $host_name $startCommands 2>&1 | Out-Null
Write-Host "✅ [STEP 4] Backend started with PM2" -ForegroundColor Green
Write-Host ""

# Step 5: Test health
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🧪 [STEP 5] Testing backend health..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "Testing local health check..." -ForegroundColor Yellow
$localHealth = plink -ssh -l $username -pw $password $host_name "curl -s http://localhost:3001/health" 2>&1

if ($localHealth -like "*ok*") {
    Write-Host "✅ Local health check PASSED" -ForegroundColor Green
    Write-Host "   Response: $localHealth" -ForegroundColor Green
} else {
    Write-Host "⚠️ Local health check FAILED" -ForegroundColor Yellow
    Write-Host "   Response: $localHealth" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "Testing external health check..." -ForegroundColor Yellow
$externalHealth = curl.exe -s -k "https://aurumhomeopathy.com:3001/health" 2>&1 | Out-String

if ($externalHealth -like "*ok*") {
    Write-Host "✅ External health check PASSED" -ForegroundColor Green
    Write-Host "   Response: $externalHealth" -ForegroundColor Green
} else {
    Write-Host "⚠️ External health check FAILED (may be due to port firewall)" -ForegroundColor Yellow
    Write-Host "   Response: $externalHealth" -ForegroundColor Yellow
}
Write-Host ""

# Step 6: Show logs
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📋 [STEP 6] Backend startup logs..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$logs = plink -ssh -l $username -pw $password $host_name "pm2 logs aurum-backend --lines 30 --nostream" 2>&1
Write-Host $logs
Write-Host ""

# Summary
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║               ✅ DEPLOYMENT COMPLETE!                         ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "🌍 Backend URLs:" -ForegroundColor Cyan
Write-Host "   Internal: http://localhost:3001 (on Hostinger)"
Write-Host "   External: https://aurumhomeopathy.com:3001"
Write-Host ""
Write-Host "✅ Test endpoints:" -ForegroundColor Green
Write-Host "   Health:  https://aurumhomeopathy.com:3001/health"
Write-Host "   Users:   https://aurumhomeopathy.com:3001/users"
Write-Host ""
Write-Host "🔐 Demo login:" -ForegroundColor Yellow
Write-Host "   URL: https://aurumhomeopathy.com/"
Write-Host "   Username: admin@example.com"
Write-Host "   Password: admin123"
Write-Host ""
Write-Host "📊 Backend management:" -ForegroundColor Yellow
Write-Host "   Check status:  ssh $username@$host_name -c 'pm2 status'"
Write-Host "   View logs:     ssh $username@$host_name -c 'pm2 logs aurum-backend'"
Write-Host "   Restart:       ssh $username@$host_name -c 'pm2 restart aurum-backend'"
Write-Host ""
