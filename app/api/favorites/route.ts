import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

// GET - Buscar receitas favoritas
export async function GET() {
  try {
    const favorites = await db.getFavoriteRecipes()
    return NextResponse.json(favorites)
  } catch (error) {
    console.error('[API] Erro ao buscar favoritos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Toggle favorito
export async function POST(request: NextRequest) {
  try {
    const { recipeId } = await request.json()
    const isFavorite = await db.toggleFavorite(recipeId)
    return NextResponse.json({ isFavorite })
  } catch (error) {
    console.error('[API] Erro ao toggle favorito:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
