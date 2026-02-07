# Seyirtepe Restaurant Cafe - Frontend

React + Vite + Tailwind CSS ile geliştirilmiş modern restoran web sitesi.

## Özellikler

- ⚡ Vite - Hızlı geliştirme ortamı
- ⚛️ React 18 - Modern React
- 🎨 Tailwind CSS - Utility-first CSS
- 🎭 Framer Motion - Animasyonlar
- 🔍 React Router - Routing
- 📡 React Query - API state management
- 📝 React Hook Form - Form yönetimi
- 🎯 Lucide React - İkonlar
- 🖼️ React Parallax - Parallax efektleri

## Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Environment değişkenlerini ayarla
cp .env.example .env

# Geliştirme sunucusunu başlat
npm run dev

# Production build
npm run build

# Build önizleme
npm run preview
```

## Proje Yapısı

```
src/
├── components/       # React komponentleri
│   ├── layout/      # Layout komponentleri
│   ├── home/        # Ana sayfa komponentleri
│   ├── menu/        # Menü komponentleri
│   └── ui/          # Reusable UI komponentleri
├── pages/           # Sayfa komponentleri
├── hooks/           # Custom hooks
├── services/        # API servisleri
├── utils/           # Yardımcı fonksiyonlar
├── animations/      # Framer Motion konfigürasyonları
└── styles/          # Global stiller
```

## Teknolojiler

- React 18
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- React Query
- Axios
- Lucide React
- React Parallax

## Not

Hero bileşeninde parallax background için `/assets/images/parallax/amik-ovasi.jpg` dosyasını eklemeyi unutmayın.
Alternatif olarak video background kullanmak için Hero.jsx içindeki yorum satırlarını kaldırabilirsiniz.
