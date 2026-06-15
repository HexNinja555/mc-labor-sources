import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DashboardSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function DashboardSection({ title, description, children, className }: DashboardSectionProps) {
  return (
    <section className={cn('mb-10', className)}>
      <div className="mb-5">
        <h2 className="brand-section-title">{title}</h2>
        {description && <p className="mt-1 text-sm leading-relaxed text-gray-500">{description}</p>}
      </div>
      {children}
    </section>
  );
}

interface DashboardStatCardProps {
  label: string;
  value: number;
  href: string;
  icon: ReactNode;
}

export function DashboardStatCard({ label, value, href, icon }: DashboardStatCardProps) {
  return (
    <Link href={href} className="group block h-full">
      <article className="relative h-full overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary-dark to-primary" />
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="mt-2 text-4xl font-bold tracking-tight text-primary">{value}</p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
            {icon}
          </div>
        </div>
        <p className="mt-4 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          View details →
        </p>
      </article>
    </Link>
  );
}

interface DashboardPanelProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function DashboardPanel({ title, description, children, className }: DashboardPanelProps) {
  return (
    <article
      className={cn(
        'overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm',
        className,
      )}
    >
      <header className="border-b border-gray-100 px-6 py-4">
        <h3 className="brand-section-title text-lg">{title}</h3>
        {description && <p className="mt-1 text-sm leading-relaxed text-gray-500">{description}</p>}
      </header>
      <div className="p-2 sm:p-4">{children}</div>
    </article>
  );
}
