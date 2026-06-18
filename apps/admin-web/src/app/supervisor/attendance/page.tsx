'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SupervisorLayout } from '@/components/layout/SupervisorLayout';
import { BrandPageTitle } from '@/components/brand';
import { BRAND_HERO_IMAGES } from '@/lib/navigation';
import {
  PortalFilterPanel,
  PortalRecordsPanel,
  PortalSummaryStat,
  portalFieldClassName,
  DateTimeCell,
  PersonCell,
  GpsLocationCell,
} from '@/components/portal';
import { IconClock, IconUsers } from '@/components/dashboard';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { Table, Th, Td } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { api } from '@/lib/api-client';
import { formatEmployeeName, getAttendanceStats } from '@/lib/portal-stats';
import { downloadCsv } from '@/lib/export-csv';

export default function SupervisorAttendancePage() {
  const [date, setDate] = useState('');
  const [jobSiteId, setJobSiteId] = useState('');
  const [status, setStatus] = useState('');

  const { data: jobSites } = useQuery({
    queryKey: ['supervisor-job-sites'],
    queryFn: () => api.getSupervisorPortalJobSites(),
  });

  const filters = useMemo(
    () => ({
      ...(date && { date }),
      ...(jobSiteId && { jobSiteId }),
      ...(status && { status }),
    }),
    [date, jobSiteId, status],
  );

  const { data, isLoading } = useQuery({
    queryKey: ['supervisor-attendance', filters],
    queryFn: () => api.getSupervisorPortalAttendance(filters),
  });

  const stats = useMemo(() => getAttendanceStats(data ?? []), [data]);

  function exportAttendance() {
    if (!data?.length) return;
    downloadCsv(
      `supervisor-attendance-${date || 'all'}.csv`,
      ['Employee', 'Job Site', 'Clock In', 'Clock Out', 'Status'],
      data.map((log) => [
        formatEmployeeName(log.employee),
        log.jobSite?.name ?? '',
        log.clockInTime ? new Date(log.clockInTime).toLocaleString() : '',
        log.clockOutTime ? new Date(log.clockOutTime).toLocaleString() : '',
        log.status,
      ]),
    );
  }

  return (
    <SupervisorLayout heroTitle="Attendance" heroImage={BRAND_HERO_IMAGES.attendance}>
      <BrandPageTitle title="Attendance" description="Clock-in activity on your assigned job sites" />

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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <FormField label="Date">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={portalFieldClassName}
            />
          </FormField>
          <FormField label="Job site">
            <Select
              value={jobSiteId}
              onChange={(e) => setJobSiteId(e.target.value)}
              className={portalFieldClassName}
            >
              <option value="">All assigned sites</option>
              {jobSites?.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Status">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={portalFieldClassName}
            >
              <option value="">All statuses</option>
              <option value="CLOCKED_IN">Clocked in</option>
              <option value="CLOCKED_OUT">Clocked out</option>
            </Select>
          </FormField>
          <div className="flex items-end">
            <Button variant="secondary" icon="download" disabled={!data?.length} onClick={exportAttendance}>
              Export CSV
            </Button>
          </div>
        </div>
      </PortalFilterPanel>

      {isLoading && <LoadingState />}
      {!isLoading && data?.length === 0 && <EmptyState title="No attendance records" />}
      {data && data.length > 0 && (
        <PortalRecordsPanel title="Attendance records" count={data.length}>
          <Table>
            <thead>
              <tr>
                <Th>Employee</Th>
                <Th>Job Site</Th>
                <Th>Clock In</Th>
                <Th>Clock Out</Th>
                <Th>Location</Th>
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
                    <GpsLocationCell
                      lat={log.clockInLatitude}
                      lng={log.clockInLongitude}
                      label={log.clockInLocationLabel}
                    />
                  </Td>
                  <Td>
                    <Badge status={log.status} className="rounded-full normal-case" />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </PortalRecordsPanel>
      )}
    </SupervisorLayout>
  );
}
