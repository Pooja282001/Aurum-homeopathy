<?php
// Simple diagnostic to verify PHP is working
header('Content-Type: application/json');

$status = [
    'php_working' => true,
    'version' => phpversion(),
    'timestamp' => date('Y-m-d H:i:s'),
    'server' => $_SERVER['SERVER_NAME'] ?? 'unknown',
];

// Try to load config
$configPath = __DIR__ . '/config.php';
if (is_file($configPath)) {
    $config = require $configPath;
    $status['config_loaded'] = true;
    $status['db_host'] = $config['db_host'] ?? null;
} else {
    $status['config_loaded'] = false;
    $status['error'] = 'config.php not found';
}

echo json_encode($status, JSON_PRETTY_PRINT);
