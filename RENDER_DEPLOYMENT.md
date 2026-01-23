# 🚀 Render.com ile Backend Deployment (Ücretsiz)

## Backend: Render.com + Frontend: cPanel Çözümü

---

## 📋 Adım 1: GitHub'a Projeyi Yükle

### 1.1. GitHub Repository Oluştur

1. [GitHub](https://github.com) hesabına giriş yap
2. Sağ üstte **"+"** → **"New repository"**
3. Repository adı: `seyirtepe-restaurant`
4. **Public** seç (ücretsiz plan için)
5. **Create repository**

### 1.2. Projeyi GitHub'a Yükle

Terminal'de (VS Code):

```bash
# Git başlat (eğer yoksa)
git init

# Tüm dosyaları ekle
git add .

# Commit
git commit -m "Initial commit for deployment"

# GitHub'a bağla (KULLANICI_ADIN'i değiştir)
git remote add origin https://github.com/KULLANICI_ADIN/seyirtepe-restaurant.git

# Push
git branch -M main
git push -u origin main
```

**NOT:** Eğer git kurulu değilse:
- [Git İndir](https://git-scm.com/download/win)

---

## 🌐 Adım 2: Render.com'da Backend Kur

### 2.1. Render Hesabı Oluştur

1. [Render.com](https://render.com) git
2. **"Get Started for Free"** tıkla
3. **GitHub ile giriş yap** (önerilen)

### 2.2. PostgreSQL Veritabanı Oluştur

1. Dashboard'da **"New +"** → **"PostgreSQL"**
2. Ayarlar:
   - **Name**: `seyirtepe-db`
   - **Database**: `seyirtepe`
   - **User**: `seyirtepe_user` (otomatik)
   - **Region**: Frankfurt seç (Türkiye'ye yakın)
   - **Plan**: **Free** seç
3. **"Create Database"**
4. **Internal Database URL'i kopyala** (sonra lazım olacak)

### 2.3. Web Service Oluştur

1. Dashboard'da **"New +"** → **"Web Service"**
2. **"Build and deploy from a Git repository"** → **Next**
3. GitHub repo'nu seç: `seyirtepe-restaurant`
4. Ayarlar:
   - **Name**: `seyirtepe-api`
   - **Region**: Frankfurt
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: **Free**

5. **"Advanced"** → **Environment Variables** ekle:

```env
DATABASE_URL=<POSTGRES_INTERNAL_URL>
SECRET_KEY=super-gizli-anahtar-12345-değiştir
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_URL=https://decimus.maxicloud.online:2083
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=465
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=email-sifren
SMTP_FROM=noreply@yourdomain.com
# IMPORTANT: Use a persistent disk mount so uploads don't disappear after deploy/restart
UPLOAD_DIR=/var/data/uploads
```

**NOT:** `DATABASE_URL` için 2.2'de kopyaladığın URL'i yapıştır

6. **"Create Web Service"**

### 2.4. Deployment İzle

- Build süreci başlayacak (~2-3 dakika)
- Logs'u izle, hata varsa gösterir
- Başarılı olunca URL gelecek: `https://seyirtepe-api.onrender.com`

---

## 🔧 Adım 3: Frontend'i Güncelle

### 3.1. API URL'i Değiştir

```bash
# Terminal'de
cd frontend
```

`frontend/.env.production` dosyasını düzenle:

```env
VITE_API_URL=https://seyirtepe-api.onrender.com
```

**NOT:** Render'dan aldığın URL'i buraya yaz

### 3.2. Yeni Build Al

```bash
npm run build
```

### 3.3. cPanel'e Tekrar Yükle

1. **cPanel → File Manager → public_html**
2. Eski `index.html` ve `assets` klasörünü sil
3. Yeni `dist/` içeriğini yükle:
   - `dist/index.html` → `public_html/index.html`
   - `dist/assets/` → `public_html/assets/`

---

## 🗄️ Adım 4: Veritabanı Migration

### 4.1. Render Shell'e Bağlan

1. Render Dashboard → Web Service → **"Shell"** tab
2. Komutları çalıştır:

```bash
# Migration çalıştır (eğer alembic varsa)
alembic upgrade head

# Seed data yükle
python seed_data.py
```

---

## ✅ Adım 5: Test Et

### Backend Test:
```
https://seyirtepe-api.onrender.com/
https://seyirtepe-api.onrender.com/api/docs
```

### Frontend Test:
```
https://decimus.maxicloud.online:2083
```

---

## 🎯 Render.com Avantajları

✅ **Ücretsiz Plan:**
- 750 saat/ay (sürekli aktif kalabilir)
- PostgreSQL veritabanı dahil
- HTTPS otomatik (SSL)
- Otomatik deploy (git push ile)

⚠️ **Ücretsiz Plan Limitleri:**
- 15 dakika inaktivite sonrası uyur
- İlk istek 30-50 saniye sürebilir (uyanma)
- 512MB RAM

💡 **Çözüm:** Paid plan ($7/ay) ile sürekli aktif kalır

---

## 🔄 Güncellemeler Nasıl Yapılır?

```bash
# Kod değişikliği yap
# Git commit
git add .
git commit -m "Update feature X"
git push

# Render otomatik yeni versiyonu deploy eder!
```

---

## 🚨 Sorun Giderme

### 1. "Application failed to start"
- Render logs kontrol et
- `requirements.txt` doğru mu?
- Environment variables set edilmiş mi?

### 2. "Database connection error"
- `DATABASE_URL` doğru kopyalanmış mı?
- PostgreSQL servisi çalışıyor mu?

### 3. "CORS Error"
- `FRONTEND_URL` environment variable doğru mu?
- Frontend URL'i tam olarak yazıldı mı?

### 4. "502 Bad Gateway"
- Render servisi uyumuş olabilir (ilk istek)
- 30 saniye bekle, tekrar dene

---

## 💰 Maliyetsiz Alternatifler

### Railway.app
- 500 saat/ay ücretsiz
- Benzer kurulum

### PythonAnywhere
- Sınırlı ücretsiz plan
- Web framework desteği

### Heroku
- Ücretsiz plan kaldırıldı (artık ücretli)

---

## 📊 Final Yapı

```
┌─────────────────────────────────────┐
│  Frontend (cPanel)                  │
│  decimus.maxicloud.online:2083      │
│  - Static HTML/CSS/JS               │
└────────────┬────────────────────────┘
             │ API Calls
             ↓
┌─────────────────────────────────────┐
│  Backend (Render.com)               │
│  seyirtepe-api.onrender.com         │
│  - FastAPI Python App               │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│  Database (Render.com)              │
│  PostgreSQL                         │
└─────────────────────────────────────┘
```

---

## ✨ Tamamlandı!

Artık projen tamamen online! 🎉

- **Frontend**: cPanel (Static)
- **Backend**: Render.com (Python/FastAPI)
- **Database**: Render.com (PostgreSQL)
- **SSL**: Her ikisinde de otomatik

---

## 📞 Yardım

Render.com dokümantasyon:
- https://render.com/docs

Takıldığın yer olursa logs'u kontrol et!
