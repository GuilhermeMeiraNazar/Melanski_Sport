# 🚀 Guia de Deploy na Hostinger

Este guia explica como fazer deploy do Melanski Sport na Hostinger usando a estrutura de monorepo.

## 📋 Pré-requisitos

- Conta Hostinger com plano Business ou Cloud
- Repositório Git configurado
- Node.js 18+ suportado pela Hostinger

## 🏗️ Estrutura do Projeto

O projeto usa uma estrutura de **monorepo** com npm workspaces:

```
/ (raiz)
├── package.json          ← Orquestrador principal
├── backend/
│   ├── package.json      ← Dependências do backend
│   └── src/
├── frontend/
│   ├── package.json      ← Dependências do frontend
│   └── src/
└── public_html/          ← Build do frontend (gerado automaticamente)
```

## ✨ Como Funciona

### 1. Processo Automático na Hostinger

Quando você faz deploy, a Hostinger executa automaticamente:

```bash
npm install  # Na raiz do projeto
```

Isso dispara a seguinte sequência:

1. **npm workspaces** instala dependências de `backend/` e `frontend/`
2. **postinstall hook** executa `npm run build:frontend`
3. Frontend é buildado e arquivos vão para `public_html/`
4. Backend fica pronto para iniciar

### 2. Estrutura de Arquivos na Hostinger

Após o deploy, a estrutura no servidor será:

```
/home/{username}/domains/{domain}/
├── nodejs/               ← Backend (gerenciado pela Hostinger)
│   └── backend/src/
├── public_html/          ← Frontend buildado (servido pelo Apache)
│   ├── index.html
│   ├── assets/
│   └── vite.svg
└── .htaccess            ← Gerado automaticamente pela Hostinger
```

## 📝 Passo a Passo do Deploy

### Opção 1: Deploy via GitHub (Recomendado)

1. **Faça push do código para o GitHub:**
   ```bash
   git add .
   git commit -m "Deploy para Hostinger"
   git push origin main
   ```

2. **Configure na Hostinger:**
   - Acesse hPanel → Websites → Add Website
   - Escolha "Node.js Apps"
   - Selecione "Import Git Repository"
   - Autorize o GitHub e selecione seu repositório
   - A Hostinger detecta automaticamente a estrutura

3. **Configurações de Build:**
   - **Build Command:** `npm install` (detectado automaticamente)
   - **Start Command:** `npm start` (detectado automaticamente)
   - **Node Version:** 18.x ou superior

4. **Variáveis de Ambiente:**
   - Configure no painel da Hostinger:
     - `DB_HOST`
     - `DB_USER`
     - `DB_PASSWORD`
     - `DB_NAME`
     - `JWT_SECRET`
     - `PORT` (geralmente 5000)

5. **Deploy:**
   - Clique em "Deploy"
   - Aguarde o build completar
   - Seu site estará disponível!

### Opção 2: Deploy via Upload de Arquivos

1. **Faça build local:**
   ```bash
   npm install
   npm run build:frontend
   ```

2. **Crie um arquivo .zip:**
   - Inclua: `backend/`, `frontend/`, `public_html/`, `package.json`, `scripts/`
   - Exclua: `node_modules/`, `.git/`, `.env`

3. **Upload na Hostinger:**
   - Acesse hPanel → Websites → Add Website
   - Escolha "Node.js Apps"
   - Selecione "Upload your website files"
   - Faça upload do .zip

4. **Configure e Deploy:**
   - Mesmas configurações da Opção 1
   - Clique em "Deploy"

## 🔧 Configuração do Banco de Dados

1. **Crie o banco de dados no hPanel:**
   - Acesse "Databases" → "MySQL Databases"
   - Crie um novo banco de dados
   - Anote: nome do banco, usuário e senha

2. **Configure as variáveis de ambiente:**
   - No painel Node.js Apps, adicione:
     ```
     DB_HOST=localhost
     DB_USER=seu_usuario
     DB_PASSWORD=sua_senha
     DB_NAME=seu_banco
     ```

3. **Execute as migrations:**
   - SSH no servidor (se disponível)
   - Ou use o script de criação de admin:
     ```bash
     cd backend
     npm run create-admin
     ```

## 🐛 Troubleshooting

### Problema: Site retorna erro 503

**Causa:** Arquivos não estão em `public_html/`

**Solução:**
1. Verifique se o build foi executado: `ls public_html/`
2. Se vazio, execute manualmente: `npm run build:frontend`
3. Faça redeploy

### Problema: Backend não inicia

**Causa:** Variáveis de ambiente não configuradas

**Solução:**
1. Verifique as variáveis no painel da Hostinger
2. Certifique-se que `DB_HOST`, `DB_USER`, `DB_PASSWORD` estão corretos
3. Verifique os logs no painel

### Problema: npm install falha

**Causa:** Versão do Node.js incompatível

**Solução:**
1. Verifique a versão no painel: deve ser 18.x ou superior
2. Atualize se necessário
3. Faça redeploy

### Problema: Frontend não carrega assets

**Causa:** Caminho base incorreto no Vite

**Solução:**
1. Verifique `frontend/vite.config.js`:
   ```javascript
   export default defineConfig({
     base: '/',
     build: {
       outDir: '../public_html',
       emptyOutDir: true
     }
   })
   ```
2. Faça rebuild: `npm run build:frontend`

## 📊 Monitoramento

### Logs do Backend

Acesse no painel da Hostinger:
- Node.js Apps → Seu site → Logs

### Logs de Deploy

Acesse no painel da Hostinger:
- Node.js Apps → Seu site → Deployment Details

### Status do Servidor

Verifique:
- CPU e memória no painel
- Uptime do backend
- Erros recentes nos logs

## 🔄 Atualizações

### Deploy de Novas Versões

1. **Faça as alterações localmente**
2. **Teste localmente:**
   ```bash
   npm run dev
   npm test
   ```
3. **Commit e push:**
   ```bash
   git add .
   git commit -m "Descrição das mudanças"
   git push origin main
   ```
4. **Na Hostinger:**
   - Acesse Node.js Apps → Seu site
   - Clique em "Redeploy" ou aguarde deploy automático

### Rollback

Se algo der errado:
1. Acesse Deployment History no painel
2. Selecione uma versão anterior
3. Clique em "Redeploy"

## 📚 Recursos Adicionais

- [Documentação Hostinger Node.js](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/)
- [npm Workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces)
- [Vite Build](https://vitejs.dev/guide/build.html)

## 💡 Dicas

1. **Use variáveis de ambiente** para configurações sensíveis
2. **Teste localmente** antes de fazer deploy
3. **Monitore os logs** após cada deploy
4. **Faça backups** do banco de dados regularmente
5. **Use Git tags** para versionar releases

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs no painel da Hostinger
2. Consulte este guia de troubleshooting
3. Entre em contato com o suporte da Hostinger (chat 24/7)
