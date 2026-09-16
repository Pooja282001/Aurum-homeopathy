-- Verify system_status table structure and data

-- 1. Check if table exists
SELECT TABLE_NAME 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'u154384799_Ahc' AND TABLE_NAME = 'system_status';

-- 2. Show table structure
DESCRIBE system_status;

-- 3. Show current system status data
SELECT id, is_online, maintenance_mode, comment, last_updated 
FROM system_status;

-- 4. Show column information
SELECT 
  COLUMN_NAME,
  COLUMN_TYPE,
  IS_NULLABLE,
  COLUMN_DEFAULT,
  EXTRA
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'u154384799_Ahc' AND TABLE_NAME = 'system_status';

-- 5. Check if record exists, if not insert default
INSERT INTO system_status (id, is_online, maintenance_mode, comment) 
VALUES (1, 1, 0, '') 
ON DUPLICATE KEY UPDATE is_online=is_online;

-- 6. Verify final data
SELECT * FROM system_status WHERE id = 1;
