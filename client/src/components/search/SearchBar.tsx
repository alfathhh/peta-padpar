import React, { useEffect, useMemo, useRef, useState } from 'react';
import api from '../../lib/api';
import type { Infrastruktur, KategoriInfra } from '../../types';
import { cn } from '../../lib/cn';
import { useDebounce } from '../../hooks/useDebounce';
import { useMapStore } from '../../store/mapStore';
import { useFilterStore } from '../../store/filterStore';
import {
  kabupatenGeoJSON,
  kecamatanGeoJSON,
  korongGeoJSON,
  nagariGeoJSON,
} from '../../assets/geojson';
import { NAMA_KABUPATEN } from '../../constants';
import { Icon } from '../ui/Icon';

interface Props {
  kategoriMap: Map<string, KategoriInfra>;
  className?: string;
}

type WilayahLevel = 'kabupaten' | 'kecamatan' | 'nagari' | 'korong';

interface WilayahResult {
  type: 'wilayah';
  level: WilayahLevel;
  kode: string;
  nama: string;
  idkec?: string;
  iddesa?: string;
  idsls?: string;
}

interface InfrastrukturResult {
  type: 'infrastruktur';
  data: Infrastruktur;
}

type SearchResult = WilayahResult | InfrastrukturResult;

function normalizeText(value: string) {
  return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
}

function getWilayahOptions(): WilayahResult[] {
  const kabupaten: WilayahResult = {
    type: 'wilayah',
    level: 'kabupaten',
    kode: String(kabupatenGeoJSON.features[0]?.properties?.idkab ?? ''),
    nama: NAMA_KABUPATEN,
  };

  const kecamatan = kecamatanGeoJSON.features
    .map((feature): WilayahResult | null => {
      const props = feature.properties;
      const kode = String(props?.idkec ?? '');
      if (!kode) return null;
      return {
        type: 'wilayah',
        level: 'kecamatan',
        kode,
        idkec: kode,
        nama: String(props?.nmkec ?? kode),
      };
    })
    .filter((item): item is WilayahResult => !!item);

  const nagari = nagariGeoJSON.features
    .map((feature): WilayahResult | null => {
      const props = feature.properties;
      const kode = String(props?.iddesa ?? '');
      const idkec = String(props?.idkec ?? '');
      if (!kode) return null;
      return {
        type: 'wilayah',
        level: 'nagari',
        kode,
        idkec,
        iddesa: kode,
        nama: String(props?.nmdesa ?? kode),
      };
    })
    .filter((item): item is WilayahResult => !!item);

  const korong = korongGeoJSON.features
    .map((feature): WilayahResult | null => {
      const props = feature.properties;
      const kode = String(props?.idsls ?? '');
      const iddesa = String(props?.iddesa ?? '');
      const idkec = String(props?.idkec ?? iddesa.slice(0, 7));
      if (!kode) return null;
      return {
        type: 'wilayah',
        level: 'korong',
        kode,
        idkec,
        iddesa,
        idsls: kode,
        nama: String(props?.nmsls ?? kode),
      };
    })
    .filter((item): item is WilayahResult => !!item);

  const unique = new Map<string, WilayahResult>();
  [kabupaten, ...kecamatan, ...nagari, ...korong].forEach(item => {
    unique.set(`${item.level}-${item.kode}`, item);
  });

  return Array.from(unique.values());
}

function levelLabel(level: WilayahLevel) {
  switch (level) {
    case 'kabupaten': return 'Kabupaten';
    case 'kecamatan': return 'Kecamatan';
    case 'nagari': return 'Nagari / Desa';
    case 'korong': return 'Korong / Dusun';
    default: return 'Wilayah';
  }
}

