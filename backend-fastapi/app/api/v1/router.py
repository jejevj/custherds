from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, vendors, guides, products, orders, destinations, reviews

api_router = APIRouter()

api_router.include_router(auth.router,         prefix="/auth",         tags=["Auth"])
api_router.include_router(users.router,        prefix="/users",        tags=["Users"])
api_router.include_router(vendors.router,      prefix="/vendors",      tags=["Vendors"])
api_router.include_router(guides.router,       prefix="/guides",       tags=["Guides"])
api_router.include_router(products.router,     prefix="/products",     tags=["Products"])
api_router.include_router(orders.router,       prefix="/orders",       tags=["Orders"])
api_router.include_router(destinations.router, prefix="/destinations", tags=["Destinations"])
api_router.include_router(reviews.router,      prefix="/reviews",      tags=["Reviews"])
