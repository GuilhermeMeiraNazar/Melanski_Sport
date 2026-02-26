# Melanski Sport - Catálogo de Produtos Esportivos

Sistema fullstack de catálogo de produtos esportivos com backend Node.js/Express e frontend React/Vite.

## 📁 Estrutura do Projeto (Monorepo)

```
melanski-sport/
├── package.json          # Orquestrador principal (workspaces)
├── backend/              # API Node.js/Express
│   ├── package.json      # Dependências do backend
│   └── src/
├── frontend/             # Interface React/Vite
│   ├── package.json      # Dependências do frontend
│   └── src/
├── public_html/          # Build do frontend (gerado automaticamente)
└── scripts/              # Scripts de deploy
```

## 🚀 Instalação e Configuração

### Desenvolvimento Local

1. **Instalar todas as dependências:**
   ```bash
   npm install
   ```
   Isso irá:
   - Instalar dependências do backend
   - Instalar dependências do frontend
   - Fazer build do frontend automaticamente (via postinstall)

2. **Rodar backend em modo desenvolvimento:**
   ```bash
   npm run dev:backend
   ```

3. **Rodar frontend em modo desenvolvimento:**
   ```bash
   npm run dev:frontend
   ```

4. **Rodar ambos simultaneamente:**
   ```bash
   npm run dev
   ```
   (Requer `concurrently` instalado globalmente: `npm install -g concurrently`)

### Deploy na Hostinger

A Hostinger detecta automaticamente a estrutura de monorepo e executa:

1. `npm install` na raiz
2. npm workspaces instala backend e frontend
3. Hook `postinstall` builda o frontend
4. Arquivos vão para `public_html/`
5. Backend inicia com `npm start`

**Não é necessário fazer nada manualmente!** A Hostinger cuida de tudo.

## 📝 Scripts Disponíveis

### Scripts Principais

- `npm install` - Instala todas as dependências e builda o frontend
- `npm start` - Inicia o backend em produção
- `npm run dev` - Roda backend e frontend simultaneamente
- `npm test` - Roda todos os testes (backend + frontend)

### Scripts Específicos

- `npm run dev:backend` - Roda apenas o backend em modo dev
- `npm run dev:frontend` - Roda apenas o frontend em modo dev
- `npm run build:frontend` - Builda o frontend manualmente
- `npm run test:backend` - Roda testes do backend
- `npm run test:frontend` - Roda testes do frontend
- `npm run deploy:local` - Deploy local usando script Windows

## 🔧 Configuração do Backend

1. Copie `.env.example` para `.env` na pasta `backend/`
2. Configure as variáveis de ambiente:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=sua_senha
   DB_NAME=melanski_sport
   JWT_SECRET=seu_secret_jwt
   PORT=5000
   ```

3. Crie o banco de dados:
   ```bash
   cd backend
   npm run create-admin
   ```

## 🌐 URLs

- **Frontend (dev):** http://localhost:5173
- **Backend (dev):** http://localhost:5000
- **Backend API:** http://localhost:5000/api

## 📦 Tecnologias

### Backend
- Node.js + Express
- MySQL
- JWT Authentication
- Cloudinary (upload de imagens)
- Nodemailer (emails)

### Frontend
- React 19
- Vite
- React Router
- Axios
- SASS

## 🧪 Testes

```bash
# Todos os testes
npm test

# Apenas backend
npm run test:backend

# Apenas frontend
npm run test:frontend
```

## 📚 Documentação Adicional

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [Scripts de Deploy](./scripts/README.md)
- [Guia de Deploy Hostinger](./Kiro/GUIA_RAPIDO_DEPLOY.md)

## 🤝 Contribuindo

1. Clone o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

ISC
