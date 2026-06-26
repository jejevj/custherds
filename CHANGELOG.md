# Custherds Backend — Changelog

> Format: `[YYYY-MM-DD HH:MM WIB]` — Commit SHA — Deskripsi

---

## 2026-06-26 — Vendor Payment Flow + Xendit Integration

### Session ini mencakup:
- Implementasi full payment flow untuk vendor (deposit & pay-as-you-go)
- Integrasi Xendit Invoice untuk tagihan vendor
- Integrasi Xendit Disbursement untuk transfer komisi guide
- Wire 23 webhook Xendit ke endpoint API
- Fix kompatibilitas Python 3.9
- Fix alembic migration template

---

### Commits

#### `15d8d70` — 26 Jun 2026, 15:15 WIB
**feat: wire disbursement webhook + admin trigger Xendit disbursement for guide withdrawal**
- Buat `services/xendit_disbursement.py` — service untuk panggil Xendit Disbursement API
- Update `payments.py` — webhook `/webhook/disbursement` sekarang ter-wire ke DB:
  - Status `COMPLETED` → withdrawal update ke `completed`
  - Status `FAILED` → withdrawal update ke `failed`, saldo dikembalikan ke `wallet_balance` guide
- Update `admin.py` — tambah endpoint baru:
  - `GET /admin/withdrawals` — list semua withdrawal guide, bisa filter by status
  - `POST /admin/withdrawals/{id}/disburse` — trigger Xendit Disbursement API, status → `processing`
  - `PUT /admin/withdrawals/{id}/process` — manual override status sebagai fallback
- Update `schemas/admin.py` — tambah `AdminWithdrawalResponse`
- **external_id format Xendit:** `CUSTHERDS-WD-{withdrawal_id}`

---

#### `834d059` — 26 Jun 2026, 15:08 WIB
**fix: re-add payments router (Xendit webhooks & invoice endpoints)**
- `router.py` diperbaiki — `payments` router yang hilang setelah overwrite sebelumnya di-register kembali
- Semua 23 webhook Xendit kembali tampil di Swagger under tag **Payments**

---

#### `dbac447` — 26 Jun 2026, 15:06 WIB
**fix: add missing alembic script.py.mako template**
- File `alembic/script.py.mako` tidak ada di repo sehingga `alembic revision --autogenerate` gagal
- Ditambahkan template standar Alembic agar migration bisa digenerate

---

#### `35a5340` — 26 Jun 2026, 15:03 WIB
**feat: Xendit invoice payment for vendor pay-as-you-go + webhook callback**
- Buat `services/xendit.py` — helper `create_invoice()` dan `get_invoice()` via Xendit REST API (`httpx`)
- Update `transactions.py` endpoint:
  - `POST /transactions/{id}/approve` — vendor approve dengan dua metode:
    - `deposit`: potong `deposit_balance` vendor instan → `settled`
    - `pay_as_you_go`: buat Xendit Invoice sebesar `vendor_amount` → `payment_pending`
  - `GET /transactions/{id}/invoice-url` — vendor ambil ulang link bayar jika terputus
- Tambah `webhooks.py` endpoint (terpisah dari `payments.py`):
  - `POST /webhooks/xendit/invoice-paid` — Xendit callback setelah vendor bayar → status `settled`, kreditkan `guide.wallet_balance`
  - `POST /webhooks/xendit/invoice-expired` — invoice tidak dibayar 24 jam → reset ke `pending_vendor_approval`
- Update `models/transaction.py` — tambah kolom:
  - `xendit_invoice_id` (String 100, indexed)
  - `xendit_invoice_url` (Text)
- Update `schemas/transactions.py` — tambah `xendit_invoice_id`, `xendit_invoice_url`, `TransactionInvoiceResponse`
- Update `router.py` — daftarkan `webhooks` router
- **external_id format Xendit:** `CUSTHERDS-TX-{transaction_code}`

---

#### `3766e7f` — 26 Jun 2026, 14:54 WIB
**fix: add get_db dependency function to session.py**
- `get_db` generator belum ada di `db/session.py` sehingga semua endpoint yang pakai `Depends(get_db)` error
- Ditambahkan fungsi `get_db()` standar SQLAlchemy

---

#### `3d3f9c7` — 26 Jun 2026, 14:53 WIB
**feat: register all endpoints to router + rewrite to match new models**
- Semua endpoint di-register ke `router.py`: health, auth, users, guides, vendors, bookings, transactions, withdrawals, admin, payments
- Rewrite beberapa endpoint agar sesuai dengan model terbaru (field name, relationship)

---

#### `3963581` — 26 Jun 2026, 14:47 WIB
**change requirements**
- Update `requirements.txt` — sesuaikan versi package (termasuk `xendit-python`, `httpx`, `pydantic-settings`)

---

#### `6bc3c8a` — 26 Jun 2026, 14:46 WIB
**fix: remove stale reviewed_transactions relationship**
- `reviewed_by` sudah tidak ada di model `Transaction`
- Hapus relationship `reviewed_transactions` dari model `User` yang menyebabkan error saat startup

