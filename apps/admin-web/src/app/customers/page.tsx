'use client';

import { useState } from 'react';
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
  const [modalOpen, setModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['customers', search],
    queryFn: () => api.getCustomers({ search }),
  });

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
    <DashboardLayout>
      <PageTitle
        title="Customers"
        description="Manage customer companies"
        action={<Button onClick={openCreate}>Add Customer</Button>}
      />

      <div className="mb-4">
        <Input
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading && <LoadingState />}
      {data && data.length === 0 && <EmptyState title="No customers found" />}
      {data && data.length > 0 && (
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
            {data.map((c) => (
              <tr key={c.id}>
                <Td className="font-medium">{c.companyName}</Td>
                <Td>{c.contactName || '—'}</Td>
                <Td>{c.contactEmail || '—'}</Td>
                <Td>{c._count?.jobSites ?? 0}</Td>
                <Td>
                  <Badge status={c.status} />
                </Td>
                <Td>
                  <div className="flex gap-2">
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
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
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
            <Input {...form.register('companyName')} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Contact Name">
              <Input {...form.register('contactName')} />
            </FormField>
            <FormField label="Contact Phone">
              <Input {...form.register('contactPhone')} />
            </FormField>
          </div>
          <FormField label="Contact Email">
            <Input type="email" {...form.register('contactEmail')} />
          </FormField>
          <FormField label="Office Email">
            <Input type="email" {...form.register('officeEmail')} />
          </FormField>
          <FormField label="Address">
            <Textarea {...form.register('address')} rows={2} />
          </FormField>
          <FormField label="Status">
            <Select {...form.register('status')}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </Select>
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
            <Input {...userForm.register('name')} />
          </FormField>
          <FormField label="Email" error={userForm.formState.errors.email?.message}>
            <Input type="email" {...userForm.register('email')} />
          </FormField>
          <FormField label="Password" error={userForm.formState.errors.password?.message}>
            <Input type="password" {...userForm.register('password')} />
          </FormField>
          <div className="flex justify-end gap-2">
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
