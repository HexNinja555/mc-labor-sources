'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateSettingsSchema } from '@mc-labor/shared';
import type { z } from 'zod';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BrandPageTitle } from '@/components/brand';
import { BRAND_HERO_IMAGES } from '@/lib/navigation';
import { portalFormFieldClassName } from '@/components/portal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { LoadingState } from '@/components/ui/LoadingState';
import { api } from '@/lib/api-client';

type SettingsFormInput = z.infer<typeof updateSettingsSchema>;

export default function SettingsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.getSettings(),
  });

  const form = useForm<SettingsFormInput>({
    resolver: zodResolver(updateSettingsSchema),
    defaultValues: {
      companyName: '',
      officeEmail: '',
      dashboardSubdomain: '',
    },
  });

  const { reset } = form;

  const saveMutation = useMutation({
    mutationFn: (values: SettingsFormInput) => api.updateSettings(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  });

  useEffect(() => {
    if (!data) return;
    reset({
      companyName: data.companyName,
      officeEmail: data.officeEmail || '',
      dashboardSubdomain: data.dashboardSubdomain || '',
    });
  }, [data, reset]);

  return (
    <DashboardLayout heroTitle="Settings" heroImage={BRAND_HERO_IMAGES.inner}>
      <BrandPageTitle title="Settings" description="Company configuration and portal preferences" />

      {isLoading && <LoadingState />}

      {data && (
        <article className="max-w-xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm ring-1 ring-gray-100/80">
          <header className="border-b border-gray-100 bg-gradient-to-r from-white to-slate-50/80 px-6 py-4">
            <h2 className="brand-section-title text-lg">Company profile</h2>
            <p className="mt-1 text-sm text-gray-500">Basic information shown across the admin portal.</p>
          </header>
          <form
            onSubmit={form.handleSubmit((v) => saveMutation.mutate(v))}
            className="space-y-4 px-6 py-5"
          >
            <FormField label="Company Name">
              <Input {...form.register('companyName')} className={portalFormFieldClassName} />
            </FormField>
            <FormField label="Office Email">
              <Input type="email" {...form.register('officeEmail')} className={portalFormFieldClassName} />
            </FormField>
            <FormField label="Dashboard Subdomain">
              <Input
                {...form.register('dashboardSubdomain')}
                placeholder="portal"
                className={portalFormFieldClassName}
              />
            </FormField>
            <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs leading-relaxed text-gray-500">
              In-app notifications are delivered to workers and customer portal users. Email delivery
              to external inboxes will be configured in Milestone 4.
            </p>
            <div className="border-t border-gray-100 pt-4">
              <Button type="submit" icon="save" loading={saveMutation.isPending}>
                Save Settings
              </Button>
            </div>
          </form>
        </article>
      )}
    </DashboardLayout>
  );
}
