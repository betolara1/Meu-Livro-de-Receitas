"use client"

import { useState, useEffect, use as usePromise } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Users, ChefHat, Heart, Share2, Edit, Star, Copy, Check } from "lucide-react"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import type { Recipe } from "@/lib/database"

export default function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params)
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        console.log("[API] Carregando receita:", id)
        const response = await fetch(`/api/recipes/${id}`)
        
        if (!response.ok) {
          throw new Error('Receita não encontrada')
        }
        
        const recipeData: Recipe = await response.json()
        setRecipe(recipeData)
        
        // Verificar se é favorita
        const favoriteResponse = await fetch(`/api/favorites?recipeId=${id}`)
        if (favoriteResponse.ok) {
          const favoriteData = await favoriteResponse.json()
          setIsFavorite(favoriteData.isFavorite)
        }
      } catch (error) {
        console.error("[API] Erro ao carregar receita:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadRecipe()
  }, [id])

  const handleFavorite = async () => {
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipeId: id }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setIsFavorite(data.isFavorite)
      }
    } catch (error) {
      console.error("Erro ao alterar favorito:", error)
    }
  }

  const handleShare = async () => {
    const url = window.location.href

          if (navigator.share && recipe) {
        try {
          await navigator.share({
            title: recipe.title,
            text: recipe.description,
            url: url,
          })
        } catch (err) {
          console.log("Error sharing:", err)
        }
      } else {
        // Fallback to copying URL
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
  }

  const copyRecipeText = async () => {
    if (!recipe) return
    
    const totalTime = (parseInt(recipe.prepTime || "0") + parseInt(recipe.cookTime || "0")) || "N/A"
    const difficulty = recipe.difficulty === "facil" ? "Fácil" : recipe.difficulty === "medio" ? "Médio" : "Difícil"
    
    const recipeText = `
${recipe.title}

${recipe.description}

Tempo: ${totalTime} min | Porções: ${recipe.servings} | Dificuldade: ${difficulty}

INGREDIENTES:
${recipe.ingredients.map((ing) => `• ${ing.quantity} ${ing.item}`).join("\n")}

MODO DE PREPARO:
${recipe.instructions.map((inst, i) => `${i + 1}. ${inst}`).join("\n\n")}
    `.trim()

    await navigator.clipboard.writeText(recipeText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card book-page sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="animate-pulse">
            <div className="bg-muted rounded-lg h-64 mb-6"></div>
            <div className="bg-muted rounded h-8 mb-4"></div>
            <div className="bg-muted rounded h-4 mb-6 w-3/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-muted rounded-lg h-96"></div>
              <div className="lg:col-span-2 bg-muted rounded-lg h-96"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card book-page sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
          <ChefHat className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-serif font-bold mb-2">Receita não encontrada</h1>
          <p className="text-muted-foreground">A receita que você está procurando não existe.</p>
        </div>
      </div>
    )
  }

  const totalTime = (parseInt(recipe.prepTime || "0") + parseInt(recipe.cookTime || "0")) || "N/A"
  const difficulty = recipe.difficulty === "facil" ? "Fácil" : recipe.difficulty === "medio" ? "Médio" : "Difícil"

  return (
    <div className="min-h-screen bg-background">
      <PageHeader>
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <div className="relative">
          <Button variant="ghost" size="sm" onClick={() => setShowShareMenu(!showShareMenu)}>
            <Share2 className="h-4 w-4" />
          </Button>
          {showShareMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-lg book-page z-20">
              <div className="p-2 space-y-1">
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                  Compartilhar Link
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={copyRecipeText}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copiado!" : "Copiar Receita"}
                </Button>
              </div>
            </div>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={handleFavorite}>
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-current text-accent" : ""}`} />
        </Button>
        <Link href={`/editar-receita/${id}`}>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Edit className="h-4 w-4" />
            Editar
          </Button>
        </Link>
      </PageHeader>

      {/* Click outside to close share menu */}
      {showShareMenu && <div className="fixed inset-0 z-10" onClick={() => setShowShareMenu(false)} />}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Recipe Header */}
        <div className="mb-8">
          <div className="aspect-video rounded-lg overflow-hidden mb-6 book-page">
            <img
              src={recipe.imageUrl || "/placeholder.svg"}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-4xl font-serif font-bold text-foreground mb-3">{recipe.title}</h1>
            <p className="text-lg text-muted-foreground mb-4">{recipe.description}</p>

            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{totalTime} min</span>
                </div>
                <span className="text-xs text-muted-foreground/70">Tempo total</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{recipe.servings} porções</span>
                </div>
                <span className="text-xs text-muted-foreground/70">Quantas pessoas</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1">
                  <ChefHat className="h-4 w-4" />
                  <span>{difficulty}</span>
                </div>
                <span className="text-xs text-muted-foreground/70">Nível de habilidade</span>
              </div>
              {recipe.temperature && (
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{recipe.temperature}</span>
                  </div>
                  <span className="text-xs text-muted-foreground/70">Forno, fogão, etc.</span>
                </div>
              )}
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current text-accent" />
                  <span>{recipe.rating}</span>
                </div>
                <span className="text-xs text-muted-foreground/70">Avaliação</span>
              </div>
            </div>
          </div>

          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground mb-3">Categoria e características da receita</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="secondary">{recipe.category}</Badge>
              {recipe.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ingredients */}
          <div className="lg:col-span-1">
            <Card className="book-page">
              <CardHeader>
                <CardTitle className="font-serif text-xl">Ingredientes</CardTitle>
                <p className="text-sm text-muted-foreground">Lista de todos os ingredientes necessários para a receita</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span className="text-foreground">{ingredient.item}</span>
                      <span className="text-muted-foreground font-medium">{ingredient.quantity}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <div className="lg:col-span-2">
            <Card className="book-page">
              <CardHeader>
                <CardTitle className="font-serif text-xl">Modo de Preparo</CardTitle>
                <p className="text-sm text-muted-foreground">Passo a passo detalhado para preparar a receita</p>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  {recipe.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <p className="text-foreground leading-relaxed pt-1">{instruction}</p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
