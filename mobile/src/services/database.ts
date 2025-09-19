import { Recipe, RecipeFilters, Category, Favorite } from '../types/Recipe';
import { firebaseService } from './firebaseService';
import { authService } from './authService';

class RecipeDatabase {
  // Obter ID do usuário atual
  private async getCurrentUserId(): Promise<string> {
    const user = await authService.getCurrentUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    return user.id;
  }

  // Inicializar banco de dados
  async initialize(): Promise<void> {
    try {
      console.log('[Database] Inicializando banco de dados Firebase...');
      
      // Não exigir autenticação na inicialização
      // As categorias padrão serão criadas quando o usuário fizer login
      
      console.log('[Database] Banco de dados Firebase inicializado com sucesso!');
    } catch (error) {
      console.error('[Database] Erro ao inicializar banco de dados:', error);
      throw error;
    }
  }

  // Inicializar categorias padrão
  private async initializeDefaultCategories(userId: string): Promise<void> {
    try {
      const existingCategories = await firebaseService.getCategories(userId);
      
      if (existingCategories.length === 0) {
        const defaultCategories = [
          { name: 'Pratos Principais', slug: 'pratos-principais' },
          { name: 'Sobremesas', slug: 'sobremesas' },
          { name: 'Entradas', slug: 'entradas' },
          { name: 'Bebidas', slug: 'bebidas' },
          { name: 'Vegetariano', slug: 'vegetariano' },
          { name: 'Doces', slug: 'doces' },
        ];

        for (const category of defaultCategories) {
          await firebaseService.createCategory(userId, category.name, category.slug);
        }
      }
    } catch (error) {
      console.error('[Database] Erro ao inicializar categorias padrão:', error);
    }
  }

  // CREATE - Criar nova receita
  async createRecipe(recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'favorites'>): Promise<Recipe> {
    try {
      const userId = await this.getCurrentUserId();
      return await firebaseService.createRecipe(recipeData, userId);
    } catch (error) {
      console.error('[Database] Erro ao criar receita:', error);
      throw error;
    }
  }

  // READ - Buscar todas as receitas
  async getAllRecipes(): Promise<Recipe[]> {
    try {
      const userId = await this.getCurrentUserId();
      return await firebaseService.getUserRecipes(userId);
    } catch (error) {
      console.error('[Database] Erro ao buscar receitas:', error);
      return [];
    }
  }

  // READ - Buscar receita por ID
  async getRecipeById(id: string): Promise<Recipe | null> {
    try {
      return await firebaseService.getRecipeById(id);
    } catch (error) {
      console.error('[Database] Erro ao buscar receita por ID:', error);
      return null;
    }
  }

  // READ - Buscar receitas com filtros
  async searchRecipes(filters: RecipeFilters): Promise<Recipe[]> {
    try {
      const userId = await this.getCurrentUserId();
      return await firebaseService.searchRecipes(filters, userId);
    } catch (error) {
      console.error('[Database] Erro ao buscar receitas com filtros:', error);
      return [];
    }
  }

  // UPDATE - Atualizar receita
  async updateRecipe(id: string, updates: Partial<Recipe>): Promise<Recipe | null> {
    try {
      return await firebaseService.updateRecipe(id, updates);
    } catch (error) {
      console.error('[Database] Erro ao atualizar receita:', error);
      return null;
    }
  }

  // DELETE - Deletar receita
  async deleteRecipe(id: string): Promise<boolean> {
    try {
      return await firebaseService.deleteRecipe(id);
    } catch (error) {
      console.error('[Database] Erro ao deletar receita:', error);
      return false;
    }
  }

  // Operações de favoritos
  async toggleFavorite(recipeId: string, userId: string = 'default_user'): Promise<boolean> {
    try {
      const currentUserId = await this.getCurrentUserId();
      return await firebaseService.toggleFavorite(recipeId, currentUserId);
    } catch (error) {
      console.error('[Database] Erro ao toggle favorito:', error);
      throw error;
    }
  }

