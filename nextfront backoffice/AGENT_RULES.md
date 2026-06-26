# AGENT RULES — Custherds Backoffice Frontend
# Next.js Integration with Custherds REST API

> File ini adalah panduan wajib bagi AI Agent yang mengerjakan integrasi frontend backoffice.
> Baca seluruh isi file ini sebelum menulis satu baris kode pun.

---

## 1. IDENTITAS PROYEK

| Item | Detail |
|------|--------|
| **Proyek** | Custherds Backoffice |
| **Framework** | Next.js 15 (App Router) + TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui |
| **State** | Zustand (sudah ada di `src/store/`) |
| **API Client** | Axios / fetch — base di `src/services/` |
| **Auth** | JWT Bearer Token (access + refresh) |
| **Backend** | FastAPI — `https://api.custherds.ourtestcloud.my.id/api/v1` |
| **Swagger** | `https://api.custherds.ourtestcloud.my.id/docs` |

---

## 2. SCOPE PENGERJAAN

### ✅ Yang HARUS dikerjakan (In Scope)
Integrasi semua halaman berikut dengan API backend secara penuh — bukan mock data:

#### 🔐 Auth
- [ ] `/login` — POST `/auth/login` → simpan access_token + refresh_token
- [ ] Logout — hapus token, redirect ke login
- [ ] Auto-refresh token saat expired (interceptor Axios)
- [ ] Route guard: halaman protected redirect ke `/login` jika tidak ada token

#### 🏠 Dashboard (Admin — user_type: 99)
- [ ] Summary cards: total user, total transaksi, total revenue platform
- [ ] Recent transactions table

#### 👤 Users Management
- [ ] List semua user → GET `/admin/users`
- [ ] Filter by user_type (Guide / Vendor / Admin)
- [ ] Toggle aktif/nonaktif → PUT `/admin/users/{id}/activate`

#### 🧑‍💼 Guides Management
- [ ] List guide → GET `/guides`
- [ ] Detail guide → GET `/guides/{id}`
- [ ] Verifikasi sertifikat guide

#### 🏢 Vendors Management
- [ ] List vendor → GET `/vendors`
- [ ] Detail vendor → GET `/vendors/{id}`
- [ ] Approve / reject vendor → PUT `/admin/vendors/{id}/approve`

#### 📅 Bookings
- [ ] List booking → GET `/bookings`
- [ ] Detail booking → GET `/bookings/{id}`
- [ ] Filter by status

#### 🧾 Transactions
- [ ] List transaksi → GET `/transactions` (admin lihat semua via `/admin/transactions`)
- [ ] Detail transaksi → GET `/transactions/{id}`
- [ ] Filter by status: `pending_vendor_approval`, `payment_pending`, `settled`, `rejected`
- [ ] Badge status dengan warna sesuai

#### 💰 Withdrawals (Admin)
- [ ] List withdrawal → GET `/admin/withdrawals`
- [ ] Filter by status: `pending`, `processing`, `completed`, `failed`
- [ ] Trigger disbursement → POST `/admin/withdrawals/{id}/disburse`
- [ ] Manual override → PUT `/admin/withdrawals/{id}/process`

#### ⚙️ Split Revenue Config
- [ ] List config → GET `/admin/split-config`
- [ ] Buat config baru → POST `/admin/split-config`
- [ ] Validasi: vendor% + guide% + platform% harus = 100

### ❌ Yang TIDAK dikerjakan (Out of Scope)
- Halaman publik (frontpublic/) — beda project
- Webhook endpoint (server-side, bukan frontend)
- Mobile app
- CMS konten artikel/blog

---

## 3. STRUKTUR FOLDER WAJIB

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          ← Sidebar + Topbar layout
│   │   ├── page.tsx            ← Dashboard home
│   │   ├── users/
│   │   │   └── page.tsx
│   │   ├── guides/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── vendors/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── bookings/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── transactions/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── withdrawals/
│   │   │   └── page.tsx
│   │   └── split-config/
│   │       └── page.tsx
├── components/
│   ├── ui/                     ← shadcn components (jangan diubah)
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Topbar.tsx
│   ├── tables/                 ← Reusable data table per entitas
│   └── forms/                  ← Form components
├── services/
│   ├── api.ts                  ← Axios instance + interceptor
│   ├── auth.service.ts
│   ├── users.service.ts
│   ├── guides.service.ts
│   ├── vendors.service.ts
│   ├── bookings.service.ts
│   ├── transactions.service.ts
│   ├── withdrawals.service.ts
│   └── admin.service.ts
├── store/
│   ├── auth.store.ts           ← Zustand: token, user info
│   └── ui.store.ts             ← Zustand: sidebar state, loading
├── types/
│   ├── auth.types.ts
│   ├── user.types.ts
│   ├── guide.types.ts
│   ├── vendor.types.ts
│   ├── booking.types.ts
│   ├── transaction.types.ts
│   └── withdrawal.types.ts
└── lib/
    ├── utils.ts                ← cn(), formatRupiah(), formatDate()
    └── constants.ts            ← API_BASE_URL, STATUS_COLORS, dll
