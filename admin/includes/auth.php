<?php
// Session'ı her zaman başlat
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Kullanıcının giriş yapıp yapmadığını kontrol eden fonksiyon
function is_logged_in() {
    return isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
}

// Giriş yapmamış kullanıcıyı login sayfasına yönlendiren fonksiyon
function require_login() {
    if (!is_logged_in()) {
        header('Location: login.php');
        exit();
    }
}
?>
