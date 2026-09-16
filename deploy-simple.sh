#!/bin/bash
# 🚀 ABSOLUTE SIMPLEST DEPLOYMENT - JUST RUN THIS

# Copy-paste this ENTIRE script into your SSH terminal on Hostinger
# That's it! One script does everything.

echo "🚀 AURUM BACKEND DEPLOYMENT - STARTING"
echo ""

# Move to home and create backend folder
cd ~
rm -rf backend
mkdir backend
cd backend

echo "📦 Creating configuration files..."

# Create package.json
cat > package.json << 'JSON_END'
{
  "name": "aurum-backend",
  "version": "1.0.0",
  "type": "module",
  "main": "server.js",
  "scripts": {"start": "node server.js"},
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "mysql2": "^3.6.0"
  }
}
JSON_END

# Create .env
cat > .env << 'ENV_END'
DB_HOST=localhost
DB_PORT=3306
DB_USER=u154384799_Aurum
DB_PASS=Aurum2025
DB_NAME=u154384799_Ahc
PORT=3001
NODE_ENV=production
ENV_END

echo "✅ Configuration files created"
echo ""

echo "📥 Installing dependencies..."
npm install express cors mysql2 --production 2>&1 | tail -5
npm install -g pm2 >/dev/null 2>&1

echo "✅ Dependencies installed"
echo ""

echo "⏳ Waiting for server.js to be uploaded via SCP..."
echo "   (Make sure you run this command from your local terminal:)"
echo "   scp server.js u15438479@aurumhomeopathy.com:~/backend/"
echo ""

# Wait for server.js
count=0
while [ ! -f server.js ] && [ $count -lt 120 ]; do
    sleep 1
    count=$((count+1))
done

if [ ! -f server.js ]; then
    echo "❌ server.js not found! Upload it with:"
    echo "   scp server.js u15438479@aurumhomeopathy.com:~/backend/"
    exit 1
fi

echo "✅ server.js detected! Starting backend..."
echo ""

# Stop any existing process
pm2 stop aurum-backend 2>/dev/null || true
pm2 delete aurum-backend 2>/dev/null || true

# Start backend
pm2 start server.js --name "aurum-backend" --env .env
pm2 save
pm2 startup >/dev/null 2>&1 || true

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ BACKEND STARTED!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 PM2 Status:"
pm2 status
echo ""
echo "📋 Backend Logs (first 20 lines):"
pm2 logs aurum-backend --lines 20 --nostream
echo ""
echo "🌍 Test these URLs:"
echo "   Health: https://aurumhomeopathy.com:3001/health"
echo "   Users:  https://aurumhomeopathy.com:3001/users"
echo "   Login:  https://aurumhomeopathy.com/"
echo ""
