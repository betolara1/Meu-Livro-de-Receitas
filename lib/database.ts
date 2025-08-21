import { pool, initializeDatabase } from './database-config'
import mysql from 'mysql2/promise'

export interface Recipe {
  id: string
  title: string
  description: string
  prepTime: string
  cookTime: string
  servings: string
  difficulty: string
  category: string
  ingredients: { item: string; quantity: string }[]
  instructions: string[]
  tags: string[]
  imageUrl?: string
  rating: number
  favorites: number
  createdAt: string
  updatedAt: string
}

export interface RecipeFilters {
  search?: string
  category?: string
  difficulty?: string
  minRating?: number
  tags?: string[]
}

class MySQLDatabase {
  private initialized = false

  private async ensureInitialized() {
    if (!this.initialized) {
      await initializeDatabase()
      this.initialized = true
    }
  }

  // CREATE - INSERT INTO recipes
  async createRecipe(
    recipeData: Omit<Recipe, "id" | "createdAt" | "updatedAt" | "rating" | "favorites">,
  ): Promise<Recipe> {
    await this.ensureInitialized()
    
    const connection = await pool.getConnection()
    try {
      const recipeId = Date.now().toString()
      const now = new Date().toISOString()

      // Inserir receita principal
      await connection.execute(
        `INSERT INTO recipes (id, title, description, prep_time, cook_time, servings, difficulty, category, image_url, rating, favorites_count, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          recipeId,
          recipeData.title,
          recipeData.description,
          recipeData.prepTime,
          recipeData.cookTime,
          recipeData.servings,
          recipeData.difficulty,
          recipeData.category,
          recipeData.imageUrl || null,
          0,
          0,
          now,
          now
        ]
      )

      // Inserir ingredientes
      for (const ingredient of recipeData.ingredients) {
        await connection.execute(
          `INSERT INTO ingredients (recipe_id, item, quantity) VALUES (?, ?, ?)`,
          [recipeId, ingredient.item, ingredient.quantity]
        )
      }

      // Inserir instruções
      for (let i = 0; i < recipeData.instructions.length; i++) {
        await connection.execute(
          `INSERT INTO instructions (recipe_id, step_number, instruction) VALUES (?, ?, ?)`,
          [recipeId, i + 1, recipeData.instructions[i]]
        )
      }

      // Inserir tags
      for (const tagName of recipeData.tags) {
        // Verificar se a tag já existe
        const [existingTags] = await connection.execute(
          `SELECT id FROM tags WHERE name = ?`,
          [tagName]
        ) as any[]

        let tagId: number
        if (existingTags.length === 0) {
          // Criar nova tag
          const [result] = await connection.execute(
            `INSERT INTO tags (name) VALUES (?)`,
            [tagName]
          ) as any[]
          tagId = result.insertId
        } else {
          tagId = existingTags[0].id
        }

        // Relacionar tag com receita
        await connection.execute(
          `INSERT INTO recipe_tags (recipe_id, tag_id) VALUES (?, ?)`,
          [recipeId, tagId]
        )
      }

      console.log("[MySQL] Receita salva no banco:", recipeData.title)
      
      // Retornar receita completa
      return await this.getRecipeById(recipeId) as Recipe
    } finally {
      connection.release()
    }
  }

  // READ - SELECT * FROM recipes
  async getAllRecipes(): Promise<Recipe[]> {
    await this.ensureInitialized()
    
    const connection = await pool.getConnection()
    try {
      const [recipes] = await connection.execute(
        `SELECT * FROM recipes ORDER BY created_at DESC`
      ) as any[]

      const recipesWithDetails = await Promise.all(
        recipes.map(async (recipe: any) => {
          return await this.getRecipeById(recipe.id) as Recipe
        })
      )

      return recipesWithDetails
    } finally {
      connection.release()
    }
  }

  // READ - SELECT * FROM recipes WHERE id = ?
  async getRecipeById(id: string): Promise<Recipe | null> {
    await this.ensureInitialized()
    
    const connection = await pool.getConnection()
    try {
      const [recipes] = await connection.execute(
        `SELECT * FROM recipes WHERE id = ?`,
        [id]
      ) as any[]

      if (recipes.length === 0) return null

      const recipe = recipes[0]

      // Buscar ingredientes
      const [ingredients] = await connection.execute(
        `SELECT item, quantity FROM ingredients WHERE recipe_id = ? ORDER BY id`,
        [id]
      ) as any[]

      // Buscar instruções
      const [instructions] = await connection.execute(
        `SELECT instruction FROM instructions WHERE recipe_id = ? ORDER BY step_number`,
        [id]
      ) as any[]

      // Buscar tags
      const [tags] = await connection.execute(
        `SELECT t.name FROM tags t 
         JOIN recipe_tags rt ON t.id = rt.tag_id 
         WHERE rt.recipe_id = ?`,
        [id]
      ) as any[]

      return {
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        prepTime: recipe.prep_time,
        cookTime: recipe.cook_time,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        category: recipe.category,
        imageUrl: recipe.image_url,
        rating: parseFloat(recipe.rating) || 0,
        favorites: recipe.favorites_count || 0,
        createdAt: recipe.created_at,
        updatedAt: recipe.updated_at,
        ingredients: ingredients.map((ing: any) => ({
          item: ing.item,
          quantity: ing.quantity
        })),
        instructions: instructions.map((inst: any) => inst.instruction),
        tags: tags.map((tag: any) => tag.name)
      }
    } finally {
      connection.release()
    }
  }

  // READ - SELECT * FROM recipes WHERE ... (com filtros)
  async searchRecipes(filters: RecipeFilters): Promise<Recipe[]> {
    await this.ensureInitialized()
    
    const connection = await pool.getConnection()
    try {
      let query = `
        SELECT DISTINCT r.* FROM recipes r
        LEFT JOIN ingredients i ON r.id = i.recipe_id
        LEFT JOIN recipe_tags rt ON r.id = rt.recipe_id
        LEFT JOIN tags t ON rt.tag_id = t.id
        WHERE 1=1
      `
      const params: any[] = []

      if (filters.search) {
        query += ` AND (
          r.title LIKE ? OR 
          r.description LIKE ? OR 
          i.item LIKE ? OR 
          t.name LIKE ?
        )`
        const searchTerm = `%${filters.search}%`
        params.push(searchTerm, searchTerm, searchTerm, searchTerm)
      }

      if (filters.category) {
        query += ` AND r.category = ?`
        params.push(filters.category)
      }

      if (filters.difficulty) {
        query += ` AND r.difficulty = ?`
        params.push(filters.difficulty)
      }

      if (filters.minRating) {
        query += ` AND r.rating >= ?`
        params.push(filters.minRating)
      }

      if (filters.tags && filters.tags.length > 0) {
        query += ` AND t.name IN (${filters.tags.map(() => '?').join(',')})`
        params.push(...filters.tags)
      }

      query += ` ORDER BY r.created_at DESC`

      const [recipes] = await connection.execute(query, params) as any[]

      const recipesWithDetails = await Promise.all(
        recipes.map(async (recipe: any) => {
          return await this.getRecipeById(recipe.id) as Recipe
        })
      )

      return recipesWithDetails
    } finally {
      connection.release()
    }
  }

  // UPDATE - UPDATE recipes SET ... WHERE id = ?
  async updateRecipe(id: string, updates: Partial<Recipe>): Promise<Recipe | null> {
    await this.ensureInitialized()
    
    const connection = await pool.getConnection()
    try {
      // Verificar se a receita existe
      const existingRecipe = await this.getRecipeById(id)
      if (!existingRecipe) return null

      // Atualizar dados principais
      if (updates.title || updates.description || updates.prepTime || updates.cookTime || 
          updates.servings || updates.difficulty || updates.category || updates.imageUrl) {
        
        const updateFields = []
        const updateParams = []
        
        if (updates.title) {
          updateFields.push('title = ?')
          updateParams.push(updates.title)
        }
        if (updates.description) {
          updateFields.push('description = ?')
          updateParams.push(updates.description)
        }
        if (updates.prepTime) {
          updateFields.push('prep_time = ?')
          updateParams.push(updates.prepTime)
        }
        if (updates.cookTime) {
          updateFields.push('cook_time = ?')
          updateParams.push(updates.cookTime)
        }
        if (updates.servings) {
          updateFields.push('servings = ?')
          updateParams.push(updates.servings)
        }
        if (updates.difficulty) {
          updateFields.push('difficulty = ?')
          updateParams.push(updates.difficulty)
        }
        if (updates.category) {
          updateFields.push('category = ?')
          updateParams.push(updates.category)
        }
        if (updates.imageUrl !== undefined) {
          updateFields.push('image_url = ?')
          updateParams.push(updates.imageUrl)
        }

        updateParams.push(id)
        await connection.execute(
          `UPDATE recipes SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
          updateParams
        )
      }

      // Atualizar ingredientes se fornecidos
      if (updates.ingredients) {
        await connection.execute(`DELETE FROM ingredients WHERE recipe_id = ?`, [id])
        for (const ingredient of updates.ingredients) {
          await connection.execute(
            `INSERT INTO ingredients (recipe_id, item, quantity) VALUES (?, ?, ?)`,
            [id, ingredient.item, ingredient.quantity]
          )
        }
      }

      // Atualizar instruções se fornecidas
      if (updates.instructions) {
        await connection.execute(`DELETE FROM instructions WHERE recipe_id = ?`, [id])
        for (let i = 0; i < updates.instructions.length; i++) {
          await connection.execute(
            `INSERT INTO instructions (recipe_id, step_number, instruction) VALUES (?, ?, ?)`,
            [id, i + 1, updates.instructions[i]]
          )
        }
      }

      // Atualizar tags se fornecidas
      if (updates.tags) {
        await connection.execute(`DELETE FROM recipe_tags WHERE recipe_id = ?`, [id])
        for (const tagName of updates.tags) {
          // Verificar se a tag já existe
          const [existingTags] = await connection.execute(
            `SELECT id FROM tags WHERE name = ?`,
            [tagName]
          ) as any[]

          let tagId: number
          if (existingTags.length === 0) {
            const [result] = await connection.execute(
              `INSERT INTO tags (name) VALUES (?)`,
              [tagName]
            ) as any[]
            tagId = result.insertId
          } else {
            tagId = existingTags[0].id
          }

          await connection.execute(
            `INSERT INTO recipe_tags (recipe_id, tag_id) VALUES (?, ?)`,
            [id, tagId]
          )
        }
      }

      console.log("[MySQL] Receita atualizada:", id)
      return await this.getRecipeById(id) as Recipe
    } finally {
      connection.release()
    }
  }

  // DELETE - DELETE FROM recipes WHERE id = ?
  async deleteRecipe(id: string): Promise<boolean> {
    await this.ensureInitialized()
    
    const connection = await pool.getConnection()
    try {
      const [result] = await connection.execute(
        `DELETE FROM recipes WHERE id = ?`,
        [id]
      ) as any[]

      const deleted = result.affectedRows > 0
      if (deleted) {
        console.log("[MySQL] Receita deletada:", id)
      }
      return deleted
    } finally {
      connection.release()
    }
  }

  // Operações de favoritos
  async toggleFavorite(recipeId: string): Promise<boolean> {
    await this.ensureInitialized()
    
    const connection = await pool.getConnection()
    try {
      // Verificar se já é favorito
      const [existing] = await connection.execute(
        `SELECT id FROM favorites WHERE recipe_id = ? AND user_id = 'default_user'`,
        [recipeId]
      ) as any[]

      if (existing.length > 0) {
        // Remover favorito
        await connection.execute(
          `DELETE FROM favorites WHERE recipe_id = ? AND user_id = 'default_user'`,
          [recipeId]
        )
        await connection.execute(
          `UPDATE recipes SET favorites_count = favorites_count - 1 WHERE id = ?`,
          [recipeId]
        )
        return false
      } else {
        // Adicionar favorito
        await connection.execute(
          `INSERT INTO favorites (recipe_id, user_id) VALUES (?, 'default_user')`,
          [recipeId]
        )
        await connection.execute(
          `UPDATE recipes SET favorites_count = favorites_count + 1 WHERE id = ?`,
          [recipeId]
        )
        return true
      }
    } finally {
      connection.release()
    }
  }

  async getFavoriteRecipes(): Promise<Recipe[]> {
    await this.ensureInitialized()
    
    const connection = await pool.getConnection()
    try {
      const [favorites] = await connection.execute(
        `SELECT r.* FROM recipes r
         JOIN favorites f ON r.id = f.recipe_id
         WHERE f.user_id = 'default_user'
         ORDER BY f.created_at DESC`
      ) as any[]

      const recipesWithDetails = await Promise.all(
        favorites.map(async (recipe: any) => {
          return await this.getRecipeById(recipe.id) as Recipe
        })
      )

      return recipesWithDetails
    } finally {
      connection.release()
    }
  }

  async isFavorite(recipeId: string): Promise<boolean> {
    await this.ensureInitialized()
    
    const connection = await pool.getConnection()
    try {
      const [favorites] = await connection.execute(
        `SELECT id FROM favorites WHERE recipe_id = ? AND user_id = 'default_user'`,
        [recipeId]
      ) as any[]

      return favorites.length > 0
    } finally {
      connection.release()
    }
  }

  // Estatísticas
  async getRecipeStats() {
    await this.ensureInitialized()
    
    const connection = await pool.getConnection()
    try {
      const [totalRecipes] = await connection.execute(
        `SELECT COUNT(*) as total FROM recipes`
      ) as any[]

      const [totalFavorites] = await connection.execute(
        `SELECT COUNT(*) as total FROM favorites WHERE user_id = 'default_user'`
      ) as any[]

      const [categoryCounts] = await connection.execute(
        `SELECT category, COUNT(*) as count FROM recipes GROUP BY category`
      ) as any[]

      return {
        totalRecipes: totalRecipes[0].total,
        totalFavorites: totalFavorites[0].total,
        categoryCounts: categoryCounts.reduce(
          (acc: any, row: any) => {
            acc[row.category] = row.count
            return acc
          },
          {}
        ),
      }
    } finally {
      connection.release()
    }
  }
}

// Singleton instance
export const db = new MySQLDatabase()

  // Função para popular dados de exemplo (apenas na primeira vez)
  export const seedDatabase = async () => {
    try {
      const recipes = await db.getAllRecipes()
    
    if (recipes.length === 0) {
      console.log("[MySQL] Populando banco com receitas de exemplo...")

      const sampleRecipes = [
        {
          title: "Pasta com Ervas Frescas",
          description: "Uma deliciosa pasta italiana com ervas frescas e azeite de oliva",
          prepTime: "15 min",
          cookTime: "20 min",
          servings: "4",
          difficulty: "facil",
          category: "pratos-principais",
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
    console.error("[MySQL] Erro ao popular banco de dados:", error)
  }
}
