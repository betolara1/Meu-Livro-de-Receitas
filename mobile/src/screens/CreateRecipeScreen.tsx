import React, { useState } from 'react';
import { Alert, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RecipeForm } from '../components/RecipeForm';
import { BottomNavigationBar } from '../components/BottomNavigationBar';
import TopBar from '../components/ui/TopBar';
import { useLanguage } from '../contexts/LanguageContext';
import { db } from '../services/database';
import { Recipe } from '../types/Recipe';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../constants/theme';

type CreateRecipeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CreateRecipeScreen = () => {
  const navigation = useNavigation<CreateRecipeScreenNavigationProp>();
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleCreateRecipe = async (recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'favorites'>) => {
    try {
      setLoading(true);
      
      const newRecipe = await db.createRecipe(recipeData);
      
      Alert.alert(
        t('common.success'),
        t('createRecipe.success'),
        [
          {
          text: t('common.view'),
            onPress: () => {
              navigation.replace('RecipeDetail', { recipeId: newRecipe.id });
            }
          },
          {
            text: t('common.createAnother'),
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
      Alert.alert(t('common.error'), t('createRecipe.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TopBar title={t('createRecipe.title')} />
      <RecipeForm
        onSubmit={handleCreateRecipe}
        submitButtonText={t('createRecipe.save')}
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
