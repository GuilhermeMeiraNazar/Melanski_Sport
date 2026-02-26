# Implementation Plan: Hostinger Deploy Configuration

## Overview

Este plano implementa um sistema automatizado de deploy que builda o frontend e copia os arquivos para o diretório público correto, detectando automaticamente o ambiente de execução (local vs Hostinger). A implementação usa apenas módulos built-in do Node.js para máxima compatibilidade cross-platform.

## Tasks

- [ ] 1. Criar estrutura base do script de deploy
  - Criar arquivo `backend/scripts/deploy.js`
  - Implementar configuração de paths (CONFIG object)
  - Implementar funções utilitárias (log, directoryExists, fileExists)
  - _Requirements: 3.3, 7.1_

- [ ] 2. Implementar detecção de ambiente
  - [ ] 2.1 Implementar função detectEnvironment()
    - Verificar existência de ./public (indicador Hostinger)
    - Verificar existência de ../public_html (indicador local)
    - Verificar variável NODE_ENV
    - Retornar 'local' ou 'hostinger'
    - _Requirements: 7.4, 7.5_
  
  - [ ]* 2.2 Escrever teste de propriedade para detecção de ambiente
    - **Property 15: Environment Detection Accuracy**
    - **Valida: Requirements 7.4**
  
  - [ ] 2.3 Implementar função resolvePublicPath()
    - Receber ambiente detectado como parâmetro
    - Retornar ../public_html para local
    - Retornar ./public para Hostinger
    - _Requirements: 7.2, 7.3_
  
  - [ ]* 2.4 Escrever teste de propriedade para seleção de paths
    - **Property 14: Environment-Based Path Selection**
    - **Valida: Requirements 7.2, 7.3, 7.5**

- [ ] 3. Implementar orquestração de build
  - [ ] 3.1 Implementar função buildFrontend()
    - Verificar se diretório frontend existe
    - Executar npm install no frontend usando execSync
    - Executar npm run build no frontend usando execSync
    - Capturar e logar output do build
    - Lançar erro se build falhar
    - _Requirements: 1.1, 1.2, 6.1_
  
  - [ ]* 3.2 Escrever testes unitários para buildFrontend()
    - Testar erro quando diretório frontend não existe
    - Testar erro quando npm build falha
    - Testar sucesso quando build completa
    - _Requirements: 1.1, 6.3_
  
  - [ ] 3.3 Implementar função verifyBuild()
    - Verificar se diretório dist existe
    - Verificar se dist não está vazio
    - Verificar se index.html existe
    - Retornar boolean indicando sucesso
    - Logar resultados da verificação
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ]* 3.4 Escrever teste de propriedade para verificação de build
    - **Property 8: Index.html Verification**
    - **Valida: Requirements 4.1**
  
  - [ ]* 3.5 Escrever testes unitários para verifyBuild()
    - Testar retorno false quando dist não existe
    - Testar retorno false quando dist está vazio
    - Testar retorno false quando index.html não existe
    - Testar retorno true quando build é válido
    - _Requirements: 4.1, 4.2, 4.3_

- [ ] 4. Checkpoint - Verificar funções de build e detecção
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implementar operações de arquivo
  - [ ] 5.1 Implementar função cleanDirectory()
    - Verificar se diretório existe
    - Ler conteúdo do diretório
    - Remover recursivamente todos os arquivos e subdiretórios
    - Manter o diretório raiz (limpar apenas conteúdo)
    - Logar progresso da limpeza
    - _Requirements: 8.2, 8.3_
  
  - [ ]* 5.2 Escrever testes unitários para cleanDirectory()
    - Testar limpeza de diretório com arquivos
    - Testar limpeza de diretório com subdiretórios
    - Testar comportamento quando diretório não existe
    - _Requirements: 8.2_
  
  - [ ] 5.3 Implementar função copyRecursive()
    - Criar diretório target se não existir
    - Ler conteúdo do diretório source
    - Para cada item: copiar arquivo ou recursivamente copiar subdiretório
    - Preservar permissões de arquivo usando fs.chmodSync
    - Logar progresso da cópia
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 6.2_
  
  - [ ]* 5.4 Escrever teste de propriedade para preservação de permissões
    - **Property 5: File Permission Preservation**
    - **Valida: Requirements 2.2**
  
  - [ ]* 5.5 Escrever teste de propriedade para cópia recursiva
    - **Property 7: Recursive Directory Copy**
    - **Valida: Requirements 2.5**
  
  - [ ]* 5.6 Escrever testes unitários para copyRecursive()
    - Testar cópia de arquivo único
    - Testar cópia de estrutura de diretórios aninhados
    - Testar sobrescrita de arquivos existentes
    - Testar criação de diretório target
    - _Requirements: 2.1, 2.3, 2.4, 2.5_

