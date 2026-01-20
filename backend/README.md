# Seyirtepe Restaurant Cafe - Backend

FastAPI tabanlı modern restoran yönetim sistemi backend'i.

## Kurulum

```bash
# Virtual environment oluştur
python -m venv venv

# Virtual environment'ı aktif et
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Bağımlılıkları yükle
pip install -r requirements.txt

# Environment değişkenlerini ayarla
cp .env.example .env
# .env dosyasını düzenle

# Database migration
alembic upgrade head

# Sunucuyu çalıştır
uvicorn app.main:app --reload
```

## API Endpoints

- **GET** `/` - API bilgisi
- **GET** `/health` - Health check
- **GET** `/docs` - Swagger API dokümantasyonu
- **GET** `/api/v1/menu` - Menü listesi
- **POST** `/api/v1/reservations` - Yeni rezervasyon
- **POST** `/api/v1/contact` - İletişim formu

## Teknolojiler

- FastAPI
- SQLAlchemy (Async)
- PostgreSQL
- Pydantic
- Alembic
