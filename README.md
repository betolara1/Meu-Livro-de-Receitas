# 📖 Livro de Receitas

Uma aplicação web moderna para gerenciar, buscar e compartilhar receitas culinárias. Desenvolvida com Next.js 15, TypeScript, Tailwind CSS e MySQL.

![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.9-38B2AC?style=for-the-badge&logo=tailwind-css)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql)

---

> [!NOTE]
> **Status do Desenvolvimento**: Este sistema foi desenvolvimento e finalizado por mim, com o auxílio estratégico de Inteligência Artificial para refatoração, implementação de regras de negócio complexas e polimento de interface.

---

## ✨ Funcionalidades

### 🍳 Gestão de Receitas
- **Criar receitas** com ingredientes, instruções e tags
- **Editar receitas** existentes
- **Visualizar receitas** com layout responsivo
- **Excluir receitas** com confirmação

### 🔍 Busca e Filtros
- Busca por texto (título, descrição, ingredientes, tags)
- Filtro por categoria (Sobremesas, Pratos Principais, etc.)
- Filtro por dificuldade (Fácil, Médio, Difícil)
- Filtro por rating mínimo
- Filtro por tags específicas

### ❤️ Sistema de Favoritos
- Adicionar/remover receitas dos favoritos
- Listar receitas favoritas
- Contador de favoritos por receita

### 📱 Interface Moderna
- Design responsivo para desktop e mobile
- Tema claro/escuro
- Componentes UI modernos com shadcn/ui
- Animações suaves e transições

## 🚀 Tecnologias Utilizadas

### Frontend
- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Componentes UI modernos
- **Lucide React** - Ícones
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas

### Backend
- **Next.js API Routes** - API REST
- **MySQL** - Banco de dados relacional
- **mysql2** - Driver MySQL para Node.js

### Ferramentas
- **XAMPP** - Servidor local (Apache + MySQL)
- **pnpm** - Gerenciador de pacotes

## 📋 Pré-requisitos

- **Node.js** 18+ 
- **XAMPP** instalado e configurado
- **pnpm** (recomendado) ou npm

## 🛠️ Instalação

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd Livro-de-Receita
```

### 2. Instale as dependências
```bash
pnpm install
# ou
npm install
```

### 3. Configure o banco de dados

#### Inicie o XAMPP
- Abra o XAMPP Control Panel
- Inicie o **Apache** e **MySQL**
- Verifique se ambos estão rodando (luz verde)

#### Configure as variáveis de ambiente (opcional)
Crie um arquivo `.env.local` na raiz do projeto:

```env
# Configuração do Banco de Dados MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=livro_receitas
DB_PORT=3306

# Configuração da API Gemini (para futuras funcionalidades)
GEMINI_API_KEY=sua_chave_aqui
```

**Nota:** Se não criar o arquivo `.env.local`, a aplicação usará as configurações padrão do XAMPP.

### 4. Execute a aplicação
```bash
pnpm dev
# ou
npm run dev
```

A aplicação estará disponível em: http://localhost:3000

## 🗄️ Estrutura do Banco de Dados

O banco de dados será criado automaticamente com as seguintes tabelas:

### Tabelas Principais
- **`recipes`** - Receitas principais
- **`ingredients`** - Ingredientes das receitas
- **`instructions`** - Instruções/passos das receitas
- **`tags`** - Tags para categorização
- **`recipe_tags`** - Relacionamento entre receitas e tags
- **`favorites`** - Receitas favoritas dos usuários

### Campos Importantes
```sql
recipes: id, title, description, prep_time, cook_time, servings, 
         difficulty, category, image_url, rating, favorites_count, 
         created_at, updated_at

ingredients: id, recipe_id, item, quantity
instructions: id, recipe_id, step_number, instruction
tags: id, name
favorites: id, recipe_id, user_id, created_at
```

## 📁 Estrutura do Projeto

```
Livro-de-Receita/
├── app/                    # App Router (Next.js 15)
│   ├── api/               # API Routes
│   │   ├── favorites/     # Endpoints de favoritos
│   │   ├── init/         # Inicialização do banco
│   │   └── recipes/      # CRUD de receitas
│   ├── buscar/           # Página de busca
│   ├── editar-receita/   # Edição de receitas
│   ├── favoritos/        # Lista de favoritos
│   ├── nova-receita/     # Criação de receitas
│   └── receita/          # Visualização de receitas
├── components/           # Componentes React
│   ├── ui/              # Componentes shadcn/ui
│   └── *.tsx           # Componentes customizados
├── hooks/               # Custom hooks
├── lib/                 # Utilitários e configurações
│   ├── database.ts     # Configuração do banco
│   └── utils.ts        # Funções utilitárias
├── public/             # Arquivos estáticos
└── styles/             # Estilos globais
```

## 🔌 API Endpoints

### Receitas
- `GET /api/recipes` - Listar receitas com filtros
- `POST /api/recipes` - Criar nova receita
- `GET /api/recipes/[id]` - Buscar receita por ID
- `PUT /api/recipes/[id]` - Atualizar receita
- `DELETE /api/recipes/[id]` - Deletar receita

### Favoritos
- `GET /api/favorites` - Listar favoritos
- `POST /api/favorites` - Toggle favorito

### Sistema
- `POST /api/init` - Inicializar banco de dados

## 🎨 Componentes Principais

### UI Components (shadcn/ui)
- **Button** - Botões com variantes
- **Card** - Cards para receitas
- **Input** - Campos de entrada
- **Dialog** - Modais e popups
- **Badge** - Tags e badges
- **Select** - Dropdowns
- **Toast** - Notificações

### Componentes Customizados
- **RecipeCard** - Card de receita
- **MainNav** - Navegação principal
- **MobileNav** - Navegação mobile
- **SearchFilters** - Filtros de busca
- **LoadingSkeleton** - Skeleton loading

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev          # Inicia servidor de desenvolvimento

# Build e Produção
pnpm build        # Build para produção
pnpm start        # Inicia servidor de produção

# Qualidade de Código
pnpm lint         # Executa ESLint
```

## 🔧 Configurações

### Next.js
- **App Router** habilitado
- **TypeScript** configurado
- **Tailwind CSS** integrado
- **MySQL2** como dependência externa

### Tailwind CSS
- **CSS Variables** para temas
- **Animações** customizadas
- **Responsive design** nativo

## 🐛 Solução de Problemas

### Erro de Conexão com MySQL
1. Verifique se o XAMPP está rodando
2. Confirme se o MySQL está na porta 3306
3. Verifique as credenciais no arquivo de configuração

### Erro de Tabelas
1. Acesse a aplicação - as tabelas serão criadas automaticamente
2. Ou execute manualmente: `POST /api/init`

### Performance
- O banco usa pool de conexões para melhor performance
- Índices são criados automaticamente nas chaves primárias e estrangeiras

## 🚧 Próximas Funcionalidades

- [ ] **Autenticação de Usuários** - Sistema de login/registro
- [ ] **Upload de Imagens** - Salvar imagens no servidor
- [ ] **Comentários** - Sistema de avaliações e comentários
- [ ] **Compartilhamento** - Compartilhar receitas entre usuários
- [ ] **Backup** - Sistema de backup automático do banco
- [ ] **PWA** - Progressive Web App
- [ ] **API Externa** - Integração com APIs de receitas

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Se você encontrar algum problema ou tiver dúvidas, abra uma [issue](https://github.com/seu-usuario/Livro-de-Receita/issues) no repositório.

---

**Desenvolvido com ❤️ usando Next.js, TypeScript e MySQL**
