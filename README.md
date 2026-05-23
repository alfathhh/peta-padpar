# Peta Tematik Interaktif — Kabupaten Padang Pariaman

Aplikasi web peta interaktif untuk visualisasi data infrastruktur dan statistik wilayah Kabupaten Padang Pariaman, Sumatera Barat, Indonesia.

## Fitur

### Halaman Publik (`/`)

- Peta interaktif (Leaflet.js) dengan basemap OSM / Google Satellite / Google Road
- Filter kategori infrastruktur (toggle per jenis)
- Filter wilayah cascading: Kecamatan → Nagari → Korong
- Pencarian infrastruktur & wilayah (debounce 300ms, fly-to lokasi)
- Panel statistik (donut chart, bar chart, ringkasan angka)
- Visualisasi batas wilayah GeoJSON dengan tooltip

### Panel Admin (`/admin`)

- Login JWT (7 hari), URL tersembunyi dari publik
- CRUD infrastruktur + MapPicker + upload foto + **crop editor inline (16:10, drag/zoom)** + import/export Excel
- CRUD statistik + import/export Excel
- CRUD kategori + icon picker + color picker

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Peta | Leaflet.js (react-leaflet) |
| State | Zustand |
| Charts | Recharts |
| HTTP | Axios |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + bcrypt |
| File | multer (upload foto), exceljs (Excel) |

---

## Foto & Crop

Upload foto lewat admin menyimpan **metadata crop** ke database — bukan file kedua:

| Field DB | Nilai | Keterangan |
|----------|-------|-----------|
| `fotoCropX` | 0–100 | Focal point horizontal (default 50 = tengah) |
| `fotoCropY` | 0–100 | Focal point vertikal (default 50 = tengah) |
| `fotoCropZoom` | ≥1.0 | Skala zoom (default 1 = tanpa zoom) |

Di popup peta, foto ditampilkan dengan `object-position` dan `scale` dari metadata ini. Data lama (null) otomatis fallback ke center/1×.

---



### Prasyarat

