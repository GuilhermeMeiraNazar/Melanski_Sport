# Hostinger Deploy Structure Fix - Bugfix Design

## Overview

O bug ocorre porque o processo de deploy atual não garante que os arquivos de build fiquem exclusivamente em `public_html`. A Hostinger serve apenas o conteúdo de `public_html`, mas arquivos estão sendo colocados na raiz do servidor, causando erro 503. A estratégia de correção envolve: (1) modificar o script de deploy para validar a estrutura antes do push, (2) adicionar limpeza automática de arquivos incorretos na raiz, (3) garantir que o vite.config.js está correto, e (4) documentar o processo correto de deploy.

## Glossary

- **Bug_Condition (C)**: A condição que dispara o bug - quando arquivos de build (index.html, assets/, vite.svg) estão na raiz do servidor ao invés de exclusivamente em public_html
- **Property (P)**: O comportamento desejado - todos os arquivos de build devem estar apenas em public_html, e o servidor deve servir o site sem erro 503
- **Preservation**: Comportamentos existentes que devem permanecer inalterados - build local, commit/push Git, estrutura de código-fonte
- **public_html**: Diretório público da Hostinger que é servido pelo servidor web (único local visível publicamente)
- **deploy.bat**: Script de deploy localizado em `scripts/deploy.bat` que automatiza build, commit e push
- **vite.config.js**: Arquivo de configuração do Vite que define onde os arquivos de build são gerados
- **Estrutura de Deploy**: Organização de arquivos no servidor onde código-fonte fica na raiz e arquivos compilados ficam em public_html

## Bug Details

### Fault Condition

O bug se manifesta quando o processo de deploy é executado e os arquivos de build não ficam exclusivamente em `public_html`. O script `deploy.bat` está fazendo o build corretamente (vite.config.js aponta para `../public_html`), mas não valida se a estrutura está correta antes do push, e não limpa arquivos incorretos que possam ter sido colocados na raiz manualmente ou por processos anteriores.

**Formal Specification:**
```
FUNCTION isBugCondition(deployState)
  INPUT: deployState of type DeployState {
    buildFiles: string[],  // arquivos gerados pelo build
    rootFiles: string[],   // arquivos na raiz do servidor
    publicHtmlFiles: string[]  // arquivos em public_html
  }
  OUTPUT: boolean
  
  buildArtifacts := ['index.html', 'assets/', 'vite.svg']
  
  RETURN (EXISTS artifact IN buildArtifacts WHERE artifact IN deployState.rootFiles)
         OR (NOT ALL artifact IN buildArtifacts ARE IN deployState.publicHtmlFiles)
         OR (deployState.publicHtmlFiles IS EMPTY)
END FUNCTION
```

### Examples

- **Exemplo 1**: Após executar `scripts\deploy.bat`, o arquivo `index.html` existe tanto na raiz quanto em `public_html` → Bug presente, servidor retorna 503
- **Exemplo 2**: Após deploy, `public_html` contém `index.html` e `assets/`, mas a raiz também contém `index.html` → Bug presente, estrutura incorreta
- **Exemplo 3**: Após deploy, apenas `public_html` contém `index.html`, `assets/` e `vite.svg`, e a raiz contém apenas `backend/`, `frontend/`, `.env` → Comportamento correto
- **Edge Case**: Deploy executado com `public_html` vazio ou inexistente → Bug presente, erro 503 garantido

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- O build do frontend deve continuar gerando arquivos na pasta `public_html` conforme configurado no `vite.config.js`
- O processo de commit e push Git deve continuar funcionando normalmente
- Arquivos de código-fonte (`backend/`, `frontend/`, `scripts/`) devem permanecer na raiz do projeto

**Scope:**
Todos os processos que NÃO envolvem a estrutura de deploy (localização dos arquivos de build) devem permanecer completamente inalterados. Isso inclui:
- Processo de build local do Vite
- Comandos Git (add, commit, push)
- Estrutura de código-fonte e dependências
- Configurações de ambiente (.env)
- Instalação de dependências (node_modules)

