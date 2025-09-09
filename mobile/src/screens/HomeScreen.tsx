import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { RecipeCard } from '../components/RecipeCard';
import { useAuth } from '../contexts/AuthContext';
import { Colors, Typography, Spacing } from '../constants/theme';
import { db } from '../services/database';
import { Recipe, Category } from '../types/Recipe';
import { RootStackParamList } from '../navigation/AppNavigator';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user, signOut } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      // Inicializar banco de dados
      await db.initialize();

      // Carregar receitas
      const allRecipes = await db.getAllRecipes();
      setRecipes(allRecipes.slice(0, 6)); // Mostrar apenas 6 receitas na home

      // Carregar categorias
      const allCategories = await db.getCategories();
      setCategories(allCategories);

      // Carregar favoritos
      const favorites = await db.getFavorites();
      setFavoriteRecipes(favorites.map(fav => fav.recipeId));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleToggleFavorite = async (recipeId: string) => {
    try {
      const isFavorite = await db.toggleFavorite(recipeId);
      
      if (isFavorite) {
        setFavoriteRecipes(prev => [...prev, recipeId]);
      } else {
        setFavoriteRecipes(prev => prev.filter(id => id !== recipeId));
      }

      // Atualizar a lista de receitas para refletir o novo contador de favoritos
      const updatedRecipes = await db.getAllRecipes();
      setRecipes(updatedRecipes.slice(0, 6));
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

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível sair da conta');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="restaurant" size={48} color={Colors.primary} />
        <Text style={styles.loadingText}>Carregando receitas...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* User Header */}
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            {user?.photo ? (
              <Text style={styles.userAvatarText}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            ) : (
              <Ionicons name="person" size={24} color={Colors.primary} />
            )}
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userGreeting}>Olá, {user?.name || 'Usuário'}!</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Seu Livro de Receitas</Text>
        <Text style={styles.heroSubtitle}>
          Descubra, crie e compartilhe receitas incríveis. Sua coleção pessoal de sabores únicos.
        </Text>

        {/* Search Button */}
        <TouchableOpacity style={styles.searchButton} onPress={navigateToSearch}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <Text style={styles.searchPlaceholder}>
            Buscar receitas, ingredientes ou categorias...
          </Text>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categorias</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => {
                // Navegar para busca com categoria filtrada
                navigation.navigate('MainTabs', { 
                  screen: 'Search',
                  params: { category: category.slug }
                } as any);
              }}
            >
              <Badge
                variant={category.isDefault ? 'secondary' : 'default'}
                size="md"
                style={styles.categoryBadge}
              >
                {category.name}
              </Badge>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Featured Recipes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {recipes.length > 0 ? 'Suas Receitas' : 'Receitas em Destaque'}
          </Text>
          {recipes.length > 6 && (
            <TouchableOpacity onPress={navigateToSearch}>
              <Text style={styles.seeAllText}>Ver todas</Text>
            </TouchableOpacity>
          )}
        </View>

        {recipes.length > 0 ? (
          <View style={styles.recipesGrid}>
            {recipes.map((recipe) => (
              <View key={recipe.id} style={styles.recipeCardContainer}>
                <RecipeCard
                  recipe={recipe}
                  onPress={() => navigateToRecipe(recipe.id)}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={favoriteRecipes.includes(recipe.id)}
                />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>Nenhuma receita encontrada</Text>
            <Text style={styles.emptySubtitle}>Comece criando sua primeira receita!</Text>
            <Button
              title="Criar Primeira Receita"
              onPress={navigateToCreateRecipe}
              style={styles.createButton}
            />
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={navigateToCreateRecipe}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.primary + '20' }]}>
              <Ionicons name="add" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.actionTitle}>Criar Receita</Text>
            <Text style={styles.actionSubtitle}>
              Adicione suas receitas favoritas com fotos e instruções detalhadas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={navigateToSearch}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.accent + '20' }]}>
              <Ionicons name="search" size={24} color={Colors.accent} />
            </View>
            <Text style={styles.actionTitle}>Descobrir</Text>
            <Text style={styles.actionSubtitle}>
              Explore receitas por ingredientes, tempo de preparo ou categoria
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard} 
            onPress={() => navigation.navigate('MainTabs', { screen: 'Favorites' } as any)}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.error + '20' }]}>
              <Ionicons name="heart" size={24} color={Colors.error} />
            </View>
            <Text style={styles.actionTitle}>Favoritos</Text>
            <Text style={styles.actionSubtitle}>
              Salve suas receitas preferidas para acesso rápido
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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

  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },

  userAvatarText: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
  },

  userDetails: {
    flex: 1,
  },

  userGreeting: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.text,
  },

  userEmail: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  logoutButton: {
    padding: Spacing.sm,
  },
  
  heroSection: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  
  heroTitle: {
    fontSize: Typography.fontSizes['3xl'],
    fontWeight: Typography.fontWeights.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  
  heroSubtitle: {
    fontSize: Typography.fontSizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeights.relaxed * Typography.fontSizes.base,
    marginBottom: Spacing.xl,
  },
  
  searchButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  
  searchPlaceholder: {
    fontSize: Typography.fontSizes.base,
    color: Colors.textSecondary,
    marginLeft: Spacing.md,
    flex: 1,
  },
  
  section: {
    marginBottom: Spacing.xl,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  
  sectionTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.text,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  
  seeAllText: {
    fontSize: Typography.fontSizes.base,
    color: Colors.primary,
    fontWeight: Typography.fontWeights.medium,
  },
  
  categoriesContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  
  categoryBadge: {
    marginRight: Spacing.sm,
  },
  
  recipesGrid: {
    paddingHorizontal: Spacing.lg,
  },
  
  recipeCardContainer: {
    marginBottom: Spacing.md,
  },
  
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  
  emptyTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  
  emptySubtitle: {
    fontSize: Typography.fontSizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  
  createButton: {
    paddingHorizontal: Spacing.xl,
  },
  
  quickActions: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
  },
  
  actionsGrid: {
    gap: Spacing.lg,
  },
  
  actionCard: {
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  
  actionTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  
  actionSubtitle: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeights.normal * Typography.fontSizes.sm,
  },
});

export default HomeScreen;
