from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class Product(Base):
    __tablename__ = "products"

    id          = Column(Integer, primary_key=True, index=True)
    vendor_id   = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    name        = Column(String, nullable=False)
    description = Column(Text)
    price       = Column(Float, nullable=False)
    image_url   = Column(String)
    category    = Column(String)
    stock       = Column(Integer, default=0)
    is_active   = Column(Boolean, default=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), onupdate=func.now())

    vendor = relationship("Vendor", back_populates="products")
    orders = relationship("Order", back_populates="product")
