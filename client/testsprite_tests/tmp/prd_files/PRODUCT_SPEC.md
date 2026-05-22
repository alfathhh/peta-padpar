# Product Specification — Peta Tematik Interaktif Kabupaten Padang Pariaman

**Version:** 1.0  
**Date:** May 13, 2026  
**Status:** Production-ready

---

## 1. Overview

Peta Tematik Interaktif is a web application for visualizing infrastructure point data and regional statistics across Padang Pariaman Regency, West Sumatra, Indonesia. It serves two distinct audiences: the general public (read-only map viewer) and administrators (data management panel).

**Core value proposition:** Give citizens and planners a single, filterable map view of all regional infrastructure — schools, health facilities, places of worship, restaurants, and more — alongside statistical indicators per territory, without requiring any GIS expertise.

---

## 2. Users & Roles

| Role | Access | Entry Point |
|------|--------|-------------|
| Public | Read-only map, filters, search, statistics | `/` |
| Admin | Full CRUD on all data, Excel import/export, photo upload | `/admin/login` (URL not linked from public pages) |

Admin accounts are managed directly in the database. There is no self-registration flow.

---

## 3. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript |
| Styling | Tailwind CSS |
| Map | Leaflet.js via react-leaflet |
| Charts | Recharts |
| State | Zustand |
| HTTP client | Axios |
| Backend | Node.js, Express 4, TypeScript |
| ORM | Prisma |
| Database | PostgreSQL 15+ |
| Auth | JWT (7-day expiry) + bcrypt |
| File handling | multer (uploads), exceljs (Excel import/export) |

---

## 4. Data Models

### 4.1 AdminUser
| Field | Type | Notes |
|-------|------|-------|
| id | Int (PK) | Auto-increment |
| username | String (unique) | Max 100 chars |
| passwordHash | String | bcrypt, cost factor 10 |
| createdAt | DateTime | |

### 4.2 KategoriInfra
| Field | Type | Notes |
|-------|------|-------|
| id | Int (PK) | Auto-increment |
| value | String (unique) | Slug: lowercase + underscore only (e.g. `rumah_ibadah`) |
| label | String | Display name (e.g. `Rumah Ibadah`) |
| icon | String | Emoji (e.g. `🕌`) |
| color | String | Hex color (e.g. `#FF5733`) |
| urutan | Int | Sort order for display |
| createdAt | DateTime | |

### 4.3 Infrastruktur
| Field | Type | Notes |
|-------|------|-------|
| id | Int (PK) | Auto-increment |
| nama | String | Infrastructure name |
| kategori | String (FK) | References `KategoriInfra.value` |
| alamat | String? | Optional address |
| fotoUrl | String? | URL path to photo or external URL |
| lat | Float | Latitude (-90 to 90) |
| lng | Float | Longitude (-180 to 180) |
| kdkab | Char(4) | Regency code, always `1305` |
| kdkec | Char(6) | District code, starts with `1305` |
| kddesa | Char(10) | Village/Nagari code, starts with kdkec |
| kdsls | Char(12)? | Sub-village/Korong code, optional |
| createdAt | DateTime | |
| updatedAt | DateTime | Auto-updated |

### 4.4 Statistik
| Field | Type | Notes |
|-------|------|-------|
| id | Int (PK) | Auto-increment |
| kdkab | Char(4) | Required |
| kdkec | Char(6)? | Optional — district level |
| kddesa | Char(10)? | Optional — village level |
| kdsls | Char(12)? | Optional — sub-village level |
| indikator | String | Indicator name (e.g. `Jumlah Penduduk`) |
| nilai | Float | Numeric value |
| satuan | String? | Unit (e.g. `jiwa`) |
| tahun | Int | Year (2000–2100) |
| createdAt | DateTime | |

### 4.5 Territory Hierarchy
```
kdkab (4 digits)  →  1305
  kdkec (6 digits)  →  130501
    kddesa (10 digits)  →  1305010001
      kdsls (12 digits)  →  130501000101
```

---

## 5. API Reference

Base URL: `http://localhost:3000`

### 5.1 Public Endpoints (no authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/login` | Admin login, returns JWT |
| GET | `/api/kategori` | List all categories (ordered by `urutan`) |
| GET | `/api/infrastruktur` | List infrastructure with optional filters |
| GET | `/api/infrastruktur/:id` | Get single infrastructure record |
| GET | `/api/statistik` | List statistics with optional filters |
| GET | `/api/statistik/:id` | Get single statistic record |
| GET | `/api/wilayah/kecamatan?kdkab=` | List distinct districts from data |
| GET | `/api/wilayah/nagari?kdkec=` | List distinct villages from data |
| GET | `/api/wilayah/korong?kddesa=` | List distinct sub-villages from data |
| GET | `/uploads/images/:filename` | Serve uploaded photos (static) |

