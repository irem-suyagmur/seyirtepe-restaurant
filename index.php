<?php
// Veritabanı bağlantı bilgileri
$host = "localhost";
$user = "root";
$pass = "";
$db = "seyirtepedb";

// Veritabanı bağlantısını oluştur
$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("Bağlantı hatası: " . $conn->connect_error);
}
$conn->set_charset("utf8mb4");

// --- API ENDPOINT: KATEGORİ ÜRÜNLERİNİ GETİR ---
if (isset($_GET['get_category'])) {
    $categoryId = intval($_GET['get_category']);
    $stmt = $conn->prepare("SELECT id, isim, fiyat, aciklama, resim, kategori_id FROM urunler WHERE kategori_id = ? ORDER BY isim ASC");
    $stmt->bind_param("i", $categoryId);
    $stmt->execute();
    $result = $stmt->get_result();
    $urunler = [];
    while($urun = $result->fetch_assoc()) {
        $urunler[] = $urun;
    }
    $stmt->close();
    $conn->close();

    header('Content-Type: application/json');
    echo json_encode($urunler);
    exit();
}

// Girdiyi temizlemek için yardımcı fonksiyon
function clean_input($data) {
    $data = trim($data);
    $data = str_replace(["\xc2\xa0", "\xa0"], ' ', $data);
    return trim($data);
}

// --- REZERVASYON FORMU İŞLEME ---
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $ad_soyad = clean_input($_POST['ad_soyad']);
    $telefon = clean_input($_POST['telefon']);
    $tarih = clean_input($_POST['tarih']);
    $saat = clean_input($_POST['saat']);
    $kisi_sayisi = clean_input($_POST['kisi_sayisi']);
    $masa = clean_input($_POST['masa']);
    $siparis_ozeti = clean_input($_POST['siparis_ozeti']);

    $stmt = $conn->prepare("INSERT INTO rezervasyonlar (ad_soyad, telefon, tarih, saat, kisi_sayisi, masa, siparis_ozeti) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssiss", $ad_soyad, $telefon, $tarih, $saat, $kisi_sayisi, $masa, $siparis_ozeti);
    $stmt->execute();
    $stmt->close();

    // --- WHATSAPP MESAJI OLUŞTURMA ---
    $siparisler = explode(',', $siparis_ozeti);
    $siparis_metin = "";
    foreach ($siparisler as $siparis) {
        $siparis = clean_input($siparis);
        if (empty($siparis)) continue;
        $emoji = "🍽️";
        if (stripos($siparis, 'kahve') !== false) $emoji = "☕";
        if (stripos($siparis, 'çay') !== false) $emoji = "🫖";
        $siparis_metin .= "- $emoji $siparis\n";
    }

    $mesaj = "📅 *Yeni Rezervasyon Alındı* 📅\n\n"
        . "*Müşteri Bilgileri:*\n"
        . "👤 Ad Soyad: $ad_soyad\n"
        . "📞 Telefon: $telefon\n\n"
        . "*Rezervasyon Detayları:*\n"
        . "📆 Tarih: $tarih\n"
        . "⏰ Saat: $saat\n"
        . "👥 Kişi Sayısı: $kisi_sayisi\n"
        . "🪑 Masa: $masa\n\n"
        . "🛒 *Sipariş Özeti:*\n"
        . rtrim($siparis_metin);

    $whatsapp_url = "https://wa.me/905065826771?text=" . rawurlencode($mesaj);
    header("Location: $whatsapp_url");
    exit();
}

// --- SAYFA İÇİN VERİLERİ ÇEK ---
$kategori_sorgu = $conn->query("SELECT id, isim FROM kategoriler ORDER BY sira ASC, isim ASC");
$kategoriler = [];
while($kat = $kategori_sorgu->fetch_assoc()) {
    $kategoriler[] = $kat;
}

