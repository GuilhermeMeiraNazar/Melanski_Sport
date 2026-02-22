const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');
const { generateVerificationCode, sendVerificationEmail, sendWelcomeEmail } = require('../services/emailService');

const authController = {
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email e senha são obrigatórios' });
            }

            const [users] = await db.execute(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            if (users.length === 0) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }

            const user = users[0];

            // Verificar se o email foi verificado (exceto para admin/developer)
            if (!user.email_verified && user.role === 'client') {
                return res.status(403).json({ 
                    error: 'Email não verificado',
                    needsVerification: true 
                });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password_hash);

            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }

            const token = jwt.sign(
                { 
                    id: user.id, 
                    email: user.email, 
                    role: user.role,
                    full_name: user.full_name 
                },
                JWT_SECRET,
                { expiresIn: '8h' }
            );

            res.json({
                token,
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    role: user.role,
                    email_verified: user.email_verified
                }
            });
        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({ error: 'Erro ao realizar login' });
        }
    },

    register: async (req, res) => {
        try {
            const { full_name, email, password, role = 'client' } = req.body;

            if (!full_name || !email || !password) {
                return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
            }

            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ error: 'Email inválido' });
            }

            // Validar senha (mínimo 6 caracteres)
            if (password.length < 6) {
                return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
            }

            const [existing] = await db.execute(
                'SELECT id FROM users WHERE email = ?',
                [email]
            );

            if (existing.length > 0) {
                return res.status(409).json({ error: 'Email já cadastrado' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            // Gerar código de verificação
            const verificationCode = generateVerificationCode();
            const codeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

            const [result] = await db.execute(
                `INSERT INTO users 
                (full_name, email, password_hash, role, email_verified, verification_code, verification_code_expires) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [full_name, email, hashedPassword, role, 0, verificationCode, codeExpires]
            );

            // Enviar email de verificação
            try {
                await sendVerificationEmail(email, full_name, verificationCode);
            } catch (emailError) {
                console.error('Erro ao enviar email:', emailError);
                // Não falha o cadastro se o email não for enviado
            }

            res.status(201).json({ 
                message: 'Usuário cadastrado com sucesso! Verifique seu email.',
                userId: result.insertId,
                needsVerification: true
            });
        } catch (error) {
            console.error('Erro no registro:', error);
            res.status(500).json({ error: 'Erro ao cadastrar usuário' });
        }
    },

    verifyEmail: async (req, res) => {
        try {
            const { email, code } = req.body;

            if (!email || !code) {
                return res.status(400).json({ error: 'Email e código são obrigatórios' });
            }

            const [users] = await db.execute(
                `SELECT * FROM users 
                WHERE email = ? 
                AND verification_code = ? 
                AND verification_code_expires > NOW()`,
                [email, code]
            );

            if (users.length === 0) {
                return res.status(400).json({ error: 'Código inválido ou expirado' });
            }

            const user = users[0];

            // Marcar email como verificado
            await db.execute(
                `UPDATE users 
                SET email_verified = 1, 
                    verification_code = NULL, 
                    verification_code_expires = NULL 
                WHERE id = ?`,
                [user.id]
            );

            // Enviar email de boas-vindas
            try {
                await sendWelcomeEmail(email, user.full_name);
            } catch (emailError) {
                console.error('Erro ao enviar email de boas-vindas:', emailError);
            }

            // Gerar token para login automático
            const token = jwt.sign(
                { 
                    id: user.id, 
                    email: user.email, 
                    role: user.role,
                    full_name: user.full_name 
                },
                JWT_SECRET,
                { expiresIn: '8h' }
            );

            res.json({
                message: 'Email verificado com sucesso!',
                token,
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    role: user.role,
                    email_verified: true
                }
            });
        } catch (error) {
            console.error('Erro na verificação:', error);
            res.status(500).json({ error: 'Erro ao verificar email' });
        }
    },

    resendVerificationCode: async (req, res) => {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ error: 'Email é obrigatório' });
            }

            const [users] = await db.execute(
                'SELECT * FROM users WHERE email = ? AND email_verified = 0',
                [email]
            );

            if (users.length === 0) {
                return res.status(404).json({ error: 'Usuário não encontrado ou já verificado' });
            }

            const user = users[0];

            // Gerar novo código
            const verificationCode = generateVerificationCode();
            const codeExpires = new Date(Date.now() + 15 * 60 * 1000);

            await db.execute(
                `UPDATE users 
                SET verification_code = ?, verification_code_expires = ? 
                WHERE id = ?`,
                [verificationCode, codeExpires, user.id]
            );

            // Enviar email
            await sendVerificationEmail(email, user.full_name, verificationCode);

            res.json({ message: 'Código reenviado com sucesso!' });
        } catch (error) {
            console.error('Erro ao reenviar código:', error);
            res.status(500).json({ error: 'Erro ao reenviar código' });
        }
    },

    validateToken: async (req, res) => {
        res.json({ 
            valid: true, 
            user: req.user 
        });
    },

    updateProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            const { full_name, email } = req.body;

            if (!full_name && !email) {
                return res.status(400).json({ error: 'Nenhum campo para atualizar' });
            }

            // Se estiver mudando o email, verificar se já existe
            if (email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    return res.status(400).json({ error: 'Email inválido' });
                }

                const [existing] = await db.execute(
                    'SELECT id FROM users WHERE email = ? AND id != ?',
                    [email, userId]
                );

                if (existing.length > 0) {
                    return res.status(409).json({ error: 'Email já está em uso' });
                }
            }

            // Construir query dinamicamente
            const updates = [];
            const values = [];

            if (full_name) {
                updates.push('full_name = ?');
                values.push(full_name);
            }

            if (email) {
                updates.push('email = ?');
                values.push(email);
                // Se mudar email, marcar como não verificado
                updates.push('email_verified = 0');
            }

            values.push(userId);

            await db.execute(
                `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
                values
            );

            // Buscar dados atualizados
            const [users] = await db.execute(
                'SELECT id, full_name, email, role, email_verified FROM users WHERE id = ?',
                [userId]
            );

            res.json({
                message: 'Perfil atualizado com sucesso!',
                user: users[0]
            });
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            res.status(500).json({ error: 'Erro ao atualizar perfil' });
        }
    },

    changePassword: async (req, res) => {
        try {
            const userId = req.user.id;
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({ error: 'Nova senha deve ter no mínimo 6 caracteres' });
            }

            // Buscar usuário
            const [users] = await db.execute(
                'SELECT password_hash FROM users WHERE id = ?',
                [userId]
            );

            if (users.length === 0) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            // Verificar senha atual
            const isPasswordValid = await bcrypt.compare(currentPassword, users[0].password_hash);

            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Senha atual incorreta' });
            }

            // Hash da nova senha
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Atualizar senha
            await db.execute(
                'UPDATE users SET password_hash = ? WHERE id = ?',
                [hashedPassword, userId]
            );

            res.json({ message: 'Senha alterada com sucesso!' });
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            res.status(500).json({ error: 'Erro ao alterar senha' });
        }
    },

    requestPasswordReset: async (req, res) => {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ error: 'Email é obrigatório' });
            }

            const [users] = await db.execute(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            // Por segurança, sempre retorna sucesso mesmo se o email não existir
            if (users.length === 0) {
                return res.json({ message: 'Se o email existir, você receberá instruções para resetar a senha' });
            }

            const user = users[0];

            // Gerar código de recuperação
            const resetCode = generateVerificationCode();
            const codeExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

            await db.execute(
                `UPDATE users 
                SET verification_code = ?, verification_code_expires = ? 
                WHERE id = ?`,
                [resetCode, codeExpires, user.id]
            );

            // Enviar email com código
            try {
                await sendVerificationEmail(email, user.full_name, resetCode);
            } catch (emailError) {
                console.error('Erro ao enviar email:', emailError);
                return res.status(500).json({ error: 'Erro ao enviar email de recuperação' });
            }

            res.json({ message: 'Código de recuperação enviado para seu email' });
        } catch (error) {
            console.error('Erro ao solicitar reset de senha:', error);
            res.status(500).json({ error: 'Erro ao processar solicitação' });
        }
    },

    resetPassword: async (req, res) => {
        try {
            const { email, code, newPassword } = req.body;

            if (!email || !code || !newPassword) {
                return res.status(400).json({ error: 'Email, código e nova senha são obrigatórios' });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({ error: 'Nova senha deve ter no mínimo 6 caracteres' });
            }

            const [users] = await db.execute(
                `SELECT * FROM users 
                WHERE email = ? 
                AND verification_code = ? 
                AND verification_code_expires > NOW()`,
                [email, code]
            );

            if (users.length === 0) {
                return res.status(400).json({ error: 'Código inválido ou expirado' });
            }

            const user = users[0];

            // Hash da nova senha
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Atualizar senha e limpar código
            await db.execute(
                `UPDATE users 
                SET password_hash = ?, 
                    verification_code = NULL, 
                    verification_code_expires = NULL 
                WHERE id = ?`,
                [hashedPassword, user.id]
            );

            res.json({ message: 'Senha resetada com sucesso!' });
        } catch (error) {
            console.error('Erro ao resetar senha:', error);
            res.status(500).json({ error: 'Erro ao resetar senha' });
        }
    }
};

module.exports = authController;
