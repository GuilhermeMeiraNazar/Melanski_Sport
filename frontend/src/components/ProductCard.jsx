import React from 'react';
import { FaShoppingCart, FaHeart, FaEye } from 'react-icons/fa';
import { calculateDiscountedPrice, hasActiveDiscount, formatPrice } from '../utils/priceUtils';
import { isOutOfStock } from '../utils/stockUtils';
import LazyImage from './LazyImage';

function ProductCard({ product, handleProductClick }) {
    // URL base da sua API
    const API_URL = 'http://localhost:3000'; 

    // LÓGICA DE IMAGEM
    const mainImage = product.images && product.images.length > 0 
        ? (product.images[0].startsWith('http') ? product.images[0] : `${API_URL}${product.images[0]}`)
        : null;

    // LÓGICA DE PREÇO - Usando utilitários centralizados
    const basePrice = Number(product.sale_price || product.price);
    const hasDiscount = hasActiveDiscount(product.has_discount, product.discount_percentage);
    const displayPrice = hasDiscount 
        ? calculateDiscountedPrice(basePrice, product.discount_percentage, product.has_discount)
        : basePrice;

    // LÓGICA DE ESTOQUE - Usando utilitário centralizado
    const outOfStock = isOutOfStock(product.stock, product.sizes);

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
                {!outOfStock && hasDiscount && <span className="badge-offer">OFERTA</span>}
                {!outOfStock && product.isLaunch && <span className="badge-new">NOVO</span>}
            </div>
            
            {/* IMAGEM */}
            <div className="image-container">
                {mainImage ? (
                    <LazyImage 
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
                
                {/* Lógica de Preço */}
                <div className="price-row">
                    <p className="price">
                        {formatPrice(displayPrice)}
                    </p>
                    
                    {hasDiscount && (
                        <span className="old-price-card">
                            {formatPrice(basePrice)}
                        </span>
                    )}
                </div>
            </div>
        </article>
    );
}

export default ProductCard;