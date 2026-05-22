import React, { useId } from 'react';
import { cn } from '../../lib/cn';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      id,
      className,
      containerClassName,
      disabled,
      required,
      ...rest
    },
    ref,
  ) => {
    const reactId = useId();
    const inputId = id ?? `input-${reactId}`;
    const describedBy = error
      ? `${inputId}-error`
      : hint
        ? `${inputId}-hint`
        : undefined;

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700 mb-1.5">
            {label}
            {required && <span className="text-danger-500 ml-0.5" aria-hidden="true">*</span>}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn(
            'h-10 w-full rounded-xl border bg-white px-3.5 text-sm text-neutral-900 placeholder:text-neutral-400',
            'transition-colors duration-250 focus:outline-none focus-visible:shadow-focus',
            error
              ? 'border-danger-500 focus:border-danger-500'
              : 'border-neutral-200 focus:border-primary-500',
            disabled && 'bg-neutral-50 text-neutral-400 cursor-not-allowed',
            className,
          )}
          {...rest}
        />

        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-xs text-danger-500">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-neutral-500">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
