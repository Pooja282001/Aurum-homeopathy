# 🔍 COMPREHENSIVE DEBUGGING GUIDE - Console Log Analysis

## 🎯 What to Look For in Console Logs

This guide helps you find the exact problem by reading frontend and backend logs.

---

## 🌐 FRONTEND LOGS (Browser Console)

### Where to Find Frontend Logs
1. Open your browser (Chrome/Firefox/Safari/Edge)
2. Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
3. Click **Console** tab
4. You'll see logs like this:

### Frontend Log Flow - Successful Login

```
🔍 [getApiBaseUrl] Hostname: localhost Protocol: http:
✅ [getApiBaseUrl] Using localhost: http://localhost:3001
🔐 [LOGIN] Attempting login with username: admin
📨 [LOGIN] Sending POST request to: http://localhost:3001/login
📬 [LOGIN] Response status: 200 OK
✅ [LOGIN] Login successful! User: {"id":1,"name":"Rohit khandekar"...}
💾 [LOGIN] User saved to localStorage
```

**✅ IF YOU SEE THIS:** Login successful, backend responding correctly.

---

### Frontend Log Flow - Backend Not Responding (504 Error)

```
🔍 [getApiBaseUrl] Hostname: localhost Protocol: http:
✅ [getApiBaseUrl] Using localhost: http://localhost:3001
🔐 [LOGIN] Attempting login with username: admin
📨 [LOGIN] Sending POST request to: http://localhost:3001/login
❌ [LOGIN] Backend error: Network request failed / timeout
⚠️ [LOGIN] Backend unavailable, using local demo users
📋 [LOGIN] Trying local demo users...
```

**❌ IF YOU SEE THIS:** Backend not running or database connection failed.

---

### Frontend Log Flow - User Management

```
👥 [GET_USERS] Fetching all users...
📨 [GET_USERS] GET request to: http://localhost:3001/users
📬 [GET_USERS] Response status: 200
✅ [GET_USERS] Users received: [{"id":1,"name":"Aurum Admin"...}]
📋 [GET_USERS] Setting users state with 12 users
```

**✅ IF YOU SEE THIS:** Users loaded successfully from backend.

---

### Frontend Log Flow - Saving User Edit

```
✏️ [SaveEdit] Saving user ID: 1
📝 [SaveEdit] Updated values: {"name":"Dr. Shelke","email":"doctor@aurum.com"}
📨 [SaveEdit] PUT request to: http://localhost:3001/users/1
📦 [SaveEdit] Payload: {"name":"Dr. Shelke","email":"doctor@aurum.com"}
📬 [SaveEdit] Response status: 200
✅ [SaveEdit] Update successful
📋 [SaveEdit] Updated users state
```

**✅ IF YOU SEE THIS:** User saved to database successfully.

---

## 🖥️ BACKEND LOGS (Terminal/Server Console)

### Where to Find Backend Logs
1. Open terminal where server.js is running
2. You'll see logs like this
3. Every request logged with `📨 [METHOD]` prefix

### Backend Server Startup - Successful

```
📊 DATABASE CONNECTION INFO:
   Host:     localhost
   Port:     3306
   User:     u154384799_Aurum
   Database: u154384799_Ahc
   Status:   🟢 CONNECTED

🌍 SERVER STATUS:
   URL:      http://localhost:3001
   Status:   🟢 READY

⏰ Started at: 2026-09-17T10:30:45.123Z

🎯 Ready to accept connections!
```

**✅ IF YOU SEE THIS:** Backend started correctly, database connected.

---

### Backend Log Flow - Successful Login Request

```
📨 [REQUEST] POST /login
⏰ [TIME] 2026-09-17T10:31:12.456Z
📦 [BODY] { email: 'admin@example.com', password: '...' }

🔐 [LOGIN] Attempting login with email: admin@example.com
🔗 [LOGIN] Getting database connection...
✅ [LOGIN] Connection obtained
🔍 [LOGIN] Querying users table for email: admin@example.com
📊 [LOGIN] Query result: 1 user(s) found
🔒 [LOGIN] Verifying password hash...
✅ [LOGIN] Password verified successfully
🔍 [LOGIN] Fetching user roles...
📊 [LOGIN] Found 1 role(s): super_admin
🔍 [LOGIN] Fetching user permissions...
📊 [LOGIN] Found 5 permission(s)
✅ [LOGIN] Connection released
✅ [LOGIN] SUCCESS! User: Rohit khandekar | Role: super_admin
📤 [LOGIN] Sending response: {"user":{"id":1,"name":"Rohit khandekar"...}}
```

