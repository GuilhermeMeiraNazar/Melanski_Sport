import React from 'react';
import { FaShoppingCart, FaHeart, FaEye } from 'react-icons/fa';

function ProductCard({ product, handleProductClick }) {
    // URL base da sua API
    const API_URL = 'http://localhost:3000'; 

    // LÓGICA DE IMAGEM
    // Verifica se existe imagem, se é link externo ou local
    const mainImage = product.images && product.images.length > 0 
        ? (product.images[0].startsWith('http') ? product.images[0] : `${API_URL}${product.images[0]}`)
        : null;

    // LÓGICA DE PREÇO (Item 2 e 5)
    // Use sale_price as base price, fallback to price for compatibility
    const basePrice = Number(product.sale_price || product.price);
    
    // Check if product has active discount
    // has_discount can be boolean or number (1/0 from MySQL)
    const hasActiveDiscount = (product.has_discount === true || product.has_discount === 1) 
                              && product.discount_percentage > 0;
    
    // Calculate discounted price if discount is active
    const discountedPrice = hasActiveDiscount 
        ? basePrice * (1 - product.discount_percentage / 100)
        : basePrice;
    
    // Determine which price to display
    const displayPrice = hasActiveDiscount ? discountedPrice : basePrice;

    // LÓGICA DE ESTOQUE
    // Verifica se o produto está esgotado
    const isOutOfStock = () => {
        // Se sizes é um array, verifica se está vazio
        if (Array.isArray(product.sizes)) {
            return product.sizes.length === 0;
        }
        // Se stock é um objeto, verifica se todos os valores são 0
        if (typeof product.stock === 'object' && product.stock !== null) {
            return Object.values(product.stock).every(qty => qty === 0);
        }
        // Se stock é um número, verifica se é 0
        if (typeof product.stock === 'number') {
            return product.stock === 0;
        }
        // Por padrão, considera que tem estoque
        return false;
    };

    const outOfStock = isOutOfStock();

    // Função para lidar com o clique - bloqueia se estiver esgotado
    const handleClick = () => {
        if (!outOfStock) {
            handleProductClick(product);
        }
    };

    return (
        <article className={`product-card ${outOfStock ? 'out-of-stock' : ''}`} onClick={handleClick}>
            {/* BADGES (Item 1 - Ícone verde para lançamentos) */}
            <div className="product-badges">
                {outOfStock && <span className="badge-out-of-stock">ESGOTADO</span>}
                {!outOfStock && hasActiveDiscount && <span className="badge-offer">OFERTA</span>}
                {!outOfStock && product.isLaunch && <span className="badge-new">NOVO</span>}
            </div>
            
            {/* IMAGEM */}
            <div className="image-container">
                {mainImage ? (
                    <img 
                        src={mainImage} 
                        alt={product.name} 
                        className="product-img"
                    />
                ) : (
                    <div className="product-img-fallback" style={{ background: '#f0f0f0', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                        <span>Sem imagem</span>
                    </div>
                )}
            </div>

            {/* INFORMAÇÕES */}
            <div className="card-info">
                <div>
                    <span className="category-tag">{product.type}</span>
                    {/* O CSS encarrega-se da truncagem (...) e altura fixa */}
                    <h3>{product.name}</h3>
                </div>
                
                {/* Lógica de Preço (Item 2, 3 e 5) */}
                <div className="price-row">
                    {/* Preço de Venda (Se desconto ativo, mostra preço com desconto. Se normal, mostra preço base) */}
                    <p className="price">
                        R$ {displayPrice.toFixed(2).replace('.', ',')}
                    </p>
                    
                    {/* Preço Riscado (Aparece APENAS se tiver desconto ativo) */}
                    {hasActiveDiscount && (
                        <span className="old-price-card">
                            R$ {basePrice.toFixed(2).replace('.', ',')}
                        </span>
                    )}
                </div>
            </div>
        </article>
    );
}

export default ProductCard;