import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Shadows, Spacing } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = true,
}) => {
  const cardStyles = [
    styles.card,
    styles[variant],
    padding && styles.padding,
    style,
  ];

  return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
  },
  
  default: {
    backgroundColor: Colors.card,
  },
  
  elevated: {
    backgroundColor: Colors.card,
    ...Shadows.md,
  },
  
  outlined: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  
  padding: {
    padding: Spacing.md,
  },
});