- [ ] 6. Implementar função main e tratamento de erros
  - [ ] 6.1 Implementar função main()
    - Logar início do processo de deploy
    - Chamar detectEnvironment()
    - Chamar resolvePublicPath()
    - Chamar buildFrontend()
    - Chamar verifyBuild() e verificar resultado
    - Chamar cleanDirectory()
    - Chamar copyRecursive()
    - Logar sucesso e exit(0)
    - _Requirements: 1.1, 1.2, 2.1, 6.5_
  
  - [ ] 6.2 Implementar tratamento de erros em main()
    - Envolver todas as operações em try-catch
    - Logar erros para stderr com contexto
    - Logar stack trace se disponível
    - Exit com código 1 em caso de erro
    - _Requirements: 1.3, 6.1, 6.2, 6.4_
  
  - [ ]* 6.3 Escrever teste de propriedade para códigos de saída
    - **Property 12: Exit Code Correctness**
    - **Valida: Requirements 6.4, 6.5**
  
  - [ ]* 6.4 Escrever testes unitários para tratamento de erros
    - Testar exit code 1 quando build falha
    - Testar exit code 1 quando verificação falha
    - Testar exit code 1 quando cópia falha
    - Testar exit code 0 quando tudo sucede
    - _Requirements: 1.3, 6.4, 6.5_

- [ ] 7. Checkpoint - Verificar script completo
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Integrar com package.json
  - [ ] 8.1 Modificar backend/package.json
    - Adicionar script "postinstall": "node scripts/deploy.js"
    - Verificar que o path é relativo ao backend
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [ ]* 8.2 Escrever teste de integração para postinstall hook
    - Verificar que postinstall existe em package.json
    - Verificar que path do script está correto
    - Testar execução via npm install
    - _Requirements: 5.1, 5.2_

- [ ] 9. Implementar testes de propriedades principais
  - [ ]* 9.1 Escrever teste de propriedade para idempotência
    - **Property 16: Deployment Idempotence**
    - **Valida: Requirements 8.1, 8.4**
    - Executar deploy duas vezes com mesmo input
    - Verificar que estado final é idêntico
  
  - [ ]* 9.2 Escrever teste de propriedade para build automático
    - **Property 1: Automatic Frontend Build on Install**
    - **Valida: Requirements 1.1**
    - Executar npm install
    - Verificar que dist foi criado
  
  - [ ]* 9.3 Escrever teste de propriedade para cópia completa
    - **Property 4: Complete Asset Copy**
    - **Valida: Requirements 2.1**
    - Gerar conjunto aleatório de arquivos
    - Verificar que todos foram copiados
  
  - [ ]* 9.4 Escrever teste de propriedade para logging de erros
    - **Property 10: Build Error Logging**
    - **Valida: Requirements 6.1**
    - Simular erro de build
    - Verificar que erro foi logado em stderr

- [ ] 10. Configurar ambiente de testes
  - [ ] 10.1 Instalar fast-check como dev dependency
    - Executar: npm install --save-dev fast-check
    - _Requirements: Testing Strategy_
  
  - [ ] 10.2 Criar estrutura de diretórios de teste
    - Criar `backend/tests/unit/`
    - Criar `backend/tests/property/`
    - Criar `backend/tests/helpers/` para funções auxiliares
  
  - [ ] 10.3 Configurar Jest para property-based testing
    - Adicionar configuração de timeout para property tests (5000ms)
    - Configurar coverage thresholds
    - Adicionar scripts de teste em package.json

- [ ] 11. Testes locais e validação
  - [ ] 11.1 Testar em ambiente Windows local
    - Executar npm install no backend
    - Verificar que frontend foi buildado
    - Verificar que arquivos foram copiados para ../public_html
    - Verificar logs de sucesso
    - _Requirements: 3.2, 7.3_
  
  - [ ] 11.2 Testar em ambiente Linux local (se disponível)
    - Executar npm install no backend
    - Verificar que frontend foi buildado
    - Verificar que arquivos foram copiados para ../public_html
    - Verificar logs de sucesso
    - _Requirements: 3.1, 7.3_
  
  - [ ] 11.3 Simular ambiente Hostinger localmente
    - Criar diretório ./public no backend
    - Remover ../public_html temporariamente
    - Executar npm install
    - Verificar que arquivos foram copiados para ./public
    - Restaurar estrutura original
    - _Requirements: 7.2, 7.5_

- [ ] 12. Checkpoint final - Validação completa
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Documentação e deploy na Hostinger
  - [ ] 13.1 Criar documentação de troubleshooting
    - Documentar erro "Frontend directory not found"
    - Documentar erro "index.html not found"
    - Documentar erro "Permission denied"
    - Documentar como verificar detecção de ambiente
  
  - [ ] 13.2 Testar deploy real na Hostinger
    - Fazer push do código para repositório
    - SSH na Hostinger
    - Executar npm install no backend
    - Verificar que arquivos foram copiados para ./public
    - Verificar que aplicação está acessível
    - _Requirements: 7.2, 7.5_
  
  - [ ] 13.3 Atualizar README com instruções de deploy
    - Documentar processo de deploy local
    - Documentar processo de deploy na Hostinger
    - Adicionar seção de troubleshooting
    - Incluir exemplos de logs esperados

## Notes

- Tasks marcadas com `*` são opcionais e podem ser puladas para MVP mais rápido
- Cada task referencia requisitos específicos para rastreabilidade
- Checkpoints garantem validação incremental
- Property tests validam propriedades universais de corretude
- Unit tests validam exemplos específicos e casos extremos
- O script usa apenas módulos built-in do Node.js (fs, path, child_process)
- Todas as operações de arquivo são síncronas para simplicidade e confiabilidade
- A detecção de ambiente é automática, sem necessidade de configuração manual
