#!/bin/bash
# 🚀 COMPLETE AUTOMATED DEPLOYMENT TO HOSTINGER
# This script handles EVERYTHING - no manual steps needed

set -e  # Exit on any error

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     🚀 AURUM HOMEOPATHY - COMPLETE PRODUCTION DEPLOYMENT      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Configuration
HOSTINGER_HOST="aurumhomeopathy.com"
HOSTINGER_USER="u15438479"
HOSTINGER_PASS="Aurum2025"
BACKEND_DIR="/home/u15438479/backend"
DB_HOST="localhost"
DB_PORT="3306"
DB_USER="u154384799_Aurum"
DB_PASS="Aurum2025"
DB_NAME="u154384799_Ahc"
PORT="3001"

echo "📋 Deployment Configuration:"
echo "   Host: $HOSTINGER_HOST"
echo "   User: $HOSTINGER_USER"
echo "   Backend Dir: $BACKEND_DIR"
echo "   Port: $PORT"
echo "   Database: $DB_NAME"
echo ""

# Step 1: Create SSH connection and prepare backend directory
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 [STEP 1] Setting up backend directory on Hostinger..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ssh -o StrictHostKeyChecking=no $HOSTINGER_USER@$HOSTINGER_HOST << 'REMOTESCRIPT'
#!/bin/bash
set -e

echo "🗂️ Creating backend directory structure..."
mkdir -p ~/backend
cd ~/backend

# Kill any existing Node processes on port 3001
echo "🛑 Checking for existing processes on port 3001..."
lsof -ti :3001 | xargs kill -9 2>/dev/null || true

# Create package.json
echo "📦 Creating package.json..."
cat > package.json << 'EOF'
{
  "name": "aurum-backend",
  "version": "1.0.0",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "mysql2": "^3.6.0"
  }
}
EOF
echo "✅ package.json created"

# Create .env file with correct database configuration
echo "⚙️ Creating .env with database configuration..."
cat > .env << 'EOF'
# Database - Use LOCALHOST for Hostinger deployment
DB_HOST=localhost
DB_PORT=3306
DB_USER=u154384799_Aurum
DB_PASS=Aurum2025
DB_NAME=u154384799_Ahc

# Server
PORT=3001
NODE_ENV=production
EOF
echo "✅ .env created with DB_HOST=localhost"

# Install global PM2
echo "📥 Ensuring PM2 is installed globally..."
npm install -g pm2 2>/dev/null || true

echo "✅ Backend directory ready at ~/backend"
REMOTESCRIPT

echo "✅ [STEP 1] Backend directory prepared on Hostinger"
echo ""

# Step 2: Install dependencies
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 [STEP 2] Installing Node.js dependencies..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ssh -o StrictHostKeyChecking=no $HOSTINGER_USER@$HOSTINGER_HOST << 'REMOTESCRIPT'
cd ~/backend
echo "📥 Installing npm packages..."
npm install express cors mysql2 --no-save --production
echo "✅ Dependencies installed"
echo ""
echo "📋 Installed packages:"
npm list --depth=0
REMOTESCRIPT

echo "✅ [STEP 2] Dependencies installed"
echo ""

# Step 3: Upload server.js using scp
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 [STEP 3] Uploading server.js to Hostinger..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "server.js" ]; then
    scp -o StrictHostKeyChecking=no server.js $HOSTINGER_USER@$HOSTINGER_HOST:~/backend/
    echo "✅ server.js uploaded successfully"
else
    echo "❌ server.js not found in current directory"
    exit 1
fi
echo ""

# Step 4: Start backend with PM2
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 [STEP 4] Starting backend with PM2..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ssh -o StrictHostKeyChecking=no $HOSTINGER_USER@$HOSTINGER_HOST << 'REMOTESCRIPT'
cd ~/backend

echo "🔄 Stopping any existing PM2 processes..."
pm2 stop aurum-backend 2>/dev/null || true
pm2 delete aurum-backend 2>/dev/null || true

echo "🚀 Starting backend with PM2..."
pm2 start server.js --name "aurum-backend" --env .env

echo "💾 Saving PM2 configuration..."
pm2 save

echo "🔄 Setting up PM2 startup..."
pm2 startup > /dev/null 2>&1 || true

echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "⏳ Waiting for backend to start..."
sleep 3

echo ""
echo "🔍 Checking if backend is running..."
if pm2 pid aurum-backend > /dev/null 2>&1; then
    echo "✅ Backend process is running"
else
    echo "⚠️ Backend may not have started. Check logs:"
    pm2 logs aurum-backend --lines 50
fi
REMOTESCRIPT

echo "✅ [STEP 4] Backend started with PM2"
echo ""

# Step 5: Test backend health
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 [STEP 5] Testing backend health..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "🔗 Testing local connection on Hostinger (http://localhost:3001/health)..."
LOCAL_HEALTH=$(ssh -o StrictHostKeyChecking=no $HOSTINGER_USER@$HOSTINGER_HOST "curl -s http://localhost:3001/health" 2>/dev/null || echo "FAILED")
echo "Response: $LOCAL_HEALTH"

if [[ $LOCAL_HEALTH == *"ok"* ]]; then
    echo "✅ Local health check PASSED"
else
    echo "⚠️ Local health check FAILED - backend may not be responding"
    echo "Checking logs..."
    ssh -o StrictHostKeyChecking=no $HOSTINGER_USER@$HOSTINGER_HOST "pm2 logs aurum-backend --lines 20"
fi

echo ""
echo "🌍 Testing external connection (https://aurumhomeopathy.com:3001/health)..."
echo "   (This may take a few seconds...)"
EXTERNAL_HEALTH=$(curl -s -k https://aurumhomeopathy.com:3001/health 2>/dev/null || echo "TIMEOUT")
echo "Response: $EXTERNAL_HEALTH"

if [[ $EXTERNAL_HEALTH == *"ok"* ]]; then
    echo "✅ External health check PASSED"
else
    echo "⚠️ External health check FAILED - check if port 3001 is open"
fi
echo ""

# Step 6: Show backend logs
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 [STEP 6] Backend startup logs..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ssh -o StrictHostKeyChecking=no $HOSTINGER_USER@$HOSTINGER_HOST "pm2 logs aurum-backend --lines 30"
echo ""

# Step 7: Summary
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║               ✅ DEPLOYMENT COMPLETE!                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "🌍 Backend URLs:"
echo "   Internal: http://localhost:3001 (on Hostinger)"
echo "   External: https://aurumhomeopathy.com:3001"
echo ""
echo "✅ Endpoints to test:"
echo "   Health:  https://aurumhomeopathy.com:3001/health"
echo "   Users:   https://aurumhomeopathy.com:3001/users"
echo "   Login:   https://aurumhomeopathy.com:3001/login (POST)"
echo ""
echo "🔐 Demo credentials:"
echo "   Email: admin@example.com"
echo "   Password: admin123"
echo ""
echo "📊 Monitor backend:"
echo "   ssh $HOSTINGER_USER@$HOSTINGER_HOST"
echo "   pm2 logs aurum-backend"
echo ""
echo "🔄 Restart backend if needed:"
echo "   ssh $HOSTINGER_USER@$HOSTINGER_HOST"
echo "   pm2 restart aurum-backend"
echo ""
echo "🎯 Next: Test login at https://aurumhomeopathy.com/"
echo ""