```

---

## 4. KONVENSI WAJIB

### API Service
```typescript
// WAJIB: semua API call ada di src/services/, BUKAN di dalam page/component langsung
// Contoh: src/services/transactions.service.ts
import api from './api'

export const getTransactions = async (status?: string) => {
  const res = await api.get('/transactions', { params: { status } })
  return res.data
}

export const approveTransaction = async (id: string, payment_method: string) => {
  const res = await api.post(`/transactions/${id}/approve`, { payment_method })
  return res.data
}
```

### Axios Instance (src/services/api.ts)
```typescript
// WAJIB: gunakan interceptor untuk:
// 1. Inject Authorization: Bearer {token} di setiap request
// 2. Auto-refresh token jika response 401
// 3. Redirect ke /login jika refresh gagal
```

### Zustand Auth Store
```typescript
// WAJIB: simpan di src/store/auth.store.ts
interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: UserProfile | null
  setTokens: (access: string, refresh: string) => void
  setUser: (user: UserProfile) => void
  logout: () => void
}
// Persist ke localStorage menggunakan zustand/middleware persist
```

### Status Badge Colors
```
pending_vendor_approval  → yellow / warning
payment_pending          → blue / info
settled                  → green / success
rejected                 → red / destructive
pending (withdrawal)     → yellow
processing               → blue
completed                → green
failed                   → red
```

### Format Angka
```typescript
// WAJIB gunakan helper ini untuk semua angka rupiah
export const formatRupiah = (amount: number | string) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(amount))
```

---

## 5. AUTHENTICATION FLOW

```
User buka /login
    ↓
POST /auth/login { user_email, user_password }
    ↓
Response: { access_token, refresh_token, user_type, ... }
    ↓
Simpan ke Zustand + localStorage (persist)
    ↓
Redirect ke /dashboard
    ↓
Setiap request → inject header: Authorization: Bearer {access_token}
    ↓
Jika 401 → POST /auth/refresh { refresh_token }
    ↓
Dapat access_token baru → retry request
    ↓
Jika refresh juga 401 → logout → redirect /login
```

---

## 6. ATURAN CODING

1. **Semua halaman adalah Server Component** kecuali yang butuh interaktivitas → gunakan `"use client"` hanya saat diperlukan
2. **Jangan fetch di dalam `useEffect` langsung** — buat custom hook di `src/hooks/` atau gunakan service
3. **Loading state wajib** — setiap fetch tampilkan skeleton atau spinner
4. **Error state wajib** — setiap fetch tampilkan pesan error yang informatif
5. **Konfirmasi sebelum aksi destruktif** — disburse, reject, nonaktifkan user → pakai `AlertDialog` dari shadcn
6. **TypeScript strict** — tidak boleh ada `any` kecuali terpaksa dan diberi komentar alasan
7. **Jangan hardcode URL API** — selalu dari `process.env.NEXT_PUBLIC_API_URL` atau `src/lib/constants.ts`
8. **Semua form pakai react-hook-form + zod** untuk validasi

---

## 7. ENV YANG DIPERLUKAN

```env
# nextfront backoffice/.env.local
NEXT_PUBLIC_API_URL=https://api.custherds.ourtestcloud.my.id/api/v1
NEXT_PUBLIC_APP_NAME=Custherds Backoffice
```

---

## 8. URUTAN PENGERJAAN (PRIORITAS)

Kerjakan secara berurutan, jangan skip:

1. **`src/services/api.ts`** — Axios instance + interceptor refresh token
2. **`src/store/auth.store.ts`** — Zustand auth state
3. **`src/types/*.ts`** — Semua TypeScript types dari response API
4. **`/login` page** — Form login + connect ke API
5. **Dashboard layout** — Sidebar + Topbar + route guard
6. **Dashboard home** — Summary cards
7. **Users page** — List + toggle aktif
8. **Guides page** — List + detail
9. **Vendors page** — List + detail + approve/reject
10. **Bookings page** — List + detail + filter
11. **Transactions page** — List + detail + filter status
12. **Withdrawals page** — List + trigger disburse + manual override
13. **Split Config page** — List + form buat baru

---

## 9. REFERENSI API

- **Swagger Docs:** https://api.custherds.ourtestcloud.my.id/docs
- **Base URL:** https://api.custherds.ourtestcloud.my.id/api/v1
- **Auth Header:** `Authorization: Bearer {access_token}`
- **Webhook Token:** `x-callback-token: {XENDIT_WEBHOOK_TOKEN}`

---

## 10. DEFINISI SELESAI (Definition of Done)

Sebuah halaman dianggap **selesai** jika:
- [x] Terhubung ke API nyata (bukan mock)
- [x] Loading state tampil saat fetch
- [x] Error state tampil jika API gagal
- [x] Aksi destructive pakai konfirmasi dialog
- [x] TypeScript tidak ada error
- [x] Responsive (mobile + desktop)
- [x] Token expired di-handle otomatis (tidak logout paksa)
