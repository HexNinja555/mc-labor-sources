import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';
import { brandStyles } from '@/theme/brand';
import { mobileApi } from '@/lib/api';

export default function AssignmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<Awaited<ReturnType<typeof mobileApi.getAssignment>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    mobileApi
      .getAssignment(id)
      .then(setItem)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={[brandStyles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !item) {
    return (
      <View style={brandStyles.screen}>
        <Text style={styles.error}>{error || 'Not found'}</Text>
      </View>
    );
  }

  return (
    <View style={brandStyles.screen}>
      <Text style={styles.title}>{item.jobSite?.name}</Text>
      <Text style={styles.meta}>{item.customer?.companyName}</Text>
      <Text style={styles.meta}>{item.jobSite?.address}</Text>
      <Text style={styles.meta}>Date: {item.assignedDate}</Text>
      <Text style={styles.meta}>Status: {item.status}</Text>
      {item.notes ? <Text style={styles.meta}>Notes: {item.notes}</Text> : null}
      <Link href="/(tabs)/clock" style={styles.link}>
        Go to Clock In / Out
      </Link>
    </View>
  );
}

const styles = {
  title: brandStyles.title,
  meta: { ...brandStyles.note, marginTop: 8 },
  error: { ...brandStyles.note, color: '#b91c1c' },
  link: { marginTop: 20, color: '#0061be', fontFamily: brandStyles.cardText.fontFamily },
};
