from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base


class Guide(Base):
    __tablename__ = "guides"

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    bio          = Column(Text)
    languages    = Column(String)
    expertise    = Column(String)
    phone        = Column(String)
    photo_url    = Column(String)
    rating       = Column(Float, default=0.0)
    is_approved  = Column(Boolean, default=False)
    is_available = Column(Boolean, default=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    updated_at   = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", backref="guide")
