import { 
  collection, 
  doc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Recipe, Category, Favorite, RecipeFilters } from '../types/Recipe';
import { User } from '../types/Auth';

// Coleções do Firestore
const COLLECTIONS = {
  RECIPES: 'recipes',
  CATEGORIES: 'categories',
  FAVORITES: 'favorites',
  USERS: 'users'
};

export class FirebaseService {
  private static instance: FirebaseService;

  static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  // ===== RECEITAS =====

  // Criar nova receita
  async createRecipe(recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'favorites'>, userId: string): Promise<Recipe> {
    try {
      const recipeRef = await addDoc(collection(db, COLLECTIONS.RECIPES), {
        ...recipeData,
        userId,
        rating: 0,
        favorites: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const newRecipe: Recipe = {
        ...recipeData,
        id: recipeRef.id,
        rating: 0,
        favorites: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log('[Firebase] Receita criada:', newRecipe.title);
      return newRecipe;
    } catch (error) {
      console.error('[Firebase] Erro ao criar receita:', error);
      throw error;
    }
  }

  // Buscar todas as receitas do usuário
  async getUserRecipes(userId: string): Promise<Recipe[]> {
    try {
      // Buscar sem orderBy para evitar necessidade de índice
      const q = query(
        collection(db, COLLECTIONS.RECIPES),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const recipes: Recipe[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        recipes.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as Recipe);
      });

      // Ordenar no cliente para evitar necessidade de índice
      return recipes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('[Firebase] Erro ao buscar receitas do usuário:', error);
      return [];
    }
  }

  // Buscar receita por ID
  async getRecipeById(recipeId: string): Promise<Recipe | null> {
    try {
      const recipeRef = doc(db, COLLECTIONS.RECIPES, recipeId);
      const recipeSnap = await getDoc(recipeRef);
      
      if (recipeSnap.exists()) {
        const data = recipeSnap.data();
        return {
          id: recipeSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as Recipe;
      }
      
      return null;
    } catch (error) {
      console.error('[Firebase] Erro ao buscar receita por ID:', error);
      return null;
    }
  }

  // Buscar receitas com filtros
  async searchRecipes(filters: RecipeFilters, userId: string): Promise<Recipe[]> {
    try {
      // Buscar apenas por userId primeiro, sem orderBy
      let q = query(
        collection(db, COLLECTIONS.RECIPES),
        where('userId', '==', userId)
      );

      // Aplicar filtros simples (sem orderBy para evitar índices)
      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }

      if (filters.difficulty) {
        q = query(q, where('difficulty', '==', filters.difficulty));
      }

      if (filters.minRating) {
        q = query(q, where('rating', '>=', filters.minRating));
      }

      const querySnapshot = await getDocs(q);
      let recipes: Recipe[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        recipes.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as Recipe);
      });

      // Aplicar todos os filtros no cliente
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        recipes = recipes.filter(recipe =>
          recipe.title.toLowerCase().includes(searchLower) ||
          recipe.description.toLowerCase().includes(searchLower) ||
          recipe.ingredients.some(ing => ing.item.toLowerCase().includes(searchLower)) ||
          recipe.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      if (filters.tags && filters.tags.length > 0) {
        recipes = recipes.filter(recipe =>
          filters.tags!.some(tag => recipe.tags.includes(tag))
        );
      }

      // Ordenar no cliente
      return recipes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('[Firebase] Erro ao buscar receitas com filtros:', error);
      return [];
    }
  }

  // Atualizar receita
  async updateRecipe(recipeId: string, updates: Partial<Recipe>): Promise<Recipe | null> {
    try {
      const recipeRef = doc(db, COLLECTIONS.RECIPES, recipeId);
      
      const updateData: any = {
        ...updates,
        updatedAt: serverTimestamp(),
      };
      
      // Remover campos que não devem ser atualizados
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.userId;

      await updateDoc(recipeRef, updateData);
      
      // Buscar receita atualizada
      const updatedRecipe = await this.getRecipeById(recipeId);
      
      console.log('[Firebase] Receita atualizada:', recipeId);
      return updatedRecipe;
    } catch (error) {
      console.error('[Firebase] Erro ao atualizar receita:', error);
      return null;
    }
  }

  // Deletar receita
  async deleteRecipe(recipeId: string): Promise<boolean> {
    try {
      const recipeRef = doc(db, COLLECTIONS.RECIPES, recipeId);
      await deleteDoc(recipeRef);
      
      // Deletar favoritos relacionados
      await this.deleteRecipeFavorites(recipeId);
      
      console.log('[Firebase] Receita deletada:', recipeId);
      return true;
    } catch (error) {
      console.error('[Firebase] Erro ao deletar receita:', error);
      return false;
    }
  }

  // ===== FAVORITOS =====

  // Toggle favorito
  async toggleFavorite(recipeId: string, userId: string): Promise<boolean> {
    try {
      const favoriteRef = doc(db, COLLECTIONS.FAVORITES, `${userId}_${recipeId}`);
      const favoriteSnap = await getDoc(favoriteRef);
      
      if (favoriteSnap.exists()) {
        // Remover favorito
        await deleteDoc(favoriteRef);
        await this.decrementRecipeFavorites(recipeId);
        return false;
      } else {
        // Adicionar favorito
        await addDoc(collection(db, COLLECTIONS.FAVORITES), {
          recipeId,
          userId,
          createdAt: serverTimestamp(),
        });
        await this.incrementRecipeFavorites(recipeId);
        return true;
      }
    } catch (error) {
      console.error('[Firebase] Erro ao toggle favorito:', error);
      throw error;
    }
  }

  // Verificar se é favorito
  async isFavorite(recipeId: string, userId: string): Promise<boolean> {
    try {
      const favoriteRef = doc(db, COLLECTIONS.FAVORITES, `${userId}_${recipeId}`);
      const favoriteSnap = await getDoc(favoriteRef);
      return favoriteSnap.exists();
    } catch (error) {
      console.error('[Firebase] Erro ao verificar favorito:', error);
      return false;
    }
  }

  // Buscar receitas favoritas
  async getFavoriteRecipes(userId: string): Promise<Recipe[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.FAVORITES),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const recipeIds = querySnapshot.docs.map(doc => doc.data().recipeId);
      
      if (recipeIds.length === 0) return [];
      
      const recipes: Recipe[] = [];
      for (const recipeId of recipeIds) {
        const recipe = await this.getRecipeById(recipeId);
        if (recipe) {
          recipes.push(recipe);
        }
      }
      
      return recipes;
    } catch (error) {
      console.error('[Firebase] Erro ao buscar receitas favoritas:', error);
      return [];
    }
  }

  // Deletar favoritos de uma receita
  private async deleteRecipeFavorites(recipeId: string): Promise<void> {
    try {
      const q = query(
        collection(db, COLLECTIONS.FAVORITES),
        where('recipeId', '==', recipeId)
      );
      
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('[Firebase] Erro ao deletar favoritos da receita:', error);
    }
  }

  // Incrementar contador de favoritos
  private async incrementRecipeFavorites(recipeId: string): Promise<void> {
    try {
      const recipeRef = doc(db, COLLECTIONS.RECIPES, recipeId);
      const recipeSnap = await getDoc(recipeRef);
      
      if (recipeSnap.exists()) {
        const currentFavorites = recipeSnap.data().favorites || 0;
        await updateDoc(recipeRef, {
          favorites: currentFavorites + 1
        });
      }
    } catch (error) {
      console.error('[Firebase] Erro ao incrementar favoritos:', error);
    }
  }

  // Decrementar contador de favoritos
  private async decrementRecipeFavorites(recipeId: string): Promise<void> {
    try {
      const recipeRef = doc(db, COLLECTIONS.RECIPES, recipeId);
      const recipeSnap = await getDoc(recipeRef);
      
      if (recipeSnap.exists()) {
        const currentFavorites = recipeSnap.data().favorites || 0;
        await updateDoc(recipeRef, {
          favorites: Math.max(0, currentFavorites - 1)
        });
      }
    } catch (error) {
      console.error('[Firebase] Erro ao decrementar favoritos:', error);
    }
  }

  // ===== CATEGORIAS =====

  // Buscar categorias
  async getCategories(userId: string): Promise<Category[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.CATEGORIES),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const categories: Category[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        categories.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as Category);
      });

      return categories;
    } catch (error) {
      console.error('[Firebase] Erro ao buscar categorias:', error);
      return [];
    }
  }

  // Criar categoria
  async createCategory(userId: string, name: string, slug: string): Promise<Category> {
    try {
      const categoryRef = await addDoc(collection(db, COLLECTIONS.CATEGORIES), {
        name,
        slug,
        userId,
        isDefault: false,
        createdAt: serverTimestamp(),
      });

      const newCategory: Category = {
        id: categoryRef.id,
        name,
        slug,
        userId,
        isDefault: false,
        createdAt: new Date().toISOString(),
      };

      console.log('[Firebase] Categoria criada:', newCategory.name);
      return newCategory;
    } catch (error) {
      console.error('[Firebase] Erro ao criar categoria:', error);
      throw error;
    }
  }

  // Deletar categoria
  async deleteCategory(categoryId: string, userId: string): Promise<boolean> {
    try {
      const categoryRef = doc(db, COLLECTIONS.CATEGORIES, categoryId);
      const categorySnap = await getDoc(categoryRef);
      
      if (categorySnap.exists()) {
        const data = categorySnap.data();
        if (data.userId === userId && !data.isDefault) {
          await deleteDoc(categoryRef);
          console.log('[Firebase] Categoria deletada:', categoryId);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('[Firebase] Erro ao deletar categoria:', error);
      return false;
    }
  }

  // ===== USUÁRIOS =====

  // Criar/Atualizar perfil do usuário
  async createOrUpdateUser(user: User): Promise<void> {
    try {
      // Remover campos undefined antes de salvar
      const cleanUser = this.removeUndefinedFields(user);
      
      const userRef = doc(db, COLLECTIONS.USERS, user.id);
      
      // Usar setDoc com merge para criar ou atualizar
      await setDoc(userRef, {
        ...cleanUser,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      
      console.log('[Firebase] Usuário salvo/atualizado:', user.id);
    } catch (error) {
      console.error('[Firebase] Erro ao salvar usuário:', error);
      throw error;
    }
  }

  // Remover campos undefined de um objeto
  private removeUndefinedFields(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }
    
    const cleaned: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] !== undefined) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          cleaned[key] = this.removeUndefinedFields(obj[key]);
        } else {
          cleaned[key] = obj[key];
        }
      }
    }
    return cleaned;
  }

  // Buscar usuário
  async getUser(userId: string): Promise<User | null> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
        } as User;
      }
      
      return null;
    } catch (error) {
      console.error('[Firebase] Erro ao buscar usuário:', error);
      return null;
    }
  }

  // ===== ESTATÍSTICAS =====

  // Buscar estatísticas do usuário
  async getUserStats(userId: string) {
    try {
      const recipes = await this.getUserRecipes(userId);
      const favorites = await this.getFavoriteRecipes(userId);
      
      // Contar receitas por categoria
      const categoryCounts: { [key: string]: number } = {};
      recipes.forEach(recipe => {
        categoryCounts[recipe.category] = (categoryCounts[recipe.category] || 0) + 1;
      });
      
      return {
        totalRecipes: recipes.length,
        totalFavorites: favorites.length,
        categoryCounts,
      };
    } catch (error) {
      console.error('[Firebase] Erro ao buscar estatísticas:', error);
      return {
        totalRecipes: 0,
        totalFavorites: 0,
        categoryCounts: {},
      };
    }
  }
}

// Singleton instance
export const firebaseService = FirebaseService.getInstance();
