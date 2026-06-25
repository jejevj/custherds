import uuid
from sqlalchemy import Column, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base


class RevenueSplitConfig(Base):
    """
    Konfigurasi bagi hasil dikelola Superadmin.
    Constraint: vendor_percent + guide_percent + platform_percent == 100.0
    Hanya satu record is_active=True pada satu waktu.
    """
    __tablename__ = "revenue_split_configs"

    id                  = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    vendor_percent      = Column(Float, nullable=False)
    guide_percent       = Column(Float, nullable=False)
    platform_percent    = Column(Float, nullable=False)
    is_active           = Column(Boolean, default=False, nullable=False, index=True)
    notes               = Column(Text, nullable=True)
    set_by              = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    effective_from      = Column(DateTime(timezone=True), nullable=False)
    created_at          = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    set_by_user         = relationship("User", foreign_keys=[set_by], back_populates="split_configs")
    transactions        = relationship("Transaction", back_populates="split_config")
