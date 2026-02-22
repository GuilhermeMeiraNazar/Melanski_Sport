# Scripts de Gerenciamento

## Reset de Senha Manual

Se você esqueceu sua senha ou precisa resetar a senha de um usuário, use o script `resetPassword.js`.

### Como usar:

```bash
cd backend
node scripts/resetPassword.js <email> <nova-senha>
```

### Exemplos:

```bash
# Resetar senha do admin
node scripts/resetPassword.js admin@melanskisports.com minhasenha123

# Resetar senha de um cliente
node scripts/resetPassword.js cliente@email.com novasenha456
```

### O que o script faz:

1. Busca o usuário pelo email
2. Gera um hash seguro da nova senha
3. Atualiza a senha no banco de dados
4. Confirma a operação

### Notas:

- A senha deve ter no mínimo 6 caracteres
- O script funciona para qualquer tipo de usuário (client, operator, administrator, developer)
- A senha é automaticamente criptografada com bcrypt
- Se o email não existir, o script retorna erro

## Criar Usuário Admin

Para criar um usuário administrador, use o script existente:

```bash
node scripts/createAdminUser.js
```
