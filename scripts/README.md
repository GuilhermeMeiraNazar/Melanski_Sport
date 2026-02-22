# Scripts de Gerenciamento - Melanski Sports

Scripts para facilitar o gerenciamento dos servidores backend e frontend.

## 📁 Estrutura

```
scripts/
├── start.bat       # Iniciar servidores (Windows)
├── stop.bat        # Parar servidores (Windows)
├── restart.bat     # Reiniciar servidores (Windows)
├── status.bat      # Ver status (Windows)
├── start.sh        # Iniciar servidores (Linux/Mac)
├── stop.sh         # Parar servidores (Linux/Mac)
├── restart.sh      # Reiniciar servidores (Linux/Mac)
└── status.sh       # Ver status (Linux/Mac)
```

## 🪟 Windows

### Iniciar Servidores

```cmd
scripts\start.bat
```

O que faz:
- Verifica se o Node.js está instalado
- Instala dependências se necessário
- Inicia o backend na porta 3000
- Inicia o frontend na porta 5173
- Abre duas janelas de terminal separadas

### Parar Servidores

```cmd
scripts\stop.bat
```

O que faz:
- Para o processo do backend
- Para o processo do frontend
- Libera as portas 3000 e 5173

### Reiniciar Servidores

```cmd
scripts\restart.bat
```

O que faz:
- Executa o stop.bat
- Aguarda 2 segundos
- Executa o start.bat

### Ver Status

```cmd
scripts\status.bat
```

O que faz:
- Mostra se o backend está rodando
- Mostra se o frontend está rodando
- Exibe os PIDs dos processos

## 🐧 Linux / Mac

### Dar Permissão de Execução (Primeira vez)

```bash
chmod +x scripts/*.sh
```

### Iniciar Servidores

```bash
./scripts/start.sh
```

O que faz:
- Verifica se o Node.js e npm estão instalados
- Instala dependências se necessário
- Inicia o backend na porta 3000 (background)
- Inicia o frontend na porta 5173 (background)
- Salva os PIDs em `logs/backend.pid` e `logs/frontend.pid`
- Salva os logs em `logs/backend.log` e `logs/frontend.log`

### Parar Servidores

```bash
./scripts/stop.sh
```

O que faz:
- Para o processo do backend usando o PID salvo
- Para o processo do frontend usando o PID salvo
- Se não encontrar o PID, tenta matar pela porta
- Remove os arquivos .pid

### Reiniciar Servidores

```bash
./scripts/restart.sh
```

O que faz:
- Executa o stop.sh
- Aguarda 2 segundos
- Executa o start.sh

### Ver Status

```bash
./scripts/status.sh
```

O que faz:
- Mostra se o backend está rodando
- Mostra se o frontend está rodando
- Exibe os PIDs dos processos
- Mostra as URLs de acesso

## 📝 Logs (Linux/Mac)

Os logs são salvos automaticamente em:

```
logs/
├── backend.log     # Saída do servidor backend
├── frontend.log    # Saída do servidor frontend
├── backend.pid     # PID do processo backend
└── frontend.pid    # PID do processo frontend
```

Para ver os logs em tempo real:

```bash
# Backend
tail -f logs/backend.log

# Frontend
tail -f logs/frontend.log
```

## 🔧 Requisitos

- Node.js (v14 ou superior)
- npm (v6 ou superior)
- Windows: PowerShell ou CMD
- Linux/Mac: Bash

## 🚀 URLs de Acesso

Após iniciar os servidores:

- **Backend API**: http://localhost:3000
- **Frontend**: http://localhost:5173

## ⚠️ Troubleshooting

### Porta já em uso

Se as portas 3000 ou 5173 já estiverem em uso:

**Windows:**
```cmd
# Ver o que está usando a porta
netstat -ano | findstr :3000
netstat -ano | findstr :5173

# Matar o processo (substitua PID pelo número encontrado)
taskkill /F /PID <PID>
```

**Linux/Mac:**
```bash
# Ver o que está usando a porta
lsof -i :3000
lsof -i :5173

# Matar o processo
kill -9 $(lsof -ti:3000)
kill -9 $(lsof -ti:5173)
```

### Permissão negada (Linux/Mac)

```bash
chmod +x scripts/*.sh
```

### Node.js não encontrado

Instale o Node.js: https://nodejs.org/

## 💡 Dicas

1. **Desenvolvimento**: Use `start` para iniciar ambos os servidores
2. **Produção**: Configure PM2 ou similar para gerenciamento avançado
3. **Logs**: Sempre verifique os logs se algo não funcionar
4. **Status**: Use `status` para verificar se tudo está rodando

## 🔄 Fluxo de Trabalho Recomendado

```bash
# 1. Iniciar pela primeira vez
./scripts/start.sh

# 2. Verificar se está tudo ok
./scripts/status.sh

# 3. Fazer alterações no código...

# 4. Reiniciar para aplicar mudanças
./scripts/restart.sh

# 5. Parar quando terminar
./scripts/stop.sh
```
