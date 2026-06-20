# Custherds — Development Progress

> Last updated: 2026-06-21  
> Last commit: [`ddf075d`](https://github.com/jejevj/custherds/commit/ddf075d4f45efc388b92a1aab661c4f71637df61) — feat: add FAQ page, register /faq route, fix footer links to internal /faq

---

## ✅ Selesai

### 🔧 Root Project
- [x] Perbaiki `.gitignore` root — tambahkan `node_modules/`, `.env`, build outputs, logs, OS files, IDE files
  - Commit: [`18abbbd`](https://github.com/jejevj/custherds/commit/18abbbd243b08aa53122d53c720400631181ad56)

### 🌐 `frontpublic` (Vue 3 + Vite — Public Website)

#### Routing
- [x] Set `index2.vue` sebagai default route `/` (sebelumnya `index1.vue`)
- [x] Tambah redirect `/index2` → `/` agar URL lama tetap berfungsi
- [x] Rename route `index1` ke path `/index1`
  - Commit: [`2e6d4d2`](https://github.com/jejevj/custherds/commit/2e6d4d2c3a28c3d84ddd54b13c6df864146aa390)
- [x] Tambah route `/faq` → `Faq.vue`
  - Commit: [`ddf075d`](https://github.com/jejevj/custherds/commit/ddf075d4f45efc388b92a1aab661c4f71637df61)

#### Navbar
- [x] Hapus dropdown Home (Home One/Two/Three/Four) dari navbar
- [x] Jadikan Home sebagai single menu link langsung ke `/`
- [x] Perbaiki `NavLinks.vue` — triple guard pada render dropdown
  - Commit: [`bcd285e`](https://github.com/jejevj/custherds/commit/bcd285eea6a5f970c823d3dc3d35617cf0610f51)
- [x] Hapus blok `main-menu-two__search-and-nav-sidebar-icon` dari HeaderTwo (normal + sticky)
  - Commit: [`1d7b27d`](https://github.com/jejevj/custherds/commit/1d7b27de0dc04250b5568451aaa2aff608c01bd3)

#### Homepage Slider
- [x] Kurangi slide dari 3 → 2
- [x] Slide 1 — **Affiliate Partner**: BG `page1.webp`, Title *Turn Your Network into Net Worth*
  - Commit: [`e300ede`](https://github.com/jejevj/custherds/commit/e300edeba68aa84b4b4fb1a98df1a7499427bdad)
- [x] Slide 2 — **Business Vendor**: BG `page1-3.webp`, Title *Grow Your Business Beyond Boundaries*
  - Commit: [`9cb0b00`](https://github.com/jejevj/custherds/commit/9cb0b006c5b0f0735ddb67eeaab08a91f773f847)
- [x] CTA button per-slide (`ctaLabel` + `ctaLink`)

#### Halaman Register (`Register.vue`)
- [x] Rewrite lengkap — 3 tab: Herd Partner, Business Vendor, Tourist
- [x] **TnC Modal** — wajib scroll sampai ≥95% sebelum checkbox aktif, checkbox → tombol Confirm → baru tombol daftar aktif
- [x] Checkbox & tombol submit di-gate oleh `tncAccepted` (reset tiap ganti tab)
- [x] Form POST ke `custherds.com/register/saveRegistration` & `saveTourist`
  - Commit: [`b7b6b8e`](https://github.com/jejevj/custherds/commit/b7b6b8e2214401b69865eca74568fe4350a73ca6)

#### Halaman Contact (`Contact.vue`)
- [x] Rewrite dengan konten real Custherds: phone, email, alamat Bali
- [x] Google Maps embed titik Bali (siap diubah ke alamat lengkap)
- [x] Math captcha generate acak di Vue + validasi client-side
- [x] Form POST ke `custherds.com/contact-us/sendContact`
  - Commit: [`4ccd207`](https://github.com/jejevj/custherds/commit/4ccd2075fbe96f6b12ff52d95590219b03f10120)
- [x] Fix warna teks — background hitam, semua teks putih, form input dark theme
  - Commit: [`cafca66`](https://github.com/jejevj/custherds/commit/cafca6654d6c06c609371e552f30f34f397479a5)

#### Halaman FAQ (`Faq.vue`) — Baru
- [x] Buat `Faq.vue` — accordion dark theme, 10 FAQ dari backend
- [x] Slide transition expand/collapse per item
- [x] CTA button "Contact Us" di bawah
- [x] Route `/faq` didaftarkan di `router.js`
  - Commit: [`ddf075d`](https://github.com/jejevj/custherds/commit/ddf075d4f45efc388b92a1aab661c4f71637df61)

#### Footer (`Footer1.vue`)
- [x] Update semua link FAQ & Terms dari external `custherds.com/faq` → internal `<router-link to="/faq">`
- [x] Link Register footer diperbaiki ke `/register` internal
  - Commit: [`ddf075d`](https://github.com/jejevj/custherds/commit/ddf075d4f45efc388b92a1aab661c4f71637df61)

#### API-Ready Skeleton
- [x] `src/services/` — `api.js`, `blogService.js`, `projectService.js`, `serviceService.js`, `teamService.js`, `contactService.js`
- [x] `src/stores/` — `useAppStore.js`, `useBlogStore.js` (Pinia)
- [x] `src/composables/useFetch.js`
- [x] `.env.example` dengan `VITE_API_BASE_URL`
  - Commit: [`0be43d5`](https://github.com/jejevj/custherds/commit/0be43d54181c6c32566f89aa999b0bd40a27d068)

### 🖥️ `nextfront backoffice` (Next.js + TypeScript — Backoffice)

#### API-Ready Skeleton
- [x] `src/services/api.ts` — native fetch wrapper + Bearer token
- [x] `src/services/authService.ts`, `blogService.ts`, `projectService.ts`, `teamService.ts`, `testimonialService.ts`
- [x] `src/types/index.ts` — centralized types
- [x] `.env.example` dengan `NEXT_PUBLIC_API_BASE_URL`
  - Commit: [`0be43d5`](https://github.com/jejevj/custherds/commit/0be43d54181c6c32566f89aa999b0bd40a27d068)

---

## 🔄 Sedang / Pending

- [ ] Halaman **About Us** — belum diupdate dengan konten real Custherds
- [ ] Halaman **Terms & Conditions** — footer sudah link ke `/terms` tapi halaman belum dibuat
- [ ] Rename folder `nextfront backoffice` → `nextfront-backoffice` (hilangkan spasi)

---

## 🗺️ Rencana Selanjutnya (To-Do)

### `frontpublic`
- [ ] Buat `Terms.vue` → route `/terms` (konten dari backend sudah ada)
- [ ] Update About Us dengan konten real Custherds
- [ ] Update Google Maps Contact dengan alamat lengkap (koordinat placeholder Bali)
- [ ] Install Pinia: `npm install pinia` + register di `main.js`
- [ ] Migrasi data statis di `src/data/` ke API call via `services/`
- [ ] Koneksi ke REST API backend ketika sudah siap

### `nextfront backoffice`
- [ ] Setup autentikasi (login page, session management)
- [ ] Buat halaman CRUD untuk Blog, Project, Team, Testimonial
- [ ] Koneksi ke REST API backend

### Backend (REST API)
- [ ] Belum ada — akan dibangun terpisah
- [ ] Endpoint yang dibutuhkan: `/auth`, `/blogs`, `/projects`, `/team`, `/testimonials`, `/services`, `/contact`

---

## 📋 Commit Log Sesi Ini (2026-06-21)

| Commit | Pesan | File Utama |
|--------|-------|------------|
| [`ddf075d`](https://github.com/jejevj/custherds/commit/ddf075d4f45efc388b92a1aab661c4f71637df61) | feat: add FAQ page, /faq route, fix footer links | `Faq.vue`, `router.js`, `Footer1.vue` |
| [`cafca66`](https://github.com/jejevj/custherds/commit/cafca6654d6c06c609371e552f30f34f397479a5) | fix: contact-page dark bg + white text | `Contact.vue` |
| [`4ccd207`](https://github.com/jejevj/custherds/commit/4ccd2075fbe96f6b12ff52d95590219b03f10120) | feat: rewrite Contact.vue with real content + Bali map | `Contact.vue` |
| [`1d7b27d`](https://github.com/jejevj/custherds/commit/1d7b27de0dc04250b5568451aaa2aff608c01bd3) | fix: remove unused search & nav-sidebar-icon | `HeaderTwo.vue` |
| [`b7b6b8e`](https://github.com/jejevj/custherds/commit/b7b6b8e2214401b69865eca74568fe4350a73ca6) | feat: TnC scroll modal + checkbox gate on Register | `Register.vue` |
| [`9cb0b00`](https://github.com/jejevj/custherds/commit/9cb0b006c5b0f0735ddb67eeaab08a91f773f847) | feat: update slide 2 tagline for Business Vendor | `MainSliderTwo.vue` |
| [`e300ede`](https://github.com/jejevj/custherds/commit/e300edeba68aa84b4b4fb1a98df1a7499427bdad) | feat: update MainSliderTwo to 2 slides | `MainSliderTwo.vue` |
| [`bcd285e`](https://github.com/jejevj/custherds/commit/bcd285eea6a5f970c823d3dc3d35617cf0610f51) | fix: guard NavLinks dropdown render | `NavLinks.vue`, `nav-items.js` |
| [`0be43d5`](https://github.com/jejevj/custherds/commit/0be43d54181c6c32566f89aa999b0bd40a27d068) | feat: add API-ready skeleton structure | `services/`, `stores/`, `composables/` |
| [`2e6d4d2`](https://github.com/jejevj/custherds/commit/2e6d4d2c3a28c3d84ddd54b13c6df864146aa390) | feat: set index2 as default home route | `router.js` |
| [`18abbbd`](https://github.com/jejevj/custherds/commit/18abbbd243b08aa53122d53c720400631181ad56) | fix: improve root .gitignore | `.gitignore` |
