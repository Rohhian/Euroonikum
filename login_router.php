<?php

set_time_limit(0);
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $value = $_GET['value'] ?? null;

    if (!$value) {
        echo "event: error\n";
        echo "data: Error: Missing value parameter.\n\n";
        ob_flush();
        flush();
        exit();
    } elseif ($value === 'normalScrape') {
        require_once 'scraperNormal.php';
    }
} else {
    echo json_encode('Error: Invalid request method.');
    die();
}
