@echo off
echo ========================================
echo    TESTANDO CONFIGURAÇÕES DO iOS
echo ========================================

echo.
echo 1. Limpando cache do Expo...
npx expo start --clear

echo.
echo 2. Para testar no iOS, execute:
echo    npx expo run:ios
echo.
echo 3. Ou use o Expo Go:
echo    npx expo start
echo    Depois escaneie o QR code com o Expo Go
echo.

echo ========================================
echo    CHECKLIST DE VERIFICAÇÃO
echo ========================================
echo.
echo ✅ GoogleService-Info.plist adicionado ao projeto iOS
echo ✅ Bundle ID configurado: com.recipeBook.mobile
echo ✅ Apple Sign-In habilitado no app.json
echo ✅ Google Sign-In configurado
echo ✅ Permissões de câmera e galeria adicionadas
echo.
echo ⚠️  LEMBRE-SE DE:
echo    - Substituir SEU_IOS_CLIENT_ID_AQUI pelo Client ID real
echo    - Adicionar GoogleService-Info.plist ao Xcode project
echo    - Testar em dispositivo físico (Apple Sign-In não funciona no simulador)
echo.

pause

