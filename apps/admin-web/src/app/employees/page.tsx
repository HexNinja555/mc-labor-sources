'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEmployeeSchema, EmployeeStatus, type CreateEmployeeInput } from '@mc-labor/shared';
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
  ActionCell,
} from '@/components/portal';
import { IconUsers, IconBriefcase } from '@/components/dashboard';
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

  const stats = useMemo(() => {
    const employees = data ?? [];
    return {
      total: employees.length,
      active: employees.filter((e) => e.status === 'ACTIVE').length,
    };
  }, [data]);

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
    <DashboardLayout heroTitle="Employees" heroImage={BRAND_HERO_IMAGES.default}>
      <PageTitle
        title="Employees"
        description="Manage MC Labor workforce"
        action={<Button onClick={openCreate}>Add Employee</Button>}
      />

      {data && data.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-2">
          <PortalSummaryStat label="Total employees" value={stats.total} icon={<IconUsers className="h-5 w-5" />} />
          <PortalSummaryStat
            label="Active"
            value={stats.active}
            icon={<IconBriefcase className="h-5 w-5" />}
            accent="green"
          />
        </div>
      )}

      <PortalFilterPanel title="Search">
        <FormField label="Keywords">
          <Input
            placeholder="Search by name, email, or position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={portalFieldClassName}
          />
        </FormField>
      </PortalFilterPanel>

      {isLoading && <LoadingState />}
      {!isLoading && data?.length === 0 && (
        <EmptyState title="No employees found" description="Add your first employee to get started." />
      )}
      {data && data.length > 0 && (
        <PortalRecordsPanel title="Employee directory" count={data.length} countLabel="employees">
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
                    <PersonCell name={`${emp.firstName} ${emp.lastName}`} />
                  </Td>
                  <Td>{emp.position || '—'}</Td>
                  <Td>{emp.email || '—'}</Td>
                  <Td>{emp.phone || '—'}</Td>
                  <Td>{emp.hourlyRate ? `$${emp.hourlyRate}` : '—'}</Td>
                  <Td>
                    <Badge status={emp.status} className="rounded-full normal-case" />
                  </Td>
                  <Td>
                    <ActionCell>
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
              <Input {...form.register('firstName')} className={portalFormFieldClassName} />
            </FormField>
            <FormField label="Last Name" error={form.formState.errors.lastName?.message}>
              <Input {...form.register('lastName')} className={portalFormFieldClassName} />
            </FormField>
          </div>
          <FormField label="Email" error={form.formState.errors.email?.message}>
            <Input type="email" {...form.register('email')} className={portalFormFieldClassName} />
          </FormField>
          <FormField label="Phone">
            <Input {...form.register('phone')} className={portalFormFieldClassName} />
          </FormField>
          <FormField label="Position">
            <Input {...form.register('position')} className={portalFormFieldClassName} />
          </FormField>
          <FormField label="Hourly Rate">
            <Input
              type="number"
              step="0.01"
              {...form.register('hourlyRate', { valueAsNumber: true })}
              className={portalFormFieldClassName}
            />
          </FormField>
          <FormField label="Status">
            <Select {...form.register('status')} className={portalFormFieldClassName}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </Select>
          </FormField>
          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
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
