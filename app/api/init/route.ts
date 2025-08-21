import { NextResponse } from 'next/server'
import { seedDatabase } from '@/lib/database'

export async function POST() {
  try {
    await seedDatabase()
    return NextResponse.json({ message: 'Banco de dados inicializado com sucesso' })
  } catch (error) {
    console.error('[API] Erro ao inicializar banco:', error)
    return NextResponse.json(
      { error: 'Erro ao inicializar banco de dados' },
      { status: 500 }
    )
  }
}
