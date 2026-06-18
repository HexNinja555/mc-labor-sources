'use client';

import { useEffect, useState } from 'react';
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
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);

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
      smtpHost: '',
      smtpPort: undefined,
      smtpUser: '',
      smtpFromEmail: '',
      smtpFromName: '',
      emailEnabled: false,
      pushEnabled: false,
    },
  });

  const { reset, register, watch } = form;
  const emailEnabled = watch('emailEnabled');
  const pushEnabled = watch('pushEnabled');

  const saveMutation = useMutation({
    mutationFn: (values: SettingsFormInput) => api.updateSettings(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  });

  const testEmailMutation = useMutation({
    mutationFn: (recipientEmail: string) => api.sendTestEmail(recipientEmail),
    onSuccess: () => setTestResult('Test email sent successfully.'),
    onError: (err: Error) => setTestResult(err.message),
  });

  useEffect(() => {
    if (!data) return;
    reset({
      companyName: data.companyName,
      officeEmail: data.officeEmail || '',
      dashboardSubdomain: data.dashboardSubdomain || '',
      smtpHost: data.smtpHost || '',
      smtpPort: data.smtpPort ?? undefined,
      smtpUser: data.smtpUser || '',
      smtpFromEmail: data.smtpFromEmail || '',
      smtpFromName: data.smtpFromName || '',
      emailEnabled: data.emailEnabled,
      pushEnabled: data.pushEnabled,
    });
    setTestEmail(data.officeEmail || '');
  }, [data, reset]);

  return (
    <DashboardLayout heroTitle="Settings" heroImage={BRAND_HERO_IMAGES.inner}>
      <BrandPageTitle title="Settings" description="Company configuration and notification delivery" />

      {isLoading && <LoadingState />}

      {data && (
        <div className="max-w-2xl space-y-6">
          <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm ring-1 ring-gray-100/80">
            <header className="border-b border-gray-100 bg-gradient-to-r from-white to-slate-50/80 px-6 py-4">
              <h2 className="brand-section-title text-lg">Company profile</h2>
              <p className="mt-1 text-sm text-gray-500">Basic information shown across the admin portal.</p>
            </header>
            <form
              onSubmit={form.handleSubmit((v) => saveMutation.mutate(v))}
              className="space-y-4 px-6 py-5"
            >
              <FormField label="Company Name">
                <Input {...register('companyName')} className={portalFormFieldClassName} />
              </FormField>
              <FormField label="Office Email">
                <Input type="email" {...register('officeEmail')} className={portalFormFieldClassName} />
              </FormField>
              <FormField label="Dashboard Subdomain">
                <Input
                  {...register('dashboardSubdomain')}
                  placeholder="portal"
                  className={portalFormFieldClassName}
                />
              </FormField>

              <div className="border-t border-gray-100 pt-5">
                <h3 className="brand-section-title text-base">Email delivery (SMTP)</h3>
                <p className="mt-1 text-sm text-gray-500">
                  In-app notifications are always delivered. Enable SMTP to also send emails to external
                  inboxes. Set <code className="text-xs">SMTP_PASS</code> as a Supabase Edge Function secret.
                </p>
                <label className="mt-4 flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" {...register('emailEnabled')} className="rounded border-gray-300" />
                  Enable email delivery
                </label>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <FormField label="SMTP Host">
                    <Input {...register('smtpHost')} placeholder="smtp.example.com" className={portalFormFieldClassName} />
                  </FormField>
                  <FormField label="SMTP Port">
                    <Input type="number" {...register('smtpPort')} placeholder="587" className={portalFormFieldClassName} />
                  </FormField>
                  <FormField label="SMTP User">
                    <Input {...register('smtpUser')} className={portalFormFieldClassName} />
                  </FormField>
                  <FormField label="From Email">
                    <Input type="email" {...register('smtpFromEmail')} className={portalFormFieldClassName} />
                  </FormField>
                  <FormField label="From Name" className="sm:col-span-2">
                    <Input {...register('smtpFromName')} className={portalFormFieldClassName} />
                  </FormField>
                </div>
                <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-relaxed text-gray-500">
                  Status:{' '}
                  <span className={emailEnabled ? 'font-medium text-emerald-700' : 'font-medium text-gray-600'}>
                    {emailEnabled ? 'Email delivery active' : 'Email delivery disabled'}
                  </span>
                </p>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <h3 className="brand-section-title text-base">Push notifications</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Workers and supervisors receive push alerts on mobile when they register a device token on
                  login. Configure Firebase / EAS credentials for native builds.
                </p>
                <label className="mt-4 flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" {...register('pushEnabled')} className="rounded border-gray-300" />
                  Enable push notifications
                </label>
                <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-relaxed text-gray-500">
                  Status:{' '}
                  <span className={pushEnabled ? 'font-medium text-emerald-700' : 'font-medium text-gray-600'}>
                    {pushEnabled ? 'Push notifications active' : 'Push notifications disabled'}
                  </span>
                </p>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <Button type="submit" icon="save" loading={saveMutation.isPending}>
                  Save Settings
                </Button>
              </div>
            </form>
          </article>

          <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm ring-1 ring-gray-100/80">
            <header className="border-b border-gray-100 bg-gradient-to-r from-white to-slate-50/80 px-6 py-4">
              <h2 className="brand-section-title text-lg">Send test email</h2>
              <p className="mt-1 text-sm text-gray-500">Verify SMTP configuration before enabling in production.</p>
            </header>
            <div className="space-y-4 px-6 py-5">
              <FormField label="Recipient">
                <Input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className={portalFormFieldClassName}
                />
              </FormField>
              {testResult && (
                <p className="text-sm text-gray-600">{testResult}</p>
              )}
              <Button
                type="button"
                variant="secondary"
                loading={testEmailMutation.isPending}
                disabled={!testEmail}
                onClick={() => testEmailMutation.mutate(testEmail)}
              >
                Send test email
              </Button>
            </div>
          </article>
        </div>
      )}
    </DashboardLayout>
  );
}
