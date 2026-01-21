from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import logging
from app.database import get_db
from app.schemas.reservation import Reservation, ReservationCreate
from app.services.reservation_service import ReservationService
from app.models.reservation import ReservationStatus
from app.security import require_admin

router = APIRouter()
logger = logging.getLogger(__name__)


class ReservationStatusUpdate(BaseModel):
    status: ReservationStatus


@router.post("/", response_model=Reservation)
def create_reservation(
    reservation: ReservationCreate,
    db: Session = Depends(get_db)
):
    """Yeni rezervasyon oluştur"""
    service = ReservationService(db)
    # Catch unexpected errors so we return a proper JSON response that still
    # passes through FastAPI/Starlette exception handling (avoids "CORS" masking
    # caused by raw 500 responses generated outside CORS middleware).
    try:
        return service.create_reservation(reservation)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to create reservation")
        raise HTTPException(status_code=500, detail="Reservation could not be created") from exc


@router.get("/", response_model=List[Reservation])
def get_reservations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """Rezervasyonları listele"""
    service = ReservationService(db)
    return service.get_reservations(skip, limit)


@router.get("/{reservation_id}", response_model=Reservation)
def get_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """Belirli bir rezervasyonu getir"""
    service = ReservationService(db)
    reservation = service.get_reservation_by_id(reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return reservation


@router.patch("/{reservation_id}", response_model=Reservation)
def update_reservation_status(
    reservation_id: int,
    status_update: ReservationStatusUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """Rezervasyon durumunu güncelle"""
    service = ReservationService(db)
    reservation = service.get_reservation_by_id(reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    reservation.status = status_update.status
    db.commit()
    db.refresh(reservation)
    return reservation
