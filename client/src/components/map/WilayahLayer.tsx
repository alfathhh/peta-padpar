import { useEffect, useMemo, useCallback, useRef } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useFilterStore } from '../../store/filterStore';
import { useGeoJSONLayer } from '../../hooks/useWilayahGeoJSON';

const STYLE_KECAMATAN = { color: '#10B981', weight: 1.5, fillOpacity: 0.06 };
const STYLE_NAGARI    = { color: '#F59E0B', weight: 1.5, fillOpacity: 0.08 };
const STYLE_KORONG    = { color: '#EF4444', weight: 1,   fillOpacity: 0.10 };
const STYLE_KORONG_SELECTED = { color: '#1D4ED8', weight: 3, fillOpacity: 0.25 };
const STYLE_HOVER     = { weight: 3, fillOpacity: 0.22 };
const FIT_PADDING: L.PointTuple = [32, 32];
const SELECTED_PADDING: L.PointTuple = [56, 56];

/* Cache bounds per FeatureCollection */
const BOUNDS_CACHE = new WeakMap<GeoJSON.FeatureCollection, L.LatLngBounds | null>();

function getBoundsCached(fc: GeoJSON.FeatureCollection): L.LatLngBounds | null {
  const cached = BOUNDS_CACHE.get(fc);
  if (cached !== undefined) return cached;
  let bounds: L.LatLngBounds | null = null;
  try {
    const layer = L.geoJSON(fc);
    const b = layer.getBounds();
    bounds = b.isValid() ? b : null;
  } catch {
    bounds = null;
  }
  BOUNDS_CACHE.set(fc, bounds);
  return bounds;
}

function smoothFitBounds(map: L.Map, bounds: L.LatLngBounds, padding: L.PointTuple, smooth: boolean) {
  if (!smooth) {
    map.fitBounds(bounds, { padding, animate: false });
    return;
  }
  map.flyToBounds(bounds, { padding, animate: true, duration: 0.75, easeLinearity: 0.2 });
}

