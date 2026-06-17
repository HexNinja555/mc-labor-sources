import { type ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts, cardShadow, type AccentKey, accents } from '@/theme/brand';

type StatChipProps = {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent?: AccentKey;
};

export function StatChip({ label, value, icon, accent = 'blue' }: StatChipProps) {
  const tone = accents[accent];

  return (
    <View style={[styles.chip, { backgroundColor: tone.bg, borderColor: tone.border }, cardShadow]}>
      <View style={[styles.iconWrap, { backgroundColor: `${tone.color}18` }]}>
        <Ionicons name={icon} size={18} color={tone.color} />
      </View>
      <Text style={[styles.value, { color: tone.color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

export function StatRow({ children }: { children: ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  chip: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    minHeight: 96,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  value: {
    fontFamily: fonts.bold,
    fontSize: 20,
    letterSpacing: -0.5,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});
