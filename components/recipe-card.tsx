import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Heart, Star } from "lucide-react"
import Link from "next/link"

interface Recipe {
  id: string
  title: string
  description: string
  image: string
  prepTime: string
  cookTime: string
  totalTime: string
  servings: number
  difficulty: string
  rating: number
  category: string
  tags: string[]
  isFavorite?: boolean
}

interface RecipeCardProps {
  recipe: Recipe
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link href={`/receita/${recipe.id}`}>
      <Card className="book-page hover:shadow-lg transition-all duration-300 cursor-pointer h-full hover-lift group">
        <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
          <img
            src={recipe.image || "/placeholder.svg"}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="font-serif text-lg line-clamp-2 group-hover:text-primary transition-colors">
                {recipe.title}
              </CardTitle>
              <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{recipe.description}</p>
            </div>
            <Heart
              className={`h-5 w-5 ml-2 cursor-pointer transition-all duration-200 flex-shrink-0 ${
                recipe.isFavorite
                  ? "text-accent fill-current"
                  : "text-muted-foreground hover:text-accent hover:scale-110"
              }`}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{recipe.totalTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{recipe.servings} porções</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-current text-accent" />
                <span>{recipe.rating}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              <Badge
                variant="secondary"
                className="text-xs transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                {recipe.category}
              </Badge>
              {recipe.tags.slice(0, 2).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {tag}
                </Badge>
              ))}
              {recipe.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{recipe.tags.length - 2}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
