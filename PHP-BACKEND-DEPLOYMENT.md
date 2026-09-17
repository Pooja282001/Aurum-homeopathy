# ✅ PHP BACKEND DEPLOYMENT - HOSTINGER READY

## What Was Done

### 1. Created Complete PHP Backend
**File:** `api/backend.php`
- ✅ All endpoints from Node.js server converted to PHP
- ✅ Uses direct MySQL queries (like Node.js)
- ✅ All CRUD operations for users, appointments, roles
- ✅ SHA256 password hashing (compatible with Node.js)
- ✅ RBAC with roles and permissions
- ✅ Works on Hostinger shared hosting (uses localhost for DB)

### 2. Endpoints Implemented
- `GET /health` - Database connection test
- `POST /login` - User authentication with roles
- `POST /register` - User registration
- `GET /users` - List all users
- `GET /users/:id` - Get specific user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /appointments` - List appointments
- `POST /appointments` - Create appointment
- `GET /appointments/:id` - Get appointment
- `PUT /appointments/:id` - Update appointment
- `DELETE /appointments/:id` - Delete appointment
- `GET /system-status` - Check system status
- `PUT /system-status` - Update system status
- `GET /diagnose` - System diagnostics

### 3. Configuration Updates
**File:** `api/config.php`
- ✅ Changed DB_HOST from `srv1752.hstgr.io` to `localhost`
- ✅ This is CRITICAL: PHP apps on Hostinger connect via localhost (not remote)

### 4. URL Rewriting
**File:** `.htaccess`
- ✅ Converts `/api/backend.php/users` to `/api/backend.php?action=users`
- ✅ Enables CORS headers
- ✅ Works with Hostinger Apache

### 5. Frontend Updated
**File:** `src/main.jsx`
- ✅ Updated `getApiBaseUrl()` to point to PHP backend
- ✅ Uses `/api/backend.php` instead of port 3001

---

## UPLOAD TO HOSTINGER (4 Steps)

### Step 1: Connect via SSH
```bash
ssh -p 65002 u154384799@46.202.161.61
Password: Aurum@2025
```

### Step 2: Navigate to public_html and upload files
```bash
cd /home/u154384799/public_html

# If api folder doesn't exist, create it
mkdir -p api
chmod 755 api
```

### Step 3: Upload files (From NEW PowerShell window)
```powershell
cd d:\Aurum-homeopathy

# Upload PHP backend
scp -P 65002 api/backend.php u154384799@46.202.161.61:/home/u154384799/public_html/api/

# Upload .htaccess
scp -P 65002 .htaccess u154384799@46.202.161.61:/home/u154384799/public_html/

# Upload config.php
scp -P 65002 api/config.php u154384799@46.202.161.61:/home/u154384799/public_html/api/
```

### Step 4: Set permissions (Back in SSH)
```bash
chmod 644 /home/u154384799/public_html/api/backend.php
chmod 644 /home/u154384799/public_html/api/config.php
chmod 644 /home/u154384799/public_html/.htaccess
```

---

## TEST API

### Health Check
```
https://aurumhomeopathy.com/api/backend.php?action=health
```
Should return: `{"ok":true,"database":"connected"}`

### Login Test
```
POST https://aurumhomeopathy.com/api/backend.php?action=login
Body: {"email":"admin@example.com","password":"admin123"}
```

### Get Users
```
https://aurumhomeopathy.com/api/backend.php?action=users
```
Should return all users from database

---

## VERIFY FRONTEND WORKS

1. Visit: https://aurumhomeopathy.com/
2. Click "Staff Login"
3. Login with: admin@example.com / admin123
4. Should see Users Management with data from database
5. Try to edit a user - should persist to database

---

## TROUBLESHOOTING

**If API returns "Unknown endpoint":**
- Check .htaccess is in /public_html/
- Check api/backend.php is in /public_html/api/
- Restart Apache: Contact Hostinger support

**If database connection fails:**
- Verify in phpMyAdmin that u154384799_Aurum user can connect
- Check config.php has correct DB_HOST = 'localhost'

**If CORS errors:**
- .htaccess handles CORS headers
- OR add via phpMyAdmin and php.ini

---

## DATABASE ALREADY EXISTS

Your database is already set up on Hostinger:
- **Database:** u154384799_Ahc
- **User:** u154384799_Aurum
- **Password:** Aurum2025
- **Host:** localhost (for PHP apps)

All tables (users, user_roles, roles, permissions, appointments, etc.) already exist.

---

## READY TO DEPLOY! 🚀

Execute the 4 upload steps above and API will be live!
