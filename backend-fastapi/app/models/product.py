import uuid
from sqlalchemy import Column, String, Integer, Boolean, Numeric, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class Product(Base):
    """
    Produk/paket layanan yang didaftarkan vendor.
    Guide memilih produk ini saat membuat booking.
    """
    __tablename__ = "products"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    vendor_id   = Column(UUID(as_uuid=True), ForeignKey("vendors.id", ondelete="CASCADE"), nullable=False, index=True)
    name        = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    price       = Column(Numeric(15, 2), nullable=False)
    currency    = Column(String(10), default="IDR", nullable=False)
    min_pax     = Column(Integer, nullable=True)
    max_pax     = Column(Integer, nullable=True)
    images      = Column(Text, nullable=True)  # JSON array URL string
    is_active   = Column(Boolean, default=True, nullable=False)
    created_at  = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at  = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # relationships
    vendor      = relationship("Vendor", back_populates="products")
    bookings    = relationship("Booking", back_populates="product")
