'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { PageTitle } from '@/components/layout/PageTitle';
import { BRAND_HERO_IMAGES } from '@/lib/navigation';
import {
  PortalRecordsPanel,
  PortalSummaryStat,
  PersonCell,
  HoursCell,
  YesNoCell,
} from '@/components/portal';
import { IconClipboard, IconClock, IconUsers } from '@/components/dashboard';
import { Table, Th, Td } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatEmployeeName, getTimesheetStats } from '@/lib/portal-stats';
import { api } from '@/lib/api-client';

export default function CustomerTimesheetsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['customer-timesheets'],
    queryFn: () => api.getCustomerPortalTimesheets(),
  });

  const stats = useMemo(() => getTimesheetStats(data ?? []), [data]);

  return (
    <CustomerLayout heroTitle="Timesheets" heroImage={BRAND_HERO_IMAGES.timesheets}>
      <PageTitle title="Timesheets" description="Signed timesheets for your job sites" />

      {data && data.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <PortalSummaryStat
            label="Total timesheets"
            value={stats.total}
            icon={<IconClipboard className="h-5 w-5" />}
          />
          <PortalSummaryStat
            label="Signed"
            value={stats.signed}
            icon={<IconUsers className="h-5 w-5" />}
            accent="green"
          />
          <PortalSummaryStat
            label="Submitted"
            value={stats.submitted}
            icon={<IconClock className="h-5 w-5" />}
            accent="amber"
          />
          <PortalSummaryStat
            label="Total hours"
            value={stats.totalHours}
            icon={<IconClipboard className="h-5 w-5" />}
            accent="slate"
          />
        </div>
      )}

      {isLoading && <LoadingState />}
      {!isLoading && data && data.length === 0 && <EmptyState title="No signed timesheets" />}
      {data && data.length > 0 && (
        <PortalRecordsPanel
          title="Timesheet records"
          description="Approved hours and foreman signatures for your sites"
          count={data.length}
          countLabel="timesheets"
        >
          <Table>
            <thead>
              <tr>
                <Th>Employee</Th>
                <Th>Job Site</Th>
                <Th>Total Hours</Th>
                <Th>Foreman</Th>
                <Th>Status</Th>
                <Th>Sent to Office</Th>
              </tr>
            </thead>
            <tbody>
              {data.map((timesheet) => (
                <tr key={timesheet.id}>
                  <Td>
                    <PersonCell name={formatEmployeeName(timesheet.employee)} />
                  </Td>
                  <Td className="font-medium text-slate-700">{timesheet.jobSite?.name ?? '—'}</Td>
                  <Td>
                    <HoursCell value={timesheet.totalHours} />
                  </Td>
                  <Td>{timesheet.signature?.foremanName ?? '—'}</Td>
                  <Td>
                    <Badge status={timesheet.status} className="rounded-full normal-case tracking-normal" />
                  </Td>
                  <Td>
                    <YesNoCell value={!!timesheet.signature?.sentToCustomerOffice} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </PortalRecordsPanel>
      )}
    </CustomerLayout>
  );
}
