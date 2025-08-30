import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe, RecipeFilters, Category, Favorite } from '../types/Recipe';

// Chaves do AsyncStorage
const STORAGE_KEYS = {
  RECIPES: '@recipe_book:recipes',
  CATEGORIES: '@recipe_book:categories',
  FAVORITES: '@recipe_book:favorites',
  INITIALIZED: '@recipe_book:initialized',
};

// Categorias padrão
const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat_1',
    name: 'Pratos Principais',
    slug: 'pratos-principais',
    isDefault: true,
    userId: 'system',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat_2',
    name: 'Sobremesas',
    slug: 'sobremesas',
    isDefault: true,
    userId: 'system',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat_3',
    name: 'Entradas',
    slug: 'entradas',
    isDefault: true,
    userId: 'system',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat_4',
    name: 'Bebidas',
    slug: 'bebidas',
    isDefault: true,
    userId: 'system',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat_5',
    name: 'Lanches',
    slug: 'lanches',
    isDefault: true,
    userId: 'system',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat_6',
    name: 'Saladas',
    slug: 'saladas',
    isDefault: true,
    userId: 'system',
    createdAt: new Date().toISOString(),
  },
];

// Receitas de exemplo
const SAMPLE_RECIPES: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'favorites'>[] = [
  {
    title: 'Pasta com Ervas Frescas',
    description: 'Uma deliciosa pasta italiana com ervas frescas e azeite de oliva',
    prepTime: '15',
    cookTime: '20',
    servings: '4',
    difficulty: 'facil',
    category: 'pratos-principais',
    temperature: '',
    ingredients: [
      { item: 'Massa penne', quantity: '400g' },
      { item: 'Manjericão fresco', quantity: '1 xícara' },
      { item: 'Azeite de oliva', quantity: '3 colheres de sopa' },
      { item: 'Alho', quantity: '3 dentes' },
    ],
    instructions: [
      'Cozinhe a massa em água fervente com sal até ficar al dente',
      'Em uma frigideira, aqueça o azeite e refogue o alho picado',
      'Adicione as ervas frescas e tempere com sal e pimenta',
      'Misture a massa escorrida com o molho e sirva imediatamente',
    ],
    tags: ['Italiano', 'Vegetariano', 'Rápido'],
  },
  {
    title: 'Bolo de Chocolate',
    description: 'Bolo de chocolate fofinho e irresistível',
    prepTime: '20',
    cookTime: '40',
    servings: '8',
    difficulty: 'medio',
    category: 'sobremesas',
    temperature: '180°C',
    ingredients: [
      { item: 'Farinha de trigo', quantity: '2 xícaras' },
      { item: 'Chocolate em pó', quantity: '1/2 xícara' },
      { item: 'Açúcar', quantity: '1 1/2 xícara' },
      { item: 'Ovos', quantity: '3 unidades' },
    ],
    instructions: [
      'Pré-aqueça o forno a 180°C',
      'Misture todos os ingredientes secos em uma tigela',
      'Adicione os ovos e misture bem',
      'Asse por 40 minutos ou até dourar',
    ],
    tags: ['Chocolate', 'Festa', 'Sobremesa'],
  },
  {
    title: 'Salada Caesar',
    description: 'Clássica salada Caesar com croutons crocantes',
    prepTime: '15',
    cookTime: '0',
    servings: '2',
    difficulty: 'facil',
    category: 'saladas',
    temperature: '',
    ingredients: [
      { item: 'Alface romana', quantity: '1 pé' },
      { item: 'Queijo parmesão', quantity: '50g' },
      { item: 'Croutons', quantity: '1 xícara' },
      { item: 'Molho Caesar', quantity: '3 colheres de sopa' },
    ],
    instructions: [
      'Lave e corte a alface em pedaços médios',
      'Adicione o molho Caesar e misture bem',
      'Finalize com queijo parmesão ralado e croutons',
      'Sirva imediatamente',
    ],
    tags: ['Saudável', 'Rápido', 'Vegetariano'],
  },
];

