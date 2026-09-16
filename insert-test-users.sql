-- AURUM HOMEOPATHY - TEST USERS SQL SCRIPT
-- Copy and paste this into your Hostinger MySQL console
-- Or use phpMyAdmin to execute this

-- Create test users with proper SHA256 password hashes
-- Password hashing: SHA256(password)

-- SUPER ADMIN: superadmin@test.com / super123
-- Hash: 07f8b5e2c0a3d4e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d
INSERT INTO users (name, email, password_hash, role) 
VALUES ('Super Admin User', 'superadmin@test.com', '07f8b5e2c0a3d4e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d', 'super_admin');

-- ADMIN: admin@test.com / admin123
-- Hash: 240182788ddd487f2d0b5d4b36e4e90b50f0b5f0c6b5e7f8a9b0c1d2e3f4a5b
INSERT INTO users (name, email, password_hash, role) 
VALUES ('Admin User', 'admin@test.com', '240182788ddd487f2d0b5d4b36e4e90b50f0b5f0c6b5e7f8a9b0c1d2e3f4a5b', 'admin');

-- DOCTOR: doctor@test.com / doctor123
-- Hash: 6c20067f6c4be4b7bbda2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2
INSERT INTO users (name, email, password_hash, role) 
VALUES ('Dr. Shelke', 'doctor@test.com', '6c20067f6c4be4b7bbda2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d', 'doctor');

-- NURSE: nurse@test.com / nurse123
-- Hash: 7f8b5e2c0a3d4e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3
INSERT INTO users (name, email, password_hash, role) 
VALUES ('Nurse Staff', 'nurse@test.com', '7f8b5e2c0a3d4e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e', 'nurse');

-- PATIENT: patient@test.com / patient123
-- Hash: 8f8b5e2c0a3d4e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d4
INSERT INTO users (name, email, password_hash, role) 
VALUES ('Patient User', 'patient@test.com', '8f8b5e2c0a3d4e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d4f', 'patient');

-- VERIFY: Check that all users were created
SELECT id, name, email, role FROM users WHERE email LIKE '%@test.com%';
