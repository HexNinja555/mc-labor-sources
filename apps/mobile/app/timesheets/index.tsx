import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { brandStyles } from '@/theme/brand';
import { mobileApi } from '@/lib/api';

export default function TimesheetsScreen() {
  const [items, setItems] = useState<Awaited<ReturnType<typeof mobileApi.getTimesheets>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mobileApi.getTimesheets().then(setItems).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={[brandStyles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={brandStyles.screen}>
      <Text style={styles.title}>My Timesheets</Text>
      <Text style={styles.note}>View-only in Milestone 2. Foreman signing comes in Milestone 3.</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.note}>No timesheets.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.jobSite?.name ?? 'Job Site'}</Text>
            <Text style={styles.meta}>
              {item.totalHours}h · {item.status}
            </Text>
            {item.workDate ? <Text style={styles.meta}>Date: {item.workDate}</Text> : null}
          </View>
        )}
      />
    </View>
  );
}

const styles = {
  title: brandStyles.title,
  note: { ...brandStyles.note, marginBottom: 12 },
  card: { ...brandStyles.card, marginBottom: 12 },
  cardTitle: brandStyles.cardText,
  meta: { ...brandStyles.note, marginTop: 4 },
};
