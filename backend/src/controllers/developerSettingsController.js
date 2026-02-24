const db = require('../config/database');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const developerSettingsController = {
    // Obter todas as configurações
    getSettings: asyncHandler(async (req, res) => {
        console.log('🔧 Buscando configurações do developer...');

        const query = `
            SELECT 
                setting_key,
                setting_value,
                setting_type,
                description,
                updated_at
            FROM developer_settings
            ORDER BY setting_key
        `;

        const [settings] = await db.execute(query);

        // Converter valores para tipos apropriados
        const settingsObj = {};
        settings.forEach(setting => {
            let value = setting.setting_value;
            
            // Converter para tipo apropriado
            if (setting.setting_type === 'boolean') {
                value = value === 'true' || value === '1';
            } else if (setting.setting_type === 'number') {
                value = parseInt(value, 10);
            } else if (setting.setting_type === 'json') {
                try {
                    value = JSON.parse(value);
                } catch (e) {
                    console.error(`Erro ao parsear JSON para ${setting.setting_key}:`, e);
                }
            }

            settingsObj[setting.setting_key] = {
                value,
                type: setting.setting_type,
                description: setting.description,
                updatedAt: setting.updated_at
            };
        });

        res.json({ settings: settingsObj });
        console.log('✅ Configurações enviadas');
    }),

    // Atualizar uma configuração específica
    updateSetting: asyncHandler(async (req, res) => {
        const { settingKey, settingValue } = req.body;
        const userId = req.user.id;

        console.log(`🔧 Atualizando configuração: ${settingKey} = ${settingValue}`);

        if (!settingKey || settingValue === undefined) {
            throw new AppError('settingKey e settingValue são obrigatórios', 400);
        }

        // Verificar se a configuração existe
        const checkQuery = `
            SELECT setting_type FROM developer_settings
            WHERE setting_key = ?
        `;
        const [existing] = await db.execute(checkQuery, [settingKey]);

        if (existing.length === 0) {
            throw new AppError('Configuração não encontrada', 404);
        }

        const settingType = existing[0].setting_type;

        // Validar tipo do valor
        let valueToStore = settingValue;
        if (settingType === 'boolean') {
            valueToStore = settingValue ? 'true' : 'false';
        } else if (settingType === 'number') {
            if (isNaN(settingValue)) {
                throw new AppError('Valor deve ser um número', 400);
            }
            valueToStore = String(settingValue);
        } else if (settingType === 'json') {
            try {
                valueToStore = JSON.stringify(settingValue);
            } catch (e) {
                throw new AppError('Valor JSON inválido', 400);
            }
        } else {
            valueToStore = String(settingValue);
        }

        // Atualizar configuração
        const updateQuery = `
            UPDATE developer_settings
            SET setting_value = ?,
                updated_by = ?
            WHERE setting_key = ?
        `;
        await db.execute(updateQuery, [valueToStore, userId, settingKey]);

        console.log(`✅ Configuração ${settingKey} atualizada com sucesso`);

        res.json({
            message: 'Configuração atualizada com sucesso',
            settingKey,
            settingValue: valueToStore
        });
    }),

    // Atualizar múltiplas configurações de uma vez
    updateMultipleSettings: asyncHandler(async (req, res) => {
        const { settings } = req.body;
        const userId = req.user.id;

        console.log('🔧 Atualizando múltiplas configurações...');

        if (!settings || typeof settings !== 'object') {
            throw new AppError('settings deve ser um objeto', 400);
        }

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            for (const [key, value] of Object.entries(settings)) {
                // Verificar se a configuração existe
                const [existing] = await connection.execute(
                    'SELECT setting_type FROM developer_settings WHERE setting_key = ?',
                    [key]
                );

                if (existing.length === 0) {
                    console.warn(`Configuração ${key} não encontrada, pulando...`);
                    continue;
                }

                const settingType = existing[0].setting_type;

                // Converter valor para string apropriada
                let valueToStore = value;
                if (settingType === 'boolean') {
                    valueToStore = value ? 'true' : 'false';
                } else if (settingType === 'number') {
                    valueToStore = String(value);
                } else if (settingType === 'json') {
                    valueToStore = JSON.stringify(value);
                } else {
                    valueToStore = String(value);
                }

                // Atualizar
                await connection.execute(
                    'UPDATE developer_settings SET setting_value = ?, updated_by = ? WHERE setting_key = ?',
                    [valueToStore, userId, key]
                );
            }

            await connection.commit();
            connection.release();

            console.log('✅ Múltiplas configurações atualizadas com sucesso');

            res.json({
                message: 'Configurações atualizadas com sucesso',
                updatedCount: Object.keys(settings).length
            });
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    }),

    // Verificar se uma feature está ativa (usado por outros controllers)
    checkFeature: asyncHandler(async (req, res) => {
        const { feature } = req.params;

        console.log(`🔧 Verificando feature: ${feature}`);

        const query = `
            SELECT setting_value
            FROM developer_settings
            WHERE setting_key = ?
        `;
        const [results] = await db.execute(query, [feature]);

        if (results.length === 0) {
            throw new AppError('Feature não encontrada', 404);
        }

        const isActive = results[0].setting_value === 'true' || results[0].setting_value === '1';

        res.json({
            feature,
            isActive
        });
    }),

    // Resetar todas as configurações para o padrão
    resetToDefaults: asyncHandler(async (req, res) => {
        const userId = req.user.id;

        console.log('🔧 Resetando configurações para o padrão...');

        const resetQuery = `
            UPDATE developer_settings
            SET 
                setting_value = CASE setting_key
                    WHEN 'feature_orders' THEN 'true'
                    WHEN 'feature_logs' THEN 'true'
                    WHEN 'feature_appearance' THEN 'true'
                    WHEN 'feature_export' THEN 'true'
                    WHEN 'feature_insights' THEN 'true'
                    WHEN 'feature_users' THEN 'true'
                    WHEN 'max_products' THEN '1000'
                    WHEN 'max_categories' THEN '50'
                    WHEN 'max_users' THEN '100'
                    WHEN 'allow_theme_editing' THEN 'true'
                    WHEN 'maintenance_mode' THEN 'false'
                    ELSE setting_value
                END,
                updated_by = ?
            WHERE setting_key IN (
                'feature_orders', 'feature_logs', 'feature_appearance', 
                'feature_export', 'feature_insights', 'feature_users',
                'max_products', 'max_categories', 'max_users',
                'allow_theme_editing', 'maintenance_mode'
            )
        `;

        await db.execute(resetQuery, [userId]);

        console.log('✅ Configurações resetadas para o padrão');

        res.json({
            message: 'Configurações resetadas para o padrão com sucesso'
        });
    })
};

module.exports = developerSettingsController;
