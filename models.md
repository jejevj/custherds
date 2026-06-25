# Custherds — Database Models Reference

Dokumen ini mendefinisikan semua entitas/model database berdasarkan form registrasi di `frontpublic` (Register.vue & TouristAuth.vue) dan kebutuhan bisnis platform.

---

## 1. User (Tabel: `users`)

Entitas utama untuk semua pengguna sistem (Partner/Guide, Vendor, Tourist, Admin).

| Field | Type | Wajib | Keterangan |
|-------|------|-------|------------|
| `id` | UUID / BIGINT PK | ✅ | Primary key |
| `user_name` | VARCHAR(255) | ✅ | Full name of contact person |
| `user_email` | VARCHAR(255) UNIQUE | ✅ | Email address (login) |
| `user_phone` | VARCHAR(30) | ❌ | Phone number e.g. +628123456789 |
| `user_password` | VARCHAR(255) | ✅ | Hashed password (bcrypt) |
| `user_type` | SMALLINT | ✅ | `1` = Partner/Guide, `2` = Vendor, `3` = Tourist, `99` = Admin |
| `ig_link` | VARCHAR(255) | ❌ | Instagram profile URL |
| `fb_link` | VARCHAR(255) | ❌ | Facebook profile URL |
| `yt_link` | VARCHAR(255) | ❌ | YouTube channel URL |
| `tiktok_link` | VARCHAR(255) | ❌ | TikTok profile URL |
| `is_active` | BOOLEAN | ✅ | Aktif/nonaktif akun (default: False, aktifkan setelah approval) |
| `is_verified` | BOOLEAN | ✅ | Email/KYC sudah diverifikasi |
| `tnc_accepted` | BOOLEAN | ✅ | Sudah setuju T&C (default: False) |
| `tnc_accepted_at` | TIMESTAMP | ❌ | Waktu user setuju T&C |
| `created_at` | TIMESTAMP | ✅ | Waktu registrasi |
| `updated_at` | TIMESTAMP | ✅ | Waktu update terakhir |
| `last_login_at` | TIMESTAMP | ❌ | Waktu login terakhir |

---

## 2. Guide / Partner Profile (Tabel: `guides`)

Profil tambahan untuk user dengan `user_type = 1` (Herd Partner/Guide).

| Field | Type | Wajib | Keterangan |
|-------|------|-------|------------|
| `id` | UUID / BIGINT PK | ✅ | Primary key |
| `user_id` | FK → users.id | ✅ | Relasi ke tabel users |
| `guide_nationality` | VARCHAR(100) | ❌ | Country of origin |
| `guide_certificate` | VARCHAR(500) | ❌ | Path/URL file lisensi (jpg/png, max 2MB) |
| `guide_certificate_status` | VARCHAR(20) | ✅ | `pending`, `approved`, `rejected` |
| `bio` | TEXT | ❌ | Bio singkat guide |
| `languages` | VARCHAR(255) | ❌ | Bahasa yang dikuasai |
| `rating` | FLOAT | ❌ | Rating rata-rata (dari reviews) |
| `total_earnings` | DECIMAL(15,2) | ✅ | Total komisi yang diterima (default: 0) |
| `bank_name` | VARCHAR(100) | ❌ | Nama bank untuk disbursement |
| `bank_account_number` | VARCHAR(50) | ❌ | Nomor rekening bank |
| `bank_account_name` | VARCHAR(255) | ❌ | Nama pemilik rekening |
| `created_at` | TIMESTAMP | ✅ | |
| `updated_at` | TIMESTAMP | ✅ | |

---

## 3. Vendor Profile (Tabel: `vendors`)

Profil bisnis untuk user dengan `user_type = 2` (Business Vendor).

