@echo off
REM Ativa o suporte a UTF-8 para garantir leitura correta de acentos
chcp 65001 >nul
setlocal enabledelayedexpansion

REM ============================================================================
REM Script de Deploy para Hostinger (Windows)
REM ============================================================================
REM Execute com: scripts\deploy.bat "mensagem do commit"
REM Ou da pasta scripts: deploy.bat "mensagem do commit"
REM ============================================================================

echo.
echo ============================================================================
echo   SCRIPT DE DEPLOY PARA HOSTINGER
echo ============================================================================
echo.
echo [INFO] Iniciando processo de deploy...
echo.

REM Verifica se uma mensagem de commit foi fornecida
if "%~1"=="" (
    set "COMMIT_MSG=Deploy automatico"
    echo [INFO] Usando mensagem padrao: Deploy automatico
) else (
    set "COMMIT_MSG=%~1"
    echo [INFO] Mensagem do commit: %~1
)
echo.

REM Detecta se está rodando da raiz ou da pasta scripts
echo [INFO] Detectando diretorio raiz do projeto...
if exist "frontend\package.json" (
    set "ROOT_DIR=."
    echo [OK] Executando da raiz do projeto
) else if exist "..\frontend\package.json" (
    set "ROOT_DIR=.."
    echo [OK] Executando da pasta scripts
) else (
    echo.
    echo [ERRO] Nao foi possivel encontrar a pasta frontend!
    echo.
    echo Execute este script da raiz do projeto ou da pasta scripts
    echo.
    echo Pressione qualquer tecla para sair...
    pause >nul
    exit /b 1
)
echo.

REM ============================================================================
REM ETAPA 1: LIMPEZA DA RAIZ
REM ============================================================================
echo ============================================================================
echo ETAPA 1: LIMPEZA DA RAIZ
echo ============================================================================
echo.
echo [INFO] Limpando arquivos de build da raiz do projeto...
echo.

