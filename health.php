<?php
/**
 * Direct Health Check - No Config Required
 * Access: https://aurumhomeopathy.com/health.php
 */

header('Content-Type: application/json');

$response = [
    'status' => 'unknown',
    'timestamp' => date('Y-m-d H:i:s'),
    'server' => $_SERVER['SERVER_NAME'] ?? 'unknown',
    'php_version' => phpversion(),
    'files' => [],
    'database' => [],
];

// Check if files exist
$files = [
    'api/index.php' => __DIR__ . '/api/index.php',
    'api/config.php' => __DIR__ . '/api/config.php',
    'api/.htaccess' => __DIR__ . '/api/.htaccess',
    'dist/index.html' => __DIR__ . '/dist/index.html',
];

foreach ($files as $name => $path) {
    $response['files'][$name] = [
        'exists' => file_exists($path),
        'readable' => is_readable($path),
        'size' => file_exists($path) ? filesize($path) : 0,
    ];
}

// Try database connection with hardcoded credentials
try {
    $dsn = 'mysql:host=srv1752.hstgr.io;dbname=u154384799_Ahc;charset=utf8mb4';
    $pdo = new PDO($dsn, 'u154384799_Aurum', 'Aurum2025', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 5,
    ]);
    
    $pdo->query('SELECT 1');
    $response['database']['status'] = 'connected';
    $response['database']['host'] = 'srv1752.hstgr.io';
    $response['database']['name'] = 'u154384799_Ahc';
    
    // Check if required tables exist
    $stmt = $pdo->query('SHOW TABLES');
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $response['database']['tables'] = $tables;
    
    $response['status'] = 'all_green';
} catch (Exception $e) {
    $response['status'] = 'database_error';
    $response['database']['error'] = $e->getMessage();
}

// Check if API index.php can be included
if (file_exists(__DIR__ . '/api/index.php')) {
    $response['api_status'] = 'file_present';
} else {
    $response['api_status'] = 'file_missing';
}

// Final verdict
if ($response['status'] === 'all_green') {
    http_response_code(200);
    $response['message'] = '✅ All systems operational! API is ready.';
} else {
    http_response_code(500);
    $response['message'] = '⚠️  Some issues detected. See details above.';
}

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
