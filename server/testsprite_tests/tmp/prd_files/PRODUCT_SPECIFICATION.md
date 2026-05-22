# PRODUCT SPECIFICATION
## Peta Tematik Interaktif — Kabupaten Padang Pariaman

| Field | Nilai |
|---|---|
| **Versi Dokumen** | 1.0 |
| **Tanggal** | 2026-05-13 |
| **Status** | Active |
| **Repo** | `alfathhh/tematik1306` |
| **Path Kode** | `padang-pariaman-map/` |

---

## 1. Ringkasan Produk

**Peta Tematik Interaktif Kabupaten Padang Pariaman** adalah aplikasi web yang memvisualisasikan data infrastruktur dan statistik wilayah Kabupaten Padang Pariaman, Sumatera Barat, dalam bentuk peta interaktif berbasis browser.

Produk terdiri dari dua sisi:
- **Halaman Publik (`/`)** — Siapa pun bisa mengakses; menampilkan peta, filter, pencarian, dan statistik.
- **Panel Admin (`/admin`)** — Hanya pengelola data; URL tidak dipublikasikan di halaman publik.

---

## 2. Pengguna (Persona)

| Persona | Deskripsi | Halaman Utama |
|---|---|---|
| **Warga / Pengunjung** | Masyarakat umum yang ingin mencari fasilitas atau melihat data statistik wilayah | `/` |
| **Admin OPD** | Petugas yang mengelola dan memperbarui data infrastruktur dan statistik | `/admin/*` |

---

## 3. Fitur Utama

### 3.1 Halaman Publik

| Fitur | Deskripsi |
|---|---|
| **Peta Interaktif** | Leaflet.js, zoom 9–18, center Padang Pariaman (`-0.5397, 100.1187`) |
| **Toggle Basemap** | OSM ↔ Google Maps (satelit), tombol glass melayang kanan-bawah peta |
| **Filter Kategori** | Chip per kategori infrastruktur; warna & ikon dari API; toggle aktif/nonaktif |
| **Filter Wilayah** | Cascade dropdown: Kabupaten → Kecamatan → Nagari → Korong dengan breadcrumb aktif |
| **Pencarian** | Debounce 300 ms, flyTo marker di peta, dropdown hasil dengan badge kategori |
| **Panel Statistik** | Card angka besar, Bar Chart (indikator), Donut Chart (distribusi kategori); update real-time sesuai filter wilayah |
| **Popup Infrastruktur** | Foto 16:9, badge kategori, nama bold, alamat dengan ikon 📍 |
| **Clustering Marker** | Aktif jika jumlah marker > 100 (`react-leaflet-cluster`) |
| **Mobile Support** | Bottom sheet untuk filter & statistik; floating buttons |

### 3.2 Panel Admin

| Fitur | Deskripsi |
|---|---|
| **Login** | JWT 7 hari, bcrypt password, error inline + toast |
| **Dashboard** | 3 summary card (total infra, kategori, statistik), progress bar per kategori, aksi cepat |
| **CRUD Infrastruktur** | Tabel paginasi 20/hal, search, filter kategori, form Modal dengan MapPicker koordinat |
| **Upload Foto** | Drag & drop atau klik, JPG/PNG/WebP maks 5 MB, preview 16:9 dengan overlay |
| **Import Excel Infrastruktur** | Upload .xlsx, validasi baris, tampilkan hasil (sukses/gagal per baris), maks 5.000 baris |
| **Export Excel Infrastruktur** | Unduh file .xlsx semua data |
| **CRUD Statistik** | Tabel paginasi, filter tahun + kecamatan, form Modal dengan cascade wilayah |
| **Import/Export Excel Statistik** | Sama dengan infrastruktur |
| **CRUD Kategori** | Tabel dengan color swatch, auto-slug dari label, emoji icon, color picker native, preview badge real-time; tombol hapus dinonaktifkan jika masih dipakai |

---

## 4. Tech Stack

### 4.1 Frontend (Client)

| Layer | Teknologi | Versi |
|---|---|---|
| Framework | React | 18.3.x |
| Build Tool | Vite | 5.x |
| Bahasa | TypeScript | 5.4.x |
| CSS | Tailwind CSS | 3.4.x |
| Peta | Leaflet + react-leaflet | 1.9.x / 4.2.x |
| State Management | Zustand | 4.5.x |
| Chart | Recharts | 2.12.x |
| HTTP Client | Axios | 1.7.x |
| Router | React Router DOM | 6.x |
| Font | Inter (body) + Plus Jakarta Sans (display) | Google Fonts |

