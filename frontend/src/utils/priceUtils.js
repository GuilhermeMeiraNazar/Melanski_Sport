/**
 * Utilitários para cálculo de preços e descontos
 * Centraliza a lógica de preços usada em ProductCard, Cart e Modal
 */

/**
 * Calcula o preço final com desconto aplicado
 * @param {number|string} basePrice - Preço base do produto
 * @param {number|string} discountPercentage - Porcentagem de desconto
 * @param {boolean|number} hasDiscount - Flag indicando se o desconto está ativo
 * @returns {number} - Preço final calculado
 */
export const calculateDiscountedPrice = (basePrice, discountPercentage, hasDiscount) => {
    const price = Number(basePrice) || 0;
    const discount = Number(discountPercentage) || 0;
    const isDiscountActive = hasDiscount === true || hasDiscount === 1;
    
    if (isDiscountActive && discount > 0) {
        return price * (1 - discount / 100);
    }
    
    return price;
};

/**
 * Verifica se um produto tem desconto ativo
 * @param {boolean|number} hasDiscount - Flag de desconto
 * @param {number|string} discountPercentage - Porcentagem de desconto
 * @returns {boolean}
 */
export const hasActiveDiscount = (hasDiscount, discountPercentage) => {
    const isActive = hasDiscount === true || hasDiscount === 1;
    const discount = Number(discountPercentage) || 0;
    return isActive && discount > 0;
};

/**
 * Formata preço para exibição (R$ 99,99)
 * @param {number} price - Preço a ser formatado
 * @returns {string}
 */
export const formatPrice = (price) => {
    return `R$ ${Number(price).toFixed(2).replace('.', ',')}`;
};

/**
 * Separa preço em partes (inteiro e centavos)
 * @param {number} price - Preço a ser separado
 * @returns {{integer: string, cents: string}}
 */
export const splitPrice = (price) => {
    const formatted = Number(price).toFixed(2);
    const [integer, cents] = formatted.split('.');
    return { integer, cents };
};

/**
 * Calcula o preço final de um item (usado no carrinho)
 * @param {Object} item - Item do produto
 * @returns {number}
 */
export const calculateFinalPrice = (item) => {
    const basePrice = Number(item.sale_price || item.price) || 0;
    return calculateDiscountedPrice(basePrice, item.discount_percentage, item.has_discount);
};
