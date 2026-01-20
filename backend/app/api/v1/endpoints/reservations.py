from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.database import get_db
from app.schemas.reservation import Reservation, ReservationCreate
from app.services.reservation_service import ReservationService
from app.models.reservation import ReservationStatus

router = APIRouter()


class ReservationStatusUpdate(BaseModel):
    status: ReservationStatus


@router.post("/", response_model=Reservation)
def create_reservation(
    reservation: ReservationCreate,
    db: Session = Depends(get_db)
):
    """Yeni rezervasyon oluştur"""
    service = ReservationService(db)
    return service.create_reservation(reservation)


@router.get("/", response_model=List[Reservation])
def get_reservations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Rezervasyonları listele"""
    service = ReservationService(db)
    return service.get_reservations(skip, limit)


@router.get("/{reservation_id}", response_model=Reservation)
def get_reservation(
    reservation_id: int,
    db: Session = Depends(get_db)
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
    db: Session = Depends(get_db)
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
