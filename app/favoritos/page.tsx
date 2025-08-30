"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { RecipeCard } from "@/components/recipe-card"
import { MainNav } from "@/components/main-nav"
import Link from "next/link"
import type { Recipe } from "@/lib/database"

export default function FavoritesPage() {
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const response = await fetch('/api/favorites')
        if (response.ok) {
          const data = await response.json()
          setFavoriteRecipes(data.favorites || [])
        }
      } catch (error) {
        console.error("Erro ao carregar favoritos:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFavorites()
  }, [])

  const mapRecipeToCardFormat = (recipe: Recipe) => ({
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    image: recipe.imageUrl || "/placeholder.svg?height=200&width=300",
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    totalTime: `${(parseInt(recipe.prepTime || "0") + parseInt(recipe.cookTime || "0"))} min`,
    servings: parseInt(recipe.servings || "1"),
    difficulty: recipe.difficulty === "facil" ? "Fácil" : recipe.difficulty === "medio" ? "Médio" : "Difícil",
    rating: recipe.rating || 0,
    category: recipe.category,
    tags: recipe.tags,
    isFavorite: true,
  })
  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="h-8 w-8 text-accent fill-current" />
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Receitas Favoritas</h1>
          </div>
          <p className="text-muted-foreground">Suas receitas salvas em um só lugar</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg h-64 mb-4"></div>
                <div className="bg-muted rounded h-4 mb-2"></div>
                <div className="bg-muted rounded h-3 w-3/4"></div>
              </div>
            ))}
          </div>
        ) : favoriteRecipes.length > 0 ? (
          <>
            <p className="text-muted-foreground text-center mb-8">
              {favoriteRecipes.length} receita{favoriteRecipes.length !== 1 ? "s" : ""} salva
              {favoriteRecipes.length !== 1 ? "s" : ""} nos seus favoritos
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteRecipes.map((recipe, index) => (
                <div key={recipe.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <RecipeCard recipe={mapRecipeToCardFormat(recipe)} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-semibold mb-2">Nenhuma receita favorita</h2>
            <p className="text-muted-foreground mb-6">Comece a favoritar receitas para vê-las aqui</p>
            <Link href="/">
              <Button>Explorar Receitas</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
