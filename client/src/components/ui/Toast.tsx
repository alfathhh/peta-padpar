import React, { createContext, useCallback, useContext, useState } from 'react';
import { cn } from '../../lib/cn';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface ToastItemData {
  id: string;
  variant: ToastVariant;
  title?: string;
  message: string;
}

interface ToastContextValue {
  toast: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
  };
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<ToastVariant, { bar: string; label: string }> = {
  success: { bar: 'border-l-4 border-success-500', label: 'Sukses' },
  error: { bar: 'border-l-4 border-danger-500', label: 'Error' },
  info: { bar: 'border-l-4 border-primary-500', label: 'Info' },
  warning: { bar: 'border-l-4 border-warning-500', label: 'Peringatan' },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItemData[]>([]);

  const remove = useCallback((id: string) => {
    setItems(curr => curr.filter(item => item.id !== id));
  }, []);

  const push = useCallback((variant: ToastVariant, message: string, title?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setItems(curr => [...curr, { id, variant, message, title }]);
    setTimeout(() => remove(id), 4000);
  }, [remove]);

  const value: ToastContextValue = {
    toast: {
      success: (message, title) => push('success', message, title),
      error: (message, title) => push('error', message, title),
      info: (message, title) => push('info', message, title),
      warning: (message, title) => push('warning', message, title),
    },
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed z-[60] top-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0 flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0 pointer-events-none"
        role="region"
        aria-label="Notifikasi"
      >
        {items.map(item => (
          <ToastItem key={item.id} item={item} onClose={() => remove(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ item, onClose }: { item: ToastItemData; onClose: () => void }) {
  const styles = VARIANT_STYLES[item.variant];

  return (
    <div
      role={item.variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-xl bg-white p-4 shadow-pop animate-slide-down',
        styles.bar,
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-neutral-900">{item.title ?? styles.label}</p>
        <p className="mt-0.5 text-sm text-neutral-700">{item.message}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup notifikasi"
        className="shrink-0 -mr-1 -mt-1 h-7 rounded-md px-2 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 focus:outline-none focus-visible:shadow-focus"
      >
        Tutup
      </button>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast harus dipakai di dalam <ToastProvider>');
  return ctx;
}

export function useToastSafe(): ToastContextValue['toast'] | null {
  const ctx = useContext(ToastContext);
  return ctx?.toast ?? null;
}