---

#### `f8ebf22` — 26 Jun 2026, 14:43 WIB
**fix: replace X|None type hints with Optional[X] for Python 3.9 compat**
- Python 3.9 tidak mendukung `X | None` syntax (baru di Python 3.10+)
- Semua type hint dikonversi ke `Optional[X]` dari `typing` module

---

#### `752e46c` — 26 Jun 2026, 14:40 WIB
**chore: remove duplicate migration**
- Tabel `api_logs` sudah ada di `0001_initial_schema`
- Migration duplikat dihapus agar `alembic upgrade head` tidak konflik

---

#### `caecc2c` — 26 Jun 2026, 14:39 WIB
**feat: invoice-clearing model — migration v0001, seeder, new models**
- Buat initial schema migration (`0001_initial_schema`) mencakup 14 tabel:
  - `users`, `guides`, `vendors`, `destinations`, `bookings`
  - `revenue_split_configs`, `transactions`
  - `guide_withdrawals`, `vendor_deposit_topups`
  - `commission_disbursements`, `commission_disbursement_items`
  - `audit_logs`, `api_logs`
- Tambah model baru:
  - `GuideWithdrawal` — request penarikan komisi guide ke rekening bank
  - `VendorDepositTopup` — riwayat top-up deposit vendor
- Update `Transaction` model — tambah field split snapshot, xendit fields, status tracking
- Update `Guide` model — tambah `wallet_balance`, `total_earnings`, `pending_earnings`, `bank_name`, `bank_account_number`, `bank_account_name`
- Update `Vendor` model — tambah `deposit_balance`
- Buat seeder: superadmin, sample guide, sample vendor, booking, split config

---

## Flow Arsitektur (per 26 Jun 2026)

```
Guide upload nota (receipt)
        ↓
Transaction dibuat → pending_vendor_approval
        ↓
Vendor approve
    ├── deposit       → potong deposit_balance → settled instan
    └── pay_as_you_go → Xendit Invoice (vendor_amount)
                              ↓
                        Vendor bayar via link
                              ↓
                   /webhooks/xendit/invoice-paid
                              ↓
                    status → settled
                    guide.wallet_balance += guide_commission

Guide request withdrawal
        ↓
Admin → POST /admin/withdrawals/{id}/disburse
        ↓
Xendit Disbursement API (kirim ke rekening bank guide)
        ↓
/payments/webhook/disbursement
    ├── COMPLETED → withdrawal.status = completed
    └── FAILED    → withdrawal.status = failed
                    guide.wallet_balance dikembalikan
```

---

## Webhook Xendit Terdaftar (per 26 Jun 2026)

| # | Endpoint | Dashboard Section |
|---|----------|-------------------|
| 1 | `/payments/webhook/invoice` | Invoices |
| 2 | `/payments/webhook/fva` | Fixed Virtual Accounts |
| 3 | `/payments/webhook/disbursement` | **Disbursement** ✅ Wired |
| 4 | `/payments/webhook/payout` | Payout Link |
| 5 | `/payments/webhook/retail` | Retail Outlets (OTC) |
| 6 | `/payments/webhook/cards` | Cards |
| 7 | `/payments/webhook/direct-debit` | Direct Debit |
| 8 | `/payments/webhook/ewallet` | E-Wallets |
| 9 | `/payments/webhook/qr` | QR Codes / QRIS |
| 10 | `/payments/webhook/paylater` | PayLater |
| 11 | `/payments/webhook/payment-requests-v2` | Payment Requests V2 |
| 12 | `/payments/webhook/payment-requests-v3` | Payment Requests V3 |
| 13 | `/payments/webhook/payment-tokens-v3` | Payment Tokens V3 |
| 14 | `/payments/webhook/refunds` | Unified Refunds |
| 15 | `/payments/webhook/recurring` | Recurring |
| 16 | `/payments/webhook/payment-session` | Payment Session |
| 17 | `/payments/webhook/xenplatform` | XenPlatform |
| 18 | `/payments/webhook/payment-method-v2` | Payment Method V2 |
| 19 | `/payments/webhook/bill-payments` | Bill Payments |
| 20 | `/payments/webhook/payouts` | Payouts V2 & V3 |
| 21 | `/payments/webhook/recipient-verification` | Recipient Verification |
| 22 | `/payments/webhook/report` | Balance & Transactions Report |
| 23 | `/payments/webhook/conversions` | Conversions |
| 24 | `/webhooks/xendit/invoice-paid` | **Invoice Paid** ✅ Wired |
| 25 | `/webhooks/xendit/invoice-expired` | **Invoice Expired** ✅ Wired |

---

## Next Steps (Backlog)

- [ ] Deposit vendor via Virtual Account (topup `deposit_balance`)
- [ ] Notifikasi email/push saat transaksi settled
- [ ] Test end-to-end full flow
- [ ] Frontend integration (dashboard partner)
