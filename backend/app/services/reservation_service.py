from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.reservation import Reservation as ReservationModel
from app.schemas.reservation import ReservationCreate


class ReservationService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_reservation(self, reservation: ReservationCreate) -> ReservationModel:
        """Yeni rezervasyon oluştur"""
        data = reservation.dict()
        # Email is optional in the public reservation flow.
        # Keep DB compatibility by storing empty string when not provided.
        if not data.get("customer_email"):
            data["customer_email"] = ""

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
