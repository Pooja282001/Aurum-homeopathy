-- Fix user roles for testing
-- Update users 5, 6, 7 to have correct roles

UPDATE users SET role = 'super_admin' WHERE id = 5;
UPDATE users SET role = 'admin' WHERE id = 6;
UPDATE users SET role = 'doctor' WHERE id = 7;

-- Verify
SELECT id, name, email, role FROM users WHERE id IN (5, 6, 7);
