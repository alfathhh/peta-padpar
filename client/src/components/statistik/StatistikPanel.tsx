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
  return indikator.replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
}

function formatNilai(nilai: number) {
  if (nilai >= 1_000_000) return `${(nilai / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
  if (nilai >= 1_000) return nilai.toLocaleString('id-ID');
  if (nilai % 1 !== 0) return nilai.toLocaleString('id-ID', { maximumFractionDigits: 2 });
  return String(nilai);
}

function StatistikEmpty() {
  return (
    <div className="rounded-lg border border-dashed border-neutral-200 p-6 text-center">
      <Icon name="chart" className="h-5 w-5 text-neutral-300 mx-auto mb-2" />
      <p className="text-sm font-medium text-neutral-600">Belum ada data</p>
      <p className="mt-1 text-xs text-neutral-400">Pilih indikator atau wilayah lain.</p>
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
        map.set(key, { nilai: Number(item.nilai) || 0, satuan: item.satuan ?? undefined, tahun: item.tahun });
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
  const kecamatanLabel = kecamatanList.find(k => k.kode === idkec)?.nama;
  const nagariLabel = nagariList.find(n => n.kode === iddesa)?.nama;
  const korongLabel = korongList.find(k => k.kode === idsls)?.nama;
  const wilayahLabel = idsls
    ? `Korong ${korongLabel ?? idsls}`
    : iddesa
      ? `Nagari ${nagariLabel ?? iddesa}`
      : idkec
        ? `Kec. ${kecamatanLabel ?? idkec}`
        : NAMA_KABUPATEN;

  const kategoriData = useMemo(() => {
    return kategoriList
      .map(kategori => ({
        name: kategori.label,
        value: infrastrukturData.filter(infra => infra.kategori === kategori.value).length,
        color: kategori.color || '#71717a',
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [kategoriList, infrastrukturData]);

  const totalInfra = infrastrukturData.length;
  const loading = selectedJudul === 'jumlah_infrastruktur' ? loadingInfra : loadingStat;
  const hasError = selectedJudul === 'jumlah_infrastruktur' ? infraError : statError;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-neutral-100 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-neutral-900 truncate">{wilayahLabel}</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Statistik Wilayah</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-md bg-primary-50 border border-primary-100 px-2 py-1 text-xs font-medium text-primary-700">
            {totalInfra} infra
          </span>
        </div>

        {/* Dropdown indikator */}
        <div className="relative mt-3">
          <select
            value={selectedJudul}
            onChange={event => setSelectedJudul(event.target.value)}
            className="h-9 w-full appearance-none rounded-lg border border-neutral-200 bg-white px-3 pr-8 text-sm font-medium text-neutral-900 hover:border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all"
          >
            {judulOptions.map(option => (
              <option key={option.key} value={option.key}>{option.label}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400">
            <Icon name="chevron-down" className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4 panel-scroll">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-44 rounded-lg" />
          </div>
        ) : hasError ? (
          <div className="rounded-lg bg-danger-50 border border-danger-100 p-3 text-sm text-danger-700">
            Data gagal dimuat.
          </div>
        ) : selectedJudul === 'jumlah_infrastruktur' ? (
          <>
            {/* Big number card */}
            <div className="rounded-lg border border-neutral-200 p-4">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Jumlah Infrastruktur</p>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-neutral-900 tabular-nums">{totalInfra}</span>
                <span className="text-sm text-neutral-500">unit</span>
              </div>
            </div>

            {/* Donut chart */}
            {kategoriData.length > 0 && (
              <div className="rounded-lg border border-neutral-200 p-4">
                <DonutChart data={kategoriData} title="Berdasarkan Kategori" />
              </div>
            )}

            {/* Category breakdown */}
            {kategoriData.length > 0 && (
              <div className="rounded-lg border border-neutral-200 p-4">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-3">Rincian</p>
                <div className="space-y-2.5">
                  {kategoriData.map(item => {
                    const percent = totalInfra > 0 ? Math.round((item.value / totalInfra) * 100) : 0;
                    return (
                      <div key={item.name}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium text-neutral-700 truncate">{item.name}</span>
                          <span className="text-neutral-500 tabular-nums">{item.value}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%`, backgroundColor: item.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {kategoriData.length === 0 && <StatistikEmpty />}
          </>
        ) : selectedStat ? (
          <div className="rounded-lg border border-neutral-200 p-4">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              {labelIndikator(selectedJudul)}
            </p>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-neutral-900 tabular-nums">{formatNilai(selectedStat.nilai)}</span>
              {selectedStat.satuan && <span className="text-sm text-neutral-500">{selectedStat.satuan}</span>}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-md bg-neutral-50 px-3 py-2 text-xs">
              <span className="text-neutral-500">Tahun data</span>
              <span className="font-medium text-neutral-700">{selectedStat.tahun}</span>
            </div>
          </div>
        ) : (
          <StatistikEmpty />
        )}

        {/* Quick indicator chips */}
        {statistikByIndikator.size > 0 && (
          <div className="rounded-lg border border-neutral-200 p-4">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">Indikator tersedia</p>
            <div className="flex flex-wrap gap-1.5">
              {judulOptions.slice(0, 8).map(option => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setSelectedJudul(option.key)}
                  className={cn(
                    'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
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
        )}
      </div>
    </div>
  );
}
