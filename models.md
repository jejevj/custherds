# Custherds — Database Models Reference

Dokumen ini mendefinisikan semua entitas/model database berdasarkan `flow.md`, form registrasi `frontpublic`, dan kebutuhan bisnis platform.

> **Catatan penting:**
> - Tourist **tidak memiliki akun** di sistem. Data turis hanya dicatat sebagai informasi dalam booking.
> - Alur utama: **Guide buat booking → Vendor approve → Layanan diterima turis → Vendor upload kuitansi → Superadmin validasi → Bagi hasil dihitung otomatis → Komisi guide dijadwalkan**.

---

## 1. User (Tabel: `users`)

Entitas utama untuk semua pengguna sistem: Guide/Partner, Vendor, dan Admin.

| Field | Type | Wajib | Keterangan |
|-------|------|-------|------------|
| `id` | UUID PK | ✅ | Primary key |
| `user_name` | VARCHAR(255) | ✅ | Full name of contact person |
| `user_email` | VARCHAR(255) UNIQUE | ✅ | Email address (login) |
| `user_phone` | VARCHAR(30) | ❌ | Phone number e.g. +628123456789 |
| `user_password` | VARCHAR(255) | ✅ | Hashed password (bcrypt, cost ≥ 12) |
| `user_type` | SMALLINT | ✅ | `1` = Guide/Partner, `2` = Vendor, `99` = Superadmin |
| `ig_link` | VARCHAR(255) | ❌ | Instagram URL |
| `fb_link` | VARCHAR(255) | ❌ | Facebook URL |
| `yt_link` | VARCHAR(255) | ❌ | YouTube URL |
| `tiktok_link` | VARCHAR(255) | ❌ | TikTok URL |
| `is_active` | BOOLEAN | ✅ | Default: `False`. Diaktifkan setelah approval admin |
| `is_verified` | BOOLEAN | ✅ | Default: `False`. Email sudah diverifikasi |
| `tnc_accepted` | BOOLEAN | ✅ | Default: `False` |
| `tnc_accepted_at` | TIMESTAMP | ❌ | Waktu setuju T&C |
| `last_login_at` | TIMESTAMP | ❌ | Waktu login terakhir |
| `created_at` | TIMESTAMP | ✅ | |
| `updated_at` | TIMESTAMP | ✅ | |

---

## 2. Guide Profile (Tabel: `guides`)

Profil tambahan untuk `user_type = 1`.

| Field | Type | Wajib | Keterangan |
|-------|------|-------|------------|
| `id` | UUID PK | ✅ | |
| `user_id` | FK → users.id UNIQUE | ✅ | One-to-one dengan users |
| `guide_nationality` | VARCHAR(100) | ❌ | Negara asal |
| `guide_certificate` | VARCHAR(500) | ❌ | URL file lisensi di object storage |
| `guide_certificate_status` | VARCHAR(20) | ✅ | `pending`, `approved`, `rejected` (default: `pending`) |
| `bio` | TEXT | ❌ | Bio singkat |
| `languages` | VARCHAR(255) | ❌ | Bahasa yang dikuasai |
| `rating` | FLOAT | ❌ | Rating rata-rata (dihitung dari bookings) |
| `total_earnings` | DECIMAL(15,2) | ✅ | Akumulasi komisi diterima (default: `0.00`) |
| `pending_earnings` | DECIMAL(15,2) | ✅ | Komisi menunggu disbursement (default: `0.00`) |
| `bank_name` | VARCHAR(100) | ❌ | Nama bank |
| `bank_account_number` | VARCHAR(50) | ❌ | Nomor rekening |
| `bank_account_name` | VARCHAR(255) | ❌ | Nama pemilik rekening |
| `created_at` | TIMESTAMP | ✅ | |
| `updated_at` | TIMESTAMP | ✅ | |

---

## 3. Vendor Profile (Tabel: `vendors`)

Profil bisnis untuk `user_type = 2`.

