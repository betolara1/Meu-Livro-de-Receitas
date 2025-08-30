import { ObjectId } from 'mongodb'
import { getCollection, initializeDatabase, defaultCategories } from './database-config'

export interface Recipe {
  _id?: ObjectId
  id: string
  title: string
  description: string
  prepTime: string
  cookTime: string
  servings: string
  difficulty: string
  category: string
  temperature?: string
  ingredients: { item: string; quantity: string }[]
  instructions: string[]
  tags: string[]
  imageUrl?: string
  rating: number
  favorites: number
  createdAt: Date
  updatedAt: Date
}

export interface RecipeFilters {
  search?: string
  category?: string
  difficulty?: string
  minRating?: number
  tags?: string[]
}

class MongoDatabase {
  private initialized = false

  private async ensureInitialized() {
    if (!this.initialized) {
      await initializeDatabase()
      
      // Inserir categorias padrão se não existirem
      const categoriesCollection = await getCollection('user_categories')
      const existingCategories = await categoriesCollection.countDocuments({ userId: 'system' })
      
      if (existingCategories === 0) {
        await categoriesCollection.insertMany(defaultCategories)
        console.log('[MongoDB] Categorias padrão inseridas')
      }
      
      this.initialized = true
    }
  }

  // CREATE - Criar nova receita
  async createRecipe(
    recipeData: Omit<Recipe, "_id" | "id" | "createdAt" | "updatedAt" | "rating" | "favorites">,
  ): Promise<Recipe> {
    await this.ensureInitialized()
    
    try {
      const recipesCollection = await getCollection('recipes')
      const recipeId = Date.now().toString()
      const now = new Date()

      const newRecipe: Omit<Recipe, '_id'> = {
        id: recipeId,
        title: recipeData.title,
        description: recipeData.description,
        prepTime: recipeData.prepTime,
        cookTime: recipeData.cookTime,
        servings: recipeData.servings,
        difficulty: recipeData.difficulty,
        category: recipeData.category,
        temperature: recipeData.temperature,
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions,
        tags: recipeData.tags,
        imageUrl: recipeData.imageUrl,
        rating: 0,
        favorites: 0,
        createdAt: now,
        updatedAt: now
      }

      const result = await recipesCollection.insertOne(newRecipe)
      
      console.log("[MongoDB] Receita salva no banco:", recipeData.title)
      
      // Retornar receita completa
      const createdRecipe = await recipesCollection.findOne({ _id: result.insertedId })
      return createdRecipe as Recipe
    } catch (error) {
      console.error('[MongoDB] Erro ao criar receita:', error)
      throw error
    }
  }

  // READ - Buscar todas as receitas
  async getAllRecipes(): Promise<Recipe[]> {
    await this.ensureInitialized()
    
    try {
      const recipesCollection = await getCollection('recipes')
      const recipes = await recipesCollection
        .find({})
        .sort({ createdAt: -1 })
        .toArray()

      return recipes.map(recipe => ({
        ...recipe,
        _id: recipe._id
      })) as Recipe[]
    } catch (error) {
      console.error('[MongoDB] Erro ao buscar receitas:', error)
      throw error
    }
  }

  // READ - Buscar receita por ID
  async getRecipeById(id: string): Promise<Recipe | null> {
    await this.ensureInitialized()
    
    try {
      const recipesCollection = await getCollection('recipes')
      const recipe = await recipesCollection.findOne({ id })

      if (!recipe) return null

      return {
        ...recipe,
        _id: recipe._id
      } as Recipe
    } catch (error) {
      console.error('[MongoDB] Erro ao buscar receita por ID:', error)
      throw error
    }
  }

