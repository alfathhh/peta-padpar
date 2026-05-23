import React, { useEffect, useMemo, useRef, useState } from 'react';
import api from '../../lib/api';
import type { Infrastruktur, KategoriInfra } from '../../types';
import { cn } from '../../lib/cn';
import { useDebounce } from '../../hooks/useDebounce';
import { useMapStore } from '../../store/mapStore';
import { useFilterStore } from '../../store/filterStore';
import { useGeoJSONLayer } from '../../hooks/useWilayahGeoJSON';
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

  // Fetch GeoJSON dari server untuk pencarian wilayah
  const { data: kecamatanData } = useGeoJSONLayer('kecamatan');
  const { data: nagariData } = useGeoJSONLayer('nagari');
  const { data: korongData } = useGeoJSONLayer('korong');

  const wilayahOptions = useMemo(() => {
    const results: WilayahResult[] = [];

    // Kabupaten (hardcoded — selalu ada)
    results.push({
      type: 'wilayah',
      level: 'kabupaten',
      kode: '1306',
      nama: NAMA_KABUPATEN,
    });

    // Kecamatan
    if (kecamatanData) {
      for (const f of kecamatanData.features) {
        const p = f.properties;
        if (!p) continue;
        const kode = String(p.idkec ?? '');
        if (!kode) continue;
        results.push({
          type: 'wilayah',
          level: 'kecamatan',
          kode,
          idkec: kode,
          nama: String(p.nmkec ?? kode),
        });
      }
    }

    // Nagari
    if (nagariData) {
      for (const f of nagariData.features) {
        const p = f.properties;
        if (!p) continue;
        const kode = String(p.iddesa ?? '');
        const idkec = String(p.idkec ?? '');
        if (!kode) continue;
        results.push({
          type: 'wilayah',
          level: 'nagari',
          kode,
          idkec,
          iddesa: kode,
          nama: String(p.nmdesa ?? kode),
        });
      }
    }

    // Korong
    if (korongData) {
      for (const f of korongData.features) {
        const p = f.properties;
        if (!p) continue;
        const kode = String(p.idsls ?? '');
        const iddesa = String(p.iddesa ?? '');
        const idkec = String(p.idkec ?? iddesa.slice(0, 6));
        if (!kode) continue;
        results.push({
          type: 'wilayah',
          level: 'korong',
          kode,
          idkec,
          iddesa,
          idsls: kode,
          nama: String(p.nmsls ?? kode),
        });
      }
    }

    // Deduplicate
    const unique = new Map<string, WilayahResult>();
    results.forEach(item => unique.set(`${item.level}-${item.kode}`, item));
    return Array.from(unique.values());
  }, [kecamatanData, nagariData, korongData]);

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
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
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
          className="h-9 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-12 text-sm text-neutral-800 transition-all placeholder:text-neutral-400 hover:border-neutral-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          aria-label="Cari infrastruktur atau wilayah"
          aria-autocomplete="list"
          aria-expanded={open}
          role="combobox"
        />
        {loading && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary-600">
            ...
          </span>
        )}
        {query && !loading && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-1.5 top-1/2 inline-flex h-6 w-6 items-center justify-center -translate-y-1/2 rounded text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
            aria-label="Hapus pencarian"
          >
            <Icon name="x" className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && query && (
        <div className="absolute left-0 right-0 top-full z-[1300] mt-1.5 max-h-72 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-1 shadow-pop panel-scroll">
          {combinedResults.length > 0 ? (
            combinedResults.map((result) => {
              if (result.type === 'wilayah') {
                return (
                  <button
                    key={`${result.level}-${result.kode}`}
                    type="button"
                    onClick={() => handleSelectWilayah(result)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-neutral-50"
                    role="option"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-50 text-primary-600 shrink-0">
                      <Icon name="map-pin" className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-neutral-900">{result.nama}</span>
                      <span className="block truncate text-xs text-neutral-500">
                        {levelLabel(result.level)}
                      </span>
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
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-neutral-50"
                  role="option"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-100 text-neutral-600 shrink-0">
                    <Icon name="building" className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-neutral-900">{infra.nama}</span>
                    <span className="block truncate text-xs text-neutral-500">
                      {kategori?.label ?? 'Infrastruktur'}{infra.alamat ? ` · ${infra.alamat}` : ''}
                    </span>
                  </span>
                </button>
              );
            })
          ) : (
            <div className="px-3 py-4 text-center text-sm text-neutral-500">
              Tidak ditemukan.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
