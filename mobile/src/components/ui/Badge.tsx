import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Typography, BorderRadius, Spacing } from '../../constants/theme';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  style,
  textStyle,
}) => {
  const badgeStyles = [
    styles.badge,
    styles[variant],
    styles[size],
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    textStyle,
  ];

  return (
    <View style={badgeStyles}>
      <Text style={textStyles}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Variants
  default: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.secondary,
  },
  success: {
    backgroundColor: Colors.success,
  },
  warning: {
    backgroundColor: Colors.warning,
  },
  error: {
    backgroundColor: Colors.error,
  },
  
  // Sizes
  sm: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    minHeight: 20,
  },
  md: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    minHeight: 24,
  },
  lg: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    minHeight: 32,
  },
  
  // Text styles
  text: {
    fontWeight: Typography.fontWeights.medium,
    textAlign: 'center',
  },
  defaultText: {
    color: Colors.background,
  },
  secondaryText: {
    color: Colors.text,
  },
  successText: {
    color: Colors.background,
  },
  warningText: {
    color: Colors.text,
  },
  errorText: {
    color: Colors.background,
  },
  
  // Size text
  smText: {
    fontSize: Typography.fontSizes.xs,
  },
  mdText: {
    fontSize: Typography.fontSizes.sm,
  },
  lgText: {
    fontSize: Typography.fontSizes.base,
  },
});
