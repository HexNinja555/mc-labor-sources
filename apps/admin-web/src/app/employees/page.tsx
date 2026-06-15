'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEmployeeSchema, EmployeeStatus, type CreateEmployeeInput } from '@mc-labor/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/layout/PageTitle';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { Table, Th, Td } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { api, type Employee } from '@/lib/api-client';

export default function EmployeesPage() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['employees', search],
    queryFn: () => api.getEmployees({ search }),
  });

  const form = useForm<CreateEmployeeInput>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: '',
      status: EmployeeStatus.ACTIVE,
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: CreateEmployeeInput) => {
      const payload = {
        ...values,
        email: values.email || undefined,
        hourlyRate: values.hourlyRate ? Number(values.hourlyRate) : undefined,
      };
      if (editing) {
        return api.updateEmployee(editing.id, payload);
      }
      return api.createEmployee(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      closeModal();
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (emp: Employee) =>
      api.updateEmployee(emp.id, {
        status: emp.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });

  function openCreate() {
    setEditing(null);
    form.reset({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: '',
      status: EmployeeStatus.ACTIVE,
    });
    setModalOpen(true);
  }

  function openEdit(emp: Employee) {
    setEditing(emp);
    form.reset({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email || '',
      phone: emp.phone || '',
      position: emp.position || '',
      hourlyRate: emp.hourlyRate ? Number(emp.hourlyRate) : undefined,
      status: emp.status as EmployeeStatus,
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
  }

  return (
    <DashboardLayout>
      <PageTitle
        title="Employees"
        description="Manage MC Labor workforce"
        action={<Button onClick={openCreate}>Add Employee</Button>}
      />

      <div className="mb-4">
        <Input
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading && <LoadingState />}
      {data && data.length === 0 && <EmptyState title="No employees found" />}
      {data && data.length > 0 && (
        <Table>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Position</Th>
              <Th>Email</Th>
              <Th>Phone</Th>
              <Th>Rate</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((emp) => (
              <tr key={emp.id}>
                <Td>
                  {emp.firstName} {emp.lastName}
                </Td>
                <Td>{emp.position || '—'}</Td>
                <Td>{emp.email || '—'}</Td>
                <Td>{emp.phone || '—'}</Td>
                <Td>{emp.hourlyRate ? `$${emp.hourlyRate}` : '—'}</Td>
                <Td>
                  <Badge status={emp.status} />
                </Td>
                <Td>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => openEdit(emp)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleStatusMutation.mutate(emp)}
                    >
                      {emp.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
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
        onClose={closeModal}
        title={editing ? 'Edit Employee' : 'Add Employee'}
        size="lg"
      >
        <form
          onSubmit={form.handleSubmit((v) => saveMutation.mutate(v))}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name" error={form.formState.errors.firstName?.message}>
              <Input {...form.register('firstName')} />
            </FormField>
            <FormField label="Last Name" error={form.formState.errors.lastName?.message}>
              <Input {...form.register('lastName')} />
            </FormField>
          </div>
          <FormField label="Email" error={form.formState.errors.email?.message}>
            <Input type="email" {...form.register('email')} />
          </FormField>
          <FormField label="Phone">
            <Input {...form.register('phone')} />
          </FormField>
          <FormField label="Position">
            <Input {...form.register('position')} />
          </FormField>
          <FormField label="Hourly Rate">
            <Input type="number" step="0.01" {...form.register('hourlyRate', { valueAsNumber: true })} />
          </FormField>
          <FormField label="Status">
            <Select {...form.register('status')}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </Select>
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={saveMutation.isPending}>
              {editing ? 'Save Changes' : 'Create Employee'}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
