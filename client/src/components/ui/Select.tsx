import React, { useId } from 'react';
import { cn } from '../../lib/cn';
import { Icon } from './Icon';

/**
 * Select — wrapper konsisten untuk <select> native.
 * Cocok untuk cascade dropdown wilayah.
 *
 * Contoh:
 *   <Select label="Kecamatan" value={idkec} onChange={...}>
 *     <option value="">Semua Kecamatan</option>
 *     {kecamatan.map(k => <option key={k.idkec} value={k.idkec}>{k.nama}</option>)}
 *   </Select>
 */

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, hint, id, className, containerClassName, disabled, required, children, ...rest },
    ref,
  ) => {
    const reactId = useId();
    const selectId = id ?? `select-${reactId}`;
    const describedBy = error
      ? `${selectId}-error`
      : hint
        ? `${selectId}-hint`
        : undefined;

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-neutral-700 mb-1.5"
          >
            {label}
            {required && <span className="text-danger-500 ml-0.5" aria-hidden="true">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={cn(
              'w-full h-10 rounded-xl border bg-white text-sm text-neutral-900',
              'px-3.5 pr-10 appearance-none',
              'transition-colors duration-250',
              'focus:outline-none focus-visible:shadow-focus',
              error
                ? 'border-danger-500 focus:border-danger-500'
                : 'border-neutral-200 focus:border-primary-500',
              disabled && 'bg-neutral-50 text-neutral-400 cursor-not-allowed',
              className,
            )}
            {...rest}
          >
            {children}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
            <Icon name="chevron-down" className="h-4 w-4" />
          </span>
        </div>

        {error && (
          <p id={`${selectId}-error`} className="mt-1.5 text-xs text-danger-500">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${selectId}-hint`} className="mt-1.5 text-xs text-neutral-500">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';
