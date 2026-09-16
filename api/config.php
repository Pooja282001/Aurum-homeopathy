<?php
// Database configuration - reads from environment variables (Hostinger)
// Local development uses hardcoded values below
return [
    'db_host' => $_ENV['DB_HOST'] ?? getenv('DB_HOST') ?? 'srv1752.hstgr.io',
    'db_name' => $_ENV['DB_NAME'] ?? getenv('DB_NAME') ?? 'u154384799_Ahc',
    'db_user' => $_ENV['DB_USER'] ?? getenv('DB_USER') ?? 'u154384799_Aurum',
    'db_password' => $_ENV['DB_PASSWORD'] ?? getenv('DB_PASSWORD') ?? 'Aurum2025',
    'db_charset' => $_ENV['DB_CHARSET'] ?? getenv('DB_CHARSET') ?? 'utf8mb4',
    'allowed_origin' => $_ENV['ALLOWED_ORIGIN'] ?? getenv('ALLOWED_ORIGIN') ?? 'https://aurumhomeopathy.com',
];
