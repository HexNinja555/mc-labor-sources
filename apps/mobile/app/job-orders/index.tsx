import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { Link } from 'expo-router';
import { brandStyles } from '@/theme/brand';
import { mobileApi } from '@/lib/api';

export default function JobOrdersScreen() {
  const [items, setItems] = useState<Awaited<ReturnType<typeof mobileApi.getJobOrders>>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await mobileApi.getJobOrders();
    setItems(data);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  if (loading) {
    return (
      <View style={[brandStyles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={brandStyles.screen}>
      <Text style={styles.title}>Job Orders</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
          />
        }
        ListEmptyComponent={<Text style={styles.note}>No job orders assigned.</Text>}
        renderItem={({ item }) => (
          <Link href={`/job-orders/${item.id}` as never} asChild>
            <Pressable style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.meta}>{item.orderNumber} · {item.status}</Text>
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}

const styles = {
  title: brandStyles.title,
  note: brandStyles.note,
  card: { ...brandStyles.card, marginBottom: 12 },
  cardTitle: brandStyles.cardText,
  meta: { ...brandStyles.note, marginTop: 4 },
};
