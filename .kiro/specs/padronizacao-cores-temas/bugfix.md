# Bugfix Requirements Document

## Introduction

Este bugfix visa padronizar o sistema de cores e temas da aplicação, corrigindo três problemas principais:

1. **Vazamento de cores entre contextos**: O painel administrativo está sendo afetado pelos temas da loja pública, causando campos de input com cores incorretas (pretos no tema escuro)
2. **Cores fixas em arquivos SCSS**: Alguns arquivos SCSS ainda utilizam cores fixas ou variáveis incorretas que deveriam usar variáveis CSS dinâmicas do sistema de temas
3. **Inconsistência nos temas padrão**: Header e Footer da loja pública não seguem o padrão estabelecido (preto com texto branco) nos temas padrão

O sistema possui 4 temas cadastrados no banco de dados (padrão, escuro, azul, verde) e utiliza CSS Variables injetadas dinamicamente pelo ThemeContext. O problema ocorre quando essas variáveis são aplicadas em contextos onde não deveriam (painel admin) ou quando arquivos SCSS não utilizam as variáveis corretas.

## Bug Analysis

### Current Behavior (Defect)

#### 1. Vazamento de Cores no Painel Administrativo

1.1 WHEN o tema escuro está ativo na loja pública THEN os campos de input no painel de "Aparências" ficam com fundo preto e texto invisível

1.2 WHEN o tema escuro está ativo na loja pública THEN os campos de input na tela "Gerenciar Categorias" ficam com fundo preto

1.3 WHEN o tema escuro está ativo na loja pública THEN os textos dos filtros na tela de "Logs" ficam com cores escuras e baixo contraste

1.4 WHEN o tema escuro está ativo na loja pública THEN os campos de input na tela "Editar Usuário" ficam com fundo preto

1.5 WHEN o tema escuro está ativo na loja pública THEN os campos de input no formulário "Novo Produto" ficam com fundo preto

#### 2. Cores Fixas em Arquivos SCSS

1.6 WHEN arquivos SCSS utilizam cores fixas (ex: `#2c3e50`, `#f5f5f5`) ou variáveis SASS (ex: `$preto`, `$branco`) THEN essas cores não respondem às mudanças de tema

1.7 WHEN arquivos SCSS utilizam `var(--background-dark)` em elementos principais THEN a cor aplicada é incorreta para o contexto (conforme documentado em correções anteriores)

#### 3. Inconsistência nos Temas Padrão da Loja Pública

1.8 WHEN os temas padrão (padrão, escuro, azul, verde) estão ativos THEN o Header da loja pública não está consistentemente preto com texto branco

1.9 WHEN os temas padrão estão ativos THEN o Footer da loja pública não está consistentemente preto com texto branco

1.10 WHEN elementos de destaque (como textos secundários ou efeitos) são renderizados THEN não utilizam consistentemente a cor primária do tema ativo

1.11 WHEN efeitos hover em botões da sidebar ou ícones interativos são acionados no tema azul THEN os efeitos aparecem em vermelho ao invés de azul

1.12 WHEN efeitos hover em botões da sidebar ou ícones interativos são acionados no tema verde THEN os efeitos aparecem em vermelho ao invés de verde

### Expected Behavior (Correct)

#### 1. Isolamento do Painel Administrativo

