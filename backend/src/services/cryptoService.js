const crypto = require('crypto');

/**
 * Crypto Service - Gerenciamento de Criptografia AES-256-GCM
 * 
 * Este serviço implementa criptografia e descriptografia de credenciais
 * usando AES-256-GCM (Galois/Counter Mode) que fornece:
 * - Confidencialidade (dados criptografados)
 * - Integridade (Authentication Tag detecta modificações)
 * - Autenticidade (garante que dados não foram alterados)
 */

class CryptoService {
    constructor() {
        this.algorithm = 'aes-256-gcm';
        this.ivLength = 16; // 128 bits
        this.authTagLength = 16; // 128 bits
        this.keyLength = 32; // 256 bits
    }

    /**
     * Valida a chave de criptografia
     * @param {string} encryptionKey - Chave em base64
     * @throws {Error} Se a chave for inválida
     */
    validateEncryptionKey(encryptionKey) {
        if (!encryptionKey) {
            throw new Error('ENCRYPTION_KEY não está configurada no .env');
        }

        try {
            const keyBuffer = Buffer.from(encryptionKey, 'base64');
            if (keyBuffer.length !== this.keyLength) {
                throw new Error(`ENCRYPTION_KEY deve ter ${this.keyLength} bytes (${this.keyLength * 8} bits)`);
            }
        } catch (error) {
            if (error.message.includes('ENCRYPTION_KEY deve ter')) {
                throw error;
            }
            throw new Error('ENCRYPTION_KEY tem formato inválido (deve ser base64)');
        }
    }

    /**
     * Criptografa credenciais usando AES-256-GCM
     * 
     * @param {Object} credentials - Objeto com credenciais em texto plano
     * @param {string} encryptionKey - Chave de criptografia em base64
     * @returns {Object} { encrypted: string, iv: string, authTag: string }
     * @throws {Error} Se a criptografia falhar
     */
    encrypt(credentials, encryptionKey) {
        try {
            // Validar chave
            this.validateEncryptionKey(encryptionKey);

            // Converter chave de base64 para Buffer
            const key = Buffer.from(encryptionKey, 'base64');

            // Gerar IV único (Initialization Vector)
            const iv = crypto.randomBytes(this.ivLength);

            // Criar cipher
            const cipher = crypto.createCipheriv(this.algorithm, key, iv);

            // Converter credenciais para JSON
            const credentialsJson = JSON.stringify(credentials);

            // Criptografar
            let encrypted = cipher.update(credentialsJson, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            // Obter Authentication Tag
            const authTag = cipher.getAuthTag();

            return {
                encrypted: encrypted,
                iv: iv.toString('hex'),
                authTag: authTag.toString('hex')
            };
        } catch (error) {
            console.error('❌ Erro ao criptografar credenciais:', error.message);
            throw new Error(`Falha na criptografia: ${error.message}`);
        }
    }

    /**
     * Descriptografa credenciais usando AES-256-GCM
     * 
     * @param {string} encryptedData - Dados criptografados em hex
     * @param {string} iv - Initialization Vector em hex
     * @param {string} authTag - Authentication Tag em hex
     * @param {string} encryptionKey - Chave de criptografia em base64
     * @returns {Object} Credenciais em texto plano
     * @throws {Error} Se a descriptografia falhar
     */
    decrypt(encryptedData, iv, authTag, encryptionKey) {
        try {
            // Validar chave
            this.validateEncryptionKey(encryptionKey);

            // Validar parâmetros
            if (!encryptedData || !iv || !authTag) {
                throw new Error('Dados criptografados, IV ou Authentication Tag ausentes');
            }

            // Converter de hex/base64 para Buffer
            const key = Buffer.from(encryptionKey, 'base64');
            const ivBuffer = Buffer.from(iv, 'hex');
            const authTagBuffer = Buffer.from(authTag, 'hex');

            // Validar tamanhos
            if (ivBuffer.length !== this.ivLength) {
                throw new Error('IV tem tamanho inválido');
            }
            if (authTagBuffer.length !== this.authTagLength) {
                throw new Error('Authentication Tag tem tamanho inválido');
            }

            // Criar decipher
            const decipher = crypto.createDecipheriv(this.algorithm, key, ivBuffer);
            
            // Definir Authentication Tag
            decipher.setAuthTag(authTagBuffer);

            // Descriptografar
            let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            // Converter JSON para objeto
            return JSON.parse(decrypted);
        } catch (error) {
            // Erros específicos
            if (error.message.includes('Unsupported state or unable to authenticate data')) {
                throw new Error('Falha na validação de integridade: dados corrompidos ou chave inválida');
            }
            if (error.message.includes('ENCRYPTION_KEY')) {
                throw error;
            }
            
            console.error('❌ Erro ao descriptografar credenciais:', error.message);
            throw new Error(`Falha na descriptografia: ${error.message}`);
        }
    }

    /**
     * Gera uma chave de criptografia segura
     * (Usado pelo script de setup)
     * 
     * @returns {string} Chave de 32 bytes em base64
     */
    generateEncryptionKey() {
        const key = crypto.randomBytes(this.keyLength);
        return key.toString('base64');
    }

    /**
     * Testa se a criptografia está funcionando corretamente
     * 
     * @param {string} encryptionKey - Chave para testar
     * @returns {boolean} true se funcionar corretamente
     */
    testEncryption(encryptionKey) {
        try {
            const testData = { test: 'encryption_test', timestamp: Date.now() };
            const encrypted = this.encrypt(testData, encryptionKey);
            const decrypted = this.decrypt(
                encrypted.encrypted,
                encrypted.iv,
                encrypted.authTag,
                encryptionKey
            );
            
            return JSON.stringify(testData) === JSON.stringify(decrypted);
        } catch (error) {
            console.error('❌ Teste de criptografia falhou:', error.message);
            return false;
        }
    }
}

// Singleton
const cryptoService = new CryptoService();

module.exports = cryptoService;
