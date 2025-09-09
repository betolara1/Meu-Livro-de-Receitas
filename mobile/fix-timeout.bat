@echo off
echo 🔧 Corrigindo erro de timeout do aplicativo...
echo.

echo 📱 Limpando cache do Metro...
npx expo start --clear

echo.
echo ✅ Cache limpo! Agora execute:
echo    npm run android
echo.
echo 💡 Se o erro persistir, tente:
echo    1. Fechar o emulador
echo    2. Executar: npm run android
echo    3. Aguardar o app carregar completamente
echo.
pause
