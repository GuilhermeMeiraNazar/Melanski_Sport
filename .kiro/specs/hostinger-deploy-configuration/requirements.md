# Requirements Document

## Introduction

Este documento define os requisitos para configurar o processo de deploy na Hostinger de forma que o servidor reconheça corretamente a estrutura do projeto fullstack (backend + frontend). O problema atual é que a Hostinger usa a pasta `backend/` como raiz, ignorando a pasta `public_html` onde o frontend é buildado, resultando em uma estrutura incorreta no servidor.

## Glossary

- **Build_System**: Sistema responsável por compilar o código frontend (Vite) e gerar os arquivos estáticos
- **Deploy_Script**: Script automatizado que prepara e copia arquivos para deploy
- **Backend_Server**: Servidor Node.js/Express que serve a aplicação
- **Frontend_Assets**: Arquivos estáticos gerados pelo build do frontend (HTML, CSS, JS)
- **Public_Directory**: Diretório que contém os arquivos estáticos servidos pelo servidor web
- **Hostinger_Container**: Ambiente de execução na Hostinger onde a aplicação é implantada
- **Post_Install_Hook**: Script executado automaticamente após a instalação de dependências npm

## Requirements

### Requirement 1: Automated Frontend Build Integration

**User Story:** Como desenvolvedor, eu quero que o frontend seja buildado automaticamente durante o deploy, para que eu não precise fazer build manual antes de cada deploy.

#### Acceptance Criteria

1. WHEN npm install is executed in the backend directory, THE Deploy_Script SHALL build the frontend automatically
2. THE Deploy_Script SHALL execute before the Backend_Server starts
3. IF the frontend build fails, THEN THE Deploy_Script SHALL exit with a non-zero status code
4. THE Deploy_Script SHALL log build progress to stdout

### Requirement 2: Frontend Assets Copy to Public Directory

**User Story:** Como desenvolvedor, eu quero que os arquivos do frontend sejam copiados para o diretório público correto, para que a Hostinger sirva os arquivos na estrutura esperada.

#### Acceptance Criteria

1. WHEN the frontend build completes successfully, THE Deploy_Script SHALL copy all Frontend_Assets to the Public_Directory
2. THE Deploy_Script SHALL preserve file permissions during copy operations
3. THE Deploy_Script SHALL overwrite existing files in the Public_Directory
4. IF the Public_Directory does not exist, THEN THE Deploy_Script SHALL create it
5. THE Deploy_Script SHALL copy all files recursively including subdirectories

### Requirement 3: Cross-Platform Compatibility

**User Story:** Como desenvolvedor, eu quero que o script de deploy funcione em diferentes sistemas operacionais, para que possa ser executado tanto localmente quanto no servidor Hostinger.

#### Acceptance Criteria

1. THE Deploy_Script SHALL execute successfully on Linux environments
2. THE Deploy_Script SHALL execute successfully on Windows environments
3. THE Deploy_Script SHALL use Node.js built-in modules for file operations
4. THE Deploy_Script SHALL not depend on platform-specific shell commands

### Requirement 4: Build Verification

**User Story:** Como desenvolvedor, eu quero verificar se o build foi bem-sucedido antes de copiar arquivos, para que não sejam copiados arquivos corrompidos ou incompletos.

#### Acceptance Criteria

1. WHEN the frontend build completes, THE Deploy_Script SHALL verify that index.html exists in the build output
2. IF index.html does not exist, THEN THE Deploy_Script SHALL exit with an error message
3. THE Deploy_Script SHALL verify that the build output directory is not empty
4. THE Deploy_Script SHALL log verification results

### Requirement 5: Package.json Integration

**User Story:** Como desenvolvedor, eu quero que o script seja executado automaticamente via npm hooks, para que o deploy seja transparente e não requeira comandos adicionais.

#### Acceptance Criteria

1. THE Backend_Server package.json SHALL include a postinstall script
2. WHEN npm install is executed, THE Post_Install_Hook SHALL trigger the Deploy_Script
3. THE Deploy_Script SHALL be located in a scripts directory relative to backend
4. THE package.json SHALL reference the Deploy_Script using a relative path

### Requirement 6: Error Handling and Logging

**User Story:** Como desenvolvedor, eu quero mensagens de erro claras quando o deploy falha, para que eu possa diagnosticar e corrigir problemas rapidamente.

#### Acceptance Criteria

1. WHEN an error occurs during build, THE Deploy_Script SHALL log the error message to stderr
2. WHEN an error occurs during file copy, THE Deploy_Script SHALL log the specific file path and error
3. IF the frontend directory does not exist, THEN THE Deploy_Script SHALL exit with a descriptive error
4. THE Deploy_Script SHALL use exit code 1 for all error conditions
5. THE Deploy_Script SHALL use exit code 0 only when all operations succeed

### Requirement 7: Hostinger Directory Structure Compatibility

**User Story:** Como desenvolvedor, eu quero que o script funcione com a estrutura de diretórios da Hostinger, para que os arquivos sejam copiados para o local correto no servidor.

#### Acceptance Criteria

1. THE Deploy_Script SHALL resolve paths relative to the backend directory
2. WHEN executed in Hostinger_Container, THE Deploy_Script SHALL copy Frontend_Assets to ./public relative to backend
3. WHEN executed locally, THE Deploy_Script SHALL copy Frontend_Assets to ../public_html
4. THE Deploy_Script SHALL detect the execution environment automatically
5. WHERE the environment is Hostinger, THE Deploy_Script SHALL use Hostinger-specific paths

### Requirement 8: Idempotent Deployment

**User Story:** Como desenvolvedor, eu quero que executar o deploy múltiplas vezes produza o mesmo resultado, para que eu possa fazer redeploy com segurança.

#### Acceptance Criteria

1. WHEN the Deploy_Script is executed multiple times, THE Public_Directory SHALL contain identical Frontend_Assets
2. THE Deploy_Script SHALL clean the Public_Directory before copying new files
3. THE Deploy_Script SHALL not leave partial or temporary files in the Public_Directory
4. FOR ALL valid deployments, executing the Deploy_Script twice SHALL produce the same final state (idempotence property)
