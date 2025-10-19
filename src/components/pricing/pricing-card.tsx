
"use client";

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const PriceCard: React.FC<{
  className?: string;
  contactPageHref?: string;
  children: React.ReactNode;
  isFeatured?: boolean;
}> = ({ className, children, contactPageHref, isFeatured }) => {
  return (
    <article
      className={cn(
        'text-start border backdrop-blur-[4px] h-full min-h-[500px] w-full max-w-[400px] dark:border-neutral-800 border-neutral-300 px-6 py-8 rounded-xl relative z-[1] flex flex-col justify-between',
        isFeatured && 'border-primary/50 ring-2 ring-primary/20',
        className
      )}
    >
      <div>{children}</div>
      {contactPageHref && (
        <Link
          href={contactPageHref}
          className={cn(
            'w-full flex items-center justify-center mt-7 p-2 rounded-lg text-center font-medium transition-colors',
            isFeatured
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'border dark:border-neutral-700 border-neutral-300 dark:text-neutral-300 text-neutral-600 hover:bg-accent hover:text-accent-foreground'
          )}
        >
          Contact Sales
        </Link>
      )}
    </article>
  );
};

export const OfferingWrapper: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => <ul className={cn('mt-8 flex flex-col gap-3 text-sm', className)}>{children}</ul>;

export const Offering: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <li className={cn('flex gap-2.5 items-center font-medium text-muted-foreground', className)}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={'w-5 h-5 fill-green-500 shrink-0'}
    >
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
        clipRule="evenodd"
      />
    </svg>
    <span>{children}</span>
  </li>
);

export const ProductName: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => <h2 className={cn('text-lg font-bold text-foreground text-start', className)}>{children}</h2>;

export const Price: React.FC<{ children: React.ReactNode; className?: string; period?: string }> = ({
  children,
  className,
  period
}) => (
  <div className={cn('mt-6 mb-5', className)}>
    <div className={'flex items-end gap-1 p-0'}>
      <p className={'text-4xl font-bold block'}>{children}</p>
      {period && <span className="text-muted-foreground text-sm font-medium">{period}</span>}
    </div>
  </div>
);

export const Description: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={'h-20'}>
    <p className={'leading-normal text-sm text-muted-foreground'}>{children}</p>
  </div>
);
