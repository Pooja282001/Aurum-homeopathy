# 🚀 DEPLOY BACKEND TO HOSTINGER - SIMPLE STEPS

## WHY DATABASE DOESN'T WORK ON PRODUCTION

```
✅ Locally:
  Frontend (localhost:5174) → Backend (localhost:3001) → Database ✅

❌ Production:
  Frontend (aurumhomeopathy.com) → Backend (NOT RUNNING) → Database ❌
```

**SOLUTION: Deploy the backend to production server!**

---

## STEP 1: Connect to Hostinger via SSH

### Using PuTTY (Windows):
1. Download PuTTY
2. Host: `aurumhomeopathy.com`
3. Port: `22`
4. Click "Open"
5. Login as: `u15438479`
6. Password: `Aurum2025`

### Using Command Prompt/PowerShell (Windows):
```powershell
ssh u15438479@aurumhomeopathy.com
# Type password: Aurum2025
```

### Using Terminal (Mac/Linux):
```bash
ssh u15438479@aurumhomeopathy.com
```

---

## STEP 2: Upload Backend Files

You need to upload 3 files to `/home/u15438479/`:
- `server.js`
- `package.json`
- `package-lock.json`

### Using FileZilla:
1. Open FileZilla
2. Host: `ftp.aurumhomeopathy.com`
3. Username: `u15438479`
4. Password: `Aurum2025`
5. Port: `21`
6. Navigate to: `/home/u15438479/`
7. Drag and drop the 3 files

### Using SCP (Command):
```powershell
# On your laptop, in d:\Aurum-homeopathy directory:
scp server.js u15438479@aurumhomeopathy.com:/home/u15438479/
scp package.json u15438479@aurumhomeopathy.com:/home/u15438479/
scp package-lock.json u15438479@aurumhomeopathy.com:/home/u15438479/
```

---

## STEP 3: Install Dependencies (SSH Terminal)

After files are uploaded, run these commands:

```bash
cd /home/u15438479
npm install express cors mysql2
```

Wait for installation to complete...

---

## STEP 4: Install PM2 (Process Manager)

```bash
npm install -g pm2
```

This keeps the server running even if you close SSH.

---

## STEP 5: Start Backend

```bash
pm2 start server.js --name "aurum-backend"
pm2 save
pm2 startup
```

You should see:
```
✅ App "aurum-backend" launched successfully
```

---

## STEP 6: Verify Backend is Running

```bash
pm2 status
```

Should show:
```
aurum-backend  │ online
```

---

## STEP 7: Test Backend Connection

From your laptop, open browser and go to:
```
https://aurumhomeopathy.com:3001/health
```

Should show:
```json
{"ok":true,"database":"connected"}
```

If you see this, backend is working! ✅

---

## STEP 8: Update Frontend (On Your Laptop)

```powershell
cd d:\Aurum-homeopathy
npm run build
```

---

## STEP 9: Upload New Frontend to Hostinger

Upload the `dist/` folder to `/public_html/` on Hostinger using FileZilla.

---

## STEP 10: Test Everything

Go to: https://aurumhomeopathy.com/

1. Click "Staff Login"
2. Enter real database credentials (or demo: `demo` / `demo123`)
3. Try all operations:
   - View appointments ✅
   - Create appointment ✅
   - Edit user ✅
   - Delete user ✅
   - Manage users ✅

---

## ✅ DONE!

Database operations should now work on production just like on localhost!

---

## 🆘 TROUBLESHOOTING

### "Connection Timed Out" Error
- Backend not running: `pm2 status`
- Check logs: `pm2 logs aurum-backend`
- Restart: `pm2 restart aurum-backend`

### "502 Bad Gateway"
- Backend crashed: `pm2 logs aurum-backend`
- Database connection failed: Check credentials in server.js

### "Page loads but login doesn't work"
- Backend not deployed yet
- Database not configured correctly
- Follow all steps above carefully

### Check Logs Anytime
```bash
pm2 logs aurum-backend
```

### Restart Backend
```bash
pm2 restart aurum-backend
```

### Stop Backend
```bash
pm2 stop aurum-backend
```

---

## 📋 COMMANDS SUMMARY

```bash
# Connect to server
ssh u15438479@aurumhomeopathy.com

# Navigate to app folder
cd /home/u15438479

# Install dependencies
npm install express cors mysql2

# Install PM2
npm install -g pm2

# Start backend
pm2 start server.js --name "aurum-backend"

# Save and auto-start
pm2 save
pm2 startup

# Check status
pm2 status

# View logs
pm2 logs aurum-backend

# Restart
pm2 restart aurum-backend

# Stop
pm2 stop aurum-backend

# Test backend
curl https://aurumhomeopathy.com:3001/health
```

---

## 🎯 FINAL CHECKLIST

- [ ] SSH connected to Hostinger
- [ ] Uploaded server.js, package.json, package-lock.json
- [ ] Ran `npm install`
- [ ] Installed PM2
- [ ] Started backend with `pm2 start server.js`
- [ ] Verified with `pm2 status` (shows "online")
- [ ] Tested with `/health` endpoint
- [ ] Rebuilt frontend: `npm run build`
- [ ] Uploaded dist/ to /public_html/
- [ ] Tested login at https://aurumhomeopathy.com/
- [ ] All database operations work ✅

**Do ALL these steps and everything will work!** 🚀
