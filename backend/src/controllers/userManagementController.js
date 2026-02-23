const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { sendUserCreatedEmail, sendUserRoleChangedEmail } = require('../services/emailService');

// Gerar senha aleatória segura
const generateRandomPassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
};

const userManagementController = {
    // Listar usuários administrativos
    getAll: asyncHandler(async (req, res) => {
        const { 
            page = 1, 
            limit = 12,
            role = 'all' // all, developer, administrator, operator
        } = req.query;
        
        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Construir query com filtros
        let whereClause = "WHERE role IN ('developer', 'administrator', 'operator')";
        const params = [];

        if (role !== 'all') {
            whereClause += ' AND role = ?';
            params.push(role);
        }

        // Usar valores diretos para LIMIT e OFFSET (não como placeholders)
        const limitValue = parseInt(limit);
        const offsetValue = parseInt(offset);

        const query = `
            SELECT 
                id,
                full_name,
                email,
                role,
                email_verified,
                temp_password,
                created_at
            FROM users
            ${whereClause}
            ORDER BY 
                CASE role
                    WHEN 'developer' THEN 1
                    WHEN 'administrator' THEN 2
                    WHEN 'operator' THEN 3
                END,
                full_name
            LIMIT ${limitValue} OFFSET ${offsetValue}
        `;

        const [users] = await db.execute(query, params);

        // Contar total
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM users
            ${whereClause}
        `;
        
        const countParams = role !== 'all' ? [role] : [];
        const [countResult] = await db.execute(countQuery, countParams);

        res.json({
            data: users,
            pagination: {
                total: countResult[0].total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(countResult[0].total / parseInt(limit))
            }
        });
    }),

    // Criar novo usuário
    create: asyncHandler(async (req, res) => {
        const { full_name, email, role } = req.body;
        const creatorRole = req.user.role;

        // Validar permissões
        if (creatorRole === 'administrator' && role !== 'operator') {
            throw new AppError('Administrator só pode criar Operator', 403);
        }

        if (creatorRole === 'developer' && !['administrator', 'operator'].includes(role)) {
            throw new AppError('Developer só pode criar Administrator ou Operator', 403);
        }

        // Verificar se email já existe
        const [existingUsers] = await db.execute(
            'SELECT id, role FROM users WHERE email = ?',
            [email]
        );

        const randomPassword = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        if (existingUsers.length > 0) {
            // Email já existe - atualizar role
            const existingUser = existingUsers[0];
            
            if (existingUser.role !== 'client') {
                throw new AppError('Email já cadastrado como usuário administrativo', 400);
            }

            // Atualizar de cliente para role administrativo
            await db.execute(
                `UPDATE users 
                SET role = ?, 
                    password_hash = ?, 
                    temp_password = 1,
                    full_name = ?
                WHERE id = ?`,
                [role, hashedPassword, full_name, existingUser.id]
            );

            // Enviar email notificando mudança
            try {
                await sendUserRoleChangedEmail(email, full_name, role, randomPassword);
            } catch (emailError) {
                console.error('Erro ao enviar email:', emailError);
                // Não falha a operação se email falhar
            }

            res.status(200).json({
                message: 'Usuário atualizado com sucesso',
                userId: existingUser.id,
                tempPassword: randomPassword
            });
        } else {
            // Criar novo usuário
            const [result] = await db.execute(
                `INSERT INTO users (full_name, email, password_hash, role, email_verified, temp_password)
                VALUES (?, ?, ?, ?, 1, 1)`,
                [full_name, email, hashedPassword, role]
            );

            // Enviar email de boas-vindas
            try {
                await sendUserCreatedEmail(email, full_name, role, randomPassword);
            } catch (emailError) {
                console.error('Erro ao enviar email:', emailError);
                // Não falha a operação se email falhar
            }

            res.status(201).json({
                message: 'Usuário criado com sucesso',
                userId: result.insertId,
                tempPassword: randomPassword
            });
        }
    }),

    // Atualizar usuário
    update: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { full_name, email, role } = req.body;
        const updaterRole = req.user.role;

        // Buscar usuário atual
        const [users] = await db.execute(
            'SELECT role FROM users WHERE id = ?',
            [id]
        );

        if (users.length === 0) {
            throw new AppError('Usuário não encontrado', 404);
        }

        const currentUser = users[0];

        // Validar permissões
        if (updaterRole === 'administrator') {
            if (currentUser.role !== 'operator' || role !== 'operator') {
                throw new AppError('Administrator só pode editar Operator', 403);
            }
        }

        // Verificar se novo email já existe
        if (email) {
            const [existingUsers] = await db.execute(
                'SELECT id FROM users WHERE email = ? AND id != ?',
                [email, id]
            );

            if (existingUsers.length > 0) {
                throw new AppError('Email já cadastrado', 400);
            }
        }

        // Atualizar usuário
        const updates = [];
        const params = [];

        if (full_name) {
            updates.push('full_name = ?');
            params.push(full_name);
        }

        if (email) {
            updates.push('email = ?');
            params.push(email);
        }

        if (role && updaterRole === 'developer') {
            updates.push('role = ?');
            params.push(role);
        }

        if (updates.length === 0) {
            throw new AppError('Nenhum campo para atualizar', 400);
        }

        params.push(id);

        await db.execute(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        res.json({ message: 'Usuário atualizado com sucesso' });
    }),

    // Deletar usuário
    delete: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const deleterRole = req.user.role;

        // Buscar usuário
        const [users] = await db.execute(
            'SELECT role FROM users WHERE id = ?',
            [id]
        );

        if (users.length === 0) {
            throw new AppError('Usuário não encontrado', 404);
        }

        const userToDelete = users[0];

        // Validar permissões
        if (deleterRole === 'administrator' && userToDelete.role !== 'operator') {
            throw new AppError('Administrator só pode deletar Operator', 403);
        }

        if (userToDelete.role === 'developer') {
            throw new AppError('Não é possível deletar Developer', 403);
        }

        // Deletar usuário
        await db.execute('DELETE FROM users WHERE id = ?', [id]);

        res.json({ message: 'Usuário deletado com sucesso' });
    }),

    // Resetar senha de usuário
    resetPassword: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const resetterRole = req.user.role;

        // Buscar usuário
        const [users] = await db.execute(
            'SELECT email, full_name, role FROM users WHERE id = ?',
            [id]
        );

        if (users.length === 0) {
            throw new AppError('Usuário não encontrado', 404);
        }

        const user = users[0];

        // Validar permissões
        if (resetterRole === 'administrator' && user.role !== 'operator') {
            throw new AppError('Administrator só pode resetar senha de Operator', 403);
        }

        // Gerar nova senha
        const randomPassword = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        // Atualizar senha
        await db.execute(
            'UPDATE users SET password_hash = ?, temp_password = 1 WHERE id = ?',
            [hashedPassword, id]
        );

        // Enviar email com nova senha
        try {
            await sendUserCreatedEmail(user.email, user.full_name, user.role, randomPassword);
        } catch (emailError) {
            console.error('Erro ao enviar email:', emailError);
        }

        res.json({ 
            message: 'Senha resetada com sucesso',
            tempPassword: randomPassword
        });
    })
};

module.exports = userManagementController;
