import React from 'react';
import type { Infrastruktur, KategoriInfra } from '../../types';
import { Icon } from '../ui/Icon';
import { getKategoriIcon } from '../../lib/categoryIcons';
import { resolveAssetUrl } from '../../lib/assetUrl';

interface Props {
  infra: Infrastruktur;
  kategori?: KategoriInfra;
  onClose?: () => void;
}

export default function InfraPopup({ infra, kategori, onClose }: Props) {
  const warnaKategori = kategori?.color || '#0284c7';
  const iconName = getKategoriIcon(kategori?.value ?? infra.kategori);
  const fotoUrl = resolveAssetUrl(infra.fotoUrl);

  return (
    <article className="w-[300px] overflow-hidden bg-white font-sans">
      <div className="relative">
        {fotoUrl ? (
          <img
            src={fotoUrl}
            alt={infra.nama}
            className="aspect-[16/10] w-full bg-neutral-100 object-cover"
            loading="lazy"
          />
        ) : (
          <div className="grid aspect-[16/10] w-full place-items-center bg-neutral-100">
            <div
              className="grid h-14 w-14 place-items-center rounded-2xl"
              style={{ backgroundColor: `${warnaKategori}18`, color: warnaKategori }}
            >
              <Icon name={iconName} className="h-6 w-6" />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start gap-3">
          <div
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
            style={{ backgroundColor: `${warnaKategori}18`, color: warnaKategori }}
            aria-hidden="true"
          >
            <Icon name={iconName} className="h-[18px] w-[18px]" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-sm font-bold leading-snug text-neutral-950">{infra.nama}</h3>
            {kategori && (
              <div
                className="mt-1 inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={{ backgroundColor: `${warnaKategori}14`, color: warnaKategori }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: warnaKategori }} />
                <span className="truncate">{kategori.label}</span>
              </div>
            )}
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
          >
            Tutup
          </button>
        )}

        {infra.alamat && (
          <div className="flex gap-2 rounded-xl bg-neutral-50 px-3 py-2 text-xs leading-relaxed text-neutral-600">
            <Icon name="map-pin" className="mt-0.5 h-3.5 w-3.5 text-neutral-400" />
            <span className="min-w-0">{infra.alamat}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-neutral-100 pt-3 text-[11px] text-neutral-500">
          <span>Koordinat</span>
          <span className="font-mono font-semibold text-neutral-600">
            {infra.lat.toFixed(5)}, {infra.lng.toFixed(5)}
          </span>
        </div>
      </div>
    </article>
  );
}
