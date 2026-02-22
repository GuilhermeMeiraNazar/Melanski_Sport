#!/bin/bash

echo "========================================"
echo " Melanski Sports - Parando Servidores"
echo "========================================"
echo ""

# Criar diretório de logs se não existir
mkdir -p logs

echo "[1/2] Parando servidor backend..."
if [ -f "logs/backend.pid" ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        kill $BACKEND_PID
        echo "[OK] Backend parado (PID: $BACKEND_PID)"
    else
        echo "[INFO] Backend não estava rodando"
    fi
    rm logs/backend.pid
else
    # Tentar matar pela porta
    BACKEND_PORT_PID=$(lsof -ti:3000)
    if [ ! -z "$BACKEND_PORT_PID" ]; then
        kill $BACKEND_PORT_PID
        echo "[OK] Processo na porta 3000 encerrado"
    else
        echo "[INFO] Nenhum processo na porta 3000"
    fi
fi

echo ""
echo "[2/2] Parando servidor frontend..."
if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        kill $FRONTEND_PID
        echo "[OK] Frontend parado (PID: $FRONTEND_PID)"
    else
        echo "[INFO] Frontend não estava rodando"
    fi
    rm logs/frontend.pid
else
    # Tentar matar pela porta
    FRONTEND_PORT_PID=$(lsof -ti:5173)
    if [ ! -z "$FRONTEND_PORT_PID" ]; then
        kill $FRONTEND_PORT_PID
        echo "[OK] Processo na porta 5173 encerrado"
    else
        echo "[INFO] Nenhum processo na porta 5173"
    fi
fi

echo ""
echo "========================================"
echo " Servidores parados com sucesso!"
echo "========================================"
echo ""
