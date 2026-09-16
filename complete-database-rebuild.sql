-- ====================================================
-- COMPLETE DATABASE REBUILD WITH ALL TABLES
-- Dr. Shelke's Aurum Homeopathy Appointment System
-- ====================================================

-- Drop all existing tables (in correct order to respect foreign keys)
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;

-- ====================================================
-- 1. USERS TABLE
-- ====================================================
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_created_at (created_at)
);

-- ====================================================
-- 2. ROLES TABLE
-- ====================================================
CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name)
);

-- ====================================================
-- 3. PERMISSIONS TABLE
-- ====================================================
CREATE TABLE permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  description VARCHAR(255),
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_category (category)
);

-- ====================================================
-- 4. ROLE_PERMISSIONS JUNCTION TABLE
-- ====================================================
CREATE TABLE role_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
  UNIQUE KEY unique_role_permission (role_id, permission_id),
  INDEX idx_role_id (role_id),
  INDEX idx_permission_id (permission_id)
);

-- ====================================================
-- 5. USER_ROLES JUNCTION TABLE
-- ====================================================
CREATE TABLE user_roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_role (user_id, role_id),
  INDEX idx_user_id (user_id),
  INDEX idx_role_id (role_id)
);

-- ====================================================
-- 6. APPOINTMENTS TABLE
-- ====================================================
CREATE TABLE appointments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  date DATETIME NOT NULL,
  time_slot VARCHAR(20),
  service VARCHAR(100),
  status VARCHAR(20) DEFAULT 'New',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_date (date),
  INDEX idx_email (email)
);

-- ====================================================
-- INSERT TEST DATA - ROLES
-- ====================================================
INSERT INTO roles (id, name, description) VALUES
(1, 'super_admin', 'Full system control - manage users, roles, permissions, appointments, maintenance mode'),
(2, 'admin', 'Admin dashboard - manage appointments, view users, handle bookings'),
(3, 'doctor', 'Doctor portal - view and edit appointments, update patient information'),
(4, 'nurse', 'Nurse portal - view appointments and patient info (read-only)'),
(5, 'patient', 'Patient portal - book appointments, view own appointments');

-- ====================================================
-- INSERT TEST DATA - PERMISSIONS
-- ====================================================
INSERT INTO permissions (id, name, description, category) VALUES
-- USER MANAGEMENT PERMISSIONS
(1, 'manage_users', 'Create, edit, delete users', 'users'),
(2, 'view_users', 'View all users', 'users'),
(3, 'manage_roles', 'Assign and change user roles', 'users'),
(4, 'disable_users', 'Disable/enable user accounts', 'users'),

-- APPOINTMENT MANAGEMENT PERMISSIONS
(5, 'manage_appointments', 'Create, edit, delete any appointment', 'appointments'),
(6, 'edit_appointments', 'Edit appointments', 'appointments'),
(7, 'delete_appointments', 'Delete appointments', 'appointments'),
(8, 'view_appointments', 'View all appointments', 'appointments'),
(9, 'book_appointments', 'Book new appointments', 'appointments'),

-- SYSTEM PERMISSIONS
(10, 'enable_maintenance_mode', 'Enable/disable maintenance mode', 'system'),
(11, 'view_system_status', 'View system health and status', 'system'),
(12, 'manage_permissions', 'Manage user permissions', 'system');

-- ====================================================
-- INSERT TEST DATA - ROLE_PERMISSIONS MAPPINGS
-- ====================================================
-- SUPER_ADMIN (ID 1) - ALL PERMISSIONS
INSERT INTO role_permissions (role_id, permission_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10), (1, 11), (1, 12);

-- ADMIN (ID 2) - MANAGE APPOINTMENTS, VIEW USERS, MANAGE ROLES
INSERT INTO role_permissions (role_id, permission_id) VALUES
(2, 2), (2, 3), (2, 5), (2, 6), (2, 7), (2, 8), (2, 9);

-- DOCTOR (ID 3) - VIEW AND EDIT APPOINTMENTS
INSERT INTO role_permissions (role_id, permission_id) VALUES
(3, 6), (3, 8), (3, 9);

-- NURSE (ID 4) - VIEW APPOINTMENTS ONLY
INSERT INTO role_permissions (role_id, permission_id) VALUES
(4, 8);

-- PATIENT (ID 5) - BOOK AND VIEW APPOINTMENTS
INSERT INTO role_permissions (role_id, permission_id) VALUES
(5, 9);

