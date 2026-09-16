# 🧪 TEST CREDENTIALS - ALL ROLES

## ✅ USE THESE CREDENTIALS TO TEST LOGIN

Copy and paste these into the Staff Login page at: **http://localhost:5174/**

---

### **1. SUPER ADMIN** (Can create users, manage everything)
```
Email: superadmin@test.com
Password: super123
```

### **2. ADMIN** (Can create users, edit appointments)
```
Email: admin@test.com
Password: admin123
```

### **3. DOCTOR** (Can review and edit appointments)
```
Email: doctor@test.com
Password: doctor123
```

### **4. NURSE** (Can view appointments only)
```
Email: nurse@test.com
Password: nurse123
```

### **5. PATIENT** (Can book appointments)
```
Email: patient@test.com
Password: patient123
```

---

## 🔧 WHAT TO TEST

### Test 1: Password Show/Hide (👁️ Eye Icon)
- [ ] Go to http://localhost:5174/
- [ ] Look for password field
- [ ] Click the 👁️ eye icon
- [ ] Password should change from dots to visible text
- [ ] Click again to hide

### Test 2: Login with Super Admin
- [ ] Clear email field
- [ ] Type: `superadmin@test.com`
- [ ] Type password: `super123`
- [ ] Click "Sign in ↗"
- [ ] Should show dashboard with appointment count
- [ ] Should see **"+ Create User"** button (ONLY super_admin sees this)

### Test 3: Login with Admin
- [ ] Sign out first
- [ ] Try: `admin@test.com` / `admin123`
- [ ] Should see dashboard
- [ ] Should see **"+ Create User"** button

### Test 4: Login with Doctor
- [ ] Sign out first
- [ ] Try: `doctor@test.com` / `doctor123`
- [ ] Should see dashboard with appointments
- [ ] **Should NOT see "+ Create User"** button

### Test 5: Login with Nurse
- [ ] Sign out first
- [ ] Try: `nurse@test.com` / `nurse123`
- [ ] Should see dashboard
- [ ] Limited access (view only)

### Test 6: Login with Patient
- [ ] Sign out first
- [ ] Try: `patient@test.com` / `patient123`
- [ ] Should see appointment booking form (not dashboard)

### Test 7: Create New User (as Super Admin)
- [ ] Login as: `superadmin@test.com` / `super123`
- [ ] Click **"+ Create User"** button
- [ ] Fill form:
  - Name: `Test User`
  - Email: `testuser@test.com`
  - Password: `test123` (use the 👁️ icon to verify)
  - Role: Select "doctor" from dropdown
- [ ] Click "Create User ↗"
- [ ] Should see success message
- [ ] Should redirect to dashboard
- [ ] Try logging in as: `testuser@test.com` / `test123`

### Test 8: Forgot Password
- [ ] Go to login page
- [ ] Click **"Forgot password?"** link
- [ ] Form should change to email-only input
- [ ] Enter email: `doctor@test.com`
- [ ] Click "Send Reset Link ↗"
- [ ] Should show: "Password reset link will be sent to: doctor@test.com"
- [ ] Click "Back to login" to return

### Test 9: Wrong Password
- [ ] Try logging in with wrong password
- [ ] Should show: "Invalid staff email or password"
- [ ] Should NOT allow login

---

## 📊 EXPECTED DASHBOARD BEHAVIOR

| User Role | Can See | Can Do |
|-----------|---------|--------|
| **Super Admin** | Dashboard + Create User button | Create users, edit appointments |
| **Admin** | Dashboard + Create User button | Create users, edit appointments |
| **Doctor** | Dashboard (NO Create button) | View & edit appointments |
| **Nurse** | Dashboard (NO Create button) | View appointments only |
| **Patient** | Booking form (NOT dashboard) | Book appointments |

---

## ⚠️ TROUBLESHOOTING

### If login fails with "Invalid staff email or password"
**Reasons:**
1. Email doesn't exist in database
2. Password is incorrect
3. Password not hashed properly

**Solution:** Check database directly or create users using the backend

### If "Create User" button doesn't appear
**Reason:** Your role doesn't have permission

**Solution:** Login as super_admin or admin

### If password toggle doesn't work
**Reason:** CSS not applied or browser cache

**Solution:** Hard refresh browser (Ctrl+Shift+Delete)

---

## 🔐 HOW PASSWORD HASHING WORKS

1. Password: `super123`
2. SHA256 Hash: `07f8b5e2c0a3d4e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d`
3. Stored in database: `password_hash` field
4. Login verification:
   - User enters: `super123`
   - Hash entered password with SHA256
   - Compare with stored hash
   - If match → Login success ✅
   - If no match → Login fails ❌

---

## 🎯 QUICK START

1. **Open browser:** http://localhost:5174/
2. **Click "Staff Login"**
3. **Try first credential:**
   - Email: `superadmin@test.com`
   - Password: `super123`
4. **Click "Sign in ↗"**
5. **If it works:** Click "+ Create User" and create a new staff member
6. **If it fails:** Check password is exactly `super123`

---

*Last updated: 2026-09-16*
*Status: Ready to test*
