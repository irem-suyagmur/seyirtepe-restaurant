from fastapi import APIRouter
from app.api.v1.endpoints import categories, products, reservations, gallery, contact, reviews, orders

api_router = APIRouter()

api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(reservations.router, prefix="/reservations", tags=["reservations"])
api_router.include_router(gallery.router, prefix="/gallery", tags=["gallery"])
api_router.include_router(contact.router, prefix="/contact", tags=["contact"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
