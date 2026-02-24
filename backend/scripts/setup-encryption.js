const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Script de Setup - Geração de Chave de Criptografia
 * 
 * Este script gera uma chave de criptografia segura de 256 bits (32 bytes)
 * para ser usada no sistema de gerenciamento de credenciais criptografadas.
 */

function generateEncryptionKey() {
    // Gerar 32 bytes aleatórios (256 bits) usando gerador criptograficamente seguro
    const key = crypto.randomBytes(32);
    
    // Codificar em base64 para armazenamento no .env
    const keyBase64 = key.toString('base64');
    
    return keyBase64;
}

function main() {
    console.log('');
    console.log('='.repeat(70));
    console.log('  SETUP - GERAÇÃO DE CHAVE DE CRIPTOGRAFIA');
    console.log('='.repeat(70));
    console.log('');
    
    // Gerar chave
    const encryptionKey = generateEncryptionKey();
    
    console.log('✅ Chave de criptografia gerada com sucesso!');
    console.log('');
    console.log('🔑 ENCRYPTION_KEY:');
    console.log('');
    console.log(`   ${encryptionKey}`);
    console.log('');
    console.log('='.repeat(70));
    console.log('');
    console.log('📋 INSTRUÇÕES:');
    console.log('');
    console.log('1. Copie a chave acima');
    console.log('2. Abra o arquivo backend/.env');
    console.log('3. Adicione a seguinte linha:');
    console.log('');
    console.log(`   ENCRYPTION_KEY=${encryptionKey}`);
    console.log('');
    console.log('4. Salve o arquivo .env');
    console.log('5. Reinicie o servidor backend');
    console.log('');
    console.log('⚠️  IMPORTANTE:');
    console.log('');
    console.log('   - NUNCA compartilhe esta chave com ninguém');
    console.log('   - NUNCA commite o arquivo .env no Git');
    console.log('   - Faça backup desta chave em local seguro');
    console.log('   - Se perder a chave, não poderá descriptografar credenciais');
    console.log('');
    console.log('='.repeat(70));
    console.log('');
    
    // Opcional: Salvar em arquivo temporário
    const tempFile = path.join(__dirname, '..', '.encryption-key.txt');
    try {
        fs.writeFileSync(tempFile, `ENCRYPTION_KEY=${encryptionKey}\n\n⚠️  ATENÇÃO: Delete este arquivo após adicionar a chave ao .env!\n`);
        console.log(`💾 Chave também salva em: ${tempFile}`);
        console.log('   (Delete este arquivo após adicionar ao .env)');
        console.log('');
    } catch (error) {
        // Ignorar erro se não conseguir salvar
    }
}

// Executar script
if (require.main === module) {
    main();
}

module.exports = { generateEncryptionKey };
