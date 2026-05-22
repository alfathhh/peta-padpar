import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import type { KategoriInfra } from '../../types';
import FilterWilayah from './FilterWilayah';
import CategoryChips from './CategoryChips';

interface FilterPanelProps {
  kategoriList: KategoriInfra[];
  onClose: () => void;
}

/**
 * FilterPanel — panel filter melayang di sisi kiri peta.
 *
 * Desktop (≥ 1024px): floating panel glassmorphism di kiri.
 * Mobile (< 1024px): bottom sheet slide-up dari bawah dengan overlay.
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 9.5, 10.1, 10.4
 */
export default function FilterPanel({ kategoriList, onClose }: FilterPanelProps) {
  // Tutup bottom sheet saat tekan Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <>
      {/* ── Mobile: overlay + bottom sheet ── */}
      {/* Overlay hanya tampil di mobile (< lg), klik untuk tutup */}
      <div
        className="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-[2px] lg:hidden"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Bottom sheet (mobile) / Floating panel (desktop) */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter Peta"
        className={[
          // Shared base
          'pointer-events-auto bg-white/85 backdrop-blur-md',
          'border border-white/50 shadow-xl shadow-slate-200/40',
          'flex flex-col gap-6 overflow-y-auto',

          // Mobile: bottom sheet — fixed, slide up dari bawah, max-h-[75vh]
          'fixed bottom-0 left-0 right-0 z-40',
          'rounded-t-3xl p-5 max-h-[75vh]',

          // Desktop (≥ lg): floating panel di kiri — override posisi & ukuran
          'lg:static lg:z-auto',
          'lg:w-80 lg:max-h-[85vh]',
          'lg:rounded-3xl',
        ].join(' ')}
      >
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Filter Peta
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup filter"
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Section: Wilayah */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 block">
            Wilayah
          </label>
          <FilterWilayah />
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 flex-shrink-0" />

        {/* Section: Kategori Infrastruktur */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 block">
            Kategori Infrastruktur
          </label>
          <CategoryChips kategoriList={kategoriList} />
        </div>
      </div>
    </>
  );
}