export default function SearchBar({ kategoriMap, className }: Props) {
  const [query, setQuery] = useState('');
  const [infraResults, setInfraResults] = useState<Infrastruktur[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [infraError, setInfraError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedQueryRef = useRef('');
  const debouncedQuery = useDebounce(query, 250);
  const mapInstance = useMapStore((state) => state.mapInstance);
  const { resetWilayah, setIdkec, setIddesa, setIdsls } = useFilterStore();

  const wilayahOptions = useMemo(() => getWilayahOptions(), []);

  const wilayahResults = useMemo(() => {
    const keyword = normalizeText(debouncedQuery.trim());
    if (!keyword) return [];

    return wilayahOptions
      .filter(item => {
        const haystack = normalizeText(`${item.nama} ${item.kode} ${levelLabel(item.level)}`);
        return haystack.includes(keyword);
      })
      .slice(0, 8);
  }, [debouncedQuery, wilayahOptions]);

  const combinedResults: SearchResult[] = useMemo(() => {
    const infra: SearchResult[] = infraResults.map(data => ({ type: 'infrastruktur', data }));
    return [...wilayahResults, ...infra].slice(0, 12);
  }, [infraResults, wilayahResults]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    let ignore = false;

    async function searchInfra() {
      const keyword = debouncedQuery.trim();
      if (!keyword) {
        setInfraResults([]);
        setOpen(false);
        setInfraError(false);
        return;
      }

      if (selectedQueryRef.current === keyword) {
        setInfraResults([]);
        setOpen(false);
        setInfraError(false);
        setLoading(false);
        return;
      }

      setOpen(true);
      setLoading(true);
      setInfraError(false);
      try {
        const res = await api.get('/infrastruktur', {
          params: { search: keyword, limit: 8 },
        });
        const data: Infrastruktur[] = res.data?.data ?? res.data ?? [];
        if (!ignore) setInfraResults(data);
      } catch {
        if (!ignore) {
          setInfraResults([]);
          setInfraError(true);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    searchInfra();
    return () => { ignore = true; };
  }, [debouncedQuery]);

  function handleSelectInfra(infra: Infrastruktur) {
    selectedQueryRef.current = infra.nama;
    setQuery(infra.nama);
    setOpen(false);
    mapInstance?.flyTo([infra.lat, infra.lng], 16, { duration: 0.85, easeLinearity: 0.25 });
  }

  function handleSelectWilayah(wilayah: WilayahResult) {
    selectedQueryRef.current = wilayah.nama;
    setQuery(wilayah.nama);
    setOpen(false);

    if (wilayah.level === 'kabupaten') {
      resetWilayah();
      return;
    }

    if (wilayah.idkec) setIdkec(wilayah.idkec);
    if (wilayah.iddesa) setIddesa(wilayah.iddesa);
    if (wilayah.idsls) setIdsls(wilayah.idsls);
  }

  function clearSearch() {
    selectedQueryRef.current = '';
    setQuery('');
    setInfraResults([]);
    setOpen(false);
    setInfraError(false);
  }

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
          <Icon name="search" className="h-4 w-4" />
        </span>
        <input
          type="text"
          value={query}
          onChange={(event) => {
            selectedQueryRef.current = '';
            setQuery(event.target.value);
          }}
          onFocus={() => {
            if (combinedResults.length || query) setOpen(true);
          }}
          placeholder="Cari infrastruktur atau wilayah..."
          className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-11 pr-14 text-sm font-medium text-neutral-800 shadow-soft transition-all duration-250 placeholder:text-neutral-400 focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-400/15 sm:h-11"
          aria-label="Cari infrastruktur atau wilayah"
          aria-autocomplete="list"
          aria-expanded={open}
          role="combobox"
        />
        {loading && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-primary-600">
            Cari...
          </span>
        )}
        {query && !loading && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-1.5 top-1/2 inline-flex h-9 items-center gap-1.5 -translate-y-1/2 rounded-lg px-2 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
            aria-label="Hapus pencarian"
          >
            <Icon name="x" className="h-3.5 w-3.5" />
            Hapus
          </button>
        )}
      </div>

      {open && query && (
        <div className="absolute left-0 right-0 top-full z-[1300] mt-2 max-h-80 overflow-y-auto rounded-2xl border border-neutral-200/80 bg-white p-1.5 shadow-pop panel-scroll">
          {combinedResults.length > 0 ? (
            combinedResults.map((result) => {
              if (result.type === 'wilayah') {
                return (
                  <button
                    key={`${result.level}-${result.kode}`}
                    type="button"
                    onClick={() => handleSelectWilayah(result)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-neutral-50"
                    role="option"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-50 text-primary-700">
                      <Icon name="map-pin" className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-neutral-900">{result.nama}</span>
                      <span className="block truncate text-xs text-neutral-500">
                        {levelLabel(result.level)} - {result.kode}
                      </span>
                    </span>
                    <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">
                      Wilayah
                    </span>
                  </button>
                );
              }

              const infra = result.data;
              const kategori = kategoriMap.get(infra.kategori);
              return (
                <button
                  key={`infra-${infra.id}`}
                  type="button"
                  onClick={() => handleSelectInfra(infra)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-neutral-50"
                  role="option"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-neutral-100 text-neutral-700">
                    <Icon name="building" className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-neutral-900">{infra.nama}</span>
                    <span className="block truncate text-xs text-neutral-500">
                      {kategori?.label ?? 'Infrastruktur'}{infra.alamat ? ` - ${infra.alamat}` : ''}
                    </span>
                  </span>
                  <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600">
                    Infra
                  </span>
                </button>
              );
            })
          ) : (
            <div className="px-4 py-4 text-sm text-neutral-500">
              Tidak ada infrastruktur atau wilayah yang cocok.
            </div>
          )}

          {infraError && wilayahResults.length > 0 && (
            <div className="border-t border-neutral-100 px-4 py-3 text-xs text-neutral-500">
              Hasil wilayah tetap tersedia. Data infrastruktur belum bisa dimuat.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
