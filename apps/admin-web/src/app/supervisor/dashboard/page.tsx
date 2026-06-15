'use client';

import Link from 'next/link';
import { SupervisorLayout } from '@/components/layout/SupervisorLayout';
import { BrandPageTitle } from '@/components/brand';
import { DashboardPanel, DashboardSection } from '@/components/dashboard';
import { BRAND_HERO_IMAGES } from '@/lib/navigation';

export default function SupervisorDashboardPage() {
  return (
    <SupervisorLayout heroTitle="Dashboard" heroImage={BRAND_HERO_IMAGES.homepage}>
      <BrandPageTitle
        align="left"
        title="Supervisor Dashboard"
        description="Assigned job sites, attendance, and timesheets"
      />

      <DashboardSection title="Quick access">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <PortalLink href="/supervisor/job-sites" title="Job Sites" description="View your assigned sites" />
          <PortalLink href="/supervisor/attendance" title="Attendance" description="Track worker clock-ins" />
          <PortalLink href="/supervisor/timesheets" title="Timesheets" description="Review and sign timesheets" />
        </div>
      </DashboardSection>

      <DashboardPanel title="Coming soon" description="Expanded supervisor reporting in the next milestone">
        <p className="px-2 text-sm leading-relaxed text-gray-600">
          Full supervisor dashboards with site summaries, live attendance, and timesheet workflows will
          be available in an upcoming release. Use the quick links above to access your assigned areas.
        </p>
      </DashboardPanel>
    </SupervisorLayout>
  );
}

function PortalLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg"
    >
      <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-primary to-primary-dark opacity-0 transition-opacity group-hover:opacity-100" />
      <p className="font-semibold text-text">{title}</p>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-primary opacity-0 transition-opacity group-hover:opacity-100">
        Open →
      </p>
    </Link>
  );
}
