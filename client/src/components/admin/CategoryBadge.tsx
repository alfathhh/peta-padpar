import type { KategoriInfra } from '../../types';
import {
  getCategoryConfig,
  getCategoryIcon,
  getCategoryLabel,
  normalizeCategoryValue,
} from '../../lib/gis/categoryConfig';
import { cn } from '../../lib/cn';

type CategoryBadgeProps = {
  categoryValue: string;
  kategori?: KategoriInfra;
  className?: string;
};

export function CategoryBadge({
  categoryValue,
  kategori,
  className = '',
}: CategoryBadgeProps) {
  const normalizedValue = normalizeCategoryValue(categoryValue);
  const config = getCategoryConfig(normalizedValue);
  const Icon = getCategoryIcon(categoryValue, kategori);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium leading-none',
        'whitespace-nowrap align-middle',
        config.adminStyle.badge,
        className,
      )}
    >
      <Icon size={16} className={config.adminStyle.icon} aria-hidden="true" />
      {getCategoryLabel(categoryValue, kategori)}
    </span>
  );
}

export default CategoryBadge;
