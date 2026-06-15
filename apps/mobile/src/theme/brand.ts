import { StyleSheet } from 'react-native';
import { BRAND_COLORS, BRAND_PHONE, BRAND_PHONE_HREF } from '@mc-labor/shared';

export { BRAND_COLORS, BRAND_PHONE, BRAND_PHONE_HREF };

export const fonts = {
  regular: 'Montserrat_400Regular',
  medium: 'Montserrat_500Medium',
  semiBold: 'Montserrat_600SemiBold',
  bold: 'Montserrat_700Bold',
} as const;

export const brandStyles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  screenMuted: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  heading: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    color: BRAND_COLORS.text,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: BRAND_COLORS.text,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 18,
    lineHeight: 28,
    color: BRAND_COLORS.text,
  },
  note: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  phone: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: BRAND_COLORS.primary,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 0,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#666666',
  },
  cardText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: BRAND_COLORS.primary,
  },
  button: {
    backgroundColor: BRAND_COLORS.button,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 0,
  },
  buttonText: {
    fontFamily: fonts.medium,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontFamily: fonts.semiBold,
    fontWeight: '600',
  },
});

export const headerScreenOptions = {
  headerStyle: { backgroundColor: BRAND_COLORS.button },
  headerTintColor: '#fff',
  headerTitleStyle: brandStyles.headerTitle,
} as const;

export const tabScreenOptions = {
  tabBarActiveTintColor: BRAND_COLORS.primary,
  headerStyle: { backgroundColor: BRAND_COLORS.button },
  headerTintColor: '#fff',
  headerTitleStyle: brandStyles.headerTitle,
} as const;
