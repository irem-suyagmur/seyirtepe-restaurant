<?php
require_once 'includes/db.php';
require_once 'includes/auth.php';

$urun_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($urun_id <= 0) {
    header("Location: menuler.php");
    exit;
}

// Form gönderildi mi?
if (isset($_POST['urun_guncelle'])) {
    $kategori_id = intval($_POST['kategori_id']);
    $isim = trim($_POST['urun_adi']);
    $fiyat = floatval($_POST['fiyat']);
    $aciklama = trim($_POST['aciklama']);
    $mevcut_resim = $_POST['mevcut_resim'];
    $resim_adi = $mevcut_resim;

    if (!empty($isim) && $kategori_id > 0) {
        // Yeni resim yüklendi mi?
        if (isset($_FILES['resim']) && $_FILES['resim']['error'] === UPLOAD_ERR_OK) {
            $upload_dir = '../images/';
            if (!empty($mevcut_resim) && file_exists($upload_dir . $mevcut_resim)) {
                unlink($upload_dir . $mevcut_resim);
            }
            $ext = pathinfo($_FILES['resim']['name'], PATHINFO_EXTENSION);
            $resim_adi = uniqid('urun_') . '.' . strtolower($ext);
            move_uploaded_file($_FILES['resim']['tmp_name'], $upload_dir . $resim_adi);
        }
        $stmt = $db->prepare("UPDATE urunler SET isim = ?, fiyat = ?, kategori_id = ?, aciklama = ?, resim = ? WHERE id = ?");
        $stmt->execute([$isim, $fiyat, $kategori_id, $aciklama, $resim_adi, $urun_id]);
    }
    header("Location: menuler.php");
    exit;
}

// Ürün bilgilerini ve kategorileri çek (PDO)
$stmt = $db->prepare("SELECT * FROM urunler WHERE id = ?");
$stmt->execute([$urun_id]);
$urun = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$urun) {
    header("Location: menuler.php");
    exit;
}
$kategoriler = $db->query("SELECT * FROM kategoriler ORDER BY sira ASC, isim ASC");

require_once __DIR__ . '/includes/header.php';
?>

<div class="max-w-4xl mx-auto">
    <div class="bg-white p-6 md:p-8 rounded-xl shadow-md">
        <form action="menu_duzenle.php?id=<?= $urun_id ?>" method="POST" enctype="multipart/form-data">
            <input type="hidden" name="mevcut_resim" value="<?= htmlspecialchars($urun['resim']) ?>">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div class="md:col-span-2">
                    <label for="urun_adi" class="block text-sm font-medium text-gray-700 mb-1">Ürün Adı</label>
                    <input type="text" name="urun_adi" id="urun_adi" value="<?= htmlspecialchars($urun['isim']) ?>" required class="w-full input-style">
                </div>
                
                <div>
                    <label for="kategori_id" class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                    <select name="kategori_id" id="kategori_id" required class="w-full input-style">
                        <?php while($kat = $kategoriler->fetch(PDO::FETCH_ASSOC)): ?>
                            <option value="<?= $kat['id'] ?>" <?= $urun['kategori_id'] == $kat['id'] ? 'selected' : '' ?>>
                                <?= htmlspecialchars($kat['isim']) ?>
                            </option>
                        <?php endwhile; ?>
                    </select>
                </div>

                <div>
                    <label for="fiyat" class="block text-sm font-medium text-gray-700 mb-1">Fiyat (₺)</label>
                    <input type="number" name="fiyat" id="fiyat" value="<?= $urun['fiyat'] ?>" step="0.01" required class="w-full input-style">
                </div>

                <div class="md:col-span-2">
                    <label for="aciklama" class="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                    <textarea name="aciklama" id="aciklama" rows="4" class="w-full input-style"><?= htmlspecialchars($urun['aciklama']) ?></textarea>
                </div>

                <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700">Ürün Resmi</label>
                    <div class="mt-2 flex items-center gap-x-6">
                        <img class="h-24 w-24 object-cover rounded-lg" src="../images/<?= htmlspecialchars($urun['resim'] ?: 'placeholder.png') ?>" alt="Mevcut Resim" onerror="this.onerror=null;this.src='https://placehold.co/400x400/e2e8f0/adb5bd?text=Resim+Yok';">
                        <input type="file" name="resim" id="resim" class="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
                    </div>
                    <p class="text-xs text-gray-500 mt-2">Değiştirmek istemiyorsanız yeni resim yüklemeyin.</p>
                </div>
            </div>

            <div class="mt-8 pt-5 border-t border-gray-200 flex justify-end items-center gap-4">
                <a href="menuler.php" class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition">
                    İptal
                </a>
                <button type="submit" name="urun_guncelle" class="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                    Değişiklikleri Kaydet
                </button>
            </div>
        </form>
    </div>
</div>

<style>
    .input-style {
        padding: 0.625rem 1rem;
        color: #374151;
        background-color: #f9fafb;
        border: 1px solid #d1d5db;
        border-radius: 0.5rem;
        transition: all 0.2s ease-in-out;
    }
    .input-style:focus {
        outline: 2px solid transparent;
        outline-offset: 2px;
        box-shadow: 0 0 0 2px #3b82f6;
        border-color: #3b82f6;
    }
</style>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
