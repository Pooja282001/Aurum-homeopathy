-- Import database.sql first, then import this file in phpMyAdmin.
-- Demo login password for both accounts: password
-- Change or delete these accounts before production use.

INSERT INTO users (name, email, password_hash, role) VALUES
  ('Aurum Admin', 'admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.YeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin'),
  ('Aurum Doctor', 'doctor@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.YeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'doctor'),
  ('Test Patient', 'patient@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.YeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'patient')
ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role);

INSERT INTO appointments (user_id, name, phone, email, date, time_slot, service, status)
SELECT id, 'Test Patient', '+91 90000 00000', 'patient@example.com', CURRENT_DATE + INTERVAL 2 DAY, '10:00 AM', 'General consultation', 'New'
FROM users WHERE email = 'patient@example.com'
AND NOT EXISTS (SELECT 1 FROM appointments WHERE email = 'patient@example.com');

INSERT INTO media (title, type, url) VALUES
  ('Aurum clinic photo', 'image', 'https://aurumhomeopathy.com/assets/doctor-jayesh.jpg.png'),
  ('Homeopathy consultation video', 'video', 'https://www.youtube.com/watch?v=REPLACE_WITH_YOUR_VIDEO_ID');
