import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 })
    }

    const categories = await db.getCategories(userId)
    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, name, slug } = await request.json()

    if (!userId || !name || !slug) {
      return NextResponse.json({ error: 'userId, name e slug são obrigatórios' }, { status: 400 })
    }

    const category = await db.createCategory(userId, name, slug)
    return NextResponse.json({ 
      message: 'Categoria criada com sucesso',
      category: { id: category._id, name, slug, isDefault: false }
    })
  } catch (error) {
    console.error('Erro ao criar categoria:', error)
    if (error instanceof Error && error.message === 'Categoria já existe') {
      return NextResponse.json({ error: 'Categoria já existe' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const slug = searchParams.get('slug')

    if (!userId || !slug) {
      return NextResponse.json({ error: 'userId e slug são obrigatórios' }, { status: 400 })
    }

    await db.deleteCategory(userId, slug)
    return NextResponse.json({ message: 'Categoria removida com sucesso' })
  } catch (error) {
    console.error('Erro ao remover categoria:', error)
    if (error instanceof Error) {
      if (error.message === 'Categoria não encontrada') {
        return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 })
      }
      if (error.message === 'Não é possível remover categorias padrão') {
        return NextResponse.json({ error: 'Não é possível remover categorias padrão' }, { status: 403 })
      }
    }
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
