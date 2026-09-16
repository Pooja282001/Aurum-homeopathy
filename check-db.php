<?php
// Database check script
$db_host = 'srv1752.hstgr.io';
$db_name = 'u154384799_Ahc';
$db_user = 'u154384799_Aurum';
$db_pass = 'Aurum2025';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "\n╔════════════════════════════════════════╗\n";
    echo "║         DATABASE STATUS CHECK         ║\n";
    echo "╚════════════════════════════════════════╝\n\n";
    
    // Check system_status
    echo "📊 SYSTEM STATUS:\n";
    $stmt = $pdo->query("SELECT * FROM system_status WHERE id = 1");
    $status = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($status) {
        echo "  is_online: " . ($status['is_online'] == 1 ? "✅ ONLINE (1)" : "❌ OFFLINE (0)") . "\n";
        echo "  maintenance_mode: " . ($status['maintenance_mode'] == 1 ? "✅ YES" : "❌ NO") . "\n";
        echo "  comment: " . ($status['comment'] ?: "(empty)") . "\n";
        echo "  last_updated: " . $status['last_updated'] . "\n";
    } else {
        echo "  ⚠️  NO RECORD FOUND\n";
    }
    
    // Check users
    echo "\n👥 USERS IN DATABASE:\n";
    $stmt = $pdo->query("
        SELECT u.id, u.username, u.email, u.name,
               GROUP_CONCAT(r.name SEPARATOR ', ') as roles
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.id
        GROUP BY u.id
        LIMIT 20
    ");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($users)) {
        echo "  ⚠️  NO USERS FOUND\n";
    } else {
        foreach ($users as $i => $u) {
            echo "  " . ($i+1) . ". " . $u['username'] . " (" . $u['email'] . ") - Roles: " . ($u['roles'] ?: "NONE") . "\n";
        }
    }
    
    // Check roles
    echo "\n🔐 AVAILABLE ROLES:\n";
    $stmt = $pdo->query("SELECT id, name, description FROM roles");
    $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($roles)) {
        echo "  ⚠️  NO ROLES FOUND\n";
    } else {
        foreach ($roles as $i => $r) {
            echo "  " . ($i+1) . ". " . $r['name'] . " - " . ($r['description'] ?: "") . "\n";
        }
    }
    
    echo "\n";
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
?>
