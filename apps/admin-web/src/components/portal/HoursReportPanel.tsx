'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  PortalFilterPanel,
  PortalRecordsPanel,
  portalFieldClassName,
  PersonCell,
  HoursCell,
} from '@/components/portal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { Table, Th, Td } from '@/components/ui/Table';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { api, type AdminHoursReportRow, type SupervisorHoursReportRow } from '@/lib/api-client';
import { downloadCsv } from '@/lib/export-csv';

type HoursReportPanelProps = {
  scope: 'supervisor' | 'admin';
  title?: string;
  description?: string;
};

export function HoursReportPanel({
  scope,
  title = 'Hours by worker',
  description = 'Roll up hours for the selected date range',
}: HoursReportPanelProps) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [jobSiteId, setJobSiteId] = useState('');
  const [customerId, setCustomerId] = useState('');

  const enabled = !!from && !!to;

  const { data: supervisorSites } = useQuery({
    queryKey: ['supervisor-job-sites'],
    queryFn: () => api.getSupervisorPortalJobSites(),
    enabled: scope === 'supervisor',
  });

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.getCustomers(),
    enabled: scope === 'admin',
  });

  const { data: adminJobSites } = useQuery({
    queryKey: ['job-sites', customerId],
    queryFn: () => api.getJobSites({ customerId }),
    enabled: scope === 'admin' && !!customerId,
  });

  const { data: allJobSites } = useQuery({
    queryKey: ['job-sites-all'],
    queryFn: () => api.getJobSites(),
    enabled: scope === 'admin' && !customerId,
  });

  const { data: supervisorRows, isLoading: supervisorLoading } = useQuery({
    queryKey: ['supervisor-hours-report', from, to, jobSiteId],
    queryFn: () =>
      api.getSupervisorHoursReport({
        from,
        to,
        jobSiteId: jobSiteId || undefined,
      }),
    enabled: scope === 'supervisor' && enabled,
  });

  const { data: adminRows, isLoading: adminLoading } = useQuery({
    queryKey: ['admin-hours-report', from, to, customerId, jobSiteId],
    queryFn: () =>
      api.getAdminHoursReport({
        from,
        to,
        customerId: customerId || undefined,
        jobSiteId: jobSiteId || undefined,
      }),
    enabled: scope === 'admin' && enabled,
  });

  const loading = scope === 'supervisor' ? supervisorLoading : adminLoading;
  const rows = scope === 'supervisor' ? supervisorRows : adminRows;

  function exportCsv() {
    if (!rows?.length) return;
    const prefix = scope === 'admin' ? 'admin-hours' : 'supervisor-hours';
    if (scope === 'admin') {
      const adminList = rows as AdminHoursReportRow[];
      downloadCsv(
        `${prefix}-${from}-${to}.csv`,
        ['Employee', 'Customer', 'Job Site', 'Total Hours', 'Timesheets'],
        adminList.map((row) => [
          `${row.firstName} ${row.lastName}`,
          row.companyName,
          row.jobSiteName,
          String(row.totalHours),
          String(row.timesheetCount),
        ]),
      );
    } else {
      const supList = rows as SupervisorHoursReportRow[];
      downloadCsv(
        `${prefix}-${from}-${to}.csv`,
        ['Employee', 'Job Site', 'Total Hours', 'Timesheets'],
        supList.map((row) => [
          `${row.firstName} ${row.lastName}`,
          row.jobSiteName,
          String(row.totalHours),
          String(row.timesheetCount),
        ]),
      );
    }
  }

  const siteOptions =
    scope === 'supervisor'
      ? supervisorSites
      : customerId
        ? adminJobSites
        : allJobSites;

  return (
    <div>
      <p className="mb-4 text-sm text-slate-600">{description}</p>
      <PortalFilterPanel>
        <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${scope === 'admin' ? 'xl:grid-cols-5' : 'xl:grid-cols-4'}`}>
          <FormField label="From">
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className={portalFieldClassName}
            />
          </FormField>
          <FormField label="To">
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className={portalFieldClassName}
            />
          </FormField>
          {scope === 'admin' ? (
            <FormField label="Customer">
              <Select
                value={customerId}
                onChange={(e) => {
                  setCustomerId(e.target.value);
                  setJobSiteId('');
                }}
                className={portalFieldClassName}
              >
                <option value="">All customers</option>
                {customers?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName}
                  </option>
                ))}
              </Select>
            </FormField>
          ) : null}
          <FormField label="Job site">
            <Select
              value={jobSiteId}
              onChange={(e) => setJobSiteId(e.target.value)}
              className={portalFieldClassName}
              disabled={scope === 'admin' && !!customerId && !adminJobSites?.length}
            >
              <option value="">
                {scope === 'admin' ? 'All job sites' : 'All assigned sites'}
              </option>
              {siteOptions?.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </Select>
          </FormField>
          <div className="flex items-end">
            <Button variant="secondary" icon="download" disabled={!rows?.length} onClick={exportCsv}>
              Export CSV
            </Button>
          </div>
        </div>
      </PortalFilterPanel>

      {loading && enabled ? <LoadingState /> : null}
      {enabled && rows && rows.length > 0 ? (
        <PortalRecordsPanel title={title} count={rows.length}>
          <Table>
            <thead>
              <tr>
                <Th>Employee</Th>
                {scope === 'admin' ? <Th>Customer</Th> : null}
                <Th>Job Site</Th>
                <Th>Total Hours</Th>
                <Th>Timesheets</Th>
              </tr>
            </thead>
            <tbody>
              {scope === 'admin'
                ? (rows as AdminHoursReportRow[]).map((row) => (
                    <tr key={`${row.employeeId}-${row.jobSiteId}`}>
                      <Td>
                        <PersonCell name={`${row.firstName} ${row.lastName}`} />
                      </Td>
                      <Td>{row.companyName}</Td>
                      <Td>{row.jobSiteName}</Td>
                      <Td>
                        <HoursCell value={row.totalHours} />
                      </Td>
                      <Td>{row.timesheetCount}</Td>
                    </tr>
                  ))
                : (rows as SupervisorHoursReportRow[]).map((row) => (
                    <tr key={`${row.employeeId}-${row.jobSiteId}`}>
                      <Td>
                        <PersonCell name={`${row.firstName} ${row.lastName}`} />
                      </Td>
                      <Td>{row.jobSiteName}</Td>
                      <Td>
                        <HoursCell value={row.totalHours} />
                      </Td>
                      <Td>{row.timesheetCount}</Td>
                    </tr>
                  ))}
            </tbody>
          </Table>
        </PortalRecordsPanel>
      ) : null}
      {enabled && !loading && rows?.length === 0 ? (
        <EmptyState title="No hours in this range" />
      ) : null}
    </div>
  );
}
