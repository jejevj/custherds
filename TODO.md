# Custherds — TODO & Agent Handoff

> Dokumen ini adalah panduan untuk agent AI berikutnya.
> Baca seluruh dokumen ini sebelum mulai mengerjakan task apapun.
> Last updated: 2026-06-26

---

## 📌 Project Overview

**Custherds** adalah partner portal untuk **Guide** dan **Vendor** wisata di Bali.

| Layer | Stack | URL |
|---|---|---|
| Frontend | Next.js 15 (App Router, Turbopack) | `https://partners-custherds.ourtestcloud.my.id` |
| Backend | FastAPI + SQLAlchemy + PostgreSQL | `https://api-custherds.ourtestcloud.my.id` |
| Repo | GitHub | `https://github.com/jejevj/custherds` |

### Struktur Repo
```
custherds/
├── backend-fastapi/          # FastAPI backend
│   ├── app/
│   │   ├── api/v1/endpoints/ # Semua REST endpoint
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── core/             # Security, config, deps
│   │   └── db/               # Session, seeder, base
│   └── alembic/              # DB migrations
└── nextfront backoffice/     # Next.js frontend
    └── src/
        ├── app/
        │   ├── (admin-pages)/
        │   ├── (guide-pages)/
        │   └── (vendor-pages)/
        ├── components/       # Shared + role-specific components
        └── store/            # Zustand stores (auth.store.ts)
```

### Konvensi Penting
- Auth store: `@/store/auth.store` — field: `accessToken`, `user`, `isLoggedIn`
- API base: `process.env.NEXT_PUBLIC_API_URL` + `/api/v1/...`
- User roles: `user_type` — `99` = admin, `1` = guide, `2` = vendor
- Semua teks UI harus dalam **Bahasa Inggris**
- Komponen UI menggunakan **shadcn/ui**

---

## ✅ Sudah Selesai (jangan dikerjakan ulang)

- [x] Auth (login, JWT, refresh token)
- [x] Admin dashboard, users, vendors, finance pages
- [x] Guide dashboard, bookings, finance, profile pages
- [x] Vendor dashboard, bookings, finance, profile pages
- [x] Middleware routing dengan role guard
- [x] Landing page (EN, dengan Button)
- [x] Guide: Browse Vendors page (`/guide/vendors`) + backend endpoint
- [x] Swagger Basic Auth
- [x] Database seeder (admin, guide dev, vendor dev)

---

## 🟡 HIGH PRIORITY — Harus dikerjakan berikutnya

### 1. Admin: Approval Flow untuk Vendor & Guide
```
File: backend-fastapi/app/api/v1/endpoints/admin.py
File: nextfront backoffice/src/app/(admin-pages)/admin/vendors/page.tsx
```
- [ ] Backend: `PATCH /api/v1/admin/vendors/{id}/approve`
- [ ] Backend: `PATCH /api/v1/admin/vendors/{id}/reject` (dengan `approval_notes`)
- [ ] Backend: `PATCH /api/v1/admin/guides/{id}/approve`
- [ ] Backend: `PATCH /api/v1/admin/guides/{id}/reject`
- [ ] Frontend: Tombol Approve / Reject di halaman detail vendor & guide
- [ ] Frontend: Status badge (pending / approved / rejected) di list

### 2. Guide: Detail Vendor Page
```
File: nextfront backoffice/src/app/(guide-pages)/guide/vendors/[id]/page.tsx
```
- [ ] Halaman detail vendor dari browse (`/guide/vendors/[id]`)
- [ ] Tampilkan produk/layanan vendor (dari `GET /api/v1/products?vendor_id=...`)
- [ ] Tombol "Create Booking" langsung dari halaman ini

### 3. Vendor: Registration / Onboarding
```
File: nextfront backoffice/src/app/(no-layout-pages)/vendor/register/
```
- [ ] Halaman register untuk vendor baru
- [ ] Form: business name, category, area, location, opening hours, min spend
- [ ] Backend: `POST /api/v1/auth/register` sudah ada — pastikan vendor profile dibuat otomatis
- [ ] Email verifikasi (opsional, jika SMTP dikonfigurasi)