### 4.2 Backend (Server)

| Layer | Teknologi | Versi |
|---|---|---|
| Runtime | Node.js | 20+ |
| Framework | Express | 4.19.x |
| Bahasa | TypeScript | 5.4.x |
| ORM | Prisma | 5.14.x |
| Database | PostgreSQL | 15+ |
| Auth | JWT + bcrypt | jsonwebtoken 9.x / bcrypt 5.x |
| File Upload | Multer | 1.4.x |
| Excel | ExcelJS | 4.4.x |

---

## 5. Arsitektur Sistem

```
Browser (User/Admin)
       │
       ▼
┌─────────────────────────────────┐
│  React SPA (Vite, port 5173)    │
│  ┌────────────┐ ┌─────────────┐ │
│  │ Halaman    │ │ Panel Admin │ │
│  │ Publik (/) │ │ (/admin/*)  │ │
│  └────────────┘ └─────────────┘ │
│       │ Axios (JWT Bearer)      │
└───────┼─────────────────────────┘
        │ HTTP REST API
        ▼
┌─────────────────────────────────┐
│  Express API (port 3000)        │
│  ┌──────────────────────────┐   │
│  │ Routes + Middleware      │   │
│  │  /auth  /infrastruktur   │   │
│  │  /kategori  /statistik   │   │
│  │  /wilayah  /upload       │   │
│  └──────────────────────────┘   │
│  ┌──────────────────────────┐   │
│  │ Prisma ORM               │   │
│  └──────────────────────────┘   │
└───────┬─────────────────────────┘
        │
        ▼
┌─────────────────┐   ┌─────────────────┐
│  PostgreSQL 15+ │   │  uploads/images/ │
│  (database)     │   │  (file storage)  │
└─────────────────┘   └─────────────────┘
```

---

## 6. Struktur Folder

```
padang-pariaman-map/
├── client/                          # React + Vite + Tailwind
│   ├── public/geojson/              # GeoJSON batas wilayah (statis)
│   │   ├── kabupaten.geojson
│   │   ├── kecamatan.geojson
│   │   ├── nagari.geojson
│   │   └── korong.geojson
│   └── src/
│       ├── components/
│       │   ├── ui/                  # Primitif: Button, Input, Select, Card, Badge, Modal, Toast, Skeleton
│       │   ├── map/                 # MapContainer, MarkerLayer, WilayahLayer, BasemapToggle, InfraPopup
│       │   ├── filter/              # FilterKategori, FilterWilayah
│       │   ├── search/              # SearchBar
│       │   ├── statistik/           # StatistikPanel, StatistikCard, BarChart, DonutChart
│       │   ├── layout/              # PublicHeader
│       │   └── admin/               # FotoUpload
│       ├── pages/
│       │   ├── ClientMap.tsx        # Halaman peta publik
│       │   ├── NotFound.tsx         # 404
│       │   └── admin/
│       │       ├── Login.tsx
│       │       ├── AdminLayout.tsx
│       │       ├── Dashboard.tsx
│       │       ├── Infrastruktur.tsx
│       │       ├── Statistik.tsx
│       │       └── Kategori.tsx
│       ├── store/                   # Zustand: authStore, filterStore, mapStore
│       ├── hooks/                   # useDebounce, useInfrastruktur, useStatistik, useWilayah
│       ├── lib/                     # api.ts (Axios), cn.ts (className util), mapUtils.ts
│       └── types/index.ts           # TypeScript interfaces
│
└── server/                          # Express + Prisma
    ├── prisma/
    │   ├── schema.prisma
    │   └── seed.ts
    ├── uploads/images/              # Foto upload (dibuat otomatis)
    └── src/
        ├── routes/                  # auth, infrastruktur, kategori, statistik, wilayah, upload
        ├── middleware/auth.ts       # JWT verify
        └── utils/                   # excel.ts, upload.ts (multer config)
```

---

## 7. Database Schema

### Tabel `admin_users`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | INT PK | Auto increment |
| `username` | VARCHAR(100) UNIQUE | Username login |
| `passwordHash` | VARCHAR(255) | bcrypt hash |
| `createdAt` | TIMESTAMP | |

