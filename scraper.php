<?php

set_time_limit(300);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $value = $input['value'] ?? null;

    if ($value !== 'true') {
        echo json_encode('Invalid value sent with buttonclick.');
        exit();
    } elseif ($value === 'true') {
        require_once 'scraperSlowNextPage.php';
    }
} else {
    echo json_encode('Error: Invalid request method.');
    die();
}