  // READ - Buscar receitas com filtros
  async searchRecipes(filters: RecipeFilters): Promise<Recipe[]> {
    await this.ensureInitialized()
    
    try {
      const recipesCollection = await getCollection('recipes')
      const query: any = {}

      // Filtro de busca por texto
      if (filters.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } },
          { 'ingredients.item': { $regex: filters.search, $options: 'i' } },
          { tags: { $regex: filters.search, $options: 'i' } }
        ]
      }

      // Filtro por categoria
      if (filters.category) {
        query.category = filters.category
      }

      // Filtro por dificuldade
      if (filters.difficulty) {
        query.difficulty = filters.difficulty
      }

      // Filtro por rating mínimo
      if (filters.minRating) {
        query.rating = { $gte: filters.minRating }
      }

      // Filtro por tags
      if (filters.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags }
      }

      const recipes = await recipesCollection
        .find(query)
        .sort({ createdAt: -1 })
        .toArray()

      return recipes.map(recipe => ({
        ...recipe,
        _id: recipe._id
      })) as Recipe[]
    } catch (error) {
      console.error('[MongoDB] Erro ao buscar receitas com filtros:', error)
      throw error
    }
  }

  // UPDATE - Atualizar receita
  async updateRecipe(id: string, updates: Partial<Recipe>): Promise<Recipe | null> {
    await this.ensureInitialized()
    
    try {
      const recipesCollection = await getCollection('recipes')
      
      // Verificar se a receita existe
      const existingRecipe = await this.getRecipeById(id)
      if (!existingRecipe) return null

      // Preparar dados para atualização
      const updateData: any = { ...updates }
      delete updateData._id
      delete updateData.id
      updateData.updatedAt = new Date()

      // Atualizar receita
      await recipesCollection.updateOne(
        { id },
        { $set: updateData }
      )

      console.log("[MongoDB] Receita atualizada:", id)
      return await this.getRecipeById(id) as Recipe
    } catch (error) {
      console.error('[MongoDB] Erro ao atualizar receita:', error)
      throw error
    }
  }

  // DELETE - Deletar receita
  async deleteRecipe(id: string): Promise<boolean> {
    await this.ensureInitialized()
    
    try {
      const recipesCollection = await getCollection('recipes')
      const favoritesCollection = await getCollection('favorites')
      
      // Deletar receita
      const result = await recipesCollection.deleteOne({ id })
      
      // Deletar favoritos relacionados
      await favoritesCollection.deleteMany({ recipeId: id })

      const deleted = result.deletedCount > 0
      if (deleted) {
        console.log("[MongoDB] Receita deletada:", id)
      }
      return deleted
    } catch (error) {
      console.error('[MongoDB] Erro ao deletar receita:', error)
      throw error
    }
  }

  // Operações de favoritos
  async toggleFavorite(recipeId: string, userId: string = 'default_user'): Promise<boolean> {
    await this.ensureInitialized()
    
    try {
      const favoritesCollection = await getCollection('favorites')
      const recipesCollection = await getCollection('recipes')
      
      // Verificar se já é favorito
      const existing = await favoritesCollection.findOne({ recipeId, userId })

      if (existing) {
        // Remover favorito
        await favoritesCollection.deleteOne({ recipeId, userId })
        await recipesCollection.updateOne(
          { id: recipeId },
          { $inc: { favorites: -1 } }
        )
        return false
      } else {
        // Adicionar favorito
        await favoritesCollection.insertOne({
          recipeId,
          userId,
          createdAt: new Date()
        })
        await recipesCollection.updateOne(
          { id: recipeId },
          { $inc: { favorites: 1 } }
        )
        return true
      }
    } catch (error) {
      console.error('[MongoDB] Erro ao toggle favorito:', error)
      throw error
    }
  }

  async getFavoriteRecipes(userId: string = 'default_user'): Promise<Recipe[]> {
    await this.ensureInitialized()
    
    try {
      const favoritesCollection = await getCollection('favorites')
      const recipesCollection = await getCollection('recipes')
      
      // Buscar IDs das receitas favoritas
      const favorites = await favoritesCollection
        .find({ userId })
        .sort({ createdAt: -1 })
        .toArray()

      const recipeIds = favorites.map(fav => fav.recipeId)
      
      // Buscar receitas favoritas
      const recipes = await recipesCollection
        .find({ id: { $in: recipeIds } })
        .toArray()

      return recipes.map(recipe => ({
        ...recipe,
        _id: recipe._id
      })) as Recipe[]
    } catch (error) {
      console.error('[MongoDB] Erro ao buscar receitas favoritas:', error)
      throw error
    }
  }

  async isFavorite(recipeId: string, userId: string = 'default_user'): Promise<boolean> {
    await this.ensureInitialized()
    
    try {
      const favoritesCollection = await getCollection('favorites')
      const favorite = await favoritesCollection.findOne({ recipeId, userId })
      return !!favorite
    } catch (error) {
      console.error('[MongoDB] Erro ao verificar favorito:', error)
      throw error
    }
  }

  // Estatísticas
  async getRecipeStats(userId: string = 'default_user') {
    await this.ensureInitialized()
    
    try {
      const recipesCollection = await getCollection('recipes')
      const favoritesCollection = await getCollection('favorites')

      const totalRecipes = await recipesCollection.countDocuments({})
      const totalFavorites = await favoritesCollection.countDocuments({ userId })
      
      // Contar receitas por categoria
      const categoryPipeline = [
        { $group: { _id: "$category", count: { $sum: 1 } } }
      ]
      
      const categoryCounts = await recipesCollection.aggregate(categoryPipeline).toArray()
      const categoryCountsObj = categoryCounts.reduce(
        (acc: any, item: any) => {
          acc[item._id] = item.count
            return acc
          },
          {}
      )

      return {
        totalRecipes,
        totalFavorites,
        categoryCounts: categoryCountsObj,
      }
    } catch (error) {
      console.error('[MongoDB] Erro ao buscar estatísticas:', error)
      throw error
    }
  }

  // Funções para categorias
  async getCategories(userId: string): Promise<any[]> {
    await this.ensureInitialized()
    
    try {
      const categoriesCollection = await getCollection('user_categories')
      
      // Buscar categorias padrão e do usuário
      const categories = await categoriesCollection
        .find({
          $or: [
            { isDefault: true },
            { userId: userId, isDefault: false }
          ]
        })
        .sort({ name: 1 })
        .toArray()

      return categories
    } catch (error) {
      console.error('[MongoDB] Erro ao buscar categorias:', error)
      throw error
    }
  }

  async createCategory(userId: string, name: string, slug: string): Promise<any> {
    await this.ensureInitialized()
    
    try {
      const categoriesCollection = await getCollection('user_categories')
      
      // Verificar se já existe
      const existing = await categoriesCollection.findOne({ userId, slug })
      if (existing) {
        throw new Error('Categoria já existe')
      }

      const newCategory = {
        userId,
        name,
        slug,
        isDefault: false,
        createdAt: new Date()
      }

      const result = await categoriesCollection.insertOne(newCategory)
      return { ...newCategory, _id: result.insertedId }
    } catch (error) {
      console.error('[MongoDB] Erro ao criar categoria:', error)
      throw error
    }
  }

  async deleteCategory(userId: string, slug: string): Promise<boolean> {
    await this.ensureInitialized()
    
    try {
      const categoriesCollection = await getCollection('user_categories')
      
      // Verificar se existe e não é padrão
      const category = await categoriesCollection.findOne({ userId, slug })
      if (!category) {
        throw new Error('Categoria não encontrada')
      }
      
      if (category.isDefault) {
        throw new Error('Não é possível remover categorias padrão')
      }

      const result = await categoriesCollection.deleteOne({ userId, slug })
      return result.deletedCount > 0
    } catch (error) {
      console.error('[MongoDB] Erro ao deletar categoria:', error)
      throw error
    }
  }

  // Função de debug para listar todas as categorias
  async getAllCategories(): Promise<any[]> {
    await this.ensureInitialized()
    
    try {
      const categoriesCollection = await getCollection('user_categories')
      const allCategories = await categoriesCollection.find({}).toArray()
      return allCategories
    } catch (error) {
      console.error('[MongoDB] Erro ao buscar todas as categorias:', error)
      throw error
    }
  }
}

