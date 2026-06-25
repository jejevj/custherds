import uuid
from sqlalchemy import Column, String, Integer, Float, Numeric, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base


class Vendor(Base):
    __tablename__ = "vendors"

    id                          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id                     = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    vendor_business_name        = Column(String(255), nullable=False)
    vendor_category             = Column(Integer, nullable=False)
    vendor_area                 = Column(Integer, nullable=False)
    vendor_location             = Column(Text, nullable=True)
    vendor_contact_person       = Column(String(255), nullable=True)
    vendor_website              = Column(String(255), nullable=True)
    vendor_short_description    = Column(Text, nullable=True)
    vendor_opening_hours        = Column(String(255), nullable=True)
    vendor_min_spend            = Column(Numeric(15, 2), nullable=True)
    vendor_cashback_percent     = Column(Float, nullable=False)
    vendor_know_from            = Column(Text, nullable=True)
    vendor_status               = Column(String(20), default="pending", nullable=False)
    approval_notes              = Column(Text, nullable=True)
    created_at                  = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at                  = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user                        = relationship("User", back_populates="vendor")
    products                    = relationship("Product", back_populates="vendor")
    bookings                    = relationship("Booking", back_populates="vendor")
    transactions                = relationship("Transaction", back_populates="vendor")
    destinations                = relationship("Destination", back_populates="vendor")
