<?php
/**
 * Hostinger Auto-Setup Script
 * This file auto-configures the API when deployed to Hostinger
 * It creates necessary directories and generates config files
 * 
 * Access: https://aurumhomeopathy.com/setup.php
 * Then delete this file after setup is complete
 */

header('Content-Type: application/json');

$status = [
    'success' => false,
    'message' => '',
    'steps' => []
];

try {
    // Step 1: Create api directory if it doesn't exist
    $apiDir = __DIR__ . '/api';
    if (!is_dir($apiDir)) {
        if (!mkdir($apiDir, 0755, true)) {
            throw new Exception('Failed to create api directory');
        }
        $status['steps'][] = '✅ Created /api directory';
    } else {
        $status['steps'][] = 'ℹ️  /api directory already exists';
    }

    // Step 2: Generate config.php if it doesn't exist
    $configPath = $apiDir . '/config.php';
    if (!is_file($configPath)) {
        $configContent = <<<'PHP'
<?php
// Hostinger Database Configuration
// Reads from environment variables or uses defaults
return [
    'db_host' => $_ENV['DB_HOST'] ?? getenv('DB_HOST') ?? 'srv1752.hstgr.io',
    'db_name' => $_ENV['DB_NAME'] ?? getenv('DB_NAME') ?? 'u154384799_Ahc',
    'db_user' => $_ENV['DB_USER'] ?? getenv('DB_USER') ?? 'u154384799_Aurum',
    'db_password' => $_ENV['DB_PASSWORD'] ?? getenv('DB_PASSWORD') ?? 'Aurum2025',
    'db_charset' => $_ENV['DB_CHARSET'] ?? getenv('DB_CHARSET') ?? 'utf8mb4',
    'allowed_origin' => $_ENV['ALLOWED_ORIGIN'] ?? getenv('ALLOWED_ORIGIN') ?? 'https://aurumhomeopathy.com',
];
PHP;
        
        if (file_put_contents($configPath, $configContent)) {
            $status['steps'][] = '✅ Created /api/config.php';
        } else {
            throw new Exception('Failed to create config.php');
        }
    } else {
        $status['steps'][] = 'ℹ️  /api/config.php already exists';
    }

    // Step 3: Check if index.php exists
    $indexPath = $apiDir . '/index.php';
    if (is_file($indexPath)) {
        $status['steps'][] = '✅ /api/index.php exists (deployed via git)';
    } else {
        $status['steps'][] = '⚠️  /api/index.php not found - ensure it\'s deployed via git auto-deployment';
    }

    // Step 4: Test database connection
    try {
        $config = require $configPath;
        $dsn = sprintf('mysql:host=%s;dbname=%s;charset=%s', 
            $config['db_host'], 
            $config['db_name'], 
            $config['db_charset']
        );
        
        $pdo = new PDO($dsn, $config['db_user'], $config['db_password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ]);
        
        $pdo->query('SELECT 1');
        $status['steps'][] = '✅ Database connection successful';
        $status['database'] = [
            'host' => $config['db_host'],
            'name' => $config['db_name'],
            'user' => $config['db_user'],
        ];
    } catch (Exception $e) {
        $status['steps'][] = '❌ Database connection failed: ' . $e->getMessage();
    }

    // Step 5: Create dist directory structure
    $distDir = __DIR__ . '/dist';
    if (!is_dir($distDir)) {
        if (!mkdir($distDir, 0755, true)) {
            throw new Exception('Failed to create dist directory');
        }
        $status['steps'][] = '✅ Created /dist directory';
    } else {
        $status['steps'][] = 'ℹ️  /dist directory already exists';
    }

    $status['success'] = true;
    $status['message'] = 'Setup completed successfully!';
    $status['next_steps'] = [
        'Test API health: https://aurumhomeopathy.com/api/index.php?action=health',
        'Test diagnostics: https://aurumhomeopathy.com/api/diagnose.php',
        'Access frontend: https://aurumhomeopathy.com/',
        'Delete this file: setup.php (optional but recommended)',
    ];

} catch (Exception $e) {
    $status['success'] = false;
    $status['message'] = 'Setup failed: ' . $e->getMessage();
}

echo json_encode($status, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
