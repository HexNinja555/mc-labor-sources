import { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { brandStyles } from '@/theme/brand';
import { mobileApi } from '@/lib/api';

export default function JobOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<Awaited<ReturnType<typeof mobileApi.getJobOrder>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [ackLoading, setAckLoading] = useState(false);

  const load = async () => {
    if (!id) return;
    const data = await mobileApi.getJobOrder(id);
    setItem(data);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [id]);

  const onAcknowledge = async () => {
    if (!id) return;
    setAckLoading(true);
    try {
      const updated = await mobileApi.acknowledgeJobOrder(id);
      setItem(updated);
    } finally {
      setAckLoading(false);
    }
  };

  if (loading || !item) {
    return (
      <View style={[brandStyles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const canAck = item.status === 'SENT';

  return (
    <ScrollView style={brandStyles.screen}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.meta}>{item.orderNumber}</Text>
      <Text style={styles.meta}>Site: {item.jobSite?.name}</Text>
      <Text style={styles.meta}>Start: {item.startDate} {item.startTime ?? ''}</Text>
      <Text style={styles.meta}>Status: {item.status}</Text>
      {item.description ? <Text style={styles.body}>{item.description}</Text> : null}
      {item.instructions ? <Text style={styles.body}>Instructions: {item.instructions}</Text> : null}
      {item.safetyNotes ? <Text style={styles.body}>Safety: {item.safetyNotes}</Text> : null}
      {canAck && (
        <Pressable style={styles.button} onPress={onAcknowledge} disabled={ackLoading}>
          <Text style={styles.buttonText}>{ackLoading ? 'Saving...' : 'Acknowledge'}</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = {
  title: brandStyles.title,
  meta: { ...brandStyles.note, marginTop: 6 },
  body: { ...brandStyles.note, marginTop: 12, lineHeight: 22 },
  button: { ...brandStyles.button, marginTop: 24 },
  buttonText: brandStyles.buttonText,
};
