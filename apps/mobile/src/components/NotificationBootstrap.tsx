import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { setupNotificationResponseHandler } from '@/lib/push';

export function NotificationBootstrap() {
  const router = useRouter();

  useEffect(() => {
    return setupNotificationResponseHandler(router);
  }, [router]);

  return null;
}
