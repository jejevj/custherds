from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    auth,
    users,
    guides,
    vendors,
    packages,
    bookings,
    transactions,
    transaction_status,
    withdrawals,
    admin,
    webhooks,
    payments,
    uploads,
    payment_gateway_config,
    settlement_bank_account,
    vendor_categories,
    vendor_areas,
)
from app.api.v1.endpoints import webmail_configs, webmail_emails

api_router = APIRouter()

api_router.include_router(health.router,                        prefix="/health",                        tags=["Health"])
api_router.include_router(auth.router,                          prefix="/auth",                          tags=["Auth"])
api_router.include_router(users.router,                         prefix="/users",                         tags=["Users"])
api_router.include_router(uploads.router,                       prefix="/uploads",                       tags=["Uploads"])
api_router.include_router(guides.router,                        prefix="/guides",                        tags=["Guides"])
api_router.include_router(vendors.router,                       prefix="/vendors",                       tags=["Vendors"])
api_router.include_router(vendor_categories.router,             prefix="/vendor-categories",             tags=["Vendor Categories"])
api_router.include_router(vendor_areas.router,                  prefix="/vendor-areas",                  tags=["Vendor Areas"])
api_router.include_router(packages.router,                      prefix="/packages",                      tags=["Packages"])
api_router.include_router(bookings.router,                      prefix="/bookings",                      tags=["Bookings"])
api_router.include_router(transactions.router,                  prefix="/transactions",                  tags=["Transactions"])
api_router.include_router(transaction_status.router,            prefix="/transactions",                  tags=["Transactions"])
api_router.include_router(withdrawals.router,                   prefix="/withdrawals",                   tags=["Withdrawals"])
api_router.include_router(admin.router,                         prefix="/admin",                         tags=["Admin"])
api_router.include_router(webhooks.router,                      prefix="/webhooks",                      tags=["Webhooks"])
api_router.include_router(payments.router,                      prefix="/payments",                      tags=["Payments"])
api_router.include_router(payment_gateway_config.router,        prefix="/admin/payment-gateway-config",  tags=["Admin"])
api_router.include_router(settlement_bank_account.router,       prefix="/settlement-bank-account",       tags=["Settlement Bank Account"])

# ── Webmail ──────────────────────────────────────────────────────────────────
# /webmail/configs  → CRUD konfigurasi SMTP
# /webmail/emails   → inbox / kirim / detail (route /send ada di sini)
# Tidak ada prefix /webmail/send terpisah — frontend harus POST ke
# /api/v1/webmail/emails/send
api_router.include_router(webmail_configs.router,               prefix="/webmail/configs",               tags=["Webmail"])
api_router.include_router(webmail_emails.router,                prefix="/webmail/emails",                tags=["Webmail"])
