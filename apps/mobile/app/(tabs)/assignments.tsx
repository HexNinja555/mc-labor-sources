import { View, Text, StyleSheet } from 'react-native';
import { brandStyles } from '@/theme/brand';

export default function AssignmentsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Assignments</Text>
      <Text style={styles.note}>Placeholder — API integration in Milestone 2</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: brandStyles.screen,
  title: brandStyles.title,
  note: brandStyles.note,
});
