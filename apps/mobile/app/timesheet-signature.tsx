import { View, Text } from 'react-native';
import { brandStyles } from '@/theme/brand';

export default function TimesheetSignatureScreen() {
  return (
    <View style={brandStyles.screen}>
      <Text style={styles.title}>Foreman Signature</Text>
      <Text style={styles.note}>
        Signature capture on mobile is planned for Milestone 3. Admins can sign timesheets from the web portal.
      </Text>
    </View>
  );
}

const styles = {
  title: brandStyles.title,
  note: brandStyles.note,
};
