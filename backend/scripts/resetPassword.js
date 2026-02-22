const bcrypt = require('bcryptjs');
const db = require('../src/config/database');

async function resetPassword() {
    try {
        const email = process.argv[2];
        const newPassword = process.argv[3];

        if (!email || !newPassword) {
            console.log('Uso: node scripts/resetPassword.js <email> <nova-senha>');
            console.log('Exemplo: node scripts/resetPassword.js admin@example.com 123456');
            process.exit(1);
        }

        // Verificar se usuário existe
        const [users] = await db.execute(
            'SELECT id, full_name, email FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            console.log('❌ Usuário não encontrado com o email:', email);
            process.exit(1);
        }

        const user = users[0];
        console.log('✓ Usuário encontrado:', user.full_name, `(${user.email})`);

        // Hash da nova senha
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Atualizar senha
        await db.execute(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [hashedPassword, user.id]
        );

        console.log('✓ Senha resetada com sucesso!');
        console.log('Nova senha:', newPassword);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao resetar senha:', error);
        process.exit(1);
    }
}

resetPassword();
