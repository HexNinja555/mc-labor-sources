import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (user?.role === 'WORKER') {
    return <Redirect href="/(tabs)" />;
  }

  if (user) {
    return <Redirect href="/(auth)/login?error=not-worker" />;
  }

  return <Redirect href="/(auth)/login" />;
}
