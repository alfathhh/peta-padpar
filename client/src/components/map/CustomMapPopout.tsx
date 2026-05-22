import { MapPin } from 'lucide-react';
import type { Infrastruktur, KategoriInfra } from '../../types';
import { CategoryBadge } from '../admin/CategoryBadge';

type CustomMapPopoutProps = {
  infra: Infrastruktur;
  kategori?: KategoriInfra;
};

export function CustomMapPopout({ infra, kategori }: CustomMapPopoutProps) {
  return (
    <div className="w-72 rounded-2xl bg-white/95 p-4 font-sans shadow-2xl backdrop-blur-sm">
      {infra.fotoUrl && (
        <div className="-mx-4 -mt-4 mb-4 h-40 overflow-hidden rounded-t-2xl bg-slate-100">
          <img
            src={infra.fotoUrl}
            alt={infra.nama}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="space-y-3">
        <div>
          <h3 className="text-base font-semibold leading-snug tracking-tight text-slate-900">
            {infra.nama}
          </h3>
          <div className="mt-2">
            <CategoryBadge categoryValue={infra.kategori} kategori={kategori} />
          </div>
        </div>

        <div className="space-y-2 border-t border-slate-200/70 pt-3 text-xs text-slate-600">
          <div className="flex items-start gap-2">
            <MapPin
              size={14}
              className="mt-0.5 shrink-0 text-slate-400"
              aria-hidden="true"
            />
            <span className="leading-relaxed">{infra.alamat || '-'}</span>
          </div>

          <div className="font-mono text-[11px] text-slate-400">
            {infra.lat.toFixed(6)}, {infra.lng.toFixed(6)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomMapPopout;
