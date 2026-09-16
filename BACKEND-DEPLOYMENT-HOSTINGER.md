# 🚀 Backend Deployment to Hostinger Production

## Problem
Frontend is deployed but backend is not running on production. When frontend tries to connect, it gets **504 Gateway Time-out**.

## Solution: Deploy Node.js Backend on Hostinger

### Step 1: SSH into Hostinger Server

```bash
# Use FileZilla or PuTTY to connect
Host: ftp.aurumhomeopathy.com
Username: u15438479
Password: Aurum2025
```

Or use SSH:
```bash
ssh u15438479@aurumhomeopathy.com
```

### Step 2: Upload Backend Files

Upload to `/home/u15438479/` directory:
```
server.js
package.json
package-lock.json
```

### Step 3: Install Dependencies

```bash
cd /home/u15438479
npm install express mysql2 cors
```

### Step 4: Test Backend Locally on Server

```bash
node server.js
```

You should see:
```
[*] Server URL: http://localhost:3001
✅ Database connected!
```

Press Ctrl+C to stop.

### Step 5: Install PM2 (Process Manager)

PM2 keeps the server running even after SSH disconnect.

```bash
npm install -g pm2
pm2 start server.js --name "aurum-backend"
pm2 save
pm2 startup
```

### Step 6: Verify Backend is Running

```bash
pm2 logs aurum-backend
pm2 status
```

### Step 7: Configure Nginx Proxy (if Hostinger requires it)

Some Hostinger plans require routing through Nginx. Create/edit:
```
/etc/nginx/conf.d/aurumhomeopathy.com.conf
```

Add:
```nginx
location /api/ {
    proxy_pass http://localhost:3001/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

Then restart Nginx:
```bash
sudo systemctl restart nginx
```

### Step 8: Update Frontend for Production

On your laptop, update the backend URL in code:

**src/main.jsx** - Modify `getApiBaseUrl()`:
```javascript
function getApiBaseUrl() {
  const hostname = window.location.hostname
  const protocol = window.location.protocol
  
  // For production, always use production domain
  if (hostname.includes('aurumhomeopathy.com')) {
    return 'https://aurumhomeopathy.com/api' // or :3001 if port exposed
  }
  
  // For localhost/mobile
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001'
  }
  
  return `${protocol}//${hostname}:3001`
}
```

### Step 9: Rebuild & Redeploy Frontend

```bash
cd d:\Aurum-homeopathy
npm run build
# Upload dist/ to /public_html/
```

## Testing

1. **Test backend directly:**
   ```
   curl https://aurumhomeopathy.com:3001/health
   ```

2. **Test login from production:**
   - Go to https://aurumhomeopathy.com/
   - Click "Staff Login"
   - Try login (should NOT show 504)

3. **Check logs on server:**
   ```bash
   pm2 logs aurum-backend
   ```

## Troubleshooting

### "504 Gateway Time-out" persists
- Backend not running: `pm2 status`
- Port blocked by firewall: Check Hostinger security settings
- Wrong port: Verify port 3001 is accessible

### "Connection refused"
- Backend not started: `pm2 start server.js --name "aurum-backend"`
- Wrong hostname: Check frontend API URL

### "Cannot POST /login"
- Backend might be routing wrong
- Check `pm2 logs aurum-backend` for errors
- Verify database connection works: `mysql -h srv1752.hstgr.io -u u154384799_Aurum -p`

## Monitoring

```bash
# View logs
pm2 logs aurum-backend

# View status
pm2 status

# Restart after updates
pm2 restart aurum-backend

# Stop
pm2 stop aurum-backend

# Remove
pm2 delete aurum-backend
```

## Auto-Start After Server Reboot

```bash
pm2 startup
pm2 save
```

This ensures backend starts automatically if server reboots.

## Summary

✅ Upload server.js and dependencies to Hostinger  
✅ Run `npm install`  
✅ Start with PM2: `pm2 start server.js`  
✅ Update frontend API URL for production  
✅ Rebuild frontend: `npm run build`  
✅ Upload dist/ to /public_html/  
✅ Test login should work without 504 error