### 4. Guide: Registration / Onboarding
- [ ] Halaman register untuk guide baru
- [ ] Form: nama, nationality, bio, bahasa, info bank
- [ ] Upload sertifikat guide

---

## 🟠 MEDIUM PRIORITY

### 5. Booking Flow (End-to-End)
```
Endpoint: /api/v1/bookings
Frontend guide: /guide/bookings/create
```
- [ ] Pastikan form Create Booking berfungsi penuh (pilih vendor, produk, tanggal, pax)
- [ ] Backend: validasi ketersediaan
- [ ] Status booking: `pending → confirmed → completed / cancelled`
- [ ] Notifikasi ke vendor saat booking masuk

### 6. Vendor: Products Management
```
Endpoint: /api/v1/products
```
- [ ] Halaman CRUD produk/layanan untuk vendor (`/vendor/products`)
- [ ] Form: nama, deskripsi, harga, min/max pax, currency
- [ ] Tambah menu **Products** di vendor sidebar

### 7. Finance: Withdrawal Flow
```
Endpoint: /api/v1/withdrawals
```
- [ ] Guide: form request withdrawal dari wallet
- [ ] Admin: list withdrawal requests + approve / reject
- [ ] Status: `pending → approved → paid`

### 8. Area & Category Master Data
```
File: backend-fastapi/app/api/v1/endpoints/ (buat area.py, categories.py)
```
- [ ] Saat ini area dan category disimpan sebagai integer hardcoded di frontend
- [ ] Buat tabel master `vendor_areas` dan `vendor_categories` di DB
- [ ] Endpoint `GET /api/v1/areas` dan `GET /api/v1/categories`
- [ ] Frontend: load dari API, bukan hardcode

---

## 🔵 LOW PRIORITY

### 9. Reviews
```
Endpoint: /api/v1/reviews (sudah ada skeleton)
```
- [ ] Guide menulis review untuk vendor setelah booking selesai
- [ ] Rating 1-5 + komentar
- [ ] Tampilkan di halaman detail vendor

### 10. Vendor Deposit Topup
```
Endpoint: /api/v1/payments
```
- [ ] Vendor bisa topup deposit via payment gateway (Midtrans sudah ada di payments.py)
- [ ] Halaman topup di `/vendor/finance/deposit`
- [ ] Riwayat topup

### 11. Notifications
- [ ] In-app notifikasi untuk: booking baru, approval status, withdrawal status
- [ ] Badge counter di sidebar

### 12. Dashboard Stats (Admin)
- [ ] Total users, vendors, guides, bookings
- [ ] Revenue chart (monthly)
- [ ] Top vendors by booking

### 13. i18n / Bahasa Indonesia toggle
- [ ] Semua UI sudah EN — tambahkan toggle EN/ID jika dibutuhkan

---

## 🔧 Technical Debt

- [ ] `middleware.ts` warning: deprecated convention in newer Next.js — monitor apakah perlu migrasi ke `proxy`
- [ ] `postcss.config.js` — tambahkan `"type": "module"` ke `package.json` untuk hilangkan warning
- [ ] Area dan Category map di `guide/vendors/page.tsx` masih hardcoded — pindah ke API (lihat task #8)
- [ ] Error handling di semua fetch belum konsisten — buat shared `apiFetch()` wrapper di `services/api.ts`
- [ ] Semua halaman login belum dicek ulang apakah masih ada teks Indonesia
- [ ] `NavUser` di sidebar masih dummy data `{ name: "", email: "", avatar: "" }` — harus diisi dari auth store

---

## 💬 Tips untuk Agent

1. **Selalu cek file yang ada sebelum membuat baru** — banyak skeleton sudah ada
2. **Import auth store** dengan benar: `import { useAuthStore } from "@/store/auth.store"`
3. **Token field**: `useAuthStore((s) => s.accessToken)` — bukan `token`
4. **Jangan hardcode** area/category di tempat baru — gunakan konstanta yang sudah ada atau buat API
5. **Build dulu** sebelum deploy: `npm run build` di `nextfront backoffice/`
6. **Backend restart** setelah perubahan Python: `systemctl restart custherds-api`
7. **Swagger** tersedia di `https://api-custherds.ourtestcloud.my.id/docs` (Basic Auth)
