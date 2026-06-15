import type { ReactNode } from 'react';

export const portalFieldClassName =
  'rounded-xl border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20';

interface PortalFilterPanelProps {
  children: ReactNode;
  title?: string;
}

export function PortalFilterPanel({ children, title = 'Filters' }: PortalFilterPanelProps) {
  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm sm:p-6">
      <p className="mb-4 text-xs font-medium uppercase tracking-widest text-primary">{title}</p>
      {children}
    </div>
  );
}

interface PortalSummaryStatProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  accent?: 'primary' | 'green' | 'slate' | 'amber';
}

const accentStyles = {
  primary: 'bg-primary/10 text-primary',
  green: 'bg-emerald-50 text-emerald-700',
  slate: 'bg-slate-100 text-slate-700',
  amber: 'bg-amber-50 text-amber-700',
};

export function PortalSummaryStat({
  label,
  value,
  icon,
  accent = 'primary',
}: PortalSummaryStatProps) {
  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-800">{value}</p>
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accentStyles[accent]}`}
        >
          {icon}
        </div>
      </div>
    </article>
  );
}

interface PortalRecordsPanelProps {
  title: string;
  description?: string;
  count?: number;
  countLabel?: string;
  children: ReactNode;
}

export function PortalRecordsPanel({
  title,
  description,
  count,
  countLabel = 'records',
  children,
}: PortalRecordsPanelProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <header className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="brand-section-title text-lg">{title}</h2>
          {description && <p className="mt-1 text-sm leading-relaxed text-gray-500">{description}</p>}
        </div>
        {count !== undefined && (
          <span className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            {count} {count === 1 ? countLabel.replace(/s$/, '') : countLabel}
          </span>
        )}
      </header>
      <div className="dashboard-table p-2 sm:p-4">{children}</div>
    </article>
  );
}
