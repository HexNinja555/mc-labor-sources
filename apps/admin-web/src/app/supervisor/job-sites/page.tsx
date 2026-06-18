'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SupervisorLayout } from '@/components/layout/SupervisorLayout';
import { BrandPageTitle, BrandJobSiteCard } from '@/components/brand';
import { BRAND_HERO_IMAGES } from '@/lib/navigation';
import { PortalSummaryStat } from '@/components/portal';
import { IconBuilding, IconUsers } from '@/components/dashboard';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { api } from '@/lib/api-client';

export default function SupervisorJobSitesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['supervisor-job-sites'],
    queryFn: () => api.getSupervisorPortalJobSites(),
  });

  const stats = useMemo(() => {
    const sites = data ?? [];
    const workers = sites.reduce((sum, site) => sum + (site.assignments?.length ?? 0), 0);
    return { sites: sites.length, workers };
  }, [data]);

  return (
    <SupervisorLayout heroTitle="Job Sites" heroImage={BRAND_HERO_IMAGES.default}>
      <BrandPageTitle title="Job Sites" description="Sites assigned to you" />

      {data && data.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-4">
          <PortalSummaryStat label="Assigned sites" value={stats.sites} icon={<IconBuilding className="h-5 w-5" />} />
          <PortalSummaryStat
            label="Active assignments"
            value={stats.workers}
            icon={<IconUsers className="h-5 w-5" />}
            accent="green"
          />
        </div>
      )}

      {isLoading && <LoadingState />}
      {!isLoading && data?.length === 0 && (
        <EmptyState
          title="No job sites assigned"
          description="Ask an administrator to assign job sites to your supervisor account."
        />
      )}
      {data && data.length > 0 && (
        <div className="space-y-5">
          {data.map((site) => (
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
            />
          ))}
        </div>
      )}
    </SupervisorLayout>
  );
}
