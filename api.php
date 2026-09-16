<?php
/**
 * UNIFIED API ENDPOINT
 * Single file handles: health check, login, system-status, everything
 * Deploy this to: /public_html/api.php OR /api.php
 * Access: https://aurumhomeopathy.com/api.php?action=login
 * 
 * This is a fallback if index.php folder structure fails
 */

header('Content-Type: application/json; charset=utf-8');

// Database configuration
$config = [
    'db_host' => 'srv1752.hstgr.io',
    'db_name' => 'u154384799_Ahc',
    'db_user' => 'u154384799_Aurum',
    'db_password' => 'Aurum2025',
    'db_charset' => 'utf8mb4',
    'allowed_origin' => 'https://aurumhomeopathy.com',
];

// Set CORS headers
header('Access-Control-Allow-Origin: ' . $config['allowed_origin']);
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');

// Handle OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Response helper
function respond($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_SLASHES);
    exit;
}

// Start session (suppress warnings if headers already sent)
@session_start();

// Get action and method - SANITIZE action
$action = trim($_GET['action'] ?? '');
$action = strtolower($action); // Normalize to lowercase
$method = strtoupper($_SERVER['REQUEST_METHOD']);
$body = json_decode(file_get_contents('php://input'), true) ?: [];

// Debug: Log the action received
error_log("API Request - Action: '$action', Method: $method");

// Connect to database
try {
    $dsn = sprintf('mysql:host=%s;dbname=%s;charset=%s', 
        $config['db_host'], 
        $config['db_name'], 
        $config['db_charset']
    );
    $pdo = new PDO($dsn, $config['db_user'], $config['db_password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (Throwable $error) {
    respond(['error' => 'Database connection failed: ' . $error->getMessage()], 500);
}

// ============= HEALTH CHECK =============
if ($action === 'health' && $method === 'GET') {
    $pdo->query('SELECT 1');
    respond(['ok' => true, 'database' => 'connected']);
}

// ============= SYSTEM STATUS - GET =============
if ($action === 'system-status' && $method === 'GET') {
    try {
        $stmt = $pdo->query('SELECT id, is_online, maintenance_mode, comment FROM system_status WHERE id = 1');
        $status = $stmt->fetch();
        
        if (!$status) {
            $pdo->exec('INSERT INTO system_status (id, is_online, maintenance_mode, comment) VALUES (1, 1, 0, "")');
            $status = ['id' => 1, 'is_online' => 1, 'maintenance_mode' => 0, 'comment' => ''];
        }
        
        respond([
            'isOnline' => (bool)$status['is_online'],
            'maintenanceMode' => (bool)$status['maintenance_mode'],
            'comment' => $status['comment'] ?? '',
        ]);
    } catch (Throwable $e) {
        respond(['error' => $e->getMessage()], 500);
    }
}

// ============= SYSTEM STATUS - PUT =============
if ($action === 'system-status' && $method === 'PUT') {
    try {
        $userId = $body['userId'] ?? null;
        $isOnline = isset($body['isOnline']) ? (int)$body['isOnline'] : null;
        $maintenanceMode = isset($body['maintenanceMode']) ? (int)$body['maintenanceMode'] : null;
        $comment = $body['comment'] ?? '';
        
        if (!$userId) {
            respond(['error' => 'userId required'], 401);
        }
        
        // Check if user is super_admin
        $userStmt = $pdo->prepare('SELECT role FROM users WHERE id = ?');
        $userStmt->execute([$userId]);
        $user = $userStmt->fetch();
        
        if (!$user || $user['role'] !== 'super_admin') {
            respond(['error' => 'Unauthorized. Only Super Admin can toggle system status.'], 403);
        }
        
        // Update system status
        $isOnline = $isOnline !== null ? $isOnline : 1;
        $maintenanceMode = $maintenanceMode !== null ? $maintenanceMode : 0;
        
        $updateStmt = $pdo->prepare(
            'UPDATE system_status SET is_online = ?, maintenance_mode = ?, comment = ?, last_updated = NOW() WHERE id = 1'
        );
        $updateStmt->execute([$isOnline, $maintenanceMode, $comment]);
        
        respond([
            'ok' => true,
            'message' => 'System status updated',
            'isOnline' => (bool)$isOnline,
            'maintenanceMode' => (bool)$maintenanceMode,
            'comment' => $comment,
        ]);
    } catch (Throwable $e) {
        respond(['error' => $e->getMessage()], 500);
    }
}

// ============= LOGIN =============
if ($action === 'login' && $method === 'POST') {
    $email = strtolower(trim((string)($body['email'] ?? '')));
    $password = (string)($body['password'] ?? '');
    
    if (empty($email) || empty($password)) {
        respond(['error' => 'Email and password are required.'], 400);
    }
    
    try {
        $stmt = $pdo->prepare('SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($password, $user['password_hash'])) {
            respond(['error' => 'Invalid email or password.'], 401);
        }
        
        unset($user['password_hash']);
        $_SESSION['user'] = $user;
        respond(['user' => $user]);
    } catch (Throwable $e) {
        respond(['error' => $e->getMessage()], 500);
    }
}

// ============= LOGOUT =============
if ($action === 'logout' && $method === 'POST') {
    session_destroy();
    respond(['ok' => true]);
}

// ============= GET CURRENT USER =============
if ($action === 'me' && $method === 'GET') {
    respond(['user' => $_SESSION['user'] ?? null]);
}

// ============= REGISTER =============
if ($action === 'register' && $method === 'POST') {
    $name = trim((string)($body['name'] ?? ''));
    $email = strtolower(trim((string)($body['email'] ?? '')));
    $password = (string)($body['password'] ?? '');
    
    if (empty($name) || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 8) {
        respond(['error' => 'Name, valid email, and 8+ character password required.'], 422);
    }
    
    try {
        $stmt = $pdo->prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)');
        $stmt->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT), 'patient']);
        respond([
            'user' => [
                'id' => (int)$pdo->lastInsertId(),
                'name' => $name,
                'email' => $email,
                'role' => 'patient'
            ]
        ], 201);
    } catch (PDOException $e) {
        respond(['error' => 'Email already registered.'], 409);
    }
}

