import React from 'react';
import { cn } from '../../lib/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

const PADDING: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm:   'p-4',
  md:   'p-5',
  lg:   'p-6',
};

function CardRoot({
  padding = 'md',
  hoverable = false,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-neutral-200',
        PADDING[padding],
        hoverable && 'transition-all duration-150 hover:shadow-md hover:border-neutral-300',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

function CardHeader({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-between gap-3 mb-4', className)} {...rest}>
      {children}
    </div>
  );
}

function CardTitle({ className, children, ...rest }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('font-semibold text-neutral-900 text-base', className)}
      {...rest}
    >
      {children}
    </h3>
  );
}

function CardBody({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('text-sm text-neutral-600', className)} {...rest}>
      {children}
    </div>
  );
}

function CardFooter({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-neutral-100', className)} {...rest}>
      {children}
    </div>
  );
}

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Title:  CardTitle,
  Body:   CardBody,
  Footer: CardFooter,
});
