import React from 'react';
import { FaTrash, FaWhatsapp } from 'react-icons/fa';

// --- CONFIGURAÇÃO ---
const PHONE_NUMBER = '5511999999999'; 

const Cart = ({ isOpen, onClose, cartItems, removeItem }) => {
    
    // Cálculo do total
    const total = cartItems.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);

    // Função para gerar mensagem do pedido completo
    const handleFinalizeWhatsapp = () => {
        if (cartItems.length === 0) return;

        let message = `Olá! Gostaria de finalizar o seguinte pedido feito no site:\n\n`;

        cartItems.forEach((item, index) => {
            message += `*Item ${index + 1}:* ${item.name}\n`;
            message += `Qtd: ${item.quantity}\n`;
            
            // Só mostra o tamanho se existir
            if (item.selectedSize) {
                message += `Tam: ${item.selectedSize}\n`;
            }
            
            message += `Preço Unit.: R$ ${Number(item.price).toFixed(2).replace('.', ',')}\n`;
            message += `------------------------------\n`;
        });

        message += `\n*TOTAL DO PEDIDO: R$ ${total.toFixed(2).replace('.', ',')}*`;
        message += `\n\nAguardo as instruções para pagamento!`;

        const url = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    if (!isOpen) return null;

    return (
        <div className="cart-overlay" onClick={onClose}>
            <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
                
                <div className="cart-header">
                    <h2>Seu Carrinho</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="cart-items-wrapper">
                    {cartItems.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Seu carrinho está vazio.</p>
                    ) : (
                        cartItems.map((item) => (
                            <div className="cart-item-card" key={item.id}>
                                <div className="item-img">
                                    <img 
                                        src={item.images && item.images.length > 0 ? item.images[0] : "https://placehold.co/150"} 
                                        alt={item.name} 
                                    />
                                </div>
                                
                                <div className="item-info">
                                    <div className="item-top">
                                        <h3>{item.name}</h3>
                                        <button className="remove-btn" onClick={() => removeItem(item.id)}>
                                            <FaTrash />
                                        </button>
                                    </div>
                                    
                                    <div className="item-details">
                                        {item.selectedSize ? `Tam: ${item.selectedSize}` : ''}
                                    </div>

                                    <div className="item-bottom">
                                        <div className="qty-control">
                                            <button>-</button>
                                            <span>{item.quantity}</span>
                                            <button>+</button>
                                        </div>
                                        <div className="price">
                                            R$ {Number(item.price).toFixed(2).replace('.', ',')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="cart-footer">
                    <div className="total-row">
                        <span>Total do Pedido:</span>
                        <strong>R$ {total.toFixed(2).replace('.', ',')}</strong>
                    </div>
                    {/* Botão conectado à função de WhatsApp */}
                    <button className="btn-whatsapp" onClick={handleFinalizeWhatsapp}>
                        <FaWhatsapp size={20} /> Finalizar no WhatsApp
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;