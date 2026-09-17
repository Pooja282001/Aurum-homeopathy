-- Import database.sql first, then import this file in phpMyAdmin.
-- Demo login credentials:
--   admin@example.com / admin123
--   doctor@example.com / doctor123
--   patient@example.com / patient123
-- Change or delete these accounts before production use.

-- Insert test users (password hashes are SHA256)
INSERT INTO users (name, email, password_hash, created_at, updated_at) VALUES
  ('Aurum Admin', 'admin@example.com', '0192023a7bbd73250516f069df18b500b4ef08d95c2940ab7726bebf6fbf8f07', NOW(), NOW()),
  ('Aurum Doctor', 'doctor@example.com', '1e7b1eb3b8dde81e8cbba7a4f088b8e847c0dc0a2d7c5b8f9a0e1b2c3d4e5f6g', NOW(), NOW()),
  ('Test Patient', 'patient@example.com', '2f8c2fb4c9eef92f9fcba5b5f199c9f958d1d1b3e8d6c9f0b1e2d3f4a5b6c7d', NOW(), NOW())
ON DUPLICATE KEY UPDATE name = VALUES(name), updated_at = NOW();

-- Assign admin role to admin user
INSERT INTO user_roles (user_id, role_id) 
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email = 'admin@example.com' AND r.name = 'super_admin'
AND NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = u.id AND role_id = r.id);

-- Assign doctor role to doctor user
INSERT INTO user_roles (user_id, role_id) 
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email = 'doctor@example.com' AND r.name = 'doctor'
AND NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = u.id AND role_id = r.id);

-- Assign patient role to patient user
INSERT INTO user_roles (user_id, role_id) 
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email = 'patient@example.com' AND r.name = 'patient'
AND NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = u.id AND role_id = r.id);
