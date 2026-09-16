# 🚀 Hostinger Deployment Guide

## ✅ Status Check
- ✅ Frontend rebuilt: `/dist/` folder ready
- ✅ PHP API files ready: `/api/index.php` & `/api/config.php`
- ✅ Environment config: `.env.production` configured
- ✅ Database credentials in config.php verified

---

## 📋 Files to Upload to Hostinger

### **1. PHP API Files** 
Upload these to `/public_html/api/` folder:
- `api/index.php` → `/public_html/api/index.php`
- `api/config.php` → `/public_html/api/config.php`

### **2. Frontend Files**
Upload entire `/dist/` folder to `/public_html/` folder:
- `dist/index.html`
- `dist/assets/` (all files inside)

---

## 🔧 Upload Instructions

### **Option A: Using Hostinger File Manager (Easiest)**

1. **Login to Hostinger**
   - Go to: https://hpanel.hostinger.com
   - Navigate to: Hosting → File Manager

2. **Create API Folder**
   - Navigate to `/public_html/`
   - Click "New Folder" → name it `api`

3. **Upload API Files**
   - Enter `/public_html/api/` folder
   - Upload `api/index.php`
   - Upload `api/config.php`

4. **Upload Frontend**
   - Go back to `/public_html/`
   - Delete old `dist` folder (if exists)
   - Upload entire `dist/` folder here
   - Or upload individual files from `dist/`

5. **Verify Upload**
   - Test API health: https://aurumhomeopathy.com/api/index.php?action=health
   - Should see: `{"ok":true,"database":"connected"}`
   - Test frontend: https://aurumhomeopathy.com/

---

### **Option B: Using FTP (FileZilla)**

1. **Download FileZilla**: https://filezilla-project.org/

2. **Connect to Hostinger FTP**
   - Host: `ftp.aurumhomeopathy.com` (or your FTP host)
   - Username: Your Hostinger FTP username
   - Password: Your Hostinger FTP password
   - Port: 21

3. **Navigate & Upload**
   - Navigate to `/public_html/api/`
   - Drag & drop `api/index.php` and `api/config.php`
   - Go to `/public_html/`
   - Upload entire `dist/` folder

---

### **Option C: Using Hostinger Git Integration (Recommended)**

If Hostinger supports Git deployment:

1. **SSH into Hostinger** or use File Manager terminal
2. **Clone your repo**:
   ```bash
   cd /home/yourusername/public_html
   git clone https://github.com/Pooja282001/Aurum-homeopathy.git .
   ```
3. **Files will be at**:
   - API: `/public_html/api/index.php`
   - Frontend: `/public_html/dist/` (already built)

---

## ✔️ Verification Checklist

After uploading, verify:

- [ ] File exists: https://aurumhomeopathy.com/api/index.php?action=health
  - Expected response: `{"ok":true,"database":"connected"}`
  
- [ ] Frontend loads: https://aurumhomeopathy.com/
  - Should load the React app

- [ ] Login works: Try logging in
  - Email: `doctor` (or any user in database)
  - Should NOT show 404 error anymore

- [ ] API endpoint responds: POST to https://aurumhomeopathy.com/api/index.php?action=login
  - Should process login request (not 404)

---

## 🔐 Security Notes

- ✅ `config.php` contains database credentials - keep safe
- ✅ `.env.production` is configured correctly
- ✅ API CORS configured for: https://aurumhomeopathy.com

---

## 📞 If Still Getting 404

1. **Check file permissions**: API files must be readable
2. **Verify folder path**: Make sure files are in `/api/` not root
3. **Check Apache/PHP**: Ensure PHP is enabled on Hostinger
4. **Verify domain DNS**: Make sure domain points to Hostinger server

---

## 🎯 Next Steps After Deployment

1. Test login on production
2. Verify offline mode works
3. Confirm Super Admin can login when system is offline
4. Test that regular users see offline screen
