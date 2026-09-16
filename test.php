<?php
echo json_encode([
    'status' => 'PHP_WORKING',
    'message' => 'PHP is enabled on this server!',
    'php_version' => phpversion(),
    'timestamp' => date('Y-m-d H:i:s'),
]);
