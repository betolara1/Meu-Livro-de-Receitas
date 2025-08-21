import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

// GET - Buscar todas as receitas ou com filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const minRating = searchParams.get('minRating')
    const tags = searchParams.get('tags')

    const filters = {
      search: search || undefined,
      category: category || undefined,
      difficulty: difficulty || undefined,
      minRating: minRating ? parseFloat(minRating) : undefined,
      tags: tags ? tags.split(',') : undefined,
    }

    const recipes = await db.searchRecipes(filters)
    return NextResponse.json(recipes)
  } catch (error) {
    console.error('[API] Erro ao buscar receitas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar nova receita
export async function POST(request: NextRequest) {
  try {
    const recipeData = await request.json()
    const newRecipe = await db.createRecipe(recipeData)
    return NextResponse.json(newRecipe, { status: 201 })
  } catch (error) {
    console.error('[API] Erro ao criar receita:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
