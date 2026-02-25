# Bugfix Requirements Document

## Introduction

O site está retornando erro 503 na Hostinger devido à estrutura de arquivos incorreta no servidor. Arquivos de build do frontend (index.html, assets/, vite.svg) estão localizados na raiz do servidor ao invés de estarem exclusivamente dentro da pasta `public_html`, que é o único diretório público servido pelo servidor web da Hostinger. Esta estrutura incorreta impede que o servidor encontre os arquivos necessários, resultando no erro 503.

O impacto é crítico: o site fica completamente inacessível para os usuários finais.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN o deploy é realizado para a Hostinger THEN arquivos de build (index.html, assets/, vite.svg) ficam localizados na raiz do servidor ao invés de dentro de public_html

1.2 WHEN o servidor web da Hostinger tenta servir o site THEN retorna erro 503 porque não encontra os arquivos corretos em public_html

1.3 WHEN a estrutura de arquivos é verificada no servidor THEN existe uma mistura de código-fonte e arquivos compilados no mesmo nível hierárquico

1.4 WHEN usuários tentam acessar o site THEN recebem erro 503 (Service Unavailable) porque public_html está vazio ou com estrutura incorreta

### Expected Behavior (Correct)

2.1 WHEN o deploy é realizado para a Hostinger THEN todos os arquivos de build (index.html, assets/, vite.svg) SHALL estar localizados exclusivamente dentro da pasta public_html

2.2 WHEN o servidor web da Hostinger tenta servir o site THEN SHALL encontrar e servir corretamente os arquivos de public_html sem retornar erro 503

2.3 WHEN a estrutura de arquivos é verificada no servidor THEN SHALL existir separação clara: código-fonte (backend/, frontend/) na raiz e arquivos compilados apenas em public_html

2.4 WHEN usuários tentam acessar o site THEN SHALL receber o site funcionando corretamente sem erros 503

2.5 WHEN o processo de deploy é executado THEN SHALL limpar automaticamente arquivos incorretos da raiz e garantir que apenas public_html contenha o resultado do build

### Unchanged Behavior (Regression Prevention)

3.1 WHEN o build do frontend é executado localmente THEN o sistema SHALL CONTINUE TO gerar os arquivos compilados na pasta public_html conforme configurado no vite.config.js

3.2 WHEN o commit e push são realizados THEN o sistema SHALL CONTINUE TO enviar as alterações para o repositório Git

3.3 WHEN arquivos de código-fonte (backend/, frontend/) são modificados THEN o sistema SHALL CONTINUE TO mantê-los na raiz do projeto, fora de public_html

3.4 WHEN variáveis de ambiente (.env) são utilizadas THEN o sistema SHALL CONTINUE TO mantê-las na raiz do projeto, não em public_html

3.5 WHEN dependências (node_modules/) são instaladas THEN o sistema SHALL CONTINUE TO mantê-las na raiz do projeto, não em public_html
