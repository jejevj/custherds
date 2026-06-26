from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    auth,
    users,
    guides,
    vendors,
    bookings,
    transactions,
    withdrawals,
    admin,
)

api_router = APIRouter()

api_router.include_router(health.router,       prefix="/health",       tags=["Health"])
api_router.include_router(auth.router,         prefix="/auth",         tags=["Auth"])
api_router.include_router(users.router,        prefix="/users",        tags=["Users"])
api_router.include_router(guides.router,       prefix="/guides",       tags=["Guides"])
api_router.include_router(vendors.router,      prefix="/vendors",      tags=["Vendors"])
api_router.include_router(bookings.router,     prefix="/bookings",     tags=["Bookings"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])
api_router.include_router(withdrawals.router,  prefix="/withdrawals",  tags=["Withdrawals"])
api_router.include_router(admin.router,        prefix="/admin",        tags=["Admin"])