- Node.js 20+
- PostgreSQL 15+
- npm

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`:

```env
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/padang_pariaman_map"
JWT_SECRET="string_acak_minimal_32_karakter"
JWT_EXPIRES_IN="7d"
PORT=3001
CORS_ORIGIN="http://localhost:5173"
```

```bash
npx prisma generate
npx prisma migrate deploy   # production
# atau
npx prisma migrate dev      # development
npm run prisma:seed
npm run dev
```

### 2. Setup GeoJSON

File GeoJSON **tidak di-commit ke repo** (ada di `.gitignore`). Taruh manual di `server/data/geojson/`:

```bash
server/data/geojson/
├── kabupaten.geojson
├── kecamatan.geojson
├── nagari.geojson
└── korong.geojson
```

> Lihat bagian [Mengganti File GeoJSON](#mengganti-file-geojson) di bawah untuk detail format.

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

### 4. Akses

| URL | Keterangan |
|-----|-----------|
| http://localhost:5173 | Peta publik |
| http://localhost:5173/admin/login | Login admin |

**Default login:** `admin` / `admin123`

---

## Mengganti File GeoJSON

File GeoJSON disimpan di `server/data/geojson/` dan di-serve melalui endpoint `GET /api/geojson/:layer`. Hanya 4 layer yang diizinkan: `kabupaten`, `kecamatan`, `nagari`, `korong`.

### Cara ganti:

1. Siapkan file `.geojson` baru (format `FeatureCollection`)
2. Taruh di `server/data/geojson/`, **timpa file lama**:
   ```bash
   cp kecamatan_baru.geojson server/data/geojson/kecamatan.geojson
   ```
3. Restart server (atau tunggu 1 jam — browser cache `max-age=3600`)
4. Hard refresh browser (`Ctrl+Shift+R`) untuk clear cache

### Format properties yang diperlukan di tiap file:

**kecamatan.geojson** — setiap Feature harus punya:
```json
{ "idkec": "130601", "nmkec": "Batang Anai" }
```

**nagari.geojson** — setiap Feature harus punya:
```json
{ "idkec": "130601", "iddesa": "1306010001", "nmdesa": "Sungai Asam" }
```

**korong.geojson** — setiap Feature harus punya:
```json
{ "idkec": "130601", "iddesa": "1306010001", "idsls": "130601000101", "nmsls": "Korong Gadang" }
```

**kabupaten.geojson** — setiap Feature harus punya:
```json
{ "idkab": "1306" }
```

### Keamanan GeoJSON

- File hanya di-serve ke origin yang terdaftar di `CORS_ORIGIN` (`.env`)
- Tidak ada di JS bundle browser — orang tidak bisa langsung download dari DevTools
- File tidak di-commit ke Git

---

## Kode Wilayah (BPS)

| Level | Field DB | Digit | Contoh |
|-------|----------|-------|--------|
| Kabupaten | `idkab` | 4 | `1306` |
| Kecamatan | `idkec` | 7 | `1306010` |
| Nagari | `iddesa` | 10 | `1306010001` |
| Korong | `idsls` | 14 | `13060100010001` |

Urutan cascading: `idkec` → `iddesa` → `idsls`

---

## API

### Publik

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login admin |
| GET | `/api/kategori` | Daftar kategori |
| GET | `/api/infrastruktur` | List + filter (kategori, idkec, iddesa, search, page) |
| GET | `/api/statistik` | Data statistik + filter |
| GET | `/api/wilayah/kecamatan?idkab=` | Daftar kecamatan |
| GET | `/api/wilayah/nagari?idkec=` | Daftar nagari |
| GET | `/api/wilayah/korong?iddesa=` | Daftar korong |
| GET | `/api/geojson/:layer` | GeoJSON (kabupaten/kecamatan/nagari/korong) |

### Protected (Bearer token)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST/PUT/DELETE | `/api/infrastruktur/:id` | CRUD infrastruktur |
| POST | `/api/infrastruktur/import` | Import Excel (maks 5.000 baris) |
| GET | `/api/infrastruktur/export` | Export Excel |
| POST/PUT/DELETE | `/api/statistik/:id` | CRUD statistik |
| POST/PUT/DELETE | `/api/kategori/:id` | CRUD kategori |
| POST | `/api/upload/foto` | Upload foto (maks 5MB) |

---

## Template Import Excel

### Infrastruktur

| Kolom | Header | Wajib | Catatan |
|-------|--------|-------|---------|
| A | `nama` | Ya | |
| B | `kategori` | Ya | Slug (cth: `restoran`) |
| C | `alamat` | Tidak | |
| D | `foto_url` | Tidak | URL atau kosong |
| E | `lat` | Ya | Latitude |
| F | `lng` | Ya | Longitude |
| G | `idkab` | Ya | `1306` |
| H | `idkec` | Ya | 7 digit |
| I | `iddesa` | Ya | 10 digit |
| J | `idsls` | Tidak | 14 digit |

### Statistik

| Kolom | Header | Wajib | Catatan |
|-------|--------|-------|---------|
| A | `idkab` | Ya | `1306` |
| B | `idkec` | Tidak | 6 digit |
| C | `iddesa` | Tidak | 10 digit |
| D | `idsls` | Tidak | 12 digit |
| E | `indikator` | Ya | Nama indikator |
| F | `nilai` | Ya | Angka |
| G | `satuan` | Tidak | cth: `jiwa` |
| H | `tahun` | Ya | |

---

## Keamanan

- URL `/admin` tidak ditautkan dari halaman publik
- Password bcrypt (cost 10)
- `.env` tidak di-commit
- Upload hanya JPG/PNG/WebP, maks 5MB
- Import Excel maks 5.000 baris
- JWT expired 7 hari
- GeoJSON hanya ter-serve via CORS-protected endpoint

---

## Lisensi

MIT — Dikembangkan untuk Kabupaten Padang Pariaman, Sumatera Barat.
