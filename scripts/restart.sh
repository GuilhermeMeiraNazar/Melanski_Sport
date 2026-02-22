#!/bin/bash

echo "========================================"
echo " Melanski Sports - Reiniciando Servidores"
echo "========================================"
echo ""

echo "[1/2] Parando servidores..."
./scripts/stop.sh

echo ""
echo "[2/2] Aguardando 2 segundos..."
sleep 2

echo ""
./scripts/start.sh