**✅ IF YOU SEE THIS:** Login processed successfully on backend.

---

### Backend Log Flow - Database Connection Error

```
📨 [REQUEST] POST /login
🔐 [LOGIN] Attempting login with email: admin@example.com
🔗 [LOGIN] Getting database connection...
❌ [HEALTH] Database connection failed: connect ECONNREFUSED 127.0.0.1:3306
   Error: Unable to connect to localhost:3306
   Message: connect ECONNREFUSED 127.0.0.1:3306
📋 Stack trace: [full error stack...]
```

**❌ IF YOU SEE THIS:** Backend can't connect to database (wrong host/port/credentials).

---

### Backend Log Flow - Getting Users

```
📨 [REQUEST] GET /users
⏰ [TIME] 2026-09-17T10:31:45.123Z

👥 [GET_USERS] Fetching all users...
🔗 [GET_USERS] Getting database connection...
✅ [GET_USERS] Connection obtained
🔍 [GET_USERS] Executing query to fetch users with roles...
📊 [GET_USERS] Query returned 12 user(s)
📋 [GET_USERS] Users: [
  {"id":1,"name":"Aurum Admin","email":"admin@aurum.com","role":"admin"},
  {"id":2,"name":"Dr. Test","email":"doctor@test.com","role":"doctor"},
  ...
]
✅ [GET_USERS] Connection released
📤 [GET_USERS] Sending response with 12 users
```

**✅ IF YOU SEE THIS:** Users fetched successfully from database.

---

### Backend Log Flow - Updating User

```
📨 [REQUEST] PUT /users/1
📦 [BODY] { name: "Dr. Shelke", email: "doctor@aurum.com" }

✏️ [PUT_USER] Updating user ID: 1
📝 [PUT_USER] Update data: {name: "Dr. Shelke", email: "doctor@aurum.com"}
🔗 [PUT_USER] Getting database connection...
✅ [PUT_USER] Connection obtained
📝 [PUT_USER] Will update name to: Dr. Shelke
📝 [PUT_USER] Will update email to: doctor@aurum.com
🔍 [PUT_USER] Executing update query...
✅ [PUT_USER] User table updated successfully
✅ [PUT_USER] Connection released
✅ [PUT_USER] SUCCESS! User ID 1 updated completely
📤 [PUT_USER] Sending response: {"message":"✅ User updated successfully!","userId":"1"}
```

**✅ IF YOU SEE THIS:** User updated successfully in database.

---

### Backend Log Flow - Failed Update (No Connection)

```
📨 [REQUEST] PUT /users/1

✏️ [PUT_USER] Updating user ID: 1
🔗 [PUT_USER] Getting database connection...
❌ [PUT_USER] ERROR: Pool connections are all busy
   Error: No connection available
📋 Stack trace: [full error...]
```

**❌ IF YOU SEE THIS:** Database connection pool exhausted or database unreachable.

---

## 🎯 COMMON PROBLEMS & SOLUTIONS

### Problem 1: Login Works Locally, But Fails on Production

**Frontend logs show:**
```
📨 [LOGIN] Sending POST request to: https://aurumhomeopathy.com:3001/login
❌ [LOGIN] Backend error: Network request failed
```

**Solution:**
- Backend not deployed to production
- Check: Is server.js running on Hostinger?
- Run: `pm2 status` on Hostinger
- Fix: Deploy backend with `npm start` or `pm2 start server.js`

---

### Problem 2: Database Connection Failed (504 Error)

**Backend logs show:**
```
❌ [LOGIN] ERROR: connect ECONNREFUSED 127.0.0.1:3306
```

**Backend startup shows:**
```
❌ DATABASE CONNECTION INFO:
   Status: 🔴 FAILED
```

**Solution:**
- Database host wrong (using srv1752.hstgr.io instead of localhost)
- Database credentials wrong
- Database server not running
- Fix: Update .env file with correct credentials
  ```
  DB_HOST=localhost
  DB_USER=u154384799_Aurum
  DB_PASS=Aurum2025
  DB_NAME=u154384799_Ahc
  ```

