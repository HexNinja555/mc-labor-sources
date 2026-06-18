'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SupervisorLayout } from '@/components/layout/SupervisorLayout';
import { BrandPageTitle } from '@/components/brand';
import {
  DashboardPanel,
  DashboardSection,
  DashboardStatCard,
  IconBuilding,
  IconClipboard,
  IconClock,
  IconUsers,
} from '@/components/dashboard';
import {
  PersonCell,
  HoursCell,
} from '@/components/portal';
import { Table, Th, Td } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { BRAND_HERO_IMAGES } from '@/lib/navigation';
import { api } from '@/lib/api-client';
import { formatEmployeeName } from '@/lib/portal-stats';

export default function SupervisorDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['supervisor-dashboard'],
    queryFn: () => api.getSupervisorPortalDashboard(),
  });

  const pendingCount = useMemo(() => data?.pendingTimesheets.length ?? 0, [data]);

  return (
    <SupervisorLayout heroTitle="Dashboard" heroImage={BRAND_HERO_IMAGES.homepage}>
      <BrandPageTitle
        align="left"
        title="Supervisor Dashboard"
        description="Assigned job sites, live attendance, and timesheet signing"
      />

      {isLoading && <LoadingState />}
      {error && <EmptyState title="Failed to load dashboard" description="Please try again." />}

      {data && (
        <>
          <DashboardSection title="At a glance">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <DashboardStatCard
                label="Assigned Sites"
                value={data.stats.assignedJobSites}
                href="/supervisor/job-sites"
                icon={<IconBuilding className="h-6 w-6" />}
              />
              <DashboardStatCard
                label="Workers Assigned"
                value={data.stats.workersAssigned}
                href="/supervisor/job-sites"
                icon={<IconUsers className="h-6 w-6" />}
              />
              <DashboardStatCard
                label="Clocked In Today"
                value={data.stats.clockedInToday}
                href="/supervisor/attendance"
                icon={<IconClock className="h-6 w-6" />}
              />
              <DashboardStatCard
                label="Pending Signatures"
                value={data.stats.pendingTimesheets}
                href="/supervisor/timesheets"
                icon={<IconClipboard className="h-6 w-6" />}
              />
              <DashboardStatCard
                label="Signed Timesheets"
                value={data.stats.signedTimesheets}
                href="/supervisor/timesheets"
                icon={<IconClipboard className="h-6 w-6" />}
              />
            </div>
          </DashboardSection>

          <DashboardSection
            title="Quick access"
            description="Jump to your assigned areas"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <PortalLink href="/supervisor/job-sites" title="Job Sites" description="View assigned sites" />
              <PortalLink href="/supervisor/attendance" title="Attendance" description="Track worker clock-ins" />
              <PortalLink
                href="/supervisor/timesheets"
                title="Timesheets"
                description={pendingCount ? `${pendingCount} awaiting signature` : 'Review and sign'}
              />
              <PortalLink href="/supervisor/reports" title="Reports" description="Hours rollup and CSV export" />
            </div>
          </DashboardSection>

          <DashboardSection title="Today's activity">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <DashboardPanel title="Workers on site today" description="Live clock-ins on your sites">
                {data.todayAttendance.length === 0 ? (
                  <EmptyState title="No workers clocked in" />
                ) : (
                  <div className="dashboard-table">
                    <Table>
                      <thead>
                        <tr>
                          <Th>Employee</Th>
                          <Th>Job Site</Th>
                          <Th>Status</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.todayAttendance.slice(0, 8).map((log) => (
                          <tr key={log.id}>
                            <Td>
                              <PersonCell name={formatEmployeeName(log.employee)} />
                            </Td>
                            <Td>{log.jobSite?.name}</Td>
                            <Td>
                              <Badge status={log.status} className="rounded-full normal-case" />
                            </Td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </DashboardPanel>

              <DashboardPanel title="Pending signatures" description="Timesheets waiting for foreman sign-off">
                {data.pendingTimesheets.length === 0 ? (
                  <EmptyState title="No pending timesheets" />
                ) : (
                  <div className="dashboard-table">
                    <Table>
                      <thead>
                        <tr>
                          <Th>Employee</Th>
                          <Th>Site</Th>
                          <Th>Hours</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.pendingTimesheets.slice(0, 8).map((ts) => (
                          <tr key={ts.id}>
                            <Td>
                              <PersonCell name={formatEmployeeName(ts.employee)} />
                            </Td>
                            <Td>{ts.jobSite?.name}</Td>
                            <Td>
                              <HoursCell value={ts.totalHours} />
                            </Td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </DashboardPanel>
            </div>
          </DashboardSection>
        </>
      )}
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
