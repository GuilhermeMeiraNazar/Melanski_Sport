import React, { useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';

function Modal({ selectedProduct, closeModal }) {
    const [activeImgIndex, setActiveImgIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState(null);

    if (!selectedProduct) return null;

    const images = selectedProduct.images || [];
    const sizes = selectedProduct.sizes || [];
    const discount = Math.round(((selectedProduct.oldPrice - selectedProduct.price) / selectedProduct.oldPrice) * 100);

    return (
        <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={closeModal}>✕</button>

                <div className="modal-body-grid">
                    {/* COLUNA DA ESQUERDA: GALERIA */}
                    <div className="modal-gallery">
                        <div className="main-photo-frame">
                            {images.length > 0 ? (
                                <img src={images[activeImgIndex]} alt={selectedProduct.name} />
                            ) : (
                                <div className="no-photo">Sem Imagem</div>
                            )}
                        </div>
                        <div className="thumbnails-scroll">
                            {images.map((img, idx) => (
                                <div
                                    key={idx}
                                    className={`thumb-item ${activeImgIndex === idx ? 'active' : ''}`}
                                    onMouseEnter={() => setActiveImgIndex(idx)}
                                    onClick={() => setActiveImgIndex(idx)}
                                >
                                    <img src={img} alt={`view ${idx}`} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* COLUNA DA DIREITA: INFORMAÇÕES */}
                    <div className="modal-details">
                        <div className="product-header-info">
                            <h1>{selectedProduct.name}</h1>
                        </div>

                        <div className="price-section">
                            {selectedProduct.oldPrice && (
                                <span className="old-price">R$ {selectedProduct.oldPrice.replace('.', ',')}</span>
                            )}
                            <div className="current-price-row">
                                <span className="currency">R$</span>
                                <span className="value">{selectedProduct.price.split('.')[0]}</span>
                                <span className="cents">,{selectedProduct.price.split('.')[1]}</span>
                                <span className="discount-tag">{discount}% OFF</span>
                            </div>
                        </div>

                        {/* DESCRIÇÃO DO PRODUTO (NOVO CAMPO) */}
                        <div className="product-description">
                            <h3>Descrição</h3>
                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                                Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris 
                                nisi ut aliquip ex ea commodo consequat.
                            </p>
                        </div>

                        <div className="variations-section">
                            <label>Tamanho:</label>
                            <div className="size-selector">
                                {sizes.map(size => (
                                    <button 
                                        key={size} 
                                        className={`size-opt ${selectedSize === size ? 'selected' : ''}`}
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="action-buttons">
                            <button className="btn-buy-now">Comprar agora</button>
                            <button className="btn-add-cart">
                                <FaShoppingCart /> Adicionar ao carrinho
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Modal;