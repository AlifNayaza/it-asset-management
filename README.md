# 💻 Enterprise IT Asset & Inventory Management System

Sistem Manajemen Inventaris & Siklus Hidup Aset IT Perusahaan (*IT Asset Lifecycle Management*) berbasis Web modern yang dirancang untuk mempermudah pencatatan aset, serah terima perangkat ke staf, penerbitan Berita Acara Serah Terima (**BAST**), pemindaian label fisik dengan **Kamera QR**, evaluasi **Depresiasi Akuntansi (Nilai Buku)**, import massal berkas spreadsheet, serta pemeliharaan unit secara *real-time*.

---

## 🌟 Fitur Utama Sistem

### 1. 📦 Master Katalog Inventaris & Pengelolaan Unit
- **Pencatatan Lengkap**: Nomor Seri Pabrik, Asset Tag unik, Model & Spesifikasi, Kategori Hardware, Lokasi Cabang/Ruangan, Tanggal Beli, dan Harga Perolehan.
- **Edit Unit Interaktif**: Perbarui spesifikasi, status operasional, lokasi, harga, serta lihat simulasi perubahan nilai depresiasi secara langsung.
- **Foto Fisik Perangkat**: Unggah dan tampilkan foto fisik unit perangkat (JPG, PNG, WEBP) untuk verifikasi visual inventaris.
- **Cetak Stiker QR Satuan & Massal (*Batch Print*)**: Cetak lembar stiker berstandar A4 siap tempel pada unit fisik secara instan (0ms render lokal).
- **Pencarian Cepat dengan Debounce (300ms)**: Filter instan responsif multi-parameter berdasarkan Tag, Serial Number, Model, Karyawan, Kategori, maupun Ruangan.

### 2. 📥 Import & Ekspor Data Massal (CSV / Spreadsheet)
- **Import Massal CSV**: Daftarkan puluhan hingga ratusan unit perangkat sekaligus dengan berkas spreadsheet CSV.
- **Template Standar Siap Pakai**: Unduh template format CSV resmi langsung dari aplikasi.
- **Validasi Data Otomatis**: Pratinjau dan pemeriksaan kelengkapan data sebelum diimpor ke sistem.
- **Ekspor Data CSV**: Unduh rekapitulasi data inventaris dan keuangan untuk kebutuhan audit serta pembukuan.

### 3. 🏢 Manajemen Master Kategori & Lokasi
- **Master Kategori**: Tambah dan atur kategori hardware beserta estimasi masa manfaat ekonomis dan persentase nilai residu.
- **Master Lokasi & Ruangan**: Kelola daftar kantor cabang, lantai, dan ruangan gudang penyimpanan aset.
- **Akses Pintas**: Tombol kelola master tersedia langsung di dalam formulir pendaftaran aset.

### 4. 🔄 Sirkulasi & Serah Terima Staf (*Handover Management*)
- **Penyerahan (*Check-out*)**: Alokasikan unit kerja ke karyawan dengan pencatatan NIP, kondisi fisik, dan kelengkapan aksesoris (charger, tas, dll).
- **Pengembalian (*Check-in*)**: Pengembalian unit ke gudang IT dengan evaluasi kondisi fisik perangkat.
- **Penerbitan BAST Resmi**: Cetak dokumen **Berita Acara Serah Terima (BAST)** digital berstandar resmi perusahaan yang pas dalam **1 halaman A4** lengkap dengan kolom tanda tangan kedua belah pihak.

### 5. 📷 Pemindai Kamera QR Instan (*WebCam Scanner*)
- Scan label QR fisik langsung dari kamera laptop/smartphone (30 FPS dengan viewport auto-focus).
- Deteksi instan untuk membuka detail aset atau melakukan serah terima seketika tanpa perlu mengetik manual.

### 6. 📉 Mesin Depresiasi Finansial (*Straight-Line Depreciation Engine*)
- Perhitungan otomatis nilai penyusutan tahunan dan **Sisa Nilai Buku (*Book Value*)** berdasarkan masa manfaat ekonomis dan persentase residu.
- **Simulator Pengadaan (Capex Simulator)**: Hitung perkiraan nilai buku aset baru sebelum perusahaan melakukan pembelian.

### 7. 🔧 Pemeliharaan & Tiket Servis (*Maintenance Log*)
- Pencatatan tiket kerusakan fisik, vendor rekanan, tanggal pengerjaan, dan biaya servis.
- Riwayat perbaikan unit terekam terstruktur pada lembar detail aset.