pushd "%ROOT_DIR%" || (
    echo [ERRO] Nao foi possivel acessar o diretorio raiz!
    echo.
    echo Pressione qualquer tecla para sair...
    pause >nul
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
echo [OK] Limpeza da raiz concluida!
echo.
popd

REM ============================================================================
REM ETAPA 2: BUILD DO FRONTEND
REM ============================================================================
echo ============================================================================
echo ETAPA 2: BUILD DO FRONTEND
echo ============================================================================
echo.
echo [INFO] Fazendo build do frontend...
echo.

pushd "%ROOT_DIR%\frontend" || (
    echo.
    echo [ERRO] Nao foi possivel acessar a pasta frontend!
    echo.
    echo Pressione qualquer tecla para sair...
    pause >nul
    exit /b 1
)

if not exist "package.json" (
    echo.
    echo [ERRO] package.json nao encontrado na pasta frontend!
    echo.
    popd
    echo.
    echo Pressione qualquer tecla para sair...
    pause >nul
    exit /b 1
)

echo Executando: npm run build
echo.
call npm run build
set BUILD_ERROR=!errorlevel!

if !BUILD_ERROR! NEQ 0 (
    echo.
    echo [ERRO] FALHA CRITICA no build do frontend! ^(codigo: !BUILD_ERROR!^)
    echo.
    echo O build falhou completamente. Verifique os erros acima.
    echo.
    popd
    echo.
    echo Pressione qualquer tecla para sair...
    pause >nul
    exit /b 1
)

echo.
echo [OK] Build concluido com SUCESSO!
echo.
echo [AVISO] Warnings de deprecacao do SASS sao normais e nao impedem o build.
echo.
echo Continuando para validacao...
echo.
popd

REM ============================================================================
REM ETAPA 3: VALIDACAO DA ESTRUTURA
REM ============================================================================
echo ============================================================================
echo ETAPA 3: VALIDACAO DA ESTRUTURA
echo ============================================================================
echo.
echo [INFO] Validando estrutura de arquivos...
echo.

pushd "%ROOT_DIR%" || (
    echo [ERRO] Nao foi possivel acessar o diretorio raiz!
    echo.
    echo Pressione qualquer tecla para sair...
    pause >nul
    exit /b 1
)

set VALIDATION_FAILED=0

if not exist "public_html" (
    echo [ERRO] Pasta public_html nao encontrada!
    set VALIDATION_FAILED=1
) else (
    echo [OK] Pasta public_html encontrada
)

if not exist "public_html\index.html" (
    echo [ERRO] index.html nao encontrado em public_html!
    set VALIDATION_FAILED=1
) else (
    echo [OK] index.html encontrado em public_html
)

if not exist "public_html\assets" (
    echo [ERRO] Pasta assets nao encontrada em public_html!
    set VALIDATION_FAILED=1
) else (
    echo [OK] Pasta assets encontrada em public_html
)

if exist "index.html" (
    echo [ERRO] index.html encontrado na raiz!
    set VALIDATION_FAILED=1
)

if exist "assets" (
    echo [ERRO] Pasta assets encontrada na raiz!
    set VALIDATION_FAILED=1
)

if !VALIDATION_FAILED! EQU 1 (
    echo [ERRO] VALIDACAO FALHOU!
    echo.
    echo A estrutura de arquivos nao esta correta para deploy na Hostinger.
    echo.
    echo [INFO] Estrutura esperada:
    echo    / ^(raiz^)
    echo    +-- backend/
    echo    +-- frontend/
    echo    +-- scripts/
    echo    +-- public_html/
    echo        +-- index.html
    echo        +-- assets/
    echo        +-- vite.svg
    echo.
    echo    O que fazer:
    echo    1. Verifique se o vite.config.js tem: outDir: '../public_html'
    echo    2. Execute 'npm run build' na pasta frontend
    echo    3. Verifique se os arquivos foram gerados em public_html
    echo.
    popd
    echo.
    echo Pressione qualquer tecla para sair...
    pause >nul
    exit /b 1
)

echo [OK] Validacao de estrutura concluida com sucesso!
echo     Todos os arquivos estao corretos!
echo.

popd

REM ============================================================================
REM ETAPA 4: GIT COMMIT E PUSH
REM ============================================================================
echo ============================================================================
echo ETAPA 4: GIT COMMIT E PUSH
echo ============================================================================
echo.

pushd "%ROOT_DIR%" || (
    echo [ERRO] Nao foi possivel acessar o diretorio raiz!
    echo.
    echo Pressione qualquer tecla para sair...
    pause >nul
    exit /b 1
)

echo [INFO] Adicionando arquivos ao Git...
git add .
set GIT_ADD_ERROR=!errorlevel!

if !GIT_ADD_ERROR! NEQ 0 (
    echo.
    echo [ERRO] Falha ao adicionar arquivos ao Git! ^(codigo: !GIT_ADD_ERROR!^)
    echo.
    popd
    echo.
    echo Pressione qualquer tecla para sair...
    pause >nul
    exit /b 1
)
echo [OK] Arquivos adicionados
echo.

echo [INFO] Fazendo commit...
git commit -m "!COMMIT_MSG!"
set GIT_COMMIT_ERROR=!errorlevel!

if !GIT_COMMIT_ERROR! EQU 0 (
    echo [OK] Commit realizado
) else (
    echo [AVISO] Nenhuma mudanca para commitar ou commit falhou
    echo         Continuando com o push...
)
echo.

echo [INFO] Enviando para o repositorio...
git push
set GIT_PUSH_ERROR=!errorlevel!

if !GIT_PUSH_ERROR! EQU 0 (
    echo.
    echo ============================================================================
    echo [OK] DEPLOY ENVIADO COM SUCESSO!
    echo ============================================================================
    echo.
    echo [PROXIMO PASSO]:
    echo    1. Acesse o painel da Hostinger
    echo    2. Va em Git ou Deploy
    echo    3. Clique em 'Implantar'
    echo.
    popd
    echo Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 0
) else (
    echo.
    echo [ERRO] Falha ao fazer push! ^(codigo: !GIT_PUSH_ERROR!^)
    echo.
    echo Possiveis causas: credenciais, internet ou conflitos.
    echo.
    popd
    echo.
    echo Pressione qualquer tecla para sair...
    pause >nul
    exit /b 1
)

endlocal
