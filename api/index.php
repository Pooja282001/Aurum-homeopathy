<?php
declare(strict_types=1);

session_start();

$configPath = __DIR__ . '/config.php';
if (!is_file($configPath)) {
    respond(['error' => 'API is not configured. Copy config.example.php to config.php.'], 500);
}
$config = require $configPath;

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: ' . $config['allowed_origin']);
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    $dsn = sprintf('mysql:host=%s;dbname=%s;charset=%s', $config['db_host'], $config['db_name'], $config['db_charset']);
    $pdo = new PDO($dsn, $config['db_user'], $config['db_password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (Throwable $error) {
    respond(['error' => 'Database connection failed.'], 500);
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];
$body = json_decode(file_get_contents('php://input'), true) ?: [];

if ($action === 'health' && $method === 'GET') {
    $pdo->query('SELECT 1');
    respond(['ok' => true, 'database' => 'connected']);
}

if ($action === 'register' && $method === 'POST') {
    $name = trim((string)($body['name'] ?? ''));
    $email = strtolower(trim((string)($body['email'] ?? '')));
    $password = (string)($body['password'] ?? '');
    if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 8) {
        respond(['error' => 'Name, valid email, and an 8-character password are required.'], 422);
    }
    try {
        $statement = $pdo->prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)');
        $statement->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT), 'patient']);
    } catch (PDOException $error) {
        respond(['error' => 'That email is already registered.'], 409);
    }
    respond(['user' => ['id' => (int)$pdo->lastInsertId(), 'name' => $name, 'email' => $email, 'role' => 'patient']], 201);
}

if ($action === 'login' && $method === 'POST') {
    $statement = $pdo->prepare('SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1');
    $statement->execute([strtolower(trim((string)($body['email'] ?? '')))]);
    $user = $statement->fetch();
    if (!$user || !password_verify((string)($body['password'] ?? ''), $user['password_hash'])) {
        respond(['error' => 'Invalid email or password.'], 401);
    }
    unset($user['password_hash']);
    $_SESSION['user'] = $user;
    respond(['user' => $user]);
}

if ($action === 'logout' && $method === 'POST') {
    session_destroy();
    respond(['ok' => true]);
}

if ($action === 'me' && $method === 'GET') {
    respond(['user' => $_SESSION['user'] ?? null]);
}

if ($action === 'appointments' && $method === 'GET') {
    $user = $_SESSION['user'] ?? null;
    if (!$user) respond(['error' => 'Authentication required.'], 401);
    $query = $user['role'] === 'patient'
        ? 'SELECT * FROM appointments WHERE user_id = ? ORDER BY created_at DESC'
        : 'SELECT * FROM appointments ORDER BY created_at DESC';
    $statement = $pdo->prepare($query);
    $statement->execute($user['role'] === 'patient' ? [$user['id']] : []);
    respond(['appointments' => $statement->fetchAll()]);
}

if ($action === 'appointments' && $method === 'POST') {
    $user = $_SESSION['user'] ?? null;
    $statement = $pdo->prepare('INSERT INTO appointments (user_id, name, phone, email, date, time_slot, service, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    $statement->execute([
        $user['id'] ?? null, trim((string)($body['name'] ?? ($user['name'] ?? ''))), trim((string)($body['phone'] ?? '')),
        trim((string)($body['email'] ?? ($user['email'] ?? ''))), $body['date'] ?? null, $body['timeSlot'] ?? null,
        trim((string)($body['service'] ?? 'General consultation')), 'New',
    ]);
    respond(['id' => (int)$pdo->lastInsertId()], 201);
}

if (preg_match('#^appointments/(\d+)$#', $action, $matches) && in_array($method, ['PATCH', 'DELETE'], true)) {
    $user = $_SESSION['user'] ?? null;
    if (!$user) respond(['error' => 'Authentication required.'], 401);
    if ($user['role'] === 'patient') respond(['error' => 'Staff permission required.'], 403);
    $id = (int)$matches[1];
    if ($method === 'DELETE') {
        $pdo->prepare('DELETE FROM appointments WHERE id = ?')->execute([$id]);
    } else {
        $pdo->prepare('UPDATE appointments SET status = COALESCE(?, status), name = COALESCE(?, name), phone = COALESCE(?, phone), date = COALESCE(?, date), time_slot = COALESCE(?, time_slot) WHERE id = ?')->execute([
            $body['status'] ?? null, $body['name'] ?? null, $body['phone'] ?? null, $body['date'] ?? null, $body['timeSlot'] ?? null, $id,
        ]);
    }
    respond(['ok' => true]);
}

if ($action === 'media' && $method === 'GET') {
    $user = $_SESSION['user'] ?? null;
    if (!$user) respond(['error' => 'Authentication required.'], 401);
    $statement = $pdo->query('SELECT id, title, type, url, created_at FROM media ORDER BY created_at DESC');
    respond(['media' => $statement->fetchAll()]);
}

if ($action === 'media' && $method === 'POST') {
    $user = $_SESSION['user'] ?? null;
    if (!$user || $user['role'] !== 'admin') respond(['error' => 'Admin permission required.'], 403);
    $type = ($body['type'] ?? '') === 'video' ? 'video' : 'image';
    $statement = $pdo->prepare('INSERT INTO media (title, type, url) VALUES (?, ?, ?)');
    $statement->execute([trim((string)($body['title'] ?? '')), $type, trim((string)($body['url'] ?? ''))]);
    respond(['id' => (int)$pdo->lastInsertId()], 201);
}

respond(['error' => 'Unknown API action.'], 404);

function respond(array $payload, int $status = 200): never {
    http_response_code($status);
    echo json_encode($payload);
    exit;
}
