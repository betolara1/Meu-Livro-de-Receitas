import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../components/ui/Button';
import { RecipeCard } from '../components/RecipeCard';
import { Colors, Typography, Spacing } from '../constants/theme';
import { db } from '../services/database';
import { Recipe } from '../types/Recipe';
import { RootStackParamList } from '../navigation/AppNavigator';

type FavoritesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FavoritesScreen = () => {
  const navigation = useNavigation<FavoritesScreenNavigationProp>();
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFavorites = async () => {
    try {
      await db.initialize();
      
      // Carregar receitas favoritas
      const favorites = await db.getFavoriteRecipes();
      setFavoriteRecipes(favorites);
      
      // Carregar IDs dos favoritos
      const favoritesList = await db.getFavorites();
      setFavoriteIds(favoritesList.map(fav => fav.recipeId));
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      Alert.alert('Erro', 'Não foi possível carregar suas receitas favoritas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadFavorites();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadFavorites();
  };

  const handleToggleFavorite = async (recipeId: string) => {
    try {
      const isFavorite = await db.toggleFavorite(recipeId);
      
      if (!isFavorite) {
        // Remover da lista local
        setFavoriteRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
        setFavoriteIds(prev => prev.filter(id => id !== recipeId));
      }
    } catch (error) {
      console.error('Erro ao toggle favorito:', error);
      Alert.alert('Erro', 'Não foi possível atualizar favorito');
    }
  };

  const navigateToRecipe = (recipeId: string) => {
    navigation.navigate('RecipeDetail', { recipeId });
  };

  const navigateToSearch = () => {
    navigation.navigate('MainTabs', { screen: 'Search' } as any);
  };

  const navigateToCreateRecipe = () => {
    navigation.navigate('CreateRecipe');
  };

  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <View style={styles.recipeItem}>
      <RecipeCard
        recipe={item}
        onPress={() => navigateToRecipe(item.id)}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={favoriteIds.includes(item.id)}
      />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="heart-outline" size={64} color={Colors.textSecondary} />
      <Text style={styles.emptyTitle}>Nenhuma receita favorita</Text>
      <Text style={styles.emptySubtitle}>
        Explore receitas e toque no coração para adicionar aos seus favoritos
      </Text>
      
      <View style={styles.emptyActions}>
        <Button
          title="Explorar Receitas"
          onPress={navigateToSearch}
          style={styles.exploreButton}
        />
        <Button
          title="Criar Receita"
          onPress={navigateToCreateRecipe}
          variant="outline"
          style={styles.createButton}
        />
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Suas Receitas Favoritas</Text>
      <Text style={styles.headerSubtitle}>
        {favoriteRecipes.length} receita{favoriteRecipes.length !== 1 ? 's' : ''} salva{favoriteRecipes.length !== 1 ? 's' : ''}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="heart" size={48} color={Colors.primary} />
        <Text style={styles.loadingText}>Carregando favoritos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {favoriteRecipes.length > 0 ? (
        <FlatList
          data={favoriteRecipes}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.recipesList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        renderEmptyState()
      )}
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
    backgroundColor: Colors.background,
  },
  
  loadingText: {
    fontSize: Typography.fontSizes.lg,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  
  header: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  
  headerTitle: {
    fontSize: Typography.fontSizes['2xl'],
    fontWeight: Typography.fontWeights.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  
  headerSubtitle: {
    fontSize: Typography.fontSizes.base,
    color: Colors.textSecondary,
  },
  
  recipesList: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  
  recipeItem: {
    marginBottom: Spacing.md,
  },
  
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  
  emptyTitle: {
    fontSize: Typography.fontSizes['2xl'],
    fontWeight: Typography.fontWeights.bold,
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  
  emptySubtitle: {
    fontSize: Typography.fontSizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeights.normal * Typography.fontSizes.base,
    marginBottom: Spacing.xl,
    maxWidth: 280,
  },
  
  emptyActions: {
    gap: Spacing.md,
    width: '100%',
    maxWidth: 280,
  },
  
  exploreButton: {
    width: '100%',
  },
  
  createButton: {
    width: '100%',
  },
});

export default FavoritesScreen;
