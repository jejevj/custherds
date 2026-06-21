from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class Tourist(Base):
    __tablename__ = "tourists"

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    nationality  = Column(String)
    phone        = Column(String)
    photo_url    = Column(String)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    updated_at   = Column(DateTime(timezone=True), onupdate=func.now())

    user   = relationship("User", backref="tourist")
    orders = relationship("Order", back_populates="tourist")
