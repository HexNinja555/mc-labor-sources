'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BrandPageTitle, BrandPanel } from '@/components/brand';
import { EmptyState } from '@/components/ui/EmptyState';

export default function ShellPage({
  title,
  description,
  heroTitle,
  heroImage,
}: {
  title: string;
  description: string;
  heroTitle?: string;
  heroImage?: string;
}) {
  return (
    <DashboardLayout heroTitle={heroTitle ?? title} heroImage={heroImage}>
      <BrandPageTitle title={title} description={description} />
      <BrandPanel>
        <EmptyState
          title="Coming in Milestone 2–3"
          description="This module is scaffolded in the API. Full UI will be available in the next development phase."
        />
      </BrandPanel>
    </DashboardLayout>
  );
}
