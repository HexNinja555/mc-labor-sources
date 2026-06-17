import { type ReactNode } from 'react';
import { View, ImageBackground, StyleSheet, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FF } from '@/theme/brand';
import { IMAGERY } from '@/constants/imagery';

type AppBackgroundProps = {
  children?: ReactNode;
  style?: ViewStyle;
  /** Show subtle brand photo wash behind content */
  photo?: boolean;
};

export function AppBackground({ children, style, photo = true }: AppBackgroundProps) {
  return (
    <View style={[styles.root, style]}>
      {photo ? (
        <ImageBackground source={IMAGERY.background} style={StyleSheet.absoluteFill} resizeMode="cover">
          <View style={styles.photoWash} />
        </ImageBackground>
      ) : null}

      <LinearGradient
        colors={['rgba(37, 99, 235, 0.07)', 'rgba(248, 250, 252, 0)', 'rgba(79, 70, 229, 0.05)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={styles.orbBlue} pointerEvents="none" />
      <View style={styles.orbIndigo} pointerEvents="none" />

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    backgroundColor: FF.bg,
    overflow: 'hidden',
  },
  photoWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248, 250, 252, 0.88)',
  },
  orbBlue: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
  },
  orbIndigo: {
    position: 'absolute',
    bottom: 120,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(79, 70, 229, 0.06)',
  },
  content: {
    flex: 1,
  },
});
