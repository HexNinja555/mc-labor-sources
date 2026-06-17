import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { accents, cardShadow, FF, fonts, theme, type AccentKey } from '@/theme/brand';

type NavRowProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent?: AccentKey;
  onPress?: () => void;
};

/** Navigation row — matches MenuTile styling for profile shortcuts and links */
export function NavRow({ label, icon, accent = 'blue', onPress }: NavRowProps) {
  const tone = accents[accent];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { borderColor: pressed ? tone.border : FF.border },
        pressed && styles.pressed,
        cardShadow,
      ]}
      onPress={onPress}
    >
      <LinearGradient colors={tone.gradient} style={styles.iconWrap}>
        <Ionicons name={icon} size={20} color="#fff" />
      </LinearGradient>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.chevronWrap, { backgroundColor: tone.bg }]}>
        <Ionicons name="chevron-forward" size={14} color={tone.color} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FF.card,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  pressed: {
    opacity: 0.96,
    transform: [{ scale: 0.985 }],
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  label: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: FF.text,
  },
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
