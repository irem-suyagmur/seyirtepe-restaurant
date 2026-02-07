<?php
require_once 'includes/db.php';
require_once 'includes/auth.php';

$kategori_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($kategori_id <= 0) {
    header("Location: kategoriler.php");
    exit;
}

// Kategori bilgilerini çek (PDO)
$stmt = $db->prepare("SELECT * FROM kategoriler WHERE id = ?");
$stmt->execute([$kategori_id]);
$kategori = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$kategori) {
    header("Location: kategoriler.php");
    exit;
}

// Form gönderildi mi?
if (isset($_POST['kategori_guncelle'])) {
    $isim = trim($_POST['isim']);
    $sira = isset($_POST['sira']) ? intval($_POST['sira']) : 0;
    if (!empty($isim)) {
        $update_stmt = $db->prepare("UPDATE kategoriler SET isim = ?, sira = ? WHERE id = ?");
        $update_stmt->execute([$isim, $sira, $kategori_id]);
        header("Location: kategoriler.php");
        exit;
    }
}

require_once __DIR__ . '/includes/header.php';
?>

<div class="max-w-2xl mx-auto">
    <div class="bg-white p-6 md:p-8 rounded-xl shadow-md">
        <form action="kategori_duzenle.php?id=<?= $kategori_id ?>" method="POST">
            <div class="space-y-6">
                <div>
                    <label for="isim" class="block text-sm font-medium text-gray-700 mb-1">Kategori Adı</label>
                    <input type="text" name="isim" id="isim" value="<?= htmlspecialchars($kategori['isim']) ?>" required
                           class="w-full px-4 py-2.5 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                </div>
                <div>
                    <label for="sira" class="block text-sm font-medium text-gray-700 mb-1">Sıra</label>
                    <input type="number" name="sira" id="sira" value="<?= (int)$kategori['sira'] ?>" min="0"
                           class="w-full px-4 py-2.5 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                </div>
            </div>

            <div class="mt-8 pt-5 border-t border-gray-200 flex justify-end items-center gap-4">
                <a href="kategoriler.php"
                   class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition">
                    İptal
                </a>
                <button type="submit" name="kategori_guncelle"
                        class="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                    Değişiklikleri Kaydet
                </button>
            </div>
        </form>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
