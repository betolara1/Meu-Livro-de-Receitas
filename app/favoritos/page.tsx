import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { RecipeCard } from "@/components/recipe-card"
import { MainNav } from "@/components/main-nav"
import Link from "next/link"

// Mock data for favorite recipes
const favoriteRecipes = [
  {
    id: "2",
    title: "Bolo de Chocolate Cremoso",
    description: "Sobremesa irresistível para ocasiões especiais",
    image: "/placeholder.svg?height=200&width=300",
    prepTime: "30 min",
    cookTime: "45 min",
    totalTime: "1h 15min",
    servings: 8,
    difficulty: "Médio",
    rating: 4.9,
    category: "Sobremesas",
    tags: ["Chocolate", "Festa", "Doce"],
    isFavorite: true,
  },
  {
    id: "5",
    title: "Smoothie Verde Detox",
    description: "Bebida nutritiva e refrescante para começar o dia",
    image: "/placeholder.svg?height=200&width=300",
    prepTime: "5 min",
    cookTime: "0 min",
    totalTime: "5 min",
    servings: 1,
    difficulty: "Fácil",
    rating: 4.4,
    category: "Bebidas",
    tags: ["Saudável", "Detox", "Rápido", "Vegetariano"],
    isFavorite: true,
  },
]

export default function FavoritesPage() {
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

        {favoriteRecipes.length > 0 ? (
          <>
            <p className="text-muted-foreground text-center mb-8">
              {favoriteRecipes.length} receita{favoriteRecipes.length !== 1 ? "s" : ""} salva
              {favoriteRecipes.length !== 1 ? "s" : ""} nos seus favoritos
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteRecipes.map((recipe, index) => (
                <div key={recipe.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <RecipeCard recipe={recipe} />
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
