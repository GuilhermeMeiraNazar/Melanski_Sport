#!/bin/bash

# Script de Deploy para Hostinger (Linux/Mac)
# Execute com: bash scripts/deploy.sh "mensagem do commit"
# Ou da pasta scripts: bash deploy.sh "mensagem do commit"

echo "🚀 Iniciando processo de deploy..."

# Verifica se uma mensagem de commit foi fornecida
if [ -z "$1" ]; then
    COMMIT_MSG="Deploy automático"
else
    COMMIT_MSG="$1"
fi

# Detecta se está rodando da raiz ou da pasta scripts
if [ -f "frontend/package.json" ]; then
    ROOT_DIR="."
elif [ -f "../frontend/package.json" ]; then
    ROOT_DIR=".."
else
    echo "❌ Erro: Não foi possível encontrar a pasta frontend!"
    echo "Execute este script da raiz do projeto ou da pasta scripts"
    exit 1
fi

echo "📦 Fazendo build do frontend..."
cd "$ROOT_DIR/frontend"
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build do frontend!"
    cd "$ROOT_DIR"
    exit 1
fi

echo "✅ Build concluído!"

cd "$ROOT_DIR"

echo "📝 Adicionando arquivos ao Git..."
git add .

echo "💾 Fazendo commit..."
git commit -m "$COMMIT_MSG"

echo "🌐 Enviando para o repositório..."
git push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deploy enviado com sucesso!"
    echo "🔔 Agora vá no painel da Hostinger e clique em 'Implantar'"
    echo ""
else
    echo "❌ Erro ao fazer push!"
    exit 1
fi
