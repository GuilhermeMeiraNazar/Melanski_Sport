/**
 * Helpers para chamadas de API
 * Funções auxiliares para simplificar interações com a API
 */

/**
 * Extrai mensagem de erro de uma resposta de API
 * @param {Error} error - Objeto de erro do axios
 * @returns {string} - Mensagem de erro formatada
 */
export const getErrorMessage = (error) => {
    if (error.response?.data?.error) {
        return error.response.data.error;
    }
    
    if (error.response?.data?.message) {
        return error.response.data.message;
    }
    
    if (error.message) {
        return error.message;
    }
    
    return 'Erro ao processar requisição';
};

/**
 * Verifica se o erro é de autenticação
 * @param {Error} error - Objeto de erro
 * @returns {boolean}
 */
export const isAuthError = (error) => {
    return error.response?.status === 401;
};

/**
 * Verifica se o erro é de permissão
 * @param {Error} error - Objeto de erro
 * @returns {boolean}
 */
export const isPermissionError = (error) => {
    return error.response?.status === 403;
};

/**
 * Verifica se o erro é de validação
 * @param {Error} error - Objeto de erro
 * @returns {boolean}
 */
export const isValidationError = (error) => {
    return error.response?.status === 400;
};

/**
 * Constrói query string a partir de objeto de parâmetros
 * @param {Object} params - Objeto com parâmetros
 * @returns {string} - Query string formatada
 */
export const buildQueryString = (params = {}) => {
    const filtered = Object.entries(params)
        .filter(([_, value]) => value !== '' && value !== null && value !== undefined)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    
    return new URLSearchParams(filtered).toString();
};

/**
 * Faz retry de uma requisição em caso de falha
 * @param {Function} fn - Função assíncrona a ser executada
 * @param {number} retries - Número de tentativas
 * @param {number} delay - Delay entre tentativas em ms
 * @returns {Promise}
 */
export const retryRequest = async (fn, retries = 3, delay = 1000) => {
    try {
        return await fn();
    } catch (error) {
        if (retries === 0 || isAuthError(error) || isPermissionError(error)) {
            throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryRequest(fn, retries - 1, delay);
    }
};
