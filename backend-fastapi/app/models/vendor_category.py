import uuid
from sqlalchemy import Column, String, Integer, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base


class VendorCategory(Base):
    """
    Referensi kategori vendor.

    group_name: pengelompokan kategori (Stay, Eat & Drink, Wellness, Shopping,
                Activities, Transport, Events, Business & Services)
    sort_order: urutan tampil di UI (ascending)
    is_active:  False = kategori disembunyikan dari pilihan registrasi & filter
    """
    __tablename__ = "vendor_categories"

    id          = Column(Integer, primary_key=True, autoincrement=True, index=True)
    name        = Column(String(100), nullable=False, unique=True)
    group_name  = Column(String(100), nullable=False)
    sort_order  = Column(Integer, nullable=False, default=0)
    is_active   = Column(Boolean, nullable=False, default=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at  = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    vendors     = relationship("Vendor", primaryjoin="foreign(Vendor.vendor_category) == VendorCategory.id", viewonly=True)