class RecipeDatabase {
  // Inicializar banco de dados
  async initialize(): Promise<void> {
    try {
      const isInitialized = await AsyncStorage.getItem(STORAGE_KEYS.INITIALIZED);
      
      if (!isInitialized) {
        console.log('[Database] Inicializando banco de dados local...');
        
        // Inicializar categorias
        await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
        
        // Inicializar receitas com dados de exemplo
        const recipes: Recipe[] = SAMPLE_RECIPES.map((recipe, index) => ({
          ...recipe,
          id: Date.now().toString() + index,
          rating: 0,
          favorites: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        
        await AsyncStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
        
        // Inicializar favoritos vazios
        await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify([]));
        
        // Marcar como inicializado
        await AsyncStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
        
        console.log('[Database] Banco de dados inicializado com sucesso!');
      }
    } catch (error) {
      console.error('[Database] Erro ao inicializar banco de dados:', error);
      throw error;
    }
  }

  // CREATE - Criar nova receita
  async createRecipe(recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'favorites'>): Promise<Recipe> {
    try {
      const recipes = await this.getAllRecipes();
      const now = new Date().toISOString();
      
      const newRecipe: Recipe = {
        ...recipeData,
        id: Date.now().toString(),
        rating: 0,
        favorites: 0,
        createdAt: now,
        updatedAt: now,
      };
      
      recipes.push(newRecipe);
      await AsyncStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
      
      console.log('[Database] Receita criada:', newRecipe.title);
      return newRecipe;
    } catch (error) {
      console.error('[Database] Erro ao criar receita:', error);
      throw error;
    }
  }

  // READ - Buscar todas as receitas
  async getAllRecipes(): Promise<Recipe[]> {
    try {
      const recipesData = await AsyncStorage.getItem(STORAGE_KEYS.RECIPES);
      return recipesData ? JSON.parse(recipesData) : [];
    } catch (error) {
      console.error('[Database] Erro ao buscar receitas:', error);
      return [];
    }
  }

  // READ - Buscar receita por ID
  async getRecipeById(id: string): Promise<Recipe | null> {
    try {
      const recipes = await this.getAllRecipes();
      return recipes.find(recipe => recipe.id === id) || null;
    } catch (error) {
      console.error('[Database] Erro ao buscar receita por ID:', error);
      return null;
    }
  }

  // READ - Buscar receitas com filtros
  async searchRecipes(filters: RecipeFilters): Promise<Recipe[]> {
    try {
      let recipes = await this.getAllRecipes();
      
      // Filtro de busca por texto
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        recipes = recipes.filter(recipe =>
          recipe.title.toLowerCase().includes(searchLower) ||
          recipe.description.toLowerCase().includes(searchLower) ||
          recipe.ingredients.some(ing => ing.item.toLowerCase().includes(searchLower)) ||
          recipe.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      // Filtro por categoria
      if (filters.category) {
        recipes = recipes.filter(recipe => recipe.category === filters.category);
      }

      // Filtro por dificuldade
      if (filters.difficulty) {
        recipes = recipes.filter(recipe => recipe.difficulty === filters.difficulty);
      }

      // Filtro por rating mínimo
      if (filters.minRating) {
        recipes = recipes.filter(recipe => recipe.rating >= filters.minRating);
      }

      // Filtro por tags
      if (filters.tags && filters.tags.length > 0) {
        recipes = recipes.filter(recipe =>
          filters.tags!.some(tag => recipe.tags.includes(tag))
        );
      }

      // Ordenar por data de criação (mais recentes primeiro)
      return recipes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('[Database] Erro ao buscar receitas com filtros:', error);
      return [];
    }
  }

  // UPDATE - Atualizar receita
  async updateRecipe(id: string, updates: Partial<Recipe>): Promise<Recipe | null> {
    try {
      const recipes = await this.getAllRecipes();
      const recipeIndex = recipes.findIndex(recipe => recipe.id === id);
      
      if (recipeIndex === -1) return null;
      
      const updatedRecipe = {
        ...recipes[recipeIndex],
        ...updates,
        id, // Manter ID original
        updatedAt: new Date().toISOString(),
      };
      
      recipes[recipeIndex] = updatedRecipe;
      await AsyncStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
      
      console.log('[Database] Receita atualizada:', id);
      return updatedRecipe;
    } catch (error) {
      console.error('[Database] Erro ao atualizar receita:', error);
      return null;
    }
  }

  // DELETE - Deletar receita
  async deleteRecipe(id: string): Promise<boolean> {
    try {
      const recipes = await this.getAllRecipes();
      const filteredRecipes = recipes.filter(recipe => recipe.id !== id);
      
      if (filteredRecipes.length === recipes.length) return false;
      
      await AsyncStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(filteredRecipes));
      
      // Remover favoritos relacionados
      const favorites = await this.getFavorites();
      const filteredFavorites = favorites.filter(fav => fav.recipeId !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(filteredFavorites));
      
      console.log('[Database] Receita deletada:', id);
      return true;
    } catch (error) {
      console.error('[Database] Erro ao deletar receita:', error);
      return false;
    }
  }

  // Operações de favoritos
  async toggleFavorite(recipeId: string, userId: string = 'default_user'): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      const existingIndex = favorites.findIndex(fav => fav.recipeId === recipeId && fav.userId === userId);
      
      if (existingIndex !== -1) {
        // Remover favorito
        favorites.splice(existingIndex, 1);
        await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
        
        // Decrementar contador de favoritos na receita
        const recipes = await this.getAllRecipes();
        const recipeIndex = recipes.findIndex(r => r.id === recipeId);
        if (recipeIndex !== -1) {
          recipes[recipeIndex].favorites = Math.max(0, recipes[recipeIndex].favorites - 1);
          await AsyncStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
        }
        
        return false;
      } else {
        // Adicionar favorito
        const newFavorite: Favorite = {
          recipeId,
          userId,
          createdAt: new Date().toISOString(),
        };
        
        favorites.push(newFavorite);
        await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
        
        // Incrementar contador de favoritos na receita
        const recipes = await this.getAllRecipes();
        const recipeIndex = recipes.findIndex(r => r.id === recipeId);
        if (recipeIndex !== -1) {
          recipes[recipeIndex].favorites += 1;
          await AsyncStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
        }
        
        return true;
      }
    } catch (error) {
      console.error('[Database] Erro ao toggle favorito:', error);
      throw error;
    }
  }

