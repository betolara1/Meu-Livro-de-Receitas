"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, X, Upload, Clock, Users, ChefHat, Camera, FileImage, Loader2, Wand2 } from "lucide-react"
import Link from "next/link"

export default function NewRecipePage() {
  const [ingredients, setIngredients] = useState([{ item: "", quantity: "" }])
  const [instructions, setInstructions] = useState([""])
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [ocrImage, setOcrImage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    prepTime: "",
    cookTime: "",
    servings: "",
    difficulty: "",
    category: "",
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

  const fillFormWithGeminiData = (recipeData: any) => {
    // Preencher informações básicas
    setFormData((prev) => ({
      ...prev,
      title: recipeData.title || prev.title,
      description: recipeData.description || prev.description,
      prepTime: recipeData.prepTime || prev.prepTime,
      cookTime: recipeData.cookTime || prev.cookTime,
      servings: recipeData.servings?.toString() || prev.servings,
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
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      processImageWithGemini(file)
    }
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
      // Validação básica
      if (!formData.title.trim()) {
        alert("Por favor, adicione um título para a receita")
        return
      }

      if (ingredients.some((ing) => !ing.item.trim())) {
        alert("Por favor, preencha todos os ingredientes")
        return
      }

      if (instructions.some((inst) => !inst.trim())) {
        alert("Por favor, preencha todas as instruções")
        return
      }

      console.log("[API] Salvando receita...")

      const recipeData = {
        title: formData.title,
        description: formData.description,
        prepTime: formData.prepTime,
        cookTime: formData.cookTime,
        servings: formData.servings,
        difficulty: formData.difficulty,
        category: formData.category,
        ingredients: ingredients.filter((ing) => ing.item.trim()),
        instructions: instructions.filter((inst) => inst.trim()),
        tags,
        imageUrl: ocrImage || undefined,
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
        router.push(`/receita/${savedRecipe.id}`)
      }
    } catch (error) {
      console.error("[v0] Erro ao salvar receita:", error)
      alert("Erro ao salvar receita. Tente novamente.")
    } finally {
      setIsSaving(false)
    }
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
              <Button variant="outline" onClick={() => handleSaveRecipe(true)} disabled={isSaving}>
                {isSaving ? "Salvando..." : "Salvar Rascunho"}
              </Button>
              <Button onClick={() => handleSaveRecipe(false)} disabled={isSaving}>
                {isSaving ? "Publicando..." : "Publicar Receita"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-3">Nova Receita</h1>
          <p className="text-lg text-muted-foreground">Compartilhe sua receita especial com o mundo</p>
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
                <div className="space-y-4">
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

                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isProcessing}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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
                          src={ocrImage || "/placeholder.svg"}
                          alt="Receita capturada"
                          className="w-full h-32 object-cover rounded-lg border"
                        />
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
                <Label htmlFor="title">Título da Receita</Label>
                <Input
                  id="title"
                  placeholder="Ex: Pasta com Ervas Frescas"
                  className="text-lg"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
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
                <Label>Foto da Receita</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">Clique para fazer upload ou arraste uma imagem</p>
                  <Button variant="outline" size="sm">
                    Escolher Arquivo
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prep-time">Tempo de Preparo</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="prep-time"
                      placeholder="15 min"
                      className="pl-10"
                      value={formData.prepTime}
                      onChange={(e) => setFormData((prev) => ({ ...prev, prepTime: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cook-time">Tempo de Cozimento</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="cook-time"
                      placeholder="30 min"
                      className="pl-10"
                      value={formData.cookTime}
                      onChange={(e) => setFormData((prev) => ({ ...prev, cookTime: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servings">Porções</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="servings"
                      placeholder="4"
                      className="pl-10"
                      value={formData.servings}
                      onChange={(e) => setFormData((prev) => ({ ...prev, servings: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Dificuldade</Label>
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
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pratos-principais">Pratos Principais</SelectItem>
                    <SelectItem value="sobremesas">Sobremesas</SelectItem>
                    <SelectItem value="entradas">Entradas</SelectItem>
                    <SelectItem value="bebidas">Bebidas</SelectItem>
                    <SelectItem value="vegetariano">Vegetariano</SelectItem>
                    <SelectItem value="doces">Doces</SelectItem>
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
