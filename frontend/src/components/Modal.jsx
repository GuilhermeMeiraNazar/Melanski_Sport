import React, { useState } from 'react';
import { FaShoppingCart, FaWhatsapp } from 'react-icons/fa';

// Configuração do número da loja
const PHONE_NUMBER = '5511999999999'; 

function Modal({ selectedProduct, closeModal, addToCart }) {
    const [activeImgIndex, setActiveImgIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState(null);

    // Se não tiver produto selecionado, não renderiza nada
    if (!selectedProduct) return null;

    // Constantes e Arrays de dados
    const images = selectedProduct.images || [];
    const sizes = selectedProduct.sizes || [];
    const API_URL = 'http://localhost:5000';

    // --- LÓGICA DE PREÇOS E DESCONTO ---
    const currentPrice = Number(selectedProduct.price) || 0;
    const oldPrice = Number(selectedProduct.oldPrice) || 0;
    
    // Verifica se é oferta real para evitar cálculos errados
    // A flag isOffer deve ser true E o preço antigo deve ser maior que o atual
    const isOffer = selectedProduct.isOffer === true;
    const hasDiscount = isOffer && oldPrice > currentPrice;

    // Cálculo da porcentagem (arredondado)
    const discountPercent = hasDiscount 
        ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100)
        : 0;

    // Formatação visual do preço (separando inteiros e centavos)
    const formattedPrice = currentPrice.toFixed(2);
    const [priceInteger, priceDecimals] = formattedPrice.split('.');

    // --- FUNÇÕES DE AÇÃO ---
    const handleBuyWhatsapp = () => {
        if (sizes.length > 0 && !selectedSize) {
            alert("Por favor, selecione um tamanho antes de ir para o WhatsApp.");
            return;
        }

        let message = `Olá! Gostaria de comprar este item que vi no site:\n\n`;
        message += `*Produto:* ${selectedProduct.name}\n`;
        if (selectedSize) message += `*Tamanho:* ${selectedSize}\n`;
        message += `*Preço:* R$ ${formattedPrice.replace('.', ',')}\n`;
        message += `\nAguardo confirmação de disponibilidade!`;

        const url = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const onAddClick = () => {
        if (sizes.length > 0 && !selectedSize) {
            alert("Por favor, selecione um tamanho antes de adicionar.");
            return;
        }
        addToCart(selectedProduct, selectedSize);
        closeModal();
    };

    return (
        <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={closeModal}>✕</button>

                <div className="modal-body-grid">
                    {/* --- COLUNA DA ESQUERDA: GALERIA DE FOTOS --- */}
                    <div className="modal-gallery">
                        <div className="main-photo-frame">
                            {images.length > 0 ? (
                                <img 
                                    src={images[activeImgIndex].startsWith('http') ? images[activeImgIndex] : `${API_URL}${images[activeImgIndex]}`} 
                                    alt={selectedProduct.name} 
                                />
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
                                    <img 
                                        src={img.startsWith('http') ? img : `${API_URL}${img}`} 
                                        alt={`view ${idx}`} 
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- COLUNA DA DIREITA: DETALHES DO PRODUTO --- */}
                    <div className="modal-details">
                        <div className="product-header-info">
                            <h1>{selectedProduct.name}</h1>
                        </div>

                        <div className="price-section">
                            {/* Preço Antigo (só aparece se tiver desconto real) */}
                            {hasDiscount && (
                                <span className="old-price">
                                    R$ {oldPrice.toFixed(2).replace('.', ',')}
                                </span>
                            )}
                            
                            <div className="current-price-row">
                                <span className="currency">R$</span>
                                <span className="value">{priceInteger}</span>
                                <span className="cents">,{priceDecimals}</span>
                                
                                {/* Tag de desconto */}
                                {hasDiscount && (
                                    <span className="discount-tag">{discountPercent}% OFF</span>
                                )}
                            </div>
                        </div>

                        <div className="product-description">
                            <h3>Descrição</h3>
                            <p>{selectedProduct.description}</p>
                        </div>

                        <div className="variations-section">
                            <label>
                                Tamanho: 
                                <span style={{fontWeight: 'normal', color: selectedSize ? '#dc143c' : '#999'}}>
                                    {selectedSize || ' Selecione'}
                                </span>
                            </label>
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
                            <button className="btn-buy-now" onClick={handleBuyWhatsapp}>
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