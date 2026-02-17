import React from 'react';
import { FaShoppingCart, FaHeart, FaEye } from 'react-icons/fa';

function ProductCard({ product, handleProductClick }) {
    // URL base da sua API
    const API_URL = 'http://localhost:5000'; 

    // LÓGICA DE IMAGEM
    // Verifica se existe imagem, se é link externo ou local
    const mainImage = product.images && product.images.length > 0 
        ? (product.images[0].startsWith('http') ? product.images[0] : `${API_URL}${product.images[0]}`)
        : null;

    // LÓGICA DE PREÇO
    // Convertemos para número para garantir operações matemáticas
    const currentPrice = Number(product.price);
    const oldPrice = Number(product.oldPrice);
    
    // Só consideramos oferta se a flag estiver ativa E o preço antigo for maior que o atual
    const isRealOffer = product.isOffer && oldPrice > currentPrice;

    return (
        <article className="product-card" onClick={() => handleProductClick(product)}>
            {/* BADGES */}
            <div className="product-badges">
                {isRealOffer && <span className="badge-offer">OFERTA</span>}
                {product.isLaunch && <span className="badge-new">NOVO</span>}
            </div>
            
            {/* IMAGEM */}
            <div className="image-container">
                {mainImage ? (
                    <img 
                        src={mainImage} 
                        alt={product.name} 
                        className="product-img" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                ) : (
                    <div className="product-img-fallback" style={{ background: '#f0f0f0', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                        <span>Sem imagem</span>
                    </div>
                )}
            </div>

            {/* INFORMAÇÕES */}
            <div className="card-info">
                <span className="category-tag">{product.type}</span>
                <h3>{product.name}</h3>
                
                <div className="price-row">
                    <p className="price">
                        R$ {currentPrice.toFixed(2).replace('.', ',')}
                    </p>
                    
                    {isRealOffer && (
                        <span className="old-price-card" style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.9em', marginLeft: '8px' }}>
                            R$ {oldPrice.toFixed(2).replace('.', ',')}
                        </span>
                    )}
                </div>
            </div>
        </article>
    );
}

export default ProductCard;