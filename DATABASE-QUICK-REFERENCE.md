# 🚀 QUICK START GUIDE - Database Ready

## ✅ What You Have Now

- **6 Tables**: users, roles, permissions, role_permissions, user_roles, appointments
- **9 Test Users**: super_admin, admin, doctor, nurse, patients
- **5 Roles**: With proper permission mappings
- **12 Permissions**: Organized by category
- **9 Appointments**: Ready for testing

---

## 🔐 Login Credentials (Password for ALL: `super123`)

```
SUPER ADMIN
  Email: superadmin@test.com
  
ADMIN
  Email: admin@test.com
  
DOCTOR
  Email: doctor@test.com
  
NURSE
  Email: nurse@test.com
  
PATIENT
  Email: patient@test.com
```

---

## 🎯 What Each Role Can Do

### Super Admin (ID 1)
- ✅ Manage all users (create, edit, delete)
- ✅ Manage all appointments
- ✅ Assign roles to users
- ✅ Enable maintenance mode
- ✅ See everything

### Admin (ID 2)
- ✅ Manage appointments
- ✅ View and manage users
- ✅ Assign roles
- ✅ NOT: Enable maintenance mode

### Doctor (ID 3)
- ✅ View appointments
- ✅ Edit appointments
- ✅ Book appointments
- ✅ NOT: Manage users

### Nurse (ID 4)
- ✅ View appointments (read-only)
- ✅ NOT: Edit or create appointments
- ✅ NOT: Manage users

### Patient (ID 5)
- ✅ Book appointments
- ✅ NOT: Manage anything
- ✅ NOT: See other users

---

## 📊 Database Record Summary

```
Users:               9
Roles:               5
Permissions:        12
User→Role Links:     9
Role→Permission:    24
Appointments:        9

TOTAL RECORDS:      78
```

---

## 🔗 Database Relations

```
USERS
  ↓ (1-to-many via user_roles)
USER_ROLES (junction table)
  ↓ (many-to-1)
ROLES
  ↓ (1-to-many via role_permissions)
ROLE_PERMISSIONS (junction table)
  ↓ (many-to-1)
PERMISSIONS

USERS
  ↓ (1-to-many)
APPOINTMENTS
```

---

## 💻 Server Commands

**Start Backend:**
```bash
node server.js
```

**Start Frontend:**
```bash
node ./node_modules/vite/bin/vite.js
```

**Access App:**
```
http://localhost:5173
```

---

## 🧪 Test Endpoints (Backend Running)

```bash
# Login as Super Admin
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@test.com","password":"super123"}'

# Get all users
curl http://localhost:3001/users

# Get admin data
curl http://localhost:3001/admin/data

# Get all appointments
curl http://localhost:3001/appointments
```

---

## 📝 Important SQL Queries

**Get User with All Info:**
```sql
SELECT u.id, u.name, u.email, r.name as role
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'superadmin@test.com';
```

**Get All Role Permissions:**
```sql
SELECT r.name, GROUP_CONCAT(p.name SEPARATOR ', ') as permissions
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
GROUP BY r.id;
```

**Get User Permissions:**
```sql
SELECT DISTINCT p.name
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN role_permissions rp ON ur.role_id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
WHERE u.email = 'superadmin@test.com';
```

---

## 🎯 Next Steps

1. ✅ Database rebuilt with all tables ← YOU ARE HERE
2. ⏭️ Start backend server (`node server.js`)
3. ⏭️ Start frontend server (Vite)
4. ⏭️ Log in with test credentials
5. ⏭️ Test different roles and permissions
6. ⏭️ Deploy to production

---

## ❓ Common Questions

**Q: How to add a new user?**
A: Insert into users table, then add entry to user_roles table

**Q: How to change a user's role?**
A: Delete from user_roles, insert new role

**Q: How to add a new permission?**
A: Insert into permissions, then link to roles via role_permissions

**Q: How to create a new role?**
A: Insert into roles, then add permissions via role_permissions

**Q: What if I mess up?**
A: Run `rebuild-simple.js` again to reset everything

---

## 📞 Files for Reference

- **complete-database-rebuild.sql** - Raw SQL (can run directly in phpMyAdmin)
- **rebuild-simple.js** - Node.js script to rebuild database
- **COMPLETE-DATABASE-REBUILD-DOCS.md** - Full documentation
- **RBAC-COMPLETE-SUMMARY.md** - RBAC system overview

---

## ✨ You're All Set!

Everything is ready to go. Your database has:
- ✅ Proper table structure
- ✅ All relationships defined
- ✅ Test data loaded
- ✅ Unique IDs on all tables
- ✅ Indexes for performance

**Start the servers and log in to test!** 🚀
