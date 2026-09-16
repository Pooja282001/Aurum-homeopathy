# 🔧 **HOSTINGER DEPLOYMENT TROUBLESHOOTING GUIDE**

## 🎯 **Current Issue**
```
❌ GET https://aurumhomeopathy.com/api/index.php?action=system-status 404 (Not Found)
```

This means the API files exist but are not responding. Let's fix it step by step.

---

## **STEP 1: Quick Status Check (Do This First!)**

### **Option A: Check Health Endpoint**
Visit this URL to get detailed diagnostics:
```
https://aurumhomeopathy.com/health.php
```

This shows:
- ✅ Which files exist
- ✅ Database connection status
- ✅ Deployed tables
- ✅ PHP version

**Expected Response:**
```json
{
  "status": "all_green",
  "message": "✅ All systems operational! API is ready."
}
```

### **Option B: Check File Manager**
Login to Hostinger → Files → File Manager
1. Navigate to `/public_html/`
2. Verify these folders exist:
   - ✅ `/api/` folder
   - ✅ `/dist/` folder
3. Check inside `/api/`:
   - ✅ `index.php` exists
   - ✅ `config.php` exists

---

## **STEP 2: Diagnose The Problem**

### **If health.php shows "all_green":**
✅ Everything is deployed correctly!
→ Go to **STEP 3: Activate API**

### **If health.php shows errors:**

**Error: "file_missing" for api/index.php**
- Files haven't deployed yet
- Wait 5 minutes for auto-deployment
- Then refresh

**Error: "database_error"**
- Database connection failed
- Check credentials in `api/config.php`
- Verify: db_host, db_name, db_user, db_password

**Error: Files don't exist**
- Auto-deployment might not have completed
- Force re-deployment: Push new commit to main
- Or manually upload via File Manager

---

## **STEP 3: Activate the API**

### **Method 1: Run Setup Script (Recommended)**

Visit this URL (only needs to run once):
```
https://aurumhomeopathy.com/setup.php
```

This will:
- Create `/api/` directory if missing
- Generate `config.php` if missing
- Test database connection
- Create `/dist/` directory

**Expected Response:**
```json
{
  "success": true,
  "steps": [
    "✅ Created /api directory",
    "✅ Created /api/config.php",
    "✅ Database connection successful"
  ]
}
```

After setup.php runs successfully, delete it (optional):
```
https://aurumhomeopathy.com/setup.php → Delete or ignore
```

### **Method 2: Manual Setup (If setup.php fails)**

1. Via File Manager, create `/api/config.php`:
```php
<?php
return [
    'db_host' => 'srv1752.hstgr.io',
    'db_name' => 'u154384799_Ahc',
    'db_user' => 'u154384799_Aurum',
    'db_password' => 'Aurum2025',
    'db_charset' => 'utf8mb4',
    'allowed_origin' => 'https://aurumhomeopathy.com',
];
```

2. Verify `index.php` is in `/api/` folder
3. Test: `https://aurumhomeopathy.com/api/index.php?action=health`

---

## **STEP 4: Test All Endpoints**

Once setup.php completes successfully:

### **Test 1: Health Check (No Auth)**
```
GET https://aurumhomeopathy.com/api/index.php?action=health
```
Expected: `{"ok":true,"database":"connected"}`

### **Test 2: Get Current User (No Auth)**
```
GET https://aurumhomeopathy.com/api/index.php?action=me
```
Expected: `{"user":null}` (since not logged in)

### **Test 3: System Status (No Auth)**
```
GET https://aurumhomeopathy.com/api/index.php?action=system-status
```
Expected: `{"isOnline":true,"maintenanceMode":false,"comment":""}`

### **Test 4: Login (Test User)**
```
POST https://aurumhomeopathy.com/api/index.php?action=login
Content-Type: application/json

{
  "email": "doctor@example.com",
  "password": "your_password"
}
```
Expected: `{"user":{"id":1,"name":"Doctor","email":"doctor@example.com","role":"doctor"}}`

### **Test 5: Frontend**
```
https://aurumhomeopathy.com/
```
Expected: React app loads

---

## **STEP 5: Verify Smart Fallback Works**

Open DevTools (F12) → Console tab

Try to login on the frontend. You should see:

```
✅ PHP API verified at: https://aurumhomeopathy.com/api/index.php
```

Or if PHP fails:
```
⚠️ PHP API unavailable, attempting Node.js fallback
✅ Node.js API verified at: http://localhost:3001
```

---

## **Common Issues & Fixes**

### **Issue: Still Getting 404**

**Cause 1: Files haven't deployed yet**
- Solution: Wait 5 minutes, refresh
- Or check: https://aurumhomeopathy.com/health.php

**Cause 2: Wrong directory structure**
- Files should be at: `/public_html/api/index.php`
- NOT at: `/public_html/public/api/index.php`
- Check via File Manager

**Cause 3: PHP not enabled**
- Contact Hostinger support
- Ask: "Is PHP enabled for my hosting?"
- Ask: "Can I run PHP files in /api/ folder?"

**Cause 4: .htaccess blocking access**
- Hostinger might disable `.htaccess`
- Try renaming to `.htaccess.bak`
- Then test: `https://aurumhomeopathy.com/api/index.php?action=health`

---

### **Issue: Database Connection Failed**

**Check 1: Verify Credentials**
```
db_host: srv1752.hstgr.io
db_name: u154384799_Ahc
db_user: u154384799_Aurum
db_password: Aurum2025
```

**Check 2: Test via Hostinger phpMyAdmin**
1. Go to: Hostinger → Databases
2. Click "phpMyAdmin" for database `u154384799_Ahc`
3. Login with credentials above
4. If it fails → credentials are wrong

**Check 3: Update config.php**
If credentials are different, update:
```php
// In api/config.php:
'db_password' => 'YOUR_ACTUAL_PASSWORD',
```

---

### **Issue: Login Still Returns 404**

**This happens when:**
- Health check (https://aurumhomeopathy.com/health.php) shows "all_green" ✅
- But login still fails with 404 ❌

**Solution: Clear browser cache**
1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Clear storage** → **Clear all**
4. Refresh page
5. Try login again

---

## **Full Deployment Checklist**

- [ ] Visit: https://aurumhomeopathy.com/health.php
- [ ] Verify response shows "all_green"
- [ ] Run: https://aurumhomeopathy.com/setup.php
- [ ] Verify setup returns "success": true
- [ ] Test: https://aurumhomeopathy.com/api/index.php?action=health
- [ ] Test: https://aurumhomeopathy.com/ (frontend loads)
- [ ] Try login with test credentials
- [ ] Check console: Shows "✅ PHP API verified" or "✅ Node.js API verified"
- [ ] Optional: Delete setup.php for security

---

## **Quick Action Items**

1. **Right now**: Visit https://aurumhomeopathy.com/health.php
2. **If green**: Run https://aurumhomeopathy.com/setup.php
3. **If errors**: Check File Manager for missing files
4. **Still broken**: Contact Hostinger support with health.php output

---

## **How to Get Support**

If you're stuck, provide these details:

1. **health.php output** (copy the JSON)
2. **Browser console** (DevTools → Console tab)
3. **Error messages** (if any)
4. **What you tried** (setup.php? manual upload?)

---

## **Success Signs**

✅ API health check returns: `{"ok":true,"database":"connected"}`
✅ Frontend loads at: https://aurumhomeopathy.com/
✅ Console shows: `✅ PHP API verified`
✅ Login works without 404 errors
✅ System offline toggle works (Super Admin)
✅ Offline mode displays when system is down

**Once all above are ✅, you're LIVE!** 🎉
