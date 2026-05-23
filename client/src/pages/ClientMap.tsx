import React, { useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import { KategoriInfra } from '../types';
import MapContainer from '../components/map/MapContainer';
import FilterKategori from '../components/filter/FilterKategori';
import FilterWilayah from '../components/filter/FilterWilayah';
import StatistikPanel from '../components/statistik/StatistikPanel';
import PublicHeader from '../components/layout/PublicHeader';
import { cn } from '../lib/cn';
import { Icon } from '../components/ui/Icon';

type MobileSheet = 'filter' | 'statistik' | null;
const PANEL_LAYOUT_QUERY = '(min-width: 1280px)';

function FilterContent() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-neutral-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-neutral-900">Filter Peta</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Wilayah dan kategori infrastruktur</p>
      </div>
      <div className="flex-1 overflow-y-auto panel-scroll">
        <section className="p-4">
          <FilterWilayah />
        </section>
        <div className="h-px bg-neutral-100 mx-4" />
        <section className="p-4">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-3">
            Kategori
          </p>
          <FilterKategori />
        </section>
      </div>
    </div>
  );
}

export default function ClientMap() {
  const [kategoriList, setKategoriList] = useState<KategoriInfra[]>([]);
  const [showFilter, setShowFilter] = useState(true);
  const [showStatistik, setShowStatistik] = useState(true);
  const [mobileSheet, setMobileSheet] = useState<MobileSheet>(null);

  useEffect(() => {
    document.title = 'Peta Tematik Interaktif - Kabupaten Padang Pariaman';
  }, []);

  useEffect(() => {
    let ignore = false;
    async function loadKategori() {
      try {
        const res = await api.get('/kategori');
        if (!ignore) setKategoriList(res.data);
      } catch (err) {
        console.error('Gagal memuat kategori:', err);
      }
    }
    loadKategori();
    return () => { ignore = true; };
  }, []);

  const kategoriMap = useMemo(() => {
    const map = new Map<string, KategoriInfra>();
    kategoriList.forEach(kategori => map.set(kategori.value, kategori));
    return map;
  }, [kategoriList]);

  const toggleFilter = () => {
    if (!window.matchMedia(PANEL_LAYOUT_QUERY).matches) {
      setMobileSheet(sheet => (sheet === 'filter' ? null : 'filter'));
      return;
    }
    setShowFilter(value => !value);
  };

  const toggleStatistik = () => {
    if (!window.matchMedia(PANEL_LAYOUT_QUERY).matches) {
      setMobileSheet(sheet => (sheet === 'statistik' ? null : 'statistik'));
      return;
    }
    setShowStatistik(value => !value);
  };

  return (
    <div className="flex h-dvh min-h-dvh w-full flex-col overflow-hidden bg-neutral-100">
      <PublicHeader
        kategoriMap={kategoriMap}
        onToggleFilter={toggleFilter}
        onToggleStatistik={toggleStatistik}
        filterActive={showFilter}
        statistikActive={showStatistik}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left: Filter Sidebar */}
        <aside
          className={cn(
            'hidden min-h-0 shrink-0 overflow-hidden border-r border-neutral-200 bg-white transition-[width,opacity] duration-200 ease-out xl:block',
            showFilter ? 'xl:w-[320px] xl:opacity-100' : 'xl:w-0 xl:opacity-0',
          )}
          aria-label="Filter peta"
        >
          <FilterContent />
        </aside>

        {/* Center: Map */}
        <main className="relative min-w-0 flex-1 overflow-hidden" role="application" aria-label="Peta interaktif">
          <MapContainer kategoriList={kategoriList} />
        </main>

        {/* Right: Statistics */}
        <aside
          className={cn(
            'hidden min-h-0 shrink-0 overflow-hidden border-l border-neutral-200 bg-white transition-[width,opacity] duration-200 ease-out xl:block',
            showStatistik ? 'xl:w-[340px] xl:opacity-100' : 'xl:w-0 xl:opacity-0',
          )}
          aria-label="Statistik wilayah"
        >
          <StatistikPanel kategoriList={kategoriList} />
        </aside>
      </div>

      {/* Mobile bottom sheet */}
      {mobileSheet && (
        <>
          <div
            className="fixed inset-0 z-[1100] bg-black/30 backdrop-blur-[1px] xl:hidden"
            onClick={() => setMobileSheet(null)}
            aria-hidden="true"
          />
          <div className="fixed inset-x-0 bottom-0 z-[1200] flex max-h-[80dvh] flex-col overflow-hidden rounded-t-2xl bg-white shadow-lg animate-slide-up xl:hidden">
            {/* Sheet header */}
            <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-neutral-900">
                  {mobileSheet === 'filter' ? 'Filter Peta' : 'Statistik Wilayah'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setMobileSheet(null)}
                aria-label="Tutup panel"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100"
              >
                <Icon name="x" className="h-4 w-4" />
              </button>
            </div>
            {/* Sheet content */}
            <div className="flex-1 overflow-y-auto panel-scroll">
              {mobileSheet === 'filter' ? <FilterContent /> : <StatistikPanel kategoriList={kategoriList} />}
            </div>
          </div>
        </>
      )}

      {/* Mobile FAB */}
      {!mobileSheet && (
        <div className="fixed bottom-4 left-1/2 z-[1000] flex -translate-x-1/2 gap-2 xl:hidden">
          <button
            type="button"
            onClick={() => setMobileSheet('filter')}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-white border border-neutral-200 px-4 text-sm font-medium text-neutral-700 shadow-md active:scale-95 transition-transform"
          >
            <Icon name="filter" className="h-3.5 w-3.5" />
            Filter
          </button>
          <button
            type="button"
            onClick={() => setMobileSheet('statistik')}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-white border border-neutral-200 px-4 text-sm font-medium text-neutral-700 shadow-md active:scale-95 transition-transform"
          >
            <Icon name="chart" className="h-3.5 w-3.5" />
            Statistik
          </button>
        </div>
      )}
    </div>
  );
}
