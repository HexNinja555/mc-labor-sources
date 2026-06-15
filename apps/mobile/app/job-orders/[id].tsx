import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { brandStyles } from '@/theme/brand';

export default function JobOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Job Order Detail</Text>
      <Text style={styles.note}>Job Order ID: {id || 'N/A'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: brandStyles.screen,
  title: brandStyles.title,
  note: brandStyles.note,
});
