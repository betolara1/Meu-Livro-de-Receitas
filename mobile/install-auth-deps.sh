#!/bin/bash

echo "Instalando dependências de autenticação..."
echo

echo "Instalando dependências principais..."
npm install @react-native-google-signin/google-signin@^13.0.1
npm install expo-apple-authentication@~8.0.1
npm install expo-secure-store@~14.0.0
npm install expo-auth-session@~6.0.4
npm install expo-crypto@~14.0.1

echo
echo "Dependências instaladas com sucesso!"
echo
echo "Próximos passos:"
echo "1. Configure o Google Sign-In no Google Cloud Console"
echo "2. Configure o Apple Sign-In no Apple Developer Console"
echo "3. Atualize as URLs da API em src/config/authConfig.ts"
echo "4. Execute: npm run ios ou npm run android"
echo
