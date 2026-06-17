import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FF, fonts, chromeBarShadow } from '@/theme/brand';

type StackBackBarProps = {
  title?: string;
};

/** Minimal back bar for stack screens without a native header */
export function StackBackBar({ title }: StackBackBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingTop: insets.top + 8 }, chromeBarShadow]}>
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
        hitSlop={8}
      >
        <Ionicons name="arrow-back" size={22} color={FF.primary} />
      </Pressable>
      {title ? <Text style={styles.title} numberOfLines={1}>{title}</Text> : null}
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FF.card,
    borderBottomWidth: 1,
    borderBottomColor: FF.borderInput,
    paddingBottom: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FF.blue50,
  },
  backBtnPressed: {
    opacity: 0.85,
  },
  title: {
    flex: 1,
    fontFamily: Platform.select({
      web: 'Montserrat_700Bold, system-ui, sans-serif',
      default: fonts.bold,
    }),
    fontSize: 17,
    color: FF.text,
    letterSpacing: -0.3,
  },
  spacer: {
    width: 40,
  },
});
