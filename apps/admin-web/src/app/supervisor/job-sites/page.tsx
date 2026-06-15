'use client';

import { SupervisorLayout } from '@/components/layout/SupervisorLayout';
import { BrandPageTitle, BrandPanel } from '@/components/brand';
import { EmptyState } from '@/components/ui/EmptyState';

export default function SupervisorJobSitesPage() {
  return (
    <SupervisorLayout>
      <BrandPageTitle title="Job Sites" description="Assigned job sites overview" />
      <BrandPanel>
        <EmptyState
          title="Supervisor Portal — Milestone 3"
          description="Full supervisor job site views will be available in the next phase."
        />
      </BrandPanel>
    </SupervisorLayout>
  );
}
