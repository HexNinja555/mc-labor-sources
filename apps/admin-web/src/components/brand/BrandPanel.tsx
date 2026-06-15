import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function BrandPanel({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-2xl border border-gray-100 bg-white p-6 shadow-sm', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function BrandPanelTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('brand-panel-title', className)} {...props}>
      {children}
    </h3>
  );
}
