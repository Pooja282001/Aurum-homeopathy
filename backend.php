<?php
/**
 * Aurum Homeopathy - PHP Backend
 * Complete REST API for Hostinger Shared Hosting
 * Uses direct database queries (no ORM)
 * Compatible with React frontend
 */

// Load configuration with hardcoded defaults as fallback
$config = [
    'db_host' => 'localhost',
    'db_port' => 3306,
    'db_name' => 'u154384799_Ahc',
    'db_user' => 'u154384799_Aurum',
    'db_password' => 'Aurum2025',
];

// Try to load config.php if it exists
$configPath = dirname(__FILE__) . '/config.php';
if (file_exists($configPath)) {
    $loaded = require $configPath;
    if (is_array($loaded) && !empty($loaded)) {
        $config = array_merge($config, $loaded);
    }
}

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Create MySQL connection
$conn = new mysqli(
    $config['db_host'],
    $config['db_user'],
    $config['db_password'],
    $config['db_name'],
    $config['db_port'] ?? 3306
);

// Check connection
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database connection failed',
        'message' => $conn->connect_error
    ]);
    exit;
}

$conn->set_charset("utf8");

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Parse URL to get endpoint
$endpoint = $_GET['action'] ?? '';

if (!$endpoint) {
    $request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $base_path = '/backend.php';
    $endpoint = str_replace($base_path, '', $request_uri);
    $endpoint = trim($endpoint, '/');
}

$method = $_SERVER['REQUEST_METHOD'];
$input = file_get_contents('php://input');
$body = json_decode($input, true) ?? [];

