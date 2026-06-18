'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BrandPageTitle } from '@/components/brand';
import { BRAND_HERO_IMAGES } from '@/lib/navigation';
import {
  PortalFilterPanel,
  PortalRecordsPanel,
  PortalSummaryStat,
  portalFieldClassName,
  DateTimeCell,
  PersonCell,
  HoursCell,
  GpsLocationCell,
} from '@/components/portal';
import { IconBuilding, IconClock, IconUsers } from '@/components/dashboard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { Table, Th, Td } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatEmployeeName, getAttendanceStats } from '@/lib/portal-stats';
import { api } from '@/lib/api-client';
import { attendanceFilterSchema } from '@mc-labor/shared';
import { downloadCsv } from '@/lib/export-csv';

export default function AttendancePage() {
  const [date, setDate] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [jobSiteId, setJobSiteId] = useState('');

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => api.getEmployees(),
  });

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.getCustomers(),
  });

  const { data: jobSites } = useQuery({
    queryKey: ['job-sites', customerId],
    queryFn: () => api.getJobSites({ customerId }),
    enabled: !!customerId,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['attendance', date, employeeId, customerId, jobSiteId],
    queryFn: () => {
      const filters = attendanceFilterSchema.parse({
        ...(date && { date }),
        ...(employeeId && { employeeId }),
        ...(customerId && { customerId }),
        ...(jobSiteId && { jobSiteId }),
      });
      return api.getAttendance(filters);
    },
  });

  const stats = useMemo(() => getAttendanceStats(data ?? []), [data]);

  function exportAttendance() {
    if (!data?.length) return;
    downloadCsv(
      `attendance-${date || 'all'}.csv`,
      ['Employee', 'Customer', 'Job Site', 'Clock In', 'Clock Out', 'Hours', 'Status'],
      data.map((log) => [
        formatEmployeeName(log.employee),
        log.customer?.companyName ?? '',
        log.jobSite?.name ?? '',
        log.clockInTime ? new Date(log.clockInTime).toLocaleString() : '',
        log.clockOutTime ? new Date(log.clockOutTime).toLocaleString() : '',
        String(log.totalHours ?? ''),
        log.status,
      ]),
    );
  }

  return (
    <DashboardLayout heroTitle="Attendance" heroImage={BRAND_HERO_IMAGES.attendance}>
      <BrandPageTitle title="Attendance" description="View clock-in and clock-out records" />

      {data && data.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
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
          <PortalSummaryStat
            label="Total hours"
            value={stats.totalHours}
            icon={<IconBuilding className="h-5 w-5" />}
            accent="amber"
          />
        </div>
      )}

      <PortalFilterPanel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <FormField label="Date">
            <Input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={portalFieldClassName}
            />
          </FormField>
          <FormField label="Employee">
            <Select
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
              className={portalFieldClassName}
            >
              <option value="">All employees</option>
              {employees?.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Customer">
            <Select
              value={customerId}
              onChange={(event) => {
                setCustomerId(event.target.value);
                setJobSiteId('');
              }}
              className={portalFieldClassName}
            >
              <option value="">All customers</option>
              {customers?.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.companyName}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Job Site">
            <Select
              value={jobSiteId}
              onChange={(event) => setJobSiteId(event.target.value)}
              className={portalFieldClassName}
            >
              <option value="">All job sites</option>
              {jobSites?.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
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
      {!isLoading && data && data.length === 0 && <EmptyState title="No attendance records" />}
      {data && data.length > 0 && (
        <PortalRecordsPanel
          title="Attendance records"
          description="Live clock-in and clock-out activity across job sites"
          count={data.length}
        >
          <Table>
            <thead>
              <tr>
                <Th>Employee</Th>
                <Th>Customer</Th>
                <Th>Job Site</Th>
                <Th>Clock In</Th>
                <Th>Clock Out</Th>
                <Th>Hours</Th>
                <Th>GPS In</Th>
                <Th>GPS Out</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {data.map((log) => (
                <tr key={log.id}>
                  <Td>
                    <PersonCell name={formatEmployeeName(log.employee)} />
                  </Td>
                  <Td>{log.customer?.companyName ?? '—'}</Td>
                  <Td className="font-medium text-slate-700">{log.jobSite?.name ?? '—'}</Td>
                  <Td>
                    <DateTimeCell value={log.clockInTime} />
                  </Td>
                  <Td>
                    <DateTimeCell value={log.clockOutTime} />
                  </Td>
                  <Td>
                    <HoursCell value={log.totalHours} />
                  </Td>
                  <Td>
                    <GpsLocationCell
                      lat={log.clockInLatitude}
                      lng={log.clockInLongitude}
                      label={log.clockInLocationLabel}
                    />
                  </Td>
                  <Td>
                    <GpsLocationCell
                      lat={log.clockOutLatitude}
                      lng={log.clockOutLongitude}
                      label={log.clockOutLocationLabel}
                    />
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
    </DashboardLayout>
  );
}
