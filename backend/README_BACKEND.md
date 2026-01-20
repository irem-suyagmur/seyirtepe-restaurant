# Seyirtepe Restaurant Cafe Backend - SQLite

FastAPI ile SQLite veritabanı kullanılarak geliştirilmiş restoran backend'i.

## Özellikler

✅ **Category (Kategori) Modeli**
- Kategori adı, açıklama, görsel URL
- Kategoriye ait ürünleri listeleme

✅ **Product (Ürün) Modeli**
- Ürün adı, açıklama, fiyat, görsel URL
- Kategoriye bağlı ürünler

✅ **CRUD İşlemleri**
- Category: Create, Read, Update, Delete
- Product: Create, Read, Update, Delete

✅ **API Endpoints**
- `GET /api/v1/categories` - Tüm kategorileri listele
- `GET /api/v1/categories/with-products` - Kategorileri ürünleriyle birlikte listele
- `GET /api/v1/categories/{id}` - Belirli kategoriyi getir
- `GET /api/v1/categories/{id}/with-products` - Kategoriyi ürünleriyle getir
- `POST /api/v1/categories` - Yeni kategori oluştur
- `PUT /api/v1/categories/{id}` - Kategori güncelle
- `DELETE /api/v1/categories/{id}` - Kategori sil
- `GET /api/v1/products` - Tüm ürünleri listele
- `GET /api/v1/products?category_id={id}` - Kategoriye göre ürünleri filtrele
- `GET /api/v1/products/{id}` - Belirli ürünü getir
- `POST /api/v1/products` - Yeni ürün oluştur
- `PUT /api/v1/products/{id}` - Ürün güncelle
- `DELETE /api/v1/products/{id}` - Ürün sil

## Kurulum

```bash
# Backend klasörüne gir
cd backend

# Virtual environment oluştur
python -m venv venv

# Virtual environment'ı aktif et (Windows)
venv\Scripts\activate

# Bağımlılıkları yükle
pip install -r requirements.txt

# Environment dosyasını oluştur
copy .env.example .env
```

## Kullanım

### 1. Sunucuyu Başlat

```bash
uvicorn app.main:app --reload
```

Sunucu `http://localhost:8000` adresinde çalışacak.

### 2. Veritabanına Örnek Veri Ekle

```bash
python seed_data.py
```

Bu komut şu örnek verileri ekler:
- 5 Kategori (Kahvaltı, Izgara, Ana Yemekler, İçecekler, Tatlılar)
- 16 Ürün (Her kategoriye ait örnek ürünler)

### 3. API Dokümantasyonu

API dokümantasyonuna erişim:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Veritabanı Modelleri

### Category (Kategori)
```python
{
    "id": 1,
    "name": "Kahvaltı",
    "description": "Sabah kahvaltı menümüz",
    "image_url": null,
    "display_order": 1
}
```

### Product (Ürün)
```python
{
    "id": 1,
    "name": "Serpme Kahvaltı",
    "description": "Zengin kahvaltı tabağı",
    "price": 150.0,
    "image_url": null,
    "category_id": 1,
    "display_order": 1
}
```

## API Kullanım Örnekleri

### Tüm Kategorileri Listele
```bash
curl http://localhost:8000/api/v1/categories
```

### Kategorileri Ürünleriyle Birlikte Getir
```bash
curl http://localhost:8000/api/v1/categories/with-products
```

### Belirli Kategorinin Ürünlerini Getir
```bash
curl http://localhost:8000/api/v1/products?category_id=1
```

### Yeni Kategori Oluştur
```bash
curl -X POST http://localhost:8000/api/v1/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Salatalar",
    "description": "Taze salata çeşitleri",
    "display_order": 6
  }'
```

### Yeni Ürün Oluştur
```bash
curl -X POST http://localhost:8000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Çoban Salata",
    "description": "Domates, salatalık, biber",
    "price": 45.0,
    "category_id": 1,
    "display_order": 1
  }'
```

## Proje Yapısı

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── categories.py     # Kategori endpoints
│   │       │   └── products.py       # Ürün endpoints
│   │       └── api.py
│   ├── models/
│   │   ├── category.py               # Kategori modeli
│   │   └── product.py                # Ürün modeli
│   ├── schemas/
│   │   ├── category.py               # Kategori Pydantic şemaları
│   │   └── product.py                # Ürün Pydantic şemaları
│   ├── services/
│   │   ├── category_service.py       # Kategori CRUD işlemleri
│   │   └── product_service.py        # Ürün CRUD işlemleri
│   ├── config.py                     # Konfigürasyon
│   ├── database.py                   # SQLite bağlantısı
│   └── main.py                       # FastAPI app
├── seed_data.py                      # Örnek veri ekleme scripti
├── requirements.txt
└── README_BACKEND.md
```

## Teknolojiler

- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM
- **SQLite** - Veritabanı
- **Pydantic** - Veri validasyonu
- **Uvicorn** - ASGI server

## Notlar

- SQLite veritabanı dosyası `seyirtepe.db` adıyla oluşturulacak
- Veritabanı tabloları otomatik oluşturulur
- CORS ayarları frontend için yapılandırılmış
- API dokümantasyonu otomatik oluşturulur