| Field | Type | Wajib | Keterangan |
|-------|------|-------|------------|
| `id` | UUID PK | ✅ | |
| `user_id` | FK → users.id UNIQUE | ✅ | One-to-one dengan users |
| `vendor_business_name` | VARCHAR(255) | ✅ | Nama bisnis/venue |
| `vendor_category` | INTEGER | ✅ | ID kategori (lihat referensi di bawah) |
| `vendor_area` | INTEGER | ✅ | ID area Bali (lihat referensi di bawah) |
| `vendor_location` | TEXT | ❌ | Alamat fisik |
| `vendor_contact_person` | VARCHAR(255) | ❌ | Nama kontak on-site |
| `vendor_website` | VARCHAR(255) | ❌ | URL website |
| `vendor_short_description` | TEXT | ❌ | Tagline/deskripsi singkat |
| `vendor_opening_hours` | VARCHAR(255) | ❌ | Jam operasional |
| `vendor_min_spend` | DECIMAL(15,2) | ❌ | Minimum spend |
| `vendor_cashback_percent` | FLOAT | ✅ | % komisi untuk guide (min: 5, max: 100) |
| `vendor_know_from` | TEXT | ❌ | Sumber info tentang Custherds |
| `vendor_status` | VARCHAR(20) | ✅ | `pending`, `approved`, `rejected`, `suspended` |
| `approval_notes` | TEXT | ❌ | Catatan admin saat review |
| `created_at` | TIMESTAMP | ✅ | |
| `updated_at` | TIMESTAMP | ✅ | |

### Referensi: Kategori Vendor

| ID | Nama | Grup |
|----|------|------|
| 22 | Villas | Stay |
| 23 | Hotels | Stay |
| 24 | Guesthouses | Stay |
| 25 | Retreats | Stay |
| 26 | Cafés | Eat & Drink |
| 27 | Restaurants | Eat & Drink |
| 28 | Beach Clubs | Eat & Drink |
| 29 | Bars | Eat & Drink |
| 30 | Spas & Massage | Wellness |
| 31 | Beauty & Salon | Wellness |
| 32 | Yoga & Fitness | Wellness |
| 33 | Healing & Therapy | Wellness |
| 34 | Fashion & Boutique | Shopping |
| 35 | Art & Craft | Shopping |
| 36 | Jewelry | Shopping |
| 37 | Souvenirs | Shopping |
| 38 | Tours & Day Trips | Activities |
| 39 | Adventures (ATV, Waterfalls, Surfing) | Activities |
| 40 | Workshops & Classes | Activities |
| 41 | Culture & Tradition | Activities |
| 42 | Scooter & Car Rental | Transport |
| 43 | Private Drivers | Transport |
| 44 | Airport Transfer | Transport |
| 45 | Weddings & Parties | Events |
| 46 | Photoshoots | Events |
| 47 | Event Organizers | Events |
| 48 | Coworking Spaces | Business & Services |
| 49 | Real Estate | Business & Services |
| 50 | Visa & Legal Help | Business & Services |
| 51 | Digital & Media Services | Business & Services |

### Referensi: Area Vendor

| ID | Area | Wilayah |
|----|------|---------|
| 1 | Canggu | South Bali |
| 2 | Pererenan | South Bali |
| 3 | Seminyak | South Bali |
| 4 | Legian | South Bali |
| 5 | Kuta | South Bali |
| 6 | Jimbaran | South Bali |
| 7 | Uluwatu | South Bali |
| 8 | Nusa Dua | South Bali |
| 9 | Tanah Lot | South Bali |
| 10 | Ubud | Central Bali |
| 11 | Tegallalang | Central Bali |
| 12 | Sidemen | Central Bali |
| 13 | Tabanan | Central Bali |
| 14 | Lovina | North Bali |
| 15 | Munduk | North Bali |
| 16 | Singaraja | North Bali |
| 17 | Amed | East Bali |
| 18 | Candidasa | East Bali |
| 19 | Nusa Penida | Islands |
| 20 | Nusa Lembongan | Islands |
| 21 | Nusa Ceningan | Islands |

---

## 4. Product / Service Listing (Tabel: `products`)

Produk/paket layanan yang didaftarkan vendor agar bisa dipilih guide saat booking.

| Field | Type | Wajib | Keterangan |
|-------|------|-------|------------|
| `id` | UUID PK | ✅ | |
| `vendor_id` | FK → vendors.id | ✅ | Pemilik produk |
| `name` | VARCHAR(255) | ✅ | Nama produk/paket |
| `description` | TEXT | ❌ | Deskripsi detail |
| `price` | DECIMAL(15,2) | ✅ | Harga normal |
| `currency` | VARCHAR(10) | ✅ | Default: `IDR` |
| `min_pax` | INTEGER | ❌ | Minimum jumlah tamu |
| `max_pax` | INTEGER | ❌ | Maksimum jumlah tamu |
| `images` | TEXT | ❌ | JSON array URL gambar |
| `is_active` | BOOLEAN | ✅ | Default: `True` |
| `created_at` | TIMESTAMP | ✅ | |
| `updated_at` | TIMESTAMP | ✅ | |

