from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from pathlib import Path
import uuid
from app.database import get_db
from app.schemas.product import Product, ProductCreate, ProductUpdate, ProductWithCategory
from app.services.product_service import ProductService
from app.services.category_service import CategoryService
from app.config import settings
from app.security import require_admin

router = APIRouter()


@router.post("/upload-image")
async def upload_product_image(
    file: UploadFile = File(...),
    _: dict = Depends(require_admin),
):
    """Ürün görseli yükle ve erişilebilir URL döndür."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image files are allowed"
        )

    upload_dir = Path(settings.UPLOAD_DIR) / "products"
    upload_dir.mkdir(parents=True, exist_ok=True)

    original_suffix = Path(file.filename or "").suffix.lower()
    content_type_to_ext = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
    }
    suffix = original_suffix if original_suffix in {".jpg", ".jpeg", ".png", ".webp", ".gif"} else content_type_to_ext.get(file.content_type, ".jpg")
    if suffix == ".jpeg":
        suffix = ".jpg"

    filename = f"{uuid.uuid4().hex}{suffix}"
    destination = upload_dir / filename

    max_size = settings.MAX_UPLOAD_SIZE
    total = 0
    try:
        with destination.open("wb") as out:
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break
                total += len(chunk)
                if total > max_size:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File too large (max {max_size} bytes)"
                    )
                out.write(chunk)
    except HTTPException:
        destination.unlink(missing_ok=True)
        raise
    except Exception:
        destination.unlink(missing_ok=True)
        raise
    finally:
        await file.close()

    return {
        "url": f"/uploads/products/{filename}",
        "filename": filename,
    }


@router.get("/", response_model=List[Product])
def get_products(
    category_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Tüm ürünleri listele
    - category_id parametresi ile belirli bir kategorinin ürünlerini filtreleyebilirsiniz
    """
    service = ProductService(db)
    
    if category_id:
        products = service.get_by_category(category_id)
    else:
        products = service.get_all()
    
    return products


@router.get("/{product_id}", response_model=ProductWithCategory)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Belirli bir ürünü kategori bilgisiyle birlikte getir"""
    service = ProductService(db)
    product = service.get_by_id(product_id, with_category=True)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {product_id} not found"
        )
    return product


@router.post("/", response_model=Product, status_code=status.HTTP_201_CREATED)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """Yeni ürün oluştur"""
    # Kategori var mı kontrol et
    category_service = CategoryService(db)
    category = category_service.get_by_id(product.category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id {product.category_id} not found"
        )
    
    service = ProductService(db)
    return service.create(product)


@router.put("/{product_id}", response_model=Product)
def update_product(
    product_id: int,
    product_update: ProductUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """Ürün güncelle"""
    # Eğer category_id güncelleniyorsa, kategori var mı kontrol et
    if product_update.category_id:
        category_service = CategoryService(db)
        category = category_service.get_by_id(product_update.category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Category with id {product_update.category_id} not found"
            )
    
    service = ProductService(db)
    updated_product = service.update(product_id, product_update)
    if not updated_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {product_id} not found"
        )
    return updated_product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """Ürün sil"""
    service = ProductService(db)
    success = service.delete(product_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {product_id} not found"
        )
    return None
