# 📤 HOSTINGER FTP UPLOAD GUIDE - api.php

## Your FTP Credentials (Already Configured)

```
FTP Host:     ftp.aurumhomeopathy.com
Username:     u15438479.Aurum (shown as u15438479.Auru)
Password:     Aurum2025
Port:         21
Folder:       /public_html/
```

---

## ✅ STEP-BY-STEP UPLOAD (Using FileZilla)

### **Step 1: Download FileZilla**
- Go to: https://filezilla-project.org/download.php
- Download & Install **FileZilla Client** (it's free)

### **Step 2: Open FileZilla**
- Launch FileZilla application

### **Step 3: Create New Site**
1. Click: **File** → **Site Manager** (or Ctrl+S)
2. Click: **New Site**
3. Fill in details:
   - **Protocol:** FTP (not SFTP)
   - **Host:** ftp.aurumhomeopathy.com (or 46.202.161.61)
   - **Port:** 21
   - **Username:** u15438479.Aurum
   - **Password:** Aurum2025
   - **Logon Type:** Normal
4. Click: **Connect**

### **Step 4: Navigate to Upload Folder**
1. On the right side (Remote Site), navigate to: `/public_html/`
2. You should see:
   - `dist/` folder
   - `index.html`
   - Other files

### **Step 5: Upload api.php**
1. On the left side (Local Site), navigate to: `d:\Aurum-homeopathy\`
2. Find: **api.php**
3. **Right-click** → **Upload**
4. OR **Drag & drop** to right panel

**Wait for upload to complete!** ✅

---

## 🔍 VERIFY UPLOAD

### **Option A: In FileZilla**
- Refresh right panel (F5)
- Should see **api.php** in `/public_html/`

### **Option B: Test in Browser**
Visit this URL:
```
https://aurumhomeopathy.com/api.php?action=health
```

Should see:
```json
{"ok":true,"database":"connected"}
```

---

## ⚡ QUICK TROUBLESHOOTING

### **Can't Connect?**
1. Use this instead: Host = `46.202.161.61`
2. Make sure Port = `21`
3. Check username/password are correct

### **Connection Times Out?**
- Try **Port 990** (FTPS) instead of 21
- Or wait a few seconds and retry

### **File Not Uploading?**
1. Make sure file is named exactly: **api.php** (not api.php.txt)
2. Check you're uploading to `/public_html/` NOT `/`
3. Refresh folder view (F5) to see if it uploaded

### **After Upload, Still Getting 404?**
1. Wait 2 minutes for server to register file
2. Try: `https://aurumhomeopathy.com/api.php?action=health`
3. Check console (F12) for which API is being used

---

## 🎯 WHAT HAPPENS AFTER UPLOAD

Your app will automatically use the new API in this order:

```
1. Tries: https://aurumhomeopathy.com/api/index.php
2. Falls back to: https://aurumhomeopathy.com/api.php ✨ (YOU JUST UPLOADED THIS)
3. Last resort: http://localhost:3001 (Node.js development)
```

**No more 404 errors!** The system finds whichever API is available! 🚀

---

## ✅ FINAL TESTS AFTER UPLOAD

### Test 1: Health Check
```
https://aurumhomeopathy.com/api.php?action=health
```
Expected: `{"ok":true,"database":"connected"}`

### Test 2: System Status
```
https://aurumhomeopathy.com/api.php?action=system-status
```
Expected: `{"isOnline":true,"maintenanceMode":false,"comment":""}`

### Test 3: Frontend
```
https://aurumhomeopathy.com/
```
Expected: React app loads, no 404 errors

### Test 4: Try Login
Expected: Works without 404!

### Test 5: Check Browser Console (F12)
Expected: `✅ PHP API verified at: https://aurumhomeopathy.com/api.php`

---

## 💡 ALTERNATIVE: Manual File Upload via Hostinger

If FileZilla doesn't work:

1. Go to: https://hpanel.hostinger.com
2. Files → File Manager
3. Navigate to: `/public_html/`
4. Click: **Upload Files**
5. Select: `d:\Aurum-homeopathy\api.php`
6. Click: **Upload**

---

**That's it! Upload and you're LIVE!** 🎉
