import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { KategoriInfra } from '../../types';
import { useFilterStore } from '../../store/filterStore';
import { Skeleton } from '../ui/Skeleton';
import { cn } from '../../lib/cn';
import { Icon } from '../ui/Icon';
import { getKategoriIcon } from '../../lib/categoryIcons';

export default function FilterKategori() {
  const [kategoriList, setKategoriList] = useState<KategoriInfra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { kategoriAktif, toggleKategori, setKategoriAktif } = useFilterStore();

  useEffect(() => {
    let ignore = false;

    async function loadKategori() {
      setLoading(true);
      setError(false);
      try {
        const res = await api.get('/kategori');
        if (!ignore) setKategoriList(res.data);
      } catch (err) {
        console.error('Gagal memuat kategori:', err);
        if (!ignore) setError(true);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadKategori();
    return () => { ignore = true; };
  }, []);

  const semuaAktif =
    kategoriList.length > 0 &&
    kategoriList.every(kategori => kategoriAktif.includes(kategori.value));
  const jumlahAktif = kategoriList.filter(kategori => kategoriAktif.includes(kategori.value)).length;

  const toggleSemua = () => {
    setKategoriAktif(semuaAktif ? [] : kategoriList.map(kategori => kategori.value));
  };

  const kosongkanFilter = () => {
    setKategoriAktif([]);
  };

  if (loading) {
    return (
      <div className="space-y-2 px-4 pb-4">
        {[1, 2, 3, 4, 5].map(item => (
          <Skeleton key={item} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-4 mb-4 rounded-xl border border-danger-100 bg-danger-50 p-4 text-sm text-danger-600">
        Kategori gagal dimuat.
      </div>
    );
  }

  if (kategoriList.length === 0) {
    return (
      <div className="mx-4 mb-4 rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-500">
        Belum ada kategori tersedia.
      </div>
    );
  }

  return (
    <div className="space-y-3 px-4 pb-4">
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-3">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-neutral-900">Filter kategori</p>
            <p className="mt-0.5 text-xs text-neutral-500">Pilih kategori yang ingin ditampilkan di peta.</p>
          </div>
          <span className="shrink-0 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-xs font-semibold text-neutral-600">
            {jumlahAktif}/{kategoriList.length}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={toggleSemua}
            aria-pressed={semuaAktif}
            className={cn(
              'inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-xs font-semibold transition-all duration-200 focus-visible:shadow-focus active:scale-[0.98]',
              semuaAktif
                ? 'border-primary-200 bg-primary-50 text-primary-700'
                : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100',
            )}
          >
            <Icon name="layers" className="h-3.5 w-3.5" />
            Tampilkan semua
          </button>

          <button
            type="button"
            onClick={kosongkanFilter}
            aria-pressed={jumlahAktif === 0}
            className={cn(
              'inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-xs font-semibold transition-all duration-200 focus-visible:shadow-focus active:scale-[0.98]',
              jumlahAktif === 0
                ? 'border-neutral-300 bg-neutral-900 text-white'
                : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100',
            )}
          >
            <Icon name="x" className="h-3.5 w-3.5" />
            Kosongkan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {kategoriList.map(kategori => {
          const aktif = kategoriAktif.includes(kategori.value);
          const warnaHex = kategori.color || '#64748b';
          const iconName = getKategoriIcon(kategori.value);

          return (
            <button
              key={kategori.value}
              type="button"
              onClick={() => toggleKategori(kategori.value)}
              aria-pressed={aktif}
              aria-label={`Filter kategori ${kategori.label}`}
              className={cn(
                'relative flex min-h-[92px] flex-col items-start justify-between rounded-2xl border px-3 py-3 text-left transition-all duration-200 focus-visible:shadow-focus active:scale-[0.99]',
                aktif
                  ? 'shadow-soft'
                  : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50',
              )}
              style={aktif ? {
                backgroundColor: `${warnaHex}10`,
                borderColor: `${warnaHex}38`,
              } : undefined}
            >
              <span
                className="grid h-9 w-9 place-items-center rounded-xl"
                style={{
                  backgroundColor: aktif ? `${warnaHex}18` : '#f5f5f5',
                  color: aktif ? warnaHex : '#737373',
                }}
                aria-hidden="true"
              >
                <Icon name={iconName} className="h-[18px] w-[18px]" />
              </span>

              <span className="block min-w-0">
                <span className="block truncate text-sm font-semibold text-neutral-800">{kategori.label}</span>
                <span className="mt-0.5 block text-[11px] font-medium text-neutral-500">
                  {aktif ? 'Aktif di peta' : 'Nonaktif'}
                </span>
              </span>

              <span
                className={cn(
                  'absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full border transition-colors',
                  aktif
                    ? 'text-white'
                    : 'border-neutral-300 bg-white text-transparent',
                )}
                style={aktif ? { backgroundColor: warnaHex, borderColor: warnaHex } : undefined}
                aria-hidden="true"
              >
                <Icon name="check" className="h-3.5 w-3.5" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
