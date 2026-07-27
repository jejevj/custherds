from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base


class VendorAreaKabupaten(Base):
    """
    Level 1: Kabupaten / Kota.
    Contoh: Kota Yogyakarta, Kabupaten Sleman, Kabupaten Bantul.
    """
    __tablename__ = "vendor_area_kabupaten"

    id          = Column(Integer, primary_key=True, autoincrement=True, index=True)
    name        = Column(String(150), nullable=False, unique=True)
    sort_order  = Column(Integer, nullable=False, default=0)
    is_active   = Column(Boolean, nullable=False, default=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at  = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    kecamatans  = relationship("VendorAreaKecamatan", back_populates="kabupaten", cascade="all, delete-orphan")


class VendorAreaKecamatan(Base):
    """
    Level 2: Kecamatan — child dari Kabupaten/Kota.
    """
    __tablename__ = "vendor_area_kecamatan"

    id              = Column(Integer, primary_key=True, autoincrement=True, index=True)
    kabupaten_id    = Column(Integer, ForeignKey("vendor_area_kabupaten.id", ondelete="CASCADE"), nullable=False, index=True)
    name            = Column(String(150), nullable=False)
    sort_order      = Column(Integer, nullable=False, default=0)
    is_active       = Column(Boolean, nullable=False, default=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at      = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    kabupaten       = relationship("VendorAreaKabupaten", back_populates="kecamatans")
    kelurahans      = relationship("VendorAreaKelurahan", back_populates="kecamatan", cascade="all, delete-orphan")


class VendorAreaKelurahan(Base):
    """
    Level 3: Kelurahan / Desa — child dari Kecamatan.
    """
    __tablename__ = "vendor_area_kelurahan"

    id              = Column(Integer, primary_key=True, autoincrement=True, index=True)
    kecamatan_id    = Column(Integer, ForeignKey("vendor_area_kecamatan.id", ondelete="CASCADE"), nullable=False, index=True)
    name            = Column(String(150), nullable=False)
    sort_order      = Column(Integer, nullable=False, default=0)
    is_active       = Column(Boolean, nullable=False, default=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at      = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    kecamatan       = relationship("VendorAreaKecamatan", back_populates="kelurahans")
