import { View, Text, Image, Pressable, Linking } from 'react-native';
import { Link } from 'expo-router';
import { brandStyles, BRAND_PHONE, BRAND_PHONE_HREF } from '@/theme/brand';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.subtitle}>Worker Mobile App</Text>
      <Pressable onPress={() => Linking.openURL(BRAND_PHONE_HREF)}>
        <Text style={styles.phone}>{BRAND_PHONE}</Text>
      </Pressable>
      <Text style={styles.note}>
        Login and API integration coming in Milestone 2.
      </Text>
      <Link href="/(tabs)" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Continue to Home (Demo)</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 24,
    backgroundColor: '#fff',
  },
  logo: {
    width: 280,
    height: 38,
  },
  subtitle: {
    ...brandStyles.subtitle,
    marginTop: 16,
  },
  phone: brandStyles.phone,
  note: {
    ...brandStyles.note,
    marginTop: 16,
    textAlign: 'center' as const,
  },
  button: {
    ...brandStyles.button,
    marginTop: 32,
  },
  buttonText: brandStyles.buttonText,
};
