import React, { useEffect, useRef } from 'react';
import { MapContainer as LeafletMap, TileLayer, useMapEvents, useMap } from 'react-leaflet';
import {
  MAP_CENTER, MAP_DEFAULT_ZOOM, MAP_MIN_ZOOM, MAP_MAX_ZOOM,
  BASEMAP_OSM, BASEMAP_GOOGLE_SATELLITE, BASEMAP_GOOGLE_ROAD, BASEMAP_OSM_ATTRIBUTION, BASEMAP_GOOGLE_ATTRIBUTION,
} from '../../constants';
import { useMapStore } from '../../store/mapStore';
import { useFilterStore } from '../../store/filterStore';
import { useInfrastruktur } from '../../hooks/useInfrastruktur';
import WilayahLayer from './WilayahLayer';
import MarkerLayer from './MarkerLayer';
import BasemapToggle from './BasemapToggle';
import { KategoriInfra } from '../../types';

interface MapContainerProps {
  kategoriList: KategoriInfra[];
}

/**
 * MapEventHandler — simpan map instance ke store + panggil invalidateSize
 * setiap kali ukuran container berubah (panel filter/statistik toggle).
 *
 * Fix Bug #3: Leaflet tidak otomatis mendeteksi perubahan ukuran container
 * jika parent element berubah width/height via CSS class toggle.
 * invalidateSize() memaksa Leaflet menghitung ulang dimensinya.
 */
function MapEventHandler() {
  const { setMapInstance } = useMapStore();
  const map = useMapEvents({});

  useEffect(() => {
    setMapInstance(map);

    // ResizeObserver: panggil invalidateSize setiap kali wrapper berubah ukuran
    const container = map.getContainer();
    const observer = new ResizeObserver(() => {
      map.invalidateSize({ animate: false });
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      setMapInstance(null);
    };
  }, [map, setMapInstance]);

  return null;
}

/** BasemapLayer — TileLayer yang reaktif terhadap state basemap di store. */
function BasemapLayer() {
  const { basemap } = useMapStore();
  const map = useMap();

  // Paksa invalidateSize saat basemap berubah (kadang tile baru butuh refresh)
  useEffect(() => {
    setTimeout(() => map.invalidateSize({ animate: false }), 100);
  }, [basemap, map]);

  if (basemap === 'osm') {
    return (
      <TileLayer
        key="osm"
        url={BASEMAP_OSM}
        attribution={BASEMAP_OSM_ATTRIBUTION}
      />
    );
  }
  if (basemap === 'google-satellite') {
    return (
      <TileLayer
        key="google-satellite"
        url={BASEMAP_GOOGLE_SATELLITE}
        attribution={BASEMAP_GOOGLE_ATTRIBUTION}
        maxZoom={20}
      />
    );
  }
  return (
    <TileLayer
      key="google-road"
      url={BASEMAP_GOOGLE_ROAD}
      attribution={BASEMAP_GOOGLE_ATTRIBUTION}
      maxZoom={20}
    />
  );
}

/** MapContainer — komponen utama peta interaktif. */
export default function MapContainer({ kategoriList }: MapContainerProps) {
  const { kategoriAktif, idkab, idkec, iddesa, idsls } = useFilterStore();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fetch infrastruktur sesuai filter aktif
  const { data: infrastruktur } = useInfrastruktur({
    kategori: kategoriAktif,
    idkab,
    idkec:  idkec  || undefined,
    iddesa: iddesa || undefined,
    idsls:  idsls  || undefined,
    enabled: kategoriAktif.length > 0,
  });

  // Lookup cepat kategoriValue → KategoriInfra
  const kategoriMap = React.useMemo(() => {
    const m = new Map<string, KategoriInfra>();
    kategoriList.forEach(k => m.set(k.value, k));
    return m;
  }, [kategoriList]);

  return (
    /*
     * Fix Bug #3 — peta tidak full:
     * wrapper HARUS punya height eksplisit (100%) agar Leaflet bisa mengukur.
     * Gunakan style inline sebagai fallback karena Tailwind h-full kadang
     * tidak cukup jika parent belum selesai di-layout oleh browser.
     */
    <div
      ref={wrapperRef}
      className="relative w-full h-full"
      style={{ minHeight: 0 }}  /* penting untuk flex children */
    >
      <LeafletMap
        center={MAP_CENTER}
        zoom={MAP_DEFAULT_ZOOM}
        minZoom={MAP_MIN_ZOOM}
        maxZoom={MAP_MAX_ZOOM}
        zoomControl={true}
        /* style eksplisit 100% width+height — lebih reliable dari className saja */
        style={{ width: '100%', height: '100%' }}
      >
        <MapEventHandler />
        <BasemapLayer />
        <WilayahLayer />
        <MarkerLayer
          infrastruktur={infrastruktur}
          kategoriMap={kategoriMap}
        />
      </LeafletMap>

      {/*
       * BasemapToggle dirender di LUAR <LeafletMap> agar z-index tidak
       * bertabrakan dengan Leaflet pane. Posisi absolute relatif terhadap
       * wrapper div ini (position: relative).
       */}
      <BasemapToggle />
    </div>
  );
}
