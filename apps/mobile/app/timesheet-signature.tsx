import { EmptyState, ImageBanner, InfoBanner, Screen, StackAppHeader, screenLayout } from '@/components/ui';
import { IMAGERY } from '@/constants/imagery';
import { View } from 'react-native';

export default function TimesheetSignatureScreen() {
  return (
    <Screen scroll padded={false}>
      <StackAppHeader />
      <ImageBanner
        variant="full"
        source={IMAGERY.heroTimesheets}
        title="Foreman Signature"
        subtitle="Coming in Milestone 3"
        showBack
      />
      <View style={screenLayout.body}>
        <EmptyState
          message="Mobile foreman signature is planned for Milestone 3. Admins can sign timesheets from the web portal in the meantime."
          icon="✍️"
        />
        <InfoBanner message="This feature will let foremen sign off on timesheets directly from the field." />
      </View>
    </Screen>
  );
}
