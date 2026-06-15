import { View, Text, StyleSheet } from 'react-native';
import { brandStyles } from '@/theme/brand';

export default function JobOrdersScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Job Orders</Text>
      <Text style={styles.note}>Placeholder — Milestone 2</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: brandStyles.screen,
  title: brandStyles.title,
  note: brandStyles.note,
});
