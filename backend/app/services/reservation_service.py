from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import timezone
from app.models.reservation import Reservation as ReservationModel
from app.schemas.reservation import ReservationCreate


class ReservationService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_reservation(self, reservation: ReservationCreate) -> ReservationModel:
        """Yeni rezervasyon oluştur"""
        # Pydantic v2: prefer model_dump (dict() is deprecated but may still exist)
        data = reservation.model_dump()
        # Email is optional in the public reservation flow.
        # Store None instead of empty string (cleaner for optional fields).
        if not data.get("customer_email") or not str(data.get("customer_email")).strip():
            data["customer_email"] = None

        # Normalize timezone-aware datetimes (e.g. ISO strings with 'Z') to naive UTC
        dt = data.get("date")
        if getattr(dt, "tzinfo", None) is not None and dt.tzinfo is not None:
            data["date"] = dt.astimezone(timezone.utc).replace(tzinfo=None)

        db_reservation = ReservationModel(**data)
        self.db.add(db_reservation)
        self.db.commit()
        self.db.refresh(db_reservation)
        return db_reservation
    
    def get_reservations(self, skip: int = 0, limit: int = 100) -> List[ReservationModel]:
        """Rezervasyonları listele"""
        return self.db.query(ReservationModel).offset(skip).limit(limit).all()
    
    def get_reservation_by_id(self, reservation_id: int) -> Optional[ReservationModel]:
        """ID'ye göre rezervasyon getir"""
        return self.db.query(ReservationModel).filter(ReservationModel.id == reservation_id).first()
