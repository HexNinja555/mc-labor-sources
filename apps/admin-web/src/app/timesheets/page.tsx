'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTimesheetSchema, type CreateTimesheetInput } from '@mc-labor/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/layout/PageTitle';
import { BRAND_HERO_IMAGES } from '@/lib/navigation';
import {
  PortalFilterPanel,
  PortalRecordsPanel,
  PortalSummaryStat,
  portalFieldClassName,
  portalFormFieldClassName,
  PersonCell,
  HoursCell,
  YesNoCell,
  ActionCell,
} from '@/components/portal';
import { IconClipboard, IconClock, IconUsers } from '@/components/dashboard';
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
import { formatEmployeeName } from '@/lib/portal-stats';

export default function TimesheetsPage() {
  const [customerId, setCustomerId] = useState('');
  const [status, setStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [rollupOpen, setRollupOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [signOpen, setSignOpen] = useState(false);
  const [selected, setSelected] = useState<Timesheet | null>(null);
  const [foremanName, setForemanName] = useState('');
  const [foremanEmail, setForemanEmail] = useState('');
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [rollupEmployeeId, setRollupEmployeeId] = useState('');
  const [rollupCustomerId, setRollupCustomerId] = useState('');
  const [rollupJobSiteId, setRollupJobSiteId] = useState('');
  const [rollupWeekStart, setRollupWeekStart] = useState('');
  const [rollupWeekEnd, setRollupWeekEnd] = useState('');
  const queryClient = useQueryClient();

  const filters = useMemo(
    () => ({
      ...(customerId && { customerId }),
      ...(status && { status }),
    }),
    [customerId, status],
  );

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.getCustomers(),
  });

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => api.getEmployees({ status: 'ACTIVE' }),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['timesheets', filters],
    queryFn: () => api.getTimesheets(filters),
  });

  const stats = useMemo(() => {
    const sheets = data ?? [];
    return {
      total: sheets.length,
      signed: sheets.filter((t) => t.status === 'SIGNED' || t.status === 'SENT').length,
      draft: sheets.filter((t) => t.status === 'DRAFT').length,
      totalHours: sheets.reduce((sum, t) => sum + Number(t.totalHours || 0), 0).toFixed(1),
    };
  }, [data]);

  const form = useForm<CreateTimesheetInput>({
    resolver: zodResolver(createTimesheetSchema),
    defaultValues: {
      employeeId: '',
      customerId: '',
      jobSiteId: '',
      totalHours: 40,
    },
  });

  const watchCustomerId = form.watch('customerId');

  const { data: jobSites } = useQuery({
    queryKey: ['job-sites', watchCustomerId],
    queryFn: () => api.getJobSites({ customerId: watchCustomerId }),
    enabled: !!watchCustomerId,
  });

  const { data: rollupJobSites } = useQuery({
    queryKey: ['job-sites', rollupCustomerId],
    queryFn: () => api.getJobSites({ customerId: rollupCustomerId }),
    enabled: !!rollupCustomerId,
  });

  const createMutation = useMutation({
    mutationFn: (values: CreateTimesheetInput) => api.createTimesheet(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
      setModalOpen(false);
    },
  });

  const signMutation = useMutation({
    mutationFn: () =>
      api.signTimesheet(selected!.id, {
        foremanName,
        foremanEmail: foremanEmail || undefined,
        signatureDataUrl,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
      setSignOpen(false);
      setDetailOpen(false);
    },
  });

  const markSentMutation = useMutation({
    mutationFn: (flags: { sentToCustomerOffice?: boolean; sentToMcLaborOffice?: boolean }) =>
      api.markTimesheetSent(selected!.id, flags),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
      if (selected) {
        const updated = await api.getTimesheet(selected.id);
        setSelected(updated);
      }
    },
  });

  const rollupMutation = useMutation({
    mutationFn: () =>
      api.rollupWeeklyTimesheet({
        employeeId: rollupEmployeeId,
        customerId: rollupCustomerId,
        jobSiteId: rollupJobSiteId,
        weekStart: rollupWeekStart,
        weekEnd: rollupWeekEnd,
      }),
    onSuccess: async (ts) => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
      setRollupOpen(false);
      setSelected(ts);
      setDetailOpen(true);
    },
  });

  async function openDetail(ts: Timesheet) {
    const full = await api.getTimesheet(ts.id);
    setSelected(full);
    setDetailOpen(true);
  }

  return (
    <DashboardLayout heroTitle="Timesheets" heroImage={BRAND_HERO_IMAGES.timesheets}>
      <PageTitle
        title="Timesheets"
        description="View and manage employee timesheets"
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" icon="calendar" onClick={() => setRollupOpen(true)}>
              Generate from Attendance
            </Button>
            <Button icon="plus" onClick={() => setModalOpen(true)}>Add Timesheet</Button>
          </div>
        }
      />

      {data && data.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <PortalSummaryStat label="Total timesheets" value={stats.total} icon={<IconClipboard className="h-5 w-5" />} />
          <PortalSummaryStat
            label="Signed / sent"
            value={stats.signed}
            icon={<IconUsers className="h-5 w-5" />}
            accent="green"
          />
          <PortalSummaryStat
            label="Draft"
            value={stats.draft}
            icon={<IconClock className="h-5 w-5" />}
            accent="slate"
          />
          <PortalSummaryStat
            label="Total hours"
            value={stats.totalHours}
            icon={<IconClock className="h-5 w-5" />}
            accent="amber"
          />
        </div>
      )}

      <PortalFilterPanel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Customer">
            <Select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className={portalFieldClassName}
            >
              <option value="">All customers</option>
              {customers?.map((c) => (
                <option key={c.id} value={c.id}>{c.companyName}</option>
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
        </div>
      </PortalFilterPanel>

      {isLoading && <LoadingState />}
      {!isLoading && data?.length === 0 && (
        <EmptyState title="No timesheets found" description="Create a timesheet for an employee and job site." />
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
                <Th>Sent to Office</Th>
                <ThActions />
              </tr>
            </thead>
            <tbody>
              {data.map((ts) => (
                <tr key={ts.id}>
                  <Td>
                    <PersonCell
                      name={formatEmployeeName(ts.employee)}
                    />
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
                    <YesNoCell value={!!ts.signature?.sentToCustomerOffice} />
                  </Td>
                  <Td>
                    <ActionCell>
                      <Button
                        size="sm"
                        variant="softPrimary"
                        icon="eye"
                        onClick={() => openDetail(ts)}
                      >
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Timesheet"
        subtitle="Create a manual timesheet entry"
        icon="plus"
        tone="success"
        size="lg"
      >
        <form onSubmit={form.handleSubmit((v) => createMutation.mutate(v))} className="space-y-4">
          <FormField label="Employee" error={form.formState.errors.employeeId?.message}>
            <Select {...form.register('employeeId')} className={portalFormFieldClassName}>
              <option value="">Select employee</option>
              {employees?.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.firstName} {e.lastName}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Customer" error={form.formState.errors.customerId?.message}>
            <Select {...form.register('customerId')} className={portalFormFieldClassName}>
              <option value="">Select customer</option>
              {customers?.map((c) => (
                <option key={c.id} value={c.id}>{c.companyName}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Job Site" error={form.formState.errors.jobSiteId?.message}>
            <Select {...form.register('jobSiteId')} className={portalFormFieldClassName}>
              <option value="">Select job site</option>
              {jobSites?.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Total Hours" error={form.formState.errors.totalHours?.message}>
            <Input
              type="number"
              step="0.5"
              {...form.register('totalHours', { valueAsNumber: true })}
              className={portalFormFieldClassName}
            />
          </FormField>
          <FormField label="Work Date">
            <Input type="date" {...form.register('workDate')} className={portalFormFieldClassName} />
          </FormField>
          <ModalFooter>
            <Button type="button" variant="secondary" icon="cancel" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" icon="save" loading={createMutation.isPending}>Create</Button>
          </ModalFooter>
        </form>
      </Modal>

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Timesheet Detail"
        subtitle="Review hours, entries, and signature"
        icon="eye"
        size="lg"
      >
        {selected && (
          <div className="space-y-5">
            <div className="rounded-xl border border-gray-100 bg-slate-50/80 px-4 py-3 text-sm text-slate-700">
              <span className="font-semibold">{formatEmployeeName(selected.employee)}</span>
              {' · '}
              {selected.jobSite?.name}
              {' · '}
              <span className="font-semibold text-primary">{selected.totalHours}h</span>
              {selected.weekStartDate && selected.weekEndDate ? (
                <span className="text-gray-500">
                  {' '}
                  · Week {selected.weekStartDate} – {selected.weekEndDate}
                </span>
              ) : selected.workDate ? (
                <span className="text-gray-500"> · {selected.workDate}</span>
              ) : null}
            </div>
            {selected.entries && selected.entries.length > 0 && (
              <div className="rounded-xl border border-gray-100 bg-white p-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-widest text-gray-500">
                  Time entries
                </p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500">
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Start</th>
                      <th className="pb-2">End</th>
                      <th className="pb-2">Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.entries.map((entry) => (
                      <tr key={entry.id} className="border-t border-gray-50">
                        <td className="py-2">{entry.workDate}</td>
                        <td className="py-2">{entry.startTime}</td>
                        <td className="py-2">{entry.endTime}</td>
                        <td className="py-2 font-medium">{entry.hours}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {selected.signature?.signatureImageUrl && (
              <div className="rounded-xl border border-gray-100 bg-white p-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-gray-500">Signature</p>
                <img
                  src={selected.signature.signatureImageUrl}
                  alt="Signature"
                  className="max-h-32 rounded-lg border border-gray-100"
                />
              </div>
            )}
            <ModalFooter>
              {selected.status !== 'SIGNED' && selected.status !== 'SENT' && (
                <Button icon="signature" onClick={() => setSignOpen(true)}>Sign Timesheet</Button>
              )}
              {selected.signature && (
                <>
                  <Button
                    variant="secondary"
                    icon="send"
                    onClick={() => markSentMutation.mutate({ sentToCustomerOffice: true })}
                  >
                    Mark sent to customer
                  </Button>
                  <Button
                    variant="secondary"
                    icon="send"
                    onClick={() => markSentMutation.mutate({ sentToMcLaborOffice: true })}
                  >
                    Mark sent to MC Labor
                  </Button>
                </>
              )}
            </ModalFooter>
          </div>
        )}
      </Modal>

      <Modal
        open={rollupOpen}
        onClose={() => setRollupOpen(false)}
        title="Generate from Attendance"
        subtitle="Roll up daily drafts into a weekly timesheet"
        icon="calendar"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Roll up daily draft timesheets from attendance into a weekly timesheet.
          </p>
          <FormField label="Employee">
            <Select
              value={rollupEmployeeId}
              onChange={(e) => setRollupEmployeeId(e.target.value)}
              className={portalFormFieldClassName}
            >
              <option value="">Select employee</option>
              {employees?.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.firstName} {e.lastName}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Customer">
            <Select
              value={rollupCustomerId}
              onChange={(e) => {
                setRollupCustomerId(e.target.value);
                setRollupJobSiteId('');
              }}
              className={portalFormFieldClassName}
            >
              <option value="">Select customer</option>
              {customers?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Job Site">
            <Select
              value={rollupJobSiteId}
              onChange={(e) => setRollupJobSiteId(e.target.value)}
              className={portalFormFieldClassName}
            >
              <option value="">Select job site</option>
              {rollupJobSites?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Week start">
              <Input
                type="date"
                value={rollupWeekStart}
                onChange={(e) => setRollupWeekStart(e.target.value)}
                className={portalFormFieldClassName}
              />
            </FormField>
            <FormField label="Week end">
              <Input
                type="date"
                value={rollupWeekEnd}
                onChange={(e) => setRollupWeekEnd(e.target.value)}
                className={portalFormFieldClassName}
              />
            </FormField>
          </div>
          <ModalFooter>
            <Button type="button" variant="secondary" icon="cancel" onClick={() => setRollupOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              icon="calendar"
              onClick={() => rollupMutation.mutate()}
              loading={rollupMutation.isPending}
              disabled={
                !rollupEmployeeId ||
                !rollupCustomerId ||
                !rollupJobSiteId ||
                !rollupWeekStart ||
                !rollupWeekEnd
              }
            >
              Generate Timesheet
            </Button>
          </ModalFooter>
        </div>
      </Modal>

      <Modal
        open={signOpen}
        onClose={() => setSignOpen(false)}
        title="Sign Timesheet"
        subtitle="Capture foreman signature and contact details"
        icon="signature"
      >
        <div className="space-y-4">
          <FormField label="Foreman Name">
            <Input value={foremanName} onChange={(e) => setForemanName(e.target.value)} className={portalFormFieldClassName} />
          </FormField>
          <FormField label="Foreman Email">
            <Input
              type="email"
              value={foremanEmail}
              onChange={(e) => setForemanEmail(e.target.value)}
              className={portalFormFieldClassName}
            />
          </FormField>
          <FormField label="Signature">
            <SignaturePad onChange={setSignatureDataUrl} />
          </FormField>
          <ModalFooter>
            <Button
              icon="save"
              onClick={() => signMutation.mutate()}
              loading={signMutation.isPending}
              disabled={!foremanName || !signatureDataUrl}
            >
              Save Signature
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
