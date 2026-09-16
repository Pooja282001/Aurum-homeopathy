<?php
// Direct database update via PHP

$host = 'srv1752.hstgr.io';
$user = 'u154384799_Aurum';
$password = 'Aurum2025';
$database = 'u154384799_Ahc';

$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "✅ Connected to database\n\n";

// Update User 5
$conn->query("UPDATE users SET role = 'super_admin' WHERE id = 5");
echo "✓ User 5: role → super_admin\n";

// Update User 6
$conn->query("UPDATE users SET role = 'admin' WHERE id = 6");
echo "✓ User 6: role → admin\n";

// Update User 7
$conn->query("UPDATE users SET role = 'doctor' WHERE id = 7");
echo "✓ User 7: role → doctor\n";

// Verify
echo "\n📋 Verification:\n";
$result = $conn->query("SELECT id, email, role FROM users WHERE id IN (5, 6, 7)");

while ($row = $result->fetch_assoc()) {
    echo "User {$row['id']}: {$row['email']} → {$row['role']}\n";
}

echo "\n✅ All roles updated!\n";
$conn->close();
?>
