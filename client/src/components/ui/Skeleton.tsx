import React from 'react';
import { cn } from '../../lib/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rect' | 'circle' | 'text';
}

function SkeletonRoot({ variant = 'rect', className, ...rest }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse bg-neutral-100',
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
    <div className={cn('space-y-2.5', className)}>
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
    <div className={cn('bg-white rounded-xl border border-neutral-200 p-5', className)}>
      <SkeletonRoot className="h-4 w-1/3 mb-4" />
      <SkeletonLines count={3} />
    </div>
  );
}

export const Skeleton = Object.assign(SkeletonRoot, {
  Lines: SkeletonLines,
  Card:  SkeletonCard,
});
