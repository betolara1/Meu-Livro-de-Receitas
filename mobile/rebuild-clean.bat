@echo off
echo 🧹 Limpeza completa e rebuild do aplicativo...
echo.

echo 📱 Parando processos do Metro...
taskkill /f /im node.exe 2>nul
taskkill /f /im java.exe 2>nul

echo.
echo 🗑️ Limpando caches...
cd /d "%~dp0"

echo   - Limpando node_modules...
if exist node_modules rmdir /s /q node_modules

echo   - Limpando cache do npm...
npm cache clean --force

echo   - Limpando cache do Expo...
npx expo install --fix

echo   - Limpando cache do Metro...
npx expo start --clear --reset-cache

echo.
echo 📦 Reinstalando dependências...
npm install

echo.
echo 🔨 Limpando build do Android...
cd android
if exist app\build rmdir /s /q app\build
if exist build rmdir /s /q build
.\gradlew clean
cd ..

echo.
echo ✅ Limpeza concluída! Agora execute:
echo    npm run android
echo.
echo 💡 Dicas para evitar timeouts:
echo    1. Certifique-se de que o emulador está rodando
echo    2. Aguarde o Metro bundler carregar completamente
echo    3. Se o erro persistir, reinicie o emulador
echo.
pause
