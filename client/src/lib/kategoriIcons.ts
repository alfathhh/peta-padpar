import { categoryConfig } from './gis/categoryConfig';
import type { CategoryIcon } from './gis/categoryConfig';

export const KATEGORI_ICON_MAP: Record<string, CategoryIcon> = {
  restoran: categoryConfig.restoran.icon,
  kesehatan: categoryConfig.kesehatan.icon,
  pasar: categoryConfig.pasar.icon,
  toko: categoryConfig.toko.icon,
  rumah_ibadah: categoryConfig.rumah_ibadah.icon,
  lainnya: categoryConfig.lainnya.icon,
};

export const DEFAULT_ICON: CategoryIcon = categoryConfig.lainnya.icon;
