<?php
require_once __DIR__ . '/includes/header.php';

// Silme işlemi (PDO ile)
if (isset($_GET['sil']) && is_numeric($_GET['sil'])) {
    $sil_id = intval($_GET['sil']);
    $stmt = $db->prepare("DELETE FROM rezervasyonlar WHERE id = ?");
    if ($stmt->execute([$sil_id])) {
        echo '<div class="bg-green-100 text-green-800 px-4 py-2 rounded mb-4">Rezervasyon başarıyla silindi.</div>';
    } else {
        echo '<div class="bg-red-100 text-red-800 px-4 py-2 rounded mb-4">Rezervasyon silinirken bir hata oluştu.</div>';
    }
}

// Rezervasyonları çek (en yeniden eskiye)
$stmt = $db->query("SELECT * FROM rezervasyonlar ORDER BY created_at DESC");
$rezervasyonlar = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<div class="bg-white rounded-lg shadow p-6">
    <h3 class="text-xl font-bold mb-4">Gelen Rezervasyonlar</h3>
    <div class="overflow-x-auto">
        <table class="min-w-full table-auto border">
            <thead>
                <tr class="bg-gray-100">
                    <th class="px-4 py-2">Ad Soyad</th>
                    <th class="px-4 py-2">Telefon</th>
                    <th class="px-4 py-2">Tarih</th>
                    <th class="px-4 py-2">Saat</th>
                    <th class="px-4 py-2">Kişi</th>
                    <th class="px-4 py-2">Masa</th>
                    <th class="px-4 py-2">Sipariş Özeti</th>
                    <th class="px-4 py-2">İşlem</th>
                </tr>
            </thead>
            <tbody>
                <?php if ($rezervasyonlar): ?>
                    <?php foreach ($rezervasyonlar as $row): ?>
                        <tr class="hover:bg-gray-50">
                            <td class="border px-4 py-2"><?= htmlspecialchars($row['ad_soyad']) ?></td>
                            <td class="border px-4 py-2"><?= htmlspecialchars($row['telefon']) ?></td>
                            <td class="border px-4 py-2"><?= htmlspecialchars(date('d.m.Y', strtotime($row['tarih']))) ?></td>
                            <td class="border px-4 py-2"><?= htmlspecialchars($row['saat']) ?></td>
                            <td class="border px-4 py-2"><?= htmlspecialchars($row['kisi_sayisi']) ?></td>
                            <td class="border px-4 py-2"><?= htmlspecialchars($row['masa']) ?></td>
                            <td class="border px-4 py-2" style="min-width: 200px;"><?= nl2br(htmlspecialchars($row['siparis_ozeti'])) ?></td>
                            <td class="border px-4 py-2 text-center">
                                <a href="?sil=<?= $row['id'] ?>" class="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded transition delete-btn">
                                    <i class="fas fa-trash-alt"></i> Sil
                                </a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php else: ?>
                    <tr>
                        <td colspan="8" class="text-center p-4">Henüz rezervasyon bulunmamaktadır.</td>
                    </tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>

<!-- SweetAlert2 ile silme onayı -->
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script>
document.addEventListener('DOMContentLoaded', function () {
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const urlToDelete = this.getAttribute('href');
            Swal.fire({
                title: 'Emin misiniz?',
                text: 'Bu rezervasyonu silmek istediğinize emin misiniz?',
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
