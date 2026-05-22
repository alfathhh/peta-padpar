import { categoryConfig } from './gis/categoryConfig';

export const KATEGORI_BADGE_CLASS: Record<string, string> = {
  restoran: categoryConfig.restoran.adminStyle.badge,
  kesehatan: categoryConfig.kesehatan.adminStyle.badge,
  rumah_ibadah: categoryConfig.rumah_ibadah.adminStyle.badge,
  pasar: categoryConfig.pasar.adminStyle.badge,
  toko: categoryConfig.toko.adminStyle.badge,
  lainnya: categoryConfig.lainnya.adminStyle.badge,
};

export const KATEGORI_BADGE_CLASS_FALLBACK = categoryConfig.lainnya.adminStyle.badge;
