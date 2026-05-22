import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/cn';
import { Icon } from './Icon';

/**
 * Modal — overlay dengan focus trap + tutup on Esc.
 *
 * Contoh:
 *   <Modal isOpen={open} onClose={() => setOpen(false)} title="Tambah Data">
 *     <form>...</form>
 *   </Modal>
 *
 * Tidak pakai Portal (cukup fixed inset-0 z-50) untuk minim dependency.
 * Fokus dikembalikan ke trigger setelah ditutup.
 */

type Size = 'sm' | 'md' | 'lg' | 'xl';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: Size;
  /** Tutup ketika klik backdrop (default true) */
  closeOnBackdrop?: boolean;
  /** Tutup ketika tekan Esc (default true) */
  closeOnEsc?: boolean;
  /** Footer buttons (kanan-bawah) */
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEsc = true,
  footer,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  // Focus management + Esc handler + body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    previousFocus.current = document.activeElement as HTMLElement;

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Auto-focus first focusable element in dialog
    const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    firstFocusable?.focus();

    function handleKeydown(e: KeyboardEvent) {
      if (closeOnEsc && e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      // Simple focus trap
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.body.style.overflow = originalOverflow;
      // Restore focus to trigger
      previousFocus.current?.focus();
    };
  }, [isOpen, closeOnEsc, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
        onClick={() => closeOnBackdrop && onClose()}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className={cn(
          'relative bg-white rounded-t-2xl sm:rounded-2xl shadow-pop',
          'w-full sm:w-auto',
          'max-h-[90vh] flex flex-col',
          'animate-slide-up',
          SIZE_CLASSES[size],
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 p-5 border-b border-neutral-200">
            <div className="flex-1 min-w-0">
              {title && (
                <h2
                  id="modal-title"
                  className="font-display font-semibold text-lg text-neutral-900"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-description" className="mt-1 text-sm text-neutral-500">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="shrink-0 -mr-1 -mt-1 h-8 w-8 inline-flex items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 focus:outline-none focus-visible:shadow-focus"
            >
              <Icon name="x" className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 p-5 border-t border-neutral-200">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
