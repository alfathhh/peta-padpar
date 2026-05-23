import React from 'react';
import { cn } from '../../lib/cn';

type BadgeVariant = 'primary' | 'neutral' | 'success' | 'warning' | 'danger';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  color?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  primary: 'bg-primary-50 text-primary-700 border-primary-100',
  neutral: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  success: 'bg-success-50 text-success-700 border-success-100',
  warning: 'bg-warning-50 text-warning-700 border-warning-100',
  danger:  'bg-danger-50 text-danger-700 border-danger-100',
};

export function Badge({ variant = 'neutral', color, className, children, style, ...rest }: BadgeProps) {
  const dynamicStyle = color
    ? { backgroundColor: `${color}10`, color, borderColor: `${color}25`, ...style }
    : style;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md border',
        !color && VARIANT_CLASSES[variant],
        className,
      )}
      style={dynamicStyle}
      {...rest}
    >
      {children}
    </span>
  );
}
