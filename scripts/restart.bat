@echo off
echo ========================================
echo  Melanski Sports - Reiniciando Servidores
echo ========================================
echo.

echo [1/2] Parando servidores...
call "%~dp0stop.bat"

echo.
echo [2/2] Iniciando servidores...
timeout /t 2 /nobreak >nul
call "%~dp0start.bat"
