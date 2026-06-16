import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { brandStyles } from '@/theme/brand';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <View style={brandStyles.screen}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.card}>
        <Text style={styles.name}>{user?.name ?? '—'}</Text>
        <Text style={styles.meta}>{user?.email}</Text>
        <Text style={styles.meta}>Role: {user?.role}</Text>
      </View>
      <Pressable style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </Pressable>
    </View>
  );
}

const styles = {
  title: brandStyles.title,
  card: { ...brandStyles.card, marginBottom: 20 },
  name: brandStyles.heading,
  meta: { ...brandStyles.note, marginTop: 6 },
  button: brandStyles.button,
  buttonText: brandStyles.buttonText,
};
