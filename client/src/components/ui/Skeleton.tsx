import React from 'react';
import { cn } from '../../lib/cn';

/**
 * Skeleton — placeholder loading dengan animasi pulse.
 *
 * Contoh:
 *   <Skeleton className="h-6 w-32" />
 *   <Skeleton variant="circle" className="h-10 w-10" />
 *   <Skeleton.Card />            // kerangka card
 *   <Skeleton.Lines count={3} /> // 3 baris teks
 */

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rect' | 'circle' | 'text';
}

function SkeletonRoot({ variant = 'rect', className, ...rest }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse bg-neutral-200/70',
        variant === 'circle' && 'rounded-full',
        variant === 'rect' && 'rounded-lg',
        variant === 'text' && 'rounded h-3',
        className,
      )}
      {...rest}
    />
  );
}

function SkeletonLines({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRoot
          key={i}
          variant="text"
          className={cn('h-3', i === count - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white rounded-2xl border border-neutral-200/60 shadow-soft p-4 md:p-6', className)}>
      <SkeletonRoot className="h-4 w-1/3 mb-4" />
      <SkeletonLines count={3} />
    </div>
  );
}

export const Skeleton = Object.assign(SkeletonRoot, {
  Lines: SkeletonLines,
  Card:  SkeletonCard,
});
