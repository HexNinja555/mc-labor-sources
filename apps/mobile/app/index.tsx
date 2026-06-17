import { Redirect } from 'expo-router';
import { LoadingView } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingView />;

  if (user?.role === 'WORKER') {
    return <Redirect href="/(tabs)" />;
  }

  if (user) {
    return <Redirect href="/(auth)/login?error=not-worker" />;
  }

  return <Redirect href="/(auth)/login" />;
}
