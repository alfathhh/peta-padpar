# Peta Tematik Interaktif — Kabupaten Padang Pariaman

Aplikasi web peta interaktif untuk visualisasi data infrastruktur dan statistik wilayah Kabupaten Padang Pariaman, Sumatera Barat, Indonesia.

## Fitur

### Halaman Publik (`/`)

- **Peta Interaktif** — Leaflet.js dengan toggle basemap (OSM, Google Satellite, Google Road)
- **Filter Kategori** — Aktifkan/nonaktifkan marker per kategori infrastruktur
- **Filter Wilayah** — Cascading: Kecamatan → Nagari → Korong
- **Pencarian** — Debounce 300ms, klik hasil untuk fly-to lokasi di peta
- **Panel Statistik** — Donut chart, bar chart, dan ringkasan angka per wilayah
- **Visualisasi Batas Wilayah** — Shape GeoJSON dengan hover tooltip

### Panel Admin (`/admin`)

- **Autentikasi** — JWT (7 hari), URL tidak ditautkan dari halaman publik
- **Kelola Infrastruktur** — CRUD, MapPicker, upload foto (drag & drop), import/export Excel
- **Kelola Statistik** — CRUD + import/export Excel
- **Kelola Kategori** — CRUD dengan icon picker, color picker, proteksi hapus

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript |
| Styling | Tailwind CSS |
| Peta | Leaflet.js (react-leaflet) |
| State | Zustand |
| Charts | Recharts |
| HTTP | Axios |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + bcrypt |
| File Handling | multer (upload), exceljs (Excel) |

---

## Cara Menjalankan

### Prasyarat

- Node.js 20+
- PostgreSQL 15+
- npm

### Backend

```bash
cd server
npm install
cp .env.example .env
```

Isi `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/padang_pariaman_map"
JWT_SECRET="string_acak_minimal_32_karakter"
JWT_EXPIRES_IN="7d"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
```

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

### Akses

| URL | Keterangan |
|-----|-----------|
| `http://localhost:5173` | Peta publik |
| `http://localhost:5173/admin/login` | Login admin |

**Kredensial default:** `admin` / `admin123`

> Ganti password default di environment non-development.

---

## Struktur Folder

```
├── client/                     # Frontend (React + Vite + Tailwind)
│   └── src/
│       ├── assets/geojson/     # GeoJSON batas wilayah
│       ├── components/
│       │   ├── admin/          # FotoUpload, CategoryBadge
│       │   ├── filter/         # FilterKategori, FilterWilayah
│       │   ├── layout/         # PublicHeader
│       │   ├── map/            # MapContainer, MarkerLayer, WilayahLayer
│       │   ├── search/         # SearchBar
│       │   ├── statistik/      # StatistikPanel, DonutChart, BarChart
│       │   └── ui/             # Button, Input, Modal, Card, Badge, Select, Skeleton
│       ├── hooks/              # useInfrastruktur, useStatistik, useDebounce, dll
│       ├── lib/                # Axios instance, cn utility, category icons
│       ├── pages/              # ClientMap, admin/ (Login, Dashboard, dll)
│       ├── store/              # Zustand (authStore, filterStore, mapStore)
│       └── types/              # TypeScript interfaces
│
└── server/                     # Backend (Express + TypeScript)
    ├── uploads/images/         # Foto yang diupload (dibuat otomatis)
    └── src/
        ├── routes/             # API routes
        ├── middleware/         # JWT auth
        ├── prisma/             # Schema + seed
        └── utils/              # Excel & upload helpers
```

---

## API

### Publik (tanpa autentikasi)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login, return JWT |
| GET | `/api/kategori` | Daftar kategori |
| GET | `/api/infrastruktur` | List infrastruktur (filter: kategori, kdkec, kddesa, search, page) |
| GET | `/api/statistik` | Data statistik (filter: kdkec, kddesa, tahun, indikator) |
| GET | `/api/wilayah/kecamatan?kdkab=` | Daftar kecamatan |
| GET | `/api/wilayah/nagari?kdkec=` | Daftar nagari berdasarkan `kdkec` |
| GET | `/api/wilayah/korong?kddesa=` | Daftar korong berdasarkan `kddesa` |

### Protected (Bearer token)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST/PUT/DELETE | `/api/kategori/:id` | CRUD kategori |
| POST/PUT/DELETE | `/api/infrastruktur/:id` | CRUD infrastruktur |
| POST | `/api/infrastruktur/import` | Import Excel (maks 5.000 baris) |
| GET | `/api/infrastruktur/export` | Export Excel |
| POST/PUT/DELETE | `/api/statistik/:id` | CRUD statistik |
| POST | `/api/statistik/import` | Import Excel |
| GET | `/api/statistik/export` | Export Excel |
| POST | `/api/upload/foto` | Upload foto (JPG/PNG/WebP, maks 5MB) |
| DELETE | `/api/upload/foto/:filename` | Hapus foto |

---

## Kode Wilayah (BPS)

Hierarki kode wilayah BPS Kabupaten Padang Pariaman:

| Level | Field | Digit | Contoh |
|-------|-------|-------|--------|
| Kabupaten | `kdkab` | 4 | `1306` |
| Kecamatan | `kdkec` | 6 | `130601` |
| Nagari | `kddesa` | 10 | `1306010001` |
| Korong | `kdsls` | 12 | `130601000101` |

---

## Template Import Excel

### Infrastruktur

| Kolom | Header | Wajib | Catatan |
|-------|--------|-------|---------|
| A | `nama` | Ya | Nama infrastruktur |
| B | `kategori` | Ya | Slug kategori (cth: `restoran`) |
| C | `alamat` | Tidak | Alamat lengkap |
| D | `foto_url` | Tidak | URL atau kosongkan (upload via admin nanti) |
| E | `lat` | Ya | Latitude |
| F | `lng` | Ya | Longitude |
| G | `kdkab` | Ya | Harus `1306` |
| H | `kdkec` | Ya | 6 digit, dimulai `1306` |
| I | `kddesa` | Ya | 10 digit, dimulai dengan `kdkec` |
| J | `kdsls` | Tidak | 12 digit, dimulai dengan `kddesa` |

### Statistik

| Kolom | Header | Wajib | Catatan |
|-------|--------|-------|---------|
| A | `kdkab` | Ya | Kode kabupaten (`1306`) |
| B | `kdkec` | Tidak | Kode kecamatan |
| C | `kddesa` | Tidak | Kode nagari |
| D | `kdsls` | Tidak | Kode korong |
| E | `indikator` | Ya | Nama indikator |
| F | `nilai` | Ya | Angka |
| G | `satuan` | Tidak | Satuan (cth: `jiwa`) |
| H | `tahun` | Ya | Tahun data |

---

## Keamanan

- Admin URL tidak ditautkan dari halaman publik
- Password di-hash dengan bcrypt (cost factor 10)
- `.env` di-exclude dari Git
- Upload hanya menerima gambar (JPG/PNG/WebP), maks 5MB
- Import Excel dibatasi 5.000 baris per file
- JWT otomatis expired setelah 7 hari

---

## Lisensi

MIT — Dikembangkan untuk Kabupaten Padang Pariaman, Sumatera Barat.
