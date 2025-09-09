# Configuração de Autenticação - Livro de Receitas

Este documento explica como configurar o sistema de autenticação no aplicativo mobile.

## 📋 Pré-requisitos

- Expo CLI instalado
- Conta no Google Cloud Console (para Google Sign-In)
- Conta no Apple Developer Console (para Apple Sign-In)
- Backend API configurado com endpoints de autenticação

## 🔧 Configuração

### 1. Instalar Dependências

```bash
cd mobile
npm install
```

### 2. Configurar Google Sign-In

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API "Google+ API" e "Google Sign-In API"
4. Vá em "Credenciais" e crie uma credencial OAuth 2.0
5. Configure os domínios autorizados:
   - Para desenvolvimento: `localhost:8081`
   - Para produção: seu domínio de produção
6. Copie o **Web Client ID** e cole em `src/config/authConfig.ts`:

```typescript
GOOGLE: {
  WEB_CLIENT_ID: 'SEU_WEB_CLIENT_ID_AQUI.apps.googleusercontent.com',
},
```

### 3. Configurar Apple Sign-In

1. Acesse o [Apple Developer Console](https://developer.apple.com/)
2. Vá em "Certificates, Identifiers & Profiles"
3. Crie um novo App ID ou edite um existente
4. Ative "Sign In with Apple" capability
5. Configure o Bundle ID do seu app
6. O Apple Sign-In funcionará automaticamente no iOS

### 4. Configurar Backend API

Atualize as URLs da API em `src/config/authConfig.ts`:

```typescript
export const AUTH_CONFIG = {
  API_BASE_URL: 'https://sua-api-url.com/api',
  // ... outras configurações
};
```

### 5. Endpoints da API Necessários

Seu backend deve implementar os seguintes endpoints:

#### POST /auth/login
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Resposta:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "Nome do Usuário",
    "photo": "url_da_foto",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "token": "jwt_token"
}
```

#### POST /auth/register
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Nome do Usuário"
}
```

**Resposta:** Mesma estrutura do login

#### POST /auth/google
```json
{
  "googleId": "google_user_id",
  "email": "user@example.com",
  "name": "Nome do Usuário",
  "photo": "url_da_foto"
}
```

#### POST /auth/apple
```json
{
  "appleId": "apple_user_id",
  "email": "user@example.com",
  "name": "Nome do Usuário",
  "identityToken": "apple_identity_token"
}
```

#### POST /auth/reset-password
```json
{
  "email": "user@example.com"
}
```

## 🚀 Executando o App

### Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar no iOS
npm run ios

# Executar no Android
npm run android

# Executar no Web
npm run web
```

### Build para Produção

```bash
# Build para Android
npm run build:android

# Build para iOS
npm run build:ios
```

## 🔐 Funcionalidades Implementadas

### ✅ Autenticação por Email/Senha
- Login com email e senha
- Registro de nova conta
- Validação de formulários
- Recuperação de senha

### ✅ Login Social
- Google Sign-In (Android e iOS)
- Apple Sign-In (apenas iOS)
- Integração com APIs do Google e Apple

### ✅ Gerenciamento de Estado
- Context API para estado global
- Persistência de dados do usuário
- Tokens de autenticação seguros

### ✅ Interface de Usuário
- Telas de login e registro
- Tela de recuperação de senha
- Header com informações do usuário
- Botão de logout
- Loading states e tratamento de erros

## 🛠️ Estrutura de Arquivos

```
src/
├── components/
│   └── AuthLoadingScreen.tsx
├── config/
│   └── authConfig.ts
├── contexts/
│   └── AuthContext.tsx
├── navigation/
│   ├── AppNavigator.tsx
│   └── AuthNavigator.tsx
├── screens/
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   └── ForgotPasswordScreen.tsx
├── services/
│   └── authService.ts
└── types/
    └── Auth.ts
```

## 🔧 Personalização

### Temas e Cores
As cores e estilos podem ser personalizados em `src/constants/theme.ts`.

### Validações
As regras de validação podem ser ajustadas em `src/config/authConfig.ts`.

### Mensagens de Erro
As mensagens de erro podem ser personalizadas em `src/config/authConfig.ts`.

## 🐛 Troubleshooting

### Erro de Google Sign-In
- Verifique se o Web Client ID está correto
- Certifique-se de que o Bundle ID está configurado no Google Console
- Para Android, verifique se o arquivo `google-services.json` está no projeto

### Erro de Apple Sign-In
- Verifique se o Bundle ID está configurado no Apple Developer Console
- Certifique-se de que a capability "Sign In with Apple" está ativada
- Só funciona em dispositivos iOS reais (não no simulador)

### Erro de API
- Verifique se a URL da API está correta
- Certifique-se de que o backend está rodando
- Verifique os logs do console para mais detalhes

## 📱 Testando

### Testes Manuais
1. Teste o registro com email/senha
2. Teste o login com email/senha
3. Teste o login com Google (Android/iOS)
4. Teste o login com Apple (iOS)
5. Teste a recuperação de senha
6. Teste o logout

### Dados de Teste
Use dados reais para testar, pois as validações são rigorosas.

## 🔒 Segurança

- Tokens são armazenados de forma segura usando Expo SecureStore
- Senhas são validadas no frontend e backend
- Dados sensíveis não são armazenados localmente
- Comunicação com API usa HTTPS

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do console
2. Confirme se todas as configurações estão corretas
3. Teste em dispositivos reais
4. Verifique a documentação do Expo e das bibliotecas utilizadas
