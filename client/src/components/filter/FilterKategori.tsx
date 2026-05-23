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

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map(item => (
          <Skeleton key={item} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-danger-50 border border-danger-100 p-3 text-sm text-danger-700">
        Gagal memuat kategori.
      </div>
    );
  }

  if (kategoriList.length === 0) {
    return (
      <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-3 text-sm text-neutral-500">
        Belum ada kategori tersedia.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Toggle all / clear */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={toggleSemua}
          className={cn(
            'text-xs font-medium transition-colors',
            semuaAktif ? 'text-primary-600' : 'text-neutral-500 hover:text-neutral-700',
          )}
        >
          {semuaAktif ? 'Nonaktifkan semua' : 'Aktifkan semua'}
        </button>
        <span className="text-xs text-neutral-400">
          {jumlahAktif}/{kategoriList.length}
        </span>
      </div>

      {/* Category list */}
      <div className="space-y-1">
        {kategoriList.map(kategori => {
          const aktif = kategoriAktif.includes(kategori.value);
          const warnaHex = kategori.color || '#71717a';
          const iconName = getKategoriIcon(kategori.value);

          return (
            <button
              key={kategori.value}
              type="button"
              onClick={() => toggleKategori(kategori.value)}
              aria-pressed={aktif}
              aria-label={`Filter kategori ${kategori.label}`}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-150',
                aktif
                  ? 'bg-neutral-50'
                  : 'hover:bg-neutral-50',
              )}
            >
              {/* Icon */}
              <span
                className="flex h-7 w-7 items-center justify-center rounded-md shrink-0 transition-colors"
                style={{
                  backgroundColor: aktif ? `${warnaHex}15` : '#f4f4f5',
                  color: aktif ? warnaHex : '#a1a1aa',
                }}
              >
                <Icon name={iconName} className="h-3.5 w-3.5" />
              </span>

              {/* Label */}
              <span className={cn(
                'flex-1 text-sm font-medium truncate transition-colors',
                aktif ? 'text-neutral-900' : 'text-neutral-600',
              )}>
                {kategori.label}
              </span>

              {/* Checkbox indicator */}
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded border transition-all shrink-0',
                  aktif
                    ? 'border-transparent text-white'
                    : 'border-neutral-300 bg-white',
                )}
                style={aktif ? { backgroundColor: warnaHex } : undefined}
              >
                {aktif && <Icon name="check" className="h-3 w-3" />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
