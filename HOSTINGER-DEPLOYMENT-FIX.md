# 🚨 PRODUCTION DEPLOYMENT FIX - Hostinger Backend 404 Error

## Problem
- Frontend deployed to: `https://aurumhomeopathy.com` ✅
- Frontend trying to use PHP backend: `https://aurumhomeopathy.com/backend.php` ❌
- **Status**: 404 NOT FOUND - Backend files not deployed to Hostinger

## Solution: Deploy PHP Backend to Hostinger

### Option A: Direct FTP Upload (Recommended - Fastest)

#### Step 1: Connect via FTP to Hostinger
**FTP Credentials** (from Hostinger control panel):
- Host: `46.202.161.61` or your Hostinger FTP host
- Port: `21` (or custom from panel)
- Username: `u154384799` (your cPanel username)
- Password: Same as your Hostinger account
- Or use SFTP on port 65002

#### Step 2: Files to Upload

Upload these files to `/public_html/`:
```
backend.php              (ROOT level)
config.php              (ROOT level)
.htaccess              (ROOT level)
```

Upload these to `/public_html/api/`:
```
api/config.php
api/config.example.php
api/index.php
api/.htaccess
```

#### Step 3: Upload Instructions

**Using Windows Explorer / WinSCP:**
1. Connect via SFTP (preferred) or FTP
2. Navigate to `/public_html/`
3. Upload these files from `d:\Aurum-homeopathy\`:
   - `backend.php`
   - `config.php`
   - `.htaccess` (if exists in root)
4. Create `/api` folder in `public_html`
5. Upload all files from `api/` folder

**Using Hostinger File Manager (Web UI - Easiest):**
1. Log into Hostinger control panel
2. Go to **File Manager** → Public HTML
3. Right-click → **Upload Files**
4. Select these files:
   - `d:\Aurum-homeopathy\backend.php`
   - `d:\Aurum-homeopathy\config.php`
5. Right-click → **New Folder** → Name it `api`
6. Upload contents of `d:\Aurum-homeopathy\api\` folder

### Option B: Git Deploy (If Git is enabled on Hostinger)

```bash
# On Hostinger via SSH or Terminal
cd /home/u154384799/public_html

# Clone or pull the repository
git clone https://github.com/Pooja282001/Aurum-homeopathy.git .
# OR if already cloned:
git pull origin main

# Copy backend files to root
cp backend.php .
cp config.php .
cp -r api/ .
```

### Step 4: Verify Deployment

Test if backend is accessible:

1. **Check System Status:**
   ```
   https://aurumhomeopathy.com/backend.php?action=system-status
   ```
   Expected: `{"status": "ok", "database": "connected"}`

2. **Check Health Endpoint:**
   ```
   https://aurumhomeopathy.com/backend.php?action=health
   ```
   Expected: `{"ok": true, "database": "connected"}`

3. **Test Login:**
   ```
   POST https://aurumhomeopathy.com/backend.php?action=login
   Body: {"username": "admin@example.com", "password": "admin123"}
   ```

## Database Configuration

Verify `config.php` has correct Hostinger credentials:

```php
<?php
return [
    'db_host' => 'srv1752.hstgr.io',      // Your Hostinger MySQL host
    'db_port' => 3306,
    'db_name' => 'u154384799_Ahc',        // Your database name
    'db_user' => 'u154384799_Aurum',      // Your database user
    'db_password' => 'Aurum2025',         // Your database password
];
```

**Note:** The credentials are already set in both `backend.php` and `config.php`. Just verify they match your Hostinger database.

## Common Issues & Fixes

### Issue 1: Still Getting 404

**Cause:** File not in correct location or PHP not enabled

**Fix:**
1. Verify file is in `/public_html/backend.php` (not in subdirectory)
2. Check Hostinger File Manager shows the file
3. Clear browser cache: `Ctrl+Shift+Delete`
4. Try incognito/private window

### Issue 2: 500 Database Connection Error

**Cause:** Database credentials incorrect or database down

**Fix:**
1. Verify credentials in `config.php` match Hostinger panel
2. Check Hostinger MySQL is running (Database section in panel)
3. Verify IP whitelist allows connections
4. Test connection with MySQL client tool

### Issue 3: Permission Denied

**Cause:** File permissions not set correctly

**Fix via Hostinger File Manager:**
1. Right-click file → **Permissions**
2. Set to: `644` for PHP files, `755` for directories

**Fix via SSH:**
```bash
chmod 644 backend.php
chmod 644 config.php
chmod 755 api/
```

## .htaccess Configuration

Ensure `.htaccess` is in `/public_html/` for proper routing:

```apache
# Enable mod_rewrite
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Allow access to actual files/directories
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    
    # Route API requests
    RewriteRule ^api/(.*)$ api/index.php?endpoint=$1 [QSA,L]
    RewriteRule ^backend\.php$ backend.php [QSA,L]
