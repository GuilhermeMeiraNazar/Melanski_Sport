#!/bin/bash

echo "========================================"
echo " Melanski Sports - Status dos Servidores"
echo "========================================"
echo ""

echo "[Backend - Porta 3000]"
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "Status: RODANDO ✓"
    BACKEND_PID=$(lsof -ti:3000)
    echo "PID: $BACKEND_PID"
    echo "URL: http://localhost:3000"
else
    echo "Status: PARADO ✗"
fi

echo ""
echo "[Frontend - Porta 5173]"
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "Status: RODANDO ✓"
    FRONTEND_PID=$(lsof -ti:5173)
    echo "PID: $FRONTEND_PID"
    echo "URL: http://localhost:5173"
else
    echo "Status: PARADO ✗"
fi

echo ""
echo "========================================"
echo ""
