@echo off
echo ========================================
echo  Melanski Sports - Iniciando Servidor
echo ========================================
echo.

REM Verificar se o Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Node.js nao encontrado!
    echo Por favor, instale o Node.js: https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Verificando dependencias do backend...
cd backend
if not exist "node_modules" (
    echo [INFO] Instalando dependencias do backend...
    call npm install
)

echo.
echo [2/4] Verificando dependencias do frontend...
cd ..\frontend
if not exist "node_modules" (
    echo [INFO] Instalando dependencias do frontend...
    call npm install
)

echo.
echo [3/4] Iniciando servidor backend (porta 3000)...
cd ..\backend
start "Backend - Melanski Sports" cmd /k "npm start"

echo.
echo [4/4] Iniciando servidor frontend (porta 5173)...
cd ..\frontend
start "Frontend - Melanski Sports" cmd /k "npm run dev"

echo.
echo ========================================
echo  Servidores iniciados com sucesso!
echo ========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Pressione qualquer tecla para voltar...
pause >nul
