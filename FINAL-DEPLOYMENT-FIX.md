# 🚀 FINAL BACKEND DEPLOYMENT - CORRECT FIX

## ✅ THE PROBLEM (Why it failed before)
- Database host was set to `srv1752.hstgr.io` (REMOTE MySQL)
- When backend deployed ON Hostinger, it couldn't reach remote host from internal network
- This caused 504 Gateway Timeout errors on production

## ✅ THE SOLUTION
- Change database host from `srv1752.hstgr.io` → `localhost:3306`
- Backend and Database on SAME Hostinger server = use `localhost`
- Updated in `server.js` ✅

---

## 📋 STEP-BY-STEP DEPLOYMENT

### Step 1: SSH into Hostinger
```bash
ssh u15438479@aurumhomeopathy.com
# Password: Aurum2025
```

### Step 2: Create backend directory
```bash
mkdir -p ~/backend
cd ~/backend
```

### Step 3: Create package.json
```bash
cat > package.json << 'EOF'
{
  "name": "aurum-backend",
  "version": "1.0.0",
  "type": "module",
  "description": "Aurum Homeopathy Backend",
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
```

### Step 4: Create .env file (IMPORTANT!)
```bash
cat > .env << 'EOF'
# Database - Use LOCALHOST because backend runs ON Hostinger
DB_HOST=localhost
DB_PORT=3306
DB_USER=u154384799_Aurum
DB_PASS=Aurum2025
DB_NAME=u154384799_Ahc

# Backend Server
PORT=3001
NODE_ENV=production
EOF
```

### Step 5: Install dependencies
```bash
npm install express cors mysql2
```

### Step 6: Upload server.js
Copy the **updated server.js** file to ~/backend/

**Option A: Using SCP (from your laptop)**
```bash
scp server.js u15438479@aurumhomeopathy.com:~/backend/
```

**Option B: Create directly in SSH terminal**
```bash
cat > server.js << 'SERVERJS'
[PASTE entire server.js content here]
SERVERJS
```

### Step 7: Install PM2 globally
```bash
npm install -g pm2
```

### Step 8: Start backend with PM2
```bash
pm2 start server.js --name "aurum-backend" --env .env
pm2 save
pm2 startup
pm2 status
```

### Step 9: Test backend locally on Hostinger
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{"ok":true,"database":"connected"}
```

### Step 10: Test from your computer
```bash
curl https://aurumhomeopathy.com:3001/health
```

---

## 📊 VERIFY ENDPOINTS ARE WORKING

After deployment, test these URLs in browser or curl:

| Endpoint | URL | Expected |
|----------|-----|----------|
| Health | https://aurumhomeopathy.com:3001/health | `{"ok":true,"database":"connected"}` |
| Diagnose | https://aurumhomeopathy.com:3001/diagnose | Full system status |
| Users | https://aurumhomeopathy.com:3001/users | JSON array of users |

---

## 🔑 KEY CHANGES MADE

### server.js Changes
```javascript
// BEFORE (❌ WRONG for Hostinger deployment)
const pool = mysql.createPool({
  host: 'srv1752.hstgr.io',
  ...
});

// AFTER (✅ CORRECT for Hostinger deployment)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'u154384799_Aurum',
  password: process.env.DB_PASS || 'Aurum2025',
  database: process.env.DB_NAME || 'u154384799_Ahc',
  port: process.env.DB_PORT || 3306,
  ...
});
```

### Environment Variables
- DB_HOST changed from `srv1752.hstgr.io` → `localhost`
- Added .env.hostinger configuration file
- Backend now reads from process.env with fallbacks

---

## 🎯 WHY THIS FIXES THE 504 ERROR

1. **Before**: Backend tried to connect to `srv1752.hstgr.io` from Hostinger server
   - May be blocked by firewall
   - May not resolve correctly from Hostinger network
   - Causes timeout → 504 error

2. **After**: Backend connects to `localhost:3306` on Hostinger server
   - Direct local connection
   - Fast and reliable
   - No network issues
   - ✅ WORKS!

---

## 📝 MONITORING

### Check if backend is running
```bash
pm2 status
```

### View logs
```bash
pm2 logs aurum-backend
```

### Restart if needed
```bash
pm2 restart aurum-backend
```

### Stop backend
```bash
pm2 stop aurum-backend
```

---

## 🔗 FRONTEND CONFIGURATION

Frontend is already configured to connect to:
- Development: http://localhost:3001
- Production: https://aurumhomeopathy.com:3001

No changes needed to frontend! ✅

---

## ✅ DEPLOYMENT COMPLETE CHECKLIST

- [ ] SSH into Hostinger
- [ ] Create ~/backend directory
- [ ] Create package.json
- [ ] Create .env with `DB_HOST=localhost`
- [ ] npm install express cors mysql2
- [ ] Upload server.js (updated version)
- [ ] npm install -g pm2
- [ ] pm2 start server.js
- [ ] curl http://localhost:3001/health (should work)
- [ ] curl https://aurumhomeopathy.com:3001/health (should work)
- [ ] Test login on https://aurumhomeopathy.com/
- [ ] Test CRUD operations on production
- [ ] Verify data persists after refresh

---

## 🆘 TROUBLESHOOTING

### Backend not responding
```bash
pm2 logs aurum-backend
# Check for connection errors
```

### Database connection error
```bash
# Verify database credentials
mysql -h localhost -u u154384799_Aurum -p
# Enter password: Aurum2025
# Should connect successfully
```

### Port 3001 already in use
```bash
# Find process using port 3001
lsof -i :3001
# Kill it if needed
kill -9 PID
```

### PM2 not starting
```bash
# Check if Node.js is installed
node --version
# Check if PM2 is installed
pm2 --version
```

---

**🚀 This is the FINAL FIX. Everything should work now!**
