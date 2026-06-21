import time
import traceback
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.api_log import ApiLog

# Paths to skip logging (health checks, docs)
SKIP_PATHS = {"/", "/health", "/docs", "/redoc", "/openapi.json", "/favicon.ico"}


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        # Skip non-essential paths
        if request.url.path in SKIP_PATHS:
            return await call_next(request)

        start_time = time.time()
        ip_address = request.headers.get("X-Forwarded-For", request.client.host if request.client else "unknown")
        user_agent = request.headers.get("User-Agent", "")[:512]
        error_message = None
        error_type = None
        request_body = None
        status_code = 500

        try:
            response = await call_next(request)
            status_code = response.status_code

            # Capture request body only on 4xx/5xx
            if status_code >= 400:
                try:
                    body_bytes = b""
                    async for chunk in request.stream():
                        body_bytes += chunk
                    request_body = body_bytes.decode("utf-8", errors="replace")[:2000]
                except Exception:
                    pass

        except Exception as exc:
            status_code = 500
            error_message = str(exc)[:2000]
            error_type = type(exc).__name__
            tb = traceback.format_exc()
            request_body = tb[:2000]
            # Re-raise so FastAPI exception handlers still run
            raise exc
        finally:
            duration_ms = round((time.time() - start_time) * 1000, 2)

            # Only persist errors (4xx & 5xx) to keep DB lean
            if status_code >= 400:
                try:
                    db: Session = SessionLocal()
                    log = ApiLog(
                        method=request.method,
                        path=str(request.url.path)[:512],
                        status_code=status_code,
                        duration_ms=duration_ms,
                        ip_address=ip_address[:64],
                        user_agent=user_agent,
                        error_message=error_message,
                        error_type=error_type,
                        request_body=request_body,
                    )
                    db.add(log)
                    db.commit()
                except Exception:
                    pass  # Never let logging crash the app
                finally:
                    db.close()

        return response
