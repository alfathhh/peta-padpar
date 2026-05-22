import React from 'react';
import { Map } from 'lucide-react';
import { KategoriInfra } from '../../types';
import { useFilterStore } from '../../store/filterStore';
import { KATEGORI_ICON_MAP, DEFAULT_ICON } from '../../lib/kategoriIcons';
import { cn } from '../../lib/cn';

interface CategoryChipsProps {
  kategoriList: KategoriInfra[];
}

/**
 * CategoryChips — toggle chips untuk memilih kategori infrastruktur.
 * Menggantikan FilterKategori.tsx dengan tampilan pill/chip modern.
 *
 * State: useFilterStore (kategoriAktif, toggleKategori, setKategoriAktif)
 * Data: diterima via props (kategoriList) dari parent component
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8
 */
export default function CategoryChips({ kategoriList }: CategoryChipsProps) {
  const { kategoriAktif, toggleKategori, setKategoriAktif } = useFilterStore();

  if (kategoriList.length === 0) {
    return (
      <p className="text-xs text-slate-400">Tidak ada kategori tersedia</p>
    );
  }

  const semuaAktif =
    kategoriList.length > 0 &&
    kategoriList.every((k) => kategoriAktif.includes(k.value));

  const toggleSemua = () => {
    if (semuaAktif) {
      setKategoriAktif([]);
    } else {
      setKategoriAktif(kategoriList.map((k) => k.value));
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* Tombol "Tampilkan Semua" */}
      <button
        type="button"
        onClick={toggleSemua}
        className={cn(
          'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-200',
          semuaAktif
            ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
        )}
        aria-pressed={semuaAktif}
      >
        <Map size={16} aria-hidden="true" />
        Tampilkan Semua
      </button>

      {/* Chips per kategori */}
      {kategoriList.map((kat) => {
        const aktif = kategoriAktif.includes(kat.value);
        const Icon = KATEGORI_ICON_MAP[kat.value] ?? DEFAULT_ICON;

        return (
          <button
            key={kat.value}
            type="button"
            onClick={() => toggleKategori(kat.value)}
            aria-pressed={aktif}
            aria-label={`Filter kategori ${kat.label}`}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-200',
              aktif
                ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
            )}
          >
            <Icon size={16} aria-hidden="true" />
            {kat.label}
          </button>
        );
      })}
    </div>
  );
}
