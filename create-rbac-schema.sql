-- ============================================
-- 1. CREATE ROLES TABLE
-- ============================================
CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
('super_admin', 'Full system control - can manage users, roles, permissions, and all appointments'),
('admin', 'Admin dashboard - can manage appointments and view user data'),
('doctor', 'Doctor portal - can view and edit appointments, update patient info'),
('nurse', 'Nurse portal - can view appointments and patient information (read-only)'),
('patient', 'Patient portal - can book appointments and view own appointments');

-- ============================================
-- 2. CREATE PERMISSIONS TABLE
-- ============================================
CREATE TABLE permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255),
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert permissions
INSERT INTO permissions (name, description, category) VALUES
-- User Management
('manage_users', 'Create, edit, delete users', 'users'),
('view_users', 'View all users', 'users'),
('manage_roles', 'Assign and change user roles', 'users'),
('disable_users', 'Disable/enable user accounts', 'users'),

-- Appointment Management
('manage_appointments', 'Create, edit, delete any appointment', 'appointments'),
('edit_appointments', 'Edit appointments', 'appointments'),
('delete_appointments', 'Delete appointments', 'appointments'),
('view_appointments', 'View all appointments', 'appointments'),
('book_appointments', 'Book new appointments', 'appointments'),

-- System Control
('enable_maintenance_mode', 'Enable/disable maintenance mode', 'system'),
('view_system_status', 'View system health and status', 'system'),
('manage_permissions', 'Manage user permissions', 'system');

-- ============================================
-- 3. CREATE ROLE_PERMISSIONS JOIN TABLE
-- ============================================
CREATE TABLE role_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
  UNIQUE KEY unique_role_permission (role_id, permission_id)
);

-- Assign permissions to roles
-- Super Admin: ALL permissions
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'super_admin';

-- Admin: Can view/manage appointments, view users
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'admin' AND p.name IN (
  'view_appointments', 'manage_appointments', 'edit_appointments', 'delete_appointments',
  'view_users', 'book_appointments'
);

-- Doctor: Can view and edit appointments
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'doctor' AND p.name IN (
  'view_appointments', 'edit_appointments', 'book_appointments'
);

-- Nurse: Can view appointments only
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'nurse' AND p.name IN (
  'view_appointments'
);

-- Patient: Can book and view own appointments
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'patient' AND p.name IN (
  'book_appointments'
);

-- ============================================
-- 4. CREATE USER_ROLES JOIN TABLE
-- ============================================
CREATE TABLE user_roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_role (user_id, role_id)
);

-- Migrate existing users from users.role to user_roles table
-- User 5: superadmin@test.com -> super_admin role
INSERT INTO user_roles (user_id, role_id) 
VALUES (5, (SELECT id FROM roles WHERE name = 'super_admin'));

-- User 6: admin@test.com -> admin role
INSERT INTO user_roles (user_id, role_id) 
VALUES (6, (SELECT id FROM roles WHERE name = 'admin'));

-- User 7: doctor@test.com -> doctor role
INSERT INTO user_roles (user_id, role_id) 
VALUES (7, (SELECT id FROM roles WHERE name = 'doctor'));

-- Migrate all other users as 'patient'
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r 
WHERE r.name = 'patient' 
AND u.id NOT IN (SELECT user_id FROM user_roles);

-- ============================================
-- 5. CREATE HELPER VIEWS FOR EASY QUERYING
-- ============================================

-- View to get user with all their roles
CREATE VIEW user_with_roles AS
SELECT 
  u.id,
  u.name,
  u.email,
  u.password_hash,
  u.created_at,
  GROUP_CONCAT(r.name SEPARATOR ',') as roles,
  GROUP_CONCAT(r.id SEPARATOR ',') as role_ids
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
GROUP BY u.id;

-- View to get role with all permissions
CREATE VIEW role_with_permissions AS
SELECT 
  r.id,
  r.name,
  r.description,
  GROUP_CONCAT(p.name SEPARATOR ',') as permissions,
  COUNT(p.id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
GROUP BY r.id;

-- ============================================
-- USEFUL QUERIES
-- ============================================

-- Get user with permissions
-- SELECT DISTINCT u.id, u.name, u.email, p.name as permission
-- FROM users u
-- LEFT JOIN user_roles ur ON u.id = ur.user_id
-- LEFT JOIN role_permissions rp ON ur.role_id = rp.role_id
-- LEFT JOIN permissions p ON rp.permission_id = p.id
-- WHERE u.id = 5;

-- Check if user has permission
-- SELECT u.id, u.name, 
--   IF(COUNT(p.id) > 0, 1, 0) as has_permission
-- FROM users u
-- LEFT JOIN user_roles ur ON u.id = ur.user_id
-- LEFT JOIN role_permissions rp ON ur.role_id = rp.role_id
-- LEFT JOIN permissions p ON rp.permission_id = p.id
-- WHERE u.id = 5 AND p.name = 'manage_appointments'
-- GROUP BY u.id;

-- Update user role
-- DELETE FROM user_roles WHERE user_id = 5;
-- INSERT INTO user_roles (user_id, role_id) VALUES (5, (SELECT id FROM roles WHERE name = 'doctor'));
