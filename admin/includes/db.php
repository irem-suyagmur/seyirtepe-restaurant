<?php
$host = 'localhost';
$user = 'root';
$pass = '';
$dbname = 'seyirtepedb';
$port = 3307; // <-- Bunu ekle

try {
    $db = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die('Veritabanı bağlantı hatası: ' . $e->getMessage());
}
?>