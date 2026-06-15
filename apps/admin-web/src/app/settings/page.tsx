'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/layout/PageTitle';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { LoadingState } from '@/components/ui/LoadingState';
import { api } from '@/lib/api-client';

export default function SettingsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.getSettings(),
  });

  const form = useForm({
    defaultValues: {
      companyName: '',
      officeEmail: '',
      dashboardSubdomain: '',
    },
  });

  const saveMutation = useMutation({
    mutationFn: (values: { companyName: string; officeEmail: string; dashboardSubdomain: string }) =>
      api.updateSettings(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  });

  if (data && !form.formState.isDirty) {
    form.reset({
      companyName: data.companyName,
      officeEmail: data.officeEmail || '',
      dashboardSubdomain: data.dashboardSubdomain || '',
    });
  }

  return (
    <DashboardLayout>
      <PageTitle title="Settings" description="Company configuration" />

      {isLoading && <LoadingState />}

      {data && (
        <Card className="max-w-lg">
          <form
            onSubmit={form.handleSubmit((v) => saveMutation.mutate(v))}
            className="space-y-4"
          >
            <FormField label="Company Name">
              <Input {...form.register('companyName')} />
            </FormField>
            <FormField label="Office Email">
              <Input type="email" {...form.register('officeEmail')} />
            </FormField>
            <FormField label="Dashboard Subdomain (placeholder)">
              <Input {...form.register('dashboardSubdomain')} placeholder="portal" />
            </FormField>
            <p className="text-xs text-gray-500">
              Notification and email provider settings will be configured in Milestone 4.
            </p>
            <Button type="submit" loading={saveMutation.isPending}>
              Save Settings
            </Button>
          </form>
        </Card>
      )}
    </DashboardLayout>
  );
}
