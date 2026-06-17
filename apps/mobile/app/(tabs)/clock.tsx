import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import {
  Button,
  Card,
  EmptyState,
  ErrorBanner,
  ImageBanner,
  ListCard,
  LoadingView,
  Screen,
  SectionTitle,
  screenLayout,
} from '@/components/ui';
import { theme, fonts } from '@/theme/brand';
import { IMAGERY } from '@/constants/imagery';
import { mobileApi } from '@/lib/api';

export default function ClockScreen() {
  const [assignments, setAssignments] = useState<Awaited<ReturnType<typeof mobileApi.getAssignments>>>([]);
  const [active, setActive] = useState<Awaited<ReturnType<typeof mobileApi.getActiveClockIn>>>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [coords, setCoords] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError('');
    try {
      const [assignmentList, activeSession] = await Promise.all([
        mobileApi.getAssignments(),
        mobileApi.getActiveClockIn(),
      ]);
      const eligible = assignmentList.filter((a) => ['ACTIVE', 'ACCEPTED'].includes(a.status));
      setAssignments(eligible);
      setActive(activeSession);
      if (eligible.length && !selectedId) {
        setSelectedId(eligible[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clock data');
    }
  }, [selectedId]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission is required to clock in/out');
    }
    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    setCoords(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
    return position.coords;
  };

  const onClockIn = async () => {
    const assignment = assignments.find((a) => a.id === selectedId);
    if (!assignment) {
      setError('Select an assignment first');
      return;
    }
    setActionLoading(true);
    setError('');
    try {
      const coordsPos = await getLocation();
      await mobileApi.clockIn({
        customerId: assignment.customerId,
        jobSiteId: assignment.jobSiteId,
        assignmentId: assignment.id,
        clockInLatitude: coordsPos.latitude,
        clockInLongitude: coordsPos.longitude,
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Clock in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const onClockOut = async () => {
    if (!active) return;
    setActionLoading(true);
    setError('');
    try {
      const coordsPos = await getLocation();
      await mobileApi.clockOut({
        attendanceId: active.id,
        clockOutLatitude: coordsPos.latitude,
        clockOutLongitude: coordsPos.longitude,
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Clock out failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingView label="Loading clock status…" />;

  return (
    <Screen scroll padded={false}>
      <ImageBanner
        variant="full"
        source={IMAGERY.heroAttendance}
        title="Clock In / Out"
        subtitle="GPS-verified time tracking"
      />
      <View style={screenLayout.body}>
        <ErrorBanner message={error} />

        {active ? (
          <Card variant="success" style={styles.activeCard}>
            <View style={styles.activeHeader}>
              <View style={styles.pulseDot} />
              <Text style={styles.activeTitle}>Currently clocked in</Text>
            </View>
            <Text style={styles.activeSite}>{active.jobSiteName}</Text>
            <Text style={styles.activeTime}>Since {new Date(active.clockInTime).toLocaleString()}</Text>
            <Button
              label={actionLoading ? 'Working…' : 'Clock Out'}
              onPress={onClockOut}
              loading={actionLoading}
              variant="danger"
              icon="log-out-outline"
              style={styles.actionBtn}
            />
          </Card>
        ) : (
          <>
            <SectionTitle>Select assignment</SectionTitle>
            {assignments.length === 0 ? (
              <EmptyState message="No active assignments available to clock in." icon="⏱️" />
            ) : (
              assignments.map((item) => (
                <ListCard
                  key={item.id}
                  size="comfortable"
                  titleLines={1}
                  icon="location-outline"
                  iconAccent="green"
                  title={item.jobSite?.name ?? 'Job Site'}
                  subtitle={item.customer?.companyName}
                  selected={selectedId === item.id}
                  onPress={() => setSelectedId(item.id)}
                />
              ))
            )}
            <Button
              label={actionLoading ? 'Working…' : 'Clock In'}
              onPress={onClockIn}
              loading={actionLoading}
              icon="log-in-outline"
              style={styles.actionBtn}
              disabled={assignments.length === 0}
            />
          </>
        )}

        {coords ? (
          <View style={styles.gpsRow}>
            <Ionicons name="location-outline" size={14} color={theme.colors.textMuted} />
            <Text style={styles.gpsText}>Last GPS: {coords}</Text>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  activeCard: { marginTop: 4 },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.success,
  },
  activeTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: theme.colors.success,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeSite: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: theme.colors.text,
    marginBottom: 4,
  },
  activeTime: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  actionBtn: { marginTop: 16 },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    justifyContent: 'center',
  },
  gpsText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: theme.colors.textMuted,
  },
});
