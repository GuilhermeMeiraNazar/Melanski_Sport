const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');
const { generateVerificationCode, sendVerificationEmail, sendWelcomeEmail } = require('../services/emailService');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const authController = {
    login: asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new AppError('Email e senha são obrigatórios', 400);
        }

        const [users] = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            throw new AppError('Credenciais inválidas', 401);
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
            throw new AppError('Credenciais inválidas', 401);
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
    }),

    register: asyncHandler(async (req, res) => {
        const { full_name, email, password, role = 'client' } = req.body;

        if (!full_name || !email || !password) {
            throw new AppError('Todos os campos são obrigatórios', 400);
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new AppError('Email inválido', 400);
        }

        // Validar senha (mínimo 6 caracteres)
        if (password.length < 6) {
            throw new AppError('Senha deve ter no mínimo 6 caracteres', 400);
        }

        const [existing] = await db.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            throw new AppError('Email já cadastrado', 409);
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
    }),

    verifyEmail: asyncHandler(async (req, res) => {
        const { email, code } = req.body;

        if (!email || !code) {
            throw new AppError('Email e código são obrigatórios', 400);
        }

        const [users] = await db.execute(
            `SELECT * FROM users 
            WHERE email = ? 
            AND verification_code = ? 
            AND verification_code_expires > NOW()`,
            [email, code]
        );

        if (users.length === 0) {
            throw new AppError('Código inválido ou expirado', 400);
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
    }),

    resendVerificationCode: asyncHandler(async (req, res) => {
        const { email } = req.body;

        if (!email) {
            throw new AppError('Email é obrigatório', 400);
        }

        const [users] = await db.execute(
            'SELECT * FROM users WHERE email = ? AND email_verified = 0',
            [email]
        );

        if (users.length === 0) {
            throw new AppError('Usuário não encontrado ou já verificado', 404);
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
    }),

    validateToken: asyncHandler(async (req, res) => {
        res.json({ 
            valid: true, 
            user: req.user 
        });
    }),

    updateProfile: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { full_name, email } = req.body;

        if (!full_name && !email) {
            throw new AppError('Nenhum campo para atualizar', 400);
        }

        // Se estiver mudando o email, verificar se já existe
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new AppError('Email inválido', 400);
            }

            const [existing] = await db.execute(
                'SELECT id FROM users WHERE email = ? AND id != ?',
                [email, userId]
            );

            if (existing.length > 0) {
                throw new AppError('Email já está em uso', 409);
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
    }),

    changePassword: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            throw new AppError('Senha atual e nova senha são obrigatórias', 400);
        }

        if (newPassword.length < 6) {
            throw new AppError('Nova senha deve ter no mínimo 6 caracteres', 400);
        }

        // Buscar usuário
        const [users] = await db.execute(
            'SELECT password_hash FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            throw new AppError('Usuário não encontrado', 404);
        }

        // Verificar senha atual
        const isPasswordValid = await bcrypt.compare(currentPassword, users[0].password_hash);

        if (!isPasswordValid) {
            throw new AppError('Senha atual incorreta', 401);
        }

        // Hash da nova senha
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Atualizar senha
        await db.execute(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [hashedPassword, userId]
        );

        res.json({ message: 'Senha alterada com sucesso!' });
    }),

    requestPasswordReset: asyncHandler(async (req, res) => {
        const { email } = req.body;

        if (!email) {
            throw new AppError('Email é obrigatório', 400);
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
            throw new AppError('Erro ao enviar email de recuperação', 500);
        }

        res.json({ message: 'Código de recuperação enviado para seu email' });
    }),

    resetPassword: asyncHandler(async (req, res) => {
        const { email, code, newPassword } = req.body;

        if (!email || !code || !newPassword) {
            throw new AppError('Email, código e nova senha são obrigatórios', 400);
        }

        if (newPassword.length < 6) {
            throw new AppError('Nova senha deve ter no mínimo 6 caracteres', 400);
        }

        const [users] = await db.execute(
            `SELECT * FROM users 
            WHERE email = ? 
            AND verification_code = ? 
            AND verification_code_expires > NOW()`,
            [email, code]
        );

        if (users.length === 0) {
            throw new AppError('Código inválido ou expirado', 400);
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
    })
};

module.exports = authController;
