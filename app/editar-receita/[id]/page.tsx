"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, X, Upload, Clock, Users, ChefHat, Trash2, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Mock data - in a real app this would come from a database
const mockRecipe = {
  id: "1",
  title: "Pasta com Ervas Frescas",
  description: "Uma receita clássica italiana com manjericão e tomates frescos",
  image: "/placeholder.svg?height=400&width=600",
  prepTime: "15",
  cookTime: "15",
  servings: "4",
  difficulty: "Fácil",
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
}

export default function EditRecipePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    prepTime: "",
    cookTime: "",
    servings: "",
    difficulty: "",
    category: "",
  })
  const [ingredients, setIngredients] = useState([{ item: "", quantity: "" }])
  const [instructions, setInstructions] = useState([""])
  const [tips, setTips] = useState([""])
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Load recipe data on component mount
  useEffect(() => {
    // In a real app, this would fetch from an API
    setFormData({
      title: mockRecipe.title,
      description: mockRecipe.description,
      prepTime: mockRecipe.prepTime,
      cookTime: mockRecipe.cookTime,
      servings: mockRecipe.servings,
      difficulty: mockRecipe.difficulty,
      category: mockRecipe.category,
    })
    setIngredients(mockRecipe.ingredients)
    setInstructions(mockRecipe.instructions)
    setTips(mockRecipe.tips)
    setTags(mockRecipe.tags)
  }, [])

  const addIngredient = () => {
    setIngredients([...ingredients, { item: "", quantity: "" }])
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const updateIngredient = (index: number, field: "item" | "quantity", value: string) => {
    const updated = ingredients.map((ingredient, i) => (i === index ? { ...ingredient, [field]: value } : ingredient))
    setIngredients(updated)
  }

  const addInstruction = () => {
    setInstructions([...instructions, ""])
  }

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index))
  }

  const updateInstruction = (index: number, value: string) => {
    const updated = instructions.map((instruction, i) => (i === index ? value : instruction))
    setInstructions(updated)
  }

  const addTip = () => {
    setTips([...tips, ""])
  }

  const removeTip = (index: number) => {
    setTips(tips.filter((_, i) => i !== index))
  }

  const updateTip = (index: number, value: string) => {
    const updated = tips.map((tip, i) => (i === index ? value : tip))
    setTips(updated)
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSave = () => {
    // In a real app, this would save to an API
    console.log("Saving recipe:", { formData, ingredients, instructions, tips, tags })
    router.push(`/receita/${params.id}`)
  }

  const handleDelete = () => {
    // In a real app, this would delete from an API
    console.log("Deleting recipe:", params.id)
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card book-page sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/receita/${params.id}`}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Cancelar
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Deletar
              </Button>
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                Salvar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="font-serif text-xl">Confirmar Exclusão</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Tem certeza que deseja deletar esta receita? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Deletar Receita
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-3">Editar Receita</h1>
          <p className="text-lg text-muted-foreground">Faça as alterações necessárias em sua receita</p>
        </div>

        <form className="space-y-8">
          {/* Basic Information */}
          <Card className="book-page">
            <CardHeader>
              <CardTitle className="font-serif text-xl">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título da Receita</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Foto da Receita</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">Clique para alterar a imagem ou arraste uma nova</p>
                  <Button variant="outline" size="sm">
                    Escolher Nova Imagem
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prep-time">Tempo de Preparo (min)</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="prep-time"
                      value={formData.prepTime}
                      onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cook-time">Tempo de Cozimento (min)</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="cook-time"
                      value={formData.cookTime}
                      onChange={(e) => setFormData({ ...formData, cookTime: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servings">Porções</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="servings"
                      value={formData.servings}
                      onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Dificuldade</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                  >
                    <SelectTrigger>
                      <ChefHat className="h-4 w-4 text-muted-foreground mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fácil">Fácil</SelectItem>
                      <SelectItem value="Médio">Médio</SelectItem>
                      <SelectItem value="Difícil">Difícil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pratos Principais">Pratos Principais</SelectItem>
                    <SelectItem value="Sobremesas">Sobremesas</SelectItem>
                    <SelectItem value="Entradas">Entradas</SelectItem>
                    <SelectItem value="Bebidas">Bebidas</SelectItem>
                    <SelectItem value="Vegetariano">Vegetariano</SelectItem>
                    <SelectItem value="Doces">Doces</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Ingredients */}
          <Card className="book-page">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-serif text-xl">Ingredientes</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addIngredient}
                  className="gap-2 bg-transparent"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-3 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>Ingrediente</Label>
                      <Input
                        value={ingredient.item}
                        onChange={(e) => updateIngredient(index, "item", e.target.value)}
                      />
                    </div>
                    <div className="w-32 space-y-2">
                      <Label>Quantidade</Label>
                      <Input
                        value={ingredient.quantity}
                        onChange={(e) => updateIngredient(index, "quantity", e.target.value)}
                      />
                    </div>
                    {ingredients.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeIngredient(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="book-page">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-serif text-xl">Modo de Preparo</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addInstruction}
                  className="gap-2 bg-transparent"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Passo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold mt-2">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-2">
                      <Textarea
                        value={instruction}
                        onChange={(e) => updateInstruction(index, e.target.value)}
                        rows={3}
                      />
                    </div>
                    {instructions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInstruction(index)}
                        className="text-destructive hover:text-destructive mt-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="book-page">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-serif text-xl">Dicas do Chef</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addTip} className="gap-2 bg-transparent">
                  <Plus className="h-4 w-4" />
                  Adicionar Dica
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tips.map((tip, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-accent rounded-full mt-3"></div>
                    <div className="flex-1 space-y-2">
                      <Textarea value={tip} onChange={(e) => updateTip(index, e.target.value)} rows={2} />
                    </div>
                    {tips.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTip(index)}
                        className="text-destructive hover:text-destructive mt-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className="book-page">
            <CardHeader>
              <CardTitle className="font-serif text-xl">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Adicionar tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    Adicionar
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-center gap-4 pt-6">
            <Link href={`/receita/${params.id}`}>
              <Button type="button" variant="outline" size="lg">
                Cancelar
              </Button>
            </Link>
            <Button type="button" onClick={handleSave} size="lg" className="gap-2">
              <Save className="h-4 w-4" />
              Salvar Alterações
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
