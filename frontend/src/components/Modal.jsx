import React, { useState } from 'react';
import { FaShoppingCart, FaWhatsapp } from 'react-icons/fa';

function Modal({ selectedProduct, closeModal, addToCart }) {
    const [activeImgIndex, setActiveImgIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState(null);

    if (!selectedProduct) return null;

    const images = selectedProduct.images || [];
    const sizes = selectedProduct.sizes || [];
    const discount = Math.round(((selectedProduct.oldPrice - selectedProduct.price) / selectedProduct.oldPrice) * 100);

    // Função interna para validar e chamar a prop do pai
    const onAddClick = () => {
        if (!selectedSize) {
            alert("Por favor, selecione um tamanho antes de adicionar.");
            return;
        }
        // Chama a função passada pelo App.jsx
        addToCart(selectedProduct, selectedSize);
    };

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

                        <div className="product-description">
                            <h3>Descrição</h3>
                            <p>{selectedProduct.description}</p>
                        </div>

                        <div className="variations-section">
                            <label>Tamanho: <span style={{fontWeight: 'normal', color: selectedSize ? '#dc143c' : '#999'}}>{selectedSize || 'Selecione'}</span></label>
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
                            {/* BOTÃO ALTERADO PARA ESTILO WHATSAPP */}
                            <button className="btn-buy-now">
                                <FaWhatsapp size={20} /> Comprar no WhatsApp
                            </button>
                            
                            <button className="btn-add-cart" onClick={onAddClick}>
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