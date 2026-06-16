import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { Tabs } from 'expo-router';
import { tabScreenOptions } from '@/theme/brand';
import { useAuth } from '@/context/AuthContext';

export default function TabLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user || user.role !== 'WORKER') {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs screenOptions={tabScreenOptions}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="assignments" options={{ title: 'Assignments' }} />
      <Tabs.Screen name="clock" options={{ title: 'Clock' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
