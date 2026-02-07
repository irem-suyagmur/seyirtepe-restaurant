<?php
require_once 'includes/db.php';
require_once 'includes/auth.php';

// Masa ekleme
if (isset($_POST['masa_ekle'])) {
    $masa_adi = trim($_POST['masa_adi']);
    if (!empty($masa_adi)) {
        $stmt = $db->prepare("INSERT INTO masalar (masa_adi, durum) VALUES (?, 'boş')");
        $stmt->execute([$masa_adi]);
    }
    header("Location: masalar.php");
    exit;
}

// Masa silme
if (isset($_GET['sil'])) {
    $id = intval($_GET['sil']);
    $stmt = $db->prepare("DELETE FROM masalar WHERE id = ?");
    $stmt->execute([$id]);
    header("Location: masalar.php");
    exit;
}

// Masa düzenleme
if (isset($_POST['masa_guncelle'])) {
    $id = intval($_POST['edit_id']);
    $masa_adi = trim($_POST['edit_masa_adi']);
    $durum = $_POST['edit_durum'];
    if (!empty($masa_adi)) {
        $stmt = $db->prepare("UPDATE masalar SET masa_adi = ?, durum = ? WHERE id = ?");
        $stmt->execute([$masa_adi, $durum, $id]);
    }
    header("Location: masalar.php");
    exit;
}

$masalar = $db->query("SELECT * FROM masalar ORDER BY id ASC");

require_once __DIR__ . '/includes/header.php';
?>

<div class="bg-white p-6 md:p-8 rounded-xl shadow-md">
    <!-- Yeni Masa Ekleme Formu -->
    <div class="mb-8">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">Yeni Masa Ekle</h3>
        <form action="masalar.php" method="POST" class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div class="w-full sm:flex-1">
                <label for="masa_adi" class="sr-only">Masa Adı</label>
                <input type="text" name="masa_adi" id="masa_adi" placeholder="Örn: Bahçe 5" required 
                       class="w-full px-4 py-2.5 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
            </div>
            <button type="submit" name="masa_ekle"
                    class="w-full sm:w-auto px-6 py-2.5 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300 flex items-center justify-center gap-2">
                <i class="fas fa-plus"></i>
                <span>Ekle</span>
            </button>
        </form>
    </div>

    <!-- Masalar Listesi -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <?php while($masa = $masalar->fetch(PDO::FETCH_ASSOC)): 
            $durum_class = '';
            $durum_text = '';
            switch ($masa['durum']) {
                case 'dolu':
                    $durum_class = 'bg-red-100 text-red-800';
                    $durum_text = 'Dolu';
                    break;
                case 'rezerve':
                    $durum_class = 'bg-yellow-100 text-yellow-800';
                    $durum_text = 'Rezerve';
                    break;
                default:
                    $durum_class = 'bg-green-100 text-green-800';
                    $durum_text = 'Boş';
                    break;
            }
        ?>
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-5 flex flex-col justify-between">
            <div>
                <h4 class="text-lg font-bold text-gray-800"><?= htmlspecialchars($masa['masa_adi']) ?></h4>
                <span class="text-xs font-semibold inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline rounded-full <?= $durum_class ?> mt-2">
                    <?= $durum_text ?>
                </span>
            </div>
            <div class="mt-4 flex items-center justify-end gap-3">
                <button onclick="openEditModal(<?= $masa['id'] ?>, '<?= htmlspecialchars($masa['masa_adi'], ENT_QUOTES) ?>', '<?= $masa['durum'] ?>')" class="text-sm font-medium text-indigo-600 hover:text-indigo-900 transition" title="Düzenle">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                <a href="?sil=<?= $masa['id'] ?>" class="text-sm font-medium text-red-600 hover:text-red-900 transition delete-btn" title="Sil">
                    <i class="fas fa-trash-alt"></i>
                </a>
            </div>
        </div>
        <?php endwhile; ?>
        <?php if($masalar->rowCount() === 0): ?>
            <p class="col-span-full text-center text-gray-500">Henüz hiç masa eklenmemiş.</p>
        <?php endif; ?>
    </div>
</div>

<!-- Düzenleme Modalı -->
<div id="editModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center hidden">
    <div class="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-xl bg-white">
        <div class="mt-3 text-center">
            <h3 class="text-lg leading-6 font-bold text-gray-900 mb-6">Masa Düzenle</h3>
            <form method="post" action="masalar.php" id="editForm">
                <input type="hidden" name="edit_id" id="edit_id">
                <div class="text-left">
                    <label for="edit_masa_adi" class="text-sm font-medium text-gray-700">Masa Adı</label>
                    <input type="text" name="edit_masa_adi" id="edit_masa_adi" required class="w-full mt-2 px-4 py-2.5 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                </div>
                <div class="mt-4 text-left">
                    <label for="edit_durum" class="text-sm font-medium text-gray-700">Durum</label>
                    <select name="edit_durum" id="edit_durum" class="w-full mt-2 px-4 py-2.5 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                        <option value="boş">Boş</option>
                        <option value="dolu">Dolu</option>
                        <option value="rezerve">Rezerve</option>
                    </select>
                </div>
                <div class="mt-8 flex justify-end gap-4">
                    <button type="button" onclick="closeEditModal()" class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition">
                        İptal
                    </button>
                    <button type="submit" name="masa_guncelle" class="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                        Kaydet
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
function openEditModal(id, masa_adi, durum) {
    document.getElementById('edit_id').value = id;
    document.getElementById('edit_masa_adi').value = masa_adi;
    document.getElementById('edit_durum').value = durum;
    document.getElementById('editModal').classList.remove('hidden');
}

function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', function () {
    // Modal dışına tıklayınca kapat
    const modal = document.getElementById('editModal');
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeEditModal();
        }
    });

    // Silme butonu için onay
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const urlToDelete = this.getAttribute('href');
            Swal.fire({
                title: 'Emin misiniz?',
                text: "Bu masayı silmek istediğinizden emin misiniz?",
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
