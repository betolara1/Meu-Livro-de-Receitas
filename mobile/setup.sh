#!/bin/bash

echo ""
echo "========================================"
echo "  Setup do Livro de Receitas Mobile"
echo "========================================"
echo ""

echo "[1/4] Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ ERRO: Node.js não encontrado. Por favor, instale o Node.js 18+ antes de continuar."
    echo "Download: https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js encontrado"

echo ""
echo "[2/4] Instalando dependências..."
if ! npm install; then
    echo "❌ ERRO: Falha ao instalar dependências"
    exit 1
fi
echo "✅ Dependências instaladas"

echo ""
echo "[3/4] Verificando Expo CLI..."
if ! npx expo --version &> /dev/null; then
    echo "Instalando Expo CLI..."
    npm install -g @expo/cli
fi
echo "✅ Expo CLI configurado"

echo ""
echo "[4/4] Inicializando projeto..."
npx expo install --fix &> /dev/null
echo "✅ Projeto inicializado"

echo ""
echo "========================================"
echo "  Setup concluído com sucesso!"
echo "========================================"
echo ""
echo "Para executar o app:"
echo "  1. npm start          (Metro bundler)"
echo "  2. npm run android    (Android)"
echo "  3. npm run ios        (iOS - apenas macOS)"
echo ""
echo "Certifique-se de ter o Android Studio instalado para Android."
echo "Para iOS, você precisa do Xcode (apenas macOS)."
echo ""
