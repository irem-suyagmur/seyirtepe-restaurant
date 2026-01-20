# Seyirtepe Restaurant Cafe

Modern ve lüks restoran web sitesi - Amik Ovası manzarasında benzersiz deneyim

## Proje Özeti

Bu proje, **FastAPI** backend ve **React + Tailwind CSS** frontend kullanılarak geliştirilmiş modern bir restoran web sitesidir. Ana özellik, arka planda Amik Ovası manzarasının parallax veya video background olarak gösterilmesidir.

## Teknoloji Stack

### Backend
- FastAPI
- SQLAlchemy (Async)
- PostgreSQL
- Pydantic
- Alembic

### Frontend
- React 18
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React
- React Parallax
- React Query

## Kurulum

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
cp .env.example .env
# .env dosyasını düzenle
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# .env dosyasını düzenle
npm run dev
```

## Özellikler

- 🎨 Modern ve lüks tasarım
- 🖼️ Parallax/Video background
- ✨ Framer Motion animasyonları
- 📱 Responsive tasarım
- 🍽️ Menü yönetimi
- 📅 Rezervasyon sistemi
- 📧 İletişim formu
- 🖼️ Galeri
- ⚡ Hızlı ve optimize

## Geliştirme Aşamaları

✅ Proje yapısı oluşturuldu
✅ Backend API endpoints
✅ Frontend routing ve layout
✅ Parallax hero bileşeni
⏳ Menü sistemi
⏳ Rezervasyon formu
⏳ Galeri
⏳ İletişim formu

## Lisans

Tüm hakları saklıdır © 2026 Seyirtepe Restaurant Cafe