| Field | Type | Wajib | Keterangan |
|-------|------|-------|------------|
| `id` | UUID / BIGINT PK | ✅ | Primary key |
| `user_id` | FK → users.id | ✅ | Relasi ke tabel users |
| `vendor_business_name` | VARCHAR(255) | ✅ | Nama bisnis/venue |
| `vendor_category` | INTEGER | ✅ | ID kategori bisnis (lihat list kategori di bawah) |
| `vendor_area` | INTEGER | ✅ | ID area lokasi Bali (lihat list area di bawah) |
| `vendor_location` | TEXT | ❌ | Alamat fisik bisnis di Bali |
| `vendor_contact_person` | VARCHAR(255) | ❌ | Nama kontak on-site untuk guide |
| `vendor_website` | VARCHAR(255) | ❌ | URL website bisnis |
| `vendor_short_description` | TEXT | ❌ | Deskripsi singkat / tagline bisnis |
| `vendor_opening_hours` | VARCHAR(255) | ❌ | Jam operasional e.g. Mon–Sun 09:00–22:00 |
| `vendor_min_spend` | DECIMAL(15,2) | ❌ | Minimum spend untuk cashback berlaku |
| `vendor_cashback_percent` | FLOAT | ✅ | Persentase cashback (min: 5, max: 100) |
| `vendor_know_from` | TEXT | ❌ | Dari mana vendor tahu Custherds |
| `vendor_status` | VARCHAR(20) | ✅ | `pending`, `approved`, `rejected`, `suspended` |
| `approval_notes` | TEXT | ❌ | Catatan dari admin saat review |
| `created_at` | TIMESTAMP | ✅ | |
| `updated_at` | TIMESTAMP | ✅ | |

### Referensi: Kategori Vendor (`vendor_category`)

| ID | Nama Kategori | Grup |
|----|--------------|------|
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

### Referensi: Area Vendor (`vendor_area`)

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

## 4. Tourist Profile (Tabel: `tourists`)

Profil untuk user dengan `user_type = 3` (Tourist/Customer dari TouristAuth.vue).

| Field | Type | Wajib | Keterangan |
|-------|------|-------|------------|
| `id` | UUID / BIGINT PK | ✅ | Primary key |
| `user_id` | FK → users.id | ✅ | Relasi ke tabel users |
| `country` | VARCHAR(100) | ❌ | Negara asal tourist |
| `passport_number` | VARCHAR(50) | ❌ | Nomor paspor (opsional, untuk verifikasi) |
| `referred_by_guide_id` | FK → guides.id | ❌ | Guide yang mereferensikan tourist ini |
| `created_at` | TIMESTAMP | ✅ | |
| `updated_at` | TIMESTAMP | ✅ | |

---

## 5. Product / Listing (Tabel: `products`)

Produk/layanan yang ditawarkan vendor kepada guide untuk direferensikan ke tourist.

| Field | Type | Wajib | Keterangan |
|-------|------|-------|------------|
| `id` | UUID / BIGINT PK | ✅ | Primary key |
| `vendor_id` | FK → vendors.id | ✅ | Vendor pemilik produk |
| `name` | VARCHAR(255) | ✅ | Nama produk/paket |
| `description` | TEXT | ❌ | Deskripsi detail produk |
| `price` | DECIMAL(15,2) | ✅ | Harga satuan |
| `currency` | VARCHAR(10) | ✅ | Default: IDR |
| `min_spend` | DECIMAL(15,2) | ❌ | Override min spend khusus produk ini |
| `cashback_percent` | FLOAT | ✅ | Persen cashback (override vendor default) |
| `category_id` | INTEGER | ❌ | Referensi kategori vendor |
| `images` | TEXT | ❌ | JSON array URL gambar produk |
| `is_active` | BOOLEAN | ✅ | Aktif/nonaktif produk (default: True) |
| `created_at` | TIMESTAMP | ✅ | |
| `updated_at` | TIMESTAMP | ✅ | |

---

## 6. Order (Tabel: `orders`)

Transaksi pembelian produk oleh tourist melalui referensi guide.