### 8. 🛡️ Jejak Audit Forensik (*JSONB Audit Log Ledger*)
- Seluruh mutasi data (*INSERT*, *UPDATE*, *DELETE*) tersimpan otomatis dalam basis data log forensik lengkap dengan *payload snapshot* sebelum dan sesudah perubahan.

### 9. ⚡ Performa & Pengalaman Pengguna Modern
- **Pintasan Keyboard Global**: Gunakan `Ctrl + K` (atau `Cmd + K`) untuk pencarian cepat dan `Esc` untuk menutup modal aktif.
- **Tampilan Responsif Adaptif**: Mode **Kartu Informasi Interaktif** di ponsel dan **Tabel Komprehensif** di desktop.
- **Optimasi Bundling**: Code splitting Rollup `manualChunks` di Vite untuk waktu pemuatan halaman yang sangat cepat dan ringan.

---

## 🏗️ Arsitektur & Teknologi

```
it-asset-management/
├── backend/          # RESTful API Server (Node.js + Express + Prisma + PostgreSQL / Local Store)
└── frontend/         # Web Single Page Application (React 18 + Vite + Tailwind CSS)
```

| Komponen | Teknologi yang Digunakan |
|---|---|
| **Frontend Framework** | React 18, Vite |
| **Styling & UI** | Tailwind CSS v3, Lucide React Icons |
| **QR Engine** | HTML5-QRCode (Scanner Kamera), Canvas QRCode (Render 0ms) |
| **Backend Runtime** | Node.js (ES Module), Express.js |
| **Database & ORM** | PostgreSQL, Prisma ORM (*dengan auto fallback ke local JSON store*) |
| **Upload Storage** | Multer (Penyimpanan lokal berkas foto perangkat) |
| **Audit & Logging** | JSONB Transaction Ledger |

---

## 📋 Persyaratan Sistem (*Prerequisites*)

Sebelum menjalankan proyek ini, pastikan perangkat lunak berikut telah terpasang:

1. **Node.js** (Versi 18.x atau lebih baru) & **npm**  
   👉 Periksa dengan: `node -v` dan `npm -v`
2. **PostgreSQL** *(Opsional)*  
   *Catatan: Sistem telah dilengkapi fallback otomatis ke penyimpanan data lokal (`uploads/local_backup_data.json`) jika PostgreSQL tidak dijalankan.*
3. **Web Browser Modern** (Chrome, Firefox, Edge, Safari) dengan izin akses kamera untuk fitur Scan QR.

---

## 🚀 Panduan Instalasi & Menjalankan Sistem

### 1. Klon Repositori Proyek
```bash
git clone https://github.com/your-username/it-asset-management.git
cd it-asset-management
```

---

### 2. Menyiapkan & Menjalankan Backend API Server

1. Masuk ke direktori `backend`:
   ```bash
   cd backend
   ```

2. Instal dependensi:
   ```bash
   npm install
   ```

3. Konfigurasi file `.env` (file template bawaan sudah tersedia di `backend/.env`):
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL="postgresql://postgres:@localhost:5432/it_asset_db?schema=public"
   ```

4. *(Opsional - jika menggunakan database PostgreSQL lokal)* Generate Prisma Client & Isi Data Awal:
   ```bash
   npm run prisma:generate
   npm run seed
   ```

5. Jalankan server Backend:
   ```bash
   npm run dev
   ```
   > 🟢 **Backend berjalan pada:** `http://localhost:5000`

---

### 3. Menyiapkan & Menjalankan Frontend Web Client

1. Buka terminal baru, lalu masuk ke direktori `frontend`:
   ```bash
   cd frontend
   ```

2. Instal dependensi:
   ```bash
   npm install
   ```

3. Jalankan server Frontend:
   ```bash
   npm run dev
   ```
   > 🔵 **Frontend berjalan pada:** `http://localhost:3000`

---

### 4. Akses Aplikasi
Buka peramban (*browser*) dan akses tautan berikut:  
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🧭 Alur Penggunaan Sistem (*Standard Operating Procedure*)

1. **Pendaftaran Perangkat Baru (`Katalog Aset -> Tambah Unit`)**:
   - Masukkan Nomor Seri, Model, Kategori, Lokasi Ruangan, Tanggal Beli, Harga, dan Foto Perangkat.
   - Sistem akan otomatis menghasilkan **Asset Tag unik** (contoh: `AST-NB-2026-1001`).

