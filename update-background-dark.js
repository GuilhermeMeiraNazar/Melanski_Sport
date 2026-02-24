const mysql = require('mysql2/promise');

async function updateBackgroundDark() {
    let connection;
    try {
        // Connect to database
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'admin',
            password: 'admin',
            database: 'loja_camisas'
        });

        console.log('✅ Connected to database');

        // First, check current values
        const [currentRows] = await connection.execute(
            `SELECT setting_key, setting_value FROM appearance_settings WHERE setting_key LIKE '%background_dark%'`
        );
        
        console.log('\n📊 Current background_dark values:');
        currentRows.forEach(row => {
            console.log(`  ${row.setting_key}: ${row.setting_value}`);
        });

        // Update all theme background_dark values to #111111
        const updateQuery = `
            UPDATE appearance_settings 
            SET setting_value = '#111111'
            WHERE setting_key IN (
                'padrao_background_dark',
                'escuro_background_dark',
                'azul_background_dark',
                'verde_background_dark'
            )
        `;

        const [result] = await connection.execute(updateQuery);
        console.log(`\n✅ Updated ${result.affectedRows} rows`);

        // Verify the changes
        const [updatedRows] = await connection.execute(
            `SELECT setting_key, setting_value FROM appearance_settings WHERE setting_key LIKE '%background_dark%'`
        );
        
        console.log('\n📊 Updated background_dark values:');
        updatedRows.forEach(row => {
            console.log(`  ${row.setting_key}: ${row.setting_value}`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n✅ Database connection closed');
        }
    }
}

updateBackgroundDark();
