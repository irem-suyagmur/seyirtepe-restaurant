<?php
session_start();
require_once __DIR__ . '/includes/db.php'; // Veritabanı bağlantısı

// Giriş kontrolü
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $kullanici_adi = $_POST['kullanici_adi'] ?? '';
    $sifre = $_POST['sifre'] ?? '';

    $stmt = $db->prepare('SELECT * FROM adminler WHERE kullanici_adi = ?');
    $stmt->execute([$kullanici_adi]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($admin && password_verify($sifre, $admin['sifre'])) {
        $_SESSION['admin_id'] = $admin['id'];
        $_SESSION['admin_kullanici_adi'] = $admin['kullanici_adi'];
        header('Location: panel.php'); // Giriş sonrası yönlendirme
        exit;
    } else {
        $hata = 'Kullanıcı adı veya şifre hatalı!';
    }
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>Admin Giriş</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="login-container">
        <h2>Admin Giriş</h2>
        <?php if (!empty($hata)): ?>
            <div class="error"><?= htmlspecialchars($hata) ?></div>
        <?php endif; ?>
        <form method="post">
            <input type="text" name="kullanici_adi" placeholder="Kullanıcı Adı" required>
            <input type="password" name="sifre" placeholder="Şifre" required>
            <button type="submit">Giriş Yap</button>
        </form>
    </div>
</body>
</html>
