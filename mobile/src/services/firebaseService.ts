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
import { db, auth } from '../config/firebase';
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

  // Aguardar autenticação do Firebase
  private async waitForAuth(maxWaitTime: number = 50000): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      if (auth.currentUser) {
        console.log('[FirebaseService] Usuário autenticado encontrado');
        return true;
      }
      
      // Aguardar 100ms antes de verificar novamente
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('[FirebaseService] Timeout aguardando autenticação');
    return false;
  }

  // Verificar se o usuário está autenticado
  private async ensureAuthenticated(): Promise<void> {
    if (!auth.currentUser) {
      const isAuth = await this.waitForAuth();
      if (!isAuth) {
        throw new Error('Usuário não autenticado no Firebase. Faça login novamente.');
      }
    }
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
      console.log('[Firebase] Buscando receitas do usuário:', userId);
      
      // Aguardar autenticação
      await this.ensureAuthenticated();
      
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
      console.log('[Firebase] Buscando receitas com filtros para usuário:', userId);
      
      // Aguardar autenticação
      await this.ensureAuthenticated();
      
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
      const favoriteId = `${userId}_${recipeId}`;
      const favoriteRef = doc(db, COLLECTIONS.FAVORITES, favoriteId);
      const favoriteSnap = await getDoc(favoriteRef);
      
      if (favoriteSnap.exists()) {
        // Remover favorito
        await deleteDoc(favoriteRef);
        await this.decrementRecipeFavorites(recipeId);
        return false;
      } else {
        // Adicionar favorito usando setDoc com ID específico
        await setDoc(favoriteRef, {
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
      console.log('[Firebase] Buscando receitas favoritas para usuário:', userId);
      
      // Aguardar autenticação
      await this.ensureAuthenticated();
      
      // Buscar sem orderBy para evitar necessidade de índice
      const q = query(
        collection(db, COLLECTIONS.FAVORITES),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const favorites: any[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        favorites.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        });
      });
      
      // Ordenar no cliente por data de criação
      favorites.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      const recipeIds = favorites.map(fav => fav.recipeId);
      
      if (recipeIds.length === 0) return [];
      
      const recipes: Recipe[] = [];
      for (const recipeId of recipeIds) {
        const recipe = await this.getRecipeById(recipeId);
        if (recipe) {
          recipes.push(recipe);
        }
      }
      
      console.log('[Firebase] Receitas favoritas encontradas:', recipes.length);
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
      console.log('[Firebase] Buscando categorias do usuário:', userId);
      
      // Aguardar autenticação
      await this.ensureAuthenticated();
      
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

      console.log('[Firebase] Categorias encontradas:', categories.length);
      return categories;
    } catch (error) {
      console.error('[Firebase] Erro ao buscar categorias:', error);
      return [];
    }
  }

  // Criar categoria
  async createCategory(userId: string, name: string, slug: string): Promise<Category> {
    try {
      console.log('[Firebase] Criando categoria:', name, 'para usuário:', userId);
      
      // Aguardar autenticação
      await this.ensureAuthenticated();
      
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

      console.log('[Firebase] Categoria criada com sucesso:', newCategory.name);
      return newCategory;
    } catch (error) {
      console.error('[Firebase] Erro ao criar categoria:', error);
      throw error;
    }
  }

  // Atualizar categoria
  async updateCategory(categoryId: string, name: string, slug: string): Promise<void> {
    try {
      console.log('[Firebase] Atualizando categoria:', categoryId, '->', name);
      
      // Aguardar autenticação
      await this.ensureAuthenticated();
      
      const categoryRef = doc(db, COLLECTIONS.CATEGORIES, categoryId);
      const categorySnap = await getDoc(categoryRef);
      
      if (categorySnap.exists()) {
        const data = categorySnap.data();
        if (data.userId === auth.currentUser?.uid && !data.isDefault) {
          await updateDoc(categoryRef, {
            name,
            slug,
            updatedAt: serverTimestamp(),
          });
          console.log('[Firebase] Categoria atualizada:', categoryId);
        } else {
          throw new Error('Categoria não encontrada ou não pode ser editada');
        }
      } else {
        throw new Error('Categoria não encontrada');
      }
    } catch (error) {
      console.error('[Firebase] Erro ao atualizar categoria:', error);
      throw error;
    }
  }

  // Deletar categoria
  async deleteCategory(categoryId: string): Promise<void> {
    try {
      console.log('[Firebase] Excluindo categoria:', categoryId);
      
      // Aguardar autenticação
      await this.ensureAuthenticated();
      
      const categoryRef = doc(db, COLLECTIONS.CATEGORIES, categoryId);
      const categorySnap = await getDoc(categoryRef);
      
      if (categorySnap.exists()) {
        const data = categorySnap.data();
        if (data.userId === auth.currentUser?.uid && !data.isDefault) {
          await deleteDoc(categoryRef);
          console.log('[Firebase] Categoria deletada:', categoryId);
        } else {
          throw new Error('Categoria não encontrada ou não pode ser excluída');
        }
      } else {
        throw new Error('Categoria não encontrada');
      }
    } catch (error) {
      console.error('[Firebase] Erro ao deletar categoria:', error);
      throw error;
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
