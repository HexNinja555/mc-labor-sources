import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { brandStyles } from '@/theme/brand';

export default function AssignmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assignment Detail</Text>
      <Text style={styles.note}>Assignment ID: {id || 'N/A'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: brandStyles.screen,
  title: brandStyles.title,
  note: brandStyles.note,
});
