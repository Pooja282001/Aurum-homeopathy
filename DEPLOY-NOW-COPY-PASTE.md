# ⚡ COPY-PASTE BACKEND DEPLOYMENT FOR HOSTINGER

## YOUR EXACT SITUATION
```
❌ Frontend deployed but backend NOT deployed
❌ All database operations failing with timeout
❌ This is the ONLY fix needed
```

---

## 🚀 5-MINUTE FIX - COPY & PASTE THESE COMMANDS

### STEP 1: Open SSH Connection
Open PowerShell and run:
```powershell
ssh u15438479@aurumhomeopathy.com
```
Password: `Aurum2025`

---

### STEP 2: Upload Backend Files
**In a NEW PowerShell window**, go to your project folder and run:

```powershell
cd d:\Aurum-homeopathy
scp server.js u15438479@aurumhomeopathy.com:/home/u15438479/
scp package.json u15438479@aurumhomeopathy.com:/home/u15438479/
scp package-lock.json u15438479@aurumhomeopathy.com:/home/u15438479/
```

Password: `Aurum2025` (for each file)

---

### STEP 3: Install Dependencies
**In SSH window**, copy and paste:

```bash
cd /home/u15438479
npm install express cors mysql2
```

Wait for it to finish...

---

### STEP 4: Install PM2
**In SSH window**, copy and paste:

```bash
npm install -g pm2
```

---

### STEP 5: Start Backend
**In SSH window**, copy and paste:

```bash
pm2 start server.js --name "aurum-backend"
pm2 save
pm2 startup
```

You should see: `✅ App "aurum-backend" launched successfully`

---

### STEP 6: Verify It's Running
**In SSH window**, copy and paste:

```bash
pm2 status
```

Should show:
```
aurum-backend  │ online │
```

If you see `online`, **YOU'RE DONE!** ✅

---

### STEP 7: Test Connection (Optional)
**In PowerShell**, copy and paste:

```powershell
curl.exe https://aurumhomeopathy.com:3001/health
```

Should show:
```json
{"ok":true,"database":"connected"}
```

---

## 📱 THEN: Update Frontend

**On your laptop** in PowerShell:

```powershell
cd d:\Aurum-homeopathy
npm run build
```

Upload `dist/` folder to `/public_html/` on Hostinger using **FileZilla**:
- Host: `ftp.aurumhomeopathy.com`
- User: `u15438479`
- Password: `Aurum2025`

---

## ✅ TEST IT

Go to: https://aurumhomeopathy.com/

1. Click "Staff Login"
2. Use demo credentials:
   - Email: `demo`
   - Password: `demo123`
3. Click "Sign in"

**If login works**, database operations should work now! ✅

---

## 🆘 IF SOMETHING GOES WRONG

**Check if backend is running:**
```bash
pm2 status
```

**See error logs:**
```bash
pm2 logs aurum-backend
```

**Restart backend:**
```bash
pm2 restart aurum-backend
```

**Stop backend:**
```bash
pm2 stop aurum-backend
```

---

## 📋 WHAT EACH COMMAND DOES

| Command | Purpose |
|---------|---------|
| `ssh u15438479@aurumhomeopathy.com` | Connect to server |
| `scp server.js ...` | Upload file to server |
| `cd /home/u15438479` | Go to app folder |
| `npm install` | Download dependencies |
| `pm2 start` | Start server permanently |
| `pm2 status` | Check if running |
| `pm2 logs` | See errors |

---

## 🎯 SUMMARY

**The problem:** Backend not on production  
**The fix:** 7 simple commands + 3 file uploads  
**Time needed:** 5 minutes  
**Result:** Database operations work on production ✅

**Just follow the steps above exactly and it will work!**
