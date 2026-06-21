from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class Vendor(Base):
    __tablename__ = "vendors"

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    business_name = Column(String, nullable=False)
    description  = Column(Text)
    address      = Column(String)
    phone        = Column(String)
    logo_url     = Column(String)
    is_approved  = Column(Boolean, default=False)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    updated_at   = Column(DateTime(timezone=True), onupdate=func.now())

    user     = relationship("User", backref="vendor")
    products = relationship("Product", back_populates="vendor")
