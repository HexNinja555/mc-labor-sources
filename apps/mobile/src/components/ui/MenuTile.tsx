import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme, fonts, FF, cardShadow, type AccentKey, accents } from '@/theme/brand';
import { IMAGERY } from '@/constants/imagery';

type MenuTileProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent?: AccentKey;
  onPress?: () => void;
};

export function MenuTile({ label, icon, accent = 'blue', onPress }: MenuTileProps) {
  const tone = accents[accent];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.tile,
        { borderColor: pressed ? tone.border : FF.border },
        pressed && styles.pressed,
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

type HomeHeroProps = {
  firstName: string;
  assignmentCount?: number;
  onShift?: boolean;
};

export function HomeHero({ firstName, assignmentCount = 0, onShift = false }: HomeHeroProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <View style={[styles.heroCard, cardShadow]}>
      <Image source={IMAGERY.heroWorkforce} style={styles.heroImage} resizeMode="cover" />
      <LinearGradient
        colors={['rgba(37, 99, 235, 0.92)', 'rgba(79, 70, 229, 0.88)']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.heroContent}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroTextBlock}>
            <Text style={styles.heroGreeting}>{greeting},</Text>
            <Text style={styles.heroName}>{firstName}</Text>
            <Text style={styles.heroSub}>Your field command center</Text>
          </View>
          <View style={styles.heroBadge}>
            <Ionicons name={onShift ? 'radio-button-on' : 'shield-checkmark'} size={14} color="#fff" />
            <Text style={styles.heroBadgeText}>{onShift ? 'On shift' : 'Ready'}</Text>
          </View>
        </View>
        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{assignmentCount}</Text>
            <Text style={styles.heroStatLabel}>Assignments</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Ionicons name="construct-outline" size={18} color="#fff" />
            <Text style={styles.heroStatLabel}>MC Labor Sources</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/** Login hero — authentication artwork with a modern frosted brand wash */
export function AuthHero() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <View style={[styles.authHeroCard, cardShadow]}>
      <Image source={IMAGERY.heroAuthentication} style={styles.authHeroImage} resizeMode="cover" />
      <LinearGradient
        colors={[
          'rgba(37, 99, 235, 0.52)',
          'rgba(59, 130, 246, 0.58)',
          'rgba(79, 70, 229, 0.74)',
        ]}
        locations={[0, 0.42, 1]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.16)', 'rgba(255, 255, 255, 0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.authHeroSheen}
      />
      <View style={styles.authBadge}>
        <Ionicons name="shield-checkmark" size={14} color="#fff" />
        <Text style={styles.heroBadgeText}>Secure</Text>
      </View>
      <View style={styles.authHeroContent}>
        <View style={styles.authGlassPanel}>
          <Text style={styles.authGreeting}>{greeting}</Text>
          <Text style={styles.authTitle}>Worker Portal</Text>
          <Text style={styles.authSub}>Sign in to your field command center</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    minHeight: 168,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroContent: {
    padding: 20,
    justifyContent: 'space-between',
    minHeight: 168,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroTextBlock: {
    flex: 1,
  },
  heroGreeting: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  heroName: {
    fontFamily: fonts.bold,
    fontSize: 26,
    color: '#fff',
    marginTop: 2,
    letterSpacing: -0.6,
  },
  heroSub: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  heroBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: '#fff',
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  heroStatValue: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: '#fff',
  },
  heroStatLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  heroStatDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  authHeroCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    minHeight: 188,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    backgroundColor: '#1E3A8A',
  },
  authHeroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.42,
  },
  authHeroSheen: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,
  },
  authBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.32)',
  },
  authHeroContent: {
    flex: 1,
    minHeight: 188,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 16,
  },
  authGlassPanel: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  authGreeting: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.82)',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  authTitle: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: '#fff',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  authSub: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.86)',
    marginTop: 4,
    lineHeight: 18,
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FF.card,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    ...cardShadow,
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
    marginRight: 14,
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
