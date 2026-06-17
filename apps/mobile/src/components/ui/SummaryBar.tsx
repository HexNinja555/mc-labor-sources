import { StyleSheet, Text, View } from 'react-native';
import { FF, fonts } from '@/theme/brand';

type SummaryBarProps = {
  status: string;
  statusColors: { bg: string; text: string; border: string };
  meta: string;
};

/** Status pill + meta row used on detail screens */
export function SummaryBar({ status, statusColors: badge, meta }: SummaryBarProps) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.badge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
        <Text style={[styles.badgeText, { color: badge.text }]}>{status}</Text>
      </View>
      <Text style={styles.meta} numberOfLines={2}>
        {meta}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: FF.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: FF.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  meta: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: FF.textSecondary,
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
});
