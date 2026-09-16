#!/bin/bash

# Aurum Homeopathy - Backend Deployment Script for Hostinger
# Usage: bash deploy-backend.sh

echo "🚀 Aurum Homeopathy Backend Deployment"
echo "======================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install express mysql2 cors

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ npm install failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Check PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}📦 Installing PM2 globally...${NC}"
    npm install -g pm2
fi

# Start backend with PM2
echo -e "${YELLOW}🚀 Starting backend with PM2...${NC}"
pm2 delete aurum-backend 2>/dev/null || true
pm2 start server.js --name "aurum-backend" --watch

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to start backend${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend started successfully${NC}"

# Save PM2 config
pm2 save
pm2 startup

echo ""
echo -e "${GREEN}======================================"
echo "✅ Backend Deployment Complete!"
echo "=====================================${NC}"
echo ""
echo "Server Status:"
pm2 status
echo ""
echo "View logs: pm2 logs aurum-backend"
echo "Stop: pm2 stop aurum-backend"
echo "Restart: pm2 restart aurum-backend"
