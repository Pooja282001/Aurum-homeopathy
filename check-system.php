<?php
// Direct database check
$host = 'srv1752.hstgr.io';
$db = 'u154384799_Ahc';
$user = 'u154384799_Aurum';
$pass = 'Aurum2025';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    
    echo "╔════════════════════════════════════════╗\n";
    echo "║   AURUM DATABASE SYSTEM STATUS CHECK   ║\n";
    echo "╚════════════════════════════════════════╝\n\n";
    
    // 1. Check system_status
    echo "📊 SYSTEM STATUS:\n";
    $stmt = $pdo->query("SELECT * FROM system_status LIMIT 1");
    $status = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($status) {
        echo "   is_online: " . ($status['is_online'] ? "✅ ONLINE" : "❌ OFFLINE") . "\n";
        echo "   maintenance_mode: " . ($status['maintenance_mode'] ? "✅ ON" : "❌ OFF") . "\n";
        echo "   comment: " . ($status['comment'] ?: "(empty)") . "\n";
        echo "   last_updated: " . $status['last_updated'] . "\n";
    }
    
    // 2. Set system ONLINE for testing
    echo "\n📝 SETTING SYSTEM TO ONLINE...\n";
    $pdo->query("UPDATE system_status SET is_online = 1, maintenance_mode = 0, comment = 'System ONLINE - Testing' WHERE id = 1");
    echo "   ✅ Done\n";
    
    // 3. Show users
    echo "\n👥 USERS IN DATABASE:\n";
    $stmt = $pdo->query("SELECT u.id, u.username, u.email FROM users u LIMIT 10");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($users as $u) {
        echo "   - {$u['username']} ({$u['email']}) ID: {$u['id']}\n";
    }
    
    // 4. Create test super admin if not exists
    echo "\n🔐 CHECKING TEST ADMIN USER...\n";
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute(['admin@test.com']);
    $adminExists = $stmt->fetch();
    
    if (!$adminExists) {
        echo "   Creating test super admin...\n";
        // Create user
        $hash = hash('sha256', 'admin123');
        $pdo->prepare("INSERT INTO users (username, email, name, password_hash) VALUES (?, ?, ?, ?)")
            ->execute(['admin', 'admin@test.com', 'Admin User', $hash]);
        echo "   ✅ User created\n";
    } else {
        echo "   ✅ Test admin already exists\n";
    }
    
    echo "\n✅ DATABASE CHECK COMPLETE\n";
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
?>
