import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { RecipeCard } from '../components/RecipeCard';
import { Colors, Typography, Spacing } from '../constants/theme';
import { db } from '../services/database';
import { Recipe, Category, RecipeFilters } from '../types/Recipe';
import { RootStackParamList } from '../navigation/AppNavigator';

type SearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SearchScreen = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const [searchText, setSearchText] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const difficulties = [
    { value: '', label: 'Todas' },
    { value: 'facil', label: 'Fácil' },
    { value: 'medio', label: 'Médio' },
    { value: 'dificil', label: 'Difícil' },
  ];

  const loadData = async () => {
    try {
      await db.initialize();
      
      // Carregar categorias
      const allCategories = await db.getCategories();
      setCategories(allCategories);

      // Carregar favoritos
      const favorites = await db.getFavorites();
      setFavoriteRecipes(favorites.map(fav => fav.recipeId));

      // Carregar todas as receitas inicialmente
      await searchRecipes();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados');
    }
  };

  const searchRecipes = async () => {
    try {
      setLoading(true);
      
      const filters: RecipeFilters = {};
      
      if (searchText.trim()) {
        filters.search = searchText.trim();
      }
      
      if (selectedCategory) {
        filters.category = selectedCategory;
      }
      
      if (selectedDifficulty) {
        filters.difficulty = selectedDifficulty;
      }

      const results = await db.searchRecipes(filters);
      setRecipes(results);
    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
      Alert.alert('Erro', 'Não foi possível buscar receitas');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchRecipes();
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [searchText, selectedCategory, selectedDifficulty]);

  const handleToggleFavorite = async (recipeId: string) => {
    try {
      const isFavorite = await db.toggleFavorite(recipeId);
      
      if (isFavorite) {
        setFavoriteRecipes(prev => [...prev, recipeId]);
      } else {
        setFavoriteRecipes(prev => prev.filter(id => id !== recipeId));
      }

      // Atualizar a receita na lista para refletir o novo contador de favoritos
      const updatedRecipe = await db.getRecipeById(recipeId);
      if (updatedRecipe) {
        setRecipes(prev => 
          prev.map(recipe => 
            recipe.id === recipeId ? updatedRecipe : recipe
          )
        );
      }
    } catch (error) {
      console.error('Erro ao toggle favorito:', error);
      Alert.alert('Erro', 'Não foi possível atualizar favorito');
    }
  };

  const navigateToRecipe = (recipeId: string) => {
    navigation.navigate('RecipeDetail', { recipeId });
  };

  const clearFilters = () => {
    setSearchText('');
    setSelectedCategory('');
    setSelectedDifficulty('');
  };

  const hasActiveFilters = searchText || selectedCategory || selectedDifficulty;

  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <View style={styles.recipeItem}>
      <RecipeCard
        recipe={item}
        onPress={() => navigateToRecipe(item.id)}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={favoriteRecipes.includes(item.id)}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchSection}>
        <Input
          placeholder="Buscar receitas, ingredientes..."
          value={searchText}
          onChangeText={setSearchText}
          leftIcon={<Ionicons name="search" size={20} color={Colors.textSecondary} />}
          rightIcon={
            searchText ? (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            ) : null
          }
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filtersContainer}>
            {/* Clear Filters */}
            {hasActiveFilters && (
              <TouchableOpacity onPress={clearFilters}>
                <Badge variant="error" size="md" style={styles.filterBadge}>
                  <Ionicons name="close" size={14} color={Colors.background} />
                  <Text style={styles.clearFiltersText}> Limpar</Text>
                </Badge>
              </TouchableOpacity>
            )}

            {/* Categories */}
            <TouchableOpacity onPress={() => setSelectedCategory('')}>
              <Badge
                variant={selectedCategory === '' ? 'default' : 'secondary'}
                size="md"
                style={styles.filterBadge}
              >
                Todas Categorias
              </Badge>
            </TouchableOpacity>

            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.slug)}
              >
                <Badge
                  variant={selectedCategory === category.slug ? 'default' : 'secondary'}
                  size="md"
                  style={styles.filterBadge}
                >
                  {category.name}
                </Badge>
              </TouchableOpacity>
            ))}

            {/* Difficulties */}
            {difficulties.map((difficulty) => (
              <TouchableOpacity
                key={difficulty.value}
                onPress={() => setSelectedDifficulty(difficulty.value)}
              >
                <Badge
                  variant={selectedDifficulty === difficulty.value ? 'default' : 'secondary'}
                  size="md"
                  style={styles.filterBadge}
                >
                  {difficulty.label}
                </Badge>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Results */}
      <View style={styles.resultsSection}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {loading ? 'Buscando...' : `${recipes.length} receita${recipes.length !== 1 ? 's' : ''} encontrada${recipes.length !== 1 ? 's' : ''}`}
          </Text>
        </View>

        {recipes.length > 0 ? (
          <FlatList
            data={recipes}
            renderItem={renderRecipeItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.recipesList}
          />
        ) : !loading ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>Nenhuma receita encontrada</Text>
            <Text style={styles.emptySubtitle}>
              {hasActiveFilters
                ? 'Tente ajustar os filtros ou buscar por outros termos'
                : 'Comece digitando para buscar receitas'}
            </Text>
            {hasActiveFilters && (
              <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>Limpar Filtros</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  searchSection: {
    padding: Spacing.lg,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  
  filtersSection: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  
  filterBadge: {
    marginRight: Spacing.sm,
  },
  
  clearFiltersText: {
    color: Colors.background,
    fontSize: 12,
  },
  
  resultsSection: {
    flex: 1,
  },
  
  resultsHeader: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  
  resultsCount: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },
  
  recipesList: {
    padding: Spacing.lg,
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
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  
  emptySubtitle: {
    fontSize: Typography.fontSizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeights.normal * Typography.fontSizes.base,
    marginBottom: Spacing.lg,
  },
  
  clearButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  
  clearButtonText: {
    color: Colors.background,
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.medium,
  },
});

export default SearchScreen;
