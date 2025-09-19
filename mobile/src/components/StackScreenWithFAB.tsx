import React from 'react';
import { View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { FloatingActionButton } from './FloatingActionButton';

interface StackScreenWithFABProps {
  children: React.ReactNode;
  onFABPress: () => void;
}

export const StackScreenWithFAB: React.FC<StackScreenWithFABProps> = ({ 
  children, 
  onFABPress 
}) => {
  const route = useRoute();
  
  // Ocultar FAB na tela de perfil/configurações e na tela de criar receita
  const shouldShowFAB = route.name !== 'Profile' && route.name !== 'CreateRecipe' && route.name !== 'EditRecipe' && route.name !== 'RecipeDetail';

  return (
    <View style={{ flex: 1 }}>
      {children}
      {shouldShowFAB && (
        <FloatingActionButton onPress={onFABPress} />
      )}
    </View>
  );
};
