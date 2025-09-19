export interface Recipe {
  id: string
  title: string
  description: string
  prepTime: string
  cookTime: string
  servings: string
  difficulty: 'facil' | 'medio' | 'dificil'
  category: string
  temperature?: string
  ingredients: { item: string; quantity: string }[]
  instructions: string[]
  tags: string[]
  imageUrl?: string
  images?: string[]
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

export interface Category {
  id: string
  name: string
  slug: string
  isDefault: boolean
  userId: string
  createdAt: string
}

export interface Favorite {
  recipeId: string
  userId: string
  createdAt: string
}
