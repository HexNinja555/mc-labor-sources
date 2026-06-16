import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { Link } from 'expo-router';
import { brandStyles } from '@/theme/brand';
import { mobileApi } from '@/lib/api';

export default function AssignmentsScreen() {
  const [items, setItems] = useState<Awaited<ReturnType<typeof mobileApi.getAssignments>>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await mobileApi.getAssignments();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assignments');
    }
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={[brandStyles.screen, styles.center]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={brandStyles.screen}>
      <Text style={styles.title}>My Assignments</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.note}>No assignments found.</Text>}
        renderItem={({ item }) => (
          <Link href={`/assignments/${item.id}` as never} asChild>
            <Pressable style={styles.card}>
              <Text style={styles.cardTitle}>{item.jobSite?.name ?? 'Job Site'}</Text>
              <Text style={styles.cardMeta}>{item.customer?.companyName}</Text>
              <Text style={styles.cardMeta}>
                {item.assignedDate} · {item.status}
              </Text>
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}

const styles = {
  center: { justifyContent: 'center' as const, alignItems: 'center' as const },
  title: brandStyles.title,
  note: brandStyles.note,
  error: { ...brandStyles.note, color: '#b91c1c', marginBottom: 8 },
  card: { ...brandStyles.card, marginBottom: 12 },
  cardTitle: { ...brandStyles.cardText, fontFamily: brandStyles.heading.fontFamily },
  cardMeta: { ...brandStyles.note, marginTop: 4 },
};