export default function WilayahLayer() {
  const map = useMap();
  const { idkec, iddesa, idsls, setIdkec, setIddesa, setIdsls } = useFilterStore();
  const geoJsonRef = useRef<L.GeoJSON | null>(null);
  const hasMountedRef = useRef(false);
  const isClickNavigationRef = useRef(false);

  // Selalu load semua layer — cache in-memory, fetch hanya sekali
  const { data: kecamatanData } = useGeoJSONLayer('kecamatan');
  const { data: nagariData }    = useGeoJSONLayer('nagari');
  const { data: korongData }    = useGeoJSONLayer('korong');

  // Pre-index nagari by idkec dan korong by iddesa
  const nagariByKec = useMemo(() => {
    const m = new Map<string, GeoJSON.Feature[]>();
    if (!nagariData) return m;
    for (const f of nagariData.features) {
      const k = String(f.properties?.idkec ?? '');
      if (!k) continue;
      const arr = m.get(k);
      if (arr) arr.push(f);
      else m.set(k, [f]);
    }
    return m;
  }, [nagariData]);

  const korongByNagari = useMemo(() => {
    const m = new Map<string, GeoJSON.Feature[]>();
    if (!korongData) return m;
    for (const f of korongData.features) {
      const k = String(f.properties?.iddesa ?? '');
      if (!k) continue;
      const arr = m.get(k);
      if (arr) arr.push(f);
      else m.set(k, [f]);
    }
    return m;
  }, [korongData]);

  const { displayData, baseStyle, level } = useMemo(() => {
    if (iddesa) {
      const features = korongByNagari.get(iddesa) ?? [];
      const fc: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features };
      return { displayData: fc, baseStyle: STYLE_KORONG, level: 'korong' as const };
    }
    if (idkec) {
      const features = nagariByKec.get(idkec) ?? [];
      const fc: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features };
      return { displayData: fc, baseStyle: STYLE_NAGARI, level: 'nagari' as const };
    }
    const fc = kecamatanData ?? { type: 'FeatureCollection' as const, features: [] };
    return { displayData: fc, baseStyle: STYLE_KECAMATAN, level: 'kecamatan' as const };
  }, [idkec, iddesa, kecamatanData, nagariByKec, korongByNagari]);

  // fitBounds saat level/wilayah berubah
  useEffect(() => {
    if (!displayData.features.length) return;
    const bounds = getBoundsCached(displayData);
    if (!bounds) return;
    smoothFitBounds(map, bounds, FIT_PADDING, hasMountedRef.current || isClickNavigationRef.current);
    hasMountedRef.current = true;
    isClickNavigationRef.current = false;
  }, [displayData, map]);

  // Highlight korong terpilih
  useEffect(() => {
    if (level !== 'korong' || !geoJsonRef.current) return;
    geoJsonRef.current.eachLayer((layer) => {
      const feature = (layer as L.Layer & { feature?: GeoJSON.Feature }).feature;
      if (!feature?.properties) return;
      const path = layer as L.Path;
      if (idsls && String(feature.properties.idsls) === idsls) {
        path.setStyle(STYLE_KORONG_SELECTED);
        path.bringToFront();
      } else {
        path.setStyle(STYLE_KORONG);
      }
    });

    if (idsls) {
      const selectedFeature = displayData.features.find(
        (f) => f.properties && String(f.properties.idsls) === idsls,
      );
      if (selectedFeature) {
        const singleFc: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [selectedFeature] };
        const bounds = getBoundsCached(singleFc);
        if (bounds) smoothFitBounds(map, bounds, SELECTED_PADDING, true);
      }
    }
  }, [idsls, level, displayData, map]);

  const onEachFeature = useCallback(
    (feature: GeoJSON.Feature, layer: L.Layer) => {
      const props = feature.properties ?? {};

      let namaWilayah = '';
      if (level === 'kecamatan')   namaWilayah = props.nmkec  ?? props.idkec  ?? '';
      else if (level === 'nagari') namaWilayah = props.nmdesa ?? props.iddesa ?? '';
      else if (level === 'korong') namaWilayah = props.nmsls  ?? props.idsls  ?? '';

      layer.bindTooltip(namaWilayah, {
        sticky: true,
        className: 'wilayah-tooltip',
        direction: 'top',
        offset: [0, -4],
      });

      layer.on({
        mouseover(e) {
          const l = e.target as L.Path;
          l.setStyle({ ...baseStyle, ...STYLE_HOVER });
          l.bringToFront();
        },
        mouseout(e) {
          const l = e.target as L.Path;
          const feat = (l as L.Path & { feature?: GeoJSON.Feature }).feature;
          if (level === 'korong' && feat?.properties &&
              useFilterStore.getState().idsls === String(feat.properties.idsls)) {
            l.setStyle(STYLE_KORONG_SELECTED);
          } else {
            l.setStyle(baseStyle);
          }
        },
        click() {
          isClickNavigationRef.current = true;
          if (level === 'kecamatan' && props.idkec)    setIdkec(String(props.idkec));
          else if (level === 'nagari' && props.iddesa) setIddesa(String(props.iddesa));
          else if (level === 'korong' && props.idsls)  setIdsls(String(props.idsls));
        },
      });
    },
    [level, baseStyle, setIdkec, setIddesa, setIdsls],
  );

  const styleFunction = useCallback(
    (feature?: GeoJSON.Feature) => {
      if (level === 'korong' && feature?.properties && idsls &&
          String(feature.properties.idsls) === idsls) {
        return STYLE_KORONG_SELECTED;
      }
      return baseStyle;
    },
    [level, baseStyle, idsls],
  );

  if (!displayData.features.length) return null;

  return (
    <GeoJSON
      key={`${level}-${idkec}-${iddesa}`}
      ref={(ref) => { geoJsonRef.current = ref as L.GeoJSON | null; }}
      data={displayData}
      style={styleFunction}
      onEachFeature={onEachFeature}
    />
  );
}
