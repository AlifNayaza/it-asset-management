# 💻 Enterprise IT Asset & Inventory Management System

Sistem Manajemen Inventaris & Siklus Hidup Aset IT Perusahaan (*IT Asset Lifecycle Management*) berbasis Web modern yang dirancang untuk mempermudah pencatatan aset, serah terima perangkat ke staf, penerbitan Berita Acara Serah Terima (**BAST**), pemindaian label fisik dengan **Kamera QR**, evaluasi **Depresiasi Akuntansi (Nilai Buku)**, serta pemeliharaan unit secara *real-time*.

---

## 🌟 Fitur Utama Sistem

### 1. 📦 Master Katalog Inventaris Aset
- Pencatatan lengkap spesifikasi perangkat keras (Nomor Seri Pabrik, Asset Tag, Model, Tanggal Beli, Harga Perolehan, Lokasi Cabang/Ruangan).
- **Cetak Stiker QR Satuan & Massal (*Batch Print*)**: Cetak lembar stiker berstandar A4 siap tempel pada unit fisik secara instan (0ms render lokal).
- **Pencarian Cepat (*Instant Live Search*)**: Filter instan multi-parameter berdasarkan Tag, Serial Number, Model, Karyawan, maupun Ruangan.

### 2. 🔄 Sirkulasi & Serah Terima Staf (*Handover Management*)
- **Penyerahan (*Check-out*)**: Alokasikan unit kerja ke karyawan dengan pencatatan NIP, kondisi fisik, dan kelengkapan aksesoris (charger, tas, dll).
- **Pengembalian (*Check-in*)**: Pengembalian unit ke gudang IT dengan evaluasi kondisi fisik perangkat.
- **Penerbitan BAST Resmi**: Cetak dokumen **Berita Acara Serah Terima (BAST)** digital berstandar resmi perusahaan yang pas dalam **1 halaman A4** lengkap dengan kolom tanda tangan kedua belah pihak.

### 3. 📷 Pemindai Kamera QR Instan (*Instant WebCam Scanner*)
- Scan label QR fisik langsung dari kamera laptop/HP (30 FPS dengan viewport auto-focus).
- Deteksi instan untuk membuka detail aset atau melakukan serah terima seketika tanpa perlu mengetik manual.

### 4. 📉 Mesin Depresiasi Finansial (*Straight-Line Depreciation Engine*)
- Perhitungan otomatis nilai penyusutan tahunan dan **Sisa Nilai Buku (*Book Value*)** berdasarkan masa manfaat ekonomis dan persentase residu.
- **Simulator Pengadaan (Capex Simulator)**: Hitung perkiraan nilai buku aset baru sebelum perusahaan melakukan pembelian.
- **Ekspor Neraca CSV**: Unduh rekapitulasi data keuangan aset untuk kebutuhan audit dan akuntansi.

### 5. 🔧 Pemeliharaan & Tiket Servis (*Maintenance Log*)
- Pencatatan tiket kerusakan fisik, vendor rekanan, tanggal pengerjaan, dan biaya servis.
- Riwayat perbaikan unit terekam terstruktur pada lembar detail aset.

### 6. 🛡️ Jejak Audit Forensik (*JSONB Audit Log Ledger*)
- Seluruh mutasi data (*INSERT*, *UPDATE*, *DELETE*) tersimpan otomatis dalam basis data log forensik lengkap dengan *payload snapshot* sebelum dan sesudah perubahan.

### 7. 📱 Tampilan Responsif Adaptif (*Hybrid Mobile Card & Desktop Table*)
- **Di Layar Ponsel (Mobile):** Data disajikan dalam bentuk **Kartu Informasi Interaktif** yang rapi, padat, dan nyaman dibaca.
- **Di Layar Desktop:** Menyajikan **Tabel Data Komprehensif** dengan kontrol paginasi cepat.

---

## 🏗️ Arsitektur & Teknologi

```
it-asset-management/
├── backend/          # RESTful API Server (Node.js + Express + Prisma + PostgreSQL)
└── frontend/         # Web Single Page Application (React 18 + Vite + Tailwind CSS)
```

| Komponen | Teknologi yang Digunakan |
|---|---|
| **Frontend Framework** | React 18, Vite |
| **Styling & UI** | Tailwind CSS v3, Lucide React Icons |
| **QR Engine** | HTML5-QRCode (Scanner Kamera), Canvas QRCode (Render 0ms) |
| **Backend Runtime** | Node.js (ES Module), Express.js |
| **Database & ORM** | PostgreSQL, Prisma ORM |
| **Audit & Logging** | PostgreSQL JSONB Ledger |

---

## 📋 Persyaratan Sistem (*Prerequisites*)

Sebelum menjalankan proyek ini, pastikan Anda telah menginstal perangkat lunak berikut pada komputer Anda:

1. **Node.js** (Versi 18.x atau lebih baru) & **npm**  
   👉 Cek dengan perintah: `node -v` dan `npm -v`
2. **PostgreSQL** (Opsional jika ingin database lokal penuh, misalnya via Laragon / PostgreSQL Server lokal).  
   *Catatan: Sistem backend telah dilengkapi fallback otomatis ke penyimpanan data lokal jika PostgreSQL belum aktif.*
3. **Web Browser Modern** (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari) dengan izin akses kamera untuk fitur Scan QR.

---

## 🚀 Panduan Instalasi & Menjalankan Sistem (*Step-by-Step*)

