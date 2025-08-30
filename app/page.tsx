"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ChefHat, Heart } from "lucide-react"
import { RecipeCard } from "@/components/recipe-card"
import { MainNav } from "@/components/main-nav"
import Link from "next/link"
import type { Recipe } from "@/lib/database"

export default function RecipeBookHome() {
  const [featuredRecipes, setFeaturedRecipes] = useState<Recipe[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("[API] Carregando dados...")

        // Busca todas as receitas via API
        let response = await fetch('/api/recipes')
        
        if (!response.ok) {
          throw new Error('Erro ao carregar receitas')
        }
        
        const recipes: Recipe[] = await response.json()
        
        // Se não há receitas, inicializa o banco
        if (recipes.length === 0) {
          console.log("[API] Inicializando banco de dados...")
          await fetch('/api/init', { method: 'POST' })
          const initResponse = await fetch('/api/recipes')
          if (initResponse.ok) {
            const newRecipes: Recipe[] = await initResponse.json()
            recipes.push(...newRecipes)
          }
        }
        console.log("[API] Receitas carregadas:", recipes.length)

        // Pega as 6 receitas mais recentes para destaque
        const featured = recipes
          .sort((a: Recipe, b: Recipe) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 6)

        setFeaturedRecipes(featured)

        // Busca todas as categorias (padrões e do usuário)
        console.log("[API] Carregando categorias...")
        const categoriesResponse = await fetch('/api/categories?userId=default_user')
        
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData.categories || [])
          console.log("[API] Categorias carregadas:", categoriesData.categories?.length || 0)
        } else {
          console.error("[API] Erro ao carregar categorias")
        }
      } catch (error) {
        console.error("[API] Erro ao carregar dados:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const mapRecipeToCardFormat = (recipe: Recipe) => ({
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    image: recipe.imageUrl || "/placeholder.svg?height=200&width=300",
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    totalTime: `${Number.parseInt(recipe.prepTime || "0") + Number.parseInt(recipe.cookTime || "0")} min`,
    servings: Number.parseInt(recipe.servings || "1"),
    difficulty: recipe.difficulty === "facil" ? "Fácil" : recipe.difficulty === "medio" ? "Médio" : "Difícil",
    rating: recipe.rating || 0,
    category: recipe.category,
    tags: recipe.tags,
    isFavorite: false, // Será atualizado dinamicamente
  })

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Bem-vindo ao seu Livro de Receitas
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubra, crie e compartilhe receitas incríveis. Sua coleção pessoal de sabores únicos.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Link href="/buscar">
            <div className="relative cursor-pointer group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <Input
                placeholder="Buscar receitas, ingredientes ou categorias..."
                className="pl-10 h-12 text-base book-page group-hover:shadow-md transition-shadow"
                readOnly
              />
            </div>
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 pb-8">
        <h2 className="text-2xl font-serif font-semibold mb-6 text-center">Categorias</h2>
        {isLoading ? (
          <div className="flex flex-wrap justify-center gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="w-24 h-8 bg-muted rounded-full"></div>
              </div>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Link key={category.slug} href={`/buscar?categoria=${encodeURIComponent(category.name)}`}>
                <Badge
                  variant={category.isDefault ? "secondary" : "default"}
                  className="px-4 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-105"
                >
                  {category.name}
                </Badge>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando categorias...</p>
          </div>
        )}
      </section>

      {/* Featured Recipes */}
      <section className="container mx-auto px-4 pb-12">
        <h2 className="text-2xl font-serif font-semibold mb-8 text-center">
          {isLoading ? "Carregando Receitas..." : featuredRecipes.length > 0 ? "Suas Receitas" : "Receitas em Destaque"}
        </h2>

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
        ) : featuredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRecipes.map((recipe, index) => (
              <div key={recipe.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <RecipeCard recipe={mapRecipeToCardFormat(recipe)} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ChefHat className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-serif font-semibold mb-2">Nenhuma receita encontrada</h3>
            <p className="text-muted-foreground mb-6">Comece criando sua primeira receita!</p>
            <Link href="/nova-receita">
              <Badge variant="default" className="px-6 py-2 cursor-pointer hover:bg-primary/90">
                Criar Primeira Receita
              </Badge>
            </Link>
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section className="bg-card border-t border-border book-page">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/nova-receita">
              <div className="text-center group cursor-pointer">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <ChefHat className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-serif font-semibold text-lg mb-2">Criar Receita</h3>
                <p className="text-muted-foreground text-sm">
                  Adicione suas receitas favoritas com fotos e instruções detalhadas
                </p>
              </div>
            </Link>
            <Link href="/buscar">
              <div className="text-center group cursor-pointer">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                  <Search className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-serif font-semibold text-lg mb-2">Descobrir</h3>
                <p className="text-muted-foreground text-sm">
                  Explore receitas por ingredientes, tempo de preparo ou categoria
                </p>
              </div>
            </Link>
            <Link href="/favoritos">
              <div className="text-center group cursor-pointer">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/20 transition-colors">
                  <Heart className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="font-serif font-semibold text-lg mb-2">Favoritos</h3>
                <p className="text-muted-foreground text-sm">Salve suas receitas preferidas para acesso rápido</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
