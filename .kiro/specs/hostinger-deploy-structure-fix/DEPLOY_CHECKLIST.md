# Checklist de Deploy para Hostinger

## Pré-Deploy

### 1. Verificar Configuração do Vite
- [ ] Abrir `frontend/vite.config.js`
- [ ] Confirmar que `outDir: '../public_html'` está configurado
- [ ] Confirmar que `emptyOutDir: true` está configurado

### 2. Verificar Estrutura Local
- [ ] Pasta `public_html` existe na raiz do projeto
- [ ] Pasta `public_html` está vazia ou contém apenas build anterior
- [ ] Não existem arquivos `index.html`, `assets/`, `vite.svg` na raiz do projeto

### 3. Testar Build Local
```bash
cd frontend
npm run build
```
- [ ] Build executado com sucesso
- [ ] Arquivos gerados em `public_html/`:
  - [ ] `index.html`
  - [ ] `assets/` (pasta com arquivos CSS e JS)
  - [ ] `vite.svg`

## Durante o Deploy

### 4. Executar Script de Deploy
```bash
# Da raiz do projeto:
scripts\deploy.bat "mensagem do commit"

# Ou da pasta scripts:
cd scripts
deploy.bat "mensagem do commit"
```

### 5. Validações Automáticas do Script
O script executará automaticamente:
- [ ] **ETAPA 1**: Limpeza da raiz (remove arquivos incorretos)
- [ ] **ETAPA 2**: Build do frontend
- [ ] **ETAPA 3**: Validação da estrutura
  - Verifica se `public_html/index.html` existe
  - Verifica se `public_html/assets/` existe
  - Verifica se arquivos NÃO estão na raiz
- [ ] **ETAPA 4**: Git commit e push

### 6. Estrutura Esperada Após Deploy
```
/ (raiz do projeto)
├── backend/
├── frontend/
├── scripts/
├── .env
├── .gitignore
└── public_html/
    ├── index.html
    ├── assets/
    │   ├── index-[hash].css
    │   └── index-[hash].js
    └── vite.svg
```

## Pós-Deploy

### 7. Deploy na Hostinger
- [ ] Acessar painel da Hostinger
- [ ] Ir em **Git** ou **Deploy**
- [ ] Clicar em **Implantar** (Deploy)
- [ ] Aguardar conclusão do deploy

### 8. Validação no Servidor
- [ ] Acessar o site no navegador
- [ ] Verificar se o site carrega sem erro 503
- [ ] Testar navegação básica
- [ ] Verificar console do navegador (F12) para erros

### 9. Validação da Estrutura no Servidor (Opcional)
Se tiver acesso SSH à Hostinger:
```bash
# Verificar estrutura de arquivos
ls -la
ls -la public_html/

# Estrutura esperada no servidor:
# / (raiz do servidor)
# ├── backend/
# ├── frontend/
# ├── scripts/
# └── public_html/  <- ÚNICO diretório servido publicamente
#     ├── index.html
#     ├── assets/
#     └── vite.svg
```

## Troubleshooting

### Erro: "VALIDACAO FALHOU"
**Causa**: Arquivos de build não estão na estrutura correta

**Solução**:
1. Verificar `frontend/vite.config.js`:
   ```js
   export default defineConfig({
     build: {
       outDir: '../public_html',
       emptyOutDir: true
     }
   })
   ```
2. Deletar pasta `public_html` manualmente
3. Executar build novamente:
   ```bash
   cd frontend
   npm run build
   ```
4. Verificar se arquivos foram gerados em `public_html/`
5. Executar script de deploy novamente

### Erro 503 no Site Após Deploy
**Causa**: Arquivos não estão em `public_html` no servidor

**Solução**:
1. Verificar se o deploy foi executado na Hostinger (painel Git/Deploy)
2. Verificar estrutura de arquivos no servidor via SSH ou File Manager
3. Confirmar que `public_html/index.html` existe no servidor
4. Se necessário, fazer deploy manual:
   - Fazer build local
   - Fazer upload da pasta `public_html` via FTP/SFTP
   - Substituir conteúdo de `public_html` no servidor

### Build Falha com Erros
**Causa**: Erros de sintaxe ou dependências faltando

**Solução**:
1. Ler mensagens de erro do build
2. Corrigir erros de código
3. Verificar se todas as dependências estão instaladas:
   ```bash
   cd frontend
   npm install
   ```
4. Tentar build novamente

### Git Push Falha
**Causa**: Credenciais, conflitos ou problemas de rede

**Solução**:
1. Verificar credenciais Git
2. Verificar conexão com internet
3. Resolver conflitos se houver:
   ```bash
   git pull
   # Resolver conflitos manualmente
   git add .
   git commit -m "Resolve conflicts"
   git push
   ```

## Notas Importantes

### O que DEVE estar em `public_html/`
- ✅ `index.html` (arquivo principal)
- ✅ `assets/` (CSS, JS, imagens compiladas)
- ✅ `vite.svg` (favicon)
- ✅ Qualquer outro arquivo gerado pelo build do Vite

### O que NÃO DEVE estar em `public_html/`
- ❌ Código-fonte (`backend/`, `frontend/`)
- ❌ Arquivos de configuração (`.env`, `vite.config.js`)
- ❌ Dependências (`node_modules/`)
- ❌ Arquivos Git (`.git/`, `.gitignore`)

### O que DEVE estar na raiz do servidor
- ✅ `backend/` (código-fonte do backend)
- ✅ `frontend/` (código-fonte do frontend)
- ✅ `scripts/` (scripts de deploy)
- ✅ `.env` (variáveis de ambiente)
- ✅ `.gitignore`
- ✅ `public_html/` (arquivos compilados)

### Warnings do SASS
Os warnings de deprecação do SASS são normais e não impedem o build:
```
Warning: 89 repetitive deprecation warnings omitted.
Run in verbose mode to see all warnings.
```
Estes warnings não afetam o funcionamento do site e podem ser ignorados.

## Comandos Úteis

### Build Local
```bash
cd frontend
npm run build
```

### Limpar Build Anterior
```bash
# Windows
rmdir /s /q public_html
mkdir public_html

# Linux/Mac
rm -rf public_html
mkdir public_html
```

### Verificar Status Git
```bash
git status
git log --oneline -5
```

### Deploy Completo
```bash
# Da raiz do projeto
scripts\deploy.bat "Deploy: fix estrutura Hostinger"
```

## Contato e Suporte

Se encontrar problemas não listados aqui:
1. Verificar logs do servidor na Hostinger
2. Verificar console do navegador (F12)
3. Verificar se o build local funciona corretamente
4. Documentar o erro e buscar ajuda
