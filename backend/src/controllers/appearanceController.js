const db = require('../config/database');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// Temas pré-definidos (NÃO editáveis)
const PREDEFINED_THEMES = {
    default: {
        primary_color: '#dc143c',
        secondary_color: '#c41230',
        accent_color: '#ff1744',
        background_color: '#ffffff',
        background_secondary: '#f5f5f5',
        background_dark: '#2c3e50',
        text_primary: '#333333',
        text_secondary: '#666666',
        text_light: '#999999',
        text_white: '#ffffff',
        button_primary_bg: '#dc143c',
        button_primary_text: '#ffffff',
        button_secondary_bg: '#6c757d',
        button_secondary_text: '#ffffff',
        border_color: '#e0e0e0',
        border_light: '#f0f0f0',
        border_dark: '#cccccc',
        success_color: '#28a745',
        warning_color: '#ffc107',
        error_color: '#dc3545',
        info_color: '#17a2b8'
    },
    dark: {
        primary_color: '#ff4757',           // Rosa vibrante para botões e destaques
        secondary_color: '#ee5a6f',         // Rosa mais suave para hover
        accent_color: '#ff6b81',            // Rosa claro para acentos
        background_color: '#1a1d2e',        // Azul escuro profundo para cards e modais
        background_secondary: '#151824',    // Azul escuro mais escuro para sidebar e áreas secundárias
        background_dark: '#0f111a',         // Quase preto para botões de tamanho e elementos escuros
        text_primary: '#f0f0f0',            // Branco suave para títulos (melhor contraste)
        text_secondary: '#b8bcc8',          // Cinza claro para textos secundários
        text_light: '#8a8f9e',              // Cinza médio para textos leves
        text_white: '#ffffff',              // Branco puro para textos em botões
        button_primary_bg: '#ff4757',       // Rosa para botões primários
        button_primary_text: '#ffffff',     // Branco para texto em botões primários
        button_secondary_bg: '#0f111a',     // Quase preto para botões secundários
        button_secondary_text: '#f0f0f0',   // Branco suave para texto em botões secundários
        border_color: '#2a2f3f',            // Cinza azulado para bordas
        border_light: '#353a4a',            // Cinza azulado claro para bordas leves
        border_dark: '#1f2330',             // Cinza azulado escuro para bordas escuras
        success_color: '#2ed573',           // Verde para sucesso
        warning_color: '#ffa502',           // Laranja para avisos
        error_color: '#ff4757',             // Rosa para erros
        info_color: '#5f9fff'               // Azul claro para informações
    },
    light: {
        primary_color: '#3498db',
        secondary_color: '#2980b9',
        accent_color: '#5dade2',
        background_color: '#ffffff',
        background_secondary: '#f8f9fa',
        background_dark: '#e9ecef',
        text_primary: '#2c3e50',
        text_secondary: '#7f8c8d',
        text_light: '#95a5a6',
        text_white: '#ffffff',
        button_primary_bg: '#3498db',
        button_primary_text: '#ffffff',
        button_secondary_bg: '#95a5a6',
        button_secondary_text: '#ffffff',
        border_color: '#dee2e6',
        border_light: '#e9ecef',
        border_dark: '#ced4da',
        success_color: '#27ae60',
        warning_color: '#f39c12',
        error_color: '#e74c3c',
        info_color: '#3498db'
    }
};

