import mysql from 'mysql2/promise'

// Configuração do banco de dados MySQL
export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', // Senha padrão do XAMPP é vazia
  database: process.env.DB_NAME || 'livro_receitas',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Pool de conexões
export const pool = mysql.createPool(dbConfig)

// Função para inicializar o banco de dados
export async function initializeDatabase() {
  try {
    const connection = await pool.getConnection()
    
    // Criar banco de dados se não existir
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`)
    await connection.execute(`USE ${dbConfig.database}`)
    
    // Criar tabelas
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS recipes (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        prep_time VARCHAR(50),
        cook_time VARCHAR(50),
        servings VARCHAR(10),
        difficulty ENUM('facil', 'medio', 'dificil'),
        category VARCHAR(100),
        image_url TEXT,
        rating DECIMAL(3,2) DEFAULT 0,
        favorites_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS ingredients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipe_id VARCHAR(36),
        item VARCHAR(255) NOT NULL,
        quantity VARCHAR(100),
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
      )
    `)
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS instructions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipe_id VARCHAR(36),
        step_number INT,
        instruction TEXT NOT NULL,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
      )
    `)
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tags (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE
      )
    `)
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS recipe_tags (
        recipe_id VARCHAR(36),
        tag_id INT,
        PRIMARY KEY (recipe_id, tag_id),
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      )
    `)
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipe_id VARCHAR(36),
        user_id VARCHAR(36) DEFAULT 'default_user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
      )
    `)
    
    connection.release()
    console.log('[MySQL] Banco de dados inicializado com sucesso!')
  } catch (error) {
    console.error('[MySQL] Erro ao inicializar banco de dados:', error)
    throw error
  }
}
