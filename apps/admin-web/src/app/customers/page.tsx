'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createCustomerSchema,
  createCustomerUserSchema,
  CustomerStatus,
  type CreateCustomerInput,
  type CreateCustomerUserInput,
} from '@mc-labor/shared';
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
  TitleCell,
  ActionCell,
} from '@/components/portal';
import { IconBuilding, IconUsers } from '@/components/dashboard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { FormField } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { Table, Th, Td } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { api, type Customer } from '@/lib/api-client';

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['customers', search],
    queryFn: () => api.getCustomers({ search }),
  });

  const filtered = useMemo(() => {
    let customers = data ?? [];
    if (statusFilter) {
      customers = customers.filter((c) => c.status === statusFilter);
    }
    return customers;
  }, [data, statusFilter]);

  const stats = useMemo(() => {
    const customers = data ?? [];
    return {
      total: customers.length,
      active: customers.filter((c) => c.status === 'ACTIVE').length,
      jobSites: customers.reduce((sum, c) => sum + (c._count?.jobSites ?? 0), 0),
    };
  }, [data]);

  const form = useForm<CreateCustomerInput>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: { companyName: '', status: CustomerStatus.ACTIVE },
  });

  const userForm = useForm<CreateCustomerUserInput>({
    resolver: zodResolver(createCustomerUserSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: CreateCustomerInput) => {
      const payload = {
        ...values,
        contactEmail: values.contactEmail || undefined,
        officeEmail: values.officeEmail || undefined,
      };
      if (editing) return api.updateCustomer(editing.id, payload);
      return api.createCustomer(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setModalOpen(false);
      setEditing(null);
    },
  });

  const createUserMutation = useMutation({
    mutationFn: (values: CreateCustomerUserInput) =>
      api.createCustomerUser(selectedCustomer!.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setUserModalOpen(false);
      userForm.reset();
    },
  });

  function openCreate() {
    setEditing(null);
    form.reset({ companyName: '', status: CustomerStatus.ACTIVE });
    setModalOpen(true);
  }

  function openEdit(c: Customer) {
    setEditing(c);
    form.reset({
      companyName: c.companyName,
      contactName: c.contactName || '',
      contactEmail: c.contactEmail || '',
      contactPhone: c.contactPhone || '',
      officeEmail: c.officeEmail || '',
      address: c.address || '',
      status: c.status as CustomerStatus,
    });
    setModalOpen(true);
  }

  return (
    <DashboardLayout heroTitle="Customers" heroImage={BRAND_HERO_IMAGES.default}>
      <PageTitle
        title="Customers"
        description="Manage customer companies and portal access"
        action={<Button onClick={openCreate}>Add Customer</Button>}
      />

      {data && data.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
          <PortalSummaryStat label="Total customers" value={stats.total} icon={<IconBuilding className="h-5 w-5" />} />
          <PortalSummaryStat
            label="Active"
            value={stats.active}
            icon={<IconUsers className="h-5 w-5" />}
            accent="green"
          />
          <PortalSummaryStat
            label="Job sites"
            value={stats.jobSites}
            icon={<IconBuilding className="h-5 w-5" />}
            accent="slate"
          />
        </div>
      )}

      <PortalFilterPanel title="Search & filter">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Keywords">
            <Input
              placeholder="Search by company, contact, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={portalFieldClassName}
            />
          </FormField>
          <FormField label="Status">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={portalFieldClassName}
            >
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </Select>
          </FormField>
        </div>
      </PortalFilterPanel>

      {isLoading && <LoadingState />}
      {!isLoading && filtered.length === 0 && (
        <EmptyState
          title={data?.length ? 'No customers match your filters' : 'No customers found'}
          description="Add a customer company to manage job sites and portal users."
        />
      )}
      {filtered.length > 0 && (
        <PortalRecordsPanel title="Customer directory" count={filtered.length} countLabel="customers">
          <Table>
            <thead>
              <tr>
                <Th>Company</Th>
                <Th>Contact</Th>
                <Th>Email</Th>
                <Th>Job Sites</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <Td>
                    <TitleCell
                      title={c.companyName}
                      subtitle={c.address ? c.address.split(',')[0] : undefined}
                    />
                  </Td>
                  <Td>
                    {c.contactName ? (
                      <PersonCell name={c.contactName} />
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </Td>
                  <Td className="text-slate-600">{c.contactEmail || c.officeEmail || '—'}</Td>
                  <Td>
                    <span className="inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg bg-primary/10 px-2 text-sm font-semibold text-primary">
                      {c._count?.jobSites ?? 0}
                    </span>
                  </Td>
                  <Td>
                    <Badge status={c.status} className="rounded-full normal-case" />
                  </Td>
                  <Td>
                    <ActionCell>
                      <Button size="sm" variant="secondary" onClick={() => openEdit(c)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedCustomer(c);
                          setUserModalOpen(true);
                        }}
                      >
                        Add Portal User
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
        title={editing ? 'Edit Customer' : 'Add Customer'}
        size="lg"
      >
        <form
          onSubmit={form.handleSubmit((v) => saveMutation.mutate(v))}
          className="space-y-4"
        >
          <FormField label="Company Name" error={form.formState.errors.companyName?.message}>
            <Input {...form.register('companyName')} className={portalFormFieldClassName} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Contact Name">
              <Input {...form.register('contactName')} className={portalFormFieldClassName} />
            </FormField>
            <FormField label="Contact Phone">
              <Input {...form.register('contactPhone')} className={portalFormFieldClassName} />
            </FormField>
          </div>
          <FormField label="Contact Email">
            <Input type="email" {...form.register('contactEmail')} className={portalFormFieldClassName} />
          </FormField>
          <FormField label="Office Email">
            <Input type="email" {...form.register('officeEmail')} className={portalFormFieldClassName} />
          </FormField>
          <FormField label="Address">
            <Textarea {...form.register('address')} rows={2} className={portalFormFieldClassName} />
          </FormField>
          <FormField label="Status">
            <Select {...form.register('status')} className={portalFormFieldClassName}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </Select>
          </FormField>
          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saveMutation.isPending}>
              {editing ? 'Save Changes' : 'Create Customer'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        title={`Create Portal User — ${selectedCustomer?.companyName}`}
      >
        <form
          onSubmit={userForm.handleSubmit((v) => createUserMutation.mutate(v))}
          className="space-y-4"
        >
          <FormField label="Name" error={userForm.formState.errors.name?.message}>
            <Input {...userForm.register('name')} className={portalFormFieldClassName} />
          </FormField>
          <FormField label="Email" error={userForm.formState.errors.email?.message}>
            <Input type="email" {...userForm.register('email')} className={portalFormFieldClassName} />
          </FormField>
          <FormField label="Password" error={userForm.formState.errors.password?.message}>
            <Input type="password" {...userForm.register('password')} className={portalFormFieldClassName} />
          </FormField>
          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <Button type="button" variant="secondary" onClick={() => setUserModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createUserMutation.isPending}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