const appearanceController = {
    // Obter temas personalizados (custom1 e custom2)
    getCustomThemes: asyncHandler(async (req, res) => {
        console.log('🎨 Buscando temas personalizados...');

        const query = `
            SELECT setting_key, setting_value
            FROM appearance_settings
            WHERE setting_key IN ('custom_theme_1', 'custom_theme_2')
        `;

        const [results] = await db.execute(query);

        const themes = {
            custom1: PREDEFINED_THEMES.default, // Padrão se não existir
            custom2: PREDEFINED_THEMES.default
        };

        results.forEach(row => {
            try {
                if (row.setting_key === 'custom_theme_1') {
                    themes.custom1 = JSON.parse(row.setting_value);
                } else if (row.setting_key === 'custom_theme_2') {
                    themes.custom2 = JSON.parse(row.setting_value);
                }
            } catch (error) {
                console.error(`Erro ao parsear ${row.setting_key}:`, error);
            }
        });

        res.json({ themes });
        console.log('✅ Temas personalizados enviados');
    }),

    // Obter tema ativo
    getActiveTheme: asyncHandler(async (req, res) => {
        console.log('🎨 Buscando tema ativo...');

        const query = `
            SELECT setting_value
            FROM appearance_settings
            WHERE setting_key = 'active_theme'
        `;

        const [results] = await db.execute(query);
        const theme = results.length > 0 ? results[0].setting_value : 'default';

        res.json({ theme });
        console.log(`✅ Tema ativo: ${theme}`);
    }),

    // Salvar tema personalizado (custom1 ou custom2)
    saveCustomTheme: asyncHandler(async (req, res) => {
        const { themeName, colors } = req.body;
        const userId = req.user.id;

        console.log(`🎨 Salvando tema personalizado: ${themeName}`);

        if (themeName !== 'custom1' && themeName !== 'custom2') {
            throw new AppError('Nome de tema inválido. Use custom1 ou custom2', 400);
        }

        if (!colors || typeof colors !== 'object') {
            throw new AppError('Cores inválidas', 400);
        }

        const settingKey = themeName === 'custom1' ? 'custom_theme_1' : 'custom_theme_2';
        const colorsJson = JSON.stringify(colors);

        // Verificar se já existe
        const checkQuery = `
            SELECT id FROM appearance_settings
            WHERE setting_key = ?
        `;
        const [existing] = await db.execute(checkQuery, [settingKey]);

        if (existing.length > 0) {
            // Atualizar
            const updateQuery = `
                UPDATE appearance_settings
                SET setting_value = ?,
                    is_default = 0,
                    updated_by = ?
                WHERE setting_key = ?
            `;
            await db.execute(updateQuery, [colorsJson, userId, settingKey]);
        } else {
            // Inserir
            const insertQuery = `
                INSERT INTO appearance_settings (setting_key, setting_value, is_default, updated_by)
                VALUES (?, ?, 0, ?)
            `;
            await db.execute(insertQuery, [settingKey, colorsJson, userId]);
        }

        console.log(`✅ Tema ${themeName} salvo com sucesso`);

        res.json({
            message: `Tema ${themeName} salvo com sucesso`
        });
    }),

    // Aplicar tema no site (ativo)
    applyActiveTheme: asyncHandler(async (req, res) => {
        const { theme } = req.body;
        const userId = req.user.id;

        console.log(`🎨 Aplicando tema: ${theme}`);

        if (!theme) {
            throw new AppError('Tema não especificado', 400);
        }

        let themeColors;

        // Verificar se é tema pré-definido
        if (PREDEFINED_THEMES[theme]) {
            themeColors = PREDEFINED_THEMES[theme];
        } 
        // Verificar se é tema personalizado
        else if (theme === 'custom1' || theme === 'custom2') {
            const settingKey = theme === 'custom1' ? 'custom_theme_1' : 'custom_theme_2';
            const query = `
                SELECT setting_value
                FROM appearance_settings
                WHERE setting_key = ?
            `;
            const [results] = await db.execute(query, [settingKey]);

            if (results.length === 0) {
                throw new AppError('Tema personalizado não encontrado', 404);
            }

            try {
                themeColors = JSON.parse(results[0].setting_value);
            } catch (error) {
                throw new AppError('Erro ao carregar tema personalizado', 500);
            }
        } else {
            throw new AppError('Tema não encontrado', 404);
        }

        // Iniciar transação
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Atualizar cada cor na tabela appearance_settings
            for (const [key, value] of Object.entries(themeColors)) {
                const updateQuery = `
                    UPDATE appearance_settings
                    SET setting_value = ?,
                        is_default = ?,
                        updated_by = ?
                    WHERE setting_key = ?
                `;

                const isDefault = PREDEFINED_THEMES[theme] ? 1 : 0;
                await connection.execute(updateQuery, [value, isDefault, userId, key]);
            }

            // Atualizar tema ativo
            await connection.execute(
                `UPDATE appearance_settings 
                SET setting_value = ?, 
                    is_default = ?,
                    updated_by = ?
                WHERE setting_key = 'active_theme'`,
                [theme, PREDEFINED_THEMES[theme] ? 1 : 0, userId]
            );

            await connection.commit();
            connection.release();

            console.log(`✅ Tema ${theme} aplicado com sucesso`);

            res.json({
                message: `Tema aplicado com sucesso`,
                theme
            });
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    }),

    // Obter configurações atuais (para aplicar no site - rota pública)
    getSettings: asyncHandler(async (req, res) => {
        console.log('🎨 Buscando configurações de aparência...');

        const query = `
            SELECT 
                setting_key,
                setting_value,
                is_default,
                updated_at
            FROM appearance_settings
            WHERE setting_key NOT IN ('custom_theme_1', 'custom_theme_2')
            ORDER BY setting_key
        `;

        const [settings] = await db.execute(query);

        // Converter array para objeto
        const settingsObj = {};
        settings.forEach(setting => {
            settingsObj[setting.setting_key] = {
                value: setting.setting_value,
                isDefault: setting.is_default === 1,
                updatedAt: setting.updated_at
            };
        });

        res.json({
            settings: settingsObj
        });

        console.log('✅ Configurações enviadas');
    })
};

module.exports = appearanceController;
