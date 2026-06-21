from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.base import Base


class OrderStatus(str, enum.Enum):
    pending   = "pending"
    confirmed = "confirmed"
    completed = "completed"
    cancelled = "cancelled"


class Order(Base):
    __tablename__ = "orders"

    id          = Column(Integer, primary_key=True, index=True)
    tourist_id  = Column(Integer, ForeignKey("tourists.id"), nullable=False)
    product_id  = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity    = Column(Integer, default=1)
    total_price = Column(Float, nullable=False)
    status      = Column(Enum(OrderStatus), default=OrderStatus.pending)
    notes       = Column(String)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), onupdate=func.now())

    tourist = relationship("Tourist", back_populates="orders")
    product = relationship("Product", back_populates="orders")
