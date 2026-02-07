<?php
require_once 'includes/db.php';
require_once 'includes/auth.php';

// Kategori ekle
if (isset($_POST['kategori_ekle'])) {
    $isim = trim($_POST['isim']);
    $sira = isset($_POST['sira']) ? intval($_POST['sira']) : 0;
    if (!empty($isim)) {
        $stmt = $db->prepare("INSERT INTO kategoriler (isim, sira) VALUES (?, ?)");
        $stmt->execute([$isim, $sira]);
    }
    header('Location: kategoriler.php'); 
    exit();
}

// Sıra güncelleme
if (isset($_POST['sira_guncelle'])) {
    if (isset($_POST['sira']) && is_array($_POST['sira'])) {
        foreach ($_POST['sira'] as $kat_id => $sira) {
            $stmt = $db->prepare("UPDATE kategoriler SET sira = ? WHERE id = ?");
            $stmt->execute([intval($sira), intval($kat_id)]);
        }
    }
    header('Location: kategoriler.php');
    exit();
}

// Kategori silme
if (isset($_GET['sil'])) {
    $id = intval($_GET['sil']);
    // Kategoriye bağlı ürün var mı kontrol et
    $check_stmt = $db->prepare("SELECT COUNT(*) as count FROM urunler WHERE kategori_id = ?");
    $check_stmt->execute([$id]);
    $result = $check_stmt->fetch(PDO::FETCH_ASSOC);
    if ($result['count'] == 0) {
        $stmt = $db->prepare("DELETE FROM kategoriler WHERE id=?");
        $stmt->execute([$id]);
    }
    header('Location: kategoriler.php');
    exit();
}

// Kategorileri çek
$kategoriler = $db->query("SELECT * FROM kategoriler ORDER BY sira ASC, isim ASC");

require_once __DIR__ . '/includes/header.php';
?>

<div class="bg-white p-6 md:p-8 rounded-xl shadow-md">
    
    <!-- Yeni Kategori Ekleme Formu -->
    <div class="mb-8">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">Yeni Kategori Ekle</h3>
        <form action="kategoriler.php" method="POST" class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div class="w-full sm:flex-1">
                <label for="isim" class="sr-only">Kategori Adı</label>
                <input type="text" name="isim" id="isim" placeholder="Örn: Sıcak İçecekler" required 
                       class="w-full px-4 py-2.5 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
            </div>
            <div class="w-32">
                <label for="sira" class="sr-only">Sıra</label>
                <input type="number" name="sira" id="sira" placeholder="Sıra" min="0" value="0"
                       class="w-full px-4 py-2.5 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
            </div>
            <button type="submit" name="kategori_ekle"
                    class="w-full sm:w-auto px-6 py-2.5 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300 flex items-center justify-center gap-2">
                <i class="fas fa-plus"></i>
                <span>Ekle</span>
            </button>
        </form>
    </div>

    <!-- Kategoriler Tablosu ve Sıra Güncelleme Formu -->
    <form action="kategoriler.php" method="POST">
    <input type="hidden" name="sira_guncelle" value="1">
    <div class="overflow-x-auto">
        <table class="min-w-full bg-white">
            <thead class="bg-gray-50">
                <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kategori Adı
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sıra
                    </th>
                    <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                    </th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
                <?php $kategoriler->execute(); while($kat = $kategoriler->fetch(PDO::FETCH_ASSOC)): ?>
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="text-sm font-medium text-gray-900"><?= htmlspecialchars($kat['isim']) ?></span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <input type="number" name="sira[<?= $kat['id'] ?>]" value="<?= (int)$kat['sira'] ?>" class="w-20 px-2 py-1 border rounded">
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href="kategori_duzenle.php?id=<?= $kat['id'] ?>" class="text-indigo-600 hover:text-indigo-900 transition mr-4" title="Düzenle">
                            <i class="fas fa-pencil-alt"></i> Düzenle
                        </a>
                        <a href="?sil=<?= $kat['id'] ?>" class="text-red-600 hover:text-red-900 transition delete-btn" title="Sil">
                            <i class="fas fa-trash-alt"></i> Sil
                        </a>
                    </td>
                </tr>
                <?php endwhile; ?>
                 <?php if($kategoriler->rowCount() === 0): ?>
                    <tr>
                        <td colspan="3" class="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                            Henüz hiç kategori eklenmemiş.
                        </td>
                    </tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
    <div class="mt-4 flex justify-end">
        <button type="submit" class="px-6 py-2.5 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-300 flex items-center gap-2">
            <i class="fas fa-save"></i> Sıraları Kaydet
        </button>
    </div>
    </form>
</div>

<script>
document.addEventListener('DOMContentLoaded', function () {
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const urlToDelete = this.getAttribute('href');

            Swal.fire({
                title: 'Emin misiniz?',
                text: "Bu kategoriyi silerseniz, geri alamazsınız. Bu kategoriye ait ürünler varsa silme işlemi başarısız olabilir.",
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
