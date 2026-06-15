'use client';

import { useState, type ReactNode } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { IconBriefcase, IconBuilding } from '@/components/dashboard/DashboardIcons';
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

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="inline-flex min-w-0 items-center gap-2 text-sm text-slate-600">
      <span className="text-primary/80" aria-hidden="true">
        {icon}
      </span>
      <span className="sr-only">{label}</span>
      <span className="truncate">{value}</span>
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

  const site = { name, address, city: city ?? null, state: state ?? null, zipCode, status: status ?? 'ACTIVE', foremanName, customer: customerName ? { companyName: customerName } : null };
  const location = formatJobSiteLocation(site);
  const summary = getJobSiteSummary(site, assignments.length);

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      <header className="border-b border-gray-50 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <h3 className="text-lg font-semibold tracking-tight text-slate-800 sm:text-xl">{name}</h3>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {status && (
              <MetaItem
                icon={<IconBriefcase className="h-4 w-4" />}
                label="Status"
                value={<Badge status={status} className="normal-case" />}
              />
            )}
            <MetaItem
              icon={<IconMapPin className="h-4 w-4" />}
              label="Location"
              value={location}
            />
            {customerName && (
              <MetaItem
                icon={<IconBuilding className="h-4 w-4" />}
                label="Customer"
                value={customerName}
              />
            )}
            {foremanName && (
              <MetaItem
                icon={<IconUser className="h-4 w-4" />}
                label="Foreman"
                value={foremanName}
              />
            )}
          </div>
        </div>
      </header>

      <div className="px-5 py-4 sm:px-6">
        <p className="text-sm leading-relaxed text-slate-600">{summary}</p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-lg border-slate-300 px-5 normal-case tracking-normal"
            onClick={() => setExpanded((open) => !open)}
          >
            {expanded ? 'View less' : 'Read more'}
          </Button>
          {onEdit && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="normal-case tracking-normal"
              onClick={onEdit}
            >
              Edit
            </Button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 bg-slate-50/70 px-5 py-5 sm:px-6">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Address</dt>
              <dd className="mt-1 text-sm text-slate-700">{formatJobSiteAddress(site)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Foreman</dt>
              <dd className="mt-1 text-sm text-slate-700">
                {foremanName || 'Not assigned'}
                {foremanPhone ? ` · ${foremanPhone}` : ''}
                {foremanEmail ? ` · ${foremanEmail}` : ''}
              </dd>
            </div>
          </dl>

          <div className="mt-5">
            <p className="text-sm font-semibold text-slate-800">
              Assigned workers ({assignments.length})
            </p>
            {assignments.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No workers assigned yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {assignments.map((assignment) => (
                  <li
                    key={assignment.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-white bg-white px-4 py-3 text-sm text-slate-700 shadow-sm"
                  >
                    <span>
                      {assignment.employee?.firstName} {assignment.employee?.lastName}
                      {assignment.employee?.position ? ` — ${assignment.employee.position}` : ''}
                    </span>
                    <Badge status={assignment.status} className="normal-case" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