| Field | Type | Wajib | Keterangan |
|-------|------|-------|------------|
| `id` | UUID / BIGINT PK | ✅ | Primary key |
| `external_id` | VARCHAR(100) UNIQUE | ✅ | ID unik untuk Xendit (format: `ord-{uuid}`) |
| `tourist_id` | FK → tourists.id | ✅ | Tourist yang membeli |
| `guide_id` | FK → guides.id | ✅ | Guide yang mereferensikan |
| `vendor_id` | FK → vendors.id | ✅ | Vendor tempat transaksi |
| `product_id` | FK → products.id | ❌ | Produk yang dibeli (nullable jika walk-in) |
| `amount` | DECIMAL(15,2) | ✅ | Total amount transaksi |
| `currency` | VARCHAR(10) | ✅ | Default: IDR |
| `cashback_percent` | FLOAT | ✅ | Persen cashback saat transaksi (snapshot) |
| `commission_amount` | DECIMAL(15,2) | ✅ | Nominal komisi untuk guide |
| `platform_fee` | DECIMAL(15,2) | ✅ | Fee platform Custherds |
| `status` | VARCHAR(30) | ✅ | `pending`, `paid`, `settled`, `cancelled`, `refunded` |
| `payment_method` | VARCHAR(50) | ❌ | invoice, virtual_account, qr, ewallet |
| `xendit_invoice_id` | VARCHAR(255) | ❌ | ID invoice dari Xendit |
| `xendit_payment_id` | VARCHAR(255) | ❌ | ID pembayaran dari Xendit |
| `paid_at` | TIMESTAMP | ❌ | Waktu pembayaran berhasil |
| `notes` | TEXT | ❌ | Catatan tambahan |
| `created_at` | TIMESTAMP | ✅ | |
| `updated_at` | TIMESTAMP | ✅ | |

---

## 7. Commission / Earning (Tabel: `commissions`)

Riwayat komisi yang diterima guide per transaksi.

| Field | Type | Wajib | Keterangan |
|-------|------|-------|------------|
| `id` | UUID / BIGINT PK | ✅ | Primary key |
| `order_id` | FK → orders.id | ✅ | Relasi ke order |
| `guide_id` | FK → guides.id | ✅ | Guide penerima komisi |
| `amount` | DECIMAL(15,2) | ✅ | Nominal komisi |
| `status` | VARCHAR(20) | ✅ | `pending`, `approved`, `disbursed`, `cancelled` |
| `disbursement_id` | VARCHAR(255) | ❌ | ID disbursement Xendit |
| `disbursed_at` | TIMESTAMP | ❌ | Waktu komisi dikirim ke guide |
| `created_at` | TIMESTAMP | ✅ | |
| `updated_at` | TIMESTAMP | ✅ | |

---

## 8. Review (Tabel: `reviews`)

Ulasan dari tourist terhadap vendor atau guide.

| Field | Type | Wajib | Keterangan |
|-------|------|-------|------------|
| `id` | UUID / BIGINT PK | ✅ | Primary key |
| `order_id` | FK → orders.id | ✅ | Review terkait order |
| `tourist_id` | FK → tourists.id | ✅ | Pemberi review |
| `vendor_id` | FK → vendors.id | ❌ | Target review (vendor) |
| `guide_id` | FK → guides.id | ❌ | Target review (guide) |
| `rating` | SMALLINT | ✅ | 1–5 bintang |
| `comment` | TEXT | ❌ | Komentar |
| `created_at` | TIMESTAMP | ✅ | |

---

## 9. Destination (Tabel: `destinations`)

Data destinasi wisata yang bisa dikelola via backoffice.

| Field | Type | Wajib | Keterangan |
|-------|------|-------|------------|
| `id` | UUID / BIGINT PK | ✅ | Primary key |
| `name` | VARCHAR(255) | ✅ | Nama destinasi |
| `area_id` | INTEGER | ✅ | ID area (referensi tabel area/vendor_area) |
| `description` | TEXT | ❌ | Deskripsi destinasi |
| `images` | TEXT | ❌ | JSON array URL gambar |
| `is_active` | BOOLEAN | ✅ | Default: True |
| `created_at` | TIMESTAMP | ✅ | |
| `updated_at` | TIMESTAMP | ✅ | |

---

## Relasi Antar Tabel (Summary)

```
users (1) ──── (1) guides
users (1) ──── (1) vendors
users (1) ──── (1) tourists

guides (1) ──── (N) orders
vendors (1) ──── (N) products
vendors (1) ──── (N) orders
tourists (1) ──── (N) orders
products (1) ──── (N) orders

orders (1) ──── (1) commissions
orders (1) ──── (1) reviews
```

---

## Catatan Implementasi

- Semua `id` sebaiknya menggunakan **UUID** untuk keamanan dan skalabilitas
- Password disimpan dengan **bcrypt** (cost factor min: 12)
- File upload (lisensi guide, foto produk) disimpan di object storage (S3/Cloudflare R2), bukan di DB
- Field `external_id` di orders harus **unique** dan digunakan sebagai idempotency key ke Xendit
- `cashback_percent` di orders adalah **snapshot** saat transaksi, bukan FK, agar tidak terpengaruh jika vendor ubah persentase
