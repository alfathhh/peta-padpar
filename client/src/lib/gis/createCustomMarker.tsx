import L from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import type { KategoriInfra } from '../../types';
import { getCategoryColor, getCategoryConfig, getCategoryIcon } from './categoryConfig';

type CreateCustomMarkerParams = {
  categoryValue: string;
  kategori?: KategoriInfra;
};

export function createCustomMarker({
  categoryValue,
  kategori,
}: CreateCustomMarkerParams) {
  const config = getCategoryConfig(categoryValue);
  const Icon = getCategoryIcon(categoryValue, kategori);
  const pinColor = getCategoryColor(categoryValue, kategori);

  const html = ReactDOMServer.renderToString(
    <div
      className="relative h-11 w-10"
      style={{ filter: `drop-shadow(0 12px 18px ${pinColor}40)` }}
    >
      <div
        className="absolute left-1/2 top-0 z-10 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white"
        style={{ backgroundColor: pinColor }}
      >
        <Icon size={18} className={config.mapStyle.icon} aria-hidden="true" />
      </div>
      <div
        className="absolute left-1/2 top-[25px] h-4 w-4 -translate-x-1/2 rotate-45 rounded-br-[4px] border-b-2 border-r-2 border-white"
        style={{ backgroundColor: pinColor }}
        aria-hidden="true"
      />
    </div>,
  );

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [40, 44],
    iconAnchor: [20, 42],
    popupAnchor: [0, -38],
  });
}