**GET /api/infrastruktur — Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| kategori | string | Comma-separated category values |
| kdkab | string | Filter by regency code |
| kdkec | string | Filter by district code |
| kddesa | string | Filter by village code |
| kdsls | string | Filter by sub-village code |
| search | string | Case-insensitive name search |
| page | number | Page number (default: 1) |
| limit | number | Items per page (omit for all) |

**GET /api/statistik — Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| kdkab | string | Filter by regency code |
| kdkec | string | Filter by district code |
| kddesa | string | Filter by village code |
| kdsls | string | Filter by sub-village code |
| tahun | number | Filter by year |
| indikator | string | Case-insensitive indicator search |
| page | number | Page number |
| limit | number | Items per page |

### 5.2 Protected Endpoints (JWT required — `Authorization: Bearer <token>`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/kategori/:id` | Get single category |
| POST | `/api/kategori` | Create category |
| PUT | `/api/kategori/:id` | Update category |
| DELETE | `/api/kategori/:id` | Delete category (blocked if in use) |
| POST | `/api/infrastruktur` | Create infrastructure record |
| PUT | `/api/infrastruktur/:id` | Update infrastructure record |
| DELETE | `/api/infrastruktur/:id` | Delete infrastructure record |
| POST | `/api/infrastruktur/import` | Bulk import from Excel (max 5,000 rows) |
| GET | `/api/infrastruktur/export` | Export to Excel |
| POST | `/api/statistik` | Create statistic record |
| PUT | `/api/statistik/:id` | Update statistic record |
| DELETE | `/api/statistik/:id` | Delete statistic record |
| POST | `/api/statistik/import` | Bulk import from Excel (max 5,000 rows) |
| GET | `/api/statistik/export` | Export to Excel |
| POST | `/api/upload/foto` | Upload photo (JPG/PNG/WebP, max 5MB) |
| DELETE | `/api/upload/foto/:filename` | Delete uploaded photo |

### 5.3 Authentication Flow

```
POST /api/auth/login
Body: { username, password }
Response: { token, user: { id, username } }
```

Token is stored in `localStorage` under key `admin_token`. The Axios interceptor attaches it as `Authorization: Bearer <token>` on every request. A 401 response clears the token and redirects to `/admin/login`.

---

## 6. Frontend Architecture

### 6.1 Routing

| Path | Component | Guard |
|------|-----------|-------|
| `/` | `ClientMap` | Public |
| `/admin/login` | `Login` | Redirect to dashboard if authenticated |
| `/admin` | Redirect → `/admin/dashboard` | — |
| `/admin/dashboard` | `Dashboard` | Protected |
| `/admin/kategori` | `AdminKategori` | Protected |
| `/admin/infrastruktur` | `AdminInfrastruktur` | Protected |
| `/admin/statistik` | `AdminStatistik` | Protected |
| `*` | `NotFound` | — |

All page components are lazy-loaded with a spinner fallback.

### 6.2 State Management (Zustand)

**authStore**
- `token`, `user`, `isAuthenticated`
- Persisted to `localStorage`
- `login(token, user)` / `logout()`

**filterStore**
- `kategoriAktif: string[]` — active category slugs (default: empty, no markers shown)
- `kdkab`, `kdkec`, `kddesa`, `kdsls` — cascading territory filter
- Drives both the map marker layer and the statistics panel simultaneously

**mapStore**
- `center`, `zoom`, `basemap` (`osm` | `google`), `mapInstance`

### 6.3 Key Components

**Public Map Page (`ClientMap`)**
- Three-column layout on desktop: filter sidebar (left) | map (center) | statistics panel (right)
- Mobile: full-screen map with bottom sheet drawer for filter and statistics
- Sidebar and statistics panel can be toggled via header buttons

**Map Components**
- `MapContainer` — Leaflet map wrapper, handles basemap switching
- `MarkerLayer` — renders infrastructure markers filtered by `filterStore`; uses category color and icon
- `WilayahLayer` — renders GeoJSON boundary overlays (kabupaten, kecamatan, nagari, korong)
- `InfraPopup` — popup on marker click: name, category badge, address, photo, coordinates
- `BasemapToggle` — OSM ↔ Google Satellite toggle button

**Filter Components**
- `FilterKategori` — toggle buttons per category with icon and color indicator
- `FilterWilayah` — cascading dropdowns: Kecamatan → Nagari → Korong; resets child levels on parent change

