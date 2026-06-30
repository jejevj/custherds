import logging
import time
import secrets

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html, get_redoc_html
from fastapi.openapi.utils import get_openapi
from fastapi.security import HTTPBasic, HTTPBasicCredentials

from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.api.v1.router import api_router
from app.middleware.logging import RequestLoggingMiddleware

# ── Logging setup ────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)
# ─────────────────────────────────────────────────────────────────────────────

START_TIME = time.time()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestLoggingMiddleware)

# Global exception handlers
register_exception_handlers(app)

# Routers
app.include_router(api_router, prefix=settings.API_V1_STR)

security = HTTPBasic()


def verify_docs_credentials(credentials: HTTPBasicCredentials = Depends(security)):
    correct_username = secrets.compare_digest(credentials.username, settings.SWAGGER_USERNAME)
    correct_password = secrets.compare_digest(credentials.password, settings.SWAGGER_PASSWORD)
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )


@app.get("/docs", include_in_schema=False)
async def swagger_ui(credentials: HTTPBasicCredentials = Depends(verify_docs_credentials)):
    return get_swagger_ui_html(
        openapi_url="/openapi.json",
        title=f"{settings.PROJECT_NAME} — Swagger UI",
        swagger_favicon_url="https://fastapi.tiangolo.com/img/favicon.png",
    )


@app.get("/redoc", include_in_schema=False)
async def redoc_ui(credentials: HTTPBasicCredentials = Depends(verify_docs_credentials)):
    return get_redoc_html(
        openapi_url="/openapi.json",
        title=f"{settings.PROJECT_NAME} — ReDoc",
    )


@app.get("/openapi.json", include_in_schema=False)
async def openapi_schema(credentials: HTTPBasicCredentials = Depends(verify_docs_credentials)):
    return get_openapi(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description=settings.DESCRIPTION,
        routes=app.routes,
    )


@app.get("/", tags=["Health"])
async def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "ok",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    uptime_seconds = round(time.time() - START_TIME, 2)
    return {
        "status": "healthy",
        "uptime_seconds": uptime_seconds,
        "version": settings.VERSION,
    }
