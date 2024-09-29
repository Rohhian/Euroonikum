<?php

set_time_limit(0);

header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');

function handleError($message) {
    echo "event: error\n";
    echo "data: $message\n\n";
    ob_flush();
    flush();
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $value = $_GET['value'] ?? null;

    if (!$value) {
        handleError('Error: Missing value parameter.');
    } elseif ($value === 'normalScrape') {
        require_once 'scraperNormal.php';
    } else {
        handleError('Error: Invalid value parameter.');
    }
} else {
    echo json_encode('Error: Invalid request method.');
    die();
}
