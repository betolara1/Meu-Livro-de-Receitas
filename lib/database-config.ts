import { MongoClient, Db, Collection } from 'mongodb'

// Configuração do banco de dados MongoDB
export const dbConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  database: process.env.DB_NAME || 'livro_receitas',
}

// Cliente MongoDB
let client: MongoClient | null = null
let db: Db | null = null

// Função para conectar ao MongoDB
export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db
  }

  try {
    client = new MongoClient(dbConfig.uri)
    await client.connect()
    db = client.db(dbConfig.database)
    
    console.log('[MongoDB] Conectado com sucesso ao banco:', dbConfig.database)
    return db
  } catch (error) {
    console.error('[MongoDB] Erro ao conectar:', error)
    throw error
  }
}

// Função para obter uma coleção
export async function getCollection(collectionName: string): Promise<Collection> {
  const database = await connectToDatabase()
  return database.collection(collectionName)
}

// Função para desconectar (útil para testes)
export async function disconnect(): Promise<void> {
  if (client) {
    await client.close()
    client = null
    db = null
    console.log('[MongoDB] Desconectado do banco')
  }
}

// Função para inicializar o banco de dados (criar índices se necessário)
export async function initializeDatabase(): Promise<void> {
  try {
    const database = await connectToDatabase()
    
    // Criar índices para melhor performance
    const recipesCollection = database.collection('recipes')
    await recipesCollection.createIndex({ title: 'text', description: 'text' })
    await recipesCollection.createIndex({ category: 1 })
    await recipesCollection.createIndex({ difficulty: 1 })
    await recipesCollection.createIndex({ rating: -1 })
    await recipesCollection.createIndex({ createdAt: -1 })
    await recipesCollection.createIndex({ 'tags': 1 })

    const favoritesCollection = database.collection('favorites')
    await favoritesCollection.createIndex({ recipeId: 1, userId: 1 }, { unique: true })

    const categoriesCollection = database.collection('user_categories')
    await categoriesCollection.createIndex({ userId: 1, slug: 1 }, { unique: true })

    console.log('[MongoDB] Banco de dados inicializado com sucesso!')
  } catch (error) {
    console.error('[MongoDB] Erro ao inicializar banco de dados:', error)
    throw error
  }
}

// Categorias padrão do sistema
export const defaultCategories = [
  { userId: 'system', name: 'Pratos Principais', slug: 'pratos-principais', isDefault: true },
  { userId: 'system', name: 'Sobremesas', slug: 'sobremesas', isDefault: true },
  { userId: 'system', name: 'Entradas', slug: 'entradas', isDefault: true },
  { userId: 'system', name: 'Bebidas', slug: 'bebidas', isDefault: true },
  { userId: 'system', name: 'Vegetariano', slug: 'vegetariano', isDefault: true },
  { userId: 'system', name: 'Doces', slug: 'doces', isDefault: true },
]