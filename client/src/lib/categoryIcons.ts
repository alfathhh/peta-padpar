import type { IconName } from '../components/ui/Icon';

export function getKategoriIcon(value: string): IconName {
  const normalized = value.toLowerCase();

  if (normalized.includes('restoran') || normalized.includes('kuliner')) return 'utensils';
  if (normalized.includes('ibadah') || normalized.includes('masjid') || normalized.includes('mushalla')) return 'prayer';
  if (normalized.includes('pasar')) return 'basket';
  if (normalized.includes('toko') || normalized.includes('umkm') || normalized.includes('warung')) return 'store';
  if (normalized.includes('kesehatan') || normalized.includes('puskesmas') || normalized.includes('klinik')) return 'heart';

  return 'layers';
}

export const KATEGORI_ICON_OPTIONS: Array<{ value: IconName; label: string }> = [
  { value: 'layers', label: 'Umum' },
  { value: 'utensils', label: 'Kuliner' },
  { value: 'prayer', label: 'Ibadah' },
  { value: 'basket', label: 'Pasar' },
  { value: 'store', label: 'Toko' },
  { value: 'heart', label: 'Kesehatan' },
  { value: 'building', label: 'Bangunan' },
  { value: 'map-pin', label: 'Lokasi' },
];

export function resolveKategoriIcon(icon: string | undefined, value: string, label?: string): IconName {
  if (icon && KATEGORI_ICON_OPTIONS.some((item) => item.value === icon)) {
    return icon as IconName;
  }

  return getKategoriIcon(`${value} ${label ?? ''}`);
}
