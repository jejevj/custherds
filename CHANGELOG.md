# Custherds — Changelog

---

## [Session 2] — 2026-06-26

### 🟢 Frontend (Next.js — `nextfront backoffice`)

#### 🔧 Bug Fixes
- **Middleware** — Fixed `/` route always redirecting to `/admin/login` regardless of auth state.
  Now: unauthenticated users see the landing page; logged-in users are redirected to their role dashboard.
  - Commit: [`11c7106`](https://github.com/jejevj/custherds/commit/11c71067cd2f387a6c8dca3c42d2c488df83b05b)
- **Browse Vendors page** — Fixed broken import `@/store/auth-store` → corrected to `@/store/auth.store` and field `token` → `accessToken`.
  - Commit: [`a7b015a`](https://github.com/jejevj/custherds/commit/a7b015a27b8fcdc2e09bd80b3dfc4d46621fcdb1)

#### ✨ New Features
- **Landing Page** — "Sign in as Guide" and "Sign in as Vendor" now use `<Button>` components (shadcn/ui) instead of plain anchor links.
  - Commit: [`4e5208d`](https://github.com/jejevj/custherds/commit/4e5208d456e4954059de553fdcf6f6a514150d80)
- **Guide Sidebar** — Added **Browse Vendors** menu item with `Store` icon linking to `/guide/vendors`.
  - Commit: [`e99bb78`](https://github.com/jejevj/custherds/commit/e99bb7889406113836819edcc2339ca154ae75e7)
- **New Page: `/guide/vendors`** — Vendor directory for guides featuring:
  - Card grid layout (responsive 1/2/3 columns)
  - Filter by **Area** (Kuta, Ubud, Seminyak, etc.)
  - Filter by **Category** (Restaurant, Cafe, Spa, etc.)
  - Live **search** by business name
  - Loading skeleton + empty state
  - Each card shows: name, category badge, area, location, opening hours, cashback %, min spend, website link
  - Commit: [`e99bb78`](https://github.com/jejevj/custherds/commit/e99bb7889406113836819edcc2339ca154ae75e7)

#### 🇬🇧 Localization
- Translated all remaining Indonesian text to **English** across:
  - `landing-page.tsx`
  - `guide/vendors/page.tsx`
  - `vendors.py` endpoint summaries & error messages

---

### 🔵 Backend (FastAPI — `backend-fastapi`)

#### ✨ New Features
- **`GET /api/v1/vendors/browse`** — New public-facing browse endpoint for guides:
  - Returns only `vendor_status = "approved"` vendors
  - Query params: `area`, `category`, `search`, `skip`, `limit`
  - Auth required (any role)
  - Swagger tag: **Vendors – Browse**
  - Commit: [`e99bb78`](https://github.com/jejevj/custherds/commit/e99bb7889406113836819edcc2339ca154ae75e7)
- **`VendorPublic` schema** — New Pydantic schema exposing safe vendor fields to non-vendor roles (no deposit/financial data).

#### 🔧 Improvements
- All endpoint `summary` strings and `detail` error messages translated to English.
- `vendors.py` refactored with section comments for readability.

---

## [Session 1] — 2026-06-21

### Backend
- Init FastAPI project structure
- Core: config, security (JWT + bcrypt), deps
- DB: SQLAlchemy base, Alembic setup, session
- Swagger Basic Auth protection (`/docs`, `/redoc`, `/openapi.json`)
- Health check endpoint
- Systemd deployment on port `3005`

---

> 📌 Domain: `https://api-custherds.ourtestcloud.my.id`  
> 📌 Frontend: `https://partners-custherds.ourtestcloud.my.id`
