@echo off
echo ========================================
echo  Melanski Sports - Status dos Servidores
echo ========================================
echo.

echo [Backend - Porta 3000]
netstat -ano | find ":3000" | find "LISTENING" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Status: RODANDO
    for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
        echo PID: %%a
    )
) else (
    echo Status: PARADO
)

echo.
echo [Frontend - Porta 5173]
netstat -ano | find ":5173" | find "LISTENING" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Status: RODANDO
    for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do (
        echo PID: %%a
    )
) else (
    echo Status: PARADO
)

echo.
echo ========================================
echo.
pause
