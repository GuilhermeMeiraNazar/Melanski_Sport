const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../src/config/database');

async function createAdminUser() {
    try {
        // Deletar usuário antigo se existir
        await db.execute('DELETE FROM users WHERE email = ?', ['admin@melanski.com']);
        console.log('🗑️  Usuário antigo deletado (se existia)');
        console.log('');

        // Dados do novo usuário
        const full_name = 'Guilherme Meira';
        const email = 'guilhermen610@gmail.com';
        const password = crypto.randomBytes(8).toString('hex'); // Senha aleatória
        const role = 'developer';

        // Gerar hash da senha
        const password_hash = await bcrypt.hash(password, 10);

        // Inserir usuário
        const [result] = await db.execute(
            `INSERT INTO users (full_name, email, password_hash, role, email_verified) 
             VALUES (?, ?, ?, ?, ?)`,
            [full_name, email, password_hash, role, 1] // Developer já vem verificado
        );

        console.log('✅ Usuário developer criado com sucesso!');
        console.log('');
        console.log('👤 Nome:', full_name);
        console.log('📧 Email:', email);
        console.log('🔑 Senha:', password);
        console.log('🎖️  Role: developer (acesso total)');
        console.log('');
        console.log('⚠️  IMPORTANTE: Guarde esta senha em local seguro!');
        console.log('💡 Você pode alterá-la após o primeiro login.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao criar usuário:', error);
        process.exit(1);
    }
}

createAdminUser();
