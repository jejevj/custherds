# Custherds Backend API (FastAPI)

REST API service for the Custherds platform built with **FastAPI + SQLAlchemy + Alembic + PostgreSQL**.

## Stack
- **FastAPI** — web framework
- **SQLAlchemy 2.0** — ORM
- **Alembic** — database migrations
- **PostgreSQL** — database
- **Pydantic v2** — data validation
- **python-jose** — JWT authentication
- **passlib** — password hashing (bcrypt)

## Project Structure
```
backend-fastapi/
├── app/
│   ├── api/v1/endpoints/   # Route handlers per resource
│   ├── core/               # Config, security, dependencies
│   ├── db/                 # SQLAlchemy engine & base
│   ├── models/             # ORM models (tables)
│   ├── schemas/            # Pydantic request/response schemas
│   └── main.py             # App entrypoint
├── alembic/                # Migration scripts
├── alembic.ini
├── requirements.txt
└── .env.example
```

## Quick Start

```bash
# 1. Create virtualenv
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\\Scripts\\activate  # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Setup environment
cp .env.example .env
# Edit .env with your DATABASE_URL and SECRET_KEY

# 4. Run migrations
alembic upgrade head

# 5. Start server
uvicorn app.main:app --reload --port 8000
```

## API Docs
After running, open: http://localhost:8000/docs

## Available Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/v1/auth/login | Login, get JWT token |
| POST | /api/v1/auth/register | Register new user |
| GET | /api/v1/users/me | Get current user |
| GET | /api/v1/vendors | List approved vendors |
| GET | /api/v1/guides | List available guides |
| GET | /api/v1/products | List products |
| POST | /api/v1/orders | Create order |
| GET | /api/v1/destinations | List destinations |
| GET | /api/v1/reviews | Get reviews by target |

## Migrations
```bash
# Create new migration after model changes
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one step
alembic downgrade -1
```
