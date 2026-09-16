-- Create system_status table to control online/offline and maintenance mode
CREATE TABLE IF NOT EXISTS system_status (
  id INT PRIMARY KEY AUTO_INCREMENT,
  is_online TINYINT(1) DEFAULT 1,
  maintenance_mode TINYINT(1) DEFAULT 0,
  comment VARCHAR(500) DEFAULT '',
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default record
INSERT INTO system_status (id, is_online, maintenance_mode, comment) 
VALUES (1, 1, 0, '') 
ON DUPLICATE KEY UPDATE is_online=VALUES(is_online);
