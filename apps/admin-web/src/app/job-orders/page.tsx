'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createJobOrderSchema, JobOrderStatus, type CreateJobOrderInput } from '@mc-labor/shared';
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
  DateTimeCell,
  TitleCell,
  ActionCell,
} from '@/components/portal';
import { IconBriefcase, IconClipboard, IconClock } from '@/components/dashboard';
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
import { api, type JobOrder } from '@/lib/api-client';

export default function JobOrdersPage() {
  const [customerId, setCustomerId] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<JobOrder | null>(null);
  const queryClient = useQueryClient();

  const filters = useMemo(
    () => ({
      ...(customerId && { customerId }),
      ...(status && { status }),
      ...(search && { search }),
    }),
    [customerId, status, search],
  );

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.getCustomers(),
  });

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => api.getEmployees({ status: 'ACTIVE' }),
  });

  const { data: jobSites } = useQuery({
    queryKey: ['job-sites', customerId],
    queryFn: () => api.getJobSites({ customerId }),
    enabled: !!customerId,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['job-orders', filters],
    queryFn: () => api.getJobOrders(filters),
  });

  const stats = useMemo(() => {
    const orders = data ?? [];
    return {
      total: orders.length,
      draft: orders.filter((o) => o.status === 'DRAFT').length,
      sent: orders.filter((o) => o.status === 'SENT').length,
      acknowledged: orders.filter((o) => o.status === 'ACKNOWLEDGED').length,
    };
  }, [data]);

  const form = useForm<CreateJobOrderInput>({
    resolver: zodResolver(createJobOrderSchema),
    defaultValues: {
      orderNumber: '',
      customerId: '',
      jobSiteId: '',
      title: '',
      startDate: new Date().toISOString().slice(0, 10),
      status: JobOrderStatus.DRAFT,
    },
  });

  const watchCustomerId = form.watch('customerId');

  const { data: modalJobSites } = useQuery({
    queryKey: ['job-sites', watchCustomerId],
    queryFn: () => api.getJobSites({ customerId: watchCustomerId }),
    enabled: !!watchCustomerId,
  });

  const saveMutation = useMutation({
    mutationFn: async (values: CreateJobOrderInput) => {
      const payload = {
        orderNumber: values.orderNumber,
        customerId: values.customerId,
        jobSiteId: values.jobSiteId,
        employeeId: values.employeeId || null,
        title: values.title,
        description: values.description,
        startDate: values.startDate,
        startTime: values.startTime,
        requiredPosition: values.requiredPosition,
        instructions: values.instructions,
        safetyNotes: values.safetyNotes,
        status: values.status,
      };
      if (editing) return api.updateJobOrder(editing.id, payload);
      return api.createJobOrder(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setModalOpen(false);
      setEditing(null);
    },
  });

  const sendMutation = useMutation({
    mutationFn: (id: string) => api.sendJobOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  function openCreate() {
    setEditing(null);
    form.reset({
      orderNumber: `JO-${Date.now().toString().slice(-6)}`,
      customerId: '',
      jobSiteId: '',
      title: '',
      startDate: new Date().toISOString().slice(0, 10),
      status: JobOrderStatus.DRAFT,
    });
    setModalOpen(true);
  }

  function openEdit(order: JobOrder) {
    setEditing(order);
    form.reset({
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      jobSiteId: order.jobSiteId,
      employeeId: order.employeeId ?? undefined,
      title: order.title,
      description: order.description ?? undefined,
      startDate: order.startDate,
      startTime: order.startTime ?? undefined,
      requiredPosition: order.requiredPosition ?? undefined,
      instructions: order.instructions ?? undefined,
      safetyNotes: order.safetyNotes ?? undefined,
      status: order.status as JobOrderStatus,
    });
    setModalOpen(true);
  }

  return (
    <DashboardLayout heroTitle="Job Orders" heroImage={BRAND_HERO_IMAGES.default}>
      <PageTitle
        title="Job Orders"
        description="Create and manage job orders for workers"
        action={<Button onClick={openCreate}>Add Job Order</Button>}
      />

      {data && data.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <PortalSummaryStat label="Total orders" value={stats.total} icon={<IconBriefcase className="h-5 w-5" />} />
          <PortalSummaryStat
            label="Draft"
            value={stats.draft}
            icon={<IconClipboard className="h-5 w-5" />}
            accent="slate"
          />
          <PortalSummaryStat
            label="Sent"
            value={stats.sent}
            icon={<IconClock className="h-5 w-5" />}
            accent="amber"
          />
          <PortalSummaryStat
            label="Acknowledged"
            value={stats.acknowledged}
            icon={<IconBriefcase className="h-5 w-5" />}
            accent="green"
          />
        </div>
      )}

      <PortalFilterPanel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField label="Search">
            <Input
              placeholder="Keywords"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={portalFieldClassName}
            />
          </FormField>
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
              {Object.values(JobOrderStatus).map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </Select>
          </FormField>
        </div>
      </PortalFilterPanel>

      {isLoading && <LoadingState />}
      {!isLoading && data?.length === 0 && (
        <EmptyState title="No job orders found" description="Create a job order and send it to a worker." />
      )}
      {data && data.length > 0 && (
        <PortalRecordsPanel title="Job orders" count={data.length} countLabel="orders">
          <Table>
            <thead>
              <tr>
                <Th>Order</Th>
                <Th>Customer</Th>
                <Th>Job Site</Th>
                <Th>Employee</Th>
                <Th>Status</Th>
                <Th>Sent</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {data.map((order) => (
                <tr key={order.id}>
                  <Td>
                    <TitleCell title={order.title} subtitle={order.orderNumber} />
                  </Td>
                  <Td className="font-medium text-slate-700">{order.customer?.companyName}</Td>
                  <Td>{order.jobSite?.name}</Td>
                  <Td>
                    {order.employee ? (
                      <PersonCell name={`${order.employee.firstName} ${order.employee.lastName}`} />
                    ) : (
                      <span className="text-gray-400">Unassigned</span>
                    )}
                  </Td>
                  <Td>
                    <Badge status={order.status} className="rounded-full normal-case" />
                  </Td>
                  <Td>
                    <DateTimeCell value={order.sentAt} />
                  </Td>
                  <Td>
                    <ActionCell>
                      <Button size="sm" variant="secondary" onClick={() => openEdit(order)}>
                        Edit
                      </Button>
                      {order.status === 'DRAFT' && (
                        <Button
                          size="sm"
                          onClick={() => sendMutation.mutate(order.id)}
                          loading={sendMutation.isPending}
                        >
                          Send
                        </Button>
                      )}
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
        title={editing ? 'Edit Job Order' : 'Add Job Order'}
        size="lg"
      >
        <form onSubmit={form.handleSubmit((v) => saveMutation.mutate(v))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Order Number" error={form.formState.errors.orderNumber?.message}>
              <Input {...form.register('orderNumber')} className={portalFormFieldClassName} />
            </FormField>
            <FormField label="Start Date" error={form.formState.errors.startDate?.message}>
              <Input type="date" {...form.register('startDate')} className={portalFormFieldClassName} />
            </FormField>
          </div>
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
              {(modalJobSites ?? jobSites)?.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Employee">
            <Select {...form.register('employeeId')} className={portalFormFieldClassName}>
              <option value="">Unassigned</option>
              {employees?.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.firstName} {e.lastName}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Title" error={form.formState.errors.title?.message}>
            <Input {...form.register('title')} className={portalFormFieldClassName} />
          </FormField>
          <FormField label="Description">
            <Textarea {...form.register('description')} rows={2} className={portalFormFieldClassName} />
          </FormField>
          <FormField label="Instructions">
            <Textarea {...form.register('instructions')} rows={2} className={portalFormFieldClassName} />
          </FormField>
          <FormField label="Safety Notes">
            <Textarea {...form.register('safetyNotes')} rows={2} className={portalFormFieldClassName} />
          </FormField>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saveMutation.isPending}>
              {editing ? 'Save' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
