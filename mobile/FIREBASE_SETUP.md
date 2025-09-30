# Configuração do Firebase

## 1. Criar Projeto no Firebase Console

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Digite o nome do projeto (ex: "livro-receitas")
4. Ative o Google Analytics (opcional)
5. Clique em "Criar projeto"

## 2. Configurar Authentication

1. No painel lateral, clique em "Authentication"
2. Clique em "Começar"
3. Vá para a aba "Sign-in method"
4. Ative os seguintes provedores:
   - **Email/senha**: Ative e configure
   - **Google**: Ative e configure (adicione o SHA-1 do seu app)
   - **Apple**: Ative e configure (apenas para iOS)

## 3. Configurar Firestore Database

1. No painel lateral, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Começar no modo de teste" (para desenvolvimento)
4. Selecione a localização mais próxima
5. Clique em "Ativar"

## 4. Configurar Regras de Segurança do Firestore

Substitua as regras padrão por estas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem ler/escrever apenas seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Receitas - usuários podem ler/escrever apenas suas próprias receitas
    match /recipes/{recipeId} {
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         request.auth.uid == userId);
    }
    
    // Categorias - usuários podem ler/escrever apenas suas próprias categorias
    match /categories/{categoryId} {
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         request.auth.uid == userId);
    }
    
    // Favoritos - usuários podem ler/escrever apenas seus próprios favoritos
    match /favorites/{favoriteId} {
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         request.auth.uid == userId);
    }
  }
}
```

## 5. Obter Configurações do Projeto

1. No painel lateral, clique em "Configurações do projeto" (ícone de engrenagem)
2. Role para baixo até "Seus aplicativos"
3. Clique em "Adicionar app" e escolha "Web" (</>)
4. Digite um nome para o app (ex: "Livro de Receitas Web")
5. **NÃO** marque "Também configurar o Firebase Hosting"
6. Clique em "Registrar app"
7. Copie as configurações do Firebase (firebaseConfig)

## 6. Configurar o App

1. Abra o arquivo `mobile/src/config/firebase.ts`
2. Substitua as configurações de exemplo pelas suas configurações reais:

```typescript
const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "seu-app-id"
};
```

## 7. Configurar Google Sign-In (Android)

1. No Firebase Console, vá para "Authentication" > "Sign-in method"
2. Clique em "Google" e copie o "Web client ID"
3. Abra o arquivo `mobile/src/services/authService.ts`
4. Substitua `YOUR_GOOGLE_WEB_CLIENT_ID` pelo Web client ID real

## 8. Configurar Google Sign-In (iOS)

1. No Firebase Console, vá para "Authentication" > "Sign-in method"
2. Clique em "Google" e copie o "Web client ID"
3. No Xcode, abra o arquivo `ios/YourApp/`
4. Adicione a configuração do Google Sign-In

## 9. Testar a Configuração

1. Execute o app: `npm start`
2. Tente fazer login com email/senha
3. Tente fazer login com Google (se configurado)
4. Verifique se os dados aparecem no Firestore Console

## Estrutura de Dados no Firestore

### Coleção: `users`
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "Nome do Usuário",
  "photo": "url_da_foto",
  "provider": "email|google|apple",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Coleção: `recipes`
```json
{
  "id": "recipe_id",
  "userId": "user_id",
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
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Coleção: `categories`
```json
{
  "id": "category_id",
  "userId": "user_id",
  "name": "Nome da Categoria",
  "slug": "categoria-slug",
  "isDefault": false,
  "createdAt": "timestamp"
}
```

### Coleção: `favorites`
```json
{
  "id": "favorite_id",
  "userId": "user_id",
  "recipeId": "recipe_id",
  "createdAt": "timestamp"
}
```

## Próximos Passos

1. Configure as regras de segurança do Firestore
2. Teste todas as funcionalidades
3. Configure notificações push (opcional)
4. Configure Analytics (opcional)
5. Configure Performance Monitoring (opcional)
