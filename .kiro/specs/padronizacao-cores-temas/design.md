# Padronização de Cores e Temas - Bugfix Design

## Overview

Este bugfix corrige três problemas relacionados ao sistema de cores e temas da aplicação:

1. **Vazamento de cores entre contextos**: O painel administrativo está sendo afetado pelos temas da loja pública, causando campos de input com cores incorretas quando o tema escuro está ativo
2. **Cores fixas em arquivos SCSS**: Alguns arquivos SCSS ainda utilizam cores hardcoded ou variáveis SASS incorretas que deveriam usar CSS Variables dinâmicas
3. **Inconsistência nos temas padrão**: Header e Footer da loja pública não seguem o padrão estabelecido (preto com texto branco) e efeitos hover não usam a cor primária do tema ativo

A estratégia de correção envolve:
- Isolar o painel admin com um wrapper CSS que sobrescreve as CSS Variables com valores fixos
- Substituir cores hardcoded e variáveis SASS por CSS Variables dinâmicas nos arquivos SCSS da loja pública
- Padronizar Header/Footer para usar preto (#111) com texto branco (#fff) em todos os temas padrão
- Substituir efeitos hover fixos por `var(--primary-color)` para refletir o tema ativo

## Glossary

- **Bug_Condition (C)**: A condição que desencadeia o bug - quando CSS Variables do tema da loja pública "vazam" para o painel admin, ou quando cores fixas não respondem a mudanças de tema
- **Property (P)**: O comportamento desejado - painel admin deve ter cores fixas independentes do tema, e elementos da loja pública devem usar CSS Variables dinâmicas
- **Preservation**: Funcionalidades existentes que devem permanecer inalteradas - sistema de temas, ThemeContext, elementos com cores fixas intencionais
- **ThemeContext**: Contexto React em `frontend/src/contexts/ThemeContext.jsx` que carrega temas do backend e injeta CSS Variables no `:root`
- **CSS Variables**: Variáveis CSS dinâmicas (ex: `--primary-color`, `--background-color`) injetadas pelo ThemeContext
- **SASS Variables**: Variáveis SCSS estáticas (ex: `$vermelho-principal`, `$preto`) definidas em `_variables.scss`
- **Painel Admin**: Área administrativa da aplicação acessível em rotas `/admin/*`
- **Loja Pública**: Área pública da aplicação onde os temas são aplicados

## Bug Details

### Fault Condition

O bug manifesta-se em três cenários distintos:

**Cenário 1 - Vazamento de Cores no Painel Admin:**
O bug ocorre quando o tema escuro (ou qualquer tema não-padrão) está ativo na loja pública. As CSS Variables injetadas pelo ThemeContext no `:root` afetam TODOS os elementos da aplicação, incluindo o painel administrativo. Campos de input, textos e outros elementos do admin herdam cores escuras, tornando-os ilegíveis ou visualmente incorretos.

**Cenário 2 - Cores Fixas em SCSS:**
Arquivos SCSS da loja pública utilizam cores hardcoded (ex: `#2c3e50`, `#f5f5f5`) ou variáveis SASS (ex: `$preto`, `$branco`) em vez de CSS Variables dinâmicas. Isso impede que esses elementos respondam às mudanças de tema.

**Cenário 3 - Inconsistência nos Temas Padrão:**
Os temas padrão (padrão, escuro, azul, verde) não mantêm consistência visual no Header e Footer da loja pública. Além disso, efeitos hover em elementos interativos usam cores fixas (vermelho) em vez da cor primária do tema ativo.

**Formal Specification:**
```
FUNCTION isBugCondition(context, element, theme)
  INPUT: 
    context: string (admin | public)
    element: DOMElement
    theme: ThemeObject
  OUTPUT: boolean
  
  // Cenário 1: Vazamento no Admin
  IF context == 'admin' AND element.usesInheritedCSSVariables() THEN
    RETURN true
  END IF
  
  // Cenário 2: Cores Fixas em SCSS
  IF context == 'public' AND element.usesHardcodedColors() THEN
    RETURN true
  END IF
  
  // Cenário 3: Inconsistência nos Temas
  IF context == 'public' AND 
     (element.isHeaderOrFooter() AND NOT element.usesBlackBackground()) OR
     (element.hasHoverEffect() AND NOT element.usesPrimaryColorVariable()) THEN
    RETURN true
  END IF
  
  RETURN false
END FUNCTION
```

### Examples

**Exemplo 1 - Vazamento no Painel Admin:**
- Contexto: Tema escuro ativo na loja pública
- Elemento: Campo de input na tela "Gerenciar Categorias"
- Comportamento Atual: Fundo preto (#1a1d2e) herdado de `--background-color`
- Comportamento Esperado: Fundo branco (#ffffff) fixo

**Exemplo 2 - Cores Fixas em SCSS:**
- Arquivo: `_admin.scss` linha 4
- Código Atual: `background-color: #f4f4f4;`
- Problema: Cor hardcoded que não responde a temas (mas neste caso é intencional para o admin)

**Exemplo 3 - Header Inconsistente:**
- Arquivo: `_header.scss`
- Código Atual: `background-color: $preto;` (variável SASS)
- Problema: Deveria usar `var(--background-dark)` e o banco deveria ter #111 para todos os temas

**Exemplo 4 - Hover Inconsistente:**
- Arquivo: `_sidebar.scss` linha 98
- Código Atual: `&:hover { background: rgba(220, 20, 60, 0.05); color: $vermelho-principal; }`
- Problema: Usa cor fixa vermelha em vez de `var(--primary-color)`

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- O ThemeContext deve continuar carregando temas do backend e injetando CSS Variables no `:root`
- Elementos da loja pública com cores fixas intencionais (botões de tamanho, "Adicionar ao carrinho", controles de quantidade) devem manter suas cores
- Todas as funcionalidades do painel admin (gerenciar produtos, categorias, usuários, logs) devem continuar operando normalmente
- O sistema de permissões por role (developer, administrator, seller) deve continuar funcionando

**Scope:**
Todas as funcionalidades que NÃO envolvem a aplicação visual de cores devem permanecer completamente inalteradas. Isso inclui:
- Lógica de negócio do backend
- Rotas e navegação
- Autenticação e autorização
- Manipulação de dados (CRUD)
- Validações de formulários

## Hypothesized Root Cause

Com base na análise do código e documentação, as causas raiz são:

1. **Escopo Global das CSS Variables**: O ThemeContext injeta CSS Variables no `:root`, que é o elemento raiz do documento HTML. Isso faz com que TODAS as páginas e componentes herdem essas variáveis, incluindo o painel admin. Não existe isolamento de escopo.

2. **Uso de Variáveis SASS em vez de CSS Variables**: Arquivos como `_header.scss` e `_footer.scss` usam variáveis SASS (`$preto`, `$branco`) que são compiladas em tempo de build para valores fixos. Isso impede que respondam a mudanças dinâmicas de tema. Deveriam usar `var(--background-dark)` e `var(--text-white)`.

3. **Cores Hardcoded em Efeitos Hover**: Elementos interativos na sidebar e outros componentes usam cores hardcoded (ex: `rgba(220, 20, 60, 0.05)`) em efeitos hover, em vez de usar `var(--primary-color)`.

4. **Valores Inconsistentes de `background_dark` no Banco**: O campo `background_dark` nos temas padrão do banco de dados não está padronizado como preto (#111) para Header/Footer. Cada tema tem um valor diferente, quando todos deveriam ter preto para manter consistência visual nos Headers/Footers.

## Correctness Properties

Property 1: Fault Condition - Isolamento do Painel Admin

_For any_ elemento renderizado no contexto do painel administrativo (rotas `/admin/*`), o elemento SHALL usar cores fixas independentes das CSS Variables do tema da loja pública, garantindo que campos de input tenham fundo branco (#ffffff) e texto escuro (#333333) independentemente do tema ativo.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Fault Condition - Cores Dinâmicas na Loja Pública

_For any_ elemento da loja pública que deve responder a mudanças de tema, o elemento SHALL usar CSS Variables dinâmicas (ex: `var(--primary-color)`, `var(--background-color)`) em vez de cores hardcoded ou variáveis SASS, permitindo que as cores mudem quando o tema é alterado.

**Validates: Requirements 2.4, 2.5, 2.6, 2.7**

Property 3: Fault Condition - Padronização de Header/Footer

_For any_ tema padrão (padrão, escuro, azul, verde) ativo na loja pública, o Header e Footer SHALL ter fundo preto (#111) e texto branco (#fff), e efeitos hover em elementos interativos SHALL usar `var(--primary-color)` para refletir a cor do tema ativo.

**Validates: Requirements 2.8, 2.9, 2.10, 2.11, 2.12**

Property 4: Preservation - Funcionalidade do Sistema de Temas

_For any_ mudança de tema realizada no painel de Aparências, o sistema SHALL continuar aplicando as cores dinamicamente na loja pública via CSS Variables, mantendo todas as 17 variáveis CSS injetadas no `:root` e convertendo nomes de campos do banco (snake_case) para CSS Variables (kebab-case).

**Validates: Requirements 3.1, 3.2, 3.3**

Property 5: Preservation - Elementos com Cores Fixas Intencionais

_For any_ elemento da loja pública que intencionalmente usa cores fixas para melhor UX (botões de tamanho, "Adicionar ao carrinho", controles de quantidade, "Limpar filtros"), o elemento SHALL continuar usando fundo cinza claro fixo (#f5f5f5) sem ser afetado pelas correções.

**Validates: Requirements 3.4, 3.5, 3.6, 3.7**

## Fix Implementation

### Changes Required

Assumindo que nossa análise de causa raiz está correta, as mudanças necessárias são:

**Arquivo 1**: `frontend/src/assets/_admin.scss`

**Mudança 1.1**: Criar um wrapper CSS para isolar o painel admin
- Adicionar uma classe `.admin-isolated` que sobrescreve todas as CSS Variables com valores fixos
- Aplicar essa classe no componente raiz do painel admin
- Garantir que todos os elementos admin herdem cores fixas

```scss
// Adicionar no início do arquivo _admin.scss
.admin-isolated {
    // Sobrescrever CSS Variables com valores fixos para o admin
    --background-color: #ffffff !important;
    --background-secondary: #f4f4f4 !important;
    --background-dark: #2c3e50 !important;
    --text-primary: #333333 !important;
    --text-secondary: #666666 !important;
    --text-light: #999999 !important;
    --border-color: #ddd !important;
    --border-light: #eee !important;
    
    // Garantir que inputs sempre tenham fundo branco
    input, textarea, select {
        background-color: #ffffff !important;
        color: #333333 !important;
        border-color: #ddd !important;
    }
}
```

**Arquivo 2**: `frontend/src/components/admin/AdminPanel.jsx` (ou componente raiz do admin)

**Mudança 2.1**: Aplicar a classe de isolamento
- Adicionar `className="admin-isolated"` no elemento raiz do painel admin

**Arquivo 3**: `frontend/src/assets/_header.scss`

**Mudança 3.1**: Usar variáveis CSS dinâmicas no Header
- Substituir `background-color: $preto;` por `background-color: var(--background-dark);`
- Usar `color: var(--text-white);` para o texto
- Manter a estrutura existente
- As cores virão do banco de dados através do ThemeContext

**Arquivo 4**: `frontend/src/assets/_footer.scss`

**Mudança 4.1**: Usar variáveis CSS dinâmicas no Footer
- Substituir `background: linear-gradient(180deg, #0a0a0a 0%, $preto 100%);` por `background: var(--background-dark);`
- Usar `color: var(--text-white);` para o texto
- Manter a estrutura existente
- As cores virão do banco de dados através do ThemeContext

**Arquivo 5**: `frontend/src/assets/_sidebar.scss`

**Mudança 5.1**: Substituir cores fixas por CSS Variables
- Linha 98: Substituir `rgba(220, 20, 60, 0.05)` por `rgba(var(--primary-color-rgb), 0.05)`
- Linha 99: Substituir `$vermelho-principal` por `var(--primary-color)`
- Linha 103: Substituir `$vermelho-principal` por `var(--primary-color)`
- Linha 107: Substituir `$vermelho-principal` por `var(--primary-color)`
- Linha 147: Substituir `$vermelho-principal` por `var(--primary-color)`
- Linha 195: Substituir `$vermelho-principal` por `var(--primary-color)`
- Linha 203: Substituir `$vermelho-principal` por `var(--primary-color)`
- Linha 217: Substituir `$vermelho-principal` por `var(--primary-color)`
- Linha 226: Substituir `$vermelho-principal` por `var(--primary-color)`

**Mudança 5.2**: Garantir que accent-color use a variável dinâmica
- Linha 100: Substituir `accent-color: $vermelho-principal;` por `accent-color: var(--primary-color);`

**Arquivo 6**: `frontend/src/contexts/ThemeContext.jsx`

**Mudança 6.1**: Adicionar versão RGB da cor primária
- O ThemeContext já cria versões RGB para cores, mas precisamos garantir que `--primary-color-rgb` esteja disponível
- Verificar se a conversão hexToRgb está funcionando corretamente

**Arquivo 7**: Banco de Dados (SQL)

**Mudança 7.1**: Padronizar valores de `background_dark` nos temas padrão
- Executar UPDATE para garantir que todos os temas padrão tenham `background_dark` como preto (#111 ou #000000)
- Isso fará com que Header/Footer fiquem pretos em todos os temas quando usarem `var(--background-dark)`
- Atualizar os 4 temas: padrão, escuro, azul, verde

```sql
UPDATE appearance_settings
SET background_dark = '#111111'
WHERE theme_name IN ('padrao', 'escuro', 'azul', 'verde');
```

## Testing Strategy

### Validation Approach

A estratégia de testes segue uma abordagem de três fases: primeiro, demonstrar o bug no código não corrigido; segundo, aplicar as correções e verificar que o bug foi resolvido; terceiro, garantir que nenhuma funcionalidade existente foi quebrada (preservation checking).

### Exploratory Fault Condition Checking

**Goal**: Demonstrar o bug ANTES de implementar a correção. Confirmar ou refutar a análise de causa raiz. Se refutarmos, precisaremos re-hipotizar.

**Test Plan**: 
1. Ativar o tema escuro no painel de Aparências
2. Navegar para diferentes telas do painel admin (Aparências, Categorias, Logs, Usuários, Produtos)
3. Observar e documentar as cores dos campos de input e textos
4. Inspecionar o DevTools para verificar quais CSS Variables estão sendo aplicadas
5. Verificar se elementos da loja pública usam cores hardcoded
6. Verificar se efeitos hover usam cores fixas em vez de `var(--primary-color)`

**Test Cases**:
1. **Vazamento no Admin - Tema Escuro**: Ativar tema escuro, acessar "Gerenciar Categorias", verificar cor dos inputs (esperado: preto, incorreto)
2. **Vazamento no Admin - Tema Azul**: Ativar tema azul, acessar "Editar Usuário", verificar cor dos inputs (esperado: pode ter problemas)
3. **Cores Fixas em Header**: Verificar se Header usa variável SASS `$preto` em vez de cor fixa (esperado: sim, incorreto)
4. **Hover Inconsistente**: Ativar tema azul, passar mouse sobre item da sidebar, verificar se hover é vermelho (esperado: sim, incorreto)

**Expected Counterexamples**:
- Campos de input no admin com fundo preto quando tema escuro está ativo
- Header da loja pública usando variável SASS que não muda com o tema
- Efeitos hover em vermelho mesmo quando tema azul ou verde está ativo
- Possíveis causas: escopo global de CSS Variables, uso de variáveis SASS, cores hardcoded

### Fix Checking

**Goal**: Verificar que para todos os inputs onde a condição de bug se aplica, a função corrigida produz o comportamento esperado.

**Pseudocode:**
```
FOR ALL context IN ['admin', 'public'] DO
  FOR ALL theme IN ['default', 'dark', 'blue', 'green'] DO
    applyTheme(theme)
    
    IF context == 'admin' THEN
      FOR ALL adminScreen IN ['categories', 'users', 'products', 'logs', 'appearance'] DO
        navigateTo(adminScreen)
        FOR ALL inputField IN getInputFields() DO
          ASSERT inputField.backgroundColor == '#ffffff'
          ASSERT inputField.color == '#333333'
        END FOR
      END FOR
    END IF
    
    IF context == 'public' THEN
      ASSERT header.backgroundColor == '#111'
      ASSERT footer.backgroundColor == '#111'
      
      FOR ALL interactiveElement IN getInteractiveElements() DO
        hoverElement(interactiveElement)
        ASSERT interactiveElement.hoverColor == theme.primaryColor
      END FOR
    END IF
  END FOR
END FOR
```

### Preservation Checking

**Goal**: Verificar que para todos os inputs onde a condição de bug NÃO se aplica, a função corrigida produz o mesmo resultado que a função original.

**Pseudocode:**
```
FOR ALL theme IN ['default', 'dark', 'blue', 'green'] DO
  applyTheme(theme)
  
  // Verificar que ThemeContext ainda funciona
  ASSERT cssVariablesInjected() == true
  ASSERT countCSSVariables() == 17
  
  // Verificar elementos com cores fixas intencionais
  FOR ALL intentionalFixedElement IN ['size-button', 'add-to-cart', 'qty-control'] DO
    ASSERT intentionalFixedElement.backgroundColor == '#f5f5f5'
  END FOR
  
  // Verificar funcionalidades do admin
  FOR ALL adminFunction IN ['createProduct', 'editCategory', 'manageUsers'] DO
    ASSERT adminFunction.works() == true
  END FOR
  
  // Verificar que elementos da loja pública respondem a temas
  FOR ALL publicElement IN getPublicElements() DO
    IF publicElement.shouldUseDynamicColors() THEN
      ASSERT publicElement.usesCSSVariables() == true
    END IF
  END FOR
END FOR
```

**Testing Approach**: Property-based testing é recomendado para preservation checking porque:
- Gera muitos casos de teste automaticamente através de diferentes temas e contextos
- Captura edge cases que testes manuais podem perder (ex: temas customizados, cores inválidas)
- Fornece garantias fortes de que o comportamento não mudou para inputs não-buggy

**Test Plan**: 
1. Observar comportamento no código NÃO CORRIGIDO primeiro para elementos que devem ser preservados
2. Escrever testes baseados em propriedades capturando esse comportamento
3. Executar testes no código CORRIGIDO
4. Verificar que todos os testes passam

**Test Cases**:
1. **Preservação do ThemeContext**: Verificar que mudanças de tema no painel de Aparências ainda aplicam cores na loja pública
2. **Preservação de Cores Fixas Intencionais**: Verificar que botões de tamanho, "Adicionar ao carrinho", etc. mantêm fundo cinza claro
3. **Preservação de Funcionalidades Admin**: Verificar que CRUD de produtos, categorias, usuários funciona normalmente
4. **Preservação de Permissões**: Verificar que roles (developer, administrator, seller) ainda controlam visibilidade de funcionalidades

### Unit Tests

- Testar isolamento do admin: aplicar classe `.admin-isolated` e verificar que CSS Variables são sobrescritas
- Testar que Header/Footer usam cores fixas pretas em todos os temas
- Testar que efeitos hover usam `var(--primary-color)` em vez de cores fixas
- Testar edge cases: tema customizado, cores inválidas, ausência de tema

### Property-Based Tests

- Gerar temas aleatórios e verificar que painel admin sempre tem cores fixas
- Gerar sequências aleatórias de mudanças de tema e verificar que loja pública responde corretamente
- Gerar inputs aleatórios no admin e verificar que sempre têm fundo branco
- Testar que elementos com cores fixas intencionais nunca mudam independentemente do tema

### Integration Tests

- Testar fluxo completo: ativar tema escuro → acessar admin → verificar cores → voltar para loja → verificar cores
- Testar mudança de tema enquanto admin está aberto em outra aba
- Testar que salvamento de tema no painel de Aparências persiste no banco e aplica na loja
- Testar que diferentes roles veem as cores corretas no admin
