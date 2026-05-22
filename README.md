# 🗺️ Peta Tematik Interaktif Kabupaten Padang Pariaman

Aplikasi web peta interaktif untuk visualisasi data infrastruktur dan statistik wilayah Kabupaten Padang Pariaman, Sumatera Barat.

---

## ✨ Fitur Utama

### Halaman Publik (`/`)
- 🗺️ **Peta Interaktif** — Leaflet.js dengan toggle basemap 3 pilihan:
  - 🗺️ **Peta** (OpenStreetMap)
  - 🛰️ **Satelit** (Google Satellite)
  - 🛣️ **Jalan** (Google Road)
- 🏷️ **Filter Kategori** — Aktifkan/nonaktifkan marker per kategori infrastruktur
- 📍 **Filter Wilayah Cascade** — Kabupaten → Kecamatan → Nagari → Korong dengan breadcrumb
- 🔍 **Search** — Pencarian infrastruktur dengan debounce 300ms + flyTo peta
- 📊 **Panel Statistik** — Card, Bar Chart, Donut Chart — update real-time sesuai filter wilayah
- 🗺️ **Visualisasi Wilayah** — Shape GeoJSON dengan hover tooltip nama wilayah, klik untuk drill-down level

### Panel Admin (`/admin`) — URL tersembunyi, tidak ada link dari halaman publik
- 🔐 **Login** aman dengan JWT (7 hari)
- 🏗️ **Kelola Infrastruktur** — CRUD + MapPicker koordinat + **Upload Foto** + Import/Export Excel
- 📸 **Upload Foto** — Drag & drop atau klik pilih gambar (JPG/PNG/WebP, maks 5MB), preview langsung
- 📈 **Kelola Statistik** — CRUD + Import/Export Excel
- 🏷️ **Kelola Kategori** — CRUD dengan color picker + emoji icon + proteksi hapus jika masih dipakai

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript |
| CSS | **Tailwind CSS** (utility-first) |
| Peta | Leaflet.js via react-leaflet |
| State | Zustand |
| Charts | Recharts |
| HTTP | Axios |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + bcrypt |
| Excel | exceljs + multer |
| Upload Foto | multer (simpan ke `server/uploads/images/`) |

---

## 🚀 Cara Menjalankan

### Prasyarat
- Node.js 20+
- PostgreSQL 15+
- npm

### 1. Clone & Masuk ke Folder

```bash
git clone https://github.com/alfathhh/tematik1306.git
cd tematik1306/padang-pariaman-map
```

### 2. Setup Backend

```bash
cd server
npm install

# Salin .env dan isi konfigurasi
cp .env.example .env
# Edit .env: isi DATABASE_URL dan JWT_SECRET
```

Contoh isi `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/padang_pariaman_map"
JWT_SECRET="string_acak_panjang_minimal_32_karakter"
JWT_EXPIRES_IN="7d"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
```

```bash
# Generate Prisma client
npx prisma generate

# Buat tabel database
npx prisma migrate dev --name init

# Isi data awal (admin + 6 kategori + contoh data)
npm run prisma:seed

# Jalankan server (port 3000)
npm run dev
```

### 3. Setup Frontend

```bash
cd ../client
npm install

# Jalankan frontend (port 5173)
npm run dev
```

### 4. Akses Aplikasi

| URL | Keterangan |
|-----|-----------|
| `http://localhost:5173` | Halaman peta publik |
| `http://localhost:5173/admin/login` | Login panel admin |

**Kredensial default:**
| Field | Nilai |
|-------|-------|
| Username | `admin` |
| Password | `admin123` |

> ⚠️ **Penting:** Ganti password default segera setelah login pertama di environment production!

---

## 📸 Fitur Upload Foto

Foto infrastruktur dapat diunggah langsung dari form admin:

1. Buka form **Tambah / Edit Infrastruktur**
2. Di bagian **Foto** — **drag & drop** gambar atau klik untuk memilih file
3. Format yang didukung: JPG, JPEG, PNG, WebP — maks **5MB**
4. Preview muncul otomatis. Hover untuk tombol **🔄 Ganti** atau **🗑️ Hapus**
5. Atau klik **"Atau isi URL manual"** untuk memasukkan link gambar dari internet

Foto tersimpan di: `server/uploads/images/`
URL akses foto: `http://localhost:3000/uploads/images/<nama-file>`

> Kolom `foto_url` di template import Excel **bisa dikosongkan** — foto bisa diupload lewat admin panel setelah data diimport.

---

## 📁 Struktur Folder

```
padang-pariaman-map/
├── client/                        # Frontend React + Vite + Tailwind
│   ├── src/
│   │   ├── assets/geojson/        # File GeoJSON batas wilayah (statis)
│   │   │   ├── kabupaten.geojson
│   │   │   ├── kecamatan.geojson       
│   │   │   ├── nagari.geojson
│   │   │   └── korong.geojson
│   │   ├── components/
│   │   │   ├── map/               # Komponen peta Leaflet
│   │   │   ├── filter/            # Filter kategori & wilayah
│   │   │   ├── search/            # SearchBar dengan debounce
│   │   │   ├── statistik/         # Panel statistik & charts
│   │   │   ├── ui/                # Primitif UI (Button, Input, Modal, dll)
│   │   │   └── admin/             # FotoUpload, MapPicker, dll.
│   │   ├── pages/
│   │   │   ├── ClientMap.tsx      # Halaman peta publik
│   │   │   └── admin/             # Login, Dashboard, Infrastruktur, Statistik, Kategori
│   │   ├── store/                 # Zustand stores (map, filter, auth)
│   │   ├── hooks/                 # Custom hooks (debounce, wilayah, infrastruktur, dll.)
│   │   ├── lib/                   # Axios instance, map utils, cn utility
│   │   └── types/                 # TypeScript interfaces
│
└── server/                        # Backend Express + TypeScript
    ├── uploads/
    │   └── images/                # Foto yang diupload admin (dibuat otomatis)
    └── src/
        ├── routes/                # API routes (auth, infrastruktur, kategori, statistik, wilayah, upload)
        ├── middleware/            # JWT auth middleware
        ├── prisma/                # Schema & seed
        └── utils/                 # Excel & upload (multer) utils
```

