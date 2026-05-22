import React from 'react';

/**
 * StatistikCard — card angka besar untuk panel statistik.
 * Prop schema: { indikator, nilai, satuan?, tahun? }
 * Default export agar bisa diimport sebagai: import StatistikCard from './StatistikCard'
 *
 * Fix: sebelumnya named export `export function StatistikCard` dengan schema
 * berbeda {label, value, color}. Sekarang default export dengan schema
 * {indikator, nilai, satuan, tahun} sesuai yang dipakai StatistikPanel.tsx.
 */

interface StatistikCardProps {
  indikator: string;
  nilai: number;
  satuan?: string;
  tahun?: number;
}

export default function StatistikCard({ indikator, nilai, satuan, tahun }: StatistikCardProps) {
  // Format angka besar: 1.500.000 → "1,5 jt", 1.500 → "1.500", dll.
  const formattedNilai = nilai >= 1_000_000
    ? `${(nilai / 1_000_000).toFixed(1)} jt`
    : nilai >= 1_000
      ? nilai.toLocaleString('id-ID')
      : nilai % 1 !== 0
        ? nilai.toFixed(2)
        : String(nilai);

  return (
    <div className="bg-white rounded-xl border border-neutral-200/60 shadow-soft p-4 hover:shadow-pop transition-shadow duration-250">
      {/* Label indikator */}
      <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider truncate mb-1">
        {indikator}
      </p>

      {/* Nilai besar */}
      <div className="flex items-baseline gap-1.5">
        <span className="font-display font-bold text-2xl text-neutral-900 leading-tight">
          {formattedNilai}
        </span>
        {satuan && (
          <span className="text-xs font-medium text-neutral-500">{satuan}</span>
        )}
      </div>

      {/* Tahun */}
      {tahun && (
        <p className="text-[10px] text-neutral-400 mt-1">Data tahun {tahun}</p>
      )}
    </div>
  );
}