  async getFavorites(): Promise<Favorite[]> {
    try {
      // Esta função não é mais necessária com Firebase
      // Os favoritos são gerenciados diretamente no Firestore
      return [];
    } catch (error) {
      console.error('[Database] Erro ao buscar favoritos:', error);
      return [];
    }
  }

  async getFavoriteRecipes(userId: string = 'default_user'): Promise<Recipe[]> {
    try {
      const currentUserId = await this.getCurrentUserId();
      return await firebaseService.getFavoriteRecipes(currentUserId);
    } catch (error) {
      console.error('[Database] Erro ao buscar receitas favoritas:', error);
      return [];
    }
  }

  async isFavorite(recipeId: string, userId: string = 'default_user'): Promise<boolean> {
    try {
      const currentUserId = await this.getCurrentUserId();
      return await firebaseService.isFavorite(recipeId, currentUserId);
    } catch (error) {
      console.error('[Database] Erro ao verificar favorito:', error);
      return false;
    }
  }

  // Categorias
  async getCategories(userId: string = 'default_user'): Promise<Category[]> {
    try {
      console.log('[Database] Buscando categorias...');
      const currentUserId = await this.getCurrentUserId();
      console.log('[Database] UserId atual:', currentUserId);
      
      const categories = await firebaseService.getCategories(currentUserId);
      console.log('[Database] Categorias encontradas:', categories.length);
      
      return categories;
    } catch (error) {
      console.error('[Database] Erro ao buscar categorias:', error);
      
      // Fallback: retornar categorias padrão se houver erro
      const fallbackCategories = [
        { id: '1', name: 'Pratos Principais', slug: 'pratos-principais', isDefault: true, userId: '', createdAt: new Date().toISOString() },
        { id: '2', name: 'Sobremesas', slug: 'sobremesas', isDefault: true, userId: '', createdAt: new Date().toISOString() },
        { id: '3', name: 'Entradas', slug: 'entradas', isDefault: true, userId: '', createdAt: new Date().toISOString() },
        { id: '4', name: 'Bebidas', slug: 'bebidas', isDefault: true, userId: '', createdAt: new Date().toISOString() },
        { id: '5', name: 'Vegetariano', slug: 'vegetariano', isDefault: true, userId: '', createdAt: new Date().toISOString() },
        { id: '6', name: 'Doces', slug: 'doces', isDefault: true, userId: '', createdAt: new Date().toISOString() },
      ];
      
      console.log('[Database] Usando categorias de fallback:', fallbackCategories.length);
      return fallbackCategories;
    }
  }

  async createCategory(userId: string, name: string, slug: string): Promise<Category> {
    try {
      const currentUserId = await this.getCurrentUserId();
      return await firebaseService.createCategory(currentUserId, name, slug);
    } catch (error) {
      console.error('[Database] Erro ao criar categoria:', error);
      throw error;
    }
  }

  async updateCategory(categoryId: string, name: string, slug: string): Promise<void> {
    try {
      console.log('[Database] Atualizando categoria:', categoryId, '->', name);
      await firebaseService.updateCategory(categoryId, name, slug);
    } catch (error) {
      console.error('[Database] Erro ao atualizar categoria:', error);
      throw error;
    }
  }

  async deleteCategory(categoryId: string): Promise<void> {
    try {
      console.log('[Database] Excluindo categoria:', categoryId);
      await firebaseService.deleteCategory(categoryId);
    } catch (error) {
      console.error('[Database] Erro ao excluir categoria:', error);
      throw error;
    }
  }


  // Estatísticas
  async getRecipeStats(userId: string = 'default_user') {
    try {
      const currentUserId = await this.getCurrentUserId();
      return await firebaseService.getUserStats(currentUserId);
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
      console.log('[Database] Limpeza de dados não implementada para Firebase');
      console.log('[Database] Use o Firebase Console para limpar dados se necessário');
    } catch (error) {
      console.error('[Database] Erro ao limpar dados:', error);
    }
  }
}

// Singleton instance
export const db = new RecipeDatabase();