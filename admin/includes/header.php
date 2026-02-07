<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/db.php';

// Her sayfada giriş kontrolü yap
require_login();

// Mevcut sayfanın adını al (aktif menü öğesini belirlemek için)
$current_page = basename($_SERVER['PHP_SELF']);
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seyir Tepe Admin Paneli</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        body {
            font-family: 'Poppins', sans-serif;
        }
        /* Aktif menü linki için özel stil */
        .sidebar-link.active {
            background-color: #3b82f6; /* blue-500 */
            color: white;
        }
    </style>
</head>
<body class="bg-gray-100">

<div class="flex h-screen">
    <!-- Sidebar -->
    <aside class="w-64 flex-shrink-0 bg-gray-800 text-white flex flex-col">
        <div class="h-20 flex items-center justify-center bg-gray-900">
            <h1 class="text-2xl font-bold">Seyir Tepe</h1>
        </div>
        <nav class="flex-1 px-4 py-6 space-y-2">
            <a href="index.php" class="sidebar-link flex items-center px-4 py-2.5 rounded-lg transition duration-200 hover:bg-gray-700 <?= $current_page == 'index.php' ? 'active' : '' ?>">
                <i class="fas fa-tachometer-alt w-6"></i>
                <span>Kontrol Paneli</span>
            </a>
            <a href="masalar.php" class="sidebar-link flex items-center px-4 py-2.5 rounded-lg transition duration-200 hover:bg-gray-700 <?= $current_page == 'masalar.php' ? 'active' : '' ?>">
                <i class="fas fa-chair w-6"></i>
                <span>Masalar</span>
            </a>
            <a href="kategoriler.php" class="sidebar-link flex items-center px-4 py-2.5 rounded-lg transition duration-200 hover:bg-gray-700 <?= $current_page == 'kategoriler.php' ? 'active' : '' ?>">
                <i class="fas fa-tags w-6"></i>
                <span>Kategoriler</span>
            </a>
            <a href="menuler.php" class="sidebar-link flex items-center px-4 py-2.5 rounded-lg transition duration-200 hover:bg-gray-700 <?= $current_page == 'menuler.php' ? 'active' : '' ?>">
                <i class="fas fa-book-open w-6"></i>
                <span>Menü Yönetimi</span>
            </a>
            <a href="rezervasyonlar.php" class="sidebar-link flex items-center px-4 py-2.5 rounded-lg transition duration-200 hover:bg-gray-700 <?= $current_page == 'rezervasyonlar.php' ? 'active' : '' ?>">
                <i class="fas fa-calendar-check w-6"></i>
                <span>Rezervasyonlar</span>
            </a>
        </nav>
        <div class="px-4 py-4 border-t border-gray-700">
             <a href="logout.php" class="sidebar-link flex items-center px-4 py-2.5 rounded-lg transition duration-200 hover:bg-red-500">
                <i class="fas fa-sign-out-alt w-6"></i>
                <span>Çıkış Yap</span>
            </a>
        </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
        <header class="bg-white shadow-md p-4">
            <!-- Buraya sayfa başlığı veya kullanıcı bilgisi gibi dinamik içerikler gelebilir -->
            <h2 class="text-2xl font-semibold text-gray-700">
                <?php
                    // Sayfa başlığını dosya adına göre belirle
                    switch ($current_page) {
                        case 'index.php': echo 'Kontrol Paneli'; break;
                        case 'masalar.php': echo 'Masa Yönetimi'; break;
                        case 'kategoriler.php': echo 'Kategori Yönetimi'; break;
                        case 'kategori_duzenle.php': echo 'Kategori Düzenle'; break;
                        case 'menuler.php': echo 'Menü Yönetimi'; break;
                        case 'menu_duzenle.php': echo 'Ürün Düzenle'; break;
                        default: echo 'Admin Paneli';
                    }
                ?>
            </h2>
        </header>
        <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
            <div class="container mx-auto">
