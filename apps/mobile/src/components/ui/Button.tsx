import { Pressable, Text, ActivityIndicator, StyleSheet, View, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme, fonts, FF, cardShadow } from '@/theme/brand';

type ButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'danger' | 'outline' | 'ghost' | 'ghostDanger' | 'success';
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  icon,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const variantStyle =
    variant === 'danger'
      ? styles.danger
      : variant === 'success'
        ? styles.success
        : variant === 'outline'
          ? styles.outline
          : variant === 'ghostDanger'
            ? styles.ghostDanger
            : variant === 'ghost'
              ? styles.ghost
              : styles.primary;

  const textStyle =
    variant === 'outline'
      ? styles.outlineText
      : variant === 'ghostDanger'
        ? styles.ghostDangerText
        : variant === 'ghost'
          ? styles.ghostText
          : styles.primaryText;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.wrap,
        variantStyle,
        style,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? FF.primary : '#fff'} />
      ) : (
        <View style={styles.inner}>
          {icon ? (
            <Ionicons
              name={icon}
              size={18}
              color={variant === 'outline' ? FF.primary : variant === 'ghost' || variant === 'ghostDanger' ? (variant === 'ghostDanger' ? FF.red500 : FF.textSecondary) : '#fff'}
            />
          ) : null}
          <Text style={textStyle}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    marginTop: 8,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  primary: {
    backgroundColor: FF.primary,
    ...cardShadow,
  },
  primaryText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: '#fff',
  },
  success: {
    backgroundColor: FF.green500,
    ...cardShadow,
  },
  danger: {
    backgroundColor: FF.red500,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: FF.borderInput,
  },
  outlineText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: FF.primary,
  },
  ghost: {
    backgroundColor: '#F1F5F9',
  },
  ghostDanger: {
    backgroundColor: FF.red50,
  },
  ghostText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: FF.textSecondary,
  },
  ghostDangerText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: FF.red500,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});
