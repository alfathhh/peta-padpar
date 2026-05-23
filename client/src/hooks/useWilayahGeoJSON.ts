/**
 * Hooks untuk mengambil daftar wilayah dari GeoJSON yang di-fetch dari server.
 * GeoJSON tidak lagi di-bundle ke client — disimpan di server/data/geojson/
 * dan di-serve melalui GET /api/geojson/:layer.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import api from '../lib/api';

export interface WilayahItem {
  kode: string;
  nama: string;
}

type LayerName = 'kecamatan' | 'nagari' | 'korong';

// Cache in-memory per layer — cegah fetch ulang saat komponen re-mount
const geoJsonCache = new Map<string, GeoJSON.FeatureCollection>();

async function fetchGeoJSON(layer: LayerName): Promise<GeoJSON.FeatureCollection> {
  const cached = geoJsonCache.get(layer);
  if (cached) return cached;
  const res = await api.get<GeoJSON.FeatureCollection>(`/geojson/${layer}`);
  geoJsonCache.set(layer, res.data);
  return res.data;
}

/** Hook generik untuk load GeoJSON layer dari server */
export function useGeoJSONLayer(layer: LayerName) {
  const [data, setData] = useState<GeoJSON.FeatureCollection | null>(
    () => geoJsonCache.get(layer) ?? null
  );
  const [loading, setLoading] = useState(!geoJsonCache.has(layer));

  useEffect(() => {
    if (geoJsonCache.has(layer)) {
      setData(geoJsonCache.get(layer)!);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchGeoJSON(layer).then(fc => {
      if (!cancelled) { setData(fc); setLoading(false); }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [layer]);

  return { data, loading };
}

/** Daftar kecamatan unik — diambil dari kecamatan.geojson via server */
export function useKecamatanGeoJSON(): WilayahItem[] {
  const { data } = useGeoJSONLayer('kecamatan');
  return useMemo(() => {
    if (!data) return [];
    const map = new Map<string, string>();
    data.features.forEach((f) => {
      const p = f.properties;
      if (!p) return;
      const kode = String(p.idkec ?? '');
      const nama = String(p.nmkec ?? kode);
      if (kode && !map.has(kode)) map.set(kode, nama);
    });
    return Array.from(map.entries())
      .map(([kode, nama]) => ({ kode, nama }))
      .sort((a, b) => a.kode.localeCompare(b.kode));
  }, [data]);
}

/** Daftar nagari unik dalam kecamatan tertentu */
export function useNagariGeoJSON(idkec: string): WilayahItem[] {
  const { data } = useGeoJSONLayer('nagari');
  return useMemo(() => {
    if (!data || !idkec) return [];
    const map = new Map<string, string>();
    data.features.forEach((f) => {
      const p = f.properties;
      if (!p || String(p.idkec) !== idkec) return;
      const kode = String(p.iddesa ?? '');
      const nama = String(p.nmdesa ?? kode);
      if (kode && !map.has(kode)) map.set(kode, nama);
    });
    return Array.from(map.entries())
      .map(([kode, nama]) => ({ kode, nama }))
      .sort((a, b) => a.kode.localeCompare(b.kode));
  }, [data, idkec]);
}

/** Daftar korong unik dalam nagari tertentu */
export function useKorongGeoJSON(iddesa: string): WilayahItem[] {
  const { data } = useGeoJSONLayer('korong');
  return useMemo(() => {
    if (!data || !iddesa) return [];
    const map = new Map<string, string>();
    data.features.forEach((f) => {
      const p = f.properties;
      if (!p || String(p.iddesa) !== iddesa) return;
      const kode = String(p.idsls ?? '');
      const nama = String(p.nmsls ?? kode);
      if (kode && !map.has(kode)) map.set(kode, nama);
    });
    return Array.from(map.entries())
      .map(([kode, nama]) => ({ kode, nama }))
      .sort((a, b) => a.kode.localeCompare(b.kode));
  }, [data, iddesa]);
}
