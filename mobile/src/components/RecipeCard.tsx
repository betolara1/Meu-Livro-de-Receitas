import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { Recipe } from '../types/Recipe';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
  onToggleFavorite?: (recipeId: string) => void;
  isFavorite?: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onPress,
  onToggleFavorite,
  isFavorite = false,
}) => {
  const [imageError, setImageError] = useState(false);

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
    const prep = parseInt(recipe.prepTime) || 0;
    const cook = parseInt(recipe.cookTime) || 0;
    return prep + cook;
  };

  const handleFavoritePress = () => {
    if (onToggleFavorite) {
      onToggleFavorite(recipe.id);
    }
  };

  return (
    <Card variant="elevated" padding={false} style={styles.container}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {/* Image */}
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
              <Ionicons name="restaurant" size={40} color={Colors.textSecondary} />
            </View>
          )}
          
          {/* Favorite Button */}
          {onToggleFavorite && (
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={handleFavoritePress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorite ? Colors.error : Colors.background}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title} numberOfLines={2}>
            {recipe.title}
          </Text>

          {/* Description */}
          <Text style={styles.description} numberOfLines={2}>
            {recipe.description}
          </Text>

          {/* Tags */}
          {recipe.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {recipe.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="secondary" size="sm">
                  {tag}
                </Badge>
              ))}
              {recipe.tags.length > 2 && (
                <Text style={styles.moreTags}>+{recipe.tags.length - 2}</Text>
              )}
            </View>
          )}

          {/* Info Row */}
          <View style={styles.infoRow}>
            {/* Time */}
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.infoText}>{getTotalTime()} min</Text>
            </View>

            {/* Servings */}
            <View style={styles.infoItem}>
              <Ionicons name="people-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.infoText}>{recipe.servings}</Text>
            </View>

            {/* Difficulty */}
            <Badge 
              variant={getDifficultyColor(recipe.difficulty) as any} 
              size="sm"
            >
              {getDifficultyText(recipe.difficulty)}
            </Badge>
          </View>

          {/* Rating & Favorites */}
          <View style={styles.statsRow}>
            <View style={styles.infoItem}>
              <Ionicons name="star" size={16} color={Colors.warning} />
              <Text style={styles.infoText}>{recipe.rating.toFixed(1)}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="heart" size={16} color={Colors.error} />
              <Text style={styles.infoText}>{recipe.favorites}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  
  imageContainer: {
    position: 'relative',
    height: 200,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    overflow: 'hidden',
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
  
  favoriteButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  content: {
    padding: Spacing.md,
  },
  
  title: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  
  description: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeights.normal * Typography.fontSizes.sm,
    marginBottom: Spacing.md,
  },
  
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  
  moreTags: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  
  infoText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },
});