function json_response($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

function hash_password($password) {
    return hash('sha256', $password);
}

// GET /health
if ($endpoint === 'health' && $method === 'GET') {
    try {
        $result = $conn->query('SELECT 1');
        json_response([
            'ok' => true,
            'database' => 'connected',
            'message' => '✅ Database connection successful!',
            'timestamp' => date('c')
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        json_response([
            'error' => 'Database connection failed',
            'message' => $e->getMessage()
        ]);
    }
}

// GET /users
if ($endpoint === 'users' && $method === 'GET') {
    $query = "
        SELECT 
            u.id, 
            u.name, 
            u.email, 
            u.created_at,
            GROUP_CONCAT(r.name SEPARATOR ',') as role,
            GROUP_CONCAT(r.id SEPARATOR ',') as role_ids
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.id
        GROUP BY u.id
        ORDER BY u.id
    ";
    
    $result = $conn->query($query);
    
    if (!$result) {
        http_response_code(500);
        json_response(['error' => $conn->error]);
    }
    
    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
    
    json_response(['users' => $users]);
}

// POST /login
if ($endpoint === 'login' && $method === 'POST') {
    $email = $body['email'] ?? '';
    $password = $body['password'] ?? '';
    
    if (!$email || !$password) {
        http_response_code(422);
        json_response(['error' => 'Email and password required']);
    }
    
    $query = "SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(401);
        json_response(['error' => 'Invalid email or password']);
    }
    
    $user = $result->fetch_assoc();
    
    $password_hash = hash_password($password);
    if ($password_hash !== $user['password_hash']) {
        http_response_code(401);
        json_response(['error' => 'Invalid email or password']);
    }
    
    // Get user roles
    $roles_query = "
        SELECT r.id as role_id, r.name as role_name
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = ?
    ";
    
    $stmt = $conn->prepare($roles_query);
    $stmt->bind_param('i', $user['id']);
    $stmt->execute();
    $roles_result = $stmt->get_result();
    
    $roles = [];
    while ($role = $roles_result->fetch_assoc()) {
        $roles[] = $role['role_name'];
    }
    
    // If no roles found in user_roles table, assign based on email patterns (fallback)
    if (count($roles) === 0) {
        $email = strtolower($user['email']);
        
        if (strpos($email, 'admin') !== false || strpos($email, 'superadmin') !== false) {
            $roles[] = 'super_admin';
        } elseif (strpos($email, 'doctor') !== false) {
            $roles[] = 'doctor';
        } elseif (strpos($email, 'nurse') !== false) {
            $roles[] = 'nurse';
        } else {
            $roles[] = 'patient';
        }
    }
    
    // Get user permissions
    $perms_query = "
        SELECT DISTINCT p.name as permission
        FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = ?
    ";
    
    $stmt = $conn->prepare($perms_query);
    $stmt->bind_param('i', $user['id']);
    $stmt->execute();
    $perms_result = $stmt->get_result();
    
    $permissions = [];
    while ($perm = $perms_result->fetch_assoc()) {
        $permissions[] = $perm['permission'];
    }
    
    $primary_role = count($roles) > 0 ? $roles[0] : 'patient';
    
    json_response([
        'user' => [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $primary_role,
            'roles' => $roles,
            'permissions' => $permissions
        ],
        'message' => '✅ Login successful!'
    ]);
}

// POST /register
if ($endpoint === 'register' && $method === 'POST') {
    $name = $body['name'] ?? '';
    $email = $body['email'] ?? '';
    $password = $body['password'] ?? '';
    $role = $body['role'] ?? 'patient';
    
    if (!$name || !$email || !$password) {
        http_response_code(422);
        json_response(['error' => 'Name, email, and password required']);
    }
    
    $allowed_roles = ['patient', 'doctor', 'nurse', 'admin', 'super_admin'];
    if (!in_array($role, $allowed_roles)) {
        $role = 'patient';
    }
    
    $password_hash = hash_password($password);
    $query = "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('sss', $name, $email, $password_hash);
    
    if (!$stmt->execute()) {
        http_response_code(409);
        json_response(['error' => 'Email already registered']);
    }
    
    $user_id = $conn->insert_id;
    
    $role_query = "SELECT id FROM roles WHERE name = ?";
    $stmt = $conn->prepare($role_query);
    $stmt->bind_param('s', $role);
    $stmt->execute();
    $role_result = $stmt->get_result();
    
    if ($role_result->num_rows > 0) {
        $role_row = $role_result->fetch_assoc();
        $role_id = $role_row['id'];
        
        $assign_query = "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)";
        $stmt = $conn->prepare($assign_query);
        $stmt->bind_param('ii', $user_id, $role_id);
        $stmt->execute();
    }
    
    http_response_code(201);
    json_response([
        'id' => $user_id,
        'message' => '✅ Registration successful!',
        'role' => $role
    ]);
}

// PUT /users/:id
if (preg_match('#^users/(\d+)$#', $endpoint, $matches) && $method === 'PUT') {
    $id = $matches[1];
    $name = $body['name'] ?? '';
    $email = $body['email'] ?? '';
    $password = $body['password'] ?? '';
    
    if ($name || $email || $password) {
        $update_query = "UPDATE users SET";
        $params = [];
        $types = '';
        
        if ($name) {
            $update_query .= " name = ?,";
            $params[] = $name;
            $types .= 's';
        }
        if ($email) {
            $update_query .= " email = ?,";
            $params[] = $email;
            $types .= 's';
        }
        if ($password) {
            $password_hash = hash_password($password);
            $update_query .= " password_hash = ?,";
            $params[] = $password_hash;
            $types .= 's';
        }
        
        $update_query = rtrim($update_query, ',');
        $update_query .= " WHERE id = ?";
        $params[] = $id;
        $types .= 'i';
        
        $stmt = $conn->prepare($update_query);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
    }
    
    json_response([
        'ok' => true,
        'message' => '✅ User updated!',
        'id' => $id
    ]);
}

// DELETE /users/:id
if (preg_match('#^users/(\d+)$#', $endpoint, $matches) && $method === 'DELETE') {
    $id = $matches[1];
    
    $stmt = $conn->prepare("DELETE FROM user_roles WHERE user_id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    
    $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    
    json_response(['ok' => true, 'message' => '✅ User deleted!']);
}

// GET /appointments
if ($endpoint === 'appointments' && $method === 'GET') {
    $query = "SELECT * FROM appointments ORDER BY date DESC";
    $result = $conn->query($query);
    
    if (!$result) {
        http_response_code(500);
        json_response(['error' => $conn->error]);
    }
    
    $appointments = [];
    while ($row = $result->fetch_assoc()) {
        $appointments[] = $row;
    }
    
    json_response(['appointments' => $appointments]);
}

// POST /appointments
if ($endpoint === 'appointments' && $method === 'POST') {
    $user_id = $body['user_id'] ?? null;
    $name = $body['name'] ?? '';
    $phone = $body['phone'] ?? '';
    $email = $body['email'] ?? '';
    $date = $body['date'] ?? '';
    $time_slot = $body['time_slot'] ?? '';
    $service = $body['service'] ?? 'General consultation';
    $status = $body['status'] ?? 'New';
    
    if (!$name || !$email || !$phone || !$date || !$time_slot) {
        http_response_code(422);
        json_response(['error' => 'Missing required fields']);
    }
    
    $query = "INSERT INTO appointments (user_id, name, phone, email, date, time_slot, service, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('isssssss', $user_id, $name, $phone, $email, $date, $time_slot, $service, $status);
    
    if (!$stmt->execute()) {
        http_response_code(500);
        json_response(['error' => $conn->error]);
    }
    
    $appt_id = $conn->insert_id;
    
    http_response_code(201);
    json_response([
        'id' => $appt_id,
        'message' => '✅ Appointment booked!',
        'appointment' => compact('name', 'email', 'phone', 'date', 'time_slot', 'service', 'status')
    ]);
}

// GET /appointments/:id
if (preg_match('#^appointments/(\d+)$#', $endpoint, $matches) && $method === 'GET') {
    $id = $matches[1];
    $query = "SELECT * FROM appointments WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(404);
        json_response(['error' => 'Appointment not found']);
    }
    
    json_response(['appointment' => $result->fetch_assoc()]);
}

// PUT /appointments/:id
if (preg_match('#^appointments/(\d+)$#', $endpoint, $matches) && $method === 'PUT') {
    $id = $matches[1];
    $update_fields = [];
    $params = [];
    $types = '';
    
    foreach (['name', 'email', 'phone', 'date', 'time_slot', 'service', 'status'] as $field) {
        if (isset($body[$field])) {
            $update_fields[] = "$field = ?";
            $params[] = $body[$field];
            $types .= 's';
        }
    }
    
    if (count($update_fields) > 0) {
        $params[] = $id;
        $types .= 'i';
        $query = "UPDATE appointments SET " . implode(', ', $update_fields) . " WHERE id = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
    }
    
    json_response(['ok' => true, 'message' => '✅ Appointment updated!', 'id' => $id]);
}

// DELETE /appointments/:id
if (preg_match('#^appointments/(\d+)$#', $endpoint, $matches) && $method === 'DELETE') {
    $id = $matches[1];
    $stmt = $conn->prepare("DELETE FROM appointments WHERE id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    json_response(['ok' => true, 'message' => '✅ Appointment deleted!']);
}

// GET /system-status
if ($endpoint === 'system-status' && $method === 'GET') {
    $query = "SELECT is_online, maintenance_mode, comment FROM system_status WHERE id = 1";
    $result = $conn->query($query);
    
    if ($result && $result->num_rows > 0) {
        $status = $result->fetch_assoc();
        json_response([
            'isOnline' => (bool)$status['is_online'],
            'maintenanceMode' => (bool)$status['maintenance_mode'],
            'comment' => $status['comment'] ?? ''
        ]);
    } else {
        json_response([
            'isOnline' => true,
            'maintenanceMode' => false,
            'comment' => ''
        ]);
    }
}

// PUT /system-status
if ($endpoint === 'system-status' && $method === 'PUT') {
    $isOnline = $body['isOnline'] ?? true;
    $maintenanceMode = $body['maintenanceMode'] ?? false;
    $comment = $body['comment'] ?? '';
    
    $query = "UPDATE system_status SET is_online = ?, maintenance_mode = ?, comment = ? WHERE id = 1";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('iis', $isOnline, $maintenanceMode, $comment);
    $stmt->execute();
    
    json_response([
        'ok' => true,
        'message' => '✅ System status updated',
        'isOnline' => (bool)$isOnline,
        'maintenanceMode' => (bool)$maintenanceMode,
        'comment' => $comment
    ]);
}

// 404
http_response_code(404);
json_response(['error' => 'Unknown endpoint: ' . $endpoint]);
