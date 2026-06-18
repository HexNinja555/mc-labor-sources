'use client';

import { SupervisorLayout } from '@/components/layout/SupervisorLayout';
import { BrandPageTitle } from '@/components/brand';
import { DashboardSection } from '@/components/dashboard';
import { HoursReportPanel } from '@/components/portal';
import { BRAND_HERO_IMAGES } from '@/lib/navigation';

export default function SupervisorReportsPage() {
  return (
    <SupervisorLayout heroTitle="Reports" heroImage={BRAND_HERO_IMAGES.timesheets}>
      <BrandPageTitle
        title="Reports"
        description="Hours rollup and exports for your assigned job sites"
      />

      <DashboardSection
        title="Hours report"
        description="Roll up hours by worker for your assigned sites"
      >
        <HoursReportPanel
          scope="supervisor"
          description="Select a date range to see total hours per worker on sites assigned to you."
        />
      </DashboardSection>
    </SupervisorLayout>
  );
}
