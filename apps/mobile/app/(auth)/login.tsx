import { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { BRAND_PHONE, BRAND_PHONE_HREF, brandStyles } from '@/theme/brand';
import { signIn } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Linking } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { error } = useLocalSearchParams<{ error?: string }>();
  const { refresh, signOut } = useAuth();
  const [email, setEmail] = useState('worker@mclabor.demo');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (error === 'not-worker') {
      signOut();
    }
  }, [error, signOut]);

  const onSubmit = async () => {
    setFormError('');
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      await refresh();
      router.replace('/(tabs)');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.subtitle}>Worker Mobile App</Text>
        <Pressable onPress={() => Linking.openURL(BRAND_PHONE_HREF)}>
          <Text style={styles.phone}>{BRAND_PHONE}</Text>
        </Pressable>

        {error === 'not-worker' && (
          <Text style={styles.error}>This app is for workers only. Please use the web portal.</Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {formError ? <Text style={styles.error}>{formError}</Text> : null}

        <Pressable style={styles.button} onPress={onSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = {
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 24,
  },
  logo: { width: 280, height: 38 },
  subtitle: { ...brandStyles.subtitle, marginTop: 16 },
  phone: brandStyles.phone,
  input: {
    width: '100%' as const,
    maxWidth: 320,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 12,
    fontFamily: brandStyles.note.fontFamily,
    fontSize: 16,
  },
  error: {
    ...brandStyles.note,
    color: '#b91c1c',
    marginTop: 12,
    textAlign: 'center' as const,
  },
  button: { ...brandStyles.button, marginTop: 20, minWidth: 200, alignItems: 'center' as const },
  buttonText: brandStyles.buttonText,
};
