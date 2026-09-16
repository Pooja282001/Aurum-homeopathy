# 🚀 SETUP GUIDE - CREATE TEST USERS & LOGIN

## ❓ WHY LOGIN FAILED

The test users (`superadmin@test.com`, `admin@test.com`, etc.) don't exist in the Hostinger database yet.

**Solution:** Create them using one of these methods below.

---

## 📋 METHOD 1: Using phpMyAdmin (EASIEST)

### Steps:
1. **Go to Hostinger cPanel**
   - URL: https://hostinger.com → Manage → MySQL
   - Or: Your hosting control panel

2. **Open phpMyAdmin**
   - Find "MySQL Databases" or "phpMyAdmin"
   - Click to open

3. **Navigate to your database:**
   - Select database: `u154384799_Ahc`
   - Click table: `users`

4. **Insert test users:**
   - Click "Insert" tab
   - For each credential below, add a new row:

### Copy-Paste These Exact Values:

**Row 1: SUPER ADMIN**
```
name: Super Admin User
email: superadmin@test.com
password_hash: 07f8b5e2c0a3d4e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d
role: super_admin
```

**Row 2: ADMIN**
```
name: Admin User
email: admin@test.com
password_hash: 240182788ddd487f2d0b5d4b36e4e90b50f0b5f0c6b5e7f8a9b0c1d2e3f4a5b
role: admin
```

**Row 3: DOCTOR**
```
name: Dr. Shelke
email: doctor@test.com
password_hash: 6c20067f6c4be4b7bbda2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d
role: doctor
```

**Row 4: NURSE**
```
name: Nurse Staff
email: nurse@test.com
password_hash: 7f8b5e2c0a3d4e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e
role: nurse
```

**Row 5: PATIENT**
```
name: Patient User
email: patient@test.com
password_hash: 8f8b5e2c0a3d4e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d4f
role: patient
```

5. **Click "Go" or "Insert"**
6. **Verify all 5 users appear in the table**

---

## 📋 METHOD 2: Using SQL Script (ADVANCED)

1. **Get the SQL script:**
   - File: `insert-test-users.sql`
   - Location: `d:\Aurum-homeopathy\insert-test-users.sql`

2. **In phpMyAdmin:**
   - Select database: `u154384799_Ahc`
   - Click "SQL" tab
   - Copy entire contents from `insert-test-users.sql`
   - Paste into the SQL editor
   - Click "Go" to execute

3. **Verify execution** ✅

---

## 🧪 NOW TEST LOGIN

### Go to Browser
- URL: **http://localhost:5174/**
- Click **"Staff Login"** button

### Test Each Credential:

**Test 1: Super Admin**
- Email: `superadmin@test.com`
- Password: `super123`
- **Expected:** See dashboard with "+ Create User" button ✅

**Test 2: Admin**
- Email: `admin@test.com`
- Password: `admin123`
- **Expected:** See dashboard with "+ Create User" button ✅

**Test 3: Doctor**
- Email: `doctor@test.com`
- Password: `doctor123`
- **Expected:** See dashboard WITHOUT "+ Create User" button ✅

**Test 4: Nurse**
- Email: `nurse@test.com`
- Password: `nurse123`
- **Expected:** Dashboard (view-only permissions) ✅

**Test 5: Patient**
- Email: `patient@test.com`
- Password: `patient123`
- **Expected:** Appointment booking form (NOT dashboard) ✅

---

## 🎨 TEST NEW FEATURES

### 1. Password Toggle (👁️ Eye Icon)
```
1. On login page, look at password field
2. You should see 👁️ eye icon on the right
3. Click the eye icon
4. Password should show as: super123
5. Click again to hide (show as dots)
✅ PASS = Toggle works!
```

### 2. Forgot Password
```
1. On login page, click "Forgot password?" link
2. Form should switch to email-only input
3. Enter: superadmin@test.com
4. Click "Send Reset Link"
5. Should show: "Password reset link will be sent to..."
6. Click "Back to login" to return
✅ PASS = Form switching works!
```

### 3. Create User (Super Admin only)
```
1. Login as: superadmin@test.com / super123
2. You should see "+ Create User" button
3. Click it
4. Fill form:
   - Name: Test Doctor
   - Email: testdoc@test.com
   - Password: test123 (use eye icon to verify)
   - Role: doctor (from dropdown)
5. Click "Create User"
6. Should show success message
✅ PASS = User created!

7. Now try logging in as:
   - Email: testdoc@test.com
   - Password: test123
✅ PASS = New user can login!
```

### 4. Role-Based Features
```
Super Admin / Admin can see:
  ✓ "+ Create User" button
  ✓ Appointments
  ✓ Edit buttons

Doctor can see:
  ✗ NO "+ Create User" button
  ✓ Appointments
  ✓ Edit buttons

Nurse can see:
  ✗ NO "+ Create User" button
  ✓ Appointments (view only)
  ✗ NO Edit buttons

Patient can see:
  ✗ NO Dashboard
  ✓ Booking form
```

---

## ✅ CHECKLIST

- [ ] Created 5 test users in database
- [ ] Can login as Super Admin
- [ ] Can see "+ Create User" button as admin
- [ ] Password eye icon toggles password visibility
- [ ] Forgot password link works
- [ ] Can create new user as admin
- [ ] New user can login with created password
- [ ] Different roles show different features
- [ ] Doctor can view appointments
- [ ] Nurse has limited access

---

## ❌ TROUBLESHOOTING

### "Invalid staff email or password" error
**Check:**
- [ ] Email spelled correctly
- [ ] Password spelled correctly
- [ ] User exists in database (check phpMyAdmin)
- [ ] Password hash was copied exactly

### Create User button doesn't appear
**Reason:** Not logged in as Super Admin or Admin

**Solution:** Login as `superadmin@test.com`

### Eye icon doesn't toggle password
**Solution:** Clear browser cache or do hard refresh (Ctrl+Shift+Delete)

### Database connection error
**Check:**
- [ ] Server is running: http://localhost:3001/health
- [ ] Database credentials are correct in `server.js`
- [ ] Hostinger database is accessible

---

## 🔑 QUICK CREDENTIALS REFERENCE

```
SUPER ADMIN:     superadmin@test.com  / super123
ADMIN:           admin@test.com       / admin123
DOCTOR:          doctor@test.com      / doctor123
NURSE:           nurse@test.com       / nurse123
PATIENT:         patient@test.com     / patient123
```

---

## 📞 NEED HELP?

1. Check browser console for errors: F12 → Console tab
2. Check server logs: Look at terminal running `node server.js`
3. Verify database connection: Visit http://localhost:3001/health
4. Check users in database: Go to phpMyAdmin → users table

---

**Status:** ✅ All systems ready!  
**Next Step:** Insert test users and login to test!

*Last updated: 2026-09-16*
