import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius, Spacing } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: string | React.ReactNode;
  rightIcon?: string | React.ReactNode;
  onRightIconPress?: () => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
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
        {leftIcon && (
          <View style={styles.leftIcon}>
            {typeof leftIcon === 'string' ? (
              <Ionicons 
                name={leftIcon as keyof typeof Ionicons.glyphMap} 
                size={20} 
                color={Colors.textSecondary} 
              />
            ) : (
              leftIcon
            )}
          </View>
        )}
        
        <TextInput
          style={inputStyles}
          placeholderTextColor={Colors.textSecondary}
          {...props}
        />
        
        {rightIcon && (
          <TouchableOpacity 
            style={styles.rightIcon} 
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {typeof rightIcon === 'string' ? (
              <Ionicons 
                name={rightIcon as keyof typeof Ionicons.glyphMap} 
                size={20} 
                color={Colors.textSecondary} 
              />
            ) : (
              rightIcon
            )}
          </TouchableOpacity>
        )}
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
