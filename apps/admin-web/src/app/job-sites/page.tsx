'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createJobSiteSchema, JobSiteStatus, type CreateJobSiteInput } from '@mc-labor/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BrandJobSiteCard, BrandPageTitle } from '@/components/brand';
import { JobSiteListingFilters } from '@/components/job-sites/JobSiteListingFilters';
import { BRAND_HERO_IMAGES } from '@/lib/navigation';
import { collectJobSiteStates, filterJobSites, type JobSiteFilterValues } from '@/lib/job-site-utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { api, type JobSite } from '@/lib/api-client';

const defaultFilters: JobSiteFilterValues = {
  keywords: '',
  status: '',
  customerId: '',
  location: '',
};

export default function JobSitesPage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<JobSite | null>(null);
  const queryClient = useQueryClient();

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.getCustomers(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['job-sites'],
    queryFn: () => api.getJobSites(),
  });

  const locations = useMemo(() => collectJobSiteStates(data ?? []), [data]);
  const filteredSites = useMemo(
    () => filterJobSites(data ?? [], filters),
    [data, filters],
  );

  const form = useForm<CreateJobSiteInput>({
    resolver: zodResolver(createJobSiteSchema),
    defaultValues: { customerId: '', name: '', address: '', status: JobSiteStatus.ACTIVE },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: CreateJobSiteInput) => {
      const payload = {
        ...values,
        foremanEmail: values.foremanEmail || undefined,
      };
      if (editing) return api.updateJobSite(editing.id, payload);
      return api.createJobSite(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-sites'] });
      setModalOpen(false);
      setEditing(null);
    },
  });

  function openCreate() {
    setEditing(null);
    form.reset({ customerId: '', name: '', address: '', status: JobSiteStatus.ACTIVE });
    setModalOpen(true);
  }

  function openEdit(site: JobSite) {
    setEditing(site);
    form.reset({
      customerId: site.customerId,
      name: site.name,
      address: site.address,
      city: site.city || '',
      state: site.state || '',
      zipCode: site.zipCode || '',
      foremanName: site.foremanName || '',
      foremanPhone: site.foremanPhone || '',
      foremanEmail: site.foremanEmail || '',
      status: site.status as JobSiteStatus,
    });
    setModalOpen(true);
  }

  return (
    <DashboardLayout heroTitle="Job Sites" heroImage={BRAND_HERO_IMAGES.default}>
      <BrandPageTitle
        title="Job Sites"
        description="Manage customer job sites"
        action={<Button onClick={openCreate}>Add Job Site</Button>}
      />

      <JobSiteListingFilters
        filters={filters}
        onChange={setFilters}
        locations={locations}
        customers={customers}
        showCustomerFilter
      />

      {isLoading && <LoadingState />}
      {!isLoading && filteredSites.length === 0 && (
        <EmptyState title={data?.length ? 'No job sites match your filters' : 'No job sites found'} />
      )}
      {filteredSites.length > 0 && (
        <div className="space-y-4">
          {filteredSites.map((site) => (
            <BrandJobSiteCard
              key={site.id}
              name={site.name}
              address={site.address}
              city={site.city}
              state={site.state}
              zipCode={site.zipCode}
              status={site.status}
              customerName={site.customer?.companyName}
              foremanName={site.foremanName}
              foremanPhone={site.foremanPhone}
              foremanEmail={site.foremanEmail}
              assignments={site.assignments}
              onEdit={() => openEdit(site)}
            />
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Job Site' : 'Add Job Site'}
        size="lg"
      >
        <form
          onSubmit={form.handleSubmit((v) => saveMutation.mutate(v))}
          className="space-y-4"
        >
          <FormField label="Customer" error={form.formState.errors.customerId?.message}>
            <Select {...form.register('customerId')}>
              <option value="">Select customer</option>
              {customers?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Site Name" error={form.formState.errors.name?.message}>
            <Input {...form.register('name')} />
          </FormField>
          <FormField label="Address" error={form.formState.errors.address?.message}>
            <Input {...form.register('address')} />
          </FormField>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="City">
              <Input {...form.register('city')} />
            </FormField>
            <FormField label="State">
              <Input {...form.register('state')} />
            </FormField>
            <FormField label="Zip">
              <Input {...form.register('zipCode')} />
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Foreman Name">
              <Input {...form.register('foremanName')} />
            </FormField>
            <FormField label="Foreman Phone">
              <Input {...form.register('foremanPhone')} />
            </FormField>
            <FormField label="Foreman Email">
              <Input type="email" {...form.register('foremanEmail')} />
            </FormField>
          </div>
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
    </DashboardLayout>
  );
}
