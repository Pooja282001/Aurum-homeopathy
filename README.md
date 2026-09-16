# Dr. Shelke's Aurum Homeopathic Clinic

## Hostinger database setup

The app uses a PHP/PDO API for production data. Database credentials must stay in `api/config.php`; never put them in React or a `VITE_` environment variable.

1. Select database `u154384799_Ahc` in phpMyAdmin and import `database.sql`.
2. Import `database-test-data.sql` to create test users, one appointment, and image/video URL records. Test password for all three users is `password`.
3. Copy `api/config.example.php` to `api/config.php` on Hostinger and fill in the newly rotated database password and production origin.
4. Upload the `api` folder to the website and copy `.env.example` to `.env` locally before building. Set `VITE_API_BASE_URL` to the public URL of `api/index.php`.
5. Open `https://aurumhomeopathy.com/api/index.php?action=health`. It should return `{"ok":true,"database":"connected"}`.
6. Build with `npm run build` and upload the generated `dist` files.

The API supports patient registration, email/password login with hashed passwords, appointment creation, admin/doctor permissions, and image/video URL records in the `media` table. Files should be uploaded to Hostinger storage or a media provider; store only their public URLs in MySQL.