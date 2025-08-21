

-- Tabela principal de receitas
CREATE TABLE recipes (
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
);

-- Tabela de ingredientes
CREATE TABLE ingredients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id VARCHAR(36),
    item VARCHAR(255) NOT NULL,
    quantity VARCHAR(100),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- Tabela de instruções
CREATE TABLE instructions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id VARCHAR(36),
    step_number INT,
    instruction TEXT NOT NULL,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- Tabela de tags
CREATE TABLE tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE
);

-- Tabela de relacionamento receitas-tags
CREATE TABLE recipe_tags (
    recipe_id VARCHAR(36),
    tag_id INT,
    PRIMARY KEY (recipe_id, tag_id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Tabela de favoritos (para futuras funcionalidades de usuários)
CREATE TABLE favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id VARCHAR(36),
    user_id VARCHAR(36), -- quando implementar autenticação
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);