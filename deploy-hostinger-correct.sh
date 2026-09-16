#!/bin/bash
# 🚀 DEPLOY BACKEND TO HOSTINGER - USING CORRECT SSH PORT 65002

# Hostinger SSH Details (from control panel):
HOSTINGER_IP="46.202.161.61"
HOSTINGER_PORT="65002"
HOSTINGER_USER="u15438479"
HOSTINGER_PASS="Aurum2025"

echo "🚀 AURUM BACKEND DEPLOYMENT - HOSTINGER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 SSH Configuration:"
echo "   IP:       $HOSTINGER_IP"
echo "   Port:     $HOSTINGER_PORT"
echo "   User:     $HOSTINGER_USER"
echo ""

# Step 1: Setup backend directory
echo "🔧 [STEP 1] Setting up backend directory..."
ssh -p $HOSTINGER_PORT $HOSTINGER_USER@$HOSTINGER_IP << 'EOF'
cd ~
rm -rf backend
mkdir -p backend
cd backend

# Create package.json
cat > package.json << 'JSONEOF'
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
JSONEOF

# Create .env with LOCALHOST (KEY FIX FOR HOSTINGER)
cat > .env << 'ENVEOF'
DB_HOST=localhost
DB_PORT=3306
DB_USER=u154384799_Aurum
DB_PASS=Aurum2025
DB_NAME=u154384799_Ahc
PORT=3001
NODE_ENV=production
ENVEOF

echo "✅ Files created"
pwd
ls -la
EOF

echo "✅ [STEP 1] Backend directory ready"
echo ""

# Step 2: Install dependencies
echo "📦 [STEP 2] Installing Node.js dependencies..."
ssh -p $HOSTINGER_PORT $HOSTINGER_USER@$HOSTINGER_IP << 'EOF'
cd ~/backend
npm install express cors mysql2 --production
npm install -g pm2
echo "✅ Dependencies installed"
EOF

echo "✅ [STEP 2] Dependencies installed"
echo ""

# Step 3: Upload server.js
echo "📤 [STEP 3] Uploading server.js..."
scp -P $HOSTINGER_PORT server.js $HOSTINGER_USER@$HOSTINGER_IP:~/backend/
echo "✅ [STEP 3] server.js uploaded"
echo ""

# Step 4: Start backend
echo "🚀 [STEP 4] Starting backend with PM2..."
ssh -p $HOSTINGER_PORT $HOSTINGER_USER@$HOSTINGER_IP << 'EOF'
cd ~/backend

# Stop any existing
pm2 stop aurum-backend 2>/dev/null || true
pm2 delete aurum-backend 2>/dev/null || true

# Start new
pm2 start server.js --name "aurum-backend" --env .env
pm2 save
pm2 startup > /dev/null 2>&1 || true

echo "✅ Backend started"
sleep 2

pm2 status
pm2 logs aurum-backend --lines 20 --nostream
EOF

echo ""
echo "✅ [STEP 4] Backend started with PM2"
echo ""

# Step 5: Test health
echo "🧪 [STEP 5] Testing backend..."
echo "Testing local connection..."
LOCAL_TEST=$(ssh -p $HOSTINGER_PORT $HOSTINGER_USER@$HOSTINGER_IP "curl -s http://localhost:3001/health" 2>/dev/null || echo "TIMEOUT")
echo "Response: $LOCAL_TEST"

if [[ $LOCAL_TEST == *"ok"* ]]; then
    echo "✅ Backend is responding on localhost:3001"
else
    echo "⚠️ Backend may not be responding yet"
fi
echo ""

# Step 6: Summary
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║               ✅ DEPLOYMENT COMPLETE!                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "🌍 Backend URLs:"
echo "   Internal: http://localhost:3001 (on Hostinger)"
echo "   External: https://aurumhomeopathy.com:3001"
echo ""
echo "✅ Test endpoints in browser:"
echo "   https://aurumhomeopathy.com:3001/health"
echo "   https://aurumhomeopathy.com:3001/users"
echo ""
echo "🔐 Login test:"
echo "   URL: https://aurumhomeopathy.com/"
echo "   Email: admin@example.com"
echo "   Password: admin123"
echo ""
echo "📊 Monitor backend:"
echo "   ssh -p 65002 u15438479@46.202.161.61"
echo "   pm2 status"
echo "   pm2 logs aurum-backend"
echo ""
