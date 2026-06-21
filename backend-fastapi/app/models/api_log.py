from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from sqlalchemy.sql import func
from app.db.base_class import Base


class ApiLog(Base):
    __tablename__ = "api_logs"

    id              = Column(Integer, primary_key=True, index=True)
    method          = Column(String(10), nullable=False)        # GET, POST, etc.
    path            = Column(String(512), nullable=False)       # /api/v1/...
    status_code     = Column(Integer, nullable=False)           # 200, 404, 500, ...
    duration_ms     = Column(Float)                             # response time
    ip_address      = Column(String(64))                        # client IP
    user_agent      = Column(String(512))
    error_message   = Column(Text)                              # hanya diisi jika error
    error_type      = Column(String(128))                       # nama exception class
    request_body    = Column(Text)                              # body (errors only, truncated)
    created_at      = Column(DateTime(timezone=True), server_default=func.now(), index=True)
