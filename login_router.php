<?php

set_time_limit(300);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $value = $input['value'] ?? null;

    if (!$value) {
        exit();
    } elseif ($value === 'normalScrape') {
        require_once 'scraperNormal.php';
    } elseif ($value === 'slowScrape') {
        require_once 'scraperSlowNextPage.php';
    }
} else {
    echo json_encode('Error: Invalid request method.');
    die();
}
