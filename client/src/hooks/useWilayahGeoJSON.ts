/**
 * Hooks untuk mengambil daftar wilayah langsung dari GeoJSON yang sudah di-bundle.
 * Tidak perlu API call — data sudah ada di client.
 * Menggunakan idkec / iddesa / idsls sebagai value (kode BPS penuh).
 */

import { useMemo } from 'react';
import {
  kecamatanGeoJSON,
  nagariGeoJSON,
  korongGeoJSON,
} from '../assets/geojson';

export interface WilayahItem {
  kode: string;   // idkec / iddesa / idsls
  nama: string;   // nmkec / nmdesa / nmsls
}

/** Daftar kecamatan unik dari kecamatan.geojson */
export function useKecamatanGeoJSON(): WilayahItem[] {
  return useMemo(() => {
    const map = new Map<string, string>();
    kecamatanGeoJSON.features.forEach((f) => {
      const p = f.properties;
      if (!p) return;
      const kode = String(p.idkec ?? '');
      const nama = String(p.nmkec ?? kode);
      if (kode && !map.has(kode)) map.set(kode, nama);
    });
    return Array.from(map.entries())
      .map(([kode, nama]) => ({ kode, nama }))
      .sort((a, b) => a.nama.localeCompare(b.nama, 'id'));
  }, []);
}

/** Daftar nagari unik dalam kecamatan tertentu (filter by idkec) */
export function useNagariGeoJSON(idkec: string): WilayahItem[] {
  return useMemo(() => {
    if (!idkec) return [];
    const map = new Map<string, string>();
    nagariGeoJSON.features.forEach((f) => {
      const p = f.properties;
      if (!p || String(p.idkec) !== idkec) return;
      const kode = String(p.iddesa ?? '');
      const nama = String(p.nmdesa ?? kode);
      if (kode && !map.has(kode)) map.set(kode, nama);
    });
    return Array.from(map.entries())
      .map(([kode, nama]) => ({ kode, nama }))
      .sort((a, b) => a.nama.localeCompare(b.nama, 'id'));
  }, [idkec]);
}

/** Daftar korong unik dalam nagari tertentu (filter by iddesa) */
export function useKorongGeoJSON(iddesa: string): WilayahItem[] {
  return useMemo(() => {
    if (!iddesa) return [];
    const map = new Map<string, string>();
    korongGeoJSON.features.forEach((f) => {
      const p = f.properties;
      if (!p || String(p.iddesa) !== iddesa) return;
      const kode = String(p.idsls ?? '');
      const nama = String(p.nmsls ?? kode);
      if (kode && !map.has(kode)) map.set(kode, nama);
    });
    return Array.from(map.entries())
      .map(([kode, nama]) => ({ kode, nama }))
      .sort((a, b) => a.nama.localeCompare(b.nama, 'id'));
  }, [iddesa]);
}
