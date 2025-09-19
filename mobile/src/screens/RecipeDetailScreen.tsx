import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { BottomNavigationBar } from '../components/BottomNavigationBar';
import TopBar from '../components/ui/TopBar';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { db } from '../services/database';
import { Recipe } from '../types/Recipe';
import { RootStackParamList } from '../navigation/AppNavigator';

type RecipeDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RecipeDetailScreenRouteProp = RouteProp<RootStackParamList, 'RecipeDetail'>;

const { width } = Dimensions.get('window');

const RecipeDetailScreen = () => {
  const navigation = useNavigation<RecipeDetailScreenNavigationProp>();
  const route = useRoute<RecipeDetailScreenRouteProp>();
  const { recipeId } = route.params;
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    loadRecipe();
  }, [recipeId]);

  const loadRecipe = async () => {
    try {
      await db.initialize();
      
      const recipeData = await db.getRecipeById(recipeId);
      if (recipeData) {
        setRecipe(recipeData);
        
        // Verificar se é favorito
        const favoriteStatus = await db.isFavorite(recipeId);
        setIsFavorite(favoriteStatus);
      } else {
        Alert.alert('Erro', 'Receita não encontrada');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Erro ao carregar receita:', error);
      Alert.alert('Erro', 'Não foi possível carregar a receita');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const newFavoriteStatus = await db.toggleFavorite(recipeId);
      setIsFavorite(newFavoriteStatus);
      
      // Atualizar o contador de favoritos na receita
      const updatedRecipe = await db.getRecipeById(recipeId);
      if (updatedRecipe) {
        setRecipe(updatedRecipe);
      }
    } catch (error) {
      console.error('Erro ao toggle favorito:', error);
      Alert.alert('Erro', 'Não foi possível atualizar favorito');
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditRecipe', { recipeId });
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta receita? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              const deleted = await db.deleteRecipe(recipeId);
              if (deleted) {
                Alert.alert('Sucesso', 'Receita excluída com sucesso');
                navigation.goBack();
              } else {
                Alert.alert('Erro', 'Não foi possível excluir a receita');
              }
            } catch (error) {
              console.error('Erro ao excluir receita:', error);
              Alert.alert('Erro', 'Não foi possível excluir a receita');
            }
          }
        }
      ]
    );
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'facil':
        return 'Fácil';
      case 'medio':
        return 'Médio';
      case 'dificil':
        return 'Difícil';
      default:
        return 'Médio';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facil':
        return 'success';
      case 'medio':
        return 'warning';
      case 'dificil':
        return 'error';
      default:
        return 'warning';
    }
  };

  const getTotalTime = () => {
    if (!recipe) return 0;
    const prep = parseInt(recipe.prepTime) || 0;
    const cook = parseInt(recipe.cookTime) || 0;
    return prep + cook;
  };

  const renderHeaderButtons = () => (
    <View style={styles.headerButtons}>
      <TouchableOpacity onPress={handleToggleFavorite} style={styles.headerButton}>
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={24}
          color={isFavorite ? Colors.error : Colors.text}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
        <Ionicons name="create-outline" size={24} color={Colors.text} />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
        <Ionicons name="trash-outline" size={24} color={Colors.error} />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <TopBar title="Receita" rightComponent={renderHeaderButtons()} />
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
        <TopBar title="Receita" rightComponent={renderHeaderButtons()} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
          <Text style={styles.errorText}>Receita não encontrada</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar title={recipe.title} rightComponent={renderHeaderButtons()} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          {recipe.imageUrl && !imageError ? (
            <Image
              source={{ uri: recipe.imageUrl }}
              style={styles.image}
              onError={() => setImageError(true)}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="restaurant" size={80} color={Colors.textSecondary} />
            </View>
          )}
          
          {/* Temperature overlay */}
          {recipe.temperature && (
            <View style={styles.temperatureOverlay}>
              <Badge variant="default" size="sm">
                <Ionicons name="thermometer-outline" size={12} color={Colors.background} />
                <Text style={styles.temperatureText}> {recipe.temperature}</Text>
              </Badge>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title and Description */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{recipe.title}</Text>
            <Text style={styles.description}>{recipe.description}</Text>
          </View>

          {/* Tags */}
          {recipe.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagsContainer}>
                {recipe.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" size="sm">
                    {tag}
                  </Badge>
                ))}
              </View>
            </View>
          )}

          {/* Info Cards */}
          <View style={styles.infoSection}>
            <View style={styles.infoGrid}>
              <Card style={styles.infoCard}>
                <View style={styles.infoItem}>
                  <Ionicons name="time-outline" size={24} color={Colors.primary} />
                  <Text style={styles.infoLabel}>Preparo</Text>
                  <Text style={styles.infoValue}>{recipe.prepTime} min</Text>
                </View>
              </Card>

            <Card style={styles.infoCard}>
              <View style={styles.infoItem}>
                <Ionicons name="flame-outline" size={24} color={Colors.accent} />
                <Text style={styles.infoLabel}>Cozimento</Text>
                <Text style={styles.infoValue}>{recipe.cookTime} min</Text>
              </View>
            </Card>

            <Card style={styles.infoCard}>
              <View style={styles.infoItem}>
                <Ionicons name="people-outline" size={24} color={Colors.success} />
                <Text style={styles.infoLabel}>Porções</Text>
                <Text style={styles.infoValue}>{recipe.servings}</Text>
              </View>
            </Card>

            <Card style={styles.infoCard}>
              <View style={styles.infoItem}>
                <Ionicons 
                  name="speedometer-outline" 
                  size={24} 
                  color={recipe.difficulty === 'facil' ? Colors.success : 
                         recipe.difficulty === 'medio' ? Colors.warning : Colors.error} 
                />
                <Text style={styles.infoLabel}>Dificuldade</Text>
                <Text style={styles.infoValue}>{getDifficultyText(recipe.difficulty)}</Text>
              </View>
            </Card>
          </View>
        </View>

        {/* Ingredients */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="list-outline" size={20} color={Colors.text} /> Ingredientes
          </Text>
          <Card>
            {recipe.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <View style={styles.ingredientBullet} />
                <View style={styles.ingredientContent}>
                  <Text style={styles.ingredientQuantity}>{ingredient.quantity}</Text>
                  <Text style={styles.ingredientName}>{ingredient.item}</Text>
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="clipboard-outline" size={20} color={Colors.text} /> Modo de Preparo
          </Text>
          <Card>
            {recipe.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </Card>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <Card>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="star" size={20} color={Colors.warning} />
                <Text style={styles.statLabel}>Avaliação</Text>
                <Text style={styles.statValue}>{recipe.rating.toFixed(1)}</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Ionicons name="heart" size={20} color={Colors.error} />
                <Text style={styles.statLabel}>Favoritos</Text>
                <Text style={styles.statValue}>{recipe.favorites}</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Ionicons name="time" size={20} color={Colors.primary} />
                <Text style={styles.statLabel}>Total</Text>
                <Text style={styles.statValue}>{getTotalTime()} min</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Editar Receita"
            onPress={handleEdit}
            variant="outline"
            style={styles.actionButton}
            leftIcon={<Ionicons name="create-outline" size={20} color={Colors.primary} />}
          />
          
          <Button
            title={isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
            onPress={handleToggleFavorite}
            variant={isFavorite ? 'secondary' : 'primary'}
            style={styles.actionButton}
            leftIcon={
              <Ionicons 
                name={isFavorite ? 'heart' : 'heart-outline'} 
                size={20} 
                color={isFavorite ? Colors.error : Colors.background} 
              />
            }
          />
        </View>
      </View>
      </ScrollView>
      <BottomNavigationBar currentScreen="Home" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  scrollView: {
    flex: 1,
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
  
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  
  headerButton: {
    padding: Spacing.xs,
    borderRadius: 20,
  },
  
  imageContainer: {
    position: 'relative',
    height: 300,
    width: '100%',
  },
  
  image: {
    width: '100%',
    height: '100%',
  },
  
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  temperatureOverlay: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
  },
  
  temperatureText: {
    color: Colors.background,
    fontSize: 12,
  },
  
  content: {
    padding: Spacing.lg,
  },
  
  titleSection: {
    marginBottom: Spacing.xl,
  },
  
  title: {
    fontSize: Typography.fontSizes['3xl'],
    fontWeight: Typography.fontWeights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  
  description: {
    fontSize: Typography.fontSizes.lg,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeights.relaxed * Typography.fontSizes.lg,
  },
  
  tagsSection: {
    marginBottom: Spacing.xl,
  },
  
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  
  infoSection: {
    marginBottom: Spacing.xl,
  },
  
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  
  infoCard: {
    flex: 1,
    minWidth: (width - Spacing.lg * 2 - Spacing.md) / 2,
  },
  
  infoItem: {
    alignItems: 'center',
    padding: Spacing.sm,
  },
  
  infoLabel: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  
  infoValue: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  
  section: {
    marginBottom: Spacing.xl,
  },
  
  sectionTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  
  ingredientBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 8,
    marginRight: Spacing.md,
  },
  
  ingredientContent: {
    flex: 1,
  },
  
  ingredientQuantity: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.primary,
  },
  
  ingredientName: {
    fontSize: Typography.fontSizes.base,
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  
  instructionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  
  instructionNumberText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.background,
  },
  
  instructionText: {
    flex: 1,
    fontSize: Typography.fontSizes.base,
    color: Colors.text,
    lineHeight: Typography.lineHeights.normal * Typography.fontSizes.base,
    marginTop: 4,
  },
  
  statsSection: {
    marginBottom: Spacing.xl,
  },
  
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: Spacing.md,
  },
  
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  
  statLabel: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  
  statValue: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  
  actionButtons: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  
  actionButton: {
    width: '100%',
  },
});

export default RecipeDetailScreen;
