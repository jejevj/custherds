# Flowchart Proses Transaksi & Bagi Hasil di Custherds

Dokumen ini menjelaskan alur kerja transaksi dan sistem bagi hasil pada platform Custherds yang melibatkan empat aktor utama: **Guide**, **Turis**, **Vendor (Pemilik Destinasi)**, dan **Custherds (Platform)**.

---

## 👥 Aktor yang Terlibat
*   **Guide**: Pemandu wisata yang mengantar turis.
*   **Turis**: Pelanggan atau wisatawan.
*   **Vendor**: Pemilik destinasi wisata atau penyedia layanan (makan, penginapan, tiket, dll).
*   **Custherds**: Platform digital yang mengelola sistem dan bagi hasil.

---

## 🔄 Alur Proses Transaksi

### 1. Peran Guide (Langkah 1 - 4)
*   **Langkah 1**: Guide membawa turis ke destinasi (vendor).
*   **Langkah 2**: Guide membuat *booking* di aplikasi Custherds.
*   **Langkah 3**: Guide memilih vendor, tanggal, layanan, dan jumlah turis.
*   **Langkah 4**: *Booking* berhasil dan Guide mendapatkan kode *booking*.

### 2. Peran Turis (Langkah 5 - 7)
*   **Langkah 5**: Turis menikmati layanan di destinasi (makan, menginap, tiket, dll).
*   **Langkah 6**: Turis melakukan pembayaran ke vendor secara langsung.
*   **Langkah 7**: Turis menerima kuitansi / nota pembayaran dari vendor.

### 3. Peran Vendor / Pemilik Destinasi (Langkah 8 - 11)
*   **Langkah 8**: Vendor menerima pembayaran dari turis.
*   **Langkah 9**: Vendor mengunggah (*upload*) foto kuitansi / nota ke aplikasi Custherds.
*   **Langkah 10**: Vendor memasukkan nominal pembayaran sesuai dengan kuitansi.
*   **Langkah 11**: Vendor mengirimkan (*submit*) transaksi untuk proses perhitungan bagi hasil.

### 4. Peran Custherds / Platform (Langkah 12 - 18)
*   **Langkah 12**: Custherds menerima data transaksi (nominal + kuitansi) dari vendor.
*   **Langkah 13**: Sistem memverifikasi data (validasi kuitansi & nominal).
*   **Langkah 14 (Percabangan Validasi)**:
    *   **TIDAK VALID**: Transaksi ditolak atau diminta perbaikan data (kembali ke Langkah 9).
    *   **YA (VALID)**: Lanjut ke Langkah 15.
*   **Langkah 15**: Sistem menghitung bagi hasil otomatis berdasarkan persentase.
*   **Langkah 16**: Bagi hasil dicatat di dalam sistem yang terbagi menjadi:
    *   Bagian Vendor
    *   Komisi Guide
    *   *Fee* Custherds (Platform)
*   **Langkah 17**: Guide dapat melihat komisi yang didapat langsung di aplikasi.
*   **Langkah 18**: Pembayaran komisi Guide dilakukan sesuai jadwal (misalnya mingguan atau bulanan).

---

## 📊 Contoh Perhitungan & Pembagian

Berikut adalah simulasi pembagian hasil berdasarkan contoh persentase yang ditetapkan oleh platform:

*   **Total Tagihan Turis**: Rp1.000.000

### Proporsi Pembagian:

| Aktor | Persentase | Nominal yang Diterima |
| :--- | :---: | :--- |
| **Vendor** | 85% | Rp850.000 |
| **Guide** | 10% | Rp100.000 |
| **Custherds (Platform)** | 5% | Rp50.000 |

---

## 📌 Keterangan Garis Alur
*   ➡️ **Garis Tegas**: Alur proses utama yang berjalan normal.
*   ---> **Garis Putus-putus**: Alur jika data tidak valid atau memerlukan perbaikan data dari pihak vendor.
