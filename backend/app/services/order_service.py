from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.order import Order, OrderStatus
from app.schemas.order import OrderCreate


class OrderService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[Order]:
        """Tüm siparişleri getir"""
        return self.db.query(Order).order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    
    def get_by_id(self, order_id: int) -> Optional[Order]:
        """ID'ye göre sipariş getir"""
        return self.db.query(Order).filter(Order.id == order_id).first()
    
    def create(self, order: OrderCreate) -> Order:
        """Yeni sipariş oluştur"""
        db_order = Order(
            customer_name=order.customer_name,
            customer_phone=order.customer_phone,
            customer_address=order.customer_address,
            items=[item.dict() for item in order.items],
            total_amount=order.total_amount,
            notes=order.notes,
            status=OrderStatus.PENDING
        )
        self.db.add(db_order)
        self.db.commit()
        self.db.refresh(db_order)
        return db_order
    
    def update_status(self, order_id: int, status: OrderStatus) -> Optional[Order]:
        """Sipariş durumunu güncelle"""
        db_order = self.get_by_id(order_id)
        if not db_order:
            return None
        
        db_order.status = status
        self.db.commit()
        self.db.refresh(db_order)
        return db_order
    
    def delete(self, order_id: int) -> bool:
        """Sipariş sil"""
        db_order = self.get_by_id(order_id)
        if not db_order:
            return False
        
        self.db.delete(db_order)
        self.db.commit()
        return True
