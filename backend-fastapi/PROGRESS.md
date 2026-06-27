# Custherds Backend API (FastAPI) — Development Progress

> Last updated: 2026-06-27  
> Last commit: [`146df99`](https://github.com/jejevj/custherds/commit/146df992cbb395215c47395a8e0c23d18ee34e9c) — fix: gunakan Decimal di webhook_invoice untuk wallet_balance dan total_earnings

---

## ✅ Selesai

### 🏗️ Project Skeleton
- [x] Init struktur folder FastAPI — `app/`, `alembic/`, `core/`, `db/`, `models/`, `schemas/`, `api/v1/endpoints/`
- [x] `requirements.txt` — FastAPI, Uvicorn, SQLAlchemy, Alembic, Pydantic v2, python-jose, passlib, psycopg2, xendit-python
- [x] `.env.example` — template variabel environment
- [x] `.gitignore` — exclude `__pycache__`, `.env`, `venv/`
- [x] `README.md` — panduan setup & quick start

### ⚙️ Core
- [x] `core/config.py` — Settings via `pydantic-settings`, load dari `.env`
- [x] `core/security.py` — JWT access & refresh token, bcrypt password hashing
- [x] `core/deps.py` — `get_db()` dependency injection

### 🗄️ Database
- [x] PostgreSQL running di `127.0.0.1:5432`, database `custherds`
- [x] `db/base_class.py` — `Base` declarative class
- [x] `db/session.py` — SQLAlchemy engine + `SessionLocal`
- [x] Alembic migration berjalan
- [x] Fix circular import — semua model import `Base` dari `base_class.py`

### 🌐 API & Endpoints
- [x] `GET /` — root status
- [x] `GET /health` — uptime server
- [x] `GET /api/v1/health` — health check detail + DB latency
- [x] Auth — login, register, refresh token, role-based (admin, vendor, guide, tourist)
- [x] Users — CRUD
- [x] Vendors — CRUD + profile
- [x] Guides — CRUD + profile + wallet
- [x] Bookings — create, list, detail, approve/reject vendor, cancel
- [x] Transactions — create invoice Xendit, list, detail
- [x] Payments — create invoice, VA, QR Code + semua webhook endpoint
- [x] Guide Withdrawals — request, list, approve/reject admin, disbursement Xendit
- [x] Uploads — upload file/gambar

### 💳 Xendit Integration
- [x] `POST /api/v1/payments/invoice` — buat invoice Xendit
- [x] `POST /api/v1/payments/virtual-account` — buat VA
- [x] `POST /api/v1/payments/qr-code` — buat QRIS
- [x] `POST /api/v1/payments/webhook/invoice` — **WIRED ke DB**: settle TX, kredit wallet guide, booking → completed
  - Fix Decimal/float TypeError — Commit: [`146df99`](https://github.com/jejevj/custherds/commit/146df992cbb395215c47395a8e0c23d18ee34e9c)
- [x] `POST /api/v1/payments/webhook/disbursement` — **WIRED ke DB**: update status withdrawal, refund saldo jika failed
- [x] Webhook lainnya (fva, ewallet, qr, payout, dll) — log only

### 📖 Swagger / API Docs
- [x] Swagger UI — `/docs` (Basic Auth protected)
- [x] ReDoc — `/redoc`

### 🚀 Deployment
- [x] Systemd service `custherds-api.service` — auto-start on reboot
- [x] Berjalan di port `3005`
- [x] Domain: `https://api-custherds.ourtestcloud.my.id`
- [x] Frontend: `https://partners-custherds.ourtestcloud.my.id`
- [x] CORS configured: localhost:3000, partners domain, wildcard

---

## 🔄 Diketahui / Perlu Perhatian

- [ ] Webhook `fva`, `ewallet`, `qr`, dll belum wired ke DB (log only)
- [ ] Notifikasi real-time (WebSocket / push notification) belum ada
- [ ] Unit test belum ada
- [ ] Rate limiting belum dikonfigurasi

---

## 📋 Commit Log (Terbaru)

| Commit | Tanggal | Pesan |
|--------|---------|-------|
| [`146df99`](https://github.com/jejevj/custherds/commit/146df992cbb395215c47395a8e0c23d18ee34e9c) | 2026-06-27 | fix: gunakan Decimal di webhook_invoice |
| [`885a21a`](https://github.com/jejevj/custherds/commit/885a21a229794bf758304ceef072e0bc4987ed56) | 2026-06-27 | fix: webhook/invoice sekarang settle TX dan booking ke DB |
| [`799a1ab`](https://github.com/jejevj/custherds/commit/799a1ab89fa357b5de74d440086fc8b1a59d78f2) | 2026-06-21 | feat: add Basic Auth protection for Swagger |
| [`740bfae`](https://github.com/jejevj/custherds/commit/740bfae89052933094b9044d13eb07868f0f9fa0) | 2026-06-21 | refactor: strip unfinished models, keep skeleton + health check |
| [`1fe0f57`](https://github.com/jejevj/custherds/commit/1fe0f57c682be4c50dc4d2b5d892274bbd9fd381) | 2026-06-21 | fix: resolve circular import |
| [`84bf655`](https://github.com/jejevj/custherds/commit/84bf655ed3decf8af6e00736af3a409b9d01486a) | 2026-06-21 | feat: init FastAPI backend service |
