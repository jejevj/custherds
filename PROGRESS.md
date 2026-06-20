# Custherds — Development Progress

> Last updated: 2026-06-21  
> Last commit: [`9cb0b00`](https://github.com/jejevj/custherds/commit/9cb0b006c5b0f0735ddb67eeaab08a91f773f847) — feat: update slide 2 with unique tagline for Business Vendor

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

#### Navbar
- [x] Hapus dropdown Home (Home One/Two/Three/Four) dari navbar
- [x] Jadikan Home sebagai single menu link langsung ke `/` — sama pola dengan About Us
- [x] Perbaiki `NavLinks.vue` — tambah triple guard `item.dropdown && item.subItems && item.subItems.length > 0` pada semua render dropdown
  - Commit: [`bcd285e`](https://github.com/jejevj/custherds/commit/bcd285eea6a5f970c823d3dc3d35617cf0610f51)

#### Homepage Slider
- [x] Kurangi slide dari 3 → 2
- [x] Slide 1 — **Affiliate Partner**
  - BG: `page1.webp` (custherds.com)
  - Title: *Turn Your Network into Net Worth*
  - Text: *Connect Affiliate Partners & Businesses Vendors...*
  - Commit: [`e300ede`](https://github.com/jejevj/custherds/commit/e300edeba68aa84b4b4fb1a98df1a7499427bdad)
- [x] Slide 2 — **Business Vendor** (tagline berbeda)
  - BG: `page1-3.webp` (custherds.com)
  - Title: *Grow Your Business Beyond Boundaries*
  - Text: *List your products & services, reach thousands of active affiliates...*
  - Commit: [`9cb0b00`](https://github.com/jejevj/custherds/commit/9cb0b006c5b0f0735ddb67eeaab08a91f773f847)
- [x] CTA button sekarang per-slide (`ctaLabel` + `ctaLink`)

#### API-Ready Skeleton
- [x] Buat `src/services/` — `api.js` (axios instance + interceptor), `blogService.js`, `projectService.js`, `serviceService.js`, `teamService.js`, `contactService.js`
- [x] Buat `src/stores/` — `useAppStore.js`, `useBlogStore.js` (Pinia)
- [x] Buat `src/composables/useFetch.js` — generic fetch composable
- [x] Tambah `.env.example` dengan `VITE_API_BASE_URL`
  - Commit: [`0be43d5`](https://github.com/jejevj/custherds/commit/0be43d54181c6c32566f89aa999b0bd40a27d068)

### 🖥️ `nextfront backoffice` (Next.js + TypeScript — Backoffice)

#### API-Ready Skeleton
- [x] Buat `src/services/api.ts` — native fetch wrapper (GET/POST/PUT/PATCH/DELETE) + Bearer token
- [x] Buat `src/services/authService.ts` — login, logout, me
- [x] Buat `src/services/blogService.ts`, `projectService.ts`, `teamService.ts`, `testimonialService.ts` — full CRUD dengan TypeScript types
- [x] Buat `src/types/index.ts` — centralized types (`Paginated<T>`, `ApiError`)
- [x] Tambah `.env.example` dengan `NEXT_PUBLIC_API_BASE_URL`
  - Commit: [`0be43d5`](https://github.com/jejevj/custherds/commit/0be43d54181c6c32566f89aa999b0bd40a27d068)

---

## 🔄 Sedang / Pending

- [ ] Dropdown Home di navbar masih muncul di dev server — kemungkinan karena file lokal server belum ter-update (perlu `git fetch origin && git checkout origin/main -- frontpublic/src/data/nav-items.js frontpublic/src/components/layout/header/NavLinks.vue`)
- [ ] Rename folder `nextfront backoffice` → `nextfront-backoffice` (hilangkan spasi)

---

## 🗺️ Rencana Selanjutnya (To-Do)

### `frontpublic`
- [ ] Install Pinia: `npm install pinia` + register di `main.js`
- [ ] Migrasi data statis di `src/data/` ke API call via `services/`
- [ ] Koneksi ke REST API backend ketika sudah siap
- [ ] Update konten section lain di homepage (About, Services, Projects, dll.) sesuai branding Custherds

### `nextfront backoffice`
- [ ] Setup autentikasi (login page, session management)
- [ ] Buat halaman CRUD untuk Blog, Project, Team, Testimonial
- [ ] Koneksi ke REST API backend

### Backend (REST API)
- [ ] Belum ada — akan dibangun terpisah
- [ ] Endpoint yang dibutuhkan: `/auth`, `/blogs`, `/projects`, `/team`, `/testimonials`, `/services`, `/contact`

---

## 📋 Commit Log Sesi Ini (2026-06-21)

| Commit | Pesan | File |
|--------|-------|------|
| [`9cb0b00`](https://github.com/jejevj/custherds/commit/9cb0b006c5b0f0735ddb67eeaab08a91f773f847) | feat: update slide 2 with unique tagline for Business Vendor | `MainSliderTwo.vue` |
| [`e300ede`](https://github.com/jejevj/custherds/commit/e300edeba68aa84b4b4fb1a98df1a7499427bdad) | feat: update MainSliderTwo to 2 slides with custherds content | `MainSliderTwo.vue` |
| [`bcd285e`](https://github.com/jejevj/custherds/commit/bcd285eea6a5f970c823d3dc3d35617cf0610f51) | fix: guard NavLinks dropdown render with subItems check | `NavLinks.vue`, `nav-items.js` |
| [`cd5e2dc`](https://github.com/jejevj/custherds/commit/cd5e2dc0d0c4a3d2e465659ee0dca1c3d26f43c9) | fix: simplify Home nav to single link, no dropdown | `nav-items.js` |
| [`0be43d5`](https://github.com/jejevj/custherds/commit/0be43d54181c6c32566f89aa999b0bd40a27d068) | feat: add API-ready skeleton structure | `services/`, `stores/`, `composables/`, `types/` |
| [`2e6d4d2`](https://github.com/jejevj/custherds/commit/2e6d4d2c3a28c3d84ddd54b13c6df864146aa390) | feat: set index2 as default home route | `router.js` |
| [`18abbbd`](https://github.com/jejevj/custherds/commit/18abbbd243b08aa53122d53c720400631181ad56) | fix: improve root .gitignore | `.gitignore` |
