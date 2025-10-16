import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, fontSize, fontWeight } from '../../theme/spacing';

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
  },

  // Variantes
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  dangerButton: {
    backgroundColor: colors.error,
  },

  // Tamaños
  smallButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  mediumButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  largeButton: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },

  // Estado deshabilitado
  disabledButton: {
    opacity: 0.5,
  },

  // Texto base
  text: {
    fontWeight: fontWeight.semibold,
  },

  // Texto por variante
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.primary,
  },
  dangerText: {
    color: colors.white,
  },

  // Texto por tamaño
  smallText: {
    fontSize: fontSize.sm,
  },
  mediumText: {
    fontSize: fontSize.md,
  },
  largeText: {
    fontSize: fontSize.lg,
  },
});