**Search**
- `SearchBar` — 300ms debounced input; calls `/api/infrastruktur?search=`; clicking a result flies the map to that marker

**Statistics Panel**
- `StatistikPanel` — container, fetches stats based on current `filterStore` territory
- `StatistikCard` — key metric display
- `BarChart` — horizontal bar chart (Recharts)
- `DonutChart` — donut/pie chart (Recharts)

**Admin Components**
- `FotoUpload` — drag-and-drop photo uploader with live preview; supports URL input as alternative; calls `POST /api/upload/foto`
- `MapPicker` — click-on-map coordinate picker for infrastructure forms

### 6.4 Custom Hooks

| Hook | Purpose |
|------|---------|
| `useInfrastruktur(options)` | Fetch infrastructure; skips fetch if no categories active |
| `useStatistik(options)` | Fetch statistics by territory |
| `useKecamatan(kdkab)` | Fetch district list |
| `useNagari(kdkec)` | Fetch village list |
| `useKorong(kddesa)` | Fetch sub-village list |
| `useDebounce(value, delay)` | 300ms debounce for search input |

### 6.5 Static Assets

GeoJSON boundary files are served from `client/public/geojson/`:
- `kabupaten.geojson`
- `kecamatan.geojson`
- `nagari.geojson`
- `korong.geojson`

---

## 7. Feature Specifications

### 7.1 Public Map Viewer

**Interactive Map**
- Leaflet.js centered on Padang Pariaman Regency
- Default basemap: OpenStreetMap
- Toggle to Google Satellite basemap
- GeoJSON boundary overlays rendered per active territory filter level
- Marker clustering not implemented (all markers rendered directly)

**Category Filter**
- Toggle buttons for each `KategoriInfra` entry
- Default state: all categories off (no markers shown)
- Toggling a category adds/removes its markers from the map
- Each category displays its configured icon (emoji) and color

**Territory Filter (Cascading)**
- Level 1: Kabupaten — fixed to Padang Pariaman (`1305`)
- Level 2: Kecamatan — populated from `/api/wilayah/kecamatan`
- Level 3: Nagari — populated from `/api/wilayah/nagari` based on selected Kecamatan
- Level 4: Korong — populated from `/api/wilayah/korong` based on selected Nagari
- Selecting a parent level resets all child levels

**Search**
- Text input with 300ms debounce
- Searches infrastructure by name (case-insensitive, server-side)
- Results shown as dropdown list
- Clicking a result: map flies to marker location and opens popup

**Infrastructure Popup**
- Triggered by clicking a map marker
- Shows: name, category badge (with color), address, photo (if available), latitude/longitude

**Statistics Panel**
- Updates in real-time as territory filter changes
- Displays statistical indicators for the selected territory level
- Visualizations: summary cards, bar chart, donut chart
- Data sourced from `Statistik` table filtered by current `kdkab/kdkec/kddesa/kdsls`

**Responsive Layout**
- Desktop (≥1024px): three-column layout
- Mobile (<1024px): full-screen map; filter and statistics accessible via bottom sheet drawer
- Bottom sheet: slide-up animation, backdrop overlay, drag handle

---

### 7.2 Admin Panel

**Authentication**
- Login form at `/admin/login` (not linked from public pages)
- Credentials verified against `admin_users` table (bcrypt)
- JWT issued on success, stored in `localStorage`, expires in 7 days
- All admin routes redirect to login if unauthenticated
- 401 responses auto-clear token and redirect to login

**Dashboard**
- Summary counts: total infrastructure, total statistics records, total categories
- Quick navigation to management pages

**Category Management (`/admin/kategori`)**
- List all categories with icon, color swatch, label, value, sort order
- Create: form with value (slug), label, icon (emoji picker), color (hex color picker), sort order
- Edit: same form pre-populated
- Delete: blocked with error message if any infrastructure uses the category
- Validation: `value` must match `/^[a-z_]+$/`; `color` must match `/^#[0-9A-Fa-f]{6}$/`

**Infrastructure Management (`/admin/infrastruktur`)**
- Paginated table with search and filters (category, territory)
- Create/Edit form fields: name, category (dropdown), address, photo, coordinates (lat/lng), territory codes
- MapPicker: click on embedded map to set lat/lng coordinates
- Photo upload: drag-and-drop or file picker (JPG/PNG/WebP, max 5MB); live preview with replace/remove actions; fallback to manual URL input
- Import from Excel: upload `.xlsx` file, row-level validation, returns success/error counts with per-row error messages
- Export to Excel: filtered export with optional kdkec, kddesa, kategori filters