### Tabel `kategori_infra`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | INT PK | |
| `value` | VARCHAR(50) UNIQUE | Slug: `restoran`, `rumah_ibadah` |
| `label` | VARCHAR(100) | Tampil: "Restoran" |
| `icon` | VARCHAR(10) | Emoji: "🍽️" |
| `color` | CHAR(7) | Hex: "#F97316" |
| `urutan` | INT | Urutan tampil di filter |

### Tabel `infrastruktur`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | INT PK | |
| `nama` | VARCHAR(255) | Nama titik |
| `kategori` | VARCHAR(50) FK | → `kategori_infra.value` |
| `alamat` | TEXT | Opsional |
| `fotoUrl` | TEXT | URL atau path `/uploads/images/...` |
| `lat` | FLOAT | Latitude |
| `lng` | FLOAT | Longitude |
| `kdkab` | CHAR(4) | Selalu `1305` |
| `kdkec` | CHAR(6) | Kode kecamatan |
| `kddesa` | CHAR(10) | Kode nagari |
| `kdsls` | CHAR(12) | Kode korong (opsional) |

### Tabel `statistik`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | INT PK | |
| `kdkab` | CHAR(4) | |
| `kdkec` | CHAR(6) | Opsional |
| `kddesa` | CHAR(10) | Opsional |
| `kdsls` | CHAR(12) | Opsional |
| `indikator` | VARCHAR(255) | "Jumlah Penduduk" |
| `nilai` | FLOAT | Angka |
| `satuan` | VARCHAR(50) | "jiwa", "km²" |
| `tahun` | INT | Tahun data |

---

## 8. Kode Wilayah

Hierarki kode wilayah Kabupaten Padang Pariaman:

| Level | Field | Panjang | Contoh | Aturan |
|---|---|---|---|---|
| Kabupaten | `kdkab` | 4 digit | `1305` | Selalu tetap |
| Kecamatan | `kdkec` | 6 digit | `130501` | Dimulai dengan `1305` |
| Nagari | `kddesa` | 10 digit | `1305010001` | Dimulai dengan `kdkec` |
| Korong | `kdsls` | 12 digit | `130501000101` | Dimulai dengan `kddesa` |

**Filter relasional tanpa JOIN:**
```sql
WHERE kdsls LIKE '130501' || '%'
```

---

## 9. API Endpoints

### Publik (tanpa autentikasi)
| Method | Path | Deskripsi |
|---|---|---|
| `POST` | `/api/auth/login` | Login admin, dapat JWT |
| `GET` | `/api/kategori` | Semua kategori infrastruktur |
| `GET` | `/api/infrastruktur` | List infrastruktur (query: `search`, `kategori`, `kdkec`, `kddesa`, `kdsls`, `page`, `limit`) |
| `GET` | `/api/statistik` | Data statistik (query: `kdkab`, `kdkec`, `kddesa`, `tahun`, `page`, `limit`) |
| `GET` | `/api/wilayah/kecamatan` | List kecamatan |
| `GET` | `/api/wilayah/nagari` | List nagari (query: `kdkec`) |
| `GET` | `/api/wilayah/korong` | List korong (query: `kddesa`) |

### Protected (butuh JWT `Authorization: Bearer <token>`)
| Method | Path | Deskripsi |
|---|---|---|
| `POST` | `/api/kategori` | Tambah kategori |
| `PUT` | `/api/kategori/:id` | Edit kategori |
| `DELETE` | `/api/kategori/:id` | Hapus kategori |
| `POST` | `/api/infrastruktur` | Tambah infrastruktur |
| `PUT` | `/api/infrastruktur/:id` | Edit infrastruktur |
| `DELETE` | `/api/infrastruktur/:id` | Hapus infrastruktur |
| `POST` | `/api/infrastruktur/import` | Import Excel (multipart) |
| `GET` | `/api/infrastruktur/export` | Export Excel |
| `POST` | `/api/statistik` | Tambah statistik |
| `PUT` | `/api/statistik/:id` | Edit statistik |
| `DELETE` | `/api/statistik/:id` | Hapus statistik |
| `POST` | `/api/statistik/import` | Import Excel statistik |
| `GET` | `/api/statistik/export` | Export Excel statistik |
| `POST` | `/api/upload/foto` | Upload foto (JPG/PNG/WebP, maks 5 MB) |
| `DELETE` | `/api/upload/foto/:filename` | Hapus foto dari server |