---

## 5. Booking (Tabel: `bookings`)

Reservasi yang dibuat oleh **Guide** untuk membawa turis ke vendor pada waktu tertentu.
Turis **tidak memiliki akun** — data turis hanya dicatat sebagai teks informasi.

| Field | Type | Wajib | Keterangan |
|-------|------|-------|------------|
| `id` | UUID PK | ✅ | |
| `booking_code` | VARCHAR(20) UNIQUE | ✅ | Kode booking yang diberikan ke guide (format: `BK-YYYYMMDD-XXXX`) |
| `guide_id` | FK → guides.id | ✅ | Guide yang membuat booking |
| `vendor_id` | FK → vendors.id | ✅ | Vendor tujuan |
| `product_id` | FK → products.id | ❌ | Produk/paket yang dipesan (nullable = umum/walk-in) |
| `booking_date` | DATE | ✅ | Tanggal kunjungan yang dipesan |
| `booking_time` | TIME | ❌ | Jam kunjungan (opsional) |
| `pax_count` | INTEGER | ✅ | Jumlah turis yang dibawa (default: `1`) |
| `tourist_names` | TEXT | ❌ | Nama-nama turis (plain text / JSON array, tidak FK) |
| `tourist_nationality` | VARCHAR(100) | ❌ | Kewarganegaraan turis |
| `notes` | TEXT | ❌ | Catatan tambahan dari guide |
| `status` | VARCHAR(30) | ✅ | `pending_vendor` → `approved` → `completed` → `cancelled` |
| `vendor_approval_at` | TIMESTAMP | ❌ | Waktu vendor approve |
| `vendor_rejection_reason` | TEXT | ❌ | Alasan vendor menolak booking |
| `created_at` | TIMESTAMP | ✅ | |
| `updated_at` | TIMESTAMP | ✅ | |

### Status Flow Booking
```
pending_vendor
    ├── [vendor approve]  → approved
    │       └── [layanan selesai, vendor upload kuitansi] → completed
    └── [vendor reject]   → cancelled
```

---

## 6. Transaction (Tabel: `transactions`)

Dibuat oleh **Vendor** setelah layanan selesai diberikan, dengan melampirkan kuitansi/nota pembayaran dari turis. Satu booking bisa menghasilkan tepat satu transaksi.

| Field | Type | Wajib | Keterangan |
|-------|------|-------|------------|
| `id` | UUID PK | ✅ | |
| `transaction_code` | VARCHAR(30) UNIQUE | ✅ | Format: `TRX-YYYYMMDD-XXXX` |
| `booking_id` | FK → bookings.id UNIQUE | ✅ | One-to-one dengan booking |
| `vendor_id` | FK → vendors.id | ✅ | Vendor yang mengajukan transaksi |
| `guide_id` | FK → guides.id | ✅ | Guide terkait (di-copy dari booking) |
| `gross_amount` | DECIMAL(15,2) | ✅ | Nominal total yang dibayarkan turis ke vendor |
| `currency` | VARCHAR(10) | ✅ | Default: `IDR` |
| `receipt_image` | VARCHAR(500) | ✅ | URL foto kuitansi/nota di object storage |
| `receipt_notes` | TEXT | ❌ | Catatan vendor saat upload kuitansi |
| `split_config_id` | FK → revenue_split_configs.id | ✅ | Snapshot config bagi hasil yang digunakan saat transaksi |
| `vendor_amount` | DECIMAL(15,2) | ✅ | Nominal bagian vendor (dihitung otomatis) |
| `guide_commission` | DECIMAL(15,2) | ✅ | Nominal komisi guide (dihitung otomatis) |
| `platform_fee` | DECIMAL(15,2) | ✅ | Nominal fee platform (dihitung otomatis) |
| `vendor_percent_snapshot` | FLOAT | ✅ | % vendor saat transaksi (snapshot) |
| `guide_percent_snapshot` | FLOAT | ✅ | % guide saat transaksi (snapshot) |
| `platform_percent_snapshot` | FLOAT | ✅ | % platform saat transaksi (snapshot) |
| `status` | VARCHAR(30) | ✅ | `pending_review` → `approved` → `settled` → `rejected` |
| `submitted_at` | TIMESTAMP | ✅ | Waktu vendor submit transaksi |
| `reviewed_by` | FK → users.id | ❌ | Superadmin yang melakukan review |
| `reviewed_at` | TIMESTAMP | ❌ | Waktu superadmin review |
| `review_notes` | TEXT | ❌ | Catatan dari superadmin |
| `rejection_reason` | TEXT | ❌ | Alasan penolakan (jika rejected) |
| `settled_at` | TIMESTAMP | ❌ | Waktu transaksi dinyatakan settled |
| `created_at` | TIMESTAMP | ✅ | |
| `updated_at` | TIMESTAMP | ✅ | |

