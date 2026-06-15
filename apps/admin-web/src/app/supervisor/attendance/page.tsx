'use client';

import { SupervisorLayout } from '@/components/layout/SupervisorLayout';
import { BrandPageTitle, BrandPanel } from '@/components/brand';
import { BRAND_HERO_IMAGES } from '@/lib/navigation';
import { EmptyState } from '@/components/ui/EmptyState';

export default function SupervisorAttendancePage() {
  return (
    <SupervisorLayout heroTitle="Attendance" heroImage={BRAND_HERO_IMAGES.attendance}>
      <BrandPageTitle title="Attendance" description="Workers on assigned sites" />
      <BrandPanel>
        <EmptyState
          title="Supervisor Portal — Milestone 3"
          description="Full supervisor attendance views will be available in the next phase."
        />
      </BrandPanel>
    </SupervisorLayout>
  );
}
