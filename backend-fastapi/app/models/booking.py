import uuid
from sqlalchemy import Column, String, Integer, Date, Time, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base


class Booking(Base):
    """
    Reservasi dibuat Guide, diapprove Vendor.
    Tourist tidak punya akun — data turis dicatat sebagai teks.
    Status: pending_vendor → approved → completed / cancelled
    """
    __tablename__ = "bookings"

    id                      = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    booking_code            = Column(String(20), unique=True, nullable=False, index=True)
    guide_id                = Column(UUID(as_uuid=True), ForeignKey("guides.id", ondelete="RESTRICT"), nullable=False, index=True)
    vendor_id               = Column(UUID(as_uuid=True), ForeignKey("vendors.id", ondelete="RESTRICT"), nullable=False, index=True)
    product_id              = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    booking_date            = Column(Date, nullable=False)
    booking_time            = Column(Time, nullable=True)
    pax_count               = Column(Integer, default=1, nullable=False)
    tourist_names           = Column(Text, nullable=True)
    tourist_nationality     = Column(String(100), nullable=True)
    notes                   = Column(Text, nullable=True)
    status                  = Column(String(30), default="pending_vendor", nullable=False, index=True)
    vendor_approval_at      = Column(DateTime(timezone=True), nullable=True)
    vendor_rejection_reason = Column(Text, nullable=True)
    created_at              = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at              = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    guide                   = relationship("Guide", back_populates="bookings")
    vendor                  = relationship("Vendor", back_populates="bookings")
    product                 = relationship("Product", back_populates="bookings")
    transaction             = relationship("Transaction", back_populates="booking", uselist=False)
