import uuid
from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class Destination(Base):
    """
    Data destinasi wisata, bisa dikaitkan ke vendor atau berdiri sendiri.
    """
    __tablename__ = "destinations"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    vendor_id   = Column(UUID(as_uuid=True), ForeignKey("vendors.id", ondelete="SET NULL"), nullable=True, index=True)
    name        = Column(String(255), nullable=False)
    area_id     = Column(Integer, nullable=False)   # 1-21 sesuai referensi area
    description = Column(Text, nullable=True)
    images      = Column(Text, nullable=True)        # JSON array URL
    is_active   = Column(Boolean, default=True, nullable=False)
    created_at  = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at  = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # relationships
    vendor      = relationship("Vendor", back_populates="destinations")
