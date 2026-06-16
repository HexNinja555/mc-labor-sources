import { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { brandStyles } from '@/theme/brand';
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
      setAssignments(assignmentList.filter((a) => ['ACTIVE', 'ACCEPTED'].includes(a.status)));
      setActive(activeSession);
      if (assignmentList.length && !selectedId) {
        setSelectedId(assignmentList[0].id);
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

  if (loading) {
    return (
      <View style={[brandStyles.screen, styles.center]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={brandStyles.screen}>
      <Text style={styles.title}>Clock In / Out</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {active ? (
        <View style={styles.activeCard}>
          <Text style={styles.activeTitle}>Currently clocked in</Text>
          <Text style={styles.meta}>{active.jobSiteName}</Text>
          <Text style={styles.meta}>Since {new Date(active.clockInTime).toLocaleString()}</Text>
          <Pressable style={styles.buttonDanger} onPress={onClockOut} disabled={actionLoading}>
            <Text style={styles.buttonText}>{actionLoading ? 'Working...' : 'Clock Out'}</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <Text style={styles.label}>Select assignment</Text>
          {assignments.map((item) => (
            <Pressable
              key={item.id}
              style={[styles.card, selectedId === item.id && styles.cardSelected]}
              onPress={() => setSelectedId(item.id)}
            >
              <Text style={styles.cardTitle}>{item.jobSite?.name}</Text>
              <Text style={styles.meta}>{item.customer?.companyName}</Text>
            </Pressable>
          ))}
          <Pressable style={styles.button} onPress={onClockIn} disabled={actionLoading}>
            <Text style={styles.buttonText}>{actionLoading ? 'Working...' : 'Clock In'}</Text>
          </Pressable>
        </>
      )}

      {coords ? <Text style={styles.meta}>Last GPS: {coords}</Text> : null}
    </ScrollView>
  );
}

const styles = {
  center: { justifyContent: 'center' as const, alignItems: 'center' as const, flex: 1 },
  title: brandStyles.title,
  label: { ...brandStyles.note, marginBottom: 8 },
  meta: { ...brandStyles.note, marginTop: 4 },
  error: { ...brandStyles.note, color: '#b91c1c', marginBottom: 8 },
  card: { ...brandStyles.card, marginBottom: 10 },
  cardSelected: { borderColor: '#0061be', borderWidth: 2 },
  cardTitle: brandStyles.cardText,
  activeCard: {
    ...brandStyles.card,
    backgroundColor: '#ecfdf5',
    marginBottom: 16,
  },
  activeTitle: { ...brandStyles.cardText, color: '#047857' },
  button: { ...brandStyles.button, marginTop: 16 },
  buttonDanger: { ...brandStyles.button, marginTop: 16, backgroundColor: '#b91c1c' },
  buttonText: brandStyles.buttonText,
};
