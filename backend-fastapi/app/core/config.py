from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "Custherds API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Custherds backend API service."
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = False

    SECRET_KEY: str = "change-this-secret-key-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"

    DATABASE_URL: str = "postgresql://user:password@localhost:5432/custherds"

    # Swagger Basic Auth
    SWAGGER_USERNAME: str = "admin"
    SWAGGER_PASSWORD: str = "qwert12345!"

    # Xendit Payment Gateway
    XENDIT_SECRET_KEY: str = "xnd_development_xxxxxxxxxxxxxxxxxxxxxxxx"
    XENDIT_WEBHOOK_TOKEN: str = ""

    # ── Cloudflare R2 Storage ────────────────────────────────────────────────────
    # Dapatkan dari: https://dash.cloudflare.com/ → kanan bawah (Account ID)
    R2_ACCOUNT_ID: str = ""
    # Buat di: R2 → Manage R2 API Tokens → Create API Token (Object Read & Write)
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    # Nama bucket R2 yang sudah dibuat di Cloudflare dashboard
    R2_BUCKET_NAME: str = "custherds-uploads"
    # Public URL bucket: aktifkan Public Access di R2 dashboard, atau pakai custom domain
    # Contoh: https://uploads.custherds.com  atau  https://pub-xxxx.r2.dev
    R2_PUBLIC_URL: str = ""

    # ── CORS ─────────────────────────────────────────────────────────────────────
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        # Production domains
        "https://partners.custherds.com",
        "https://custherds.com",
        "https://www.custherds.com",
        # API domain sendiri (untuk Swagger UI / internal calls)
        "https://api.custherds.com",
        # Legacy / staging
        "https://partners-custherds.ourtestcloud.my.id",
        "https://custherds.ourtestcloud.my.id",
    ]

    # ── Proxy / HTTPS ───────────────────────────────────────────────────────────
    # Set BEHIND_PROXY=true di .env jika uvicorn berjalan di belakang Nginx/Apache.
    # ProxyHeadersMiddleware akan aktif dan membaca X-Forwarded-Proto.
    BEHIND_PROXY: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
