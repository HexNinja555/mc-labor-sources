'use client';

import { useQuery } from '@tanstack/react-query';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
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
import { Table, Th, Td } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { BRAND_HERO_IMAGES } from '@/lib/navigation';
import { api } from '@/lib/api-client';

export default function CustomerDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['customer-dashboard'],
    queryFn: () => api.getCustomerPortalDashboard(),
  });

  return (
    <CustomerLayout heroTitle="Dashboard" heroImage={BRAND_HERO_IMAGES.homepage}>
      <BrandPageTitle
        align="left"
        title={data?.customer.companyName || 'Customer Dashboard'}
        description="Your workforce overview and recent activity"
      />

      {isLoading && <LoadingState />}
      {error && <EmptyState title="Failed to load dashboard" description="Please try again." />}

      {data && (
        <>
          <DashboardSection title="At a glance">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <DashboardStatCard
                label="Active Job Sites"
                value={data.stats.activeJobSites}
                href="/customer/job-sites"
                icon={<IconBuilding className="h-6 w-6" />}
              />
              <DashboardStatCard
                label="Workers Assigned"
                value={data.stats.workersAssigned}
                href="/customer/job-sites"
                icon={<IconUsers className="h-6 w-6" />}
              />
              <DashboardStatCard
                label="Clocked In Today"
                value={data.stats.clockedInToday}
                href="/customer/attendance"
                icon={<IconClock className="h-6 w-6" />}
              />
              <DashboardStatCard
                label="Signed Timesheets"
                value={data.stats.signedTimesheets}
                href="/customer/timesheets"
                icon={<IconClipboard className="h-6 w-6" />}
              />
            </div>
          </DashboardSection>

          <DashboardSection title="Recent activity" description="Live view of your sites and signed hours">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <DashboardPanel title="Workers on Site Today" description="Who is currently clocked in">
                {data.todayAttendance.length === 0 ? (
                  <EmptyState title="No workers clocked in" />
                ) : (
                  <div className="dashboard-table">
                    <Table>
                      <thead>
                        <tr>
                          <Th>Employee</Th>
                          <Th>Job Site</Th>
                          <Th>Clock In</Th>
                          <Th>Status</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.todayAttendance.map((log) => (
                          <tr key={log.id}>
                            <Td className="font-medium text-text">
                              {log.employee?.firstName} {log.employee?.lastName}
                            </Td>
                            <Td>{log.jobSite?.name}</Td>
                            <Td>{new Date(log.clockInTime).toLocaleTimeString()}</Td>
                            <Td>
                              <Badge status={log.status} />
                            </Td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </DashboardPanel>

              <DashboardPanel title="Signed Timesheets" description="Recently approved hours">
                {data.signedTimesheets.length === 0 ? (
                  <EmptyState title="No signed timesheets" />
                ) : (
                  <div className="dashboard-table">
                    <Table>
                      <thead>
                        <tr>
                          <Th>Employee</Th>
                          <Th>Job Site</Th>
                          <Th>Hours</Th>
                          <Th>Foreman</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.signedTimesheets.map((ts) => (
                          <tr key={ts.id}>
                            <Td className="font-medium text-text">
                              {ts.employee?.firstName} {ts.employee?.lastName}
                            </Td>
                            <Td>{ts.jobSite?.name}</Td>
                            <Td>{ts.totalHours}</Td>
                            <Td>{ts.signature?.foremanName}</Td>
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
    </CustomerLayout>
  );
}
