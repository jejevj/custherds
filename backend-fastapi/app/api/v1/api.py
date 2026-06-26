from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, users, guides, vendors, packages,
    bookings, transactions, payments,
    withdrawals, admin, uploads,
    destinations, products, orders, reviews,
    health, webhooks,
)

api_router = APIRouter()

api_router.include_router(health.router,        prefix="/health",        tags=["Health"])
api_router.include_router(auth.router,          prefix="/auth",          tags=["Auth"])
api_router.include_router(users.router,         prefix="/users",         tags=["Users"])
api_router.include_router(uploads.router,       prefix="/uploads",       tags=["Uploads"])

# Guide
api_router.include_router(guides.router,        prefix="/guides",        tags=["Guides"])

# Vendor
api_router.include_router(vendors.router,       prefix="/vendors",       tags=["Vendors"])
api_router.include_router(packages.router,      prefix="/packages",      tags=["Packages"])

# Booking & Transaksi
api_router.include_router(bookings.router,      prefix="/bookings",      tags=["Bookings"])
api_router.include_router(transactions.router,  prefix="/transactions",  tags=["Transactions"])
api_router.include_router(payments.router,      prefix="/payments",      tags=["Payments"])
api_router.include_router(withdrawals.router,   prefix="/withdrawals",   tags=["Withdrawals"])

# Konten
api_router.include_router(destinations.router,  prefix="/destinations",  tags=["Destinations"])
api_router.include_router(products.router,      prefix="/products",      tags=["Products"])
api_router.include_router(orders.router,        prefix="/orders",        tags=["Orders"])
api_router.include_router(reviews.router,       prefix="/reviews",       tags=["Reviews"])

# Admin & Webhooks
api_router.include_router(admin.router,         prefix="/admin",         tags=["Admin"])
api_router.include_router(webhooks.router,      prefix="/webhooks",      tags=["Webhooks"])
