<?php

set_time_limit(0);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $value = $input['value'] ?? null;

    if (!$value) {
        exit();
    } elseif ($value === 'normalScrape') {
        require_once 'scraperNormal.php';
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
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
