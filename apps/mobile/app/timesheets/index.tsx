import { useCallback, useEffect, useState } from 'react';
import { InfoBanner, ListCard, StackListItem, StackListScreen } from '@/components/ui';
import { mobileApi } from '@/lib/api';
import { IMAGERY } from '@/constants/imagery';

export default function TimesheetsScreen() {
  const [items, setItems] = useState<Awaited<ReturnType<typeof mobileApi.getTimesheets>>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setItems(await mobileApi.getTimesheets());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load timesheets');
    }
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  return (
    <StackListScreen
      loading={loading}
      loadingLabel="Loading timesheets…"
      refreshing={refreshing}
      onRefresh={async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
      }}
      error={error}
      items={items}
      keyExtractor={(item) => item.id}
      banner={{
        source: IMAGERY.heroTimesheets,
        title: 'My Timesheets',
        subtitle: 'View your submitted hours',
      }}
      headerExtra={
        <InfoBanner message="View-only in Milestone 2. Foreman signing comes in Milestone 3." />
      }
      emptyMessage="No timesheets yet."
      emptyIcon="🗓️"
      renderItem={({ item }) => (
        <StackListItem>
          <ListCard
            size="comfortable"
            titleLines={1}
            icon="calendar-outline"
            iconAccent="violet"
            title={item.jobSite?.name ?? 'Job Site'}
            subtitle={`${item.totalHours}h total`}
            meta={
              item.workDate
                ? new Date(`${item.workDate}T12:00:00`).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : undefined
            }
            status={item.status}
          />
        </StackListItem>
      )}
    />
  );
}