2. **Import Massal Aset (`Katalog Aset -> Import CSV`)**:
   - Unduh template CSV, isi data unit aset dari spreadsheet, lalu unggah untuk mendaftarkan banyak unit sekaligus.

3. **Cetak & Tempel Label QR (`Katalog Aset -> Cetak Label / Cetak Massal`)**:
   - Cetak lembar stiker fisik dan tempelkan pada unit laptop/PC/perangkat kerja.

4. **Serah Terima ke Staf (`Sirkulasi -> Serah Terima`)**:
   - Pilih unit atau gunakan **Scan QR Kamera**, masukkan data staf penerima, kondisi fisik, dan buat dokumen BAST.

5. **Cetak Berita Acara Serah Terima (`Sirkulasi -> Riwayat -> Cetak BAST`)**:
   - Buka dan cetak dokumen BAST 1 halaman A4 lengkap dengan klausul dan kolom tanda tangan.

6. **Pengembalian Perangkat (`Sirkulasi -> Pengembalian`)**:
   - Konfirmasi pengembalian unit setelah masa tugas staf selesai untuk memperbarui status aset menjadi **Tersedia di Gudang**.

7. **Pemantauan Nilai Buku (`Laporan Depresiasi`)**:
   - Pantau total belanja modal (*Capex*), akumulasi depresiasi tahunan, dan sisa nilai buku aset perusahaan.

---

## 🔌 Referensi Endpoint API Utama (*API Routes*)

| Metode | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/dashboard/summary` | Statistik ringkasan total unit aset, status, dan sirkulasi |
| `GET` | `/api/assets` | Mengambil katalog aset (filter status, kategori, lokasi, pencarian, paginasi) |
| `POST` | `/api/assets` | Menambahkan unit aset baru |
| `POST` | `/api/assets/bulk-import` | Import massal daftar unit aset dari array/CSV |
| `GET` | `/api/assets/:id` | Detail lengkap spesifikasi, nilai buku, riwayat sirkulasi & servis aset |
| `PUT` | `/api/assets/:id` | Memperbarui data spesifikasi unit aset |
| `DELETE` | `/api/assets/:id` | Menghapus unit aset dari sistem |
| `POST` | `/api/upload` | Mengunggah foto fisik perangkat (disimpan di `/uploads`) |
| `GET` | `/api/categories` | Mengambil daftar master kategori hardware |
| `POST` | `/api/categories` | Menambahkan master kategori hardware baru |
| `GET` | `/api/locations` | Mengambil daftar master lokasi cabang dan ruangan |
| `POST` | `/api/locations` | Menambahkan master lokasi baru |
| `POST` | `/api/assignments/checkout` | Penyerahan perangkat ke staf & pencatatan BAST |
| `POST` | `/api/assignments/checkin` | Pengembalian perangkat ke gudang IT |
| `GET` | `/api/assignments/history` | Riwayat transaksi sirkulasi serah terima |
| `GET` | `/api/reports/depreciation` | Laporan perhitungan depresiasi garis lurus |
| `POST` | `/api/maintenance` | Membuat tiket perbaikan / pemeliharaan unit |
| `PUT` | `/api/maintenance/:id/complete` | Menyelesaikan tiket servis dan mengembalikan status unit |
| `GET` | `/api/audit` | Riwayat buku besar mutasi audit log forensik |

---

## 🛠️ Penyelesaian Masalah (*Troubleshooting*)

- **Port 5000 atau 3000 sudah digunakan aplikasi lain?**
  - Ubah `PORT` di file `backend/.env` atau ubah flag port di `frontend/package.json` (`vite --port 3001`).
- **Kamera QR Scanner tidak aktif di browser?**
  - Pastikan izin akses kamera (*Allow Camera Permission*) telah diberikan pada peramban web Anda.
- **Tampilan cetak BAST terpotong?**
  - Pengaturan cetak telah dioptimalkan untuk ukuran kertas **A4 Portrait** dengan margin standar.

---

## 📄 Lisensi
Hak Cipta © 2026 Tim Pengembang IT Asset Management. Dibuat untuk efisiensi operasional dan tata kelola aset perusahaan yang transparan, aman, dan terintegrasi.
