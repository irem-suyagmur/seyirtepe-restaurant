<?php
include 'includes/db.php';
include 'includes/auth.php';

$urun_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($urun_id <= 0) {
    header("Location: menuler.php");
    exit;
}

// Form gönderildi mi?
if (isset($_POST['urun_guncelle'])) {
    $kategori_id = intval($_POST['kategori_id']);
    $isim = $_POST['urun_adi'];
    $fiyat = floatval($_POST['fiyat']);
    $aciklama = $_POST['aciklama'];
    $mevcut_resim = $_POST['mevcut_resim'];
    $resim_adi = $mevcut_resim;

    // Yeni resim yüklendi mi?
    if (isset($_FILES['resim']) && $_FILES['resim']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = '../images/';
        // Eski resmi sil
        if (!empty($mevcut_resim) && file_exists($upload_dir . $mevcut_resim)) {
            unlink($upload_dir . $mevcut_resim);
        }
        // Yeni resmi yükle
        $ext = pathinfo($_FILES['resim']['name'], PATHINFO_EXTENSION);
        $resim_adi = uniqid('urun_') . '.' . $ext;
        $hedef_dosya = $upload_dir . $resim_adi;
        move_uploaded_file($_FILES['resim']['tmp_name'], $hedef_dosya);
    }

    $stmt = $conn->prepare("UPDATE urunler SET isim = ?, fiyat = ?, kategori_id = ?, aciklama = ?, resim = ? WHERE id = ?");
    $stmt->bind_param("sdisss", $isim, $fiyat, $kategori_id, $aciklama, $resim_adi, $urun_id);
    $stmt->execute();
    header("Location: menuler.php");
    exit;
}

// Ürün bilgilerini çek
$stmt = $conn->prepare("SELECT * FROM urunler WHERE id = ?");
$stmt->bind_param("i", $urun_id);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    header("Location: menuler.php");
    exit;
}
$urun = $result->fetch_assoc();
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ürünü Düzenle</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        body { background: #f6f8fa; font-family: 'Poppins', sans-serif; margin: 0; padding: 0; }
        .container { max-width: 800px; margin: 40px auto; background: #fff; border-radius: 18px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); padding: 32px 40px 40px 40px; }
        h1 { text-align: center; color: #22223b; margin-bottom: 32px; font-weight: 700; letter-spacing: 1px; }
        .edit-form { display: flex; flex-direction: column; gap: 16px; }
        .edit-form label { font-weight: 600; color: #333; margin-bottom: 4px; display: block; }
        .edit-form input, .edit-form select, .edit-form textarea { width: 100%; padding: 10px 16px; border: 1px solid #c9c9c9; border-radius: 8px; font-size: 1rem; outline: none; transition: border 0.2s; box-sizing: border-box; }
        .edit-form input:focus, .edit-form textarea:focus, .edit-form select:focus { border: 1.5px solid #4f8cff; }
        .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
        .btn { padding: 10px 24px; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; transition: all 0.2s ease; }
        .btn-primary { background: linear-gradient(90deg, #4f8cff 0%, #38b6ff 100%); color: #fff; }
        .btn-primary:hover { background: linear-gradient(90deg, #38b6ff 0%, #4f8cff 100%); }
        .btn-secondary { background: #6c757d; color: #fff; }
        .btn-secondary:hover { background: #5a6268; }
        .current-img-container { margin-top: 8px; }
        .current-img { max-width: 150px; border-radius: 8px; border: 1px solid #ddd; padding: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>"<?= htmlspecialchars($urun['isim']) ?>" Düzenle</h1>
        <form class="edit-form" method="post" enctype="multipart/form-data">
            <input type="hidden" name="mevcut_resim" value="<?= htmlspecialchars($urun['resim']) ?>">
            <div>
                <label for="urun_adi">Ürün Adı</label>
                <input type="text" id="urun_adi" name="urun_adi" value="<?= htmlspecialchars($urun['isim']) ?>" required>
            </div>
            <div>
                <label for="kategori_id">Kategori</label>
                <select id="kategori_id" name="kategori_id" required>
                    <?php
                    $kategoriler = $conn->query("SELECT * FROM kategoriler ORDER BY isim ASC");
                    while($kat = $kategoriler->fetch_assoc()): ?>
                        <option value="<?= $kat['id'] ?>" <?= $urun['kategori_id'] == $kat['id'] ? 'selected' : '' ?>>
                            <?= htmlspecialchars($kat['isim']) ?>
                        </option>
                    <?php endwhile; ?>
                </select>
            </div>
            <div>
                <label for="fiyat">Fiyat (₺)</label>
                <input type="number" id="fiyat" name="fiyat" value="<?= $urun['fiyat'] ?>" step="0.01" min="0" required>
            </div>
            <div>
                <label for="aciklama">Açıklama</label>
                <textarea id="aciklama" name="aciklama" rows="3" maxlength="255"><?= htmlspecialchars($urun['aciklama']) ?></textarea>
            </div>
            <div>
                <label for="resim">Yeni Resim Yükle (Değiştirmek istemiyorsanız boş bırakın)</label>
                <input type="file" id="resim" name="resim" accept="image/*">
                <?php if (!empty($urun['resim'])): ?>
                    <div class="current-img-container">
                        <p style="font-size: 0.9rem; margin-bottom: 5px;">Mevcut Resim:</p>
                        <img src="../images/<?= htmlspecialchars($urun['resim']) ?>" alt="Mevcut resim" class="current-img">
                    </div>
                <?php endif; ?>
            </div>
            <div class="form-actions">
                <a href="menuler.php" class="btn btn-secondary">İptal</a>
                <button type="submit" name="urun_guncelle" class="btn btn-primary">Güncelle</button>
            </div>
        </form>
    </div>
</body>
</html>
