import React from 'react';
import { cn } from '../../lib/cn';

/**
 * Card — wrapper standar untuk panel & section.
 * Padding default p-4 md:p-6, bg-white, rounded-2xl, shadow-soft.
 *
 * Subkomponen: Card.Header, Card.Title, Card.Body, Card.Footer
 */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

const PADDING: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm:   'p-3 md:p-4',
  md:   'p-4 md:p-6',
  lg:   'p-6 md:p-8',
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
        'bg-white rounded-2xl border border-neutral-200/60 shadow-soft',
        PADDING[padding],
        hoverable && 'transition-shadow duration-250 hover:shadow-pop',
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
    <div className={cn('flex items-start justify-between gap-3 mb-4', className)} {...rest}>
      {children}
    </div>
  );
}

function CardTitle({ className, children, ...rest }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('font-display font-semibold text-neutral-900 text-lg', className)}
      {...rest}
    >
      {children}
    </h3>
  );
}

function CardBody({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('text-sm text-neutral-700', className)} {...rest}>
      {children}
    </div>
  );
}

function CardFooter({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-neutral-200/60', className)} {...rest}>
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
