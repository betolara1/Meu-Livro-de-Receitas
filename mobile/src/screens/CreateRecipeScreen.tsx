import React, { useState } from 'react';
import { Alert, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RecipeForm } from '../components/RecipeForm';
import { BottomNavigationBar } from '../components/BottomNavigationBar';
import TopBar from '../components/ui/TopBar';
import { db } from '../services/database';
import { Recipe } from '../types/Recipe';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../constants/theme';

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
    <View style={styles.container}>
      <TopBar title="Nova Receita" />
      <RecipeForm
        onSubmit={handleCreateRecipe}
        submitButtonText="Criar Receita"
        loading={loading}
      />
      <BottomNavigationBar currentScreen="Home" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});

export default CreateRecipeScreen;