// Singleton instance
export const db = new MongoDatabase()

  // Função para popular dados de exemplo (apenas na primeira vez)
  export const seedDatabase = async () => {
    try {
      const recipes = await db.getAllRecipes()
    
    if (recipes.length === 0) {
      console.log("[MongoDB] Populando banco com receitas de exemplo...")

      const sampleRecipes = [
        {
          title: "Pasta com Ervas Frescas",
          description: "Uma deliciosa pasta italiana com ervas frescas e azeite de oliva",
          prepTime: "15 min",
          cookTime: "20 min",
          servings: "4",
          difficulty: "facil",
          category: "pratos-principais",
          temperature: "",
          ingredients: [
            { item: "Massa penne", quantity: "400g" },
            { item: "Manjericão fresco", quantity: "1 xícara" },
            { item: "Azeite de oliva", quantity: "3 colheres de sopa" },
            { item: "Alho", quantity: "3 dentes" },
          ],
          instructions: [
            "Cozinhe a massa em água fervente com sal até ficar al dente",
            "Em uma frigideira, aqueça o azeite e refogue o alho picado",
            "Adicione as ervas frescas e tempere com sal e pimenta",
            "Misture a massa escorrida com o molho e sirva imediatamente",
          ],
          tags: ["Italiano", "Vegetariano", "Rápido"],
        },
        {
          title: "Bolo de Chocolate",
          description: "Bolo de chocolate fofinho e irresistível",
          prepTime: "20 min",
          cookTime: "40 min",
          servings: "8",
          difficulty: "medio",
          category: "sobremesas",
          temperature: "180°C",
          ingredients: [
            { item: "Farinha de trigo", quantity: "2 xícaras" },
            { item: "Chocolate em pó", quantity: "1/2 xícara" },
            { item: "Açúcar", quantity: "1 1/2 xícara" },
            { item: "Ovos", quantity: "3 unidades" },
          ],
          instructions: [
            "Pré-aqueça o forno a 180°C",
            "Misture todos os ingredientes secos em uma tigela",
            "Adicione os ovos e misture bem",
            "Asse por 40 minutos ou até dourar",
          ],
          tags: ["Chocolate", "Festa", "Sobremesa"],
        },
      ]

      for (const recipe of sampleRecipes) {
        await db.createRecipe(recipe)
      }
    }
  } catch (error) {
    console.error("[MongoDB] Erro ao popular banco de dados:", error)
  }
}