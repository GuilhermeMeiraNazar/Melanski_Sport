import React from 'react';
import { FaShoppingCart, FaHeart } from 'react-icons/fa';

function ProductCard({ product, handleProductClick }) {
    return (
        <article className="product-card" onClick={() => handleProductClick(product)}>
            {product.isOffer && <span className="badge-offer">OFERTA</span>}
            <div className="image-container">
                <div className="product-img"></div>
            </div>
            <div className="card-info">
                <span className="category-tag">{product.type}</span>
                <h3>{product.name}</h3>
                <div className="price-row">
                    <p className="price">R$ {product.price.replace('.', ',')}</p>
                </div>
            </div>
        </article>
    );
}

export default ProductCard;