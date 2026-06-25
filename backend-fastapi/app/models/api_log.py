import uuid
from sqlalchemy import Column, String, Integer, Float, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base_class import Base


class APILog(Base):
    """
    Log setiap request HTTP untuk monitoring & debugging.
    Hanya menyimpan request dengan status 4xx/5xx agar DB tetap lean.
    """
    __tablename__ = "api_logs"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    method          = Column(String(10), nullable=False)
    path            = Column(String(512), nullable=False, index=True)
    status_code     = Column(Integer, nullable=True, index=True)
    duration_ms     = Column(Float, nullable=True)
    ip_address      = Column(String(64), nullable=True)
    user_agent      = Column(String(512), nullable=True)
    error_message   = Column(Text, nullable=True)
    error_type      = Column(String(100), nullable=True)
    request_body    = Column(Text, nullable=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


# Alias for backward compatibility with middleware that imports ApiLog
ApiLog = APILog