## Hypothesized Root Cause

Baseado na descrição do bug e análise dos arquivos, as causas mais prováveis são:

1. **Falta de Validação no Script de Deploy**: O `deploy.bat` não verifica se a estrutura está correta antes de fazer push
   - Não valida se `public_html` contém os arquivos necessários
   - Não verifica se arquivos de build estão incorretamente na raiz
   - Não impede o push se a estrutura estiver errada

2. **Ausência de Limpeza Automática**: O script não remove arquivos de build que possam estar na raiz
   - Arquivos podem ter sido copiados manualmente para a raiz em tentativas anteriores
   - Não há processo de limpeza antes do build

3. **Falta de Documentação Clara**: Processo correto de deploy não está documentado
   - Desenvolvedores podem não saber que apenas `public_html` deve conter arquivos de build
   - Não há checklist de validação pós-deploy

4. **Configuração da Hostinger**: Possível desconhecimento de que a Hostinger serve apenas `public_html`
   - Desenvolvedores podem assumir que a raiz é servida
   - Falta de validação específica para estrutura da Hostinger

## Correctness Properties

Property 1: Fault Condition - Deploy Structure Validation

_For any_ deploy execution where the build process completes successfully, the fixed deploy script SHALL ensure that all build artifacts (index.html, assets/, vite.svg) exist exclusively in public_html and NOT in the server root, and SHALL prevent the push if this condition is not met, eliminating the 503 error.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

Property 2: Preservation - Existing Build and Git Workflow

_For any_ deploy execution that does NOT involve the file structure validation (the actual build process, Git operations, source code organization), the fixed script SHALL produce exactly the same behavior as the original script, preserving the build output location, Git commit/push functionality, and source code structure.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

Assumindo que nossa análise de causa raiz está correta:

**File**: `scripts/deploy.bat`

**Function**: Script completo de deploy

**Specific Changes**:

1. **Adicionar Validação de Estrutura Pré-Push**:
   - Após o build, verificar se `public_html/index.html` existe
   - Verificar se `public_html/assets/` existe
   - Verificar se arquivos de build NÃO estão na raiz
   - Abortar o push se a validação falhar

2. **Adicionar Limpeza Automática**:
   - Antes do build, remover `index.html`, `assets/`, `vite.svg` da raiz se existirem
   - Garantir que `public_html` está limpo antes do novo build (já feito pelo `emptyOutDir: true`)

3. **Adicionar Mensagens Informativas**:
   - Exibir status da validação de estrutura
   - Mostrar quais arquivos foram encontrados em cada local
   - Dar feedback claro se algo estiver errado

4. **Adicionar Validação Pós-Build**:
   - Confirmar que o build gerou os arquivos esperados em `public_html`
   - Listar arquivos gerados para verificação visual

5. **Documentar Processo no Script**:
   - Adicionar comentários explicando cada etapa
   - Incluir instruções sobre o que fazer se a validação falhar

**File**: `frontend/vite.config.js`

**Status**: Já está correto com `outDir: '../public_html'` e `emptyOutDir: true`. Nenhuma mudança necessária.

**File**: `.kiro/specs/hostinger-deploy-structure-fix/DEPLOY_CHECKLIST.md` (novo)

**Purpose**: Documentar o processo correto de deploy para a Hostinger

**Content**:
- Checklist pré-deploy
- Estrutura esperada de arquivos
- Como validar manualmente no painel da Hostinger
- Troubleshooting comum

## Testing Strategy

### Validation Approach

A estratégia de testes segue uma abordagem em duas fases: primeiro, demonstrar o bug no código não corrigido executando o deploy e verificando a estrutura incorreta, depois verificar que a correção funciona e preserva comportamentos existentes.

### Exploratory Fault Condition Checking

**Goal**: Demonstrar o bug ANTES de implementar a correção. Confirmar ou refutar a análise de causa raiz. Se refutarmos, precisaremos re-hipotizar.

