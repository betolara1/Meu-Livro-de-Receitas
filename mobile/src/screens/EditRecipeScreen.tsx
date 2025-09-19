import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RecipeForm } from '../components/RecipeForm';
import { BottomNavigationBar } from '../components/BottomNavigationBar';
import TopBar from '../components/ui/TopBar';
import { Colors, Typography, Spacing } from '../constants/theme';
import { db } from '../services/database';
import { Recipe } from '../types/Recipe';
import { RootStackParamList } from '../navigation/AppNavigator';

type EditRecipeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type EditRecipeScreenRouteProp = RouteProp<RootStackParamList, 'EditRecipe'>;

const EditRecipeScreen = () => {
  const navigation = useNavigation<EditRecipeScreenNavigationProp>();
  const route = useRoute<EditRecipeScreenRouteProp>();
  const { recipeId } = route.params;
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadRecipe();
  }, [recipeId]);

  const loadRecipe = async () => {
    try {
      await db.initialize();
      
      const recipeData = await db.getRecipeById(recipeId);
      if (recipeData) {
        setRecipe(recipeData);
      } else {
        Alert.alert('Erro', 'Receita não encontrada');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Erro ao carregar receita:', error);
      Alert.alert('Erro', 'Não foi possível carregar a receita');
      navigation.goBack();
    } finally {
      setInitialLoading(false);
    }
  };

  const handleUpdateRecipe = async (recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'favorites'>) => {
    try {
      setLoading(true);
      
      const updatedRecipe = await db.updateRecipe(recipeId, recipeData);
      
      if (updatedRecipe) {
        Alert.alert(
          'Sucesso!',
          'Receita atualizada com sucesso!',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        Alert.alert('Erro', 'Não foi possível atualizar a receita');
      }
    } catch (error) {
      console.error('Erro ao atualizar receita:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a receita. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.container}>
        <TopBar title="Editar Receita" />
        <View style={styles.loadingContainer}>
          <Ionicons name="restaurant" size={48} color={Colors.primary} />
          <Text style={styles.loadingText}>Carregando receita...</Text>
        </View>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.container}>
        <TopBar title="Editar Receita" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
          <Text style={styles.errorText}>Receita não encontrada</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar title="Editar Receita" />
      <RecipeForm
        initialData={recipe}
        onSubmit={handleUpdateRecipe}
        submitButtonText="Atualizar Receita"
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
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    fontSize: Typography.fontSizes.lg,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  errorText: {
    fontSize: Typography.fontSizes.lg,
    color: Colors.error,
    marginTop: Spacing.md,
  },
});

export default EditRecipeScreen;
