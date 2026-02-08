import React from 'react';
import { FaShoppingCart, FaHeart } from 'react-icons/fa';

function ProductCard({ product, handleProductClick }) {
    return (
        /* Removida a key daqui, ela deve ficar no map do App.jsx */
        <article className="product-card" onClick={() => handleProductClick(product)}>
            {product.isOffer && <span className="badge-offer">OFERTA</span>}
            <div className="image-container">
                <div className="product-img"></div>
                <button className="wishlist-btn" onClick={(e) => e.stopPropagation()}>
                    <FaHeart />
                </button>
            </div>
            <div className="card-info">
                <span className="category-tag">{product.type}</span>
                <h3>{product.name}</h3>
                <div className="price-row">
                    <p className="price">R$ {product.price.replace('.', ',')}</p>
                </div>
                <button className="btn-buy">
                    <FaShoppingCart /> Comprar
                </button>
            </div>
        </article>
    );
}

export default ProductCard;