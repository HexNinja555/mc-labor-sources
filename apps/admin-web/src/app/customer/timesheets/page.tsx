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
  PersonCell,
  HoursCell,
  YesNoCell,
  ActionCell,
  TimesheetDetailModal,
} from '@/components/portal';
import { IconClipboard, IconClock, IconUsers } from '@/components/dashboard';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { Table, Th, Td, ThActions } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatEmployeeName, getTimesheetStats } from '@/lib/portal-stats';
import { api, type Timesheet } from '@/lib/api-client';

export default function CustomerTimesheetsPage() {
  const [status, setStatus] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Timesheet | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['customer-timesheets'],
    queryFn: () => api.getCustomerPortalTimesheets(),
  });

  const filtered = useMemo(() => {
    const list = data ?? [];
    if (!status) return list;
    return list.filter((ts) => ts.status === status);
  }, [data, status]);

  const stats = useMemo(() => getTimesheetStats(data ?? []), [data]);

  async function openDetail(ts: Timesheet) {
    const full = await api.getTimesheet(ts.id);
    setSelected(full);
    setDetailOpen(true);
  }

  return (
    <CustomerLayout heroTitle="Timesheets" heroImage={BRAND_HERO_IMAGES.timesheets}>
      <BrandPageTitle title="Timesheets" description="Signed timesheets for your job sites" />

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

      <PortalFilterPanel>
        <div className="max-w-sm">
          <FormField label="Status">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={portalFieldClassName}
            >
              <option value="">All statuses</option>
              <option value="SIGNED">Signed</option>
              <option value="SENT">Sent</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="DRAFT">Draft</option>
            </Select>
          </FormField>
        </div>
      </PortalFilterPanel>

      {isLoading && <LoadingState />}
      {!isLoading && filtered.length === 0 && <EmptyState title="No timesheets match your filters" />}
      {filtered.length > 0 && (
        <PortalRecordsPanel
          title="Timesheet records"
          description="Approved hours and foreman signatures for your sites"
          count={filtered.length}
          countLabel="timesheets"
        >
          <Table hasActions>
            <thead>
              <tr>
                <Th>Employee</Th>
                <Th>Job Site</Th>
                <Th>Total Hours</Th>
                <Th>Foreman</Th>
                <Th>Status</Th>
                <Th>Sent to Office</Th>
                <ThActions />
              </tr>
            </thead>
            <tbody>
              {filtered.map((timesheet) => (
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
                  <Td>
                    <ActionCell>
                      <Button size="sm" variant="softPrimary" icon="eye" onClick={() => openDetail(timesheet)}>
                        View
                      </Button>
                    </ActionCell>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </PortalRecordsPanel>
      )}

      <TimesheetDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        timesheet={selected}
      />
    </CustomerLayout>
  );
}
