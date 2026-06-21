from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base


class Review(Base):
    __tablename__ = "reviews"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_id   = Column(Integer, nullable=False)
    target_type = Column(String, nullable=False)
    rating      = Column(Float, nullable=False)
    comment     = Column(Text)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="reviews")