$masalar_sorgu = $conn->query("SELECT id, masa_adi, durum FROM masalar ORDER BY id ASC");
$masalar = [];
while($masa = $masalar_sorgu->fetch_assoc()) {
    $masalar[] = $masa;
}
$conn->close();
?>
<!DOCTYPE html>
<html lang="tr" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seyir Tepe | Bir Lezzet Deneyimi</title>
    <!-- SEO Başlangıcı -->
    <meta name="description" content="Seyirtepe Restaurant & Cafe, Belen Kıcı'da eşsiz manzarası ve Hatay mutfağıyla 7/24 hizmetinizde. Rezervasyon ve menü için hemen tıklayın!">
    <meta name="keywords" content="Seyirtepe Restaurant, Seyirtepe Restaurant Cafe, Belen Kıcı Seyirtepe, Kıcı Belen Seyirtepe, Hatay Restaurant, Manzaralı Restaurant">
    <meta property="og:title" content="Seyirtepe Restaurant & Cafe | Belen Kıcı'nın Eşsiz Manzarası">
    <meta property="og:description" content="Belen Kıcı'nın en güzel manzaralı restoranı. Hatay mutfağı, rezervasyon ve iletişim için tıklayın.">
    <meta property="og:url" content="https://seyirteperestaurantcafe.com/">
    <meta property="og:image" content="https://seyirteperestaurantcafe.com/images/SEYİR%20TEPE%20LOGO%20ŞEFAFF%20ARKA%20PLAN.png">
    <!-- SEO Sonu -->
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>

    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'primary': '#101010', 
                        'secondary': '#F5F5F5',
                        'accent': '#D4AF37',
                        'background': '#0A0A0A',
                        'text-dark': '#121212',
                        'text-light': '#EAEAEA',
                    },
                    fontFamily: {
                        'sans': ['Poppins', 'sans-serif'],
                    }
                }
            }
        }
    </script>

    <style>
        body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        ::selection { background: #D4AF37; color: #101010; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #101010; }
        ::-webkit-scrollbar-thumb { background: #D4AF37; border-radius: 4px; }

        @keyframes background-pan { 0% { background-position: 0% 50%; } 100% { background-position: 100% 50%; } }
        body::before {
            content: ''; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background-image: url('images/amikovası.webp');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            background-attachment: fixed;
            z-index: -2; filter: brightness(0.4);
        }
        body::after {
            content: ''; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(10, 10, 10, 0.6); z-index: -1;
        }

        .glass-effect {
            background: rgba(18, 18, 18, 0.5); backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .form-input {
            background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 0.75rem 1rem; border-radius: 0.5rem; transition: all 0.3s ease; color: #EAEAEA; width: 100%;
        }
        .form-input:focus { outline: none; border-color: #D4AF37; box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.4); }
        .form-input::placeholder { color: #9ca3af; }
        .form-input::-webkit-calendar-picker-indicator { filter: invert(1); }

        .text-reveal-wrapper { display: inline-block; overflow: hidden; }
        .text-reveal > .char {
            transform: translateY(115%); transition: transform 0.6s cubic-bezier(0.2, 1, 0.3, 1); display: inline-block;
        }
        .nav-link { position: relative; }
        .nav-link::after {
            content: ''; position: absolute; left: 0; bottom: -4px; width: 0; height: 2px;
            background-color: #D4AF37; transition: width 0.3s ease;
        }
        .nav-link:hover::after { width: 100%; }

        .table { transition: all 0.3s ease; cursor: pointer; border: 1px solid #444; }
        .table.available:hover { background-color: #D4AF37; color: #101010; border-color: #D4AF37; }
        .table.selected {
            background-color: #D4AF37; color: #101010; transform: scale(1.1);
            box-shadow: 0 0 25px rgba(212, 175, 55, 0.6); border-color: #D4AF37;
        }
        .table.unavailable { background-color: #333; color: #777; cursor: not-allowed; opacity: 0.7; }

        .menu-item-card {
            background: rgba(18, 18, 18, 0.4); border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px); cursor: pointer; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            overflow: hidden; position: relative;
        }
        .menu-item-card:hover {
            transform: translateY(-8px) scale(1.03);
            box-shadow: 0 15px 30px rgba(0,0,0,0.3), 0 0 20px rgba(212, 175, 55, 0.3);
            border-color: rgba(212, 175, 55, 0.5);
        }
        .menu-item-card-img { aspect-ratio: 1/1; object-fit: cover; transition: transform 0.5s ease; }
        .menu-item-card:hover .menu-item-card-img { transform: scale(1.15); }

        #menu-modal-overlay.hidden { display: none; }
        #menu-modal-panel {
            transform: scale(0.95) translateY(20px); opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
        }
        #menu-modal-overlay:not(.hidden) #menu-modal-panel { transform: scale(1) translateY(0); opacity: 1; }
        
        .fade-in-up {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .fade-in-up.is-visible {
            opacity: 1;
            transform: translateY(0);
        }
        @media (max-width: 768px) {
            /* Ürün detay modalı mobilde daha küçük ve kullanışlı olsun */
            #menu-modal-panel { max-width: 90vw !important; max-height: 80vh !important; padding: 0.5rem !important; }
            #menu-modal-panel .aspect-square, #menu-modal-panel img { height: 120px !important; min-height: 120px !important; max-height: 120px !important; width: 100% !important; object-fit: cover !important; }
            #menu-modal-panel h2 { font-size: 1rem !important; }
            #menu-modal-panel p { font-size: 0.8rem !important; }
            #menu-modal-panel .text-3xl, #menu-modal-panel .text-4xl { font-size: 1.1rem !important; }
            #menu-modal-panel .add-to-cart-btn { font-size: 0.9rem !important; padding: 0.7rem 0.5rem !important; }
            #menu-modal-panel .grid { gap: 0.5rem !important; }
            body::before {
                background-image: url('images/amikovası.webp') !important;
                background-size: cover !important;
                background-position: center !important;
                background-repeat: no-repeat !important;
                background-attachment: scroll !important;
                filter: brightness(1) !important;
            }
        }
    </style>
</head>
<body class="bg-background font-sans text-text-light antialiased">

    <header id="header" class="glass-effect fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <nav class="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
            <a href="#" class="text-xl sm:text-2xl md:text-3xl font-bold text-secondary">Seyirtepe Restaurant & Cafe</a>
            <div class="hidden md:flex space-x-8 items-center">
                <a href="#hero" class="nav-link text-text-light hover:text-accent transition duration-300">Anasayfa</a>
                <a href="#about" class="nav-link text-text-light hover:text-accent transition duration-300">Hakkımızda</a>
                <a href="#menu" class="nav-link text-text-light hover:text-accent transition duration-300">Menü</a>
                <a href="#reservation" class="nav-link text-text-light hover:text-accent transition duration-300">Rezervasyon</a>
                <a href="#contact" class="nav-link text-text-light hover:text-accent transition duration-300">İletişim</a>
            </div>
            <div class="md:hidden">
                <button id="menu-open-button" class="text-text-light text-2xl"><i class="fas fa-bars"></i></button>
            </div>
        </nav>
    </header>

    <div id="mobile-menu" class="hidden md:hidden fixed inset-0 bg-background/95 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
        <button id="menu-close-button" class="absolute top-6 right-6 text-3xl text-secondary"><i class="fas fa-times"></i></button>
        <nav class="flex flex-col items-center gap-y-8 text-2xl font-semibold text-secondary">
            <a href="#hero" class="nav-link">Anasayfa</a>
            <a href="#about" class="nav-link">Hakkımızda</a>
            <a href="#menu" class="nav-link">Menü</a>
            <a href="#reservation" class="nav-link">Rezervasyon</a>
            <a href="#contact" class="nav-link">İletişim</a>
        </nav>
    </div>

    <main>
        <section id="hero" class="min-h-screen flex items-center justify-center text-center px-4">
            <div class="relative z-10">
                <h1 class="text-4xl md:text-6xl font-extrabold leading-tight text-shadow-strong">
                    <span class="text-secondary">Eşsiz Manzara,</span><br>
                    <span class="text-accent">Unutulmaz Tatlar</span>
                </h1>
                <p class="text-base md:text-lg mt-6 max-w-lg mx-auto font-light opacity-0" id="hero-subtitle">
                    2007'den beri Amanos Dağları ve Belen'in büyüleyici manzarası eşliğinde.
                </p>
                <a href="#menu" class="mt-8 inline-block bg-accent text-primary font-bold py-3 px-8 rounded-full hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 opacity-0 text-base sm:text-lg" id="hero-cta">Menüyü Keşfet</a>
            </div>
        </section>

        <section id="about" class="py-16 md:py-24 overflow-hidden">
            <div class="container mx-auto px-4 sm:px-6 flex flex-col md:flex-row gap-8 md:gap-16 items-center">
                 <div class="w-full md:w-1/2 flex-shrink-0 flex justify-center md:justify-start mb-6 md:mb-0">
                     <img src="images/seyirtepedisaridan.webp" alt="Belen Kıcı Seyirtepe Restaurant Manzarası" class="rounded-lg shadow-2xl max-w-md md:max-w-lg w-full h-auto object-cover md:ml-8" style="box-shadow:0 8px 32px 0 rgba(0,0,0,0.35);" loading="lazy">
                 </div>
                 <div class="w-full md:w-1/2 text-center md:text-left fade-in-up">
                    <h2 class="text-3xl md:text-5xl font-bold text-secondary mb-6">
                        Bizim Hikayemiz
                    </h2>
                    <p class="text-base md:text-lg text-gray-400 leading-relaxed mb-4">
                    Seyirtepe, geleneksel Türk ve Hatay mutfağının en özel tatlarını modern bir dokunuşla sunar. Belen'e ve Amanos Dağları'na hakim manzaramız, geniş oturma alanlarımız ve 7/24 hizmet anlayışımızla sevdiklerinizle unutulmaz anılar biriktirmeniz için sizleri Seyirtepe'ye davet ediyoruz. 2007 yılında İstanbul Ataşehir'de kurulan firmamız, 2016 yılından bu yana Kıcı/Belen/Hatay'da faaliyetlerine devam etmektedir.
                    </p>
                    <p class="text-base md:text-lg text-gray-400 leading-relaxed">
                        Sevdiklerinizle unutulmaz anılar biriktirmek için sizi Seyirtepe’ye davet ediyoruz.
                    </p>
                </div>
            </div>
        </section>

        <section id="menu" class="py-16 md:py-24 bg-primary/50">
            <div class="container mx-auto px-4 sm:px-6">
                <div class="text-center mb-12 fade-in-up">
                    <h2 class="text-3xl md:text-5xl font-bold text-secondary">Lezzet Menümüz</h2>
                </div>
                <div id="menu-tabs" class="flex flex-wrap justify-center gap-2 md:gap-4 mb-12 fade-in-up"></div>
                <div id="menu-content" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 min-h-[400px] relative"></div>
            </div>
        </section>

        <section id="reservation" class="py-16 md:py-24">
            <div class="container mx-auto px-4 sm:px-6">
                 <div class="text-center mb-12 fade-in-up">
                    <h2 class="text-3xl md:text-5xl font-bold text-secondary">Rezervasyon Yapın</h2>
                </div>
                <div class="max-w-4xl mx-auto glass-effect p-6 md:p-10 rounded-2xl fade-in-up">
                    <form id="reservation-form" method="POST" action="index.php" class="grid lg:grid-cols-2 gap-x-12 gap-y-8">
                        <div class="space-y-8">
                            <div>
                                <h3 class="text-lg sm:text-xl font-bold text-secondary mb-4">1. Detaylar</h3>
                                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <input type="date" id="res-date" class="form-input text-sm sm:text-base">
                                    <select id="res-time" class="form-input text-sm sm:text-base">
                                        <option>18:00</option><option>19:00</option><option>20:00</option><option>21:00</option><option>22:00</option>
                                    </select>
                                    <input type="number" id="res-guests" min="1" value="2" class="form-input text-sm sm:text-base">
                                </div>
                            </div>
                            <div>
                                <h3 class="text-lg sm:text-xl font-bold text-secondary mb-4">2. Masa Seçimi</h3>
                                <div id="table-layout" class="grid grid-cols-5 sm:grid-cols-6 gap-2 sm:gap-3"></div>
                            </div>
                        </div>
                        <div class="space-y-8">
                             <div>
                                <h3 class="text-lg sm:text-xl font-bold text-secondary mb-4">3. Sipariş Özeti</h3>
                                <div id="cart-summary" class="border border-gray-700 p-4 rounded-lg min-h-[150px] flex flex-col">
                                    <ul id="cart-items" class="space-y-2 flex-grow max-h-48 overflow-y-auto pr-2">
                                        <li class="text-gray-500 text-center py-4">Sepetiniz boş.</li>
                                    </ul>
                                    <div class="flex justify-between font-bold text-lg sm:text-xl mt-4 pt-3 border-t border-gray-700">
                                        <span>Toplam:</span><span id="cart-total">0,00₺</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 class="text-lg sm:text-xl font-bold text-secondary mb-4">4. İletişim Bilgileri</h3>
                                <div class="space-y-4">
                                    <input type="text" id="res-name" name="ad_soyad" required placeholder="Adınız Soyadınız" class="form-input w-full">
                                    <input type="tel" id="res-phone" name="telefon" required placeholder="Telefon Numaranız" class="form-input w-full">
                                </div>
                            </div>
                        </div>
                        <div class="lg:col-span-2 mt-6">
                            <input type="hidden" id="hidden-date" name="tarih">
                            <input type="hidden" id="hidden-time" name="saat">
                            <input type="hidden" id="hidden-guests" name="kisi_sayisi">
                            <input type="hidden" id="hidden-table" name="masa">
                            <input type="hidden" id="hidden-cart" name="siparis_ozeti">
                            <button type="submit" class="w-full bg-accent text-primary font-bold text-base sm:text-lg py-3 sm:py-4 px-6 rounded-full hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105">Rezervasyonu Tamamla</button>
                        </div>
                    </form>
                </div>
            </div>
        </section>

        <section id="contact" class="py-16 md:py-24 bg-primary/50">
            <div class="container mx-auto px-4 sm:px-6">
                <div class="text-center mb-12 fade-in-up">
                    <h2 class="text-3xl md:text-5xl font-bold text-secondary">Bize Ulaşın</h2>
                </div>
                <div class="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
                    <div class="h-80 md:h-96 w-full rounded-lg overflow-hidden shadow-lg fade-in-up">
                         <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d36295.06911059083!2d36.23725699553767!3d36.48023822385677!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15258acd5b35d585%3A0xc2ddcb21e7694f01!2sSeyirtepe%20Restaurant%20cafe!5e0!3m2!1str!2str!4v1741532150960!5m2!1str!2str" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" class="rounded-lg filter grayscale-[50%] contrast-125"></iframe>
                    </div>
                    <div class="flex flex-col justify-center text-center lg:text-left fade-in-up">
                        <div class="space-y-6 text-base sm:text-lg md:text-xl">
                            <p class="flex items-center justify-center lg:justify-start"><i class="fas fa-map-marker-alt text-accent w-6 mr-4"></i><span>Kıcı Mahallesi No : A/3 E-5 Karayolu Üzeri Hatay/Belen/Kıcı</span></p>
                            <p class="flex items-center justify-center lg:justify-start"><i class="fas fa-phone text-accent w-6 mr-4"></i> <a href="tel:05526010661" class="hover:text-accent transition duration-300">0552 601 0661</a></p>
                            <p class="flex items-center justify-center lg:justify-start"><i class="fas fa-clock text-accent w-6 mr-4"></i> <span>7/24 Açık</span></p>
                        </div>
                         <div class="mt-10 flex space-x-6 justify-center lg:justify-start">
                            <a href="https://www.instagram.com/seyirteperestaurantcafe/" target="_blank" class="text-secondary hover:text-accent text-3xl transition duration-300 transform hover:scale-110"><i class="fab fa-instagram"></i></a>
                            <a href="https://www.facebook.com/belen.seyirtepe/" target="_blank" class="text-secondary hover:text-accent text-3xl transition duration-300 transform hover:scale-110"><i class="fab fa-facebook"></i></a>
                            <a href="#" class="text-secondary hover:text-accent text-3xl transition duration-300 transform hover:scale-110"><i class="fab fa-x-twitter"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <footer class="bg-primary py-8">
        <div class="container mx-auto px-4 sm:px-6 text-center text-gray-400">
            <p>&copy; 2024 Seyir Tepe. Tüm Hakları Saklıdır.</p>
        </div>
    </footer>

    <div id="menu-modal-overlay" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-[101] flex items-center justify-center p-4 hidden">
        <div id="menu-modal-panel" class="bg-primary border border-accent/30 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative"></div>
    </div>
    
    <script>
        const kategorilerData = <?php echo json_encode($kategoriler); ?>;
        const masalarData = <?php echo json_encode($masalar); ?>;
        const apiEndpoint = 'index.php';
    </script>
    
    <script>
    document.addEventListener('DOMContentLoaded', () => {
        const menuContentEl = document.getElementById('menu-content');
        const menuTabsEl = document.getElementById('menu-tabs');
        const menuModalOverlay = document.getElementById('menu-modal-overlay');
        const menuModalPanel = document.getElementById('menu-modal-panel');
        const tableLayoutEl = document.getElementById('table-layout');
        const cartItemsEl = document.getElementById('cart-items');
        const cartTotalEl = document.getElementById('cart-total');
        const reservationForm = document.getElementById('reservation-form');
        const dateInput = document.getElementById('res-date');
        const mobileMenu = document.getElementById('mobile-menu');
        const menuOpenBtn = document.getElementById('menu-open-button');
        const menuCloseBtn = document.getElementById('menu-close-button');
        const navLinks = document.querySelectorAll('#mobile-menu .nav-link');

        let currentProducts = [], cart = [], selectedTable = null;

        const htmlspecialchars = (str) => {
            if (typeof str !== 'string') return '';
            const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
            return str.replace(/[&<>"']/g, m => map[m]);
        };
        const formatPrice = (price) => parseFloat(price).toFixed(2).replace('.', ',');

        const initAnimations = () => {
            gsap.registerPlugin(ScrollTrigger);
            document.querySelectorAll('.text-reveal').forEach(el => {
                const chars = el.textContent.split('').map(char => `<span class="char">${char === ' ' ? '&nbsp;' : char}</span>`).join('');
                el.innerHTML = chars;
            });
            gsap.utils.toArray('.text-reveal-wrapper').forEach(wrapper => {
                gsap.fromTo(wrapper.querySelectorAll('.char'), 
                    { y: '115%' },
                    { y: '0%', duration: 1, stagger: 0.03, ease: 'power4.out',
                        scrollTrigger: { trigger: wrapper, start: 'top 85%', toggleActions: 'play none none none' }
                    }
                );
            });
            gsap.to('#hero-subtitle', { opacity: 1, delay: 1, duration: 1.5, ease: 'power2.out' });
            gsap.to('#hero-cta', { opacity: 1, delay: 1.5, duration: 1.5, ease: 'power2.out' });

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    }
                });
            }, { threshold: 0.1 });

            document.querySelectorAll('.fade-in-up').forEach(el => {
                observer.observe(el);
            });
        };

        const fetchAndDisplayMenu = async (categoryId) => {
            menuContentEl.innerHTML = `<div class="col-span-full flex justify-center items-center h-full absolute inset-0"><div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent"></div></div>`;
            try {
                const response = await fetch(`${apiEndpoint}?get_category=${categoryId}`);
                if (!response.ok) throw new Error('Ağ yanıtı başarısız oldu.');
                const products = await response.json();
                currentProducts = products;
                menuContentEl.innerHTML = '';

                if (products.length === 0) {
                    menuContentEl.innerHTML = `<p class="col-span-full text-center text-gray-400 py-10">Bu kategoride ürün bulunamadı.</p>`;
                    return;
                }
                products.forEach((urun, index) => {
                    const menuItemHTML = `
                    <div class="menu-item-card rounded-lg opacity-0" style="transform: translateY(30px);" data-index="${index}">
                        <div class="w-full overflow-hidden rounded-t-lg">
                            <img src="images/${htmlspecialchars(urun.resim) || 'placeholder.png'}" alt="${htmlspecialchars(urun.isim)}" class="menu-item-card-img" onerror="this.onerror=null;this.src='https://placehold.co/400x400/333/D4AF37?text=Resim+Yok';">
                        </div>
                        <div class="p-3 sm:p-4">
                            <h3 class="text-sm sm:text-base font-semibold text-secondary truncate">${htmlspecialchars(urun.isim)}</h3>
                            <p class="text-accent font-bold text-base sm:text-lg mt-1">${formatPrice(urun.fiyat)}₺</p>
                        </div>
                    </div>`;
                    menuContentEl.insertAdjacentHTML('beforeend', menuItemHTML);
                });
                menuContentEl.querySelectorAll('.menu-item-card').forEach(card => card.addEventListener('click', () => openMenuModal(card.dataset.index)));
                gsap.to(menuContentEl.querySelectorAll('.menu-item-card'), { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' });
            } catch (error) {
                console.error('Fetch hatası:', error);
                menuContentEl.innerHTML = `<p class="col-span-full text-center text-red-500 py-10">Ürünler yüklenirken bir hata oluştu.</p>`;
            }
        };

        const openMenuModal = (index) => {
            const urun = currentProducts[index];
            if (!urun) return;
            menuModalPanel.innerHTML = `
                <button id="modal-close-btn" class="absolute top-4 right-4 text-2xl text-gray-400 hover:text-white transition-colors"><i class="fas fa-times"></i></button>
                <div class="grid md:grid-cols-2 gap-6 p-6">
                    <div class="w-full aspect-square rounded-lg overflow-hidden"><img src="images/${htmlspecialchars(urun.resim) || 'placeholder.png'}" alt="${htmlspecialchars(urun.isim)}" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='https://placehold.co/400x400/333/D4AF37?text=Resim+Yok';"></div>
                    <div class="flex flex-col justify-center text-center md:text-left">
                        <h2 class="text-2xl font-bold text-secondary">${htmlspecialchars(urun.isim)}</h2>
                        <p class="text-gray-400 mt-2 text-sm sm:text-base leading-relaxed">${htmlspecialchars(urun.aciklama) || 'Bu ürün için açıklama mevcut değil.'}</p>
                        <p class="text-accent font-bold text-3xl my-4">${formatPrice(urun.fiyat)}₺</p>
                        <button class="add-to-cart-btn w-full bg-secondary text-primary font-bold py-3 px-6 rounded-full hover:bg-accent transition-all duration-300 transform hover:scale-105" data-name="${htmlspecialchars(urun.isim)}" data-price="${urun.fiyat || 0}">Sepete Ekle</button>
                    </div>
                </div>`;
            menuModalOverlay.classList.remove('hidden');
            menuModalPanel.querySelector('.add-to-cart-btn').addEventListener('click', (e) => {
                const btn = e.currentTarget;
                cart.push({ name: btn.dataset.name, price: parseFloat(btn.dataset.price) });
                renderCart();
                menuModalOverlay.classList.add('hidden');
            });
            document.getElementById('modal-close-btn').addEventListener('click', () => menuModalOverlay.classList.add('hidden'));
        };
        
        menuModalOverlay.addEventListener('click', (e) => { if (e.target === menuModalOverlay) menuModalOverlay.classList.add('hidden'); });

        const initMenuTabs = () => {
            if (typeof kategorilerData === 'undefined' || kategorilerData.length === 0) return;
            kategorilerData.forEach((kat, i) => {
                const button = document.createElement('button');
                button.className = `menu-tab-btn text-sm sm:text-base font-semibold py-2 px-4 rounded-full transition-all duration-300 ${i === 0 ? 'bg-accent text-primary' : 'bg-transparent text-secondary border border-secondary/30 hover:bg-accent hover:text-primary hover:border-accent'}`;
                button.dataset.categoryId = kat.id;
                button.textContent = htmlspecialchars(kat.isim);
                button.addEventListener('click', () => {
                    document.querySelectorAll('.menu-tab-btn').forEach(b => {
                        b.classList.remove('bg-accent', 'text-primary');
                        b.classList.add('bg-transparent', 'text-secondary', 'border', 'border-secondary/30');
                    });
                    button.classList.add('bg-accent', 'text-primary');
                    button.classList.remove('bg-transparent', 'text-secondary', 'border', 'border-secondary/30');
                    fetchAndDisplayMenu(kat.id);
                });
                menuTabsEl.appendChild(button);
            });
            if (menuTabsEl.firstChild) menuTabsEl.firstChild.click();
        };

        const renderCart = () => {
            cartItemsEl.innerHTML = '';
            if (cart.length === 0) {
                cartItemsEl.innerHTML = '<li class="text-gray-500 text-center py-4">Sepetiniz boş.</li>';
                cartTotalEl.textContent = '0,00₺'; return;
            }
            let total = 0;
            cart.forEach((item, index) => {
                const li = document.createElement('li');
                li.className = 'flex justify-between items-center text-sm p-2 rounded-md bg-black/20';
                li.innerHTML = `<span class="font-medium flex-1 truncate pr-2">${htmlspecialchars(item.name)}</span><div class="flex items-center gap-3"><span>${formatPrice(item.price)}₺</span><button type="button" class="remove-from-cart-btn text-red-500 hover:text-red-400" data-index="${index}"><i class="fas fa-times"></i></button></div>`;
                cartItemsEl.appendChild(li);
                total += item.price;
            });
            cartTotalEl.textContent = `${formatPrice(total)}₺`;
            document.querySelectorAll('.remove-from-cart-btn').forEach(btn => btn.addEventListener('click', (e) => {
                cart.splice(e.currentTarget.dataset.index, 1);
                renderCart();
            }));
        };

        const initTables = () => {
            if (typeof masalarData === 'undefined' || masalarData.length === 0 || !tableLayoutEl) return;
            tableLayoutEl.innerHTML = '';
            masalarData.forEach(masa => {
                const classList = masa.durum === 'dolu' ? 'unavailable' : 'available';
                const tableDiv = document.createElement('div');
                tableDiv.className = `table p-2 rounded-lg text-center font-semibold text-xs sm:text-sm ${classList}`;
                tableDiv.dataset.tableId = masa.id;
                tableDiv.textContent = htmlspecialchars(masa.masa_adi);
                tableLayoutEl.appendChild(tableDiv);
            });
            tableLayoutEl.addEventListener('click', e => {
                const clickedEl = e.target.closest('.table');
                if (!clickedEl || clickedEl.classList.contains('unavailable')) return;
                const currentSelected = tableLayoutEl.querySelector('.selected');
                if (currentSelected) currentSelected.classList.remove('selected');
                if (selectedTable !== clickedEl) {
                    clickedEl.classList.add('selected');
                    selectedTable = clickedEl;
                } else {
                    selectedTable = null;
                }
            });
        };

        const initReservationForm = () => {
            const today = new Date().toISOString().split('T')[0];
            if (dateInput) { dateInput.setAttribute('min', today); dateInput.value = today; }
            if (reservationForm) {
                reservationForm.addEventListener('submit', e => {
                    if (!dateInput.value || !selectedTable) {
                        alert('Lütfen tarih ve masa seçin.');
                        e.preventDefault(); return;
                    }
                    document.getElementById('hidden-date').value = dateInput.value;
                    document.getElementById('hidden-time').value = document.getElementById('res-time').value;
                    document.getElementById('hidden-guests').value = document.getElementById('res-guests').value;
                    document.getElementById('hidden-table').value = selectedTable.textContent.trim();
                    document.getElementById('hidden-cart').value = cart.map(item => item.name).join(', ');
                });
            }
        };

        const initMobileMenu = () => {
            if (menuOpenBtn) menuOpenBtn.addEventListener('click', () => mobileMenu.classList.remove('hidden'));
            if (menuCloseBtn) menuCloseBtn.addEventListener('click', () => mobileMenu.classList.add('hidden'));
            navLinks.forEach(link => link.addEventListener('click', () => mobileMenu.classList.add('hidden')));
        };

        initAnimations();
        initMenuTabs();
        initTables();
        renderCart();
        initReservationForm();
        initMobileMenu();
    });
    </script>
</body>
</html>
