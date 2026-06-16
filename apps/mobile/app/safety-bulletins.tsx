import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, RefreshControl, Modal, ScrollView } from 'react-native';
import { brandStyles } from '@/theme/brand';
import { mobileApi } from '@/lib/api';

export default function SafetyBulletinsScreen() {
  const [items, setItems] = useState<Awaited<ReturnType<typeof mobileApi.getSafetyBulletins>>>([]);
  const [selected, setSelected] = useState<(typeof items)[0] | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setItems(await mobileApi.getSafetyBulletins());
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
      <Text style={styles.title}>Safety Bulletins</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.note}>No bulletins.</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => setSelected(item)}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.meta}>{new Date(item.sentAt).toLocaleDateString()}</Text>
          </Pressable>
        )}
      />
      <Modal visible={!!selected} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ScrollView>
              <Text style={styles.title}>{selected?.title}</Text>
              <Text style={styles.body}>{selected?.message}</Text>
            </ScrollView>
            <Pressable style={styles.button} onPress={() => setSelected(null)}>
              <Text style={styles.buttonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = {
  title: brandStyles.title,
  note: brandStyles.note,
  card: { ...brandStyles.card, marginBottom: 12 },
  cardTitle: brandStyles.cardText,
  meta: { ...brandStyles.note, marginTop: 4 },
  body: { ...brandStyles.note, marginTop: 12, lineHeight: 22 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center' as const,
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%' as const,
  },
  button: { ...brandStyles.button, marginTop: 16 },
  buttonText: brandStyles.buttonText,
};
