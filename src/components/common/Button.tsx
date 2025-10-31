import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../../styles/colors';
import { spacing, borderRadius, fontSize, fontWeight } from '../../styles/spacing';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle[] => {
    const baseStyle = [styles.button];

    // Variantes
    if (variant === 'primary') baseStyle.push(styles.primaryButton);
    if (variant === 'secondary') baseStyle.push(styles.secondaryButton);
    if (variant === 'outline') baseStyle.push(styles.outlineButton);
    if (variant === 'danger') baseStyle.push(styles.dangerButton);

    // Tamaños
    if (size === 'small') baseStyle.push(styles.smallButton);
    if (size === 'medium') baseStyle.push(styles.mediumButton);
    if (size === 'large') baseStyle.push(styles.largeButton);

    // Estados
    if (disabled || loading) baseStyle.push(styles.disabledButton);

    return baseStyle;
  };

  const getTextStyle = (): TextStyle[] => {
    const baseStyle = [styles.text];

    // Variantes de texto
    if (variant === 'primary') baseStyle.push(styles.primaryText);
    if (variant === 'secondary') baseStyle.push(styles.secondaryText);
    if (variant === 'outline') baseStyle.push(styles.outlineText);
    if (variant === 'danger') baseStyle.push(styles.dangerText);

    // Tamaños de texto
    if (size === 'small') baseStyle.push(styles.smallText);
    if (size === 'medium') baseStyle.push(styles.mediumText);
    if (size === 'large') baseStyle.push(styles.largeText);

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? colors.primary : colors.white}
        />
      ) : (
        <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  } as const,

  // Variantes
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: colors.secondary,
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: colors.error,
  },

  // Tamaños
  smallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  mediumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  largeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },

  // Estado deshabilitado
  disabledButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    opacity: 0.5,
  },

  // Texto base
  text: {
    fontWeight: fontWeight.semibold,
  } as const,

  // Texto por variante
  primaryText: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
  secondaryText: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
  outlineText: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  dangerText: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },

  // Texto por tamaño
  smallText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  mediumText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  largeText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
});