### Status Flow Transaksi
```
pending_review  (vendor baru submit)
    ├── [superadmin approve] → approved
    │       └── [komisi diproses/dibayar] → settled
    └── [superadmin reject]  → rejected
            └── [vendor perbaiki & resubmit] → pending_review
```

---

## 7. Revenue Split Config (Tabel: `revenue_split_configs`)

Konfigurasi persentase bagi hasil yang dikelola oleh **Superadmin**. Total ketiga pihak **harus selalu = 100%**. Histori perubahan disimpan sehingga setiap transaksi memakai config yang berlaku saat itu (snapshot).

| Field | Type | Wajib | Keterangan |
|-------|------|-------|------------|
| `id` | UUID PK | ✅ | |
| `vendor_percent` | FLOAT | ✅ | % bagian vendor (contoh: `85.0`) |
| `guide_percent` | FLOAT | ✅ | % komisi guide (contoh: `10.0`) |
| `platform_percent` | FLOAT | ✅ | % fee platform (contoh: `5.0`) |
| `is_active` | BOOLEAN | ✅ | Hanya satu record yang `True` pada satu waktu |
| `notes` | TEXT | ❌ | Alasan perubahan config |
| `set_by` | FK → users.id | ✅ | Superadmin yang mengatur |
| `effective_from` | TIMESTAMP | ✅ | Berlaku mulai kapan |
| `created_at` | TIMESTAMP | ✅ | |

> **Constraint:** `vendor_percent + guide_percent + platform_percent` harus `= 100.0` (validasi di backend sebelum simpan).

---

## 8. Commission Disbursement (Tabel: `commission_disbursements`)

Pencatatan pembayaran komisi ke guide, dijadwalkan secara periodik (mingguan/bulanan) oleh superadmin atau sistem.

| Field | Type | Wajib | Keterangan |
|-------|------|-------|------------|
| `id` | UUID PK | ✅ | |
| `guide_id` | FK → guides.id | ✅ | Guide penerima |
| `period_start` | DATE | ✅ | Awal periode perhitungan |
| `period_end` | DATE | ✅ | Akhir periode perhitungan |
| `total_amount` | DECIMAL(15,2) | ✅ | Total komisi yang dibayarkan |
| `transaction_count` | INTEGER | ✅ | Jumlah transaksi yang ter-cover |
| `bank_name` | VARCHAR(100) | ✅ | Snapshot bank guide saat disbursement |
| `bank_account_number` | VARCHAR(50) | ✅ | Snapshot nomor rekening |
| `bank_account_name` | VARCHAR(255) | ✅ | Snapshot nama pemilik rekening |
| `xendit_disbursement_id` | VARCHAR(255) | ❌ | ID disbursement dari Xendit |
| `status` | VARCHAR(20) | ✅ | `pending`, `processing`, `completed`, `failed` |
| `processed_by` | FK → users.id | ❌ | Superadmin yang memproses |
| `processed_at` | TIMESTAMP | ❌ | Waktu diproses |
| `notes` | TEXT | ❌ | Catatan |
| `created_at` | TIMESTAMP | ✅ | |
| `updated_at` | TIMESTAMP | ✅ | |

---

## 9. Commission Disbursement Items (Tabel: `commission_disbursement_items`)

Detail transaksi mana saja yang masuk dalam satu batch disbursement.

| Field | Type | Wajib | Keterangan |
|-------|------|-------|------------|
| `id` | UUID PK | ✅ | |
| `disbursement_id` | FK → commission_disbursements.id | ✅ | |
| `transaction_id` | FK → transactions.id | ✅ | Transaksi yang masuk batch ini |
| `guide_commission` | DECIMAL(15,2) | ✅ | Snapshot nominal komisi dari transaksi |
| `created_at` | TIMESTAMP | ✅ | |

---

## 10. Destination (Tabel: `destinations`)

Data destinasi wisata yang dikelola via backoffice, bisa dikaitkan ke vendor.

