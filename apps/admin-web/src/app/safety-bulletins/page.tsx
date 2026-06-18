'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafetyAudience, createSafetyBulletinSchema } from '@mc-labor/shared';
import type { z } from 'zod';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BrandPageTitle } from '@/components/brand';
import { BRAND_HERO_IMAGES } from '@/lib/navigation';
import {
  PortalRecordsPanel,
  PortalSummaryStat,
  portalFormFieldClassName,
  TitleCell,
  ActionCell,
} from '@/components/portal';
import { IconShield, IconBell } from '@/components/dashboard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { Table, Th, Td, ThActions } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { api, type SafetyBulletin } from '@/lib/api-client';

type SafetyBulletinFormInput = z.infer<typeof createSafetyBulletinSchema>;

export default function SafetyBulletinsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<SafetyBulletinFormInput>({
    resolver: zodResolver(createSafetyBulletinSchema),
    defaultValues: {
      title: '',
      message: '',
      audience: SafetyAudience.ALL_EMPLOYEES,
      jobSiteId: '',
      employeeIds: [],
    },
  });

  const audience = form.watch('audience');
  const employeeIds = form.watch('employeeIds') ?? [];

  const { data, isLoading } = useQuery({
    queryKey: ['safety-bulletins'],
    queryFn: () => api.getSafetyBulletins(),
  });

  const { data: jobSites } = useQuery({
    queryKey: ['job-sites'],
    queryFn: () => api.getJobSites(),
  });

  const { data: employees } = useQuery({
    queryKey: ['employees-active'],
    queryFn: () => api.getEmployees({ status: 'ACTIVE' }),
  });

  const stats = useMemo(() => {
    const bulletins = data ?? [];
    return {
      total: bulletins.length,
      sent: bulletins.filter((b) => b.sentAt).length,
      draft: bulletins.filter((b) => !b.sentAt).length,
    };
  }, [data]);

  const canCreate = form.formState.isValid;

  const createMutation = useMutation({
    mutationFn: (values: SafetyBulletinFormInput) =>
      api.createSafetyBulletin({
        title: values.title,
        message: values.message,
        audience: values.audience,
        jobSiteId:
          values.audience === SafetyAudience.SPECIFIC_JOB_SITE ? values.jobSiteId : undefined,
        employeeIds:
          values.audience === SafetyAudience.SPECIFIC_WORKERS ? values.employeeIds : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safety-bulletins'] });
      setModalOpen(false);
      form.reset({
        title: '',
        message: '',
        audience: SafetyAudience.ALL_EMPLOYEES,
        jobSiteId: '',
        employeeIds: [],
      });
    },
  });

  const sendMutation = useMutation({
    mutationFn: (id: string) => api.sendSafetyBulletin(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['safety-bulletins'] }),
  });

  function toggleEmployee(id: string) {
    const next = employeeIds.includes(id)
      ? employeeIds.filter((x) => x !== id)
      : [...employeeIds, id];
    form.setValue('employeeIds', next, { shouldValidate: true });
  }

  function formatRecipients(bulletin: SafetyBulletin) {
    if (!bulletin) return '—';
    if (bulletin.audience === 'SPECIFIC_WORKERS' && bulletin.recipientEmployees?.length) {
      const names = bulletin.recipientEmployees
        .map((e) => `${e.firstName} ${e.lastName}`)
        .slice(0, 2)
        .join(', ');
      const extra =
        bulletin.recipientEmployees.length > 2
          ? ` +${bulletin.recipientEmployees.length - 2}`
          : '';
      return names + extra;
    }
    return bulletin.jobSite?.name ?? '—';
  }

  return (
    <DashboardLayout heroTitle="Safety Bulletins" heroImage={BRAND_HERO_IMAGES.inner}>
      <BrandPageTitle
        title="Safety Bulletins"
        description="Send safety notices to employees"
        action={<Button icon="plus" onClick={() => setModalOpen(true)}>Create Bulletin</Button>}
      />

      {data && data.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
          <PortalSummaryStat label="Total bulletins" value={stats.total} icon={<IconShield className="h-5 w-5" />} />
          <PortalSummaryStat
            label="Sent"
            value={stats.sent}
            icon={<IconBell className="h-5 w-5" />}
            accent="green"
          />
          <PortalSummaryStat
            label="Draft"
            value={stats.draft}
            icon={<IconShield className="h-5 w-5" />}
            accent="slate"
          />
        </div>
      )}

      {isLoading && <LoadingState />}
      {!isLoading && data?.length === 0 && (
        <EmptyState title="No safety bulletins" description="Create and send safety notices to your workforce." />
      )}
      {data && data.length > 0 && (
        <PortalRecordsPanel title="Safety bulletins" count={data.length} countLabel="bulletins">
          <Table hasActions>
            <thead>
              <tr>
                <Th>Bulletin</Th>
                <Th>Audience</Th>
                <Th>Target</Th>
                <Th>Status</Th>
                <ThActions />
              </tr>
            </thead>
            <tbody>
              {data.map((bulletin) => (
                <tr key={bulletin.id}>
                  <Td>
                    <TitleCell
                      title={bulletin.title}
                      subtitle={bulletin.message.slice(0, 80) + (bulletin.message.length > 80 ? '…' : '')}
                    />
                  </Td>
                  <Td>{bulletin.audience.replace(/_/g, ' ')}</Td>
                  <Td>{formatRecipients(bulletin)}</Td>
                  <Td>
                    {bulletin.sentAt ? (
                      <Badge status="SENT" className="rounded-full normal-case" />
                    ) : (
                      <Badge status="DRAFT" className="rounded-full normal-case" />
                    )}
                  </Td>
                  <Td>
                    {!bulletin.sentAt && (
                      <ActionCell>
                        <Button
                          size="sm"
                          variant="softPrimary"
                          icon="send"
                          onClick={() => sendMutation.mutate(bulletin.id)}
                          loading={sendMutation.isPending}
                        >
                          Send
                        </Button>
                      </ActionCell>
                    )}
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
        title="Create Safety Bulletin"
        subtitle="Draft a safety notice for your workforce"
        icon="bell"
        tone="success"
        size="lg"
      >
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}
        >
          <FormField label="Title">
            <Input {...form.register('title')} className={portalFormFieldClassName} />
          </FormField>
          <FormField label="Message">
            <Textarea {...form.register('message')} rows={4} className={portalFormFieldClassName} />
          </FormField>
          <FormField label="Audience">
            <Select
              {...form.register('audience')}
              onChange={(e) => {
                form.setValue('audience', e.target.value as SafetyAudience, { shouldValidate: true });
                form.setValue('jobSiteId', '');
                form.setValue('employeeIds', []);
              }}
              className={portalFormFieldClassName}
            >
              {Object.values(SafetyAudience).map((a) => (
                <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
              ))}
            </Select>
          </FormField>
          {audience === SafetyAudience.SPECIFIC_JOB_SITE && (
            <FormField label="Job Site">
              <Select {...form.register('jobSiteId')} className={portalFormFieldClassName}>
                <option value="">Select job site</option>
                {jobSites?.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
            </FormField>
          )}
          {audience === SafetyAudience.SPECIFIC_WORKERS && (
            <FormField label="Workers">
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3">
                {employees?.map((emp) => (
                  <label key={emp.id} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={employeeIds.includes(emp.id)}
                      onChange={() => toggleEmployee(emp.id)}
                      className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    {emp.firstName} {emp.lastName}
                  </label>
                ))}
                {!employees?.length ? (
                  <p className="text-sm text-slate-500">No active employees found.</p>
                ) : null}
              </div>
            </FormField>
          )}
          <ModalFooter>
            <Button variant="secondary" icon="cancel" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              icon="save"
              loading={createMutation.isPending}
              disabled={!canCreate}
            >
              Create
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
