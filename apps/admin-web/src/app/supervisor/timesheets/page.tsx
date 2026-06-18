'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signTimesheetSchema, type SignTimesheetInput } from '@mc-labor/shared';
import { SupervisorLayout } from '@/components/layout/SupervisorLayout';
import { BrandPageTitle } from '@/components/brand';
import { BRAND_HERO_IMAGES } from '@/lib/navigation';
import {
  PortalFilterPanel,
  PortalRecordsPanel,
  PortalSummaryStat,
  portalFieldClassName,
  PersonCell,
  HoursCell,
  ActionCell,
  TimesheetDetailModal,
} from '@/components/portal';
import { IconClipboard, IconClock } from '@/components/dashboard';
import { SignaturePad } from '@/components/ui/SignaturePad';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Table, Th, Td, ThActions } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { api, type Timesheet } from '@/lib/api-client';
import { formatEmployeeName, getTimesheetStats } from '@/lib/portal-stats';

export default function SupervisorTimesheetsPage() {
  const [status, setStatus] = useState('');
  const [jobSiteId, setJobSiteId] = useState('');
  const [pendingOnly, setPendingOnly] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [signOpen, setSignOpen] = useState(false);
  const [selected, setSelected] = useState<Timesheet | null>(null);
  const queryClient = useQueryClient();

  const signForm = useForm<SignTimesheetInput>({
    resolver: zodResolver(signTimesheetSchema),
    defaultValues: { foremanName: '', foremanEmail: '', signatureDataUrl: '' },
  });

  const { data: jobSites } = useQuery({
    queryKey: ['supervisor-job-sites'],
    queryFn: () => api.getSupervisorPortalJobSites(),
  });

  const filters = useMemo(
    () => ({
      ...(status && { status }),
      ...(jobSiteId && { jobSiteId }),
      ...(pendingOnly && { pendingOnly: true }),
    }),
    [status, jobSiteId, pendingOnly],
  );

  const { data, isLoading } = useQuery({
    queryKey: ['supervisor-timesheets', filters],
    queryFn: () => api.getSupervisorPortalTimesheets(filters),
  });

  const stats = useMemo(() => getTimesheetStats(data ?? []), [data]);

  const signMutation = useMutation({
    mutationFn: (values: SignTimesheetInput) =>
      api.signTimesheet(selected!.id, {
        foremanName: values.foremanName,
        foremanEmail: values.foremanEmail || undefined,
        signatureDataUrl: values.signatureDataUrl,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supervisor-timesheets'] });
      queryClient.invalidateQueries({ queryKey: ['supervisor-dashboard'] });
      setSignOpen(false);
      setDetailOpen(false);
      setSelected(null);
      signForm.reset();
    },
  });

  async function openDetail(ts: Timesheet) {
    const full = await api.getTimesheet(ts.id);
    setSelected(full);
    setDetailOpen(true);
  }

  function openSignFromDetail() {
    setDetailOpen(false);
    signForm.reset({ foremanName: '', foremanEmail: '', signatureDataUrl: '' });
    setSignOpen(true);
  }

  return (
    <SupervisorLayout heroTitle="Timesheets" heroImage={BRAND_HERO_IMAGES.timesheets}>
      <BrandPageTitle title="Timesheets" description="Review and sign timesheets for your sites" />

      {data && data.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <PortalSummaryStat label="Total" value={stats.total} icon={<IconClipboard className="h-5 w-5" />} />
          <PortalSummaryStat
            label="Signed"
            value={stats.signed}
            icon={<IconClipboard className="h-5 w-5" />}
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
            icon={<IconClock className="h-5 w-5" />}
            accent="slate"
          />
        </div>
      )}

      <PortalFilterPanel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="SIGNED">Signed</option>
              <option value="SENT">Sent</option>
            </Select>
          </FormField>
          <FormField label="Quick filter">
            <label className="flex h-[42px] items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-4 text-sm text-slate-700 shadow-sm">
              <input
                type="checkbox"
                checked={pendingOnly}
                onChange={(e) => setPendingOnly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary"
              />
              Pending signature only
            </label>
          </FormField>
        </div>
      </PortalFilterPanel>

      {isLoading && <LoadingState />}
      {!isLoading && data?.length === 0 && (
        <EmptyState title="No timesheets found" description="Timesheets for your assigned sites appear here." />
      )}
      {data && data.length > 0 && (
        <PortalRecordsPanel title="Timesheet records" count={data.length} countLabel="timesheets">
          <Table hasActions>
            <thead>
              <tr>
                <Th>Employee</Th>
                <Th>Job Site</Th>
                <Th>Hours</Th>
                <Th>Foreman</Th>
                <Th>Status</Th>
                <ThActions />
              </tr>
            </thead>
            <tbody>
              {data.map((ts) => (
                <tr key={ts.id}>
                  <Td>
                    <PersonCell name={formatEmployeeName(ts.employee)} />
                  </Td>
                  <Td>{ts.jobSite?.name}</Td>
                  <Td>
                    <HoursCell value={ts.totalHours} />
                  </Td>
                  <Td>{ts.signature?.foremanName ?? '—'}</Td>
                  <Td>
                    <Badge status={ts.status} className="rounded-full normal-case" />
                  </Td>
                  <Td>
                    <ActionCell>
                      <Button size="sm" variant="softPrimary" icon="eye" onClick={() => openDetail(ts)}>
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
        showSignAction
        onSign={openSignFromDetail}
      />

      <Modal
        open={signOpen}
        onClose={() => setSignOpen(false)}
        title="Sign Timesheet"
        subtitle="Capture foreman signature for this timesheet"
        icon="signature"
      >
        <form
          className="space-y-4"
          onSubmit={signForm.handleSubmit((values) => signMutation.mutate(values))}
        >
          <FormField label="Foreman Name">
            <Input {...signForm.register('foremanName')} className={portalFieldClassName} />
          </FormField>
          <FormField label="Foreman Email">
            <Input type="email" {...signForm.register('foremanEmail')} className={portalFieldClassName} />
          </FormField>
          <FormField label="Signature">
            <SignaturePad
              onChange={(url) => signForm.setValue('signatureDataUrl', url, { shouldValidate: true })}
            />
          </FormField>
          <ModalFooter>
            <Button variant="secondary" icon="cancel" type="button" onClick={() => setSignOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" icon="save" loading={signMutation.isPending}>
              Save Signature
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </SupervisorLayout>
  );
}
