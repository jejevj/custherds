from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, JSON, String, Text
from sqlalchemy.sql import func

from app.db.base_class import Base


class PaymentGatewayConfig(Base):
    """
    Tabel konfigurasi payment gateway.
    Hanya satu baris per provider, dan hanya satu yang is_active=True pada satu waktu.
    Credentials disimpan sebagai JSON agar fleksibel ketika gateway update field-nya.
    """

    __tablename__ = "payment_gateway_configs"

    id          = Column(Integer, primary_key=True, index=True)
    provider    = Column(String(50), unique=True, nullable=False, index=True)
    label       = Column(String(100), nullable=False)
    is_active   = Column(Boolean, default=False, nullable=False)
    is_production = Column(Boolean, default=False, nullable=False)
    credentials = Column(JSON, nullable=False, default=dict)
    notes       = Column(Text, nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), onupdate=func.now())
