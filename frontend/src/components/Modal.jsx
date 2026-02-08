import React, { useState } from 'react';
import { FaWhatsapp, FaShoppingCart } from 'react-icons/fa';

function Modal({ selectedProduct, closeModal }) {
    const [activeImgIndex, setActiveImgIndex] = useState(0);

    if (!selectedProduct) return null;

    return (
        <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={closeModal}>✕</button>

                <div className="modal-body">
                    <div className="modal-left-col">
                        <div className="header-info">
                            <span className="modal-category">{selectedProduct.type}</span>
                            <h2>{selectedProduct.name}</h2>
                        </div>
                        
                        <div className="modal-split-mobile">
                            <div className="desc-container">
                                <p className="modal-desc">
                                    Garanta já o seu! Produto oficial com qualidade premium, tecido respirável ideal.
                                    Entrega rápida para todo o Brasil.
                                </p>
                            </div>

                            <div className="price-action-group">
                                <div className="modal-price">R$ {selectedProduct.price.replace('.', ',')}</div>
                                <div className="modal-actions">
                                    <button className="btn-whatsapp">
                                        <FaWhatsapp /> <span>WhatsApp</span>
                                    </button>
                                    <button className="btn-add-cart">
                                        <FaShoppingCart /> <span>Carrinho</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-right-col">
                        <div className="main-photo">
                            <span>Foto {activeImgIndex + 1}</span>
                        </div>
                        <div className="photo-thumbnails">
                            {[0, 1, 2].map((idx) => (
                                <div
                                    key={idx}
                                    className={`thumb ${activeImgIndex === idx ? 'active' : ''}`}
                                    onClick={() => setActiveImgIndex(idx)}
                                >
                                    {idx + 1}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Modal;