---

## 10. Design System

### 10.1 Palet Warna (Tema "Bumi Tabuik")

| Token | Hex | Penggunaan |
|---|---|---|
| `primary-500` | `#0284c7` | Aksi utama, link, active state |
| `primary-600` | `#0369a1` | Hover primary |
| `accent-500` | `#f59e0b` | CTA sekunder, highlight |
| `neutral-50` | `#f8fafc` | Background utama |
| `neutral-700` | `#334155` | Teks utama |
| `neutral-900` | `#0f172a` | Heading |
| `success-500` | `#16a34a` | State sukses |
| `warning-500` | `#eab308` | State peringatan |
| `danger-500` | `#dc2626` | State error, hapus |

**Warna kategori infrastruktur:** dinamis dari kolom `color` di `kategori_infra`.

### 10.2 Tipografi

| Skala | Font | Class Tailwind | Penggunaan |
|---|---|---|---|
| Display | Plus Jakarta Sans | `font-display font-bold text-2xl+` | Heading, judul halaman |
| Body | Inter | `font-sans text-sm` | Konten, label |
| Mono | JetBrains Mono | `font-mono` | Kode, koordinat, slug |

### 10.3 Komponen UI Primitif

Tersedia di `src/components/ui/`:

| Komponen | Varian/Prop Utama |
|---|---|
| `Button` | `variant`: primary/secondary/ghost/danger; `size`: sm/md/lg; `isLoading` |
| `Input` | `label`, `error`, `hint`, `leftIcon`, `rightIcon` |
| `Select` | `label`, `error`, `hint`; menerima `<option>` children |
| `Card` | `padding`: none/sm/md/lg; `hoverable`; subkomponen: Header, Title, Body, Footer |
| `Badge` | `variant`: neutral/primary/success/warning/danger; `color` (hex dari API) |
| `Modal` | `size`: sm/md/lg/xl; focus trap; tutup on Esc; `footer` slot |
| `Toast` | `toast.success/error/info/warning(message, title?)`; auto-dismiss 4 s |
| `Skeleton` | `variant`: rect/circle/text; subkomponen: Lines, Card |

---

## 11. State Management

### Zustand Stores

| Store | State | Keterangan |
|---|---|---|
| `authStore` | `token`, `user`, `isAuthenticated` | Login/logout admin |
| `filterStore` | `kategoriAktif`, `kdkab`, `kdkec`, `kddesa`, `kdsls` | Filter peta publik |
| `mapStore` | `basemap`, `mapInstance` | Basemap aktif dan referensi Leaflet map |

**Aturan filter cascade:**
- Saat `kdkec` berubah → reset `kddesa` dan `kdsls`
- Saat `kddesa` berubah → reset `kdsls`

---

## 12. Keamanan

| Aspek | Implementasi |
|---|---|
| Password | bcrypt cost factor 10 |
| Token | JWT, expire 7 hari |
| Upload | Validasi tipe MIME + ukuran (maks 5 MB) di server |
| Import | Maksimal 5.000 baris per file |
| Admin URL | `/admin` tidak diexpose di navbar/footer/link halaman publik |
| Env | `.env` tidak di-commit (ada di `.gitignore`) |

---

## 13. Aksesibilitas (A11y)

- Semua tombol icon-only punya `aria-label`
- Kontras teks ≥ 4.5:1 (WCAG AA)
- Fokus ring terlihat (`box-shadow: 0 0 0 3px rgba(2,132,199,0.35)`)
- Setiap `<input>` punya `<label htmlFor>` atau `aria-label`
- Modal: focus trap + restore focus ke trigger saat ditutup
- Peta: `role="application"` dengan `aria-label`
- Gambar infrastruktur: `alt={infra.nama}`

---

## 14. Performa

| Metrik | Target |
|---|---|
| First Contentful Paint (3G) | < 2 s |
| Largest Contentful Paint | < 2.5 s |
| Bundle JS (gzip) | Tidak naik > 15% dari baseline |
| Foto infrastruktur | `loading="lazy"` + `width`/`height` attribute |
| Clustering marker | Aktif jika marker > 100 |
| Leaflet resize | `invalidateSize()` via `ResizeObserver` saat panel toggle |

