import { View, Text, StyleSheet } from 'react-native';
import { brandStyles } from '@/theme/brand';

export default function TimesheetSignatureScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Foreman Signature</Text>
      <Text style={styles.note}>Placeholder — signature capture in Milestone 2</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: brandStyles.screen,
  title: brandStyles.title,
  note: brandStyles.note,
});
