'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafetyAudience } from '@mc-labor/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/layout/PageTitle';
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
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { Table, Th, Td } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { api } from '@/lib/api-client';

export default function SafetyBulletinsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState<string>(SafetyAudience.ALL_EMPLOYEES);
  const [jobSiteId, setJobSiteId] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['safety-bulletins'],
    queryFn: () => api.getSafetyBulletins(),
  });

  const { data: jobSites } = useQuery({
    queryKey: ['job-sites'],
    queryFn: () => api.getJobSites(),
  });

  const stats = useMemo(() => {
    const bulletins = data ?? [];
    return {
      total: bulletins.length,
      sent: bulletins.filter((b) => b.sentAt).length,
      draft: bulletins.filter((b) => !b.sentAt).length,
    };
  }, [data]);

  const createMutation = useMutation({
    mutationFn: () =>
      api.createSafetyBulletin({
        title,
        message,
        audience,
        jobSiteId: audience === SafetyAudience.SPECIFIC_JOB_SITE ? jobSiteId : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safety-bulletins'] });
      setModalOpen(false);
      setTitle('');
      setMessage('');
    },
  });

  const sendMutation = useMutation({
    mutationFn: (id: string) => api.sendSafetyBulletin(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['safety-bulletins'] }),
  });

  return (
    <DashboardLayout heroTitle="Safety Bulletins" heroImage={BRAND_HERO_IMAGES.inner}>
      <PageTitle
        title="Safety Bulletins"
        description="Send safety notices to employees"
        action={<Button onClick={() => setModalOpen(true)}>Create Bulletin</Button>}
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
          <Table>
            <thead>
              <tr>
                <Th>Bulletin</Th>
                <Th>Audience</Th>
                <Th>Job Site</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
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
                  <Td>{bulletin.jobSite?.name ?? '—'}</Td>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Safety Bulletin" size="lg">
        <div className="space-y-4">
          <FormField label="Title">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className={portalFormFieldClassName} />
          </FormField>
          <FormField label="Message">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className={portalFormFieldClassName}
            />
          </FormField>
          <FormField label="Audience">
            <Select value={audience} onChange={(e) => setAudience(e.target.value)} className={portalFormFieldClassName}>
              {Object.values(SafetyAudience).map((a) => (
                <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
              ))}
            </Select>
          </FormField>
          {audience === SafetyAudience.SPECIFIC_JOB_SITE && (
            <FormField label="Job Site">
              <Select value={jobSiteId} onChange={(e) => setJobSiteId(e.target.value)} className={portalFormFieldClassName}>
                <option value="">Select job site</option>
                {jobSites?.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
            </FormField>
          )}
          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button
              onClick={() => createMutation.mutate()}
              loading={createMutation.isPending}
              disabled={!title || !message}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
