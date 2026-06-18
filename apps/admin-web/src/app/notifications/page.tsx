'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationType } from '@mc-labor/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BrandPageTitle } from '@/components/brand';
import { BRAND_HERO_IMAGES } from '@/lib/navigation';
import {
  PortalFilterPanel,
  PortalRecordsPanel,
  PortalSummaryStat,
  portalFieldClassName,
  portalFormFieldClassName,
  TitleCell,
  ActionCell,
} from '@/components/portal';
import { IconBell, IconClipboard } from '@/components/dashboard';
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
import { api } from '@/lib/api-client';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<string>(NotificationType.SYSTEM);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.getNotifications(),
  });

  const filtered = useMemo(() => {
    let items = data ?? [];
    if (typeFilter) items = items.filter((n) => n.type === typeFilter);
    if (statusFilter === 'unread') items = items.filter((n) => !n.readAt);
    if (statusFilter === 'read') items = items.filter((n) => !!n.readAt);
    return items;
  }, [data, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    const items = data ?? [];
    return {
      total: items.length,
      unread: items.filter((n) => !n.readAt).length,
    };
  }, [data]);

  const createMutation = useMutation({
    mutationFn: () => api.createNotification({ title, message, type }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setModalOpen(false);
      setTitle('');
      setMessage('');
    },
  });

  const readMutation = useMutation({
    mutationFn: (id: string) => api.markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <DashboardLayout heroTitle="Notifications" heroImage={BRAND_HERO_IMAGES.inner}>
      <BrandPageTitle
        title="Notifications"
        description="View system notifications"
        action={<Button icon="bell" onClick={() => setModalOpen(true)}>Create Notification</Button>}
      />

      {data && data.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-2">
          <PortalSummaryStat label="Total" value={stats.total} icon={<IconBell className="h-5 w-5" />} />
          <PortalSummaryStat
            label="Unread"
            value={stats.unread}
            icon={<IconClipboard className="h-5 w-5" />}
            accent="amber"
          />
        </div>
      )}

      <PortalFilterPanel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Type">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={portalFieldClassName}
            >
              <option value="">All types</option>
              {Object.values(NotificationType).map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Status">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={portalFieldClassName}
            >
              <option value="">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </Select>
          </FormField>
        </div>
      </PortalFilterPanel>

      {isLoading && <LoadingState />}
      {!isLoading && filtered.length === 0 && (
        <EmptyState title="No notifications" description="System alerts and worker notifications appear here." />
      )}
      {filtered.length > 0 && (
        <PortalRecordsPanel title="Notification inbox" count={filtered.length}>
          <Table hasActions>
            <thead>
              <tr>
                <Th>Notification</Th>
                <Th>Type</Th>
                <Th>Status</Th>
                <ThActions />
              </tr>
            </thead>
            <tbody>
              {filtered.map((n) => (
                <tr key={n.id} className={cn(!n.readAt && 'portal-row-unread')}>
                  <Td>
                    <TitleCell title={n.title} subtitle={n.message} />
                  </Td>
                  <Td>
                    <Badge status={n.type} className="rounded-full normal-case" />
                  </Td>
                  <Td>
                    {n.readAt ? (
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        Read
                      </span>
                    ) : (
                      <Badge status="PENDING" className="rounded-full normal-case" />
                    )}
                  </Td>
                  <Td>
                    {!n.readAt && (
                      <ActionCell>
                        <Button size="sm" variant="softPrimary" icon="check" onClick={() => readMutation.mutate(n.id)}>
                          Mark read
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
        title="Create Notification"
        subtitle="Send an alert to workers or supervisors"
        icon="bell"
        tone="success"
      >
        <div className="space-y-4">
          <FormField label="Title">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className={portalFormFieldClassName} />
          </FormField>
          <FormField label="Message">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className={portalFormFieldClassName}
            />
          </FormField>
          <FormField label="Type">
            <Select value={type} onChange={(e) => setType(e.target.value)} className={portalFormFieldClassName}>
              {Object.values(NotificationType).map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </Select>
          </FormField>
          <ModalFooter>
            <Button variant="secondary" icon="cancel" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button
              icon="send"
              onClick={() => createMutation.mutate()}
              loading={createMutation.isPending}
              disabled={!title || !message}
            >
              Create
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
