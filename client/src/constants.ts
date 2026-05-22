// Konstanta aplikasi frontend Peta Tematik Padang Pariaman

// ===== WILAYAH =====
// Kode BPS resmi Kabupaten Padang Pariaman = 1306
export const IDKAB_PADANG_PARIAMAN = '1306';
export const NAMA_KABUPATEN = 'Kab. Padang Pariaman';

// ===== PETA =====
export const MAP_CENTER: [number, number] = [-0.5397, 100.1187];
export const MAP_DEFAULT_ZOOM = 11;
export const MAP_MIN_ZOOM = 9;
export const MAP_MAX_ZOOM = 18;
export const MAP_CLUSTER_THRESHOLD = 100;

// ===== ADMIN =====
export const ADMIN_TOKEN_KEY = 'admin_token';
export const ADMIN_PAGE_SIZE = 20;

// ===== API =====
export const DEBOUNCE_DELAY_MS = 300;

// ===== BASEMAP URLS =====
export const BASEMAP_OSM = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const BASEMAP_GOOGLE_SATELLITE = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
export const BASEMAP_GOOGLE_ROAD = 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
export const BASEMAP_OSM_ATTRIBUTION = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
export const BASEMAP_GOOGLE_ATTRIBUTION = '© Google Maps';
