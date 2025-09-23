# 🍎 Configuração do Apple Sign In 

## 1. Apple Developer Console

### Passo 1: Configurar App ID
1. Acesse [developer.apple.com](https://developer.apple.com)
2. Vá em "Certificates, Identifiers & Profiles"
3. Selecione "Identifiers" → "App IDs"
4. Encontre seu App ID: `com.recipeBook.mobile`
5. Edite e habilite "Sign In with Apple"
6. Salve as alterações

### Passo 2: Configurar Service ID
1. Em "Identifiers", clique no "+" para criar novo
2. Selecione "Services IDs" → "Continue"
3. Configure:
   - **Description**: Recipe Book Service
   - **Identifier**: `com.recipeBook.mobile.service`
4. Habilite "Sign In with Apple"
5. Clique em "Configure" e adicione:
   - **Primary App ID**: `com.recipeBook.mobile`
   - **Website URLs**: `https://your-domain.com` (ou localhost para desenvolvimento)
   - **Return URLs**: `https://your-domain.com/auth/apple/callback`
6. Salve e continue

### Passo 3: Criar Chave Privada
1. Vá em "Keys" → "+" para criar nova chave
2. Configure:
   - **Key Name**: Recipe Book Apple Sign In Key
   - Habilite "Sign In with Apple"
3. Baixe o arquivo `.p8` (salve em local seguro!)
4. Anote o **Key ID** (ex: ABC123DEF4)

## 2. Firebase Console

### Passo 1: Configurar Apple Provider
1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Selecione seu projeto
3. Vá em "Authentication" → "Sign-in method"
4. Habilite "Apple"
5. Configure:
   - **Service ID**: `com.recipeBook.mobile.service`
   - **Apple Team ID**: (encontre em developer.apple.com)
   - **Key ID**: (da chave criada acima)
   - **Private Key**: (conteúdo do arquivo .p8)

### Passo 2: Configurar OAuth Redirect URIs
1. Em "Authentication" → "Settings" → "Authorized domains"
2. Adicione seus domínios de desenvolvimento e produção

## 3. Configuração do App

### Passo 1: Atualizar app.json
```json
{
  "expo": {
    "ios": {
      "usesAppleSignIn": true,
      "bundleIdentifier": "com.recipeBook.mobile",
      "infoPlist": {
        "com.apple.developer.applesignin": ["Default"]
      }
    }
  }
}
```

### Passo 2: Instalar dependências
```bash
npm install @invertase/react-native-apple-authentication
```

### Passo 3: Configurar no código
O código já está configurado nos arquivos:
- `mobile/src/services/appleAuthService.ts`
- `mobile/src/services/authService.ts`
- `mobile/src/screens/LoginScreen.tsx`
- `mobile/src/screens/RegisterScreen.tsx`

## 4. Testando

### Em Desenvolvimento
1. Execute o app no simulador iOS
2. Toque em "Entrar com Apple"
3. Use sua conta Apple ID de desenvolvimento

### Em Produção
1. Faça build para App Store
2. Teste com conta Apple ID real
3. Verifique se o login funciona corretamente

## 5. Troubleshooting

### Erro: "Apple Sign In não configurado"
- Verifique se o Service ID está correto no Firebase
- Confirme se a chave privada está correta
- Verifique se o Team ID está correto

### Erro: "Apple Sign In não está disponível"
- Só funciona no iOS 13+
- Verifique se está testando em dispositivo/simulador iOS
- Confirme se o App ID tem "Sign In with Apple" habilitado

### Erro: "Login cancelado pelo usuário"
- Normal quando usuário cancela o fluxo
- Não é um erro, apenas usuário escolheu não continuar

## 6. Recursos Adicionais

- [Documentação Apple Sign In](https://developer.apple.com/sign-in-with-apple/)
- [Firebase Apple Auth](https://firebase.google.com/docs/auth/ios/apple)
- [Expo Apple Authentication](https://docs.expo.dev/versions/latest/sdk/apple-authentication/)

## 7. Checklist Final

- [ ] App ID configurado com Sign In with Apple
- [ ] Service ID criado e configurado
- [ ] Chave privada criada e baixada
- [ ] Firebase configurado com Apple provider
- [ ] app.json atualizado
- [ ] Dependências instaladas
- [ ] Código implementado
- [ ] Testado em desenvolvimento
- [ ] Testado em produção
