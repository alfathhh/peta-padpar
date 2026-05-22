import React from 'react';
import { SlidersHorizontal, BarChart2 } from 'lucide-react';
import type { KategoriInfra } from '../../types';
import SearchBar from '../search/SearchBar';
import { cn } from '../../lib/cn';

interface FloatingHeaderProps {
  kategoriMap: Map<string, KategoriInfra>;
  onToggleFilter: () => void;
  onToggleStatistik: () => void;
  filterActive: boolean;
  statistikActive: boolean;
}

export default function FloatingHeader({
  kategoriMap,
  onToggleFilter,
  onToggleStatistik,
  filterActive,
  statistikActive,
}: FloatingHeaderProps) {
  return (
    <div className="pointer-events-auto flex items-center justify-between bg-white/90 backdrop-blur-sm border border-slate-100 shadow-lg px-2 py-1.5 w-full max-w-3xl mx-auto rounded-full">
      {/* Kiri: Logo + Teks */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div
          className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0"
          role="img"
          aria-label="Logo Peta Tematik"
        >
          <span className="text-white font-bold text-xs leading-none select-none">PP</span>
        </div>
        {/* Sembunyikan teks bersama-sama pada layar ≤ 640px */}
        <div className="hidden sm:block">
          <p className="text-sm font-bold text-slate-800 leading-tight">Peta Tematik</p>
          <p className="text-xs text-slate-400 leading-tight">Kab. Padang Pariaman</p>
        </div>
      </div>

      {/* Tengah: SearchBar borderless */}
      <div className="flex-1 min-w-0 flex items-center px-2">
        <SearchBar
          kategoriMap={kategoriMap}
          className="w-full max-w-none"
        />
      </div>

      {/* Kanan: Tombol Filter dan Statistik */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          type="button"
          onClick={onToggleFilter}
          aria-label="Toggle filter"
          aria-pressed={filterActive}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40',
            filterActive
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          <SlidersHorizontal size={15} aria-hidden="true" />
          <span className="hidden md:inline">Filter</span>
        </button>

        <button
          type="button"
          onClick={onToggleStatistik}
          aria-label="Toggle statistik"
          aria-pressed={statistikActive}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40',
            statistikActive
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          <BarChart2 size={15} aria-hidden="true" />
          <span className="hidden md:inline">Statistik</span>
        </button>
      </div>
    </div>
  );
}
