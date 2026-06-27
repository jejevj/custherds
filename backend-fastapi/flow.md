# Custherds Backend — Flow Dokumen

> Last updated: 2026-06-27

Dokumen ini menjelaskan alur bisnis utama yang sudah berjalan di sistem.

---

## 1. Alur Booking & Pembayaran (Pay As You Go)

```
Tourist                  Vendor                    Backend API              Xendit
  │                        │                            │                      │
  │── POST /bookings ──────►│                            │                      │
  │                        │── vendor review ──────────►│                      │
  │                        │   (approve/reject)         │                      │
  │                        │◄── booking: vendor_approved│                      │
  │                        │                            │                      │
  │                        │── POST /transactions ──────►│                      │
  │                        │   (buat TX + invoice)      │── Invoice.create() ──►│
  │                        │                            │◄── invoice_url ───────│
  │                        │◄── xendit_invoice_url ─────│                      │
  │                        │                            │                      │
  │                        │── buka invoice_url ────────────────────────────────►│
  │                        │                            │                      │
  │                        │   BAYAR (Bank/QRIS/VA)     │                      │
  │                        │                            │◄── Webhook PAID ──────│
  │                        │                            │  POST /payments/      │
  │                        │                            │  webhook/invoice      │
  │                        │                            │                      │
  │                        │                            │ [settle TX]
  │                        │                            │   tx.status = settled
  │                        │                            │   tx.paid_at = now
  │                        │                            │   tx.settled_at = now
  │                        │                            │
  │                        │                            │ [kredit wallet guide]
  │                        │                            │   guide.wallet_balance += guide_commission
  │                        │                            │   guide.total_earnings += guide_commission
  │                        │                            │
  │                        │                            │ [set booking completed]
  │                        │                            │   booking.status = completed
  │                        │                            │   booking.completed_at = now
```

### Kalkulasi Pembayaran

| Komponen | Persentase | Keterangan |
|---|---|---|
| `gross_amount` | 100% | Total nilai booking |
| `vendor_amount` | `vendor_percent_snapshot` % | Bagian vendor (default 80%) |
| `guide_commission` | `guide_percent_snapshot` % | Bagian guide (default 15%) |
| `platform_fee` | `platform_percent_snapshot` % | Fee platform Custherds (default 5%) |

> **Yang dibayar via Xendit invoice = `guide_commission + platform_fee`** (bukan `gross_amount`).
> `vendor_amount` dibayar langsung oleh tourist ke vendor di luar sistem.

---

## 2. Alur Penarikan Saldo Guide (Disbursement)

```
Guide                    Backend API               Xendit
  │                           │                      │
  │── POST /withdrawals ──────►│                      │
  │   (request withdraw)      │                      │
  │                           │ validasi saldo        │
  │                           │ buat GuideWithdrawal  │
  │                           │   status = pending    │
  │                           │                      │
  │                           │── Disbursement.create()─►│
  │                           │   external_id =       │
  │                           │   CUSTHERDS-WD-{id}   │
  │                           │                      │
  │                           │◄── disbursement_id ───│
  │                           │   status = processing │
  │                           │                      │
  │                           │          ... proses transfer ...
  │                           │                      │
  │                           │◄── Webhook COMPLETED/FAILED
  │                           │  POST /payments/webhook/disbursement
  │                           │                      │
  │                           │ [COMPLETED]
  │                           │   withdrawal.status = completed
  │                           │
  │                           │ [FAILED]
  │                           │   withdrawal.status = failed
  │                           │   guide.wallet_balance += amount (refund)
```

---

## 3. Webhook Endpoints

| URL | Event Xendit | Aksi di DB |
|---|---|---|
| `POST /api/v1/payments/webhook/invoice` | Invoices paid | Settle TX, kredit wallet guide, booking → completed |
| `POST /api/v1/payments/webhook/disbursement` | Disbursement completed/failed | Update status withdrawal, refund saldo jika failed |
| `POST /api/v1/payments/webhook/fva` | Fixed VA paid | Log only (belum wired ke DB) |
| `POST /api/v1/payments/webhook/ewallet` | E-Wallet | Log only |
| `POST /api/v1/payments/webhook/qr` | QRIS | Log only |
| `POST /api/v1/payments/webhook/payout` | Payout Link | Log only |

---

## 4. Status Machine Transaksi

```
payment_pending
      │
      │  Xendit webhook PAID
      ▼
   settled  ◄────────── (hanya satu arah, tidak bisa kembali)
```

## 5. Status Machine Booking

```
pending
   │
   │  vendor approve
   ▼
vendor_approved
   │
   │  TX dibuat + invoice Xendit generated
   ▼
waitng_payment     (alias: payment_pending di sisi TX)
   │
   │  webhook invoice PAID
   ▼
completed

   (kapan saja sebelum completed)
   │  vendor reject / cancel
   ▼
cancelled
```

---

## 6. Format `external_id` Xendit

| Jenis | Format | Contoh |
|---|---|---|
| Invoice (Pay As You Go) | `CUSTHERDS-TX-{transaction_code}` | `CUSTHERDS-TX-TX3909968793` |
| Disbursement (Guide Withdrawal) | `CUSTHERDS-WD-{withdrawal_id}` | `CUSTHERDS-WD-550e8400-...` |

---

## 7. Stack & Deployment

| Komponen | Detail |
|---|---|
| Framework | FastAPI + Uvicorn |
| Database | PostgreSQL 15 via SQLAlchemy + Alembic |
| Payment Gateway | Xendit (mode: development/staging) |
| Auth | JWT (access token 1440 menit, refresh token 7 hari) |
| Server | VPS — `CT-WHM-00`, port `3005` |
| Domain API | `https://api-custherds.ourtestcloud.my.id` |
| Domain Frontend | `https://partners-custherds.ourtestcloud.my.id` |
| Process Manager | systemd — `custherds-api.service` |
