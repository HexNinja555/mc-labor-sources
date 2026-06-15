'use client';

import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BrandPageTitle } from '@/components/brand';
import {
  DashboardPanel,
  DashboardSection,
  DashboardStatCard,
  IconBriefcase,
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

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.getDashboardStats(),
  });

  return (
    <DashboardLayout heroTitle="Dashboard" heroImage={BRAND_HERO_IMAGES.homepage}>
      <BrandPageTitle
        align="left"
        title="Workforce Overview"
        description="Summary of employees, job sites, and daily operations"
      />

      {isLoading && <LoadingState />}
      {error && <EmptyState title="Failed to load dashboard" description="Please try again." />}

      {data && (
        <>
          <DashboardSection title="At a glance">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <DashboardStatCard
                label="Total Employees"
                value={data.totalEmployees}
                href="/employees"
                icon={<IconUsers className="h-6 w-6" />}
              />
              <DashboardStatCard
                label="Active Job Sites"
                value={data.activeJobSites}
                href="/job-sites"
                icon={<IconBuilding className="h-6 w-6" />}
              />
              <DashboardStatCard
                label="Clocked In Today"
                value={data.clockedInToday}
                href="/attendance"
                icon={<IconClock className="h-6 w-6" />}
              />
              <DashboardStatCard
                label="Pending Job Orders"
                value={data.pendingJobOrders}
                href="/job-orders"
                icon={<IconBriefcase className="h-6 w-6" />}
              />
              <DashboardStatCard
                label="Signed Timesheets"
                value={data.signedTimesheets}
                href="/timesheets"
                icon={<IconClipboard className="h-6 w-6" />}
              />
            </div>
          </DashboardSection>

          <DashboardSection title="Recent activity" description="Latest clock-ins across all customers">
            <DashboardPanel title="Attendance Activity" description="Most recent workforce check-ins">
              {data.recentAttendance.length === 0 ? (
                <EmptyState title="No attendance records" />
              ) : (
                <div className="dashboard-table">
                  <Table>
                    <thead>
                      <tr>
                        <Th>Employee</Th>
                        <Th>Job Site</Th>
                        <Th>Customer</Th>
                        <Th>Clock In</Th>
                        <Th>Status</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentAttendance.map((log) => (
                        <tr key={log.id}>
                          <Td className="font-medium text-text">
                            {log.employee?.firstName} {log.employee?.lastName}
                          </Td>
                          <Td>{log.jobSite?.name}</Td>
                          <Td>{log.customer?.companyName}</Td>
                          <Td>{new Date(log.clockInTime).toLocaleString()}</Td>
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
          </DashboardSection>
        </>
      )}
    </DashboardLayout>
  );
}
