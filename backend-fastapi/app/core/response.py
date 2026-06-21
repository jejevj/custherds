from typing import Any, Optional, Generic, TypeVar
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from fastapi import status

T = TypeVar("T")


# ---------------------------------------------------------------------------
# Standard Response Schema
# ---------------------------------------------------------------------------

class ApiResponse(BaseModel, Generic[T]):
    """Universal response envelope for all API endpoints."""
    success: bool
    status_code: int
    message: str
    data: Optional[T] = None
    errors: Optional[Any] = None
    meta: Optional[Any] = None   # pagination, totals, etc.


# ---------------------------------------------------------------------------
# Response Builders
# ---------------------------------------------------------------------------

def success_response(
    data: Any = None,
    message: str = "Success",
    status_code: int = status.HTTP_200_OK,
    meta: Any = None,
) -> JSONResponse:
    """2xx — successful responses."""
    return JSONResponse(
        status_code=status_code,
        content={
            "success": True,
            "status_code": status_code,
            "message": message,
            "data": data,
            "errors": None,
            "meta": meta,
        },
    )


def error_response(
    message: str = "An error occurred",
    status_code: int = status.HTTP_400_BAD_REQUEST,
    errors: Any = None,
) -> JSONResponse:
    """4xx / 5xx — error responses."""
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "status_code": status_code,
            "message": message,
            "data": None,
            "errors": errors,
            "meta": None,
        },
    )


# ---------------------------------------------------------------------------
# Shorthand helpers — use these directly in endpoints
# ---------------------------------------------------------------------------

def resp_ok(data: Any = None, message: str = "Success", meta: Any = None):
    """200 OK"""
    return success_response(data, message, status.HTTP_200_OK, meta)


def resp_created(data: Any = None, message: str = "Created successfully"):
    """201 Created"""
    return success_response(data, message, status.HTTP_201_CREATED)


def resp_no_content(message: str = "Deleted successfully"):
    """204 No Content"""
    return JSONResponse(status_code=status.HTTP_204_NO_CONTENT, content=None)


def resp_bad_request(message: str = "Bad request", errors: Any = None):
    """400 Bad Request"""
    return error_response(message, status.HTTP_400_BAD_REQUEST, errors)


def resp_unauthorized(message: str = "Unauthorized"):
    """401 Unauthorized"""
    return error_response(message, status.HTTP_401_UNAUTHORIZED)


def resp_forbidden(message: str = "Forbidden"):
    """403 Forbidden"""
    return error_response(message, status.HTTP_403_FORBIDDEN)


def resp_not_found(message: str = "Resource not found"):
    """404 Not Found"""
    return error_response(message, status.HTTP_404_NOT_FOUND)


def resp_conflict(message: str = "Conflict", errors: Any = None):
    """409 Conflict — e.g. duplicate email"""
    return error_response(message, status.HTTP_409_CONFLICT, errors)


def resp_unprocessable(message: str = "Validation error", errors: Any = None):
    """422 Unprocessable Entity"""
    return error_response(message, status.HTTP_422_UNPROCESSABLE_ENTITY, errors)


def resp_server_error(message: str = "Internal server error"):
    """500 Internal Server Error"""
    return error_response(message, status.HTTP_500_INTERNAL_SERVER_ERROR)
