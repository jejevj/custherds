import logging
import traceback

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from jose import JWTError

logger = logging.getLogger("app.exceptions")


def register_exception_handlers(app: FastAPI) -> None:
    """Register all global exception handlers onto the FastAPI app instance."""

    # ------------------------------------------------------------------
    # 422 — Pydantic / Request Validation Error
    # ------------------------------------------------------------------
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        errors = [
            {
                "field": " -> ".join(str(l) for l in err["loc"]),
                "message": err["msg"],
                "type": err["type"],
            }
            for err in exc.errors()
        ]
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "success": False,
                "status_code": 422,
                "message": "Validation error, please check the form",
                "data": None,
                "errors": errors,
                "meta": None,
            },
        )

    # ------------------------------------------------------------------
    # 401 — JWT / Auth Error
    # ------------------------------------------------------------------
    @app.exception_handler(JWTError)
    async def jwt_exception_handler(request: Request, exc: JWTError):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "success": False,
                "status_code": 401,
                "message": "Invalid or expired token, Access Invalid.",
                "data": None,
                "errors": str(exc),
                "meta": None,
            },
        )

    # ------------------------------------------------------------------
    # 500 — SQLAlchemy / Database Error
    # ------------------------------------------------------------------
    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
        tb = traceback.format_exc()
        logger.error(
            "SQLAlchemyError on %s %s\n%s",
            request.method,
            request.url.path,
            tb,
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "status_code": 500,
                "message": "Database error, check your connection",
                "data": None,
                "errors": str(exc),
                "meta": None,
            },
        )

    # ------------------------------------------------------------------
    # 500 — Unhandled Exception (catch-all)
    # ------------------------------------------------------------------
    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        tb = traceback.format_exc()
        logger.error(
            "Unhandled %s on %s %s\n%s",
            type(exc).__name__,
            request.method,
            request.url.path,
            tb,
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "status_code": 500,
                "message": "Internal server error",
                "data": None,
                "errors": str(exc),
                "meta": None,
            },
        )
