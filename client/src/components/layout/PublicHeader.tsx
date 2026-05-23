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
        'inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all duration-150',
        active
          ? 'border-primary-200 bg-primary-50 text-primary-700'
          : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300',
      )}
    >
      <Icon name={icon} className="h-3.5 w-3.5" />
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
    <header className="relative z-[1200] flex-shrink-0 border-b border-neutral-200 bg-white h-12 px-3 flex items-center sm:px-4">
      <div className="flex items-center gap-3 w-full xl:grid xl:grid-cols-[auto,1fr,auto]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand" role="img" aria-label="Logo">
            <span className="text-[10px] font-bold text-white">PP</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold text-neutral-900 leading-tight">Peta Tematik</h1>
            <p className="text-[10px] text-neutral-500 leading-tight">Kab. Padang Pariaman</p>
          </div>
        </div>

        {/* Search */}
        <div className="min-w-0 flex-1 max-w-2xl mx-auto xl:mx-0 xl:justify-self-center">
          <SearchBar kategoriMap={kategoriMap} />
        </div>

        {/* Toggle buttons */}
        <div className="hidden xl:flex items-center gap-2 shrink-0">
          <HeaderButton active={filterActive} label="Filter" icon="filter" onClick={onToggleFilter} />
          <HeaderButton active={statistikActive} label="Statistik" icon="chart" onClick={onToggleStatistik} />
        </div>
      </div>
    </header>
  );
}
