from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from pathlib import Path
import uuid
from pydantic import BaseModel
from app.database import get_db
from app.models.gallery import GalleryImage
from app.config import settings
from app.security import require_admin

router = APIRouter()


class GalleryImageCreate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    display_order: int = 0


class GalleryImageUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    display_order: Optional[int] = None


class GalleryImageResponse(BaseModel):
    id: int
    title: Optional[str]
    description: Optional[str]
    image_url: str
    thumbnail_url: Optional[str]
    category: Optional[str]
    display_order: int
    
    class Config:
        from_attributes = True


@router.get("/", response_model=List[GalleryImageResponse])
async def get_gallery_images(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Galeri resimlerini getir"""
    query = db.query(GalleryImage)
    if category:
        query = query.filter(GalleryImage.category == category)
    images = query.order_by(GalleryImage.display_order, GalleryImage.created_at.desc()).all()
    return images


@router.post("/upload-image")
async def upload_gallery_image(
    file: UploadFile = File(...),
    _: dict = Depends(require_admin),
):
    """Galeri görseli yükle"""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image files are allowed"
        )

    upload_dir = Path(settings.UPLOAD_DIR) / "gallery"
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
                    destination.unlink(missing_ok=True)
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File too large. Max size: {max_size / (1024*1024):.1f}MB"
                    )
                out.write(chunk)
    except HTTPException:
        raise
    except Exception as e:
        destination.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

    image_url = f"/uploads/gallery/{filename}"
    return {"image_url": image_url, "filename": filename}


@router.post("/", response_model=GalleryImageResponse, dependencies=[Depends(require_admin)])
async def create_gallery_image(
    image: GalleryImageCreate,
    image_url: str,
    db: Session = Depends(get_db)
):
    """Galeri resmi oluştur"""
    db_image = GalleryImage(
        title=image.title,
        description=image.description,
        image_url=image_url,
        category=image.category,
        display_order=image.display_order
    )
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    return db_image


@router.get("/{image_id}", response_model=GalleryImageResponse)
async def get_gallery_image(
    image_id: int,
    db: Session = Depends(get_db)
):
    """Galeri resmi detayı getir"""
    image = db.query(GalleryImage).filter(GalleryImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Gallery image not found")
    return image


@router.put("/{image_id}", response_model=GalleryImageResponse, dependencies=[Depends(require_admin)])
async def update_gallery_image(
    image_id: int,
    image: GalleryImageUpdate,
    db: Session = Depends(get_db)
):
    """Galeri resmi güncelle"""
    db_image = db.query(GalleryImage).filter(GalleryImage.id == image_id).first()
    if not db_image:
        raise HTTPException(status_code=404, detail="Gallery image not found")
    
    if image.title is not None:
        db_image.title = image.title
    if image.description is not None:
        db_image.description = image.description
    if image.category is not None:
        db_image.category = image.category
    if image.display_order is not None:
        db_image.display_order = image.display_order
    
    db.commit()
    db.refresh(db_image)
    return db_image


@router.delete("/{image_id}", dependencies=[Depends(require_admin)])
async def delete_gallery_image(
    image_id: int,
    db: Session = Depends(get_db)
):
    """Galeri resmi sil"""
    image = db.query(GalleryImage).filter(GalleryImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Gallery image not found")
    
    # Dosyayı da sil
    if image.image_url:
        file_path = Path("." + image.image_url)
        if file_path.exists():
            file_path.unlink()
    
    db.delete(image)
    db.commit()
    return {"message": "Gallery image deleted successfully"}
