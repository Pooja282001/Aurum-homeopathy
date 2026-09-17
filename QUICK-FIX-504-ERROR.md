# ⚡ Quick Fix for 504 Gateway Time-out Error

## What's Wrong?
```
Frontend deployed ✅ → https://aurumhomeopathy.com/
Backend NOT running ❌ → No connection to database
Result: 504 Gateway Time-out ❌
```

## Quick Fix (5 Steps)

### Step 1: SSH into Hostinger
```bash
ssh u15438479@aurumhomeopathy.com
# Password: Aurum2025
```

### Step 2: Upload Backend Files
Upload these files to `/home/u15438479/`:
- `server.js`
- `package.json`
- `package-lock.json`

### Step 3: Install & Start Backend
```bash
cd /home/u15438479
npm install express mysql2 cors
npm install -g pm2
pm2 start server.js --name "aurum-backend"
pm2 save
pm2 startup
```

### Step 4: Verify Backend is Running
```bash
curl https://aurumhomeopathy.com:3001/health
# Should return: {"ok":true,"database":"connected"}
```

### Step 5: Rebuild Frontend & Deploy
```powershell
cd d:\Aurum-homeopathy
npm run build
# Upload dist/ folder to /public_html/ on Hostinger
```

## Done! ✅

Now test:
- Go to https://aurumhomeopathy.com/
- Click "Staff Login"
- Login should work (no 504 error)

## Still Getting 504?

### Check 1: Is backend running?
```bash
pm2 status
# Should show "aurum-backend" with status "online"
```

### Check 2: Check logs
```bash
pm2 logs aurum-backend
# Look for error messages
```

### Check 3: Is port 3001 accessible?
```bash
curl https://aurumhomeopathy.com:3001/users
# Should return JSON array of users
```

### Check 4: Is database connection working?
```bash
mysql -h srv1752.hstgr.io -u u154384799_Aurum -p
# Password: Aurum2025
# Should connect successfully
```

## What Changed?

- ✅ Created `BACKEND-DEPLOYMENT-HOSTINGER.md` - Full deployment guide
- ✅ Created `deploy-backend.sh` - Automated deployment script
- ✅ Updated `.env.production` - Correct production backend URL
- ✅ Updated `getApiBaseUrl()` - Auto-detects production domain

## Summary

| Item | Before | After |
|------|--------|-------|
| Frontend | https://aurumhomeopathy.com/ ✅ | https://aurumhomeopathy.com/ ✅ |
| Backend | Not deployed ❌ | Running on port 3001 ✅ |
| Database | Not connected | Connected to u154384799_Ahc |
| Login | 504 error ❌ | Works ✅ |

**Backend MUST be running on production for anything to work!**

## Commands Cheat Sheet

```bash
# Start backend
pm2 start server.js --name "aurum-backend"

# Check status
pm2 status

# View logs
pm2 logs aurum-backend

# Restart
pm2 restart aurum-backend

# Stop
pm2 stop aurum-backend

# Delete
pm2 delete aurum-backend
```

🚀 **Deploy backend now to fix the 504 error!**