// ============= APPOINTMENTS - GET =============
if ($action === 'appointments' && $method === 'GET') {
    $user = $_SESSION['user'] ?? null;
    if (!$user) {
        respond(['error' => 'Authentication required.'], 401);
    }
    
    try {
        if ($user['role'] === 'patient') {
            $query = 'SELECT * FROM appointments WHERE user_id = ? ORDER BY created_at DESC';
            $stmt = $pdo->prepare($query);
            $stmt->execute([$user['id']]);
        } else {
            $query = 'SELECT * FROM appointments ORDER BY created_at DESC';
            $stmt = $pdo->query($query);
        }
        
        respond(['appointments' => $stmt->fetchAll()]);
    } catch (Throwable $e) {
        respond(['error' => $e->getMessage()], 500);
    }
}

// ============= APPOINTMENTS - POST =============
if ($action === 'appointments' && $method === 'POST') {
    $user = $_SESSION['user'] ?? null;
    $userId = $user['id'] ?? null;
    $name = trim((string)($body['name'] ?? ($user['name'] ?? '')));
    $phone = trim((string)($body['phone'] ?? ''));
    $email = trim((string)($body['email'] ?? ($user['email'] ?? '')));
    $date = $body['date'] ?? null;
    $timeSlot = $body['timeSlot'] ?? null;
    $service = trim((string)($body['service'] ?? 'General consultation'));
    
    if (empty($name) || empty($phone) || empty($email) || !$date || !$timeSlot) {
        respond(['error' => 'All fields are required.'], 422);
    }
    
    try {
        $stmt = $pdo->prepare(
            'INSERT INTO appointments (user_id, name, phone, email, date, time_slot, service, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([$userId, $name, $phone, $email, $date, $timeSlot, $service, 'New']);
        respond(['id' => (int)$pdo->lastInsertId()], 201);
    } catch (Throwable $e) {
        respond(['error' => $e->getMessage()], 500);
    }
}

// ============= APPOINTMENTS - PATCH/DELETE =============
if (preg_match('#^appointments/(\d+)$#', $action, $matches) && in_array($method, ['PATCH', 'DELETE'], true)) {
    $appointmentId = (int)$matches[1];
    
    if ($method === 'DELETE') {
        try {
            $stmt = $pdo->prepare('DELETE FROM appointments WHERE id = ?');
            $stmt->execute([$appointmentId]);
            respond(['ok' => true]);
        } catch (Throwable $e) {
            respond(['error' => $e->getMessage()], 500);
        }
    }
    
    if ($method === 'PATCH') {
        $status = $body['status'] ?? null;
        if (!$status) {
            respond(['error' => 'Status required.'], 400);
        }
        
        try {
            $stmt = $pdo->prepare('UPDATE appointments SET status = ? WHERE id = ?');
            $stmt->execute([$status, $appointmentId]);
            respond(['ok' => true]);
        } catch (Throwable $e) {
            respond(['error' => $e->getMessage()], 500);
        }
    }
}

// Default response
respond(['error' => 'Unknown action or method not allowed.'], 404);