### Langkah 1: Buka Direktori Proyek
Buka terminal / PowerShell dan arahkan ke folder proyek:
```bash
cd c:\Users\Alraf\Documents\Alraf26\Project\it-asset-management
```

---

### Langkah 2: Menyiapkan & Menjalankan Backend API Server

1. Masuk ke folder `backend`:
   ```bash
   cd backend
   ```

2. Instal dependensi backend:
   ```bash
   npm install
   ```

3. Periksa file konfigurasi `.env` (sudah tersedia di dalam folder `backend/`):
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL="postgresql://postgres:@localhost:5432/it_asset_db?schema=public"
   ```

4. *(Opsional)* Generate Prisma Client & Isi Data Awal (*Seed Sample Data*):
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

### Langkah 3: Menyiapkan & Menjalankan Frontend Web Client

1. Buka jendela terminal / tab baru, lalu masuk ke folder `frontend`:
   ```bash
   cd c:\Users\Alraf\Documents\Alraf26\Project\it-asset-management\frontend
   ```

2. Instal dependensi frontend:
   ```bash
   npm install
   ```

3. Jalankan server Frontend:
   ```bash
   npm run dev
   ```
   > 🔵 **Frontend berjalan pada:** `http://localhost:3000`

---

### Langkah 4: Buka Sistem di Browser
Buka peramban (*browser*) Anda dan akses alamat berikut:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🧭 Panduan Alur Kerja Penggunaan (*Standard Operating Procedure*)

1. **Daftarkan Perangkat Baru (`Katalog Aset -> Tambah Unit`)**:
   - Masukkan Nomor Seri Pabrik, Nama Model (misal: *ThinkPad E14 Gen 4*), Kategori Hardware, Lokasi Ruangan Gudang, Tanggal Beli, dan Harga Perolehan.
   - Sistem akan otomatis menghasilkan **Asset Tag unik** (misal: `AST-NB-2024-1001`).

2. **Cetak & Tempel Label QR (`Katalog Aset -> Cetak Label / Cetak Massal`)**:
   - Cetak label stiker fisik dan tempelkan pada unit laptop/PC/perangkat.

3. **Serah Terima ke Karyawan (`Sirkulasi -> Serah Terima`)**:
   - Pilih unit dari daftar gudang (atau gunakan tombol **Scan QR Kamera**).
   - Isi Nama Karyawan Penerima, NIP, serta kondisi fisik awal.
   - Klik **Konfirmasi Serah Terima & Buat BAST**.

4. **Cetak Berita Acara Serah Terima (`Sirkulasi -> Riwayat -> Cetak BAST`)**:
   - Sistem langsung membuka pratinjau dokumen BAST resmi 1 halaman A4 dengan rincian klausul tanggung jawab dan tanda tangan kedua belah pihak.

5. **Pengembalian Perangkat (`Sirkulasi -> Pengembalian`)**:
   - Saat karyawan selesai masa tugas, pilih unit dan konfirmasi pengembalian untuk mengembalikan status aset menjadi **Tersedia di Gudang (*Available*)**.

6. **Pantau Depresiasi Nilai Buku (`Laporan Depresiasi`)**:
   - Pantau total belanja modal (*Capex*), akumulasi depresiasi, dan sisa nilai buku aktif perusahaan secara akuntansi.

---

## 🔌 Referensi Endpoint API Utama (*API Routes*)

| Metode | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/dashboard/summary` | Mengambil statistik ringkasan total aset, status, dan sirkulasi |
| `GET` | `/api/assets` | Mengambil daftar katalog aset (dengan filter, pencarian, dan paginasi) |
| `POST` | `/api/assets` | Menambahkan unit aset baru ke basis data |
| `GET` | `/api/assets/:id` | Mengambil detail spesifikasi, riwayat sirkulasi & servis aset |
| `PUT` | `/api/assets/:id` | Memperbarui data aset |
| `DELETE` | `/api/assets/:id` | Menghapus data unit aset dari sistem |
| `POST` | `/api/assignments/checkout` | Melakukan serah terima perangkat ke staf & membuat catatan BAST |
| `POST` | `/api/assignments/checkin` | Melakukan pengembalian perangkat ke gudang IT |
| `GET` | `/api/assignments/history` | Mengambil riwayat transaksi sirkulasi |
| `GET` | `/api/reports/depreciation` | Mengambil laporan perhitungan depresiasi garis lurus seluruh aset |
| `POST` | `/api/maintenance` | Membuat tiket perbaikan / pemeliharaan unit baru |
| `PUT` | `/api/maintenance/:id/complete` | Menandai tiket servis selesai dan mengembalikan status unit |
| `GET` | `/api/audit` | Mengambil riwayat buku besar mutasi audit log forensik |

---

## 🛠️ Penyelesaian Masalah (*Troubleshooting*)

- **Port 5000 / 3000 sudah digunakan aplikasi lain?**
  - Anda dapat mengubah `PORT` di file `backend/.env` atau mengubah flag port di `frontend/package.json` (`vite --port 3001`).
- **Kamera QR Scanner tidak muncul di browser?**
  - Pastikan Anda memberikan izin akses kamera (*Allow Camera Permission*) pada dialog peramban Anda.
- **Tampilan print BAST terpotong?**
  - Dialog cetak telah diatur secara otomatis ke ukuran kertas **A4 Portrait** dengan margin standar 10mm.

---

## 📄 Lisensi
Hak Cipta © 2026 Tim Pengembang IT Asset Management. Dibuat untuk efisiensi operasional dan tata kelola aset perusahaan yang transparan, aman, dan terintegrasi.
