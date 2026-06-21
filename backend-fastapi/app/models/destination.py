from sqlalchemy import Column, Integer, String, Text, Float, DateTime
from sqlalchemy.sql import func
from app.db.base import Base


class Destination(Base):
    __tablename__ = "destinations"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String, nullable=False)
    description = Column(Text)
    location    = Column(String)
    latitude    = Column(Float)
    longitude   = Column(Float)
    image_url   = Column(String)
    category    = Column(String)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), onupdate=func.now())
