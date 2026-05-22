import React from 'react';
import { KategoriInfra } from '../../types';
import SearchBar from '../search/SearchBar';
import { cn } from '../../lib/cn';
import { Icon } from '../ui/Icon';

interface PublicHeaderProps {
  kategoriMap: Map<string, KategoriInfra>;
  onToggleFilter: () => void;
  onToggleStatistik: () => void;
  filterActive: boolean;
  statistikActive: boolean;
}

function HeaderButton({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: 'filter' | 'chart';
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Toggle ${label.toLowerCase()}`}
      aria-pressed={active}
      className={cn(
        'inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-all duration-250 focus-visible:shadow-focus active:scale-[0.98] sm:h-11 sm:px-4',
        active
          ? 'border-primary-200 bg-primary-50 text-primary-700 shadow-soft'
          : 'border-neutral-200/80 bg-white/85 text-neutral-600 hover:bg-neutral-50',
      )}
    >
      <Icon name={icon} className="h-4 w-4" />
      {label}
    </button>
  );
}

export default function PublicHeader({
  kategoriMap,
  onToggleFilter,
  onToggleStatistik,
  filterActive,
  statistikActive,
}: PublicHeaderProps) {
  return (
    <header className="relative z-[1200] flex-shrink-0 border-b border-neutral-200 bg-white px-3 py-2.5 shadow-soft sm:px-4">
      <div className="grid grid-cols-[auto,1fr] items-center gap-2 sm:gap-3 xl:grid-cols-[auto,1fr,auto]">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-primary-700 shadow-soft sm:h-11 sm:w-11" role="img" aria-label="Logo Padang Pariaman">
            <span className="select-none font-display text-sm font-bold leading-none text-white">PP</span>
          </div>
          <div className="hidden min-w-0 sm:block">
            <h1 className="truncate text-sm font-display font-bold leading-tight text-neutral-900">Peta Tematik</h1>
            <p className="truncate text-[11px] font-medium leading-tight text-neutral-500">Kab. Padang Pariaman</p>
          </div>
        </div>

        <div className="min-w-0 justify-self-center w-full max-w-2xl">
          <SearchBar kategoriMap={kategoriMap} />
        </div>

        <div className="hidden flex-shrink-0 items-center gap-1.5 sm:gap-2 xl:flex">
          <HeaderButton active={filterActive} label="Filter" icon="filter" onClick={onToggleFilter} />
          <HeaderButton active={statistikActive} label="Statistik" icon="chart" onClick={onToggleStatistik} />
        </div>
      </div>
    </header>
  );
}
