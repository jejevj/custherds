from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.deps import get_db
from app.core.config import settings
import time

router = APIRouter()


@router.get("/")
def health_detail(db: Session = Depends(get_db)):
    """Detailed health check including database connectivity."""
    db_status = "unreachable"
    db_latency_ms = None

    try:
        t0 = time.time()
        db.execute(text("SELECT 1"))
        db_latency_ms = round((time.time() - t0) * 1000, 2)
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "version": settings.VERSION,
        "database": {
            "status": db_status,
            "latency_ms": db_latency_ms,
        },
    }
