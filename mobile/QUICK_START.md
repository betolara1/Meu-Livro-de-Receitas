# 🚀 Quick Start - Livro de Receitas Mobile

## Setup Rápido (5 minutos)

### 1. Navegue para a pasta mobile
```bash
cd mobile
```

### 2. Execute o setup automático

**Windows:**
```cmd
setup.bat
```

**macOS/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

### 3. Inicie o app
```bash
npm start
```

### 4. Execute no dispositivo

**Android:**
- Instale o app Expo Go no seu celular
- Escaneie o QR code que aparece no terminal
- OU execute: `npm run android` (requer Android Studio)

**iOS:**
- Instale o app Expo Go no seu iPhone
- Escaneie o QR code que aparece no terminal
- OU execute: `npm run ios` (requer macOS + Xcode)

## ✅ Pronto!

O app estará rodando com:
- ✅ 3 receitas de exemplo pré-carregadas
- ✅ Sistema de favoritos funcionando
- ✅ Busca e filtros ativos
- ✅ Formulários de criação/edição
- ✅ Dados salvos localmente (offline)

## 🛠️ Desenvolvimento

### Comandos úteis:
```bash
npm start          # Metro bundler
npm run android    # Android nativo
npm run ios        # iOS nativo
npm run web        # Versão web
```

### Estrutura:
- `src/screens/` - Telas do app
- `src/components/` - Componentes reutilizáveis
- `src/services/database.ts` - Banco de dados local
- `src/constants/theme.ts` - Cores e estilos

## 📱 Funcionalidades

- **Home**: Receitas em destaque + categorias
- **Buscar**: Busca com filtros avançados
- **Favoritos**: Receitas marcadas como favoritas
- **Detalhes**: Visualização completa da receita
- **Criar/Editar**: Formulários para gerenciar receitas

## 🎯 Próximos Passos

1. **Personalize os assets**: Substitua os placeholders em `assets/`
2. **Configure ícones**: Adicione ícones reais da app
3. **Build para produção**: Use `eas build` para gerar APK/IPA
4. **Publique nas stores**: Use `eas submit` para distribuir

---

**🍳 Seu livro de receitas mobile está pronto para uso!**
