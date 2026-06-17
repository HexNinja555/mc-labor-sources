import { View, Text, Image, Pressable, StyleSheet, type ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fonts, FF, cardShadow } from '@/theme/brand';

type ImageBannerProps = {
  source: ImageSourcePropType;
  title: string;
  subtitle?: string;
  /** card = inset rounded; full = edge-to-edge with curved bottom; compact = login */
  variant?: 'card' | 'full' | 'compact';
  /** Floating back button for stack detail screens */
  showBack?: boolean;
};

const VARIANTS = {
  card: { height: 168, titleSize: 24, subtitleSize: 14, hPad: 20, vPad: 20, radius: 24, marginBottom: 20 },
  full: { height: 208, titleSize: 28, subtitleSize: 15, hPad: 24, vPad: 24, radius: 0, marginBottom: 0 },
  compact: { height: 112, titleSize: 20, subtitleSize: 13, hPad: 16, vPad: 16, radius: 20, marginBottom: 16 },
} as const;

export function ImageBanner({
  source,
  title,
  subtitle,
  variant = 'card',
  showBack = false,
}: ImageBannerProps) {
  const dim = VARIANTS[variant];
  const isFull = variant === 'full';
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrap,
        isFull ? styles.wrapFull : styles.wrapCard,
        {
          height: dim.height + (showBack && isFull ? insets.top : 0),
          marginBottom: dim.marginBottom,
          borderRadius: dim.radius,
        },
        variant === 'card' && cardShadow,
      ]}
    >
      <Image source={source} style={styles.image} resizeMode="cover" />
      <LinearGradient
        colors={
          isFull
            ? ['rgba(37, 99, 235, 0.35)', 'rgba(79, 70, 229, 0.65)', 'rgba(15, 23, 42, 0.88)']
            : ['rgba(37, 99, 235, 0.55)', 'rgba(15, 23, 42, 0.78)']
        }
        locations={isFull ? [0, 0.45, 1] : undefined}
        style={StyleSheet.absoluteFill}
      />

      {isFull ? (
        <>
          <View style={styles.fullOrb} pointerEvents="none" />
          <View style={styles.fullOrbSmall} pointerEvents="none" />
        </>
      ) : null}

      {showBack ? (
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backBtn,
            { top: insets.top + 10 },
            pressed && styles.backBtnPressed,
          ]}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </Pressable>
      ) : null}

      <View
        style={[
          styles.textWrap,
          {
            paddingHorizontal: dim.hPad,
            paddingBottom: dim.vPad,
            paddingTop: showBack && isFull ? insets.top + 56 : isFull ? 28 : dim.vPad,
          },
        ]}
      >
        <Text style={[styles.title, { fontSize: dim.titleSize }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { fontSize: dim.subtitleSize }]}>{subtitle}</Text>
        ) : null}
      </View>

      {isFull ? <View style={styles.fullBottomFade} pointerEvents="none" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    width: '100%',
  },
  wrapCard: {
    borderWidth: 1,
    borderColor: FF.borderInput,
  },
  wrapFull: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  fullOrb: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  fullOrbSmall: {
    position: 'absolute',
    bottom: 40,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
  },
  textWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  title: {
    fontFamily: fonts.bold,
    color: '#fff',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontFamily: fonts.regular,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 6,
    lineHeight: 22,
  },
  fullBottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: FF.bg,
    opacity: 0.15,
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    zIndex: 2,
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  backBtnPressed: {
    opacity: 0.88,
  },
});
