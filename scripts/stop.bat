@echo off
echo ========================================
echo  Melanski Sports - Parando Servidores
echo ========================================
echo.

echo [1/2] Parando servidor Node.js (Backend)...
taskkill /F /FI "WINDOWTITLE eq Backend - Melanski Sports*" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Backend parado com sucesso
) else (
    echo [INFO] Backend nao estava rodando
)

REM Alternativa: matar todos os processos Node na porta 3000
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>nul
    echo [OK] Processo na porta 3000 encerrado
)

echo.
echo [2/2] Parando servidor Vite (Frontend)...
taskkill /F /FI "WINDOWTITLE eq Frontend - Melanski Sports*" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Frontend parado com sucesso
) else (
    echo [INFO] Frontend nao estava rodando
)

REM Alternativa: matar todos os processos Node na porta 5173
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>nul
    echo [OK] Processo na porta 5173 encerrado
)

echo.
echo ========================================
echo  Servidores parados com sucesso!
echo ========================================
echo.
pause
