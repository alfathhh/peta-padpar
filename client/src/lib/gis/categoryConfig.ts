import {
  Building2,
  Bus,
  GraduationCap,
  HeartPulse,
  MapPin,
  School,
  ShoppingBasket,
  Store,
  Utensils,
  Warehouse,
  Waves,
} from 'lucide-react';
import { createElement } from 'react';
import type { ComponentType } from 'react';
import type { SVGProps } from 'react';
import type { KategoriInfra } from '../../types';

export type CategoryIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: string | number }>;

function MosqueIcon(props: SVGProps<SVGSVGElement>) {
  const attrs = {
    ...props,
    xmlns: 'http://www.w3.org/2000/svg',
    width: props.width ?? 24,
    height: props.height ?? 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  return createElement(
    'svg',
    attrs,
    createElement('path', { d: 'M4 21h16' }),
    createElement('path', { d: 'M6 21V10' }),
    createElement('path', { d: 'M18 21V10' }),
    createElement('path', { d: 'M8 21v-5a4 4 0 0 1 8 0v5' }),
    createElement('path', { d: 'M6 10h12' }),
    createElement('path', { d: 'M7 10a5 5 0 0 1 10 0' }),
    createElement('path', { d: 'M4 21v-7' }),
    createElement('path', { d: 'M20 21v-7' }),
    createElement('path', { d: 'M4 14h2' }),
    createElement('path', { d: 'M18 14h2' }),
    createElement('path', { d: 'M12 5V3' }),
    createElement('path', { d: 'M12 3h2' }),
  );
}

export const CATEGORY_VALUES = [
  'restoran',
  'kesehatan',
  'rumah_ibadah',
  'pasar',
  'toko',
  'lainnya',
] as const;

export type CategoryValue = (typeof CATEGORY_VALUES)[number];

export type CategoryConfigItem = {
  label: string;
  icon: CategoryIcon;
  adminStyle: {
    badge: string;
    icon: string;
  };
  mapStyle: {
    badge: string;
    icon: string;
    pin: string;
    color: string;
  };
};

export const categoryConfig: Record<CategoryValue, CategoryConfigItem> = {
  restoran: {
    label: 'Restoran',
    icon: Utensils,
    adminStyle: {
      badge: 'bg-orange-50 text-orange-600 ring-1 ring-orange-100',
      icon: 'text-orange-500',
    },
    mapStyle: {
      badge: 'bg-orange-500 text-white',
      icon: 'text-white',
      pin: 'bg-orange-500 shadow-orange-500/30',
      color: '#f97316',
    },
  },
  kesehatan: {
    label: 'Kesehatan',
    icon: HeartPulse,
    adminStyle: {
      badge: 'bg-blue-50 text-blue-600 ring-1 ring-blue-100',
      icon: 'text-blue-500',
    },
    mapStyle: {
      badge: 'bg-rose-500 text-white',
      icon: 'text-white',
      pin: 'bg-rose-500 shadow-rose-500/30',
      color: '#f43f5e',
    },
  },
  rumah_ibadah: {
    label: 'Rumah Ibadah',
    icon: MosqueIcon,
    adminStyle: {
      badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
      icon: 'text-emerald-500',
    },
    mapStyle: {
      badge: 'bg-indigo-500 text-white',
      icon: 'text-white',
      pin: 'bg-indigo-500 shadow-indigo-500/30',
      color: '#6366f1',
    },
  },
  pasar: {
    label: 'Pasar',
    icon: ShoppingBasket,
    adminStyle: {
      badge: 'bg-amber-50 text-amber-600 ring-1 ring-amber-100',
      icon: 'text-amber-500',
    },
    mapStyle: {
      badge: 'bg-emerald-500 text-white',
      icon: 'text-white',
      pin: 'bg-emerald-500 shadow-emerald-500/30',
      color: '#10b981',
    },
  },
  toko: {
    label: 'Toko',
    icon: Store,
    adminStyle: {
      badge: 'bg-violet-50 text-violet-600 ring-1 ring-violet-100',
      icon: 'text-violet-500',
    },
    mapStyle: {
      badge: 'bg-sky-500 text-white',
      icon: 'text-white',
      pin: 'bg-sky-500 shadow-sky-500/30',
      color: '#0ea5e9',
    },
  },
  lainnya: {
    label: 'Lainnya',
    icon: MapPin,
    adminStyle: {
      badge: 'bg-slate-50 text-slate-600 ring-1 ring-slate-100',
      icon: 'text-slate-500',
    },
    mapStyle: {
      badge: 'bg-slate-500 text-white',
      icon: 'text-white',
      pin: 'bg-slate-500 shadow-slate-500/30',
      color: '#64748b',
    },
  },
};

export const CATEGORY_ICON_OPTIONS = [
  { value: 'utensils', label: 'Restoran', icon: Utensils },
  { value: 'mosque', label: 'Masjid', icon: MosqueIcon },
  { value: 'shopping_basket', label: 'Pasar', icon: ShoppingBasket },
  { value: 'store', label: 'Toko', icon: Store },
  { value: 'heart_pulse', label: 'Kesehatan', icon: HeartPulse },
  { value: 'map_pin', label: 'Lokasi', icon: MapPin },
  { value: 'building', label: 'Gedung', icon: Building2 },
  { value: 'school', label: 'Sekolah', icon: School },
  { value: 'graduation', label: 'Pendidikan', icon: GraduationCap },
  { value: 'warehouse', label: 'Gudang', icon: Warehouse },
  { value: 'bus', label: 'Transportasi', icon: Bus },
  { value: 'waves', label: 'Wisata Air', icon: Waves },
] as const;

export type CategoryIconValue = (typeof CATEGORY_ICON_OPTIONS)[number]['value'];

const CATEGORY_ICON_MAP = new Map<string, CategoryIcon>(
  CATEGORY_ICON_OPTIONS.map((item) => [item.value, item.icon]),
);

const DEFAULT_ICON_VALUE_BY_CATEGORY: Record<CategoryValue, CategoryIconValue> = {
  restoran: 'utensils',
  kesehatan: 'heart_pulse',
  rumah_ibadah: 'mosque',
  pasar: 'shopping_basket',
  toko: 'store',
  lainnya: 'map_pin',
};

export function normalizeCategoryValue(value?: string | null): CategoryValue {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_');

  return (CATEGORY_VALUES as readonly string[]).includes(normalized)
    ? (normalized as CategoryValue)
    : 'lainnya';
}

export function getCategoryConfig(value?: string | null): CategoryConfigItem {
  return categoryConfig[normalizeCategoryValue(value)];
}

export function getCategoryIcon(
  value?: string | null,
  kategori?: Pick<KategoriInfra, 'icon'>,
) {
  if (kategori?.icon) {
    return CATEGORY_ICON_MAP.get(kategori.icon) || getCategoryConfig(value).icon;
  }

  return getCategoryConfig(value).icon;
}

export function getCategoryIconValue(
  value?: string | null,
  kategori?: Pick<KategoriInfra, 'icon'>,
): CategoryIconValue {
  if (
    kategori?.icon &&
    CATEGORY_ICON_OPTIONS.some((option) => option.value === kategori.icon)
  ) {
    return kategori.icon as CategoryIconValue;
  }

  return DEFAULT_ICON_VALUE_BY_CATEGORY[normalizeCategoryValue(value)];
}

export function getCategoryLabel(
  value?: string | null,
  kategori?: Pick<KategoriInfra, 'label'>,
) {
  return kategori?.label || getCategoryConfig(value).label;
}

export function getCategoryColor(
  value?: string | null,
  kategori?: Pick<KategoriInfra, 'color'>,
) {
  return kategori?.color || getCategoryConfig(value).mapStyle.color;
}
