import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius, Spacing } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: string | React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  leftIcon,
}) => {
  const buttonStyles = [
    styles.button,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <Pressable
      style={({ pressed }) => [
        buttonStyles,
        pressed && !disabled && !loading && styles.pressed
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      android_ripple={{
        color: variant === 'primary' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
        borderless: false,
      }}
      hitSlop={8}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? Colors.background : Colors.primary} 
        />
      ) : (
        <>
          {leftIcon && (
            typeof leftIcon === 'string' ? (
              <Ionicons 
                name={leftIcon as keyof typeof Ionicons.glyphMap} 
                size={20} 
                color={variant === 'primary' ? Colors.background : Colors.primary} 
              />
            ) : (
              leftIcon
            )
          )}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  
  // Variants
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  
  // Sizes
  sm: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 36,
  },
  md: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 44,
  },
  lg: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    minHeight: 52,
  },
  
  // Text styles
  text: {
    fontWeight: Typography.fontWeights.medium,
    textAlign: 'center',
  },
  primaryText: {
    color: Colors.background,
    fontSize: Typography.fontSizes.base,
  },
  secondaryText: {
    color: Colors.text,
    fontSize: Typography.fontSizes.base,
  },
  outlineText: {
    color: Colors.primary,
    fontSize: Typography.fontSizes.base,
  },
  ghostText: {
    color: Colors.primary,
    fontSize: Typography.fontSizes.base,
  },
  
  // Size text
  smText: {
    fontSize: Typography.fontSizes.sm,
  },
  mdText: {
    fontSize: Typography.fontSizes.base,
  },
  lgText: {
    fontSize: Typography.fontSizes.lg,
  },
  
  // Disabled
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: Colors.textSecondary,
  },
  
  // Pressed state
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
