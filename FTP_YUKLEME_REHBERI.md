# 📁 FTP ile Frontend Yükleme Rehberi

## FileZilla ile Dosya Yükleme

### 1. FileZilla İndir (Ücretsiz)
https://filezilla-project.org/download.php?type=client

### 2. FTP Bilgilerini Bul

cPanel'e giremiyorsan, hosting sağlayıcının (MaxiCloud) sana verdiği:
- **FTP Host/Sunucu**: genellikle `ftp.decimus.maxicloud.online` veya `decimus.maxicloud.online`
- **Kullanıcı Adı**: cPanel kullanıcı adın
- **Şifre**: cPanel şifren
- **Port**: 21 (FTP) veya 22 (SFTP)

### 3. FileZilla'da Bağlan

1. FileZilla'yı aç
2. Üstteki bağlantı kutularına bilgileri gir:
   - **Host**: `ftp.decimus.maxicloud.online`
   - **Kullanıcı Adı**: (cPanel kullanıcı adın)
   - **Şifre**: (cPanel şifren)
   - **Port**: `21`
3. **Hızlı Bağlan** tıkla

### 4. Dosyaları Yükle

**Sol taraf** = Bilgisayarın
**Sağ taraf** = Sunucu

1. **Sağ tarafta** `public_html/` klasörüne git
2. **Sol tarafta** şu klasöre git:
   ```
   C:\Users\husey\OneDrive\Masaüstü\seyirteperestaurantcafe\frontend\dist
   ```
3. **Dist içindeki TÜM dosyaları seç** (index.html, assets klasörü vs.)
4. Sağ tıkla → **Yükle** (Upload)

### 5. Eski Dosyaları Silmeden Önce

Eğer `public_html/` içinde eski dosyalar varsa:
- Önce eski `index.html` ve `assets/` klasörünü sil
- Sonra yeni dosyaları yükle

---

## 🚀 Alternatif: VS Code ile SFTP

VS Code'da SFTP uzantısı ile de yapabilirsin (daha gelişmiş):

1. VS Code Extensions'da ara: **SFTP**
2. Yükle: "SFTP/FTP sync" uzantısı
3. Ayarla ve senkronize et

---

## ✅ Test Et

Dosyalar yüklenince:
```
https://decimus.maxicloud.online
```
veya
```
http://decimus.maxicloud.online
```

adresini aç ve test et!

---

## 📞 Hosting Desteği

Eğer FTP bilgilerin yoksa:
- MaxiCloud müşteri hizmetlerine mail at
- "FTP kullanıcı adı ve şifre" iste
- Veya cPanel'e alternatif giriş URL'i sor

---

## 🔐 Güvenlik

- FTP yerine SFTP kullan (daha güvenli)
- Port 22 kullan
- FileZilla'da şifreyi kaydetme (her seferinde yaz)
