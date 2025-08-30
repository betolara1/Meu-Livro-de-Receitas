import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { Colors, Typography, BorderRadius, Spacing } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  style,
  ...props
}) => {
  const inputContainerStyles = [
    styles.inputContainer,
    error && styles.inputContainerError,
  ];

  const inputStyles = [
    styles.input,
    leftIcon && styles.inputWithLeftIcon,
    rightIcon && styles.inputWithRightIcon,
    style,
  ];

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={inputContainerStyles}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <TextInput
          style={inputStyles}
          placeholderTextColor={Colors.textSecondary}
          {...props}
        />
        
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  
  label: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
  },
  
  inputContainerError: {
    borderColor: Colors.error,
  },
  
  input: {
    flex: 1,
    fontSize: Typography.fontSizes.base,
    color: Colors.text,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    minHeight: 44,
  },
  
  inputWithLeftIcon: {
    paddingLeft: Spacing.sm,
  },
  
  inputWithRightIcon: {
    paddingRight: Spacing.sm,
  },
  
  leftIcon: {
    paddingLeft: Spacing.md,
  },
  
  rightIcon: {
    paddingRight: Spacing.md,
  },
  
  error: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
});