**Statistics Management (`/admin/statistik`)**
- Paginated table with filters (territory, year, indicator)
- Create/Edit form fields: territory codes, indicator name, value, unit, year
- Import from Excel: same pattern as infrastructure import
- Export to Excel: filtered export

---

### 7.3 Excel Import/Export

**Infrastructure Import Template**

| Column | Header | Required | Notes |
|--------|--------|----------|-------|
| A | `nama` | ✅ | Infrastructure name |
| B | `kategori` | ✅ | Must match an existing `KategoriInfra.value` |
| C | `alamat` | ❌ | Address |
| D | `foto_url` | ❌ | External URL or `/uploads/...` path; leave blank to upload later |
| E | `lat` | ✅ | Float, -90 to 90 |
| F | `lng` | ✅ | Float, -180 to 180 |
| G | `kdkab` | ✅ | Must be `1305` |
| H | `kdkec` | ✅ | 6 digits, starts with `1305` |
| I | `kddesa` | ✅ | 10 digits, starts with `kdkec` |
| J | `kdsls` | ❌ | 12 digits, starts with `kddesa` |

**Statistics Import Template**

| Column | Header | Required | Notes |
|--------|--------|----------|-------|
| A | `kdkab` | ✅ | Regency code |
| B | `kdkec` | ❌ | District code |
| C | `kddesa` | ❌ | Village code |
| D | `kdsls` | ❌ | Sub-village code |
| E | `indikator` | ✅ | Indicator name |
| F | `nilai` | ✅ | Numeric value |
| G | `satuan` | ❌ | Unit |
| H | `tahun` | ✅ | Year (integer) |

**Import Constraints**
- Maximum 5,000 rows per file
- Partial success: valid rows are saved, invalid rows are reported with row number and error message
- Response: `{ berhasil: N, gagal: N, errors: [{ baris, pesan }] }`

---

## 8. Security

| Concern | Implementation |
|---------|---------------|
| Password storage | bcrypt, cost factor 10 |
| API authentication | JWT Bearer token, 7-day expiry |
| Admin URL discovery | `/admin` not linked from any public page |
| File upload safety | MIME type + extension validation; path traversal prevention on delete |
| Upload size limit | 5MB per photo; 10MB JSON body limit |
| Import row limit | 5,000 rows per Excel file |
| CORS | Restricted to `CORS_ORIGIN` env var (default: `http://localhost:5173`) |
| Secrets | `.env` excluded from Git; `JWT_SECRET` minimum 32 characters recommended |
| Category delete protection | Blocked if any infrastructure references the category |

---

## 9. Environment Configuration

### Server (`server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret key for JWT signing (min 32 chars) |
| `JWT_EXPIRES_IN` | ❌ | Token expiry (default: `7d`) |
| `PORT` | ❌ | Server port (default: `3000`) |
| `CORS_ORIGIN` | ❌ | Allowed frontend origin (default: `http://localhost:5173`) |
| `NODE_ENV` | ❌ | `development` or `production` |

### Client (`client/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ❌ | API base URL (default: `/api`) |

---

## 10. File Storage

Uploaded photos are stored on the server filesystem at `server/uploads/images/`. Files are named with a timestamp prefix to avoid collisions. They are served as static files at `/uploads/images/<filename>`.

There is no cloud storage integration. In production, this directory should be persisted across deployments (e.g., mounted volume).

---

## 11. Setup & Deployment

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- npm

### Development

```bash
# Backend
cd server
npm install
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed    # seeds admin user + 6 default categories + sample data
npm run dev            # starts on port 3000

# Frontend
cd client
npm install
npm run dev            # starts on port 5173
```

### Default Credentials (seed)
| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `admin123` |

> Change the default password immediately after first login in any non-development environment.

### Access URLs
| URL | Description |
|-----|-------------|
| `http://localhost:5173` | Public map |
| `http://localhost:5173/admin/login` | Admin login |
| `http://localhost:3000/api/health` | API health check |

---

## 12. Known Limitations & Future Considerations

- **Territory names:** Kecamatan, Nagari, and Korong names are currently derived from their codes (e.g., `Kecamatan 130501`). A dedicated `wilayah` reference table with proper names would improve UX.
- **Single admin account:** No multi-user admin support or role-based access control.
- **No password change UI:** Admin password changes require direct database access.
- **Local file storage:** Photos stored on server filesystem; not suitable for horizontally-scaled deployments without a shared volume or object storage migration.
- **No marker clustering:** Large datasets may cause map performance issues; clustering (e.g., `react-leaflet-cluster`) should be considered.
- **No audit log:** No record of who created/modified/deleted records.
- **GeoJSON is static:** Boundary files are bundled with the client; updates require a new deployment.
