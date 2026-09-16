#!/bin/bash
# AURUM HOMEOPATHY - ONE COMMAND BACKEND DEPLOYMENT
# Run this on your Hostinger server to deploy the backend

set -e

echo "🚀 DEPLOYING BACKEND TO HOSTINGER"
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Step 1: Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not installed${NC}"
    echo "Install Node.js first with: apt-get install nodejs npm"
    exit 1
fi

echo -e "${GREEN}✅ Node.js installed: $(node --version)${NC}"

# Step 2: Go to home directory
cd /home/u15438479 || { echo -e "${RED}❌ Cannot access home directory${NC}"; exit 1; }
echo -e "${GREEN}✅ In directory: $(pwd)${NC}"

# Step 3: Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install express cors mysql2/promise 2>/dev/null || npm install express cors mysql2

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ npm install failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 4: Install PM2 globally
echo -e "${YELLOW}🔧 Installing PM2 (process manager)...${NC}"
npm install -g pm2 2>/dev/null || true

# Step 5: Stop any existing server
echo -e "${YELLOW}🛑 Stopping existing backend...${NC}"
pm2 delete aurum-backend 2>/dev/null || true
sleep 1

# Step 6: Start backend with PM2
echo -e "${YELLOW}🚀 Starting backend server...${NC}"
pm2 start server.js --name "aurum-backend" --watch --max-memory-restart 500M

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to start backend${NC}"
    exit 1
fi

sleep 2

# Step 7: Save PM2 config and set auto-start
echo -e "${YELLOW}💾 Saving PM2 configuration...${NC}"
pm2 save
pm2 startup 2>/dev/null || true

# Step 8: Display status
echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ BACKEND DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""

echo "📊 Server Status:"
pm2 status

echo ""
echo "📋 Next Steps:"
echo "1. Test backend: curl https://aurumhomeopathy.com:3001/health"
echo "2. If error, check logs: pm2 logs aurum-backend"
echo "3. Restart frontend on your laptop: npm run build"
echo "4. Upload dist/ to /public_html/ on Hostinger"
echo ""

echo -e "${GREEN}Backend is now running! ✨${NC}"
