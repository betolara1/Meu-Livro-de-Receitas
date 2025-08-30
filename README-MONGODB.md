# 📚 Livro de Receitas - Configuração MongoDB

Este projeto foi migrado do MySQL para MongoDB. Siga este guia para configurar o MongoDB e executar o projeto.

## 🎯 Opções de Configuração do MongoDB

### Opção 1: MongoDB Local (Recomendado para desenvolvimento)

#### 1. Instalação do MongoDB no Windows

1. **Baixar MongoDB Community Server:**
   - Acesse: https://www.mongodb.com/try/download/community
   - Escolha a versão Windows e baixe o MSI installer

2. **Instalar MongoDB:**
   - Execute o arquivo baixado
   - Escolha "Complete" installation
   - Deixe marcada a opção "Install MongoDB as a Service"
   - Deixe marcada a opção "Install MongoDB Compass" (interface gráfica)

3. **Verificar instalação:**
   ```powershell
   mongod --version
   ```

#### 2. Configuração do Projeto

1. **Instalar dependências do MongoDB:**
   ```bash
   npm install
   ```

2. **Criar arquivo .env na raiz do projeto:**
   ```bash
   # .env
   MONGODB_URI=mongodb://localhost:27017
   DB_NAME=livro_receitas
   ```

3. **Iniciar o MongoDB (se não estiver como serviço):**
   ```bash
   mongod
   ```

4. **Executar o projeto:**
   ```bash
   npm run dev
   ```

### Opção 2: MongoDB Atlas (Nuvem)

#### 1. Criar conta no MongoDB Atlas

1. Acesse: https://cloud.mongodb.com/
2. Crie uma conta gratuita
3. Crie um novo cluster (escolha a opção gratuita M0)

#### 2. Configurar acesso

1. **Criar usuário do banco:**
   - Vá em "Database Access"
   - Clique em "Add New Database User"
   - Escolha "Password" como método de autenticação
   - Defina um username e password
   - Dê permissões de "Read and write to any database"

2. **Configurar Network Access:**
   - Vá em "Network Access"
   - Clique em "Add IP Address"
   - Para desenvolvimento, pode escolher "Allow access from anywhere" (0.0.0.0/0)
   - Para produção, adicione apenas os IPs específicos

#### 3. Obter string de conexão

1. Vá em "Clusters" e clique em "Connect"
2. Escolha "Connect your application"
3. Copie a connection string
4. Substitua `<password>` pela senha do usuário criado

#### 4. Configurar no projeto

Crie o arquivo `.env`:
```bash
# .env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
DB_NAME=livro_receitas
```

## 🚀 Executando o Projeto

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Executar em modo desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Acessar o projeto:**
   - Abra o navegador em: http://localhost:3000

## 🎲 Inicialização dos Dados

O banco será inicializado automaticamente na primeira execução com:
- Categorias padrão
- Índices para melhor performance
- Receitas de exemplo (se o banco estiver vazio)

Para forçar a inicialização, acesse:
- POST http://localhost:3000/api/init

## 📊 Estrutura dos Dados no MongoDB

### Collections (equivalente às tabelas do MySQL):

1. **recipes** - Receitas principais
2. **favorites** - Receitas favoritas dos usuários
3. **user_categories** - Categorias personalizadas

### Schemas dos documentos:

#### Recipe
```javascript
{
  _id: ObjectId,
  id: String,
  title: String,
  description: String,
  prepTime: String,
  cookTime: String,
  servings: String,
  difficulty: String,
  category: String,
  temperature: String,
  ingredients: [{ item: String, quantity: String }],
  instructions: [String],
  tags: [String],
  imageUrl: String,
  rating: Number,
  favorites: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### Favorite
```javascript
{
  _id: ObjectId,
  recipeId: String,
  userId: String,
  createdAt: Date
}
```

#### User Category
```javascript
{
  _id: ObjectId,
  userId: String,
  name: String,
  slug: String,
  isDefault: Boolean,
  createdAt: Date
}
```

## 🛠️ Ferramentas Úteis

### MongoDB Compass (Interface Gráfica)
- Já instalado com o MongoDB Community Server
- Conecte usando: `mongodb://localhost:27017`
- Permite visualizar e editar dados facilmente

### Comandos Úteis do MongoDB

```bash
# Conectar ao MongoDB via linha de comando
mongo

# Ver bancos disponíveis
show dbs

# Usar o banco do projeto
use livro_receitas

# Ver coleções
show collections

# Ver documentos de uma coleção
db.recipes.find()

# Contar documentos
db.recipes.countDocuments()

# Limpar uma coleção (cuidado!)
db.recipes.deleteMany({})
```

## 🔧 Troubleshooting

### Erro: "MongoServerError: bad auth"
- Verifique username e password no MONGODB_URI
- Certifique-se que o usuário foi criado corretamente no Atlas

### Erro: "MongoNetworkError"
- Verifique se o MongoDB está rodando localmente
- Para Atlas, verifique a configuração de Network Access

### Erro: "Connection refused"
- Para MongoDB local: certifique-se que o serviço está rodando
- Verifique se a porta 27017 está disponível

### Banco não inicializa
- Verifique as variáveis de ambiente no arquivo .env
- Tente acessar manualmente: POST http://localhost:3000/api/init

## 🔄 Migração Completa

### O que foi alterado:

1. ✅ **Dependências:** mysql2 → mongodb
2. ✅ **Configuração:** lib/database-config.ts (MySQL → MongoDB)
3. ✅ **Database:** lib/database.ts (SQL queries → MongoDB operations)
4. ✅ **APIs:** Todas as rotas atualizadas para MongoDB
5. ✅ **Schema:** Estrutura relacional → Documentos MongoDB
6. ✅ **Config:** next.config.mjs atualizado

### Funcionalidades mantidas:

- ✅ CRUD completo de receitas
- ✅ Sistema de favoritos
- ✅ Categorias personalizadas
- ✅ Busca e filtros
- ✅ Tags
- ✅ Estatísticas
- ✅ Inicialização automática

## 📝 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# MongoDB Local
MONGODB_URI=mongodb://localhost:27017
DB_NAME=livro_receitas

# MongoDB Atlas (substitua pelos seus dados)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
# DB_NAME=livro_receitas
```

---

💡 **Dica:** O MongoDB é mais flexível que o MySQL para este tipo de aplicação, pois permite armazenar arrays de ingredientes, instruções e tags diretamente no documento da receita, simplificando as consultas e melhorando a performance!
