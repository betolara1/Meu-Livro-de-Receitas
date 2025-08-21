"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Users, ChefHat, Heart, Share2, Edit, Star, Copy, Check } from "lucide-react"
import Link from "next/link"

// Mock data - in a real app this would come from a database
const mockRecipe = {
  id: "1",
  title: "Pasta com Ervas Frescas",
  description: "Uma receita clássica italiana com manjericão e tomates frescos",
  image: "/placeholder.svg?height=400&width=600",
  prepTime: "15 min",
  cookTime: "15 min",
  totalTime: "30 min",
  servings: 4,
  difficulty: "Fácil",
  rating: 4.8,
  category: "Pratos Principais",
  tags: ["Italiano", "Vegetariano", "Rápido"],
  ingredients: [
    { item: "Massa penne", quantity: "400g" },
    { item: "Tomates cereja", quantity: "300g" },
    { item: "Manjericão fresco", quantity: "1 maço" },
    { item: "Alho", quantity: "3 dentes" },
    { item: "Azeite extra virgem", quantity: "4 colheres de sopa" },
    { item: "Queijo parmesão ralado", quantity: "100g" },
    { item: "Sal", quantity: "a gosto" },
    { item: "Pimenta-do-reino", quantity: "a gosto" },
  ],
  instructions: [
    "Coloque uma panela grande com água salgada para ferver. Quando estiver fervendo, adicione a massa e cozinhe conforme as instruções da embalagem até ficar al dente.",
    "Enquanto a massa cozinha, corte os tomates cereja ao meio e pique o alho finamente. Lave e seque as folhas de manjericão.",
    "Em uma frigideira grande, aqueça o azeite em fogo médio. Adicione o alho e refogue por 1 minuto até ficar aromático.",
    "Adicione os tomates cereja à frigideira e tempere com sal e pimenta. Cozinhe por 5-7 minutos até os tomates começarem a se desfazer.",
    "Escorra a massa reservando 1 xícara da água do cozimento. Adicione a massa à frigideira com os tomates.",
    "Misture bem, adicionando um pouco da água da massa se necessário para criar um molho cremoso.",
    "Retire do fogo e adicione as folhas de manjericão rasgadas e metade do queijo parmesão. Misture delicadamente.",
    "Sirva imediatamente com o restante do queijo parmesão polvilhado por cima.",
  ],
  tips: [
    "Use sempre manjericão fresco para obter o melhor sabor",
    "Não cozinhe demais os tomates para manter sua textura",
    "Reserve sempre um pouco da água da massa para ajustar a consistência do molho",
  ],
  nutrition: {
    calories: 420,
    protein: "15g",
    carbs: "65g",
    fat: "12g",
  },
}

export default function RecipePage({ params }: { params: { id: string } }) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleFavorite = () => {
    setIsFavorite(!isFavorite)
    // In a real app, this would save to an API
    console.log("Toggled favorite:", !isFavorite)
  }

  const handleShare = async () => {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title: mockRecipe.title,
          text: mockRecipe.description,
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
    const recipeText = `
${mockRecipe.title}

${mockRecipe.description}

Tempo: ${mockRecipe.totalTime} | Porções: ${mockRecipe.servings} | Dificuldade: ${mockRecipe.difficulty}

INGREDIENTES:
${mockRecipe.ingredients.map((ing) => `• ${ing.quantity} ${ing.item}`).join("\n")}

MODO DE PREPARO:
${mockRecipe.instructions.map((inst, i) => `${i + 1}. ${inst}`).join("\n\n")}

DICAS:
${mockRecipe.tips.map((tip) => `• ${tip}`).join("\n")}
    `.trim()

    await navigator.clipboard.writeText(recipeText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card book-page sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center gap-2">
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
              <Link href={`/editar-receita/${params.id}`}>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Click outside to close share menu */}
      {showShareMenu && <div className="fixed inset-0 z-10" onClick={() => setShowShareMenu(false)} />}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Recipe Header */}
        <div className="mb-8">
          <div className="aspect-video rounded-lg overflow-hidden mb-6 book-page">
            <img
              src={mockRecipe.image || "/placeholder.svg"}
              alt={mockRecipe.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-4xl font-serif font-bold text-foreground mb-3">{mockRecipe.title}</h1>
            <p className="text-lg text-muted-foreground mb-4">{mockRecipe.description}</p>

            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{mockRecipe.totalTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{mockRecipe.servings} porções</span>
              </div>
              <div className="flex items-center gap-1">
                <ChefHat className="h-4 w-4" />
                <span>{mockRecipe.difficulty}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-current text-accent" />
                <span>{mockRecipe.rating}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary">{mockRecipe.category}</Badge>
            {mockRecipe.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ingredients */}
          <div className="lg:col-span-1">
            <Card className="book-page">
              <CardHeader>
                <CardTitle className="font-serif text-xl">Ingredientes</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {mockRecipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span className="text-foreground">{ingredient.item}</span>
                      <span className="text-muted-foreground font-medium">{ingredient.quantity}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Nutrition Info */}
            <Card className="book-page mt-6">
              <CardHeader>
                <CardTitle className="font-serif text-xl">Informações Nutricionais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{mockRecipe.nutrition.calories}</div>
                    <div className="text-muted-foreground">Calorias</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{mockRecipe.nutrition.protein}</div>
                    <div className="text-muted-foreground">Proteína</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{mockRecipe.nutrition.carbs}</div>
                    <div className="text-muted-foreground">Carboidratos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{mockRecipe.nutrition.fat}</div>
                    <div className="text-muted-foreground">Gordura</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <div className="lg:col-span-2">
            <Card className="book-page">
              <CardHeader>
                <CardTitle className="font-serif text-xl">Modo de Preparo</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  {mockRecipe.instructions.map((instruction, index) => (
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

            {/* Tips */}
            <Card className="book-page mt-6">
              <CardHeader>
                <CardTitle className="font-serif text-xl">Dicas do Chef</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {mockRecipe.tips.map((tip, index) => (
                    <li key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-accent rounded-full mt-2"></div>
                      <p className="text-muted-foreground leading-relaxed">{tip}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
