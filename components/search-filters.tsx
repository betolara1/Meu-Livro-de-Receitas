"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

interface SearchFiltersProps {
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  selectedDifficulty: string
  setSelectedDifficulty: (difficulty: string) => void
  selectedTags: string[]
  setSelectedTags: (tags: string[]) => void
  maxTime: number[]
  setMaxTime: (time: number[]) => void
  minRating: number[]
  setMinRating: (rating: number[]) => void
  onClearFilters: () => void
}

const categories = ["Todos", "Pratos Principais", "Sobremesas", "Entradas", "Bebidas", "Vegetariano", "Doces"]
const difficulties = ["Todos", "Fácil", "Médio", "Difícil"]
const tags = [
  "Italiano",
  "Vegetariano",
  "Saudável",
  "Rápido",
  "Chocolate",
  "Festa",
  "Doce",
  "Mediterrâneo",
  "Cremoso",
  "Detox",
]

export function SearchFilters({
  selectedCategory,
  setSelectedCategory,
  selectedDifficulty,
  setSelectedDifficulty,
  selectedTags,
  setSelectedTags,
  maxTime,
  setMaxTime,
  minRating,
  setMinRating,
  onClearFilters,
}: SearchFiltersProps) {
  const handleTagToggle = (tag: string) => {
    setSelectedTags(selectedTags.includes(tag) ? selectedTags.filter((t) => t !== tag) : [...selectedTags, tag])
  }

  const activeFiltersCount = [
    selectedCategory !== "Todos",
    selectedDifficulty !== "Todos",
    selectedTags.length > 0,
    maxTime[0] < 120,
    minRating[0] > 0,
  ].filter(Boolean).length

  return (
    <Card className="book-page">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="font-serif text-lg">Filtros</CardTitle>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
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
          <Slider value={minRating} onValueChange={setMinRating} max={5} min={0} step={0.1} className="w-full" />
        </div>

        <Separator />

        {/* Tags Filter */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Tags</label>
          <div className="space-y-2">
            {tags.map((tag) => (
              <div key={tag} className="flex items-center space-x-2">
                <Checkbox id={tag} checked={selectedTags.includes(tag)} onCheckedChange={() => handleTagToggle(tag)} />
                <label htmlFor={tag} className="text-sm cursor-pointer">
                  {tag}
                </label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
