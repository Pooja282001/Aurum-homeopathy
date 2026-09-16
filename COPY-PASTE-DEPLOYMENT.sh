#!/bin/bash
# COPY-PASTE THIS ENTIRE SCRIPT IN YOUR SSH TERMINAL
# ssh u15438479@aurumhomeopathy.com (password: Aurum2025)

echo "🚀 AURUM BACKEND - FINAL DEPLOYMENT"
echo "===================================="
echo ""

# Create backend directory
mkdir -p ~/backend
cd ~/backend

# Create package.json
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

# Create .env file with LOCALHOST (this is the key fix!)
cat > .env << 'EOF'
DB_HOST=localhost
DB_PORT=3306
DB_USER=u154384799_Aurum
DB_PASS=Aurum2025
DB_NAME=u154384799_Ahc
PORT=3001
NODE_ENV=production
EOF

# Install dependencies
npm install express cors mysql2

# Install PM2 globally
npm install -g pm2

echo ""
echo "✅ Setup complete!"
echo ""
echo "NOW: Copy the updated server.js to ~/backend/ using SCP:"
echo "scp server.js u15438479@aurumhomeopathy.com:~/backend/"
echo ""
echo "Then run in SSH:"
echo "cd ~/backend"
echo "pm2 start server.js --name aurum-backend --env .env"
echo "pm2 save"
echo ""
