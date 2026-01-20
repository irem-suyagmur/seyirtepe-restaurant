"""
Veritabanına örnek veri eklemek için script
"""
from app.database import SessionLocal, init_db
from app.models.category import Category
from app.models.product import Product


def seed_database():
    """Veritabanına örnek kategoriler ve ürünler ekle"""
    
    # Veritabanını başlat
    init_db()
    
    db = SessionLocal()
    
    try:
        # Mevcut verileri kontrol et
        existing_categories = db.query(Category).count()
        if existing_categories > 0:
            print("Veritabanında zaten veri var. İşlem iptal edildi.")
            return
        
        # Kategoriler
        categories_data = [
            {
                "name": "Kahvaltı",
                "description": "Sabah kahvaltı menümüz",
                "display_order": 1
            },
            {
                "name": "Izgara",
                "description": "Özel ızgara çeşitlerimiz",
                "display_order": 2
            },
            {
                "name": "Ana Yemekler",
                "description": "Geleneksel ve modern ana yemekler",
                "display_order": 3
            },
            {
                "name": "İçecekler",
                "description": "Sıcak ve soğuk içecekler",
                "display_order": 4
            },
            {
                "name": "Tatlılar",
                "description": "Özel tatlı çeşitlerimiz",
                "display_order": 5
            }
        ]
        
        categories = []
        for cat_data in categories_data:
            category = Category(**cat_data)
            db.add(category)
            categories.append(category)
        
        db.commit()
        
        # Kategorileri refresh et (id'leri almak için)
        for category in categories:
            db.refresh(category)
        
        # Ürünler
        products_data = [
            # Kahvaltı
            {"name": "Serpme Kahvaltı", "description": "Zengin kahvaltı tabağı", "price": 150.0, "category_id": categories[0].id, "display_order": 1},
            {"name": "Menemen", "description": "Domates, biber, yumurta", "price": 75.0, "category_id": categories[0].id, "display_order": 2},
            {"name": "Sucuklu Yumurta", "description": "Fermente sucuk ve yumurta", "price": 85.0, "category_id": categories[0].id, "display_order": 3},
            
            # Izgara
            {"name": "Kuzu Pirzola", "description": "Özel soslu kuzu pirzola", "price": 350.0, "category_id": categories[1].id, "display_order": 1},
            {"name": "Bonfile", "description": "200gr bonfile", "price": 400.0, "category_id": categories[1].id, "display_order": 2},
            {"name": "Tavuk Şiş", "description": "Marine edilmiş tavuk", "price": 180.0, "category_id": categories[1].id, "display_order": 3},
            
            # Ana Yemekler
            {"name": "İskender Kebap", "description": "Yoğurt ve tereyağlı", "price": 220.0, "category_id": categories[2].id, "display_order": 1},
            {"name": "Hünkar Beğendi", "description": "Patlıcan püresi üzerine kuzu", "price": 280.0, "category_id": categories[2].id, "display_order": 2},
            {"name": "Mantı", "description": "Ev yapımı mantı", "price": 120.0, "category_id": categories[2].id, "display_order": 3},
            
            # İçecekler
            {"name": "Türk Kahvesi", "description": "Geleneksel türk kahvesi", "price": 35.0, "category_id": categories[3].id, "display_order": 1},
            {"name": "Çay", "description": "Demleme çay", "price": 15.0, "category_id": categories[3].id, "display_order": 2},
            {"name": "Limonata", "description": "Taze sıkılmış limonata", "price": 50.0, "category_id": categories[3].id, "display_order": 3},
            {"name": "Ayran", "description": "Köpüklü ayran", "price": 25.0, "category_id": categories[3].id, "display_order": 4},
            
            # Tatlılar
            {"name": "Künefe", "description": "Antep fıstıklı künefe", "price": 95.0, "category_id": categories[4].id, "display_order": 1},
            {"name": "Baklava", "description": "Fıstıklı baklava", "price": 85.0, "category_id": categories[4].id, "display_order": 2},
            {"name": "Sütlaç", "description": "Fırın sütlaç", "price": 65.0, "category_id": categories[4].id, "display_order": 3},
        ]
        
        for prod_data in products_data:
            product = Product(**prod_data)
            db.add(product)
        
        db.commit()
        
        print("✅ Veritabanı başarıyla dolduruldu!")
        print(f"- {len(categories)} kategori eklendi")
        print(f"- {len(products_data)} ürün eklendi")
        
    except Exception as e:
        print(f"❌ Hata oluştu: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
