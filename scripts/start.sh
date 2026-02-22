#!/bin/bash

echo "========================================"
echo " Melanski Sports - Iniciando Servidor"
echo "========================================"
echo ""

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "[ERRO] Node.js não encontrado!"
    echo "Por favor, instale o Node.js: https://nodejs.org/"
    exit 1
fi

# Verificar se o npm está instalado
if ! command -v npm &> /dev/null; then
    echo "[ERRO] npm não encontrado!"
    echo "Por favor, instale o npm"
    exit 1
fi

echo "[1/4] Verificando dependências do backend..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "[INFO] Instalando dependências do backend..."
    npm install
fi

echo ""
echo "[2/4] Verificando dependências do frontend..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo "[INFO] Instalando dependências do frontend..."
    npm install
fi

echo ""
echo "[3/4] Iniciando servidor backend (porta 3000)..."
cd ../backend
npm start > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../logs/backend.pid
echo "[OK] Backend iniciado (PID: $BACKEND_PID)"

echo ""
echo "[4/4] Iniciando servidor frontend (porta 5173)..."
cd ../frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../logs/frontend.pid
echo "[OK] Frontend iniciado (PID: $FRONTEND_PID)"

echo ""
echo "========================================"
echo " Servidores iniciados com sucesso!"
echo "========================================"
echo ""
echo "Backend:  http://localhost:3000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Logs salvos em:"
echo "  - logs/backend.log"
echo "  - logs/frontend.log"
echo ""
echo "Para parar os servidores, execute: ./scripts/stop.sh"
