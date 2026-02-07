"""
Cloudinary upload utility for permanent cloud image storage.
Images uploaded here will NEVER be deleted on server restart/deploy.
"""
import cloudinary
import cloudinary.uploader
from app.config import settings


def is_cloudinary_configured() -> bool:
    """Check if Cloudinary credentials are set."""
    return bool(
        settings.CLOUDINARY_CLOUD_NAME
        and settings.CLOUDINARY_API_KEY
        and settings.CLOUDINARY_API_SECRET
    )


def configure_cloudinary():
    """Configure Cloudinary with credentials from settings."""
    if not is_cloudinary_configured():
        return False
    
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True
    )
    return True


def upload_to_cloudinary(file_bytes: bytes, folder: str = "products", public_id: str = None) -> dict:
    """
    Upload image bytes to Cloudinary.
    
    Args:
        file_bytes: Image file content as bytes
        folder: Cloudinary folder name (e.g., 'products', 'gallery')
        public_id: Optional custom public ID for the image
    
    Returns:
        dict with 'url' and 'public_id' keys, or None if failed
    """
    if not configure_cloudinary():
        return None
    
    try:
        upload_options = {
            "folder": f"seyirtepe/{folder}",
            "resource_type": "image",
            "overwrite": True,
            "transformation": [
                {"quality": "auto:good"},
                {"fetch_format": "auto"}
            ]
        }
        
        if public_id:
            upload_options["public_id"] = public_id
        
        result = cloudinary.uploader.upload(file_bytes, **upload_options)
        
        return {
            "url": result.get("secure_url"),
            "public_id": result.get("public_id")
        }
    except Exception as e:
        print(f"Cloudinary upload error: {e}")
        return None


def delete_from_cloudinary(public_id: str) -> bool:
    """Delete an image from Cloudinary by its public_id."""
    if not configure_cloudinary():
        return False
    
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result.get("result") == "ok"
    except Exception as e:
        print(f"Cloudinary delete error: {e}")
        return False