</IfModule>
```

## API Endpoints After Deployment

Once deployed, these endpoints will be available:

```
GET  https://aurumhomeopathy.com/backend.php?action=health
GET  https://aurumhomeopathy.com/backend.php?action=appointments
POST https://aurumhomeopathy.com/backend.php?action=login
GET  https://aurumhomeopathy.com/backend.php?action=users
GET  https://aurumhomeopathy.com/backend.php?action=system-status
PUT  https://aurumhomeopathy.com/backend.php?action=system-status
POST https://aurumhomeopathy.com/backend.php?action=appointments
PUT  https://aurumhomeopathy.com/backend.php?action=appointments&id=ID
DELETE https://aurumhomeopathy.com/backend.php?action=appointments&id=ID
... and more
```

## Testing After Deployment

1. **Test Login:**
   - Go to `https://aurumhomeopathy.com`
   - Try logging in with: `admin@example.com` / `admin123`
   - You should see the dashboard with real data

2. **Test Appointments:**
   - Should show all appointments from database
   - Should be able to search
   - Create, edit, delete should work

3. **Check Console:**
   - Open DevTools (F12)
   - Should NOT see 404 errors for backend.php
   - Should see console logs with ✅ indicators

## Deployment Checklist

- [ ] FTP connection working
- [ ] `backend.php` uploaded to `/public_html/`
- [ ] `config.php` uploaded to `/public_html/`
- [ ] `api/` folder created in `/public_html/`
- [ ] API files uploaded to `/public_html/api/`
- [ ] `.htaccess` file present and correct
- [ ] Database credentials verified in `config.php`
- [ ] Test backend.php endpoint in browser (GET request)
- [ ] Check response for JSON (not HTML error)
- [ ] Clear browser cache
- [ ] Test login on production
- [ ] Test appointment CRUD operations
- [ ] Verify console has no 404 errors

## Quick Deploy Command (Linux/Mac/WSL)

```bash
cd d:\Aurum-homeopathy

# Upload via SCP/SFTP (if available)
sftp -P 65002 u154384799@46.202.161.61:/home/u154384799/public_html <<EOF
put backend.php
put config.php
put -r api
quit
EOF

# OR via rsync
rsync -avz --rsh="ssh -p 65002" \
  backend.php config.php api/ \
  u154384799@46.202.161.61:/home/u154384799/public_html/
```

## Support

If still getting 404 after deployment:
1. **Check file exists:** `https://aurumhomeopathy.com/backend.php` should display PHP code or JSON response
2. **Check PHP works:** Create test.php with `<?php phpinfo(); ?>` and access it
3. **Check permissions:** Use Hostinger File Manager to verify readable files
4. **Contact Hostinger support:** They can verify file deployment and PHP settings

---

**Status**: Production fix pending backend deployment  
**Action Required**: Upload PHP backend files to `/public_html/` on Hostinger  
**Estimated Fix Time**: 5-10 minutes