---

## 15. Konfigurasi Environment

### Server (`server/.env`)
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/padang_pariaman"
JWT_SECRET="random-string-minimal-32-karakter"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
CORS_ORIGIN="http://localhost:5173"
```

### Client (`client/.env.local`)
```env
VITE_API_URL=http://localhost:3000
```

---

## 16. Template Import Excel

### Infrastruktur (kolom wajib & opsional)
| Header | Wajib | Keterangan |
|---|---|---|
| `nama` | ✅ | Nama infrastruktur |
| `kategori` | ✅ | Harus cocok dengan `value` di `kategori_infra` |
| `alamat` | ❌ | |
| `foto_url` | ❌ | URL foto eksternal |
| `lat` | ✅ | Antara -4 dan 2 (Sumatera Barat) |
| `lng` | ✅ | Antara 99 dan 105 |
| `kdkab` | ✅ | Harus `1305` |
| `kdkec` | ✅ | 6 digit |
| `kddesa` | ✅ | 10 digit |
| `kdsls` | ❌ | 12 digit |

### Statistik
| Header | Wajib | Keterangan |
|---|---|---|
| `kdkab` | ✅ | |
| `kdkec` | ❌ | |
| `kddesa` | ❌ | |
| `kdsls` | ❌ | |
| `indikator` | ✅ | "Jumlah Penduduk" |
| `nilai` | ✅ | Angka |
| `satuan` | ❌ | "jiwa", "unit" |
| `tahun` | ✅ | |

---

## 17. Cara Menjalankan (Development)

```bash
# Clone
git clone https://github.com/alfathhh/tematik1306.git
cd tematik1306/padang-pariaman-map

# Backend
cd server
npm install
cp .env.example .env   # isi DATABASE_URL dan JWT_SECRET
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed    # seed admin + 6 kategori awal
npm run dev            # → port 3000

# Frontend (terminal baru)
cd ../client
npm install
npm run dev            # → port 5173
```

**Kredensial default:**
- Username: `admin`
- Password: `admin123`
- ⚠️ Ganti segera di production!

---

## 18. Seed Data Kategori Awal

```sql
INSERT INTO kategori_infra (value, label, icon, color, urutan) VALUES
  ('restoran',     'Restoran',     '🍽️', '#F97316', 1),
  ('rumah_ibadah', 'Rumah Ibadah', '🕌', '#8B5CF6', 2),
  ('pasar',        'Pasar',        '🛒', '#EAB308', 3),
  ('toko',         'Toko',         '🏪', '#06B6D4', 4),
  ('kesehatan',    'Kesehatan',    '🏥', '#22C55E', 5),
  ('lainnya',      'Lainnya',      '📍', '#6B7280', 99);
```

---

## 19. Roadmap (Backlog)

| Prioritas | Fitur |
|---|---|
| P1 | Dark mode (token sudah disiapkan) |
| P1 | Logo resmi Pemerintah Kabupaten Padang Pariaman |
| P2 | Notifikasi real-time saat data baru ditambahkan (WebSocket) |
| P2 | Export peta sebagai PDF/PNG |
| P3 | Multi-admin dengan role management |
| P3 | Audit log (siapa mengubah apa, kapan) |
| P3 | PWA (offline support untuk peta) |

---

## 20. Dokumen Terkait

| Dokumen | Lokasi | Deskripsi |
|---|---|---|
| `README.md` | `padang-pariaman-map/README.md` | Panduan singkat setup |
| `SETUP.md` | `tematik1306/SETUP.md` | Panduan setup lengkap + troubleshooting |
| `CLAUDE.md` | `tematik1306/CLAUDE.md` | Aturan coding untuk AI assistant |
| `PRD-UI-REFRESH.md` | `tematik1306/PRD-UI-REFRESH.md` | PRD peremajaan UI (Fase 1–4) |
| `ISSUE.md` | `tematik1306/ISSUE.md` | Log bug yang ditemukan & fix-nya |
| `PROMPT.md` | `tematik1306/PROMPT.md` | Prompt teknis awal pembangunan |
| PR #5 | GitHub | Implementasi UI refresh |

---

*Dokumen ini merupakan spesifikasi hidup — perbarui setiap kali ada perubahan arsitektur, endpoint, atau fitur baru.*
