# Teste da Integração Firebase

## Como Testar

### 1. Configurar Firebase
1. Siga as instruções em `FIREBASE_SETUP.md`
2. Configure as credenciais no arquivo `src/config/firebase.ts`

### 2. Testar Autenticação

#### Login com Email/Senha
```typescript
// No console do app ou em um componente de teste
import { authService } from './src/services/authService';

// Testar registro
try {
  const user = await authService.signUpWithEmail('teste@exemplo.com', '123456', 'Usuário Teste');
  console.log('Usuário registrado:', user);
} catch (error) {
  console.error('Erro no registro:', error);
}

// Testar login
try {
  const user = await authService.signInWithEmail('teste@exemplo.com', '123456');
  console.log('Usuário logado:', user);
} catch (error) {
  console.error('Erro no login:', error);
}
```

#### Login com Google
```typescript
try {
  const user = await authService.signInWithGoogle();
  console.log('Login Google:', user);
} catch (error) {
  console.error('Erro Google:', error);
}
```

### 3. Testar Operações de Receitas

```typescript
import { db } from './src/services/database';

// Criar receita
const novaReceita = await db.createRecipe({
  title: 'Pasta Carbonara',
  description: 'Deliciosa pasta italiana',
  prepTime: '15',
  cookTime: '20',
  servings: '4',
  difficulty: 'medio',
  category: 'pratos-principais',
  temperature: '',
  ingredients: [
    { item: 'Massa', quantity: '400g' },
    { item: 'Bacon', quantity: '200g' }
  ],
  instructions: [
    'Cozinhe a massa',
    'Frite o bacon',
    'Misture tudo'
  ],
  tags: ['Italiano', 'Rápido']
});

console.log('Receita criada:', novaReceita);

// Buscar receitas
const receitas = await db.getAllRecipes();
console.log('Receitas:', receitas);

// Buscar com filtros
const receitasFiltradas = await db.searchRecipes({
  search: 'pasta',
  category: 'pratos-principais'
});
console.log('Receitas filtradas:', receitasFiltradas);
```

### 4. Testar Favoritos

```typescript
// Adicionar/remover favorito
const isFavorito = await db.toggleFavorite('recipe_id', 'user_id');
console.log('É favorito:', isFavorito);

// Buscar receitas favoritas
const favoritas = await db.getFavoriteRecipes('user_id');
console.log('Receitas favoritas:', favoritas);
```

### 5. Testar Categorias

```typescript
// Buscar categorias
const categorias = await db.getCategories('user_id');
console.log('Categorias:', categorias);

// Criar categoria
const novaCategoria = await db.createCategory('user_id', 'Sopas', 'sopas');
console.log('Categoria criada:', novaCategoria);
```

### 6. Verificar no Firebase Console

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Vá para "Firestore Database"
3. Verifique se as coleções foram criadas:
   - `users` - dados dos usuários
   - `recipes` - receitas
   - `categories` - categorias
   - `favorites` - favoritos

### 7. Testar Offline

O Firebase tem suporte offline nativo. Teste:
1. Desconecte a internet
2. Tente criar uma receita
3. Reconecte a internet
4. Verifique se a receita foi sincronizada

### 8. Testar Regras de Segurança

1. No Firebase Console, vá para "Firestore Database" > "Regras"
2. Teste se um usuário só consegue acessar seus próprios dados
3. Verifique se usuários não autenticados não conseguem acessar dados

## Estrutura de Dados Esperada

### Coleção: users
```json
{
  "id": "firebase_user_id",
  "email": "usuario@exemplo.com",
  "name": "Nome do Usuário",
  "photo": "url_da_foto_ou_null",
  "provider": "email|google|apple",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Coleção: recipes
```json
{
  "id": "recipe_id",
  "userId": "firebase_user_id",
  "title": "Nome da Receita",
  "description": "Descrição da receita",
  "prepTime": "15",
  "cookTime": "30",
  "servings": "4",
  "difficulty": "facil|medio|dificil",
  "category": "categoria_slug",
  "temperature": "180°C",
  "ingredients": [
    {"item": "ingrediente", "quantity": "quantidade"}
  ],
  "instructions": ["passo 1", "passo 2"],
  "tags": ["tag1", "tag2"],
  "rating": 0,
  "favorites": 0,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Coleção: categories
```json
{
  "id": "category_id",
  "userId": "firebase_user_id",
  "name": "Nome da Categoria",
  "slug": "categoria-slug",
  "isDefault": false,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Coleção: favorites
```json
{
  "id": "favorite_id",
  "userId": "firebase_user_id",
  "recipeId": "recipe_id",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## Troubleshooting

### Erro: "Firebase: No Firebase App '[DEFAULT]' has been created"
- Verifique se o arquivo `src/config/firebase.ts` está sendo importado no `App.tsx`
- Verifique se as configurações do Firebase estão corretas

### Erro: "Firebase: Error (auth/invalid-api-key)"
- Verifique se a API key está correta no arquivo de configuração
- Verifique se o projeto Firebase está ativo

### Erro: "Firebase: Error (auth/network-request-failed)"
- Verifique sua conexão com a internet
- Verifique se o domínio está autorizado no Firebase Console

### Erro: "Firebase: Error (permission-denied)"
- Verifique as regras de segurança do Firestore
- Verifique se o usuário está autenticado

### Dados não aparecem no Firestore
- Verifique se as regras de segurança permitem escrita
- Verifique se o usuário está autenticado
- Verifique os logs do console para erros
