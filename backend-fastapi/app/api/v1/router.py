from fastapi import APIRouter
from app.api.v1.endpoints import health, payments

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["Health"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])

# Endpoints will be registered here once models are finalized
# api_router.include_router(auth.router,     prefix="/auth",     tags=["Auth"])
# api_router.include_router(users.router,    prefix="/users",    tags=["Users"])
# api_router.include_router(vendors.router,  prefix="/vendors",  tags=["Vendors"])
# api_router.include_router(guides.router,   prefix="/guides",   tags=["Guides"])
