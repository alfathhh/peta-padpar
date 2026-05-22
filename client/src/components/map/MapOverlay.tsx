import React, { useMemo } from 'react';
import type { KategoriInfra } from '../../types';
import MapContainer from './MapContainer';
import FloatingHeader from '../layout/FloatingHeader';
import FilterPanel from '../filter/FilterPanel';
import StatistikPanel from '../statistik/StatistikPanel';

interface MapOverlayProps {
  kategoriList: KategoriInfra[];
  showFilter: boolean;
  showStatistik: boolean;
  onToggleFilter: () => void;
  onToggleStatistik: () => void;
}

/**
 * MapOverlay — root layout immersive.
 *
 * Menggantikan struktur flex sidebar di ClientMap.tsx.
 * Peta menjadi layer paling bawah (z-0), semua UI melayang di atasnya (z-10+).
 *
 * Struktur layer:
 * - z-0  : MapContainer (peta full-screen)
 * - z-10 : overlay container (pointer-events-none agar klik peta tetap bisa)
 * - z-40 : FilterPanel dan StatistikPanel (pointer-events-auto)
 * - z-50 : FloatingHeader (pointer-events-auto)
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 9.5
 */
export default function MapOverlay({
  kategoriList,
  showFilter,
  showStatistik,
  onToggleFilter,
  onToggleStatistik,
}: MapOverlayProps) {
  // Hitung kategoriMap sekali dari kategoriList untuk diteruskan ke FloatingHeader
  const kategoriMap = useMemo(() => {
    const m = new Map<string, KategoriInfra>();
    kategoriList.forEach(k => m.set(k.value, k));
    return m;
  }, [kategoriList]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-50">
      {/* Layer 0: Peta full-screen */}
      <div className="absolute inset-0 z-0">
        <MapContainer kategoriList={kategoriList} />
      </div>

      {/* Layer 10: Semua UI overlay
          pointer-events-none di root agar klik/drag peta tetap bisa.
          Setiap panel di dalamnya harus punya pointer-events-auto sendiri. */}
      <div className="absolute inset-0 z-10 pointer-events-none p-4 md:p-6 flex flex-col gap-4">
        {/* Floating Header — tengah atas (z-50) */}
        <div className="flex justify-center z-50">
          <FloatingHeader
            kategoriMap={kategoriMap}
            onToggleFilter={onToggleFilter}
            onToggleStatistik={onToggleStatistik}
            filterActive={showFilter}
            statistikActive={showStatistik}
          />
        </div>

        {/* Row panel kiri + kanan */}
        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* Filter Panel — kiri (z-40) */}
          {showFilter && (
            <div className="z-40">
              <FilterPanel
                kategoriList={kategoriList}
                onClose={onToggleFilter}
              />
            </div>
          )}

          {/* Spacer tengah — area kosong agar klik peta tetap bisa */}
          <div className="flex-1" />

          {/* Statistik Panel — kanan (z-40) */}
          {showStatistik && (
            <div className="z-40 w-[min(360px,calc(100vw-2rem))] shrink-0">
              <StatistikPanel kategoriList={kategoriList} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
