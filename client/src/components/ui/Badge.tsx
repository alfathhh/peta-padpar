import React from 'react';
import { cn } from '../../lib/cn';

/**
 * Badge — label kecil untuk kategori, status, dll.
 *
 * Dua mode:
 * 1. Varian preset: <Badge variant="success">Aktif</Badge>
 * 2. Warna kustom dari API: <Badge color={kategori.color}>{kategori.label}</Badge>
 *    → otomatis hitung background tipis (10% opacity) dan teks gelap
 */

type Variant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

export interface BadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'> {
  variant?: Variant;
  /** Hex warna dari API (cth: "#F97316"). Override variant jika diisi. */
  color?: string;
  size?: 'sm' | 'md';
}

const VARIANT_CLASSES: Record<Variant, string> = {
  neutral: 'bg-neutral-100 text-neutral-700',
  primary: 'bg-primary-50 text-primary-700',
  success: 'bg-success-50 text-success-600',
  warning: 'bg-warning-50 text-warning-600',
  danger:  'bg-danger-50 text-danger-600',
};

const SIZE_CLASSES = {
  sm: 'h-5 px-2 text-[10px] gap-1',
  md: 'h-6 px-2.5 text-xs gap-1.5',
};

export function Badge({
  variant = 'neutral',
  color,
  size = 'md',
  className,
  style,
  children,
  ...rest
}: BadgeProps) {
  // Mode warna kustom (dari API kategori): inline style background + text
  const customStyle: React.CSSProperties | undefined = color
    ? {
        backgroundColor: `${color}1A`, // hex + 1A (~10% opacity)
        color,
        ...style,
      }
    : style;

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full whitespace-nowrap',
        SIZE_CLASSES[size],
        !color && VARIANT_CLASSES[variant],
        className,
      )}
      style={customStyle}
      {...rest}
    >
      {children}
    </span>
  );
}