---

### Problem 3: Users List Shows 0 Users

**Frontend logs show:**
```
✅ [GET_USERS] Users received: []
📋 [GET_USERS] Setting users state with 0 users
```

**Backend logs show:**
```
📊 [GET_USERS] Query returned 0 user(s)
```

**Solution:**
- Users table empty
- Wrong database name
- Database not initialized
- Fix: Run setup endpoint or manually insert test users

---

### Problem 4: Save Edit Doesn't Persist After Refresh

**Frontend logs show:**
```
✅ [SaveEdit] Update successful
```

**But backend logs show:**
```
❌ [PUT_USER] ERROR: Unable to connect to database
```

**Solution:**
- Backend connection lost
- Database session timeout
- Fix: Check backend is still running
- Restart: `pm2 restart aurum-backend`

---

## 🚀 HOW TO DEBUG STEP-BY-STEP

### Step 1: Check Backend Startup
Open terminal where backend runs, look for:
```
🟢 CONNECTED      ← Backend ready
🎯 Ready to accept connections!
```

If NOT there, backend not running. Start it:
```bash
cd d:\Aurum-homeopathy
node server.js
```

---

### Step 2: Check Frontend Connection
Open browser console, try to login. Look for:
```
📨 [LOGIN] Sending POST request to: http://localhost:3001/login
```

If this line appears, frontend trying to reach backend. Good!

---

### Step 3: Check Backend Receives Request
In backend terminal, you should see:
```
📨 [REQUEST] POST /login
```

If NOT there, frontend can't reach backend. Check:
- Is backend URL correct? (`http://localhost:3001`)
- Is backend actually running?
- Is firewall blocking port 3001?

---

### Step 4: Check Database Query
In backend terminal, look for:
```
🔍 [LOGIN] Querying users table for email:
```

If you see:
```
❌ ERROR: connect ECONNREFUSED
```
Database connection failed. Check credentials and host.

---

### Step 5: Check Response Sent
In backend terminal, look for:
```
📤 [LOGIN] Sending response:
```

This means backend successfully processed request and sending result.

---

## 📝 LOG LEVELS EXPLAINED

| Symbol | Meaning | Action |
|--------|---------|--------|
| 📨 | Request received | Normal |
| 📬 | Response received | Normal |
| 🔐 | Security/Login | Normal |
| ✅ | Success | Good! |
| ❌ | Error | FIX NEEDED |
| ⚠️ | Warning | Investigate |
| 🔍 | Searching/Querying | Normal |
| 📊 | Data retrieved | Normal |
| 💾 | Saved to storage | Normal |
| 🗑️ | Deleting | Normal |

---

## 🎯 PRODUCTION DEBUG CHECKLIST

1. **Frontend URL Correct?**
   ```
   Check browser: is URL https://aurumhomeopathy.com/ ?
   Frontend logs should show: ✅ [getApiBaseUrl] Using: https://aurumhomeopathy.com:3001
   ```

2. **Backend Running on Hostinger?**
   ```bash
   ssh u15438479@aurumhomeopathy.com
   pm2 status
   # Should show: aurum-backend online
   ```

3. **Database Accessible?**
   ```bash
   # On Hostinger terminal:
   mysql -h localhost -u u154384799_Aurum -p
   # Should connect (password: Aurum2025)
   ```

4. **Port 3001 Open?**
   ```bash
   curl https://aurumhomeopathy.com:3001/health
   # Should return: {"ok":true,"database":"connected"}
   ```

5. **Check Logs**
   ```bash
   pm2 logs aurum-backend
   # Should show ✅ messages, not ❌
   ```

---

## 🔗 NEXT STEPS

1. **Collect Logs:** Take screenshots of console logs showing the problem
2. **Share Logs:** Post both frontend (browser console) and backend (terminal) logs
3. **Identify Pattern:** Which log is missing? Where does it fail?
4. **Fix:** Use the solution for that problem above

---

**💡 PRO TIP:** Save logs by:
- Right-click console → Save as... (Browser DevTools)
- Copy terminal output and paste in text file
- Use `pm2 logs aurum-backend --out debug.log` to save backend logs

Good luck debugging! 🔧
