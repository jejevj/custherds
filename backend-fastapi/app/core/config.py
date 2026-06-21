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

    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://partners-custherds.ourtestcloud.my.id",
        "https://custherds.ourtestcloud.my.id",
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
