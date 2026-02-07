from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database import get_db
from app.schemas.category import Category, CategoryCreate, CategoryUpdate
from app.schemas.combined import CategoryWithProducts
from app.services.category_service import CategoryService
from app.models.category import Category as CategoryModel
from app.security import require_admin

router = APIRouter()


@router.get("/", response_model=List[Category])
def get_categories(db: Session = Depends(get_db)):
    """Tüm kategorileri listele"""
    service = CategoryService(db)
    categories = service.get_all()
    return categories


@router.get("/with-products", response_model=List[CategoryWithProducts])
def get_categories_with_products(db: Session = Depends(get_db)):
    """Tüm kategorileri ürünleriyle birlikte listele"""
    categories = (
        db.query(CategoryModel)
        .options(joinedload(CategoryModel.products))
        .order_by(CategoryModel.display_order)
        .all()
    )
    return categories


@router.get("/{category_id}", response_model=Category)
def get_category(category_id: int, db: Session = Depends(get_db)):
    """Belirli bir kategoriyi getir"""
    service = CategoryService(db)
    category = service.get_by_id(category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id {category_id} not found"
        )
    return category


@router.get("/{category_id}/with-products", response_model=CategoryWithProducts)
def get_category_with_products(category_id: int, db: Session = Depends(get_db)):
    """Belirli bir kategoriyi ürünleriyle birlikte getir"""
    category = (
        db.query(CategoryModel)
        .options(joinedload(CategoryModel.products))
        .filter(CategoryModel.id == category_id)
        .first()
    )
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id {category_id} not found"
        )
    return category


@router.post("/", response_model=Category, status_code=status.HTTP_201_CREATED)
def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """Yeni kategori oluştur"""
    service = CategoryService(db)
    
    # Aynı isimde kategori var mı kontrol et
    existing = service.get_by_name(category.name)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category with name '{category.name}' already exists"
        )
    
    return service.create(category)


@router.put("/{category_id}", response_model=Category)
def update_category(
    category_id: int,
    category_update: CategoryUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """Kategori güncelle"""
    service = CategoryService(db)
    updated_category = service.update(category_id, category_update)
    if not updated_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id {category_id} not found"
        )
    return updated_category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """Kategori sil"""
    service = CategoryService(db)
    success = service.delete(category_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id {category_id} not found"
        )
    return None
