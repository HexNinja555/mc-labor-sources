'use client';

import { SupervisorLayout } from '@/components/layout/SupervisorLayout';
import { BrandPageTitle, BrandPanel } from '@/components/brand';
import { BRAND_HERO_IMAGES } from '@/lib/navigation';
import { EmptyState } from '@/components/ui/EmptyState';

export default function SupervisorTimesheetsPage() {
  return (
    <SupervisorLayout heroTitle="Timesheets" heroImage={BRAND_HERO_IMAGES.timesheets}>
      <BrandPageTitle title="Timesheets" description="Timesheets for assigned sites" />
      <BrandPanel>
        <EmptyState
          title="Supervisor Portal — Milestone 3"
          description="Full supervisor timesheet views will be available in the next phase."
        />
      </BrandPanel>
    </SupervisorLayout>
  );
}
