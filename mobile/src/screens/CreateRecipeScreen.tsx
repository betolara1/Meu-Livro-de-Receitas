import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RecipeForm } from '../components/RecipeForm';
import { db } from '../services/database';
import { Recipe } from '../types/Recipe';
import { RootStackParamList } from '../navigation/AppNavigator';

type CreateRecipeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CreateRecipeScreen = () => {
  const navigation = useNavigation<CreateRecipeScreenNavigationProp>();
  const [loading, setLoading] = useState(false);

  const handleCreateRecipe = async (recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'favorites'>) => {
    try {
      setLoading(true);
      
      const newRecipe = await db.createRecipe(recipeData);
      
      Alert.alert(
        'Sucesso!',
        'Receita criada com sucesso!',
        [
          {
            text: 'Ver Receita',
            onPress: () => {
              navigation.replace('RecipeDetail', { recipeId: newRecipe.id });
            }
          },
          {
            text: 'Criar Outra',
            style: 'cancel',
            onPress: () => {
              // Reset the form by navigating back and forth
              navigation.goBack();
              setTimeout(() => {
                navigation.navigate('CreateRecipe');
              }, 100);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao criar receita:', error);
      Alert.alert('Erro', 'Não foi possível criar a receita. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RecipeForm
      onSubmit={handleCreateRecipe}
      submitButtonText="Criar Receita"
      loading={loading}
    />
  );
};

export default CreateRecipeScreen;
