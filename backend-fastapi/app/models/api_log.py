import uuid
from sqlalchemy import Column, String, Integer, Text, DateTime, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base


class APILog(Base):
    """
    Log setiap request HTTP untuk keperluan monitoring & debugging.
    """
    __tablename__ = "api_logs"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    method          = Column(String(10), nullable=False)
    path            = Column(String(500), nullable=False, index=True)
    status_code     = Column(Integer, nullable=True)
    process_time_ms = Column(Float, nullable=True)
    client_ip       = Column(String(45), nullable=True)
    user_agent      = Column(String(500), nullable=True)
    request_body    = Column(Text, nullable=True)
    response_body   = Column(Text, nullable=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
