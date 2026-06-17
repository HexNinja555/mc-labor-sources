'use client';

import { useState, type ReactNode } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { IconBuilding } from '@/components/dashboard/DashboardIcons';
import {
  formatJobSiteAddress,
  formatJobSiteLocation,
  getJobSiteSummary,
} from '@/lib/job-site-utils';

interface JobSiteAssignment {
  id: string;
  status: string;
  employee?: {
    firstName?: string;
    lastName?: string;
    position?: string | null;
  } | null;
}

interface BrandJobSiteCardProps {
  name: string;
  address: string;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  status?: string;
  customerName?: string;
  foremanName?: string | null;
  foremanPhone?: string | null;
  foremanEmail?: string | null;
  assignments?: JobSiteAssignment[];
  onEdit?: () => void;
}

function IconMapPin({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M12 21s7-4.35 7-10a7 7 0 10-14 0c0 5.65 7 10 7 10z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="11" r="2.5" />
    </svg>
  );
}

function IconUser({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-3.5 5-5 8-5s6.5 1.5 8 5" strokeLinecap="round" />
    </svg>
  );
}

function MetaChip({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-900/[0.03]">
      <span className="shrink-0 text-primary" aria-hidden="true">
        {icon}
      </span>
      <span className="truncate">{children}</span>
    </span>
  );
}

function DetailBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/80 bg-white/90 p-4 shadow-sm ring-1 ring-slate-900/[0.04]">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <div className="mt-1.5 text-sm leading-relaxed text-slate-700">{children}</div>
    </div>
  );
}

export function BrandJobSiteCard({
  name,
  address,
  city,
  state,
  zipCode,
  status,
  customerName,
  foremanName,
  foremanPhone,
  foremanEmail,
  assignments = [],
  onEdit,
}: BrandJobSiteCardProps) {
  const [expanded, setExpanded] = useState(false);

  const site = {
    name,
    address,
    city: city ?? null,
    state: state ?? null,
    zipCode,
    status: status ?? 'ACTIVE',
    foremanName,
    customer: customerName ? { companyName: customerName } : null,
  };
  const location = formatJobSiteLocation(site);
  const summary = getJobSiteSummary(site, assignments.length);

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm ring-1 ring-slate-900/5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/10">
      <div className="h-1 bg-gradient-to-r from-primary via-indigo-500 to-primary" />

      <header className="border-b border-slate-100/80 bg-gradient-to-br from-slate-50/90 via-white to-blue-50/40 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <IconMapPin className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">{name}</h3>
                {status ? <Badge status={status} className="rounded-full normal-case" /> : null}
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <MetaChip icon={<IconMapPin className="h-3.5 w-3.5" />}>{location}</MetaChip>
                {customerName ? (
                  <MetaChip icon={<IconBuilding className="h-3.5 w-3.5" />}>{customerName}</MetaChip>
                ) : null}
                {foremanName ? (
                  <MetaChip icon={<IconUser className="h-3.5 w-3.5" />}>{foremanName}</MetaChip>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="px-5 py-4 sm:px-6">
        <p className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-sm leading-relaxed text-slate-600">
          {summary}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={expanded ? 'arrowLeft' : 'eye'}
            onClick={() => setExpanded((open) => !open)}
          >
            {expanded ? 'View less' : 'Read more'}
          </Button>
          {onEdit ? (
            <Button type="button" variant="softPrimary" size="sm" icon="edit" onClick={onEdit}>
              Edit
            </Button>
          ) : null}
        </div>
      </div>

      {expanded ? (
        <div className="border-t border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 px-5 py-5 sm:px-6">
          <dl className="grid gap-3 sm:grid-cols-2">
            <DetailBlock label="Address">{formatJobSiteAddress(site)}</DetailBlock>
            <DetailBlock label="Foreman">
              {foremanName || 'Not assigned'}
              {foremanPhone ? ` · ${foremanPhone}` : ''}
              {foremanEmail ? ` · ${foremanEmail}` : ''}
            </DetailBlock>
          </dl>

          <div className="mt-4 rounded-xl border border-slate-200/60 bg-white/70 p-4 shadow-sm ring-1 ring-slate-900/[0.03]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-800">Assigned workers</p>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                {assignments.length}
              </span>
            </div>
            {assignments.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No workers assigned yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {assignments.map((assignment) => (
                  <li
                    key={assignment.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-gradient-to-r from-white to-slate-50/50 px-4 py-3 text-sm text-slate-700 shadow-sm transition-colors hover:border-primary/15 hover:from-primary/[0.02] hover:to-blue-50/40"
                  >
                    <span className="font-medium">
                      {assignment.employee?.firstName} {assignment.employee?.lastName}
                      {assignment.employee?.position ? (
                        <span className="font-normal text-slate-500"> — {assignment.employee.position}</span>
                      ) : null}
                    </span>
                    <Badge status={assignment.status} className="shrink-0 rounded-full normal-case" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </article>
  );
}
