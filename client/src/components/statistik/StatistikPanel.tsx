import React, { useMemo, useState } from 'react';
import { useFilterStore } from '../../store/filterStore';
import { useInfrastruktur } from '../../hooks/useInfrastruktur';
import { useStatistik } from '../../hooks/useStatistik';
import { KategoriInfra } from '../../types';
import { NAMA_KABUPATEN } from '../../constants';
import DonutChart from './DonutChart';
import { Skeleton } from '../ui/Skeleton';
import { cn } from '../../lib/cn';
import {
  useKecamatanGeoJSON,
  useKorongGeoJSON,
  useNagariGeoJSON,
} from '../../hooks/useWilayahGeoJSON';
import { Icon } from '../ui/Icon';

interface StatistikPanelProps {
  kategoriList: KategoriInfra[];
}

const JUDUL_PRIORITAS = [
  { key: 'jumlah_infrastruktur', label: 'Jumlah Infrastruktur', satuan: 'unit' },
  { key: 'jumlah_penduduk', label: 'Jumlah Penduduk', satuan: 'jiwa' },
  { key: 'ipm', label: 'Nilai IPM', satuan: '' },
  { key: 'luas_lahan', label: 'Luas Lahan', satuan: 'ha' },
];

function labelIndikator(indikator: string) {
  const lower = indikator.toLowerCase();
  const prioritas = JUDUL_PRIORITAS.find(item => item.key === lower);
  if (prioritas) return prioritas.label;
  return indikator
    .replace(/_/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

function formatNilai(nilai: number) {
  if (nilai >= 1_000_000) return `${(nilai / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
  if (nilai >= 1_000) return nilai.toLocaleString('id-ID');
  if (nilai % 1 !== 0) return nilai.toLocaleString('id-ID', { maximumFractionDigits: 2 });
  return String(nilai);
}

function StatistikEmpty() {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-5 text-center">
      <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-neutral-100 text-neutral-400">
        <Icon name="chart" className="h-5 w-5" />
      </div>
      <p className="text-sm font-semibold text-neutral-700">Belum ada data untuk judul ini</p>
      <p className="mt-1 text-xs leading-relaxed text-neutral-500">Pilih judul statistik lain atau wilayah yang lebih luas.</p>
    </div>
  );
}

export default function StatistikPanel({ kategoriList }: StatistikPanelProps) {
  const { idkab, idkec, iddesa, idsls } = useFilterStore();
  const [selectedJudul, setSelectedJudul] = useState('jumlah_infrastruktur');
  const kecamatanList = useKecamatanGeoJSON();
  const nagariList = useNagariGeoJSON(idkec);
  const korongList = useKorongGeoJSON(iddesa);

  const { data: statistikData, loading: loadingStat, error: statError } = useStatistik({
    idkab,
    idkec: idkec || undefined,
    iddesa: iddesa || undefined,
    idsls: idsls || undefined,
  });

  const {
    data: infrastrukturData,
    loading: loadingInfra,
    error: infraError,
  } = useInfrastruktur({
    idkab,
    idkec: idkec || undefined,
    iddesa: iddesa || undefined,
    idsls: idsls || undefined,
    kategori: kategoriList.map(kategori => kategori.value),
    enabled: kategoriList.length > 0,
  });

  const statistikByIndikator = useMemo(() => {
    const map = new Map<string, { nilai: number; satuan?: string; tahun: number }>();
    for (const item of statistikData) {
      const key = item.indikator.toLowerCase();
      const current = map.get(key);
      if (!current || item.tahun >= current.tahun) {
        map.set(key, {
          nilai: Number(item.nilai) || 0,
          satuan: item.satuan ?? undefined,
          tahun: item.tahun,
        });
      }
    }
    return map;
  }, [statistikData]);

  const judulOptions = useMemo(() => {
    const options = [...JUDUL_PRIORITAS];
    for (const key of statistikByIndikator.keys()) {
      if (!options.some(option => option.key === key)) {
        options.push({ key, label: labelIndikator(key), satuan: statistikByIndikator.get(key)?.satuan ?? '' });
      }
    }
    return options;
  }, [statistikByIndikator]);

  const selectedStat = statistikByIndikator.get(selectedJudul);
  const kecamatanLabel = kecamatanList.find(kecamatan => kecamatan.kode === idkec)?.nama;
  const nagariLabel = nagariList.find(nagari => nagari.kode === iddesa)?.nama;
  const korongLabel = korongList.find(korong => korong.kode === idsls)?.nama;
  const wilayahLabel = idsls
    ? `Korong ${korongLabel ?? idsls}`
    : iddesa
      ? `Nagari ${nagariLabel ?? iddesa}`
      : idkec
        ? `Kecamatan ${kecamatanLabel ?? idkec}`
        : NAMA_KABUPATEN;

  const kategoriData = useMemo(() => {
    return kategoriList
      .map(kategori => ({
        name: kategori.label,
        value: infrastrukturData.filter(infra => infra.kategori === kategori.value).length,
        color: kategori.color || '#64748b',
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [kategoriList, infrastrukturData]);

  const totalInfra = infrastrukturData.length;
  const loading = selectedJudul === 'jumlah_infrastruktur' ? loadingInfra : loadingStat;
  const hasError = selectedJudul === 'jumlah_infrastruktur' ? infraError : statError;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-neutral-200/70 bg-white/90 px-4 py-4 backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Statistik Wilayah</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-700">
                <Icon name="layers" className="h-4 w-4" />
              </span>
              <h2 className="min-w-0 truncate text-base font-display font-bold text-neutral-900">{wilayahLabel}</h2>
            </div>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-primary-100 bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">
            <Icon name="building" className="h-3.5 w-3.5" />
            {totalInfra} infra
          </span>
        </div>

        <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-neutral-500" htmlFor="judul-statistik">
          Judul statistik
        </label>
        <div className="relative mt-2">
          <select
            id="judul-statistik"
            value={selectedJudul}
            onChange={event => setSelectedJudul(event.target.value)}
            className="h-11 w-full appearance-none rounded-xl border border-neutral-200 bg-white px-3.5 pr-10 text-sm font-semibold text-neutral-900 shadow-soft transition-colors focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-400/15"
          >
            {judulOptions.map(option => (
              <option key={option.key} value={option.key}>{option.label}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
            <Icon name="chevron-down" className="h-4 w-4" />
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4 panel-scroll">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-36 rounded-2xl" />
            <Skeleton className="h-52 rounded-2xl" />
          </div>
        ) : hasError ? (
          <div className="rounded-2xl border border-danger-100 bg-danger-50 p-4 text-sm text-danger-600">
            Data statistik gagal dimuat.
          </div>
        ) : selectedJudul === 'jumlah_infrastruktur' ? (
          <>
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Jumlah Infrastruktur</p>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-display text-4xl font-bold leading-none text-neutral-950">{totalInfra}</span>
                    <span className="text-sm font-semibold text-neutral-500">unit</span>
                  </div>
                </div>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-50 text-primary-700">
                  <Icon name="building" className="h-5 w-5" />
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-soft">
              <DonutChart data={kategoriData} title="Berdasarkan Kategori" />
            </div>

            <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-soft">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Rincian kategori</p>
              {kategoriData.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {kategoriData.map(item => {
                    const percent = totalInfra > 0 ? Math.round((item.value / totalInfra) * 100) : 0;
                    return (
                      <div key={item.name}>
                        <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                          <span className="truncate font-semibold text-neutral-700">{item.name}</span>
                          <span className="font-semibold text-neutral-500">{item.value} unit</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%`, backgroundColor: item.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <StatistikEmpty />
              )}
            </div>
          </>
        ) : selectedStat ? (
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                  {labelIndikator(selectedJudul)}
                </p>
              </div>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-50 text-primary-700">
                <Icon
                  name={
                    selectedJudul === 'jumlah_penduduk'
                      ? 'users'
                      : selectedJudul === 'luas_lahan'
                        ? 'ruler'
                        : 'spark'
                  }
                  className="h-5 w-5"
                />
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-4xl font-bold leading-none text-neutral-950">{formatNilai(selectedStat.nilai)}</span>
              {selectedStat.satuan && <span className="text-sm font-semibold text-neutral-500">{selectedStat.satuan}</span>}
            </div>
            <div className="mt-5 flex items-center justify-between rounded-xl bg-neutral-50 px-3 py-2 text-xs text-neutral-500">
              <span>Tahun data</span>
              <span className="font-semibold text-neutral-700">{selectedStat.tahun}</span>
            </div>
          </div>
        ) : (
          <StatistikEmpty />
        )}

        <div className={cn('rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-soft', statistikByIndikator.size === 0 && 'hidden')}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Judul tersedia</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {judulOptions.slice(0, 8).map(option => (
              <button
                key={option.key}
                type="button"
                onClick={() => setSelectedJudul(option.key)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                  selectedJudul === option.key
                    ? 'border-primary-200 bg-primary-50 text-primary-700'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