**Test Plan**: Executar o script de deploy atual (`deploy.bat`) em um ambiente de teste e verificar a estrutura de arquivos resultante. Simular cenários onde arquivos estão incorretamente na raiz. Executar no código NÃO CORRIGIDO para observar falhas.

**Test Cases**:
1. **Deploy Normal Test**: Executar `deploy.bat` e verificar se arquivos ficam apenas em `public_html` (pode falhar se houver arquivos antigos na raiz)
2. **Root Contamination Test**: Colocar manualmente `index.html` na raiz, executar deploy, verificar se o script detecta e corrige (falhará no código não corrigido)
3. **Empty public_html Test**: Deletar `public_html`, executar deploy, verificar se o script detecta o problema (falhará no código não corrigido)
4. **Validation Test**: Executar deploy com estrutura incorreta e verificar se o push é bloqueado (falhará no código não corrigido - push acontece mesmo com estrutura errada)

**Expected Counterexamples**:
- Script não detecta arquivos de build na raiz e faz push mesmo assim
- Script não valida se `public_html` contém os arquivos necessários
- Possíveis causas: falta de validação, falta de limpeza automática, falta de verificação pré-push

### Fix Checking

**Goal**: Verificar que para todas as execuções de deploy onde a condição de bug poderia ocorrer, o script corrigido produz o comportamento esperado.

**Pseudocode:**
```
FOR ALL deployState WHERE isBugCondition(deployState) COULD OCCUR DO
  result := deploy_bat_fixed(deployState)
  ASSERT allBuildArtifactsInPublicHtml(result)
  ASSERT noBuildArtifactsInRoot(result)
  ASSERT pushOnlyIfStructureValid(result)
END FOR
```

### Preservation Checking

**Goal**: Verificar que para todas as operações que NÃO envolvem validação de estrutura, o script corrigido produz o mesmo resultado que o script original.

**Pseudocode:**
```
FOR ALL operation WHERE NOT isStructureValidation(operation) DO
  ASSERT deploy_bat_original(operation) = deploy_bat_fixed(operation)
END FOR
```

**Testing Approach**: Property-based testing é recomendado para preservation checking porque:
- Gera muitos casos de teste automaticamente através do domínio de entrada
- Captura edge cases que testes unitários manuais podem perder
- Fornece garantias fortes de que o comportamento permanece inalterado para todas as operações não relacionadas à estrutura

**Test Plan**: Observar comportamento no código NÃO CORRIGIDO primeiro para build, commit e push, depois escrever testes baseados em propriedades capturando esse comportamento.

**Test Cases**:
1. **Build Preservation**: Observar que `npm run build` gera arquivos em `public_html` no código não corrigido, depois verificar que continua igual após correção
2. **Git Operations Preservation**: Observar que `git add`, `git commit`, `git push` funcionam corretamente no código não corrigido, depois verificar que continuam iguais após correção
3. **Source Structure Preservation**: Observar que `backend/`, `frontend/`, `.env` permanecem na raiz no código não corrigido, depois verificar que continuam iguais após correção
4. **Build Output Preservation**: Observar que o conteúdo gerado em `public_html` é idêntico antes e depois da correção

### Unit Tests

- Testar validação de estrutura com diferentes configurações de arquivos
- Testar limpeza automática de arquivos na raiz
- Testar detecção de `public_html` vazio ou ausente
- Testar bloqueio de push quando estrutura está incorreta
- Testar mensagens de erro e feedback ao usuário

### Property-Based Tests

- Gerar estados aleatórios de estrutura de arquivos e verificar que a validação funciona corretamente
- Gerar diferentes combinações de arquivos na raiz e em `public_html` e verificar que a limpeza funciona
- Testar que operações Git preservam comportamento através de muitos cenários
- Testar que o build sempre gera saída em `public_html` independente do estado inicial

### Integration Tests

- Testar fluxo completo de deploy: limpeza → build → validação → commit → push
- Testar deploy em ambiente limpo (primeira vez)
- Testar deploy com estrutura já existente (deploy subsequente)
- Testar recuperação de erro quando validação falha
- Testar que o site funciona corretamente na Hostinger após deploy bem-sucedido
