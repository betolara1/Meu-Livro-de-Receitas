"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, X, Upload, Clock, Users, ChefHat, Camera, FileImage, Loader2, Wand2 } from "lucide-react"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"

export default function NewRecipePage() {
  const [ingredients, setIngredients] = useState([{ item: "", quantity: "" }])
  const [instructions, setInstructions] = useState([""])
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [categories, setCategories] = useState<Array<{name: string, slug: string, is_default: boolean}>>([])
  const [newCategory, setNewCategory] = useState("")
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [ocrImage, setOcrImage] = useState<string | null>(null)
  const [recipeImages, setRecipeImages] = useState<string[]>([])
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
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

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

  // Carregar categorias na inicialização
  useEffect(() => {
    loadCategories()
  }, [])

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        // Remove o prefixo data:image/...;base64,
        const base64Data = base64.split(",")[1]
        resolve(base64Data)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      
      img.onload = () => {
        // Calcular novas dimensões mantendo proporção
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        canvas.width = width
        canvas.height = height
        
        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height)
        
        // Converter para blob com qualidade reduzida
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              resolve(file) // Fallback para arquivo original
            }
          },
          file.type,
          quality
        )
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  const processImageWithGemini = async (file: File) => {
    setIsProcessing(true)
    try {
      const imageUrl = URL.createObjectURL(file)
      setOcrImage(imageUrl)

      console.log("[v0] Convertendo imagem para base64...")
      const base64Image = await convertImageToBase64(file)

      console.log("[v0] Enviando para API Gemini...")
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyA0mqYWuVSye6qfOmfe0lsT8SwVe0swXuM",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Analise esta imagem de uma receita manuscrita e extraia as seguintes informações em formato JSON:

{
  "title": "nome da receita",
  "ingredients": [
    {"item": "nome do ingrediente", "quantity": "quantidade com unidade"}
  ],
  "instructions": ["passo 1", "passo 2", "..."],
  "prepTime": "tempo de preparo (ex: 15 min)",
  "cookTime": "tempo de cozimento (ex: 30 min)", 
  "servings": "número de porções",
  "temperature": "temperatura se mencionada (ex: 180°C)",
  "description": "breve descrição da receita"
}

Instruções importantes:
- Reconheça abreviações culinárias: cs = colher de sopa, xic = xícara, pit = pitada
- Se não conseguir ler algo claramente, deixe em branco
- Mantenha as quantidades exatas como escritas
- Identifique todos os passos numerados
- Retorne APENAS o JSON, sem texto adicional`,
                  },
                  {
                    inline_data: {
                      mime_type: file.type,
                      data: base64Image,
                    },
                  },
                ],
              },
            ],
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Resposta da API Gemini:", data)

      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const text = data.candidates[0].content.parts[0].text
        console.log("[v0] Texto extraído:", text)

        try {
          // Extrair JSON da resposta
          const jsonMatch = text.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const recipeData = JSON.parse(jsonMatch[0])
            console.log("[v0] Dados da receita parseados:", recipeData)
            fillFormWithGeminiData(recipeData)
          } else {
            throw new Error("Não foi possível extrair JSON da resposta")
          }
        } catch (parseError) {
          console.error("[v0] Erro ao parsear JSON:", parseError)
          alert("Erro ao processar os dados da receita. Tente novamente.")
        }
      } else {
        throw new Error("Resposta inválida da API")
      }
    } catch (error) {
      console.error("[v0] Erro na API Gemini:", error)
      alert("Erro ao processar a imagem. Verifique sua conexão e tente novamente.")
    } finally {
      setIsProcessing(false)
    }
  }

  const fillFormWithGeminiData = async (recipeData: any) => {
    // Preencher informações básicas
    setFormData((prev) => ({
      ...prev,
      title: recipeData.title || prev.title,
      description: recipeData.description || prev.description,
      prepTime: recipeData.prepTime || prev.prepTime,
      cookTime: recipeData.cookTime || prev.cookTime,
      servings: recipeData.servings?.toString() || prev.servings,
      temperature: recipeData.temperature || prev.temperature,
    }))

    // Preencher ingredientes
    if (recipeData.ingredients && recipeData.ingredients.length > 0) {
      const formattedIngredients = recipeData.ingredients.map((ing: any) => ({
        item: ing.item || "",
        quantity: ing.quantity || "",
      }))
      setIngredients(formattedIngredients)
    }

    // Preencher instruções
    if (recipeData.instructions && recipeData.instructions.length > 0) {
      setInstructions(recipeData.instructions.filter((inst: string) => inst.trim().length > 0))
    }

    // Adicionar temperatura como tag se disponível
    if (recipeData.temperature) {
      setTags((prev) => [...prev, recipeData.temperature])
    }

    // Adicionar categoria se disponível e não existir
    if (recipeData.category && !categories.some(cat => cat.slug === recipeData.category.toLowerCase().replace(/\s+/g, '-'))) {
      const categoryName = recipeData.category
      const categorySlug = recipeData.category.toLowerCase().replace(/\s+/g, '-')
      
      // Criar categoria automaticamente no banco
      try {
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
        }
      } catch (error) {
        console.error('Erro ao criar categoria automaticamente:', error)
      }
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file && file.type.startsWith("image/")) {
        if (event.target.id === 'recipe-image-upload') {
                      try {
              // Comprimir imagem antes de armazenar
              const compressedFile = await compressImage(file, 800, 0.8)
              
              // Converter para Data URL para persistência no banco
              const reader = new FileReader()
              reader.onload = () => {
                const dataUrl = reader.result as string
                setRecipeImages(prev => [...prev, dataUrl])
              }
              reader.readAsDataURL(compressedFile)
            } catch (error) {
              console.error('Erro ao comprimir imagem:', error)
              
              // Fallback para arquivo original como Data URL
              const reader = new FileReader()
              reader.onload = () => {
                const dataUrl = reader.result as string
                setRecipeImages(prev => [...prev, dataUrl])
              }
              reader.readAsDataURL(file)
            }
        } else if (event.target.id === 'ocr-image-upload') {
          // Se for do OCR, processa com Gemini
          processImageWithGemini(file)
        }
      }
    }
    
    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    event.target.value = ''
  }

  const handleCameraCapture = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported")
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      const video = document.createElement("video")
      video.srcObject = stream
      video.play()

      video.onloadedmetadata = () => {
        const canvas = document.createElement("canvas")
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext("2d")

        setTimeout(() => {
          ctx?.drawImage(video, 0, 0)
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" })
                processImageWithGemini(file)
              }
            },
            "image/jpeg",
            0.8,
          )

          stream.getTracks().forEach((track) => track.stop())
        }, 2000)
      }
    } catch (error) {
      console.error("[v0] Camera error:", error)
      alert("Não foi possível acessar a câmera. Verifique se está usando HTTPS ou use o upload de arquivo.")
    }
  }

  const handleSaveRecipe = async (isDraft = false) => {
    setIsSaving(true)
    try {
      // Validação básica - apenas título é obrigatório
      if (!formData.title.trim()) {
        alert("Por favor, adicione um título para a receita")
        return
      }

      // Filtra ingredientes e instruções vazios
      const validIngredients = ingredients.filter((ing) => ing.item.trim())
      const validInstructions = instructions.filter((inst) => inst.trim())

      console.log("[API] Salvando receita...")

      const recipeData = {
        title: formData.title,
        description: formData.description,
        prepTime: formData.prepTime,
        cookTime: formData.cookTime,
        servings: formData.servings,
        difficulty: formData.difficulty,
        category: formData.category,
        temperature: formData.temperature,
        ingredients: validIngredients,
        instructions: validInstructions,
        tags,
        imageUrl: recipeImages[0] || null,
      }

      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipeData),
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar receita')
      }

      const savedRecipe = await response.json()
      console.log("[API] Receita salva com sucesso:", savedRecipe.id)

      if (isDraft) {
        alert("Receita salva como rascunho!")
      } else {
        alert("Receita publicada com sucesso!")
      }
      router.push("/")
    } catch (error) {
      console.error("[v0] Erro ao salvar receita:", error)
      alert("Erro ao salvar receita. Tente novamente.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader showActions={false}>
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <Button variant="outline" onClick={() => handleSaveRecipe(true)} disabled={isSaving}>
          {isSaving ? "Salvando..." : "Salvar Rascunho"}
        </Button>
        <Button onClick={() => handleSaveRecipe(false)} disabled={isSaving}>
          {isSaving ? "Publicando..." : "Publicar Receita"}
        </Button>
      </PageHeader>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-3">Nova Receita</h1>
          <p className="text-lg text-muted-foreground">Compartilhe sua receita especial com o mundo</p>
          <p className="text-sm text-muted-foreground mt-2">* Apenas o título é obrigatório. Você pode preencher os outros campos depois!</p>
        </div>

        <form
          className="space-y-8"
          onSubmit={(e) => {
            e.preventDefault()
            handleSaveRecipe(false)
          }}
        >
          {/* OCR Section */}
          <Card className="book-page border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="font-serif text-xl flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                Extrair Receita de Foto
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Tire uma foto ou faça upload de uma imagem da sua receita para preenchimento automático
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4 flex flex-col items-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCameraCapture}
                    disabled={isProcessing}
                    className="w-full gap-2 h-12 bg-transparent"
                  >
                    <Camera className="h-5 w-5" />
                    Tirar Foto
                  </Button>

                  <div className="relative w-full max-w-sm">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isProcessing}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="ocr-image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isProcessing}
                      className="w-full gap-2 h-12 bg-transparent"
                    >
                      <FileImage className="h-5 w-5" />
                      Upload de Imagem
                    </Button>
                  </div>
                </div>

                {(isProcessing || ocrImage) && (
                  <div className="space-y-4">
                    {ocrImage && (
                      <div className="relative">
                        <img
                          src={ocrImage}
                          alt="Receita capturada para OCR"
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setOcrImage(null)}
                          className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {isProcessing && (
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processando imagem...
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className="book-page">
            <CardHeader>
              <CardTitle className="font-serif text-xl">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título da Receita *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Pasta com Ervas Frescas"
                  className="text-lg"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva sua receita em poucas palavras..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Fotos da Receita</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  {/* Input de arquivo sempre disponível (escondido) */}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="recipe-image-upload"
                  />
                  
                  {recipeImages.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {recipeImages.map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={imageUrl}
                              alt={`Foto ${index + 1} da receita`}
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setRecipeImages(prev => prev.filter((_, i) => i !== index))}
                              className="absolute top-1 right-1 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 justify-center">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const fileInput = document.getElementById('recipe-image-upload') as HTMLInputElement
                            fileInput?.click()
                          }}
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Adicionar Mais Fotos
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => setRecipeImages([])}
                          className="gap-2"
                        >
                          <X className="h-4 w-4" />
                          Limpar Todas
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-2">Clique para fazer upload ou arraste imagens</p>
                      <p className="text-xs text-muted-foreground mb-4">Você pode selecionar múltiplas imagens</p>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const fileInput = document.getElementById('recipe-image-upload') as HTMLInputElement
                          fileInput?.click()
                        }}
                      >
                        Escolher Arquivos
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
                      placeholder="15 min"
                      className="pl-10"
                      value={formData.prepTime}
                      onChange={(e) => setFormData((prev) => ({ ...prev, prepTime: e.target.value }))}
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
                      placeholder="30 min"
                      className="pl-10"
                      value={formData.cookTime}
                      onChange={(e) => setFormData((prev) => ({ ...prev, cookTime: e.target.value }))}
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
                      placeholder="4"
                      className="pl-10"
                      value={formData.servings}
                      onChange={(e) => setFormData((prev) => ({ ...prev, servings: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Quantas pessoas</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty" className="text-sm font-medium text-muted-foreground">Dificuldade</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, difficulty: value }))}
                  >
                    <SelectTrigger>
                      <ChefHat className="h-4 w-4 text-muted-foreground mr-2" />
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facil">Fácil</SelectItem>
                      <SelectItem value="medio">Médio</SelectItem>
                      <SelectItem value="dificil">Difícil</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">Nível de habilidade</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperature" className="text-sm font-medium text-muted-foreground">Temperatura</Label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <Input
                      id="temperature"
                      placeholder="180°C"
                      className="pl-10"
                      value={formData.temperature}
                      onChange={(e) => setFormData((prev) => ({ ...prev, temperature: e.target.value }))}
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
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
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
                        placeholder="Ex: Massa penne"
                        value={ingredient.item}
                        onChange={(e) => updateIngredient(index, "item", e.target.value)}
                      />
                    </div>
                    <div className="w-32 space-y-2">
                      <Label>Quantidade</Label>
                      <Input
                        placeholder="400g"
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
                        placeholder={`Descreva o passo ${index + 1}...`}
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
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => handleSaveRecipe(true)}
              disabled={isSaving}
            >
              {isSaving ? "Salvando..." : "Salvar Rascunho"}
            </Button>
            <Button type="submit" size="lg" className="gap-2" disabled={isSaving}>
              <ChefHat className="h-4 w-4" />
              {isSaving ? "Publicando..." : "Publicar Receita"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
