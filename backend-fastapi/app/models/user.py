import uuid
from sqlalchemy import Column, String, SmallInteger, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class User(Base):
    """
    Entitas utama semua pengguna.
    user_type: 1=Guide/Partner, 2=Vendor, 99=Superadmin
    """
    __tablename__ = "users"

    id                = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_name         = Column(String(255), nullable=False)
    user_email        = Column(String(255), unique=True, nullable=False, index=True)
    user_phone        = Column(String(30), nullable=True)
    user_password     = Column(String(255), nullable=False)  # bcrypt hash
    user_type         = Column(SmallInteger, nullable=False)  # 1=Guide, 2=Vendor, 99=Admin
    ig_link           = Column(String(255), nullable=True)
    fb_link           = Column(String(255), nullable=True)
    yt_link           = Column(String(255), nullable=True)
    tiktok_link       = Column(String(255), nullable=True)
    is_active         = Column(Boolean, default=False, nullable=False)
    is_verified       = Column(Boolean, default=False, nullable=False)
    tnc_accepted      = Column(Boolean, default=False, nullable=False)
    tnc_accepted_at   = Column(DateTime(timezone=True), nullable=True)
    last_login_at     = Column(DateTime(timezone=True), nullable=True)
    created_at        = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at        = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # relationships
    guide             = relationship("Guide", back_populates="user", uselist=False)
    vendor            = relationship("Vendor", back_populates="user", uselist=False)
    audit_logs        = relationship("AuditLog", foreign_keys="AuditLog.actor_id", back_populates="actor")
    reviewed_transactions = relationship("Transaction", foreign_keys="Transaction.reviewed_by", back_populates="reviewer")
    split_configs     = relationship("RevenueSplitConfig", foreign_keys="RevenueSplitConfig.set_by", back_populates="set_by_user")
