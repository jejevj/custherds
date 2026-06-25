frontpublic (vue)
nextfront backoffice(next sachdn)

ada dua folder diatas, front public untuk digunakan user umum
kalau nextfront digunakan untuk akses backoffice.

---

## Xendit Integration

- [x] Register akun Xendit dan verifikasi KYC sampai approved
- [x] Generate Secret API Key (Test mode) dari Dashboard > Settings > API Keys dengan permission WRITE untuk Money-In
- [ ] Konfigurasi IP Whitelist server backend di Dashboard Xendit
- [ ] Setup Callback/Webhook URL di Dashboard (Settings > Callback):
  - [ ] Tentukan URL webhook di backend (misal: /webhook/xendit/payments)
  - [ ] Simpan dan uji menggunakan fitur "Save and Test" di dashboard
  - [ ] Simpan x-callback-token untuk verifikasi signature webhook
- [ ] Setup environment variable di backend:
  - [ ] XENDIT_SECRET_KEY (test & live)
  - [ ] XENDIT_CALLBACK_TOKEN
  - [ ] XENDIT_MODE (test/live)
- [ ] Implement client Xendit API di backend (FastAPI):
  - [ ] Basic Auth menggunakan Secret Key (Base64 {secret_key}:) di header Authorization
  - [ ] Helper untuk call endpoint:
    - [ ] POST v3/payment_requests
    - [ ] POST v3/payment_tokens (jika perlu simpan kartu / metode pembayaran)
    - [ ] POST /refunds (jika perlu refund pembayaran)
- [ ] Implement routes Xendit di FastAPI:
  - [ ] POST /xendit/payments (create payment request)
  - [ ] GET /xendit/payments/{payment_request_id} (cek status payment)
  - [ ] POST /xendit/payment-tokens (simpan metode pembayaran customer)
  - [ ] GET /xendit/payment-tokens/{payment_token_id} (cek detail token)
  - [ ] POST /xendit/refunds (buat refund)
  - [ ] GET /xendit/refunds/{refund_id} (cek status refund)
  - [ ] POST /webhook/xendit/payments (terima payment event dari Xendit)
  - [ ] POST /webhook/xendit/refunds (terima refund event dari Xendit)
  - [ ] GET /xendit/config/payment-methods (daftar metode pembayaran aktif)
  - [ ] POST /xendit/payments/simulate (simulasi pembayaran di test mode)
- [ ] Logging & error handling:
  - [ ] Log request/response ke Xendit (tanpa menyimpan data sensitif)
  - [ ] Tangani HTTP error code, timeouts, dan retry yang aman
- [ ] UAT (User Acceptance Test) di Test Mode:
  - [ ] Tes semua payment flow yang dipakai (e-wallet/VA/QR/paylater, dll.)
  - [ ] Verifikasi status transaksi sinkron dengan data di Dashboard Xendit
- [ ] Going live checklist:
  - [ ] Generate Secret Key untuk Live Mode
  - [ ] Update env var ke Live Mode
  - [ ] Konfirmasi IP Whitelist & Callback sudah pakai domain/IP produksi