2.1 WHEN qualquer tema está ativo na loja pública THEN o painel administrativo SHALL manter um tema fixo claro com fundo branco (#ffffff) e campos de input brancos

2.2 WHEN o usuário navega entre diferentes telas do painel admin (Aparências, Categorias, Logs, Usuários, Produtos) THEN todos os campos de input SHALL ter fundo branco (#ffffff) e texto escuro (#333333)

2.3 WHEN o painel administrativo é renderizado THEN SHALL utilizar cores fixas independentes das CSS Variables do sistema de temas da loja

#### 2. Padronização de Cores Dinâmicas em SCSS

2.4 WHEN arquivos SCSS definem estilos para elementos da loja pública THEN SHALL utilizar CSS Variables dinâmicas (ex: `var(--primary-color)`, `var(--background-color)`)

2.5 WHEN elementos principais (headers, modais, cards) são estilizados THEN SHALL usar `var(--background-color)` e `var(--text-primary)` ao invés de `var(--background-dark)` ou cores fixas

2.6 WHEN elementos de destaque ou acentos são estilizados THEN SHALL usar `var(--primary-color)` ou `var(--accent-color)` para responder ao tema ativo

2.7 WHEN botões secundários ou elementos neutros são estilizados THEN PODEM usar cores fixas claras (ex: `#f5f5f5`) se isso melhorar a UX e não causar problemas de contraste

#### 3. Padronização dos Temas Padrão da Loja Pública

2.8 WHEN os temas padrão (padrão, escuro, azul, verde) estão ativos THEN o Header da loja pública SHALL ter fundo preto (#000000 ou #111111) e texto branco (#ffffff)

2.9 WHEN os temas padrão estão ativos THEN o Footer da loja pública SHALL ter fundo preto (#000000 ou #111111) e texto branco (#ffffff)

2.10 WHEN elementos de destaque (textos secundários, efeitos hover, badges) são renderizados THEN SHALL utilizar `var(--primary-color)` para manter consistência com o tema ativo

2.11 WHEN efeitos hover em botões da sidebar ou ícones interativos são acionados THEN SHALL usar `var(--primary-color)` para refletir a cor do tema ativo (vermelho no padrão, azul no tema azul, verde no tema verde)

2.12 WHEN qualquer elemento interativo (links, botões, ícones) recebe hover ou foco THEN SHALL usar `var(--primary-color)` ou `var(--accent-color)` ao invés de cores fixas

### Unchanged Behavior (Regression Prevention)

#### 1. Funcionalidade do Sistema de Temas

3.1 WHEN o usuário altera o tema ativo no painel de Aparências THEN o sistema SHALL CONTINUE TO aplicar as cores dinamicamente na loja pública via CSS Variables

3.2 WHEN o ThemeContext carrega um tema do backend THEN SHALL CONTINUE TO injetar todas as 17 variáveis CSS no `:root` do documento

3.3 WHEN um tema é ativado THEN SHALL CONTINUE TO converter os nomes de campos do banco (snake_case) para CSS Variables (kebab-case)

#### 2. Elementos com Cores Fixas Intencionais

3.4 WHEN botões de tamanho de produto são renderizados THEN SHALL CONTINUE TO usar fundo cinza claro fixo (#f5f5f5) para melhor contraste

3.5 WHEN o botão "Adicionar ao carrinho" é renderizado THEN SHALL CONTINUE TO usar fundo cinza claro fixo (#f5f5f5)

3.6 WHEN controles de quantidade são renderizados THEN SHALL CONTINUE TO usar fundo cinza claro fixo (#f5f5f5)

3.7 WHEN o botão "Limpar filtros" é renderizado THEN SHALL CONTINUE TO usar fundo cinza claro fixo (#f5f5f5)

#### 3. Correções Anteriores

3.8 WHEN o carrinho é aberto THEN o header SHALL CONTINUE TO usar `var(--background-color)` e `var(--text-primary)` (conforme correção anterior)

3.9 WHEN o modal "Minha Conta" é aberto THEN o header SHALL CONTINUE TO usar `var(--primary-color)` com texto branco (conforme correção anterior)

3.10 WHEN elementos já corrigidos são renderizados THEN SHALL CONTINUE TO funcionar corretamente sem regressão

#### 4. Funcionalidades do Painel Admin

3.11 WHEN o usuário gerencia produtos, categorias, usuários ou logs no painel admin THEN todas as funcionalidades SHALL CONTINUE TO operar normalmente

3.12 WHEN o usuário salva alterações no painel de Aparências THEN as mudanças SHALL CONTINUE TO ser persistidas no banco de dados e aplicadas na loja pública

3.13 WHEN usuários com diferentes roles (developer, administrator, seller) acessam o painel admin THEN as permissões e visibilidade de funcionalidades SHALL CONTINUE TO ser respeitadas
