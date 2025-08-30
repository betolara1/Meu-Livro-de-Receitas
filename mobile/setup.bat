@echo off
echo.
echo ========================================
echo  Setup do Livro de Receitas Mobile
echo ========================================
echo.

echo [1/4] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado. Por favor, instale o Node.js 18+ antes de continuar.
    echo Download: https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js encontrado

echo.
echo [2/4] Instalando dependencias...
npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias
    pause
    exit /b 1
)
echo ✓ Dependencias instaladas

echo.
echo [3/4] Verificando Expo CLI...
npx expo --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Instalando Expo CLI...
    npm install -g @expo/cli
)
echo ✓ Expo CLI configurado

echo.
echo [4/4] Inicializando projeto...
npx expo install --fix >nul 2>&1
echo ✓ Projeto inicializado

echo.
echo ========================================
echo  Setup concluido com sucesso!
echo ========================================
echo.
echo Para executar o app:
echo   1. npm start          (Metro bundler)
echo   2. npm run android    (Android)
echo   3. npm run ios        (iOS - apenas macOS)
echo.
echo Certifique-se de ter o Android Studio instalado para Android.
echo Para iOS, voce precisa do Xcode (apenas macOS).
echo.
pause