---

## 🗂️ API Endpoints

### Publik (tanpa auth)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login admin, dapat JWT |
| GET | `/api/kategori` | Daftar kategori infrastruktur |
| GET | `/api/infrastruktur` | Daftar infrastruktur (dengan filter) |
| GET | `/api/statistik` | Data statistik wilayah |
| GET | `/api/wilayah/kecamatan` | Daftar kecamatan |
| GET | `/api/wilayah/nagari` | Daftar nagari |
| GET | `/api/wilayah/korong` | Daftar korong |

### Protected (butuh JWT)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST/PUT/DELETE | `/api/kategori/:id` | CRUD kategori |
| POST/PUT/DELETE | `/api/infrastruktur/:id` | CRUD infrastruktur |
| POST | `/api/infrastruktur/import` | Import dari Excel |
| GET | `/api/infrastruktur/export` | Export ke Excel |
| POST/PUT/DELETE | `/api/statistik/:id` | CRUD statistik |
| POST | `/api/statistik/import` | Import statistik dari Excel |
| GET | `/api/statistik/export` | Export statistik ke Excel |
| **POST** | **`/api/upload/foto`** | **Upload foto (JPG/PNG/WebP, maks 5MB)** |
| DELETE | `/api/upload/foto/:filename` | Hapus foto dari server |

---

## 🗺️ Kode Wilayah

Sistem hierarki kode wilayah Kabupaten Padang Pariaman:

| Level | Field | Panjang | Contoh | Catatan |
|-------|-------|---------|--------|---------|
| Kabupaten | `idkab` | 4 digit | `1306` | Selalu tetap |
| Kecamatan | `idkec` | 6 digit | `130601` | Dimulai dengan `1306` |
| Nagari | `iddesa` | 10 digit | `1306010001` | Dimulai dengan `idkec` |
| Korong | `idsls` | 12 digit | `130601000101` | Dimulai dengan `iddesa` |

---

## 📊 Template Import Excel

### Infrastruktur (kolom wajib & opsional)

| Kolom | Header | Wajib | Keterangan |
|-------|--------|-------|------------|
| A | `nama` | ✅ | Nama infrastruktur |
| B | `kategori` | ✅ | Value kategori (contoh: `restoran`) |
| C | `alamat` | ❌ | Alamat lengkap |
| D | `foto_url` | ❌ | URL foto eksternal — **kosongkan jika foto akan diupload via admin** |
| E | `lat` | ✅ | Latitude (contoh: `-0.5397`) |
| F | `lng` | ✅ | Longitude (contoh: `100.1187`) |
| G | `idkab` | ✅ | Harus `1306` |
| H | `idkec` | ✅ | 6 digit, dimulai `1306` |
| I | `iddesa` | ✅ | 10 digit |
| J | `idsls` | ❌ | 12 digit (korong, opsional) |

### Statistik

| Kolom | Header | Wajib | Keterangan |
|-------|--------|-------|------------|
| A | `idkab` | ✅ | Kode kabupaten |
| B | `idkec` | ❌ | Kode kecamatan |
| C | `iddesa` | ❌ | Kode nagari |
| D | `idsls` | ❌ | Kode korong |
| E | `indikator` | ✅ | Nama indikator (contoh: `Jumlah Penduduk`) |
| F | `nilai` | ✅ | Angka |
| G | `satuan` | ❌ | Satuan (contoh: `jiwa`) |
| H | `tahun` | ✅ | Tahun data (contoh: `2024`) |

---

## 🔒 Catatan Keamanan

- URL `/admin` **tidak diekspos** di navbar, footer, atau link manapun di halaman publik
- Password admin di-hash dengan **bcrypt (cost factor 10)**
- File `.env` **tidak di-commit** ke Git (ada di `.gitignore`)
- Upload foto hanya menerima file gambar (JPG/PNG/WebP), maks 5MB
- Import Excel dibatasi maks **5.000 baris** per file

---

## 🎨 Fitur Peta

### Basemap Toggle
Klik tombol glass di kanan-bawah peta untuk cycle 3 basemap:
1. **🗺️ Peta** — OpenStreetMap (default)
2. **🛰️ Satelit** — Google Satellite
3. **🛣️ Jalan** — Google Road

### Visualisasi Wilayah
- Setiap level (kecamatan, nagari, korong) ditampilkan sebagai shape GeoJSON dengan warna berbeda
- Hover pada shape menampilkan tooltip nama wilayah
- Klik shape untuk drill-down ke level berikutnya
- Peta otomatis zoom ke wilayah yang dipilih

### Optimasi Performa
- Pre-indexing GeoJSON features untuk lookup O(1) saat filter
- Bounds caching untuk menghindari parsing geometri berulang
- Clustering marker otomatis jika jumlah > 100

---

## 📝 Lisensi

MIT License — Dikembangkan untuk Kabupaten Padang Pariaman, Sumatera Barat
