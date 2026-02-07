<?php
// Session'ı başlat
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Eğer kullanıcı zaten giriş yapmışsa, doğrudan ana sayfaya yönlendir
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    header('Location: index.php');
    exit();
}

$error = '';
// Form gönderildi mi diye kontrol et
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    // Kullanıcı adı ve şifreyi doğrula (Gerçek bir projede şifreler hash'lenmelidir)
    if ($username === 'admin' && $password === '123456') {
        // Giriş başarılı, session'a kaydet
        $_SESSION['admin_logged_in'] = true;
        header('Location: index.php'); // Ana sayfaya yönlendir
        exit();
    } else {
        $error = 'Kullanıcı adı veya şifre hatalı!';
    }
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Paneli Girişi</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Poppins', sans-serif;
        }
    </style>
</head>
<body class="bg-gray-100 flex items-center justify-center min-h-screen">
    <div class="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div class="text-center">
            <h1 class="text-3xl font-bold text-gray-800">Seyir Tepe</h1>
            <p class="text-gray-500">Admin Paneli Girişi</p>
        </div>
        
        <?php if ($error): ?>
            <div class="p-3 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                <?= htmlspecialchars($error) ?>
            </div>
        <?php endif; ?>

        <form class="space-y-6" method="POST" action="login.php">
            <div>
                <label for="username" class="text-sm font-medium text-gray-700">Kullanıcı Adı</label>
                <input id="username" name="username" type="text" required autofocus
                       class="w-full px-4 py-2 mt-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
            </div>
            <div>
                <label for="password" class="text-sm font-medium text-gray-700">Şifre</label>
                <input id="password" name="password" type="password" required
                       class="w-full px-4 py-2 mt-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
            </div>
            <div>
                <button type="submit"
                        class="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300">
                    Giriş Yap
                </button>
            </div>
        </form>
    </div>
</body>
</html>
