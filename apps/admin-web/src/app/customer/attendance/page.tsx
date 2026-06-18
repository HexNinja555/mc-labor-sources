'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { BrandPageTitle } from '@/components/brand';
import { BRAND_HERO_IMAGES } from '@/lib/navigation';
import {
  PortalFilterPanel,
  PortalRecordsPanel,
  PortalSummaryStat,
  portalFieldClassName,
  DateTimeCell,
  PersonCell,
} from '@/components/portal';
import { IconClock, IconUsers } from '@/components/dashboard';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Table, Th, Td } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatEmployeeName, getAttendanceStats } from '@/lib/portal-stats';
import { api } from '@/lib/api-client';

export default function CustomerAttendancePage() {
  const [date, setDate] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['customer-attendance', date],
    queryFn: () => api.getCustomerPortalAttendance(date || undefined),
  });

  const stats = useMemo(() => getAttendanceStats(data ?? []), [data]);

  return (
    <CustomerLayout heroTitle="Attendance" heroImage={BRAND_HERO_IMAGES.attendance}>
      <BrandPageTitle title="Attendance" description="Clock-in and clock-out times for your job sites" />

      {data && data.length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <PortalSummaryStat label="Total records" value={stats.total} icon={<IconUsers className="h-5 w-5" />} />
          <PortalSummaryStat
            label="Clocked in"
            value={stats.clockedIn}
            icon={<IconClock className="h-5 w-5" />}
            accent="green"
          />
          <PortalSummaryStat
            label="Clocked out"
            value={stats.clockedOut}
            icon={<IconClock className="h-5 w-5" />}
            accent="slate"
          />
        </div>
      )}

      <PortalFilterPanel title="Filter">
        <div className="max-w-sm">
          <FormField label="Filter by date">
            <Input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={portalFieldClassName}
            />
          </FormField>
        </div>
      </PortalFilterPanel>

      {isLoading && <LoadingState />}
      {!isLoading && data && data.length === 0 && <EmptyState title="No attendance records" />}
      {data && data.length > 0 && (
        <PortalRecordsPanel
          title="Today's activity"
          description="Workers clocking in and out across your job sites"
          count={data.length}
        >
          <Table>
            <thead>
              <tr>
                <Th>Employee</Th>
                <Th>Job Site</Th>
                <Th>Clock In</Th>
                <Th>Clock Out</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {data.map((log) => (
                <tr key={log.id}>
                  <Td>
                    <PersonCell name={formatEmployeeName(log.employee)} />
                  </Td>
                  <Td className="font-medium text-slate-700">{log.jobSite?.name ?? '—'}</Td>
                  <Td>
                    <DateTimeCell value={log.clockInTime} />
                  </Td>
                  <Td>
                    <DateTimeCell value={log.clockOutTime} />
                  </Td>
                  <Td>
                    <Badge status={log.status} className="rounded-full normal-case tracking-normal" />
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
