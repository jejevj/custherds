# Custherds Backoffice — Progress Tracker

> Last updated: 2026-06-21

---

## ✅ Selesai

### Autentikasi
- [x] Halaman login Admin (`/login`)
- [x] Halaman login Vendor (`/vendor/login`)
- [x] Halaman login Guide (`/guide/login`)
- [x] Komponen `LoginForm` dengan toggle show/hide password
- [x] Integrasi endpoint login via `fetch` (form-urlencoded)
- [x] Redirect otomatis setelah login berhasil:
  - Vendor → `/vendor/dashboard`
  - Guide → `/guide/dashboard`
  - Default/Admin → `/dashboard/analytics`

### Layout & Struktur
- [x] Template admin layout dengan sidebar (`AppSidebar`)
- [x] Vendor layout dengan sidebar khusus (`VendorSidebar`)
- [x] Guide layout dengan sidebar khusus (`GuideSidebar`)
- [x] Route group `(layout-pages)` → halaman admin umum
- [x] Route group `(vendor-pages)` → halaman khusus vendor
- [x] Route group `(guide-pages)` → halaman khusus guide
- [x] `(no-layout-pages)` → halaman tanpa sidebar (login, error, dll.)

### Sidebar Menu
- [x] Sidebar Admin (default `app-sidebar`) — menu template lengkap
- [x] Sidebar Vendor (`vendor-sidebar`) dengan menu:
  - Dashboard, Produk & Layanan, Pemesanan, Pencarian Wisatawan
  - Ulasan & Rating, Promosi, Keuangan, Laporan, Profil Toko, Pengaturan
- [x] Sidebar Guide (`guide-sidebar`) dengan menu:
  - Dashboard, Jadwal Tur, Paket Tur, Destinasi, Wisatawan
  - Pesan & Chat, Ulasan & Rating, Keuangan, Laporan, Profil Pemandu, Pengaturan

### Halaman Dashboard
- [x] Vendor Dashboard (`/vendor/dashboard`) — layout statistik & placeholder
- [x] Guide Dashboard (`/guide/dashboard`) — layout statistik & placeholder

### Branding & Assets
- [x] Logo Custherds ditambahkan ke `public/` folder
- [x] Favicon diupdate ke Custherds
- [x] Metadata halaman diupdate (title, description)

---

## 🔄 Sedang Dikerjakan

- [ ] Integrasi data dinamis dari API ke dashboard vendor
- [ ] Integrasi data dinamis dari API ke dashboard guide

---

## 📋 Backlog

### Vendor
- [ ] Halaman manajemen produk (`/vendor/products`)
- [ ] Halaman tambah produk (`/vendor/products/add`)
- [ ] Halaman kategori produk (`/vendor/products/categories`)
- [ ] Halaman stok & inventori (`/vendor/products/inventory`)
- [ ] Halaman daftar pesanan (`/vendor/orders`)
- [ ] Halaman detail pesanan (`/vendor/orders/[id]`)
- [ ] Halaman riwayat pesanan (`/vendor/orders/history`)
- [ ] Halaman pencarian wisatawan (`/vendor/customers`)
- [ ] Halaman ulasan & rating (`/vendor/reviews`)
- [ ] Halaman daftar promosi (`/vendor/promotions`)
- [ ] Halaman buat promosi (`/vendor/promotions/create`)
- [ ] Halaman laporan keuangan (`/vendor/finance/revenue`)
- [ ] Halaman penarikan dana (`/vendor/finance/withdrawal`)
- [ ] Halaman riwayat transaksi (`/vendor/finance/transactions`)
- [ ] Halaman laporan (`/vendor/reports`)
- [ ] Halaman profil toko (`/vendor/profile`)
- [ ] Halaman pengaturan vendor (`/vendor/settings`)

### Guide
- [ ] Halaman jadwal hari ini (`/guide/schedule/today`)
- [ ] Halaman semua jadwal (`/guide/schedule`)
- [ ] Halaman tambah jadwal (`/guide/schedule/add`)
- [ ] Halaman daftar paket tur (`/guide/packages`)
- [ ] Halaman buat paket tur (`/guide/packages/create`)
- [ ] Halaman rute wisata (`/guide/packages/routes`)
- [ ] Halaman destinasi (`/guide/destinations`)
- [ ] Halaman daftar wisatawan (`/guide/tourists`)
- [ ] Halaman permintaan pemandu (`/guide/tourists/requests`)
- [ ] Halaman pesan & chat (`/guide/messages`)
- [ ] Halaman ulasan & rating (`/guide/reviews`)
- [ ] Halaman laporan keuangan (`/guide/finance/revenue`)
- [ ] Halaman penarikan dana (`/guide/finance/withdrawal`)
- [ ] Halaman riwayat transaksi (`/guide/finance/transactions`)
- [ ] Halaman laporan (`/guide/reports`)
- [ ] Halaman profil pemandu (`/guide/profile`)
- [ ] Halaman pengaturan guide (`/guide/settings`)

### Umum
- [ ] Middleware autentikasi & proteksi route per role
- [ ] Komponen `NavUser` terhubung ke data session login
- [ ] Halaman 404 & 500 dikustomisasi per role
- [ ] Notifikasi real-time
- [ ] Internasionalisasi (i18n)

---

## 📁 Struktur Folder

```
nextfront backoffice/src/
├── app/
│   ├── (layout-pages)/          # Admin — halaman dengan layout default
│   │   ├── dashboard/
│   │   ├── eCommerce/
│   │   └── ... (template pages)
│   ├── (vendor-pages)/          # Vendor — layout & sidebar khusus vendor
│   │   └── vendor/
│   │       └── dashboard/
│   ├── (guide-pages)/           # Guide — layout & sidebar khusus guide
│   │   └── guide/
│   │       └── dashboard/
│   └── (no-layout-pages)/       # Login, Error, Coming Soon
│       ├── login/
│       ├── vendor/login/
│       └── guide/login/
└── components/
    ├── layout/
    │   ├── admin-layout.tsx
    │   ├── vendor-layout.tsx
    │   └── guide-layout.tsx
    ├── app-sidebar.tsx           # Sidebar admin (default template)
    ├── vendor-sidebar.tsx        # Sidebar vendor
    ├── guide-sidebar.tsx         # Sidebar guide
    └── login-form.tsx
```
