# cPanel Deployment Rehberi

## 🚀 Seyirtepe Restaurant Cafe - cPanel'e Yükleme Kılavuzu

Bu proje hem **Backend (FastAPI/Python)** hem de **Frontend (React)** içerir. cPanel'e yükleme adımları:

---

## 📋 Gereksinimler

1. **cPanel Hesabı** (Shared hosting veya VPS)
2. **Python desteği** (cPanel'de Python App veya Passenger)
3. **Node.js desteği** (Build işlemi için)
4. **PostgreSQL veya MySQL** veritabanı
5. **FTP/SSH erişimi**

---

## 🔧 Adım 1: Frontend Build Alma

Frontend'i production için hazırlayalım:

```bash
# Frontend klasörüne git
cd frontend

# Bağımlılıkları yükle
npm install

# Production build al
npm run build
```

Bu komut `frontend/dist` klasörü oluşturacak. Bu klasördeki dosyalar static web siten olacak.

---

## 🗄️ Adım 2: Veritabanı Kurulumu

### cPanel'de Veritabanı Oluşturma:

1. **cPanel → MySQL Databases** veya **PostgreSQL Databases**
2. Yeni veritabanı oluştur: `seyirtepe_db`
3. Veritabanı kullanıcısı oluştur
4. Kullanıcıya veritabanı için tüm izinleri ver
5. Bağlantı bilgilerini kaydet:
   - Host: `localhost` veya hosting sağlayıcınızın verdiği host
   - Database: `seyirtepe_db`
   - Username: oluşturduğunuz kullanıcı
   - Password: oluşturduğunuz şifre

---

## 📤 Adım 3: Dosyaları cPanel'e Yükleme

### Option A: FileManager ile Manuel Yükleme

1. **cPanel → File Manager**
2. `public_html` klasörüne git (veya subdomain kullanıyorsan ilgili klasöre)

**Frontend dosyalarını yükle:**
- `frontend/dist` içindeki TÜM dosyaları `public_html` içine kopyala
- İçerik: `index.html`, `assets/` klasörü, vb.

**Backend için klasör oluştur:**
- `public_html` dışında (örn: `~/backend_app`) bir klasör oluştur
- `backend` klasöründeki tüm dosyaları bu klasöre yükle

### Option B: FTP/SFTP ile Yükleme

FileZilla veya benzeri FTP programı ile:
- `frontend/dist/*` → `public_html/`
- `backend/*` → `~/backend_app/` veya `~/python_apps/seyirtepe/`

---

## 🐍 Adım 4: Python Backend Kurulumu

### cPanel'de Python App Kurulumu:

1. **cPanel → Setup Python App** (veya "Python Selector")
2. **Create Application** butonuna tıkla
3. Ayarları yapılandır:
   - **Python Version**: 3.9 veya üzeri
   - **Application Root**: `backend_app` (yüklediğin backend klasörü)
   - **Application URL**: `/api` veya alt domain (örn: `api.seyirtepe.com`)
   - **Application Startup File**: `app/main.py`
   - **Application Entry Point**: `app`

4. **Create** butonuna tıkla

### requirements.txt Yükleme:

Python App oluşturduktan sonra:

1. SSH ile bağlan veya cPanel Terminal'i aç
2. Virtual environment'ı aktive et:
```bash
cd ~/backend_app
source /home/USERNAME/virtualenv/backend_app/3.x/bin/activate
```

3. Bağımlılıkları yükle:
```bash
pip install -r requirements.txt
```

### Environment Variables (.env dosyası):

`~/backend_app` klasöründe `.env` dosyası oluştur:

```env
# Veritabanı
DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost/seyirtepe_db
# veya MySQL kullanıyorsan:
# DATABASE_URL=mysql+pymysql://USERNAME:PASSWORD@localhost/seyirtepe_db

# JWT Secret
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
FRONTEND_URL=https://yourdomain.com

# Email (SMTP)
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=465
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=your-email-password
SMTP_FROM=noreply@yourdomain.com

# Upload
UPLOAD_DIR=/home/USERNAME/backend_app/uploads
```

### Veritabanı Migration:

```bash
# Backend klasöründe
cd ~/backend_app

# Alembic ile migration (eğer varsa)
alembic upgrade head

# Veya seed data çalıştır
python seed_data.py
```

---

## 🔄 Adım 5: .htaccess Yapılandırması

### Frontend için (public_html/.htaccess):

React Router için SPA routing'i etkinleştir:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # API isteklerini backend'e yönlendir
  RewriteCond %{REQUEST_URI} ^/api/(.*)$
  RewriteRule ^api/(.*)$ http://localhost:PYTHON_APP_PORT/api/$1 [P,L]
  
  # Frontend routing
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Dosya yükleme limiti
php_value upload_max_filesize 20M
php_value post_max_size 20M

# Gzip sıkıştırma
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache control
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

**NOT:** `PYTHON_APP_PORT` yerine cPanel'in verdiği Python App portunu yaz (örn: 5000)

---

## 🌐 Adım 6: API URL Yapılandırması

Frontend build'inden önce API URL'i güncelle:

### frontend/.env veya frontend/.env.production:

```env
VITE_API_URL=https://yourdomain.com/api
# veya alt domain kullanıyorsan:
# VITE_API_URL=https://api.yourdomain.com
```

Sonra tekrar build al:
```bash
cd frontend
npm run build
```

Ve yeni dist dosyalarını tekrar yükle.

---

## 📂 Adım 7: Uploads Klasörü İzinleri

Resim yüklemeleri için:

```bash
# SSH veya Terminal'de
cd ~/backend_app
mkdir -p uploads/products
chmod 755 uploads
chmod 755 uploads/products
```

---

## 🔍 Adım 8: Test ve Hata Giderme

### Backend Test:
```bash
curl https://yourdomain.com/api/
curl https://yourdomain.com/api/docs
```

### Frontend Test:
Tarayıcıda `https://yourdomain.com` aç

### Log Kontrol:
- **cPanel → Errors** log'larını kontrol et
- Python App logs: `~/backend_app/logs/` (eğer varsa)
- SSH ile: `tail -f ~/logs/stderr.log`

---

## 🚨 Yaygın Sorunlar ve Çözümler

### 1. "502 Bad Gateway" Hatası
- Python App'in çalıştığından emin ol
- Port numarasını kontrol et
- Error log'larına bak

### 2. "CORS Error"
- Backend `.env` dosyasında `FRONTEND_URL` doğru olmalı
- FastAPI'de CORS middleware ayarlarını kontrol et

### 3. "Database Connection Error"
- `.env` dosyasındaki DATABASE_URL doğru mu?
- Veritabanı kullanıcısının izinleri var mı?
- Host adresi doğru mu? (localhost veya IP)

### 4. "404 on Page Refresh"
- `.htaccess` dosyası doğru yapılandırılmış mı?
- `mod_rewrite` aktif mi?

### 5. "Images Not Loading"
- `uploads` klasörü izinleri 755 mi?
- Path'ler doğru mu?
- Backend'de UPLOAD_DIR doğru ayarlanmış mı?

---

## ⚡ Performans İyileştirmeleri

1. **Gzip Sıkıştırma**: `.htaccess`'te zaten var
2. **CDN Kullanımı**: Cloudflare gibi ücretsiz CDN
3. **Image Optimization**: Yüklemeden önce resimleri sıkıştır
4. **Caching**: Browser caching ve server-side caching
5. **Database Indexes**: Sık sorgulanan kolonlara index ekle

---

## 🔒 Güvenlik Önerileri

1. ✅ `.env` dosyasını `.gitignore`'a ekle
2. ✅ SECRET_KEY'i güçlü ve unique yap
3. ✅ HTTPS kullan (Let's Encrypt SSL - cPanel'de ücretsiz)
4. ✅ Veritabanı kullanıcısına sadece gerekli izinleri ver
5. ✅ CORS ayarlarını production için daralt
6. ✅ Rate limiting ekle (API abuse önleme)
7. ✅ Input validation'ı her zaman yap

---

## 📝 Alternatif: Subdomain Kullanımı

Daha profesyonel bir yapı için:

1. **Frontend**: `https://seyirtepe.com` (public_html)
2. **Backend API**: `https://api.seyirtepe.com` (subdomain)

### Subdomain Oluşturma:
1. **cPanel → Subdomains**
2. `api` subdomain'i oluştur
3. Document root: `/home/USERNAME/api_subdomain` (veya Python App dizini)
4. Python App'i bu subdomain için yapılandır

---

## 🆘 Destek

Sorun yaşarsan:
1. cPanel error log'larını kontrol et
2. Browser console'u kontrol et (F12)
3. Network tab'de API isteklerini incele
4. Hosting sağlayıcının desteğine sor

---

## 📚 Faydalı Komutlar

```bash
# Python App yeniden başlat (cPanel'de)
# Setup Python App → Restart butonu

# Logs kontrol
tail -f ~/logs/stderr.log
tail -f ~/backend_app/logs/app.log

# Veritabanı bağlantı testi
python -c "from app.database import engine; print('DB OK')"

# Pip paketlerini listele
pip list

# Virtual env aktive et
source ~/virtualenv/backend_app/3.x/bin/activate
```

---

## ✅ Deployment Checklist

- [ ] Frontend build alındı
- [ ] Veritabanı oluşturuldu
- [ ] Backend dosyaları yüklendi
- [ ] Frontend dosyaları yüklendi
- [ ] Python App yapılandırıldı
- [ ] requirements.txt yüklendi
- [ ] .env dosyası oluşturuldu ve yapılandırıldı
- [ ] Veritabanı migration çalıştırıldı
- [ ] .htaccess dosyası oluşturuldu
- [ ] uploads klasörü izinleri ayarlandı
- [ ] SSL sertifikası aktif
- [ ] Frontend'de API URL güncellendi
- [ ] Test edildi (frontend + backend)
- [ ] Error log'ları temiz

---

## 🎉 Başarılar!

Artık projen cPanel'de live! 🚀

**Website**: https://yourdomain.com
**API Docs**: https://yourdomain.com/api/docs
**Admin Panel**: https://yourdomain.com/admin
