<?php

session_start();

$valid_username = 'admin';
$valid_password_hash = '$2y$10$Ab.4lCRocYKeI0CLiTUwq.3D9phYrIKjEO2y2OvKsRqVbJRSV4Xdu';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    if ($username === $valid_username && password_verify($password, $valid_password_hash)) {
        $_SESSION['loggedin'] = true;
        header('Location: index.php');
        exit();
    } else {
        header('Location: login.html?error=1');
        exit();
    }
}
