import { View, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FF, chromeBarShadow } from '@/theme/brand';

/** Logo header for auth screens — matches tab chrome */
export function AuthAppHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View style={chromeBarShadow}>
      <View style={[styles.bar, { paddingTop: insets.top + 12 }]}>
        <Image
          source={require('../../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <LinearGradient
        colors={['#2563EB', '#4F46E5', '#2563EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.accentLine}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: FF.card,
    borderBottomWidth: 1,
    borderBottomColor: FF.borderInput,
    paddingBottom: 14,
    paddingHorizontal: 20,
    minHeight: 56,
    justifyContent: 'flex-end',
  },
  logo: {
    width: 220,
    height: 44,
    alignSelf: 'flex-start',
  },
  accentLine: {
    height: 3,
  },
});
