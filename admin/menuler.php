<?php
require_once 'includes/db.php';
require_once 'includes/auth.php';

// Ürün ekleme
if (isset($_POST['urun_ekle'])) {
    $kategori_id = intval($_POST['kategori_id']);
    $isim = trim($_POST['urun_adi']);
    $fiyat = floatval($_POST['fiyat']);
    $aciklama = trim($_POST['aciklama']);
    $resim_adi = null;

    if (!empty($isim) && $kategori_id > 0) {
        // Resim yükleme işlemi
        if (isset($_FILES['resim']) && $_FILES['resim']['error'] === UPLOAD_ERR_OK) {
            $upload_dir = '../images/';
            if (!is_dir($upload_dir)) {
                mkdir($upload_dir, 0777, true);
            }
            $ext = pathinfo($_FILES['resim']['name'], PATHINFO_EXTENSION);
            $resim_adi = uniqid('urun_') . '.' . strtolower($ext);
            move_uploaded_file($_FILES['resim']['tmp_name'], $upload_dir . $resim_adi);
        }

        $stmt = $db->prepare("INSERT INTO urunler (isim, fiyat, kategori_id, aciklama, resim) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$isim, $fiyat, $kategori_id, $aciklama, $resim_adi]);
    }
    header("Location: menuler.php");
    exit;
}

// Ürün silme
if (isset($_GET['sil'])) {
    $id = intval($_GET['sil']);
    // Önce resim dosyasını sunucudan sil
    $stmt_select = $db->prepare("SELECT resim FROM urunler WHERE id = ?");
    $stmt_select->execute([$id]);
    if($row = $stmt_select->fetch(PDO::FETCH_ASSOC)){
        if(!empty($row['resim']) && file_exists('../images/' . $row['resim'])){
            unlink('../images/' . $row['resim']);
        }
    }
    // Sonra ürünü veritabanından sil
    $stmt_delete = $db->prepare("DELETE FROM urunler WHERE id = ?");
    $stmt_delete->execute([$id]);
    header("Location: menuler.php");
    exit;
}

$urunler = $db->query("SELECT urunler.*, kategoriler.isim AS kategori_adi FROM urunler LEFT JOIN kategoriler ON urunler.kategori_id = kategoriler.id ORDER BY kategoriler.isim, urunler.isim ASC");
$kategoriler = $db->query("SELECT * FROM kategoriler ORDER BY sira ASC, isim ASC");

require_once __DIR__ . '/includes/header.php';
?>

<div class="bg-white p-6 md:p-8 rounded-xl shadow-md">
    <!-- Yeni Ürün Ekleme Formu -->
    <div class="mb-8">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">Yeni Ürün Ekle</h3>
        <form action="menuler.php" method="POST" enctype="multipart/form-data" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            
            <div class="lg:col-span-1">
                <label for="urun_adi" class="block text-sm font-medium text-gray-700 mb-1">Ürün Adı</label>
                <input type="text" name="urun_adi" id="urun_adi" placeholder="Örn: Sütlaç" required class="w-full input-style">
            </div>

            <div class="lg:col-span-1">
                <label for="kategori_id" class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select name="kategori_id" id="kategori_id" required class="w-full input-style">
                    <option value="">Seçiniz...</option>
                    <?php while($kat = $kategoriler->fetch(PDO::FETCH_ASSOC)): ?>
                        <option value="<?= $kat['id'] ?>"><?= htmlspecialchars($kat['isim']) ?></option>
                    <?php endwhile; ?>
                </select>
            </div>

            <div class="lg:col-span-1">
                <label for="fiyat" class="block text-sm font-medium text-gray-700 mb-1">Fiyat (₺)</label>
                <input type="number" name="fiyat" id="fiyat" placeholder="Örn: 85.50" step="0.01" required class="w-full input-style">
            </div>
            
            <div class="lg:col-span-1">
                <label for="resim" class="block text-sm font-medium text-gray-700 mb-1">Resim</label>
                <input type="file" name="resim" id="resim" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
            </div>

            <button type="submit" name="urun_ekle" class="w-full lg:w-auto px-6 py-2.5 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300 flex items-center justify-center gap-2">
                <i class="fas fa-plus"></i>
                <span>Ekle</span>
            </button>
            
            <div class="md:col-span-2 lg:col-span-5">
                 <label for="aciklama" class="block text-sm font-medium text-gray-700 mb-1">Açıklama (varsa)</label>
                <input type="text" name="aciklama" id="aciklama" placeholder="Ürünle ilgili kısa bir açıklama..." class="w-full input-style">
            </div>

        </form>
    </div>

    <!-- Ürünler Listesi -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <?php $urunler->execute(); // Pointer'ı başa al ?>
        <?php while($urun = $urunler->fetch(PDO::FETCH_ASSOC)): ?>
        <div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
            <img class="h-48 w-full object-cover" src="../images/<?= htmlspecialchars($urun['resim'] ?: 'placeholder.png') ?>" alt="<?= htmlspecialchars($urun['isim']) ?>" onerror="this.onerror=null;this.src='https://placehold.co/600x400/e2e8f0/adb5bd?text=Resim+Yok';">
            <div class="p-5 flex flex-col flex-grow">
                <h5 class="text-gray-900 font-bold text-xl tracking-tight mb-2"><?= htmlspecialchars($urun['isim']) ?></h5>
                <p class="font-normal text-gray-600 text-sm mb-3 flex-grow"><?= htmlspecialchars($urun['aciklama']) ?></p>
                
                <div class="flex items-center justify-between mt-auto">
                    <span class="text-2xl font-bold text-gray-900"><?= number_format($urun['fiyat'], 2, ',', '.') ?>₺</span>
                    <span class="text-xs font-semibold inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline rounded-full bg-blue-100 text-blue-800">
                        <?= htmlspecialchars($urun['kategori_adi']) ?>
                    </span>
                </div>
                <div class="mt-4 pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
                     <a href="menu_duzenle.php?id=<?= $urun['id'] ?>" class="text-sm font-medium text-indigo-600 hover:text-indigo-900 transition" title="Düzenle">
                        <i class="fas fa-pencil-alt mr-1"></i>Düzenle
                    </a>
                    <a href="?sil=<?= $urun['id'] ?>" class="text-sm font-medium text-red-600 hover:text-red-900 transition delete-btn" title="Sil">
                        <i class="fas fa-trash-alt mr-1"></i>Sil
                    </a>
                </div>
            </div>
        </div>
        <?php endwhile; ?>
        <?php if($urunler->rowCount() === 0): ?>
            <p class="col-span-full text-center text-gray-500 py-10">Henüz hiç ürün eklenmemiş.</p>
        <?php endif; ?>
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

<script>
document.addEventListener('DOMContentLoaded', function () {
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const urlToDelete = this.getAttribute('href');
            Swal.fire({
                title: 'Emin misiniz?',
                text: "Bu ürünü menüden kalıcı olarak silmek istediğinizden emin misiniz?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Evet, sil!',
                cancelButtonText: 'İptal'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = urlToDelete;
                }
            });
        });
    });
});
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
