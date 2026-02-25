# Guia Rápido: Deploy para Hostinger

## Comando Único

```bash
scripts\deploy.bat "sua mensagem de commit"
```

## O que o Script Faz

1. **Limpa a raiz** - Remove arquivos incorretos (index.html, assets/, vite.svg)
2. **Faz o build** - Compila o frontend para `public_html/`
3. **Valida estrutura** - Verifica se tudo está correto
4. **Faz commit e push** - Envia para o repositório

## Estrutura Correta

```
/ (raiz)
├── backend/          ← Código-fonte
├── frontend/         ← Código-fonte
├── scripts/          ← Scripts
└── public_html/      ← Arquivos compilados (ÚNICO diretório público)
    ├── index.html
    ├── assets/
    └── vite.svg
```

## Após o Push

1. Acesse o painel da Hostinger
2. Vá em **Git** ou **Deploy**
3. Clique em **Implantar**

## Se Der Erro

### Validação Falhou
```bash
cd frontend
npm run build
```
Verifique se os arquivos foram gerados em `public_html/`

### Erro 503 no Site
- Confirme que o deploy foi executado na Hostinger
- Verifique se `public_html/index.html` existe no servidor

### Build Falhou
- Leia os erros
- Corrija o código
- Tente novamente

## Checklist Completo

Para mais detalhes, veja: `.kiro/specs/hostinger-deploy-structure-fix/DEPLOY_CHECKLIST.md`