  async getFavorites(): Promise<Favorite[]> {
    try {
      const favoritesData = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      return favoritesData ? JSON.parse(favoritesData) : [];
    } catch (error) {
      console.error('[Database] Erro ao buscar favoritos:', error);
      return [];
    }
  }

  async getFavoriteRecipes(userId: string = 'default_user'): Promise<Recipe[]> {
    try {
      const favorites = await this.getFavorites();
      const userFavorites = favorites.filter(fav => fav.userId === userId);
      const recipeIds = userFavorites.map(fav => fav.recipeId);
      
      const allRecipes = await this.getAllRecipes();
      return allRecipes.filter(recipe => recipeIds.includes(recipe.id));
    } catch (error) {
      console.error('[Database] Erro ao buscar receitas favoritas:', error);
      return [];
    }
  }

  async isFavorite(recipeId: string, userId: string = 'default_user'): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      return favorites.some(fav => fav.recipeId === recipeId && fav.userId === userId);
    } catch (error) {
      console.error('[Database] Erro ao verificar favorito:', error);
      return false;
    }
  }

  // Categorias
  async getCategories(userId: string = 'default_user'): Promise<Category[]> {
    try {
      const categoriesData = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
      const categories: Category[] = categoriesData ? JSON.parse(categoriesData) : [];
      
      // Retornar categorias padrão e do usuário
      return categories.filter(cat => cat.isDefault || cat.userId === userId);
    } catch (error) {
      console.error('[Database] Erro ao buscar categorias:', error);
      return [];
    }
  }

  async createCategory(userId: string, name: string, slug: string): Promise<Category> {
    try {
      const categories = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
      const categoriesList: Category[] = categories ? JSON.parse(categories) : [];
      
      const newCategory: Category = {
        id: Date.now().toString(),
        name,
        slug,
        isDefault: false,
        userId,
        createdAt: new Date().toISOString(),
      };
      
      categoriesList.push(newCategory);
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categoriesList));
      
      return newCategory;
    } catch (error) {
      console.error('[Database] Erro ao criar categoria:', error);
      throw error;
    }
  }

  async deleteCategory(userId: string, categoryId: string): Promise<boolean> {
    try {
      const categoriesData = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
      const categories: Category[] = categoriesData ? JSON.parse(categoriesData) : [];
      
      const categoryIndex = categories.findIndex(cat => cat.id === categoryId && cat.userId === userId && !cat.isDefault);
      
      if (categoryIndex === -1) return false;
      
      categories.splice(categoryIndex, 1);
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      
      return true;
    } catch (error) {
      console.error('[Database] Erro ao deletar categoria:', error);
      return false;
    }
  }

  // Estatísticas
  async getRecipeStats(userId: string = 'default_user') {
    try {
      const recipes = await this.getAllRecipes();
      const favorites = await this.getFavorites();
      const userFavorites = favorites.filter(fav => fav.userId === userId);
      
      // Contar receitas por categoria
      const categoryCounts: { [key: string]: number } = {};
      recipes.forEach(recipe => {
        categoryCounts[recipe.category] = (categoryCounts[recipe.category] || 0) + 1;
      });
      
      return {
        totalRecipes: recipes.length,
        totalFavorites: userFavorites.length,
        categoryCounts,
      };
    } catch (error) {
      console.error('[Database] Erro ao buscar estatísticas:', error);
      return {
        totalRecipes: 0,
        totalFavorites: 0,
        categoryCounts: {},
      };
    }
  }

  // Função para limpar dados (desenvolvimento)
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
      console.log('[Database] Todos os dados foram limpos');
    } catch (error) {
      console.error('[Database] Erro ao limpar dados:', error);
    }
  }
}

// Singleton instance
export const db = new RecipeDatabase();
