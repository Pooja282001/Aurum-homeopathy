import mysql from 'mysql2/promise.js';

const config = {
  host: 'srv1752.hstgr.io',
  user: 'u154384799_Aurum',
  password: 'Aurum2025',
  database: 'u154384799_Ahc',
};

(async () => {
  let conn;
  try {
    conn = await mysql.createConnection(config);
    
    // Check if tables exist
    const [tables] = await conn.execute(`
      SELECT TABLE_NAME FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'u154384799_Ahc' 
      AND TABLE_NAME IN ('roles', 'permissions', 'role_permissions', 'user_roles')
    `);
    
    console.log('📊 Tables in database:');
    tables.forEach(t => console.log(`  ✅ ${t.TABLE_NAME}`));
    
    if (tables.length === 4) {
      console.log('\n✅ All 4 RBAC tables created successfully!');
      
      // Show data
      const [roleData] = await conn.execute('SELECT COUNT(*) as count FROM roles');
      const [permData] = await conn.execute('SELECT COUNT(*) as count FROM permissions');
      const [rpData] = await conn.execute('SELECT COUNT(*) as count FROM role_permissions');
      const [urData] = await conn.execute('SELECT COUNT(*) as count FROM user_roles');
      
      console.log(`\n📈 Data counts:`);
      console.log(`  Roles: ${roleData[0].count}`);
      console.log(`  Permissions: ${permData[0].count}`);
      console.log(`  Role-Permissions: ${rpData[0].count}`);
      console.log(`  User-Roles: ${urData[0].count}`);
    } else {
      console.log('\n⚠️ Only ' + tables.length + ' tables found. Expected 4.');
    }
    
  } catch (err) {
    console.log('Error:', err.message);
  } finally {
    if (conn) await conn.end();
  }
})();
