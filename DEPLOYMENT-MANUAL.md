# 🚀 COMPLETE BACKEND DEPLOYMENT GUIDE - COPY PASTE READY

## ⚡ FASTEST WAY - Copy & Paste Everything Below

### Step 1: Open Terminal / PowerShell and SSH to Hostinger

```bash
ssh u15438479@aurumhomeopathy.com
```

Password: `Aurum2025`

### Step 2: Run This Complete Setup (Copy-Paste All At Once)

```bash
# Go to home directory
cd ~

# Create backend folder
mkdir -p backend
cd backend

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

# Create .env configuration
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
npm install express cors mysql2 --production

# Install PM2 globally
npm install -g pm2

echo "✅ Setup complete! Ready to start backend."
```

### Step 3: In NEW Terminal Window (NOT SSH), Upload server.js

```bash
cd d:\Aurum-homeopathy
scp server.js u15438479@aurumhomeopathy.com:~/backend/
```

### Step 4: Back in SSH Terminal, Start Backend

```bash
cd ~/backend

# Stop any existing process
pm2 stop aurum-backend 2>/dev/null || true
pm2 delete aurum-backend 2>/dev/null || true

# Start with PM2
pm2 start server.js --name "aurum-backend" --env .env

# Save PM2 configuration
pm2 save

# View logs
pm2 logs aurum-backend
```

### Step 5: Test Backend

In your browser, visit:
```
https://aurumhomeopathy.com:3001/health
```

Should see:
```json
{"ok":true,"database":"connected"}
```

---

## ✅ VERIFICATION CHECKLIST

After following all steps above:

- [ ] SSH connected to u15438479@aurumhomeopathy.com
- [ ] ~/backend directory created
- [ ] package.json created
- [ ] .env file created with DB_HOST=localhost
- [ ] npm install completed successfully
- [ ] PM2 installed globally
- [ ] server.js uploaded via SCP
- [ ] pm2 start server.js executed
- [ ] pm2 logs shows "🟢 CONNECTED" and "Ready to accept connections"
- [ ] Browser: https://aurumhomeopathy.com:3001/health returns {"ok":true...}
- [ ] Frontend login at https://aurumhomeopathy.com/ works with admin/admin123
- [ ] Users management page shows 12 users
- [ ] Edit/create/delete user operations work

---

## 🆘 TROUBLESHOOTING

### If you see: `ERR_CONNECTION_TIMED_OUT`

Backend not running. Check:
```bash
# SSH to Hostinger
ssh u15438479@aurumhomeopathy.com

# Check PM2 status
pm2 status

# Check if process is running
pm2 logs aurum-backend
```

### If PM2 shows "offline" or "stopped"

Restart it:
```bash
cd ~/backend
pm2 restart aurum-backend
pm2 logs aurum-backend
```

### If database connection fails

Check .env has these EXACT values:
```
DB_HOST=localhost
DB_USER=u154384799_Aurum
DB_PASS=Aurum2025
DB_NAME=u154384799_Ahc
```

And test database:
```bash
mysql -h localhost -u u154384799_Aurum -p
# Enter password: Aurum2025
# Should connect
```

### If you get "npm: command not found"

Node.js not installed on Hostinger. Contact support to enable Node.js.

### If you get "pm2: permission denied"

Run:
```bash
npm install -g pm2
```

---

## 📊 USEFUL COMMANDS

Monitor backend:
```bash
pm2 status
pm2 logs aurum-backend
pm2 info aurum-backend
```

Manage backend:
```bash
pm2 restart aurum-backend
pm2 stop aurum-backend
pm2 start aurum-backend
pm2 delete aurum-backend
```

SSH to Hostinger:
```bash
ssh u15438479@aurumhomeopathy.com
```

View backend directory:
```bash
ssh u15438479@aurumhomeopathy.com
ls -la ~/backend
```

---

## 🎯 What to Expect

**Successful Startup (in pm2 logs):**
```
╔════════════════════════════════════════════════════════════════╗
║         🚀 AURUM HOMEOPATHY - BACKEND SERVER 🚀               ║
╚════════════════════════════════════════════════════════════════╝

📊 DATABASE CONNECTION INFO:
   Host:     localhost
   Status:   🟢 CONNECTED

🌍 SERVER STATUS:
   URL:      http://localhost:3001
   Status:   🟢 READY

🎯 Ready to accept connections!
```

**Successful Login (frontend console):**
```
✅ [getApiBaseUrl] Using VITE_API_BASE_URL: https://aurumhomeopathy.com:3001
📤 [LOGIN] Sending POST request to: https://aurumhomeopathy.com:3001/login
📬 [LOGIN] Response status: 200
✅ [LOGIN] Login successful!
```

---

## 🚀 FULL AUTOMATED SCRIPT (Copy-Paste)

Save as `deploy.sh` and run: `bash deploy.sh`

```bash
#!/bin/bash
set -e

echo "🚀 Deploying backend to Hostinger..."

# SSH and setup
ssh u15438479@aurumhomeopathy.com << 'SSHEOF'
cd ~
mkdir -p backend
cd backend

cat > package.json << 'EOF'
{"name":"aurum-backend","version":"1.0.0","type":"module","main":"server.js","scripts":{"start":"node server.js"},"dependencies":{"express":"^4.18.2","cors":"^2.8.5","mysql2":"^3.6.0"}}
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

npm install express cors mysql2 --production
npm install -g pm2

echo "✅ Backend directory setup complete"
SSHEOF

# Upload server.js
scp server.js u15438479@aurumhomeopathy.com:~/backend/
echo "✅ server.js uploaded"

# Start backend
ssh u15438479@aurumhomeopathy.com << 'SSHEOF'
cd ~/backend
pm2 stop aurum-backend || true
pm2 delete aurum-backend || true
pm2 start server.js --name "aurum-backend" --env .env
pm2 save
echo "✅ Backend started with PM2"
pm2 logs aurum-backend
SSHEOF

echo "🎉 Deployment complete!"
```

---

## 📞 NEED HELP?

If deployment fails:
1. Check all files created correctly: `ls -la ~/backend`
2. Check PM2 status: `pm2 status`
3. Check logs: `pm2 logs aurum-backend`
4. Check port: `lsof -i :3001`
5. Check database: `mysql -h localhost -u u154384799_Aurum -p`

Good luck! 🚀