| Field | Type | Wajib | Keterangan |
|-------|------|-------|------------|
| `id` | UUID PK | ✅ | |
| `vendor_id` | FK → vendors.id | ❌ | Vendor pemilik destinasi (nullable = destinasi umum) |
| `name` | VARCHAR(255) | ✅ | Nama destinasi |
| `area_id` | INTEGER | ✅ | ID area Bali |
| `description` | TEXT | ❌ | Deskripsi |
| `images` | TEXT | ❌ | JSON array URL gambar |
| `is_active` | BOOLEAN | ✅ | Default: `True` |
| `created_at` | TIMESTAMP | ✅ | |
| `updated_at` | TIMESTAMP | ✅ | |

---

## 11. Audit Log (Tabel: `audit_logs`)

Riwayat semua aksi penting (approval, rejection, perubahan config) untuk keperluan audit superadmin.

| Field | Type | Wajib | Keterangan |
|-------|------|-------|------------|
| `id` | UUID PK | ✅ | |
| `actor_id` | FK → users.id | ✅ | User yang melakukan aksi |
| `action` | VARCHAR(100) | ✅ | e.g. `booking.approved`, `transaction.rejected`, `split_config.updated` |
| `target_type` | VARCHAR(50) | ✅ | e.g. `booking`, `transaction`, `revenue_split_config` |
| `target_id` | UUID | ✅ | ID objek yang dikenai aksi |
| `before_state` | TEXT | ❌ | JSON snapshot sebelum perubahan |
| `after_state` | TEXT | ❌ | JSON snapshot sesudah perubahan |
| `ip_address` | VARCHAR(45) | ❌ | IP address aktor |
| `created_at` | TIMESTAMP | ✅ | |

---

## Relasi Antar Tabel

```
users (1) ──── (1) guides
users (1) ──── (1) vendors

vendors  (1) ──── (N) products
vendors  (1) ──── (N) bookings
guides   (1) ──── (N) bookings
products (1) ──── (N) bookings

bookings (1) ──── (1) transactions

transactions (N) ──── (1) revenue_split_configs
transactions (1) ──── (N) commission_disbursement_items

commission_disbursement_items (N) ──── (1) commission_disbursements
commission_disbursements      (N) ──── (1) guides

vendors (1) ──── (N) destinations

audit_logs (N) ──── (1) users
```

---

## Alur Lengkap Berdasarkan `flow.md`

```
[1] Guide buat Booking
      → bookings.status = pending_vendor

[2] Vendor terima notifikasi → approve/reject
      → approve : bookings.status = approved
      → reject  : bookings.status = cancelled

[3] Turis datang, menikmati layanan, bayar ke vendor langsung
      (tidak ada akun turis, tidak ada payment gateway di tahap ini)

[4] Vendor upload kuitansi & nominal
      → INSERT transactions (status = pending_review)
      → bookings.status = completed

[5] Superadmin review kuitansi
      → valid   : transactions.status = approved
                  → hitung otomatis:
                      vendor_amount    = gross_amount × vendor_percent
                      guide_commission = gross_amount × guide_percent
                      platform_fee     = gross_amount × platform_percent
      → invalid : transactions.status = rejected
                  → vendor perbaiki → resubmit → pending_review

[6] Komisi guide terakumulasi di guides.pending_earnings

[7] Superadmin/sistem buat batch disbursement (mingguan/bulanan)
      → INSERT commission_disbursements
      → INSERT commission_disbursement_items (per transaksi)
      → Kirim via Xendit Disbursement API
      → Update guides.total_earnings, guides.pending_earnings
      → commission_disbursements.status = completed
```

---

## Catatan Implementasi

- Semua `id` menggunakan **UUID v4**
- Password: **bcrypt**, cost factor ≥ 12
- File upload (kuitansi, lisensi guide, foto produk) → **object storage** (S3 / Cloudflare R2), tidak disimpan di DB
- `*_percent_snapshot` di `transactions` adalah **salinan statis** dari config yang berlaku saat transaksi disubmit. Perubahan config berikutnya tidak mempengaruhi transaksi lama
- `revenue_split_configs`: hanya **satu record** yang boleh `is_active = True`. Saat superadmin buat config baru, record lama otomatis di-set `is_active = False`
- Total validasi: `vendor_percent + guide_percent + platform_percent == 100.0` dilakukan di **backend (FastAPI)**, bukan hanya di DB
- Kode booking (`BK-YYYYMMDD-XXXX`) dan kode transaksi (`TRX-YYYYMMDD-XXXX`) di-generate di backend, **bukan auto-increment**
