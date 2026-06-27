# Changelog — Custherds Backend API

Format mengikuti [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

---

## [2026-06-27] — Xendit Webhook Invoice Fix

### Fixed
- **`payments.py` — `POST /api/v1/payments/webhook/invoice`**
  - Handler sebelumnya hanya mengembalikan `{"status": "ok"}` tanpa menyentuh database sama sekali.
  - Fix pertama: tambah logika settle transaksi, kredit wallet guide, dan set booking → `completed`.
    - Commit: [`885a21a`](https://github.com/jejevj/custherds/commit/885a21a229794bf758304ceef072e0bc4987ed56)
  - Fix kedua: error `TypeError: unsupported operand type(s) for +: 'decimal.Decimal' and 'float'` — kolom `wallet_balance` dan `total_earnings` di PostgreSQL bertipe `NUMERIC`, sehingga tidak bisa dijumlahkan langsung dengan `float`. Solusi: import `Decimal` dan pakai `Decimal(str(tx.guide_commission))` serta `Decimal(0)` sebagai fallback.
    - Commit: [`146df99`](https://github.com/jejevj/custherds/commit/146df992cbb395215c47395a8e0c23d18ee34e9c)

### Manual Recovery
- TX `TX3909968793` dan `TX8442554889` di-settle secara manual via script Python karena webhook gagal sebelum fix.
- Booking dan wallet guide terkait sudah diperbarui.

---

## [2026-06-21] — Auth, Swagger, & Project Skeleton

### Added
- Basic Auth protection untuk `/docs`, `/redoc`, `/openapi.json`
  - Commit: [`799a1ab`](https://github.com/jejevj/custherds/commit/799a1ab89fa357b5de74d440086fc8b1a59d78f2)
- Health check endpoint `GET /api/v1/health` — status DB + latency
  - Commit: [`740bfae`](https://github.com/jejevj/custherds/commit/740bfae89052933094b9044d13eb07868f0f9fa0)
- Init struktur folder FastAPI lengkap
  - Commit: [`84bf655`](https://github.com/jejevj/custherds/commit/84bf655ed3decf8af6e00736af3a409b9d01486a)

### Fixed
- Circular import — `Base` dipisah ke `db/base_class.py`
  - Commit: [`1fe0f57`](https://github.com/jejevj/custherds/commit/1fe0f57c682be4c50dc4d2b5d892274bbd9fd381)
