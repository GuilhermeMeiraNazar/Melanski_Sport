@echo off
REM Script de Deploy para Hostinger (Windows)
REM Execute com: scripts\deploy.bat "mensagem do commit"
REM Ou da pasta scripts: deploy.bat "mensagem do commit"

echo 🚀 Iniciando processo de deploy...

REM Verifica se uma mensagem de commit foi fornecida
if "%~1"=="" (
    set COMMIT_MSG=Deploy automatico
) else (
    set COMMIT_MSG=%~1
)

REM Detecta se está rodando da raiz ou da pasta scripts
if exist "frontend\package.json" (
    set ROOT_DIR=.
) else if exist "..\frontend\package.json" (
    set ROOT_DIR=..
) else (
    echo ❌ Erro: Nao foi possivel encontrar a pasta frontend!
    echo Execute este script da raiz do projeto ou da pasta scripts
    exit /b 1
)

echo 📦 Fazendo build do frontend...
cd %ROOT_DIR%\frontend
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Erro no build do frontend!
    cd %ROOT_DIR%
    exit /b 1
)

echo ✅ Build concluido!

cd %ROOT_DIR%

echo 📝 Adicionando arquivos ao Git...
git add .

echo 💾 Fazendo commit...
git commit -m "%COMMIT_MSG%"

echo 🌐 Enviando para o repositorio...
git push

if %errorlevel% equ 0 (
    echo.
    echo ✅ Deploy enviado com sucesso!
    echo 🔔 Agora va no painel da Hostinger e clique em 'Implantar'
    echo.
) else (
    echo ❌ Erro ao fazer push!
    exit /b 1
)
