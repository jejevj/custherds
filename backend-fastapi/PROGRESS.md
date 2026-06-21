# Custherds Backend API (FastAPI) — Development Progress

> Last updated: 2026-06-21  
> Last commit: [`799a1ab`](https://github.com/jejevj/custherds/commit/799a1ab89fa357b5de74d440086fc8b1a59d78f2) — feat: add Basic Auth protection for Swagger /docs and /redoc

---

## ✅ Selesai

### 🏗️ Project Skeleton
- [x] Init struktur folder FastAPI — `app/`, `alembic/`, `core/`, `db/`, `models/`, `schemas/`, `api/v1/endpoints/`
  - Commit: [`84bf655`](https://github.com/jejevj/custherds/commit/84bf655ed3decf8af6e00736af3a409b9d01486a)
- [x] `requirements.txt` — FastAPI, Uvicorn, SQLAlchemy, Alembic, Pydantic v2, python-jose, passlib, psycopg2
- [x] `.env.example` — template variabel environment
- [x] `.gitignore` — exclude `__pycache__`, `.env`, `venv/`
- [x] `README.md` — panduan setup & quick start

### ⚙️ Core
- [x] `core/config.py` — Settings via `pydantic-settings`, load dari `.env`
- [x] `core/security.py` — JWT access & refresh token, bcrypt password hashing
- [x] `core/deps.py` — `get_db()` dependency injection

### 🗄️ Database
- [x] `db/base_class.py` — `Base` declarative class (dipisah untuk hindari circular import)
- [x] `db/base.py` — import semua models untuk Alembic detection
- [x] `db/session.py` — SQLAlchemy engine + `SessionLocal`
- [x] `alembic/env.py` — konfigurasi Alembic dengan auto-detect model changes
- [x] Fix circular import — semua model import `Base` dari `base_class.py`
  - Commit: [`1fe0f57`](https://github.com/jejevj/custherds/commit/1fe0f57c682be4c50dc4d2b5d892274bbd9fd381)

### 🌐 API & Endpoints
- [x] `GET /` — root status endpoint (service name, version, status)
- [x] `GET /health` — uptime server
- [x] `GET /api/v1/health` — health check detail + DB connectivity + latency
  - Commit: [`740bfae`](https://github.com/jejevj/custherds/commit/740bfae89052933094b9044d13eb07868f0f9fa0)

### 📖 Swagger / API Docs
- [x] Swagger UI tersedia di `/docs`
- [x] ReDoc tersedia di `/redoc`
- [x] Basic Auth protection untuk `/docs`, `/redoc`, `/openapi.json`
  - Username: `admin`
  - Password: di `.env` — `SWAGGER_PASSWORD`
  - Commit: [`799a1ab`](https://github.com/jejevj/custherds/commit/799a1ab89fa357b5de74d440086fc8b1a59d78f2)

### 🚀 Deployment
- [x] Systemd service `custherds-api.service` — auto-start on reboot
- [x] Berjalan di port `3005`
- [x] Domain: `https://api-custherds.ourtestcloud.my.id`

---

## 🔄 Sedang / Pending

- [ ] Setup database PostgreSQL & jalankan migrasi pertama (`alembic upgrade head`)
- [ ] Finalisasi schema/model database (belum ditentukan)

---

## 🗺️ Rencana Selanjutnya (To-Do)

### Models & Schema
- [ ] Diskusi & finalisasi entity/model yang dibutuhkan
- [ ] Buat model SQLAlchemy di `app/models/`
- [ ] Buat Pydantic schema di `app/schemas/`
- [ ] Generate migrasi Alembic: `alembic revision --autogenerate -m "init"`

### Authentication
- [ ] Endpoint `POST /api/v1/auth/login` — return JWT
- [ ] Endpoint `POST /api/v1/auth/register`
- [ ] Endpoint `POST /api/v1/auth/refresh` — refresh token
- [ ] Role-based access control (admin, vendor, guide, tourist)

### Endpoints (setelah model final)
- [ ] `/api/v1/users` — CRUD user
- [ ] `/api/v1/vendors` — CRUD vendor
- [ ] `/api/v1/guides` — CRUD guide
- [ ] `/api/v1/products` — CRUD produk/layanan
- [ ] `/api/v1/orders` — manajemen order
- [ ] `/api/v1/destinations` — destinasi wisata
- [ ] `/api/v1/reviews` — ulasan

---

## 📋 Commit Log

| Commit | Pesan |
|--------|-------|
| [`799a1ab`](https://github.com/jejevj/custherds/commit/799a1ab89fa357b5de74d440086fc8b1a59d78f2) | feat: add Basic Auth protection for Swagger |
| [`740bfae`](https://github.com/jejevj/custherds/commit/740bfae89052933094b9044d13eb07868f0f9fa0) | refactor: strip unfinished models, keep skeleton + health check |
| [`1fe0f57`](https://github.com/jejevj/custherds/commit/1fe0f57c682be4c50dc4d2b5d892274bbd9fd381) | fix: resolve circular import — separate Base class |
| [`84bf655`](https://github.com/jejevj/custherds/commit/84bf655ed3decf8af6e00736af3a409b9d01486a) | feat: init FastAPI backend service with full project structure |
