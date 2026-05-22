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

function PanelTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="border-b border-neutral-200 bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">{subtitle}</p>
      <div className="mt-0.5 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary-50 text-primary-700">
          <Icon name="filter" className="h-4 w-4" />
        </span>
        <h2 className="text-sm font-display font-semibold text-neutral-900">{title}</h2>
      </div>
    </div>
  );
}

function FilterContent() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <PanelTitle title="Filter Peta" subtitle="Wilayah dan kategori" />
      <div className="flex-1 overflow-y-auto panel-scroll">
        <section className="p-4">
          <FilterWilayah />
        </section>
        <div className="h-px bg-neutral-100" />
        <section>
          <div className="px-4 pt-4 pb-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              Kategori Infrastruktur
            </p>
          </div>
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
        <aside
          className={cn(
            'hidden min-h-0 shrink-0 overflow-hidden border-r border-neutral-200 bg-white transition-[width,opacity] duration-250 xl:block',
            showFilter ? 'xl:w-[360px] xl:opacity-100' : 'xl:w-0 xl:opacity-0',
          )}
          aria-label="Filter peta"
        >
          <FilterContent />
        </aside>

        <main className="relative min-w-0 flex-1 overflow-hidden" role="application" aria-label="Peta interaktif Kabupaten Padang Pariaman">
          <MapContainer kategoriList={kategoriList} />
        </main>

        <aside
          className={cn(
            'hidden min-h-0 shrink-0 overflow-hidden border-l border-neutral-200 bg-neutral-50 transition-[width,opacity] duration-250 xl:block',
            showStatistik ? 'xl:w-[390px] xl:opacity-100' : 'xl:w-0 xl:opacity-0',
          )}
          aria-label="Statistik wilayah"
        >
          <StatistikPanel kategoriList={kategoriList} />
        </aside>
      </div>

      {mobileSheet && (
        <>
          <div
            className="fixed inset-0 z-[1100] bg-neutral-900/35 xl:hidden"
            onClick={() => setMobileSheet(null)}
            aria-hidden="true"
          />
          <div className="fixed inset-x-2 bottom-2 z-[1200] flex max-h-[84dvh] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-pop animate-slide-up sm:inset-x-auto sm:left-1/2 sm:w-[min(560px,calc(100vw-2rem))] sm:-translate-x-1/2 xl:hidden">
            <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                  {mobileSheet === 'filter' ? 'Filter peta' : 'Data wilayah'}
                </p>
                <h2 className="text-sm font-display font-semibold text-neutral-900">
                  {mobileSheet === 'filter' ? 'Atur tampilan peta' : 'Statistik wilayah'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setMobileSheet(null)}
                aria-label="Tutup panel"
                className="inline-flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 active:scale-95"
              >
                <Icon name="x" className="h-4 w-4" />
                Tutup
              </button>
            </div>
            <div className="flex-1 overflow-y-auto panel-scroll">
              {mobileSheet === 'filter' ? <FilterContent /> : <StatistikPanel kategoriList={kategoriList} />}
            </div>
          </div>
        </>
      )}

      {!mobileSheet && (
        <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-[1000] flex -translate-x-1/2 gap-2 rounded-full bg-white/88 p-1.5 shadow-pop backdrop-blur xl:hidden">
          <button
            type="button"
            onClick={() => setMobileSheet('filter')}
            aria-label="Buka filter"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 text-sm font-semibold text-neutral-700 shadow-pop active:scale-95"
          >
            <Icon name="filter" className="h-4 w-4" />
            Filter
          </button>
          <button
            type="button"
            onClick={() => setMobileSheet('statistik')}
            aria-label="Buka statistik"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 text-sm font-semibold text-neutral-700 shadow-pop active:scale-95"
          >
            <Icon name="chart" className="h-4 w-4" />
            Statistik
          </button>
        </div>
      )}
    </div>
  );
}
