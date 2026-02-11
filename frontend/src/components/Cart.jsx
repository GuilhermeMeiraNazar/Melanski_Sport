import React from 'react';
import { FaTrash, FaWhatsapp } from 'react-icons/fa';

// Dados de exemplo
const cartItemsMock = [
    {
        id: 1,
        name: "Camisa Oficial Edição 1 - Temporada 2024/25",
        size: "M",
        price: 224.36,
        quantity: 1,
        image: "https://placehold.co/150x150/f5f5f5/333?text=Frente-1"
    },
    {
        id: 2,
        name: "Camisa Oficial Edição 2 - Temporada 2024/25",
        size: "G",
        price: 198.30,
        quantity: 2,
        image: "https://placehold.co/150x150/f5f5f5/333?text=Frente-2"
    }
];

const Cart = ({ isOpen, onClose }) => {
    // Cálculo simples do total
    const total = cartItemsMock.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    if (!isOpen) return null;

    return (
        <div className="cart-overlay" onClick={onClose}>
            {/* O stopPropagation impede que o clique no carrinho feche ele mesmo */}
            <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
                
                <div className="cart-header">
                    <h2>Seu Carrinho</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="cart-items-wrapper">
                    {cartItemsMock.map((item) => (
                        <div className="cart-item-card" key={item.id}>
                            <div className="item-img">
                                <img src={item.image} alt={item.name} />
                            </div>
                            
                            <div className="item-info">
                                <div className="item-top">
                                    <h3>{item.name}</h3>
                                    <button className="remove-btn">
                                        <FaTrash />
                                    </button>
                                </div>
                                
                                <div className="item-details">
                                    Tam: {item.size}
                                </div>

                                <div className="item-bottom">
                                    <div className="qty-control">
                                        <button>-</button>
                                        <span>{item.quantity}</span>
                                        <button>+</button>
                                    </div>
                                    <div className="price">
                                        R$ {item.price.toFixed(2).replace('.', ',')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="cart-footer">
                    <div className="total-row">
                        <span>Total do Pedido:</span>
                        <strong>R$ {total.toFixed(2).replace('.', ',')}</strong>
                    </div>
                    <button className="btn-whatsapp">
                        <FaWhatsapp size={20} /> Finalizar no WhatsApp
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;