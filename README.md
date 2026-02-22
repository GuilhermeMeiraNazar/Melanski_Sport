# 🏆 Melanski Sport - E-commerce Modernizado

Sistema completo de e-commerce para artigos esportivos com painel administrativo avançado, controle de acesso baseado em funções (RBAC), gerenciamento dinâmico de categorias e sistema de auditoria.

## ✨ Funcionalidades Principais

### 🛍️ Loja Virtual
- Catálogo de produtos com filtros dinâmicos
- Sistema de carrinho de compras
- Visualização de produtos com galeria de imagens
- Filtros por time, categoria, gênero e tamanho
- Produtos em destaque e lançamentos

### 🔐 Sistema de Autenticação
- Login com email e senha
- Autenticação JWT com tokens seguros
- 4 níveis de acesso (Developer, Administrator, Operator, Client)
- Controle de permissões granular (RBAC)
- Sessões seguras com expiração

### 📦 Painel Administrativo
- Gerenciamento completo de produtos (CRUD)
- Upload de até 5 imagens por produto
- Gerenciamento dinâmico de categorias
- Sistema de estoque por tamanho
- Controle de descontos e promoções
- Visualização de logs de auditoria

### 📊 Sistema de Auditoria
- Registro automático de todas as ações
- Histórico completo de alterações
- Detalhes em JSON (antes/depois)
- Rastreabilidade por usuário
- Interface de visualização com paginação

### 🖼️ Integração com Cloudinary
- Upload otimizado de imagens
- Redimensionamento automático
- Deleção inteligente de imagens antigas
- CDN global para performance

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18+
- MySQL 8.0+
- Conta Cloudinary

### 1. Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/Melanski_Sport.git
cd Melanski_Sport
```

### 2. Configurar Backend
```bash
cd backend
npm install
```

Criar arquivo `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=sua_senha
DB_NAME=melanski_sport
JWT_SECRET=sua_chave_secreta_forte
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret
PORT=3000
```

### 3. Configurar Banco de Dados
```bash
mysql -u root -p melanski_sport < backend/database_migration.sql
cd backend
node scripts/createAdminUser.js
```

### 4. Configurar Frontend
```bash
cd frontend
npm install
```

### 5. Iniciar Servidores
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 6. Acessar o Sistema
- Loja: http://localhost:5173
- Login: `admin@melanski.com` / `admin123`

## 📚 Documentação

- [📖 Guia de Implementação](IMPLEMENTACAO.md) - Documentação completa
- [⚡ Guia Rápido](GUIA_RAPIDO.md) - Início em 5 minutos
- [🏗️ Arquitetura](ARQUITETURA.md) - Diagramas e fluxos
- [🚀 Deploy](DEPLOY.md) - Guia de produção
- [📊 Resumo Executivo](RESUMO_EXECUTIVO.md) - Visão geral

## 🔑 Níveis de Acesso

| Role | Loja | Admin | Criar | Editar | Deletar | Categorias | Logs |
|------|------|-------|-------|--------|---------|------------|------|
| Client | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Operator | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Administrator | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Developer | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## 🛠️ Tecnologias

### Backend
- Node.js + Express
- MySQL2
- JWT (jsonwebtoken)
- Bcrypt.js
- Cloudinary SDK

### Frontend
- React 19
- React Router DOM
- Axios
- SCSS
- React Icons

## 📁 Estrutura do Projeto

```
Melanski_Sport/
├── backend/
│   ├── src/
│   │   ├── config/          # Configurações (DB, Cloudinary)
│   │   ├── controllers/     # Lógica de negócio
│   │   ├── middleware/      # Auth e RBAC
│   │   ├── routes/          # Rotas da API
│   │   ├── services/        # Serviços (Upload, etc)
│   │   ├── utils/           # Utilitários (Logger)
│   │   └── server.js        # Servidor principal
│   ├── scripts/             # Scripts auxiliares
│   └── database_migration.sql
├── frontend/
│   ├── src/
│   │   ├── assets/          # SCSS e imagens
│   │   ├── components/      # Componentes React
│   │   ├── pages/           # Páginas (Home, Admin)
│   │   ├── services/        # API client
│   │   └── App.jsx
│   └── public/
└── docs/                    # Documentação
```

## 🔧 Scripts Disponíveis

### Backend
```bash
npm start             # Iniciar em produção
npm run dev           # Iniciar em desenvolvimento
npm run create-admin  # Criar usuário admin
```

### Frontend
```bash
npm run dev        # Servidor de desenvolvimento
npm run build      # Build para produção
npm run preview    # Preview do build
```

## 🐛 Troubleshooting

### Erro de Conexão com Banco
```bash
# Verificar se MySQL está rodando
mysql -u root -p

# Verificar credenciais no .env
```

### Token Inválido
```bash
# Fazer logout e login novamente
# Verificar JWT_SECRET no .env
```

### Imagens não Carregam
```bash
# Verificar credenciais Cloudinary
# Verificar CORS do Cloudinary
```

## 📝 Changelog

### v2.0.0 (2026-02-21)
- ✅ Sistema de autenticação JWT
- ✅ RBAC com 4 níveis de acesso
- ✅ Gerenciamento dinâmico de categorias
- ✅ Sistema de logs de auditoria
- ✅ Integração avançada com Cloudinary
- ✅ Interface administrativa modernizada

### v1.0.0 (2024)
- Lançamento inicial
- CRUD de produtos
- Carrinho de compras
- Filtros básicos

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC.

---

**Desenvolvido com ❤️ para Melanski Sport**
