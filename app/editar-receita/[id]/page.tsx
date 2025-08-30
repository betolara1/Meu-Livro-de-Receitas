"use client"

import { useState, useEffect, use as usePromise } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, X, Upload, Clock, Users, ChefHat, Trash2, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import type { Recipe } from "@/lib/database"

export default function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params)
  const router = useRouter()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    prepTime: "",
    cookTime: "",
    servings: "",
    difficulty: "",
    category: "",
    temperature: "",
  })
  const [ingredients, setIngredients] = useState([{ item: "", quantity: "" }])
  const [instructions, setInstructions] = useState([""])
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [categories, setCategories] = useState<Array<{name: string, slug: string, is_default: boolean}>>([])
  const [newCategory, setNewCategory] = useState("")
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true)
      const response = await fetch('/api/categories?userId=default_user')
      
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      } else {
        throw new Error('Erro ao carregar categorias')
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
      // Fallback para categorias padrão em caso de erro
      setCategories([
        { name: 'Pratos Principais', slug: 'pratos-principais', is_default: true },
        { name: 'Sobremesas', slug: 'sobremesas', is_default: true },
        { name: 'Entradas', slug: 'entradas', is_default: true },
        { name: 'Bebidas', slug: 'bebidas', is_default: true },
        { name: 'Vegetariano', slug: 'vegetariano', is_default: true },
        { name: 'Doces', slug: 'doces', is_default: true }
      ])
    } finally {
      setIsLoadingCategories(false)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        // Carregar categorias primeiro
        const categoriesResponse = await fetch('/api/categories?userId=temp-user-id')
        let loadedCategories = []
        
        if (categoriesResponse.ok) {
          const data = await categoriesResponse.json()
          loadedCategories = data.categories
          setCategories(loadedCategories)
        } else {
          // Fallback para categorias padrão
          loadedCategories = [
            { name: 'Pratos Principais', slug: 'pratos-principais', is_default: true },
            { name: 'Sobremesas', slug: 'sobremesas', is_default: true },
            { name: 'Entradas', slug: 'entradas', is_default: true },
            { name: 'Bebidas', slug: 'bebidas', is_default: true },
            { name: 'Vegetariano', slug: 'vegetariano', is_default: true },
            { name: 'Doces', slug: 'doces', is_default: true }
          ]
          setCategories(loadedCategories)
        }
        setIsLoadingCategories(false)
        
        // Depois carregar a receita
        const response = await fetch(`/api/recipes/${id}`)
        if (!response.ok) {
          throw new Error('Receita não encontrada')
        }
        
        const recipeData: Recipe = await response.json()
        setRecipe(recipeData)
        
        // Encontrar o slug da categoria baseado no nome salvo no banco
        const savedCategory = recipeData.category
        const categoryMatch = loadedCategories.find((cat: any) => 
          cat.name === savedCategory || cat.slug === savedCategory
        )
        const categorySlug = categoryMatch ? categoryMatch.slug : savedCategory

        setFormData({
          title: recipeData.title,
          description: recipeData.description,
          prepTime: recipeData.prepTime || "",
          cookTime: recipeData.cookTime || "",
          servings: recipeData.servings || "",
          difficulty: recipeData.difficulty === "facil" ? "Fácil" : recipeData.difficulty === "medio" ? "Médio" : "Difícil",
          category: categorySlug,
          temperature: recipeData.temperature || "",
        })
        setIngredients(recipeData.ingredients || [{ item: "", quantity: "" }])
        setInstructions(recipeData.instructions || [""])
        setTags(recipeData.tags || [])
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [id, router])

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



  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const addCategory = async () => {
    if (newCategory.trim()) {
      const categoryName = newCategory.trim()
      const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-')
      
      // Verificar se já existe
      if (categories.some(cat => cat.slug === categorySlug)) {
        alert('Esta categoria já existe!')
        return
      }

      try {
        // Salvar no banco de dados
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: 'default_user',
            name: categoryName,
            slug: categorySlug
          }),
        })

        if (response.ok) {
          const newCategoryData = {
            name: categoryName,
            slug: categorySlug,
            is_default: false
          }
          
          setCategories(prev => [...prev, newCategoryData])
          setFormData(prev => ({ ...prev, category: categorySlug }))
          setNewCategory("")
          setShowNewCategoryInput(false)
        } else {
          throw new Error('Erro ao salvar categoria')
        }
      } catch (error) {
        console.error('Erro ao criar categoria:', error)
        alert('Erro ao criar categoria. Tente novamente.')
      }
    }
  }

  const removeCategory = async (categoryToRemove: {name: string, slug: string, is_default: boolean}) => {
    if (categoryToRemove.is_default) {
      alert('Não é possível remover categorias padrão!')
      return
    }

    if (formData.category === categoryToRemove.slug) {
      setFormData(prev => ({ ...prev, category: "" }))
    }

    try {
      // Remover do banco de dados
              const response = await fetch(`/api/categories?userId=default_user&slug=${categoryToRemove.slug}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCategories(prev => prev.filter(cat => cat.slug !== categoryToRemove.slug))
      } else {
        throw new Error('Erro ao remover categoria')
      }
    } catch (error) {
      console.error('Erro ao remover categoria:', error)
      alert('Erro ao remover categoria. Tente novamente.')
    }
  }

  const handleSave = async () => {
    try {
      const difficultyMap = { "Fácil": "facil", "Médio": "medio", "Difícil": "dificil" }
      
      // Encontrar o nome da categoria baseado no slug selecionado
      const selectedCategory = categories.find(cat => cat.slug === formData.category)
      const categoryName = selectedCategory ? selectedCategory.name : formData.category
      
      const updatedRecipe = {
        title: formData.title,
        description: formData.description,
        prepTime: formData.prepTime,
        cookTime: formData.cookTime,
        servings: formData.servings,
        difficulty: difficultyMap[formData.difficulty as keyof typeof difficultyMap] || formData.difficulty,
        category: categoryName,
        temperature: formData.temperature,
        ingredients: ingredients.filter(ing => ing.item.trim() && ing.quantity.trim()),
        instructions: instructions.filter(inst => inst.trim()),
        tags: tags,
        imageUrl: recipe?.imageUrl || null,
      }

      const response = await fetch(`/api/recipes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedRecipe),
      })

      if (response.ok) {
        alert("Receita atualizada com sucesso!")
        router.push(`/receita/${id}`)
      } else {
        throw new Error('Erro ao atualizar receita')
      }
    } catch (error) {
      console.error("Erro ao salvar receita:", error)
      alert("Erro ao salvar receita. Tente novamente.")
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert("Receita deletada com sucesso!")
        router.push("/")
      } else {
        throw new Error('Erro ao deletar receita')
      }
    } catch (error) {
      console.error("Erro ao deletar receita:", error)
      alert("Erro ao deletar receita. Tente novamente.")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader showActions={false}>
          <Link href={`/receita/${id}`}>
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Cancelar
            </Button>
          </Link>
        </PageHeader>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="animate-pulse">
            <div className="bg-muted rounded h-8 mb-4 w-1/2 mx-auto"></div>
            <div className="bg-muted rounded h-4 mb-8 w-1/3 mx-auto"></div>
            <div className="space-y-6">
              <div className="bg-muted rounded-lg h-64"></div>
              <div className="bg-muted rounded-lg h-48"></div>
              <div className="bg-muted rounded-lg h-32"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader showActions={false}>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </PageHeader>
        <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
          <ChefHat className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-serif font-bold mb-2">Receita não encontrada</h1>
          <p className="text-muted-foreground">A receita que você está tentando editar não existe.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader showActions={false}>
        <Link href={`/receita/${id}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Cancelar
          </Button>
        </Link>
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
      </PageHeader>

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
                  placeholder="Ex: Pasta com Ervas Frescas"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Descreva sua receita em poucas palavras..."
                />
              </div>

              <div className="space-y-2">
                <Label>Foto da Receita</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  {recipe.imageUrl ? (
                    <div className="space-y-4">
                      <div className="relative mx-auto max-w-md">
                        <img
                          src={recipe.imageUrl}
                          alt="Foto da receita"
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                      </div>
                      <div className="flex gap-2 justify-center">
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Alterar Imagem
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                          Remover Foto
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-2">Clique para alterar a imagem ou arraste uma nova</p>
                      <Button variant="outline" size="sm">
                        Escolher Nova Imagem
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prep-time" className="text-sm font-medium text-muted-foreground">Tempo de Preparo</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="prep-time"
                      value={formData.prepTime}
                      onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                      className="pl-10"
                      placeholder="15 min"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Em minutos</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cook-time" className="text-sm font-medium text-muted-foreground">Tempo de Cozimento</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="cook-time"
                      value={formData.cookTime}
                      onChange={(e) => setFormData({ ...formData, cookTime: e.target.value })}
                      className="pl-10"
                      placeholder="30 min"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Em minutos</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servings" className="text-sm font-medium text-muted-foreground">Porções</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="servings"
                      value={formData.servings}
                      onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                      className="pl-10"
                      placeholder="4"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Quantas pessoas</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty" className="text-sm font-medium text-muted-foreground">Dificuldade</Label>
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
                  <p className="text-xs text-muted-foreground mt-1">Nível de habilidade</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperature" className="text-sm font-medium text-muted-foreground">Temperatura</Label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <Input
                      id="temperature"
                      placeholder="180°C"
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                      className="pl-10"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Forno, fogão, etc.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <div className="space-y-3">
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    disabled={isLoadingCategories}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingCategories ? "Carregando..." : "Selecione uma categoria"} />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingCategories ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2">Carregando categorias...</span>
                        </div>
                      ) : (
                        categories.map((category) => (
                          <SelectItem key={category.slug} value={category.slug}>
                            <div className="flex items-center justify-between w-full">
                              <span className="capitalize">
                                {category.name}
                              </span>
                              {!category.is_default && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    removeCategory(category)
                                  }}
                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  
                  {showNewCategoryInput ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Digite o nome da nova categoria (ex: Bolo)"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addCategory()}
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        onClick={addCategory}
                        size="sm"
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Adicionar
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          setShowNewCategoryInput(false)
                          setNewCategory("")
                        }}
                        size="sm"
                      >
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNewCategoryInput(true)}
                      className="gap-2 w-full"
                    >
                      <Plus className="h-4 w-4" />
                      Criar Nova Categoria
                    </Button>
                  )}
                </div>
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
                        placeholder="Ex: Massa penne"
                      />
                    </div>
                    <div className="w-32 space-y-2">
                      <Label>Quantidade</Label>
                      <Input
                        value={ingredient.quantity}
                        onChange={(e) => updateIngredient(index, "quantity", e.target.value)}
                        placeholder="400g"
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
                        placeholder={`Descreva o passo ${index + 1}...`}
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



          {/* Tags */}
          <Card className="book-page">
            <CardHeader>
              <CardTitle className="font-serif text-xl">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Adicionar tag (ex: Italiano, Vegetariano)"
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
            <Link href={`/receita/${id}`}>
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
