/**
 * Utilitários para gerenciamento de estoque
 * Centraliza a lógica de verificação de estoque usada em vários componentes
 */

/**
 * Verifica se um produto está esgotado
 * @param {Object|Array|number} stock - Estoque do produto (pode ser objeto, array ou número)
 * @param {Array} sizes - Array de tamanhos disponíveis
 * @returns {boolean}
 */
export const isOutOfStock = (stock, sizes = []) => {
    // Se sizes é um array, verifica se está vazio
    if (Array.isArray(sizes)) {
        return sizes.length === 0;
    }
    
    // Se stock é um objeto, verifica se todos os valores são 0
    if (typeof stock === 'object' && stock !== null && !Array.isArray(stock)) {
        return Object.values(stock).every(qty => qty === 0);
    }
    
    // Se stock é um número, verifica se é 0
    if (typeof stock === 'number') {
        return stock === 0;
    }
    
    // Por padrão, considera que tem estoque
    return false;
};

/**
 * Formata estoque para exibição
 * @param {Object|number} stock - Estoque do produto
 * @returns {string}
 */
export const formatStock = (stock) => {
    if (typeof stock === 'object' && stock !== null) {
        // Se for objeto, é estoque por tamanho
        return Object.entries(stock)
            .filter(([_, q]) => q > 0)
            .map(([s, q]) => `${s}: ${q}`)
            .join(', ') || 'Sem estoque';
    }
    // Se for número, é estoque simples
    return stock || 0;
};

/**
 * Verifica se uma categoria usa tamanhos
 * @param {Object|number} categoryData - Dados da categoria ou ID
 * @param {Array} categories - Lista de categorias disponíveis
 * @returns {boolean}
 */
export const usesSizes = (categoryData, categories = []) => {
    // Se receber um objeto de categoria com has_sizes
    if (typeof categoryData === 'object' && categoryData !== null) {
        return categoryData.has_sizes === 1 || categoryData.has_sizes === true;
    }
    
    // Se receber apenas o ID, buscar na lista de categorias
    if (typeof categoryData === 'number' && categories.length > 0) {
        const cat = categories.find(c => c.id === categoryData);
        return cat ? (cat.has_sizes === 1 || cat.has_sizes === true) : false;
    }
    
    return false;
};
