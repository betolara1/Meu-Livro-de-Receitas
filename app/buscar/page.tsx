"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Search, X, SlidersHorizontal } from "lucide-react"
import { RecipeCard } from "@/components/recipe-card"
import { MainNav } from "@/components/main-nav"
import type { Recipe } from "@/lib/database"

const difficulties = ["Todos", "Fácil", "Médio", "Difícil"]

export default function SearchPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [categories, setCategories] = useState<string[]>(["Todos"])
  const [tags, setTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [selectedDifficulty, setSelectedDifficulty] = useState("Todos")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [maxTime, setMaxTime] = useState([120]) // em minutos
  const [minRating, setMinRating] = useState([0])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Carregar receitas
        const recipesResponse = await fetch('/api/recipes')
        if (recipesResponse.ok) {
          const recipesData: Recipe[] = await recipesResponse.json()
          setRecipes(recipesData)

          // Extrair tags únicas
          const allTags = recipesData.flatMap((r: Recipe) => r.tags || [])
          const uniqueTags = Array.from(new Set(allTags))
          setTags(uniqueTags)
        }

        // Carregar todas as categorias (padrões e do usuário)
        const categoriesResponse = await fetch('/api/categories?userId=default_user')
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          const allCategories = categoriesData.categories || []
          const categoryNames = allCategories.map((cat: any) => cat.name)
          setCategories(["Todos", ...categoryNames])
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      // Filtro por termo de busca
      const matchesSearch =
        searchTerm === "" ||
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.ingredients.some((ingredient) => ingredient.item.toLowerCase().includes(searchTerm.toLowerCase())) ||
        recipe.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      // Filtro por categoria
      const matchesCategory = selectedCategory === "Todos" || recipe.category === selectedCategory

      // Filtro por dificuldade
      const difficultyMap = { "facil": "Fácil", "medio": "Médio", "dificil": "Difícil" }
      const recipeDifficulty = difficultyMap[recipe.difficulty as keyof typeof difficultyMap] || recipe.difficulty
      const matchesDifficulty = selectedDifficulty === "Todos" || recipeDifficulty === selectedDifficulty

      // Filtro por tags
      const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => recipe.tags.includes(tag))

      // Filtro por tempo
      const prepTime = parseInt(recipe.prepTime?.replace(/\D/g, "") || "0")
      const cookTime = parseInt(recipe.cookTime?.replace(/\D/g, "") || "0")
      const totalTime = prepTime + cookTime
      const matchesTime = totalTime <= maxTime[0]

      // Filtro por avaliação
      const matchesRating = recipe.rating >= minRating[0]

      return matchesSearch && matchesCategory && matchesDifficulty && matchesTags && matchesTime && matchesRating
    })
  }, [recipes, searchTerm, selectedCategory, selectedDifficulty, selectedTags, maxTime, minRating])

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
    isFavorite: false, // Será atualizado dinamicamente
  })

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const clearFilters = () => {
    setSelectedCategory("Todos")
    setSelectedDifficulty("Todos")
    setSelectedTags([])
    setMaxTime([120])
    setMinRating([0])
  }

  const activeFiltersCount = [
    selectedCategory !== "Todos",
    selectedDifficulty !== "Todos",
    selectedTags.length > 0,
    maxTime[0] < 120,
    minRating[0] > 0,
  ].filter(Boolean).length

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <div className="container mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar receitas, ingredientes ou categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base book-page focus:shadow-md transition-shadow"
            />
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-6 flex justify-center">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? "block" : "hidden"} lg:block w-full lg:w-80 space-y-6`}>
            <Card className="book-page">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="font-serif text-lg">Filtros</CardTitle>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Limpar
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Categoria</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dificuldade</label>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map((difficulty) => (
                        <SelectItem key={difficulty} value={difficulty}>
                          {difficulty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Time Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Tempo máximo: {maxTime[0]} min</label>
                  <Slider value={maxTime} onValueChange={setMaxTime} max={120} min={5} step={5} className="w-full" />
                </div>

                {/* Rating Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Avaliação mínima: {minRating[0].toFixed(1)}</label>
                  <Slider
                    value={minRating}
                    onValueChange={setMinRating}
                    max={5}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <Separator />

                {/* Tags Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={tag}
                          checked={selectedTags.includes(tag)}
                          onCheckedChange={() => handleTagToggle(tag)}
                        />
                        <label htmlFor={tag} className="text-sm cursor-pointer">
                          {tag}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <h2 className="text-xl font-serif font-semibold">
                {filteredRecipes.length} receita{filteredRecipes.length !== 1 ? "s" : ""} encontrada
                {filteredRecipes.length !== 1 ? "s" : ""}
              </h2>

              {/* Active Filters */}
              {(selectedTags.length > 0 || selectedCategory !== "Todos" || selectedDifficulty !== "Todos") && (
                <div className="flex flex-wrap gap-2">
                  {selectedCategory !== "Todos" && (
                    <Badge variant="secondary" className="gap-1">
                      {selectedCategory}
                      <button onClick={() => setSelectedCategory("Todos")}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedDifficulty !== "Todos" && (
                    <Badge variant="secondary" className="gap-1">
                      {selectedDifficulty}
                      <button onClick={() => setSelectedDifficulty("Todos")}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button onClick={() => handleTagToggle(tag)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Recipe Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-muted rounded-lg h-64 mb-4"></div>
                    <div className="bg-muted rounded h-4 mb-2"></div>
                    <div className="bg-muted rounded h-3 w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : filteredRecipes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRecipes.map((recipe, index) => (
                  <div key={recipe.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <RecipeCard recipe={mapRecipeToCardFormat(recipe)} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-serif font-semibold mb-2">Nenhuma receita encontrada</h3>
                <p className="text-muted-foreground mb-4">Tente ajustar seus filtros ou buscar por outros termos</p>
                <Button onClick={clearFilters} variant="outline">
                  Limpar Filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
