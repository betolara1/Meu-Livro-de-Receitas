import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';
import { ImagePickerComponent } from './ImagePicker';
import { AIPhotoSection } from './AIPhotoSection';
import { Colors, Typography, Spacing } from '../constants/theme';
import { db } from '../services/database';
import { Recipe, Category } from '../types/Recipe';
import { useKeyboard } from '../hooks/useKeyboard';
import { GeminiRecipeData } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { translateCategory } from '../utils/categoryI18n';

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
  images: string[];
  aiPhoto: string | null;
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
  images: [],
  aiPhoto: null,
};

export const RecipeForm: React.FC<RecipeFormProps> = ({
  initialData,
  onSubmit,
  submitButtonText,
  loading = false,
}) => {
  const { keyboardVisible, dismissKeyboard } = useKeyboard();
  const { t } = useLanguage();
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
      images: initialData.images || [],
      aiPhoto: null, // Foto IA não é persistida, sempre começa como null
    } : initialFormData
  );
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [newTag, setNewTag] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const difficulties = [
    { value: 'facil', label: t('difficulty.easy') },
    { value: 'medio', label: t('difficulty.medium') },
    { value: 'dificil', label: t('difficulty.hard') },
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      console.log('[RecipeForm] Carregando categorias...');
      const allCategories = await db.getCategories();
      console.log('[RecipeForm] Categorias carregadas:', allCategories.length);
      setCategories(allCategories);
      
      // Se não há categorias, tentar inicializar as padrão
      if (allCategories.length === 0) {
        console.log('[RecipeForm] Nenhuma categoria encontrada, inicializando categorias padrão...');
        await db.initialize();
        const categoriesAfterInit = await db.getCategories();
        console.log('[RecipeForm] Categorias após inicialização:', categoriesAfterInit.length);
        setCategories(categoriesAfterInit);
      }
    } catch (error) {
      console.error('[RecipeForm] Erro ao carregar categorias:', error);
      
      // Fallback: usar categorias padrão se houver erro
      const fallbackCategories = [
        { id: '1', name: 'Pratos Principais', slug: 'pratos-principais', isDefault: true, userId: '', createdAt: new Date().toISOString() },
        { id: '2', name: 'Sobremesas', slug: 'sobremesas', isDefault: true, userId: '', createdAt: new Date().toISOString() },
        { id: '3', name: 'Entradas', slug: 'entradas', isDefault: true, userId: '', createdAt: new Date().toISOString() },
        { id: '4', name: 'Bebidas', slug: 'bebidas', isDefault: true, userId: '', createdAt: new Date().toISOString() },
        { id: '5', name: 'Vegetariano', slug: 'vegetariano', isDefault: true, userId: '', createdAt: new Date().toISOString() },
        { id: '6', name: 'Doces', slug: 'doces', isDefault: true, userId: '', createdAt: new Date().toISOString() },
      ];
      console.log('[RecipeForm] Usando categorias de fallback:', fallbackCategories.length);
      setCategories(fallbackCategories);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = t('createRecipe.recipeNameRequired');
    }

    if (!formData.category) {
      newErrors.category = t('createRecipe.categoryRequired');
    }

    const validIngredients = formData.ingredients.filter(
      ing => ing.item.trim() && ing.quantity.trim()
    );
    if (validIngredients.length === 0) {
      newErrors.ingredients = t('createRecipe.ingredientsRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    dismissKeyboard();
    
    if (!validateForm()) {
      Alert.alert(t('common.error'), t('common.formError'));
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

  const handleRecipeDataExtracted = (data: GeminiRecipeData) => {
    setFormData(prev => ({
      ...prev,
      title: data.title || prev.title,
      description: data.description || prev.description,
      prepTime: data.prepTime || prev.prepTime,
      cookTime: data.cookTime || prev.cookTime,
      servings: data.servings || prev.servings,
      difficulty: data.difficulty || prev.difficulty,
      category: data.category || prev.category,
      ingredients: data.ingredients && data.ingredients.length > 0 
        ? data.ingredients 
        : prev.ingredients,
      instructions: data.instructions && data.instructions.length > 0 
        ? data.instructions 
        : prev.instructions,
      tags: data.tags && data.tags.length > 0 
        ? [...prev.tags, ...data.tags.filter(tag => !prev.tags.includes(tag))]
        : prev.tags,
    }));
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const createNewCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert(t('common.error'), t('createRecipe.categoryNameRequired'));
      return;
    }

    try {
      const slug = newCategoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      console.log('[RecipeForm] Criando nova categoria:', newCategoryName.trim());
      
      // Criar categoria no Firebase primeiro
      const newCategory = await db.createCategory('', newCategoryName.trim(), slug);
      
      console.log('[RecipeForm] Categoria criada no Firebase:', newCategory.id);
      
      // Adicionar à lista local
      setCategories(prev => [...prev, newCategory]);
      
      // Selecionar a nova categoria
      setFormData(prev => ({ ...prev, category: slug }));
      
      // Limpar e fechar input
      setNewCategoryName('');
      setShowNewCategoryInput(false);
      
      Alert.alert(t('common.success'), t('createRecipe.categoryCreatedSuccess'));
    } catch (error) {
      console.error('[RecipeForm] Erro ao criar categoria:', error);
      Alert.alert(t('common.error'), t('createRecipe.categoryCreateError'));
    }
  };

  const handleCategoryLongPress = (category: Category) => {
    // Não permitir editar/excluir categorias padrão
    if (category.isDefault) {
      Alert.alert(t('common.info'), t('createRecipe.defaultCategoryInfo'));
      return;
    }

    Alert.alert(
      t('createRecipe.manageCategory'),
      t('createRecipe.manageCategoryPrompt', { categoryName: category.name }),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.edit'),
          onPress: () => editCategory(category),
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => deleteCategory(category),
        },
      ]
    );
  };

  const editCategory = (category: Category) => {
    Alert.prompt(
      t('createRecipe.editCategory'),
      t('createRecipe.newCategoryNamePrompt'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.save'),
          onPress: async (newName) => {
            if (newName && newName.trim() && newName.trim() !== category.name) {
              await updateCategory(category, newName.trim());
            }
          },
        },
      ],
      'plain-text',
      category.name
    );
  };

  const updateCategory = async (category: Category, newName: string) => {
    try {
      const newSlug = newName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      console.log('[RecipeForm] Atualizando categoria:', category.name, '->', newName);
      
      // Atualizar no Firebase
      await db.updateCategory(category.id, newName, newSlug);
      
      // Atualizar lista local
      setCategories(prev => 
        prev.map(cat => 
          cat.id === category.id 
            ? { ...cat, name: newName, slug: newSlug }
            : cat
        )
      );
      
      // Se a categoria estava selecionada, atualizar o formData
      if (formData.category === category.slug) {
        setFormData(prev => ({ ...prev, category: newSlug }));
      }
      
      Alert.alert(t('common.success'), t('createRecipe.categoryUpdatedSuccess'));
    } catch (error) {
      console.error('[RecipeForm] Erro ao atualizar categoria:', error);
      Alert.alert(t('common.error'), t('createRecipe.categoryUpdateError'));
    }
  };

  const deleteCategory = (category: Category) => {
    Alert.alert(
      t('createRecipe.deleteCategory'),
      t('createRecipe.deleteCategoryConfirm', { categoryName: category.name }),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('[RecipeForm] Excluindo categoria:', category.name);
              
              // Excluir do Firebase
              await db.deleteCategory(category.id);
              
              // Remover da lista local
              setCategories(prev => prev.filter(cat => cat.id !== category.id));
              
              // Se a categoria estava selecionada, limpar seleção
              if (formData.category === category.slug) {
                setFormData(prev => ({ ...prev, category: '' }));
              }
              
              Alert.alert(t('common.success'), t('createRecipe.categoryDeletedSuccess'));
            } catch (error) {
              console.error('[RecipeForm] Erro ao excluir categoria:', error);
              Alert.alert(t('common.error'), t('createRecipe.categoryDeleteError'));
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
      >
        <View style={styles.content}>
        {/* AI Photo Section */}
        <AIPhotoSection
          aiPhoto={formData.aiPhoto}
          onPhotoChange={(photo) => setFormData(prev => ({ ...prev, aiPhoto: photo }))}
          onRecipeDataExtracted={handleRecipeDataExtracted}
          t={t}
        />

        {/* Basic Info */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>{t('createRecipe.basicInfo')}</Text>
          
          <Input
            label={`${t('createRecipe.recipeName')} *`}
            value={formData.title}
            onChangeText={(value) => setFormData(prev => ({ ...prev, title: value }))}
            placeholder={t('createRecipe.recipeNamePlaceholder')}
            error={errors.title}
          />

          <Input
            label={t('createRecipe.description')}
            value={formData.description}
            onChangeText={(value) => setFormData(prev => ({ ...prev, description: value }))}
            placeholder={t('createRecipe.descriptionPlaceholder')}
            multiline
            numberOfLines={3}
            error={errors.description}
          />
        </Card>

        {/* Recipe Images */}
        <Card style={styles.section}>
          <ImagePickerComponent
            images={formData.images}
            onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
            maxImages={5}
            label={t('createRecipe.imagePicker.label')}
          />
        </Card>

        {/* Time and Servings */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>{t('createRecipe.timeAndServings')}</Text>
          
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Input
                label={`${t('recipeDetail.prepTime')} (min)`}
                value={formData.prepTime}
                onChangeText={(value) => setFormData(prev => ({ ...prev, prepTime: value }))}
                placeholder="15"
                keyboardType="numeric"
                error={errors.prepTime}
              />
            </View>
            
            <View style={styles.halfWidth}>
              <Input
                label={`${t('recipeDetail.cookTime')} (min)`}
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
                label={t('recipeDetail.servings')}
                value={formData.servings}
                onChangeText={(value) => setFormData(prev => ({ ...prev, servings: value }))}
                placeholder="4"
                error={errors.servings}
              />
            </View>
            
            <View style={styles.halfWidth}>
              <Input
                label={t('createRecipe.temperature')}
                value={formData.temperature}
                onChangeText={(value) => setFormData(prev => ({ ...prev, temperature: value }))}
                placeholder="180°C"
              />
            </View>
          </View>
        </Card>

        {/* Category and Difficulty */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>{t('createRecipe.categoryAndDifficulty')}</Text>
          
          <Text style={styles.label}>{t('createRecipe.category')} *</Text>
          
          {categories.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
              <View style={styles.optionsContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => setFormData(prev => ({ ...prev, category: category.slug }))}
                    onLongPress={() => handleCategoryLongPress(category)}
                    delayLongPress={500}
                  >
                    <Badge
                      variant={formData.category === category.slug ? 'default' : 'secondary'}
                      size="md"
                      style={styles.optionBadge}
                    >
                      {translateCategory(category.slug || category.name, t)}
                    </Badge>
                  </TouchableOpacity>
                ))}
                
                {/* Botão para criar nova categoria */}
                <TouchableOpacity
                  onPress={() => setShowNewCategoryInput(true)}
                  style={styles.addCategoryButton}
                >
                  <Badge variant="secondary" size="md" style={styles.optionBadge}>
                    <Ionicons name="add" size={16} color={Colors.primary} />
                    <Text style={styles.addCategoryText}>{t('common.new')}</Text>
                  </Badge>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.emptyCategoriesContainer}>
              <Text style={styles.emptyCategoriesText}>{t('createRecipe.noCategoriesAvailable')}</Text>
              <TouchableOpacity
                onPress={() => setShowNewCategoryInput(true)}
                style={styles.createFirstCategoryButton}
              >
                <Text style={styles.createFirstCategoryText}>{t('createRecipe.createFirstCategory')}</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Input para nova categoria */}
          {showNewCategoryInput && (
            <View style={styles.newCategoryContainer}>
              <Input
                placeholder={t('createRecipe.newCategoryNamePlaceholder')}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                style={styles.newCategoryInput}
              />
              <View style={styles.newCategoryButtons}>
                <TouchableOpacity
                  onPress={createNewCategory}
                  style={[styles.newCategoryButton, styles.saveButton]}
                >
                  <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowNewCategoryInput(false);
                    setNewCategoryName('');
                  }}
                  style={[styles.newCategoryButton, styles.cancelButton]}
                >
                  <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

          <Text style={styles.label}>{t('recipeDetail.difficulty')}</Text>
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
            <Text style={styles.sectionTitle}>{t('recipeDetail.ingredients')}</Text>
            <TouchableOpacity onPress={addIngredient}>
              <Ionicons name="add-circle" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          {formData.ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientRow}>
              <View style={styles.ingredientInputs}>
                <View style={styles.quarterWidth}>
                  <Input
                    placeholder={t('createRecipe.quantityPlaceholder')}
                    value={ingredient.quantity}
                    onChangeText={(value) => updateIngredient(index, 'quantity', value)}
                  />
                </View>
                <View style={styles.threeQuarterWidth}>
                  <Input
                    placeholder={t('createRecipe.ingredientPlaceholder')}
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
            <Text style={styles.sectionTitle}>{t('recipeDetail.instructions')}</Text>
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
                  placeholder={t('createRecipe.instructionPlaceholder')}
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
          <Text style={styles.sectionTitle}>{t('createRecipe.tags')}</Text>
          
          <View style={styles.tagInputRow}>
            <View style={styles.tagInput}>
              <Input
                placeholder={t('createRecipe.addTag')}
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
    </KeyboardAvoidingView>
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
  
  // Estilos para categorias
  addCategoryButton: {
    marginRight: Spacing.sm,
  },
  
  addCategoryText: {
    marginLeft: Spacing.xs,
    fontSize: Typography.fontSizes.sm,
    color: Colors.primary,
  },
  
  emptyCategoriesContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  
  emptyCategoriesText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  
  createFirstCategoryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  
  createFirstCategoryText: {
    color: Colors.background,
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
  },
  
  newCategoryContainer: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.gray100,
    borderRadius: 8,
  },
  
  newCategoryInput: {
    marginBottom: Spacing.md,
  },
  
  newCategoryButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  
  newCategoryButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 6,
    alignItems: 'center',
  },
  
  saveButton: {
    backgroundColor: Colors.primary,
  },
  
  saveButtonText: {
    color: Colors.background,
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
  },
  
  cancelButton: {
    backgroundColor: Colors.gray200,
  },
  
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
  },
});
