# Configuração do MySQL para Livro de Receitas

## Pré-requisitos

1. **XAMPP** instalado e configurado
2. **MySQL** rodando na porta 3306
3. **Node.js** e **npm** instalados

## Configuração do Banco de Dados

### 1. Iniciar o XAMPP
- Abra o XAMPP Control Panel
- Inicie o **Apache** e **MySQL**
- Verifique se ambos estão rodando (luz verde)

### 2. Configurar o MySQL
- Acesse o **phpMyAdmin** em: http://localhost/phpmyadmin
- O banco de dados será criado automaticamente quando você acessar a aplicação

### 3. Configuração da Aplicação

#### Variáveis de Ambiente (opcional)
Crie um arquivo `.env.local` na raiz do projeto:

```env
# Configuração do Banco de Dados MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=livro_receitas
DB_PORT=3306

# Configuração da API Gemini
GEMINI_API_KEY=AIzaSyA0mqYWuVSye6qfOmfe0lsT8SwVe0swXuM
```

**Nota:** Se não criar o arquivo `.env.local`, a aplicação usará as configurações padrão do XAMPP.

### 4. Instalar Dependências
```bash
npm install
```

### 5. Executar a Aplicação
```bash
npm run dev
```

## Estrutura do Banco de Dados

O banco de dados será criado automaticamente com as seguintes tabelas:

### Tabelas Principais:
- **recipes**: Receitas principais
- **ingredients**: Ingredientes das receitas
- **instructions**: Instruções/passos das receitas
- **tags**: Tags para categorização
- **recipe_tags**: Relacionamento entre receitas e tags
- **favorites**: Receitas favoritas dos usuários

### Campos Importantes:
- **recipes**: id, title, description, prep_time, cook_time, servings, difficulty, category, image_url, rating, favorites_count, created_at, updated_at
- **ingredients**: id, recipe_id, item, quantity
- **instructions**: id, recipe_id, step_number, instruction
- **tags**: id, name
- **favorites**: id, recipe_id, user_id, created_at

## Funcionalidades Implementadas

### ✅ Operações CRUD Completas:
- **Criar** receitas com ingredientes, instruções e tags
- **Ler** receitas individuais e listagem com filtros
- **Atualizar** receitas existentes
- **Deletar** receitas

### ✅ Busca e Filtros:
- Busca por texto (título, descrição, ingredientes, tags)
- Filtro por categoria
- Filtro por dificuldade
- Filtro por rating mínimo
- Filtro por tags

### ✅ Sistema de Favoritos:
- Adicionar/remover receitas dos favoritos
- Listar receitas favoritas
- Contador de favoritos

### ✅ API Routes:
- `GET /api/recipes` - Listar receitas com filtros
- `POST /api/recipes` - Criar nova receita
- `GET /api/recipes/[id]` - Buscar receita por ID
- `PUT /api/recipes/[id]` - Atualizar receita
- `DELETE /api/recipes/[id]` - Deletar receita
- `GET /api/favorites` - Listar favoritos
- `POST /api/favorites` - Toggle favorito
- `POST /api/init` - Inicializar banco de dados

## Migração do localStorage

A aplicação foi migrada do localStorage para MySQL mantendo a mesma interface. As principais mudanças:

1. **Banco de dados**: localStorage → MySQL
2. **Operações**: Síncronas → Assíncronas via API
3. **Persistência**: Local → Servidor
4. **Escalabilidade**: Limitada → Ilimitada

## Solução de Problemas

### Erro de Conexão com MySQL:
1. Verifique se o XAMPP está rodando
2. Confirme se o MySQL está na porta 3306
3. Verifique as credenciais no arquivo de configuração

### Erro de Tabelas:
1. Acesse a aplicação - as tabelas serão criadas automaticamente
2. Ou execute manualmente: `POST /api/init`

### Performance:
- O banco usa pool de conexões para melhor performance
- Índices são criados automaticamente nas chaves primárias e estrangeiras

## Próximos Passos

1. **Autenticação de Usuários**: Implementar sistema de login
2. **Upload de Imagens**: Salvar imagens no servidor
3. **Comentários**: Sistema de avaliações e comentários
4. **Compartilhamento**: Compartilhar receitas entre usuários
5. **Backup**: Sistema de backup automático do banco
