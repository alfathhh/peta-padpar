import L from 'leaflet';
import { KategoriInfra } from '../types';
import { getKategoriIcon } from './categoryIcons';

function safeColor(color: string) {
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : '#0284c7';
}

function markerIconPath(value: string) {
  switch (getKategoriIcon(value)) {
    case 'utensils':
      return '<path d="M6.5 5v6.8a2 2 0 0 0 4 0V5M8.5 5v14M14 5v5.5c0 .8.7 1.5 1.5 1.5H18V5m-2.5 7v7" />';
    case 'prayer':
      return '<path d="M12 4c1.8 1.6 3 3.6 3 5.8s-1.2 4.2-3 5.8c-1.8-1.6-3-3.6-3-5.8S10.2 5.6 12 4Z" /><path d="M6 19h12" />';
    case 'basket':
      return '<path d="m5.5 10 1.8 8h9.4l1.8-8h-13Z" /><path d="M9 10V8a3 3 0 0 1 6 0v2" />';
    case 'store':
      return '<path d="M5 9 6.3 5h11.4L19 9" /><path d="M6 10v8h12v-8" /><path d="M10 18v-4h4v4" />';
    case 'heart':
      return '<path d="M12 18s-6-3.8-6-8.2a3.4 3.4 0 0 1 6-2.1 3.4 3.4 0 0 1 6 2.1C18 14.2 12 18 12 18Z" />';
    default:
      return '<path d="m12 5 7 3.5-7 3.5-7-3.5L12 5Z" /><path d="m5 13 7 3.5 7-3.5" />';
  }
}

// Buat marker peta berdasarkan warna dan ikon kategori.
export function createMarkerIcon(kategori: KategoriInfra): L.DivIcon {
  const color = safeColor(kategori.color);
  const icon = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      ${markerIconPath(kategori.value)}
    </svg>
  `;

  return L.divIcon({
    className: '',
    html: `
      <div class="custom-marker" style="background-color: ${color};">
        <span class="custom-marker-inner">${icon}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

// Hitung bounding box dari GeoJSON FeatureCollection
export function getBoundsFromGeoJSON(geojson: GeoJSON.FeatureCollection): L.LatLngBounds | null {
  try {
    const layer = L.geoJSON(geojson);
    const bounds = layer.getBounds();
    if (bounds.isValid()) return bounds;
    return null;
  } catch {
    return null;
  }
}

// Filter fitur GeoJSON berdasarkan properti kode wilayah
export function filterGeoJSONByKode(
  geojson: GeoJSON.FeatureCollection,
  field: string,
  value: string
): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: geojson.features.filter(
      (f) => f.properties && f.properties[field] === value
    ),
  };
}
