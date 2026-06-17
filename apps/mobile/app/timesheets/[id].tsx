import { useEffect, useState } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  Card,
  DetailRow,
  ErrorBanner,
  ImageBanner,
  Screen,
  SectionTitle,
  StackAppHeader,
  SummaryBar,
  screenLayout,
} from '@/components/ui';
import { FF, fonts, statusColors } from '@/theme/brand';
import { IMAGERY } from '@/constants/imagery';
import { mobileApi } from '@/lib/api';

export default function TimesheetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<Awaited<ReturnType<typeof mobileApi.getTimesheet>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    mobileApi
      .getTimesheet(id)
      .then(setItem)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Screen padded={false}>
        <StackAppHeader />
        <ImageBanner variant="full" source={IMAGERY.heroTimesheets} title="Timesheet" subtitle="Loading…" />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={FF.primary} />
        </View>
      </Screen>
    );
  }

  if (error || !item) {
    return (
      <Screen padded={false}>
        <StackAppHeader />
        <ImageBanner variant="full" source={IMAGERY.heroTimesheets} title="Timesheet" />
        <View style={screenLayout.body}>
          <ErrorBanner message={error || 'Timesheet not found'} />
        </View>
      </Screen>
    );
  }

  const badge = statusColors(item.status);
  const periodLabel =
    item.weekStartDate && item.weekEndDate
      ? `${item.weekStartDate} – ${item.weekEndDate}`
      : item.workDate ?? '—';

  return (
    <Screen padded={false}>
      <StackAppHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={screenLayout.listContent}
        showsVerticalScrollIndicator={false}
      >
        <ImageBanner
          variant="full"
          source={IMAGERY.heroTimesheets}
          title={item.jobSite?.name ?? 'Timesheet'}
          subtitle={`${item.totalHours}h total`}
        />

        <View style={screenLayout.body}>
          <SummaryBar
            status={item.status}
            statusColors={badge}
            meta={periodLabel}
          />

          <SectionTitle>Summary</SectionTitle>
          <Card style={styles.detailsCard}>
            <DetailRow icon="business-outline" label="Job site" value={item.jobSite?.name} />
            <DetailRow icon="time-outline" label="Total hours" value={`${item.totalHours}h`} />
            <DetailRow icon="calendar-outline" label="Period" value={periodLabel} />
          </Card>

          {item.entries && item.entries.length > 0 && (
            <>
              <SectionTitle>Time entries</SectionTitle>
              <Card>
                {item.entries.map((entry, index) => (
                  <View
                    key={entry.id}
                    style={[styles.entryRow, index > 0 && styles.entryBorder]}
                  >
                    <Text style={styles.entryDate}>{entry.workDate}</Text>
                    <Text style={styles.entryTime}>
                      {entry.startTime} – {entry.endTime}
                    </Text>
                    <Text style={styles.entryHours}>{entry.hours}h</Text>
                  </View>
                ))}
              </Card>
            </>
          )}

          {item.notes ? (
            <>
              <SectionTitle>Notes</SectionTitle>
              <Card>
                <Text style={styles.notes}>{item.notes}</Text>
              </Card>
            </>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  detailsCard: { paddingVertical: 4, marginBottom: 8 },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: 8,
  },
  entryBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: FF.border,
  },
  entryDate: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: FF.text,
  },
  entryTime: {
    flex: 1.2,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: FF.textSecondary,
  },
  entryHours: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: FF.primary,
  },
  notes: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: FF.textSecondary,
    lineHeight: 22,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
});
