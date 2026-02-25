@echo off
setlocal enabledelayedexpansion
REM ============================================================================
REM Script de Deploy para Hostinger (Windows)
REM ============================================================================
REM Execute com: scripts\deploy.bat "mensagem do commit"
REM Ou da pasta scripts: deploy.bat "mensagem do commit"
REM
REM Este script garante que a estrutura de arquivos esteja correta para Hostinger:
REM - Arquivos de build (index.html, assets/, vite.svg) devem estar APENAS em public_html
REM - Codigo-fonte (backend/, frontend/, scripts/) deve permanecer na raiz
REM - O script valida a estrutura antes de fazer push
REM ============================================================================

echo.
echo ============================================================================
echo   SCRIPT DE DEPLOY PARA HOSTINGER
echo ============================================================================
echo.
echo 🚀 Iniciando processo de deploy...
echo.

REM Verifica se uma mensagem de commit foi fornecida
if "%~1"=="" (
    set "COMMIT_MSG=Deploy automatico"
    echo 📝 Usando mensagem padrao: Deploy automatico
) else (
    set "COMMIT_MSG=%~1"
    echo 📝 Mensagem do commit: %~1
)
echo.

REM Detecta se está rodando da raiz ou da pasta scripts
echo 🔍 Detectando diretorio raiz do projeto...
if exist "frontend\package.json" (
    set "ROOT_DIR=."
    echo ✅ Executando da raiz do projeto
) else if exist "..\frontend\package.json" (
    set "ROOT_DIR=.."
    echo ✅ Executando da pasta scripts
) else (
    echo.
    echo ❌ ERRO: Nao foi possivel encontrar a pasta frontend!
    echo.
    echo Execute este script da raiz do projeto ou da pasta scripts
    echo.
    echo Pressione qualquer tecla para sair...
    pause >nul
    exit /b 1
)
echo.

REM ============================================================================
REM ETAPA 1: LIMPEZA DA RAIZ (Pre-Build Cleanup)
REM ============================================================================

echo ============================================================================
echo ETAPA 1: LIMPEZA DA RAIZ
echo ============================================================================
echo.
echo 🧹 Limpando arquivos de build da raiz do projeto...
echo.

REM Muda para o diretório raiz
pushd "%ROOT_DIR%" || (
    echo ❌ ERRO: Nao foi possivel acessar o diretorio raiz!
    pause
    exit /b 1
)

if exist "index.html" (
    echo    - Removendo index.html da raiz...
    del /Q "index.html" 2>nul
)

if exist "vite.svg" (
    echo    - Removendo vite.svg da raiz...
    del /Q "vite.svg" 2>nul
)

if exist "assets" (
    echo    - Removendo pasta assets da raiz...
    rmdir /S /Q "assets" 2>nul
)

echo.
echo ✅ Limpeza da raiz concluida!
echo.

REM Volta para onde estava
popd

REM ============================================================================
REM ETAPA 2: BUILD DO FRONTEND
REM ============================================================================

echo ============================================================================
echo ETAPA 2: BUILD DO FRONTEND
echo ============================================================================
echo.
echo 📦 Fazendo build do frontend...
echo.

REM Salva o diretório atual e muda para frontend
pushd "%ROOT_DIR%\frontend" || (
    echo.
    echo ❌ ERRO: Nao foi possivel acessar a pasta frontend!
    echo.
    pause
    exit /b 1
)

if not exist "package.json" (
    echo.
    echo ❌ ERRO: package.json nao encontrado na pasta frontend!
    echo.
    popd
    pause
    exit /b 1
)

echo Executando: npm run build
echo.
call npm run build

set BUILD_ERROR=!errorlevel!

if !BUILD_ERROR! neq 0 (
    echo.
    echo ❌ ERRO no build do frontend! (codigo de erro: !BUILD_ERROR!)
    echo.
    echo Verifique os erros acima e corrija antes de tentar novamente.
    echo.
    popd
    pause
    exit /b 1
)

echo.
echo ✅ Build concluido com sucesso!
echo.

REM Volta para o diretório raiz
popd

REM ============================================================================
REM ETAPA 3: VALIDACAO DA ESTRUTURA (Post-Build Validation)
REM ============================================================================

echo ============================================================================
echo ETAPA 3: VALIDACAO DA ESTRUTURA
echo ============================================================================
echo.
echo 🔍 Validando estrutura de arquivos...
echo.

REM Muda para o diretório raiz
pushd "%ROOT_DIR%" || (
    echo ❌ ERRO: Nao foi possivel acessar o diretorio raiz!
    pause
    exit /b 1
)

set VALIDATION_FAILED=0

