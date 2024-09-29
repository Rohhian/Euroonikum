<?php

set_time_limit(0);

header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');

validateRequestMethod();
$value = getValueParameter();
handleRequest($value);

function validateRequestMethod() {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        handleError('Error: Invalid request method.');
    }
}

function getValueParameter() {
    return $_GET['value'] ?? null;
}

function handleRequest($value) {
    if (!$value) {
        handleError('Error: Missing value parameter.');
    } elseif ($value === 'normalScrape') {
        require_once 'scraperNormal.php';
    } else {
        handleError('Error: Invalid value parameter.');
    }
}

function handleError($message) {
    echo json_encode(['error' => $message]);
    exit();
}