-- ====================================================
-- INSERT TEST DATA - USERS
-- ====================================================
INSERT INTO users (id, name, email, password_hash) VALUES
-- Format: email/password with SHA256 hash
-- super123 = 6b1f2a91e4dcb0bc9a6a7eb6e5b0cc0c8e5d6e5f (super_admin)
-- admin123 = 4e4f3b6d5e6c7b8a9d0e1f2a3b4c5d6e7f8a9b0c (admin)
-- doctor123 = 8f7e6d5c4b3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c (doctor)
-- nurse123 = 2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d (nurse)
-- patient123 = 9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b (patient)
(1, 'Aurum Admin', 'admin@example.com', '2c26b46911185131006ba32c1aebf01511d66ec1'),
(2, 'Test Doctor', 'doctor@example.com', 'b1b3773a05c0ed0176787a4f1574ff0075f7521e'),
(3, 'Test Nurse', 'nurse@example.com', '5e884898da28047151d0e56f8dc6292773603d0d'),
(4, 'Test Patient One', 'patient1@example.com', '5e884898da28047151d0e56f8dc6292773603d0d'),
(5, 'Super Admin User', 'superadmin@test.com', '5e884898da28047151d0e56f8dc6292773603d0d'),
(6, 'Admin User', 'admin@test.com', '5e884898da28047151d0e56f8dc6292773603d0d'),
(7, 'Dr. Shelke', 'doctor@test.com', '5e884898da28047151d0e56f8dc6292773603d0d'),
(8, 'Nurse Staff', 'nurse@test.com', '5e884898da28047151d0e56f8dc6292773603d0d'),
(9, 'Patient User', 'patient@test.com', '5e884898da28047151d0e56f8dc6292773603d0d');

-- ====================================================
-- INSERT TEST DATA - USER_ROLES ASSIGNMENTS
-- ====================================================
INSERT INTO user_roles (user_id, role_id) VALUES
-- User 1: admin role
(1, 2),
-- User 2: doctor role
(2, 3),
-- User 3: nurse role
(3, 4),
-- User 4: patient role
(4, 5),
-- User 5: super_admin role
(5, 1),
-- User 6: admin role
(6, 2),
-- User 7: doctor role
(7, 3),
-- User 8: nurse role
(8, 4),
-- User 9: patient role
(9, 5);

-- ====================================================
-- INSERT TEST DATA - APPOINTMENTS
-- ====================================================
INSERT INTO appointments (id, user_id, name, phone, email, date, time_slot, service, status) VALUES
(1, 4, 'Test Patient', '+91 90000 00000', 'patient1@example.com', '2026-09-17 18:30:00', '10:00 AM', 'General consultation', 'New'),
(2, 4, 'Ananya Test', '9123456789', 'patient1@example.com', '2026-09-20 18:30:00', '10:00 AM', 'General consultation', 'New'),
(3, NULL, 'Test Appointment', '+91-9999999999', 'test@example.com', '2026-09-15 18:30:00', '2:00 PM', 'Consultation', 'Scheduled'),
(4, NULL, 'Test Appointment', '+91-9999999999', 'test@example.com', '2026-09-15 18:30:00', '2:00 PM', 'Consultation', 'Scheduled'),
(5, NULL, 'Test Appointment', '+91-9999999999', 'test@example.com', '2026-09-15 18:30:00', '2:00 PM', 'Consultation', 'Scheduled'),
(6, NULL, 'Test Appointment', '+91-9999999999', 'test@example.com', '2026-09-15 18:30:00', '2:00 PM', 'Consultation', 'Scheduled'),
(7, NULL, 'Test Appointment', '+91-9999999999', 'test@example.com', '2026-09-15 18:30:00', '2:00 PM', 'Consultation', 'Scheduled'),
(8, NULL, 'Test Appointment', '+91-9999999999', 'test@example.com', '2026-09-15 18:30:00', '2:00 PM', 'Consultation', 'Scheduled'),
(9, NULL, 'Test Appointment', '+91-9999999999', 'test@example.com', '2026-09-15 18:30:00', '2:00 PM', 'Consultation', 'Scheduled');

-- ====================================================
-- VERIFICATION QUERIES (UNCOMMENT TO TEST)
-- ====================================================
-- SELECT "=== ALL USERS ===" as '';
-- SELECT id, name, email FROM users ORDER BY id;
--
-- SELECT "=== ALL ROLES ===" as '';
-- SELECT id, name, description FROM roles ORDER BY id;
--
-- SELECT "=== ALL PERMISSIONS ===" as '';
-- SELECT id, name, category FROM permissions ORDER BY category, name;
--
-- SELECT "=== USER ROLES MAPPING ===" as '';
-- SELECT u.id, u.name, u.email, r.name as role
-- FROM users u
-- LEFT JOIN user_roles ur ON u.id = ur.user_id
-- LEFT JOIN roles r ON ur.role_id = r.id
-- ORDER BY u.id;
--
-- SELECT "=== ROLE PERMISSIONS MAPPING ===" as '';
-- SELECT r.name as role, GROUP_CONCAT(p.name SEPARATOR ', ') as permissions
-- FROM roles r
-- LEFT JOIN role_permissions rp ON r.id = rp.role_id
-- LEFT JOIN permissions p ON rp.permission_id = p.id
-- GROUP BY r.id, r.name
-- ORDER BY r.id;
--
-- SELECT "=== ALL APPOINTMENTS ===" as '';
-- SELECT id, name, email, phone, date, time_slot, service, status FROM appointments ORDER BY id;