REM Verifica se public_html existe
if not exist "public_html" (
    echo ❌ ERRO: Pasta public_html nao encontrada!
    set VALIDATION_FAILED=1
) else (
    echo ✅ Pasta public_html encontrada
)

REM Verifica se index.html existe em public_html
if not exist "public_html\index.html" (
    echo ❌ ERRO: index.html nao encontrado em public_html!
    set VALIDATION_FAILED=1
) else (
    echo ✅ index.html encontrado em public_html
)

REM Verifica se pasta assets existe em public_html
if not exist "public_html\assets" (
    echo ❌ ERRO: Pasta assets nao encontrada em public_html!
    set VALIDATION_FAILED=1
) else (
    echo ✅ Pasta assets encontrada em public_html
)

REM Verifica se arquivos de build NAO estao na raiz
if exist "index.html" (
    echo ❌ ERRO: index.html encontrado na raiz (deve estar apenas em public_html)!
    set VALIDATION_FAILED=1
)

if exist "assets" (
    echo ❌ ERRO: Pasta assets encontrada na raiz (deve estar apenas em public_html)!
    set VALIDATION_FAILED=1
)

echo.

REM Se a validacao falhou, aborta o deploy
if !VALIDATION_FAILED! equ 1 (
    echo ❌ VALIDACAO FALHOU!
    echo.
    echo A estrutura de arquivos nao esta correta para deploy na Hostinger.
    echo.
    echo 📋 Estrutura esperada:
    echo    / (raiz)
    echo    ├── backend/
    echo    ├── frontend/
    echo    ├── scripts/
    echo    └── public_html/
    echo        ├── index.html
    echo        ├── assets/
    echo        └── vite.svg
    echo.
    echo � O que fazer:
    echo    1. Verifique se o vite.config.js tem: outDir: '../public_html'
    echo    2. Execute 'npm run build' na pasta frontend
    echo    3. Verifique se os arquivos foram gerados em public_html
    echo.
    popd
    pause
    exit /b 1
)

echo ✅ Validacao de estrutura concluida com sucesso!
echo    Todos os arquivos de build estao em public_html
echo    A raiz do projeto esta limpa
echo.

REM Volta para onde estava
popd

REM ============================================================================
REM ETAPA 4: GIT COMMIT E PUSH
REM ============================================================================

echo ============================================================================
echo ETAPA 4: GIT COMMIT E PUSH
echo ============================================================================
echo.

REM Muda para o diretório raiz
pushd "%ROOT_DIR%" || (
    echo ❌ ERRO: Nao foi possivel acessar o diretorio raiz!
    pause
    exit /b 1
)

echo 📝 Adicionando arquivos ao Git...
git add .
set GIT_ADD_ERROR=!errorlevel!

if !GIT_ADD_ERROR! neq 0 (
    echo.
    echo ❌ ERRO ao adicionar arquivos ao Git! (codigo: !GIT_ADD_ERROR!)
    echo.
    popd
    pause
    exit /b 1
)
echo ✅ Arquivos adicionados
echo.

echo 💾 Fazendo commit...
git commit -m "!COMMIT_MSG!"
set GIT_COMMIT_ERROR=!errorlevel!

REM Commit pode retornar 1 se nao houver mudancas, isso e OK
if !GIT_COMMIT_ERROR! equ 0 (
    echo ✅ Commit realizado
) else (
    echo ⚠️  Nenhuma mudanca para commitar ou commit falhou
    echo    Continuando com o push...
)
echo.

echo 🌐 Enviando para o repositorio...
git push
set GIT_PUSH_ERROR=!errorlevel!

if !GIT_PUSH_ERROR! equ 0 (
    echo.
    echo ============================================================================
    echo ✅ DEPLOY ENVIADO COM SUCESSO!
    echo ============================================================================
    echo.
    echo 📊 Resumo da estrutura:
    echo    ✅ Arquivos de build em public_html
    echo    ✅ Codigo-fonte na raiz do projeto
    echo    ✅ Estrutura validada e correta
    echo.
    echo 🔔 PROXIMO PASSO:
    echo    1. Acesse o painel da Hostinger
    echo    2. Va em Git ou Deploy
    echo    3. Clique em 'Implantar'
    echo    4. Aguarde a implantacao concluir
    echo    5. Teste o site (deve carregar sem erro 503!)
    echo.
    echo ============================================================================
    echo.
    popd
    echo Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 0
) else (
    echo.
    echo ❌ ERRO ao fazer push! (codigo: !GIT_PUSH_ERROR!)
    echo.
    echo Possiveis causas:
    echo    - Credenciais Git incorretas
    echo    - Sem conexao com a internet
    echo    - Conflitos no repositorio (execute 'git pull' primeiro)
    echo.
    popd
    pause
    exit /b 1
)

endlocal
