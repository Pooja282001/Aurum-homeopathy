const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'srv1752.hstgr.io',
  user: 'u154384799_Ahc',
  password: 'Aurum@123',
  database: 'u154384799_Ahc',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function addVisibilitySettings() {
  const connection = await pool.getConnection();
  
  try {
    console.log('📸 Adding visibility settings table...');
    
    // Create gallery_settings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS gallery_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        setting_key VARCHAR(50) UNIQUE NOT NULL,
        setting_value VARCHAR(50) NOT NULL,
        description VARCHAR(255),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_key (setting_key)
      )
    `);
    
    console.log('✅ Table created successfully');
    
    // Insert default settings
    await connection.execute(`
      INSERT IGNORE INTO gallery_settings (setting_key, setting_value, description)
      VALUES 
        ('videos_visible', '1', 'Show/Hide video section'),
        ('photos_visible', '1', 'Show/Hide photo section')
    `);
    
    console.log('✅ Default settings inserted');
    
    // Check current settings
    const [settings] = await connection.execute('SELECT * FROM gallery_settings');
    console.log('📊 Current settings:', settings);
    
    connection.release();
    console.log('✅ All done!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    connection.release();
    process.exit(1);
  }
}

addVisibilitySettings();
