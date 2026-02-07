from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from pathlib import Path

from app.database import get_db
from app.schemas.site_settings import SiteSettingsResponse, SiteLogoUploadResponse
from app.security import require_admin
from app.services.site_settings_service import SiteSettingsService
from app.config import settings
from app.utils.cloudinary_upload import is_cloudinary_configured, upload_to_cloudinary, delete_from_cloudinary

router = APIRouter()


@router.get("/", response_model=SiteSettingsResponse)
def get_site_settings(db: Session = Depends(get_db)):
    service = SiteSettingsService(db)
    s = service.get_or_create()
    return SiteSettingsResponse(logo_url=s.logo_url)


@router.post("/logo", response_model=SiteLogoUploadResponse)
async def upload_site_logo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only image files are allowed")

    file_bytes = await file.read()
    await file.close()

    if len(file_bytes) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large (max {settings.MAX_UPLOAD_SIZE} bytes)",
        )

    service = SiteSettingsService(db)
    current = service.get_or_create()

    # Prefer Cloudinary (permanent)
    if is_cloudinary_configured():
        # Keep a stable public_id so uploading a new logo overwrites the old one
        public_id = "logo"
        result = upload_to_cloudinary(file_bytes, folder="site", public_id=public_id)
        if result and result.get("url"):
            s = service.set_logo(logo_url=result["url"], storage="cloudinary", public_id=result.get("public_id"))
            return SiteLogoUploadResponse(logo_url=s.logo_url, storage="cloudinary")

    # Fallback to local storage
    upload_dir = Path(settings.UPLOAD_DIR) / "site"
    upload_dir.mkdir(parents=True, exist_ok=True)

    # Determine extension safely
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

    filename = f"logo{suffix}"
    destination = upload_dir / filename

    try:
        with destination.open("wb") as out:
            out.write(file_bytes)
    except Exception:
        destination.unlink(missing_ok=True)
        raise

    s = service.set_logo(logo_url=f"/uploads/site/{filename}", storage="local", public_id=None)
    return SiteLogoUploadResponse(logo_url=s.logo_url, storage="local")


@router.delete("/logo", response_model=SiteSettingsResponse)
def delete_site_logo(
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    service = SiteSettingsService(db)
    current = service.get_or_create()

    # If it was stored in Cloudinary, best-effort delete
    if current.logo_storage == "cloudinary" and current.logo_public_id:
        try:
            delete_from_cloudinary(current.logo_public_id)
        except Exception:
            pass

    s = service.clear_logo()
    return SiteSettingsResponse(logo_url=s.logo_url)
