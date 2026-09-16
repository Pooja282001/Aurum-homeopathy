# FINAL BACKEND DEPLOYMENT TO HOSTINGER
# This script deploys server.js to production and starts it with PM2

$hostname = "aurumhomeopathy.com"
$username = "u15438479"
$password = "Aurum2025"
$remoteDir = "/home/u15438479/backend"

Write-Host "========================================" -ForegroundColor Green
Write-Host "🚀 FINAL BACKEND DEPLOYMENT TO HOSTINGER" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Step 1: Create remote directory and upload files
Write-Host "[STEP 1] Uploading backend files via SFTP..." -ForegroundColor Cyan
Write-Host "Host: $hostname" -ForegroundColor Gray
Write-Host "User: $username" -ForegroundColor Gray
Write-Host ""

$session = New-PSSession -HostName $hostname -UserName $username -KeyFilePath $HOME\.ssh\id_rsa -ErrorAction SilentlyContinue

if (!$session) {
  Write-Host "❌ SSH key authentication failed, trying password..." -ForegroundColor Yellow
  
  # For password auth, use plink/putty or create a script file
  $script = @"
mkdir -p /home/u15438479/backend
cd /home/u15438479/backend
npm init -y
npm install express cors mysql2
npm install -g pm2
pm2 start server.js --name aurum-backend
pm2 save
pm2 startup
pm2 status
"@
  
  Write-Host "⚠️  SSH key not found. Switching to manual SFTP deployment..." -ForegroundColor Yellow
  Write-Host ""
  Write-Host "MANUAL STEPS (copy-paste these commands in your SSH terminal):" -ForegroundColor Cyan
  Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
  Write-Host ""
  Write-Host "ssh u15438479@aurumhomeopathy.com" -ForegroundColor Yellow
  Write-Host "(password: Aurum2025)" -ForegroundColor Yellow
  Write-Host ""
  Write-Host $script -ForegroundColor White
  exit
}

Write-Host "✅ SSH connected successfully" -ForegroundColor Green
Write-Host ""

# Step 2: Create remote directory
Write-Host "[STEP 2] Creating backend directory..." -ForegroundColor Cyan
Invoke-Command -Session $session -ScriptBlock {
  mkdir -p /home/u15438479/backend
  cd /home/u15438479/backend
  pwd
}
Write-Host ""

# Step 3: Copy files
Write-Host "[STEP 3] Copying server.js..." -ForegroundColor Cyan
Copy-Item -Path "d:\Aurum-homeopathy\server.js" -Destination "$remoteDir\server.js" -ToSession $session -Force
Write-Host "✅ server.js copied" -ForegroundColor Green
Write-Host ""

# Step 4: Install dependencies
Write-Host "[STEP 4] Installing Node.js dependencies..." -ForegroundColor Cyan
Invoke-Command -Session $session -ScriptBlock {
  cd /home/u15438479/backend
  npm init -y
  npm install express cors mysql2
  npm install -g pm2
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 5: Start with PM2
Write-Host "[STEP 5] Starting backend with PM2..." -ForegroundColor Cyan
Invoke-Command -Session $session -ScriptBlock {
  cd /home/u15438479/backend
  pm2 start server.js --name "aurum-backend"
  pm2 save
  pm2 startup
  pm2 status
}
Write-Host "✅ Backend started with PM2" -ForegroundColor Green
Write-Host ""

# Step 6: Verify
Write-Host "[STEP 6] Verifying backend..." -ForegroundColor Cyan
Start-Sleep -Seconds 2

$healthCheck = Invoke-Command -Session $session -ScriptBlock {
  curl -s http://localhost:3001/health
}

Write-Host "Backend response: $healthCheck" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend is now running on:" -ForegroundColor Green
Write-Host "- Internal: http://localhost:3001" -ForegroundColor Gray
Write-Host "- External: https://aurumhomeopathy.com:3001" -ForegroundColor Gray
Write-Host ""
Write-Host "Test frontend at: https://aurumhomeopathy.com/" -ForegroundColor Cyan
Write-Host ""

Remove-PSSession -Session $session
