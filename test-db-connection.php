<?php
/**
 * Database Connection Test Script
 * Place your Hostinger credentials below and run to check connection
 */

echo "🔍 Hostinger Database Connection Test\n";
echo "====================================\n\n";

// 🔴 UPDATE THESE WITH YOUR ACTUAL CREDENTIALS
$db_host = 'srv1752.hstgr.io';
$db_name = 'u154384799_Ahc';
$db_user = 'u154384799_Aurum';
$db_password = 'Aurum2025';
$db_charset = 'utf8mb4';

echo "📋 Configuration:\n";
echo "  Host: $db_host\n";
echo "  Database: $db_name\n";
echo "  User: $db_user\n\n";

try {
    echo "🔌 Attempting connection...\n";
    $dsn = sprintf('mysql:host=%s;dbname=%s;charset=%s', $db_host, $db_name, $db_charset);
    $pdo = new PDO($dsn, $db_user, $db_password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    
    echo "✅ CONNECTION SUCCESSFUL!\n\n";
    
    // Test query
    $result = $pdo->query('SELECT 1 as test');
    echo "✅ Test query passed\n";
    
    // Check tables
    $tables = $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
    echo "\n📊 Tables in database:\n";
    foreach ($tables as $table) {
        echo "  - $table\n";
    }
    
} catch (PDOException $e) {
    echo "❌ CONNECTION FAILED!\n\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "\n🔧 Troubleshooting:\n";
    echo "  1. Check password is correct\n";
    echo "  2. Verify hostname: srv1752.hstgr.io\n";
    echo "  3. Check database name: u154384799_Ahc\n";
    echo "  4. Verify username: u154384799_Aurum\n";
}
?>
