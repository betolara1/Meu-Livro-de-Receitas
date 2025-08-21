import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

// GET - Buscar receita por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recipe = await db.getRecipeById(params.id)
    if (!recipe) {
      return NextResponse.json(
        { error: 'Receita não encontrada' },
        { status: 404 }
      )
    }
    return NextResponse.json(recipe)
  } catch (error) {
    console.error('[API] Erro ao buscar receita:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar receita
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json()
    const updatedRecipe = await db.updateRecipe(params.id, updates)
    if (!updatedRecipe) {
      return NextResponse.json(
        { error: 'Receita não encontrada' },
        { status: 404 }
      )
    }
    return NextResponse.json(updatedRecipe)
  } catch (error) {
    console.error('[API] Erro ao atualizar receita:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar receita
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await db.deleteRecipe(params.id)
    if (!deleted) {
      return NextResponse.json(
        { error: 'Receita não encontrada' },
        { status: 404 }
      )
    }
    return NextResponse.json({ message: 'Receita deletada com sucesso' })
  } catch (error) {
    console.error('[API] Erro ao deletar receita:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
