import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';
import { Colors, Typography, Spacing } from '../constants/theme';
import { db } from '../services/database';
import { Recipe, Category } from '../types/Recipe';

interface RecipeFormProps {
  initialData?: Recipe;
  onSubmit: (recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'favorites'>) => void;
  submitButtonText: string;
  loading?: boolean;
}

interface FormData {
  title: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: string;
  difficulty: 'facil' | 'medio' | 'dificil';
  category: string;
  temperature: string;
  ingredients: { item: string; quantity: string }[];
  instructions: string[];
  tags: string[];
  imageUrl: string;
}

const initialFormData: FormData = {
  title: '',
  description: '',
  prepTime: '',
  cookTime: '',
  servings: '',
  difficulty: 'medio',
  category: '',
  temperature: '',
  ingredients: [{ item: '', quantity: '' }],
  instructions: [''],
  tags: [],
  imageUrl: '',
};

export const RecipeForm: React.FC<RecipeFormProps> = ({
  initialData,
  onSubmit,
  submitButtonText,
  loading = false,
}) => {
  const [formData, setFormData] = useState<FormData>(
    initialData ? {
      title: initialData.title,
      description: initialData.description,
      prepTime: initialData.prepTime,
      cookTime: initialData.cookTime,
      servings: initialData.servings,
      difficulty: initialData.difficulty,
      category: initialData.category,
      temperature: initialData.temperature || '',
      ingredients: initialData.ingredients.length > 0 ? initialData.ingredients : [{ item: '', quantity: '' }],
      instructions: initialData.instructions.length > 0 ? initialData.instructions : [''],
      tags: initialData.tags,
      imageUrl: initialData.imageUrl || '',
    } : initialFormData
  );
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const difficulties = [
    { value: 'facil', label: 'Fácil' },
    { value: 'medio', label: 'Médio' },
    { value: 'dificil', label: 'Difícil' },
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const allCategories = await db.getCategories();
      setCategories(allCategories);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (!formData.prepTime.trim()) {
      newErrors.prepTime = 'Tempo de preparo é obrigatório';
    }

    if (!formData.cookTime.trim()) {
      newErrors.cookTime = 'Tempo de cozimento é obrigatório';
    }

    if (!formData.servings.trim()) {
      newErrors.servings = 'Número de porções é obrigatório';
    }

    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória';
    }

    const validIngredients = formData.ingredients.filter(
      ing => ing.item.trim() && ing.quantity.trim()
    );
    if (validIngredients.length === 0) {
      newErrors.ingredients = 'Pelo menos um ingrediente é obrigatório';
    }

    const validInstructions = formData.instructions.filter(
      inst => inst.trim()
    );
    if (validInstructions.length === 0) {
      newErrors.instructions = 'Pelo menos uma instrução é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert('Erro', 'Por favor, corrija os erros no formulário');
      return;
    }

    const validIngredients = formData.ingredients.filter(
      ing => ing.item.trim() && ing.quantity.trim()
    );
    
    const validInstructions = formData.instructions.filter(
      inst => inst.trim()
    );

    const recipeData = {
      ...formData,
      ingredients: validIngredients,
      instructions: validInstructions,
    };

    onSubmit(recipeData);
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { item: '', quantity: '' }]
    }));
  };

  const removeIngredient = (index: number) => {
    if (formData.ingredients.length > 1) {
      setFormData(prev => ({
        ...prev,
        ingredients: prev.ingredients.filter((_, i) => i !== index)
      }));
    }
  };

  const updateIngredient = (index: number, field: 'item' | 'quantity', value: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => 
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const removeInstruction = (index: number) => {
    if (formData.instructions.length > 1) {
      setFormData(prev => ({
        ...prev,
        instructions: prev.instructions.filter((_, i) => i !== index)
      }));
    }
  };

  const updateInstruction = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => 
        i === index ? value : inst
      )
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Basic Info */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Básicas</Text>
          
          <Input
            label="Título *"
            value={formData.title}
            onChangeText={(value) => setFormData(prev => ({ ...prev, title: value }))}
            placeholder="Nome da receita"
            error={errors.title}
          />

          <Input
            label="Descrição *"
            value={formData.description}
            onChangeText={(value) => setFormData(prev => ({ ...prev, description: value }))}
            placeholder="Descrição da receita"
            multiline
            numberOfLines={3}
            error={errors.description}
          />

          <Input
            label="URL da Imagem"
            value={formData.imageUrl}
            onChangeText={(value) => setFormData(prev => ({ ...prev, imageUrl: value }))}
            placeholder="https://exemplo.com/imagem.jpg"
          />
        </Card>

        {/* Time and Servings */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Tempo e Porções</Text>
          
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Input
                label="Preparo (min) *"
                value={formData.prepTime}
                onChangeText={(value) => setFormData(prev => ({ ...prev, prepTime: value }))}
                placeholder="15"
                keyboardType="numeric"
                error={errors.prepTime}
              />
            </View>
            
            <View style={styles.halfWidth}>
              <Input
                label="Cozimento (min) *"
                value={formData.cookTime}
                onChangeText={(value) => setFormData(prev => ({ ...prev, cookTime: value }))}
                placeholder="30"
                keyboardType="numeric"
                error={errors.cookTime}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Input
                label="Porções *"
                value={formData.servings}
                onChangeText={(value) => setFormData(prev => ({ ...prev, servings: value }))}
                placeholder="4"
                error={errors.servings}
              />
            </View>
            
            <View style={styles.halfWidth}>
              <Input
                label="Temperatura"
                value={formData.temperature}
                onChangeText={(value) => setFormData(prev => ({ ...prev, temperature: value }))}
                placeholder="180°C"
              />
            </View>
          </View>
        </Card>

        {/* Category and Difficulty */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Categoria e Dificuldade</Text>
          
          <Text style={styles.label}>Categoria *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
            <View style={styles.optionsContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setFormData(prev => ({ ...prev, category: category.slug }))}
                >
                  <Badge
                    variant={formData.category === category.slug ? 'default' : 'secondary'}
                    size="md"
                    style={styles.optionBadge}
                  >
                    {category.name}
                  </Badge>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

          <Text style={styles.label}>Dificuldade</Text>
          <View style={styles.optionsContainer}>
            {difficulties.map((difficulty) => (
              <TouchableOpacity
                key={difficulty.value}
                onPress={() => setFormData(prev => ({ ...prev, difficulty: difficulty.value as any }))}
              >
                <Badge
                  variant={formData.difficulty === difficulty.value ? 'default' : 'secondary'}
                  size="md"
                  style={styles.optionBadge}
                >
                  {difficulty.label}
                </Badge>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Ingredients */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ingredientes</Text>
            <TouchableOpacity onPress={addIngredient}>
              <Ionicons name="add-circle" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          {formData.ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientRow}>
              <View style={styles.ingredientInputs}>
                <View style={styles.quarterWidth}>
                  <Input
                    placeholder="Qtd"
                    value={ingredient.quantity}
                    onChangeText={(value) => updateIngredient(index, 'quantity', value)}
                  />
                </View>
                <View style={styles.threeQuarterWidth}>
                  <Input
                    placeholder="Ingrediente"
                    value={ingredient.item}
                    onChangeText={(value) => updateIngredient(index, 'item', value)}
                  />
                </View>
              </View>
              {formData.ingredients.length > 1 && (
                <TouchableOpacity onPress={() => removeIngredient(index)}>
                  <Ionicons name="remove-circle" size={24} color={Colors.error} />
                </TouchableOpacity>
              )}
            </View>
          ))}
          {errors.ingredients && <Text style={styles.errorText}>{errors.ingredients}</Text>}
        </Card>

        {/* Instructions */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Modo de Preparo</Text>
            <TouchableOpacity onPress={addInstruction}>
              <Ionicons name="add-circle" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          {formData.instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionRow}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.instructionInput}>
                <Input
                  placeholder="Descreva o passo"
                  value={instruction}
                  onChangeText={(value) => updateInstruction(index, value)}
                  multiline
                  numberOfLines={2}
                />
              </View>
              {formData.instructions.length > 1 && (
                <TouchableOpacity onPress={() => removeInstruction(index)}>
                  <Ionicons name="remove-circle" size={24} color={Colors.error} />
                </TouchableOpacity>
              )}
            </View>
          ))}
          {errors.instructions && <Text style={styles.errorText}>{errors.instructions}</Text>}
        </Card>

        {/* Tags */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Tags</Text>
          
          <View style={styles.tagInputRow}>
            <View style={styles.tagInput}>
              <Input
                placeholder="Adicionar tag"
                value={newTag}
                onChangeText={setNewTag}
                onSubmitEditing={addTag}
              />
            </View>
            <TouchableOpacity onPress={addTag} style={styles.addTagButton}>
              <Ionicons name="add" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {formData.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {formData.tags.map((tag, index) => (
                <TouchableOpacity key={index} onPress={() => removeTag(tag)}>
                  <Badge variant="secondary" size="sm" style={styles.tagBadge}>
                    {tag}
                    <Ionicons name="close" size={12} color={Colors.textSecondary} style={styles.tagCloseIcon} />
                  </Badge>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card>

        {/* Submit Button */}
        <Button
          title={submitButtonText}
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  content: {
    padding: Spacing.lg,
  },
  
  section: {
    marginBottom: Spacing.lg,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  
  sectionTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  
  label: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  
  halfWidth: {
    flex: 1,
  },
  
  quarterWidth: {
    flex: 1,
    maxWidth: '30%',
  },
  
  threeQuarterWidth: {
    flex: 2,
  },
  
  optionsScroll: {
    marginBottom: Spacing.md,
  },
  
  optionsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  
  optionBadge: {
    marginRight: Spacing.sm,
  },
  
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  
  ingredientInputs: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  
  instructionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  
  instructionNumberText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.background,
  },
  
  instructionInput: {
    flex: 1,
  },
  
  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  
  tagInput: {
    flex: 1,
  },
  
  addTagButton: {
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  tagCloseIcon: {
    marginLeft: Spacing.xs,
  },
  
  errorText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  
  submitButton: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
});
