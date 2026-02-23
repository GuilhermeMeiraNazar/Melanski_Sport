import React, { useState } from 'react';
import { FaTrash, FaWhatsapp } from 'react-icons/fa';
import { calculateFinalPrice, formatPrice, hasActiveDiscount } from '../utils/priceUtils';
import { orderSvc } from '../services/api';
import { getErrorMessage } from '../utils/apiHelpers';

// --- CONFIGURAÇÃO ---
const PHONE_NUMBER = '5511999999999'; 

const Cart = ({ isOpen, onClose, cartItems, removeItem }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [customerData, setCustomerData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        notes: ''
    });

    // Cálculo do total usando utilitário centralizado
    const total = cartItems.reduce((acc, item) => {
        const finalPrice = calculateFinalPrice(item);
        return acc + (finalPrice * item.quantity);
    }, 0);

    // Função para criar pedido no sistema
    const createOrder = async () => {
        try {
            setIsProcessing(true);

            // Validar dados obrigatórios
            if (!customerData.name || !customerData.phone || !customerData.address || 
                !customerData.city || !customerData.state || !customerData.zip) {
                alert('Por favor, preencha todos os campos obrigatórios!');
                return null;
            }

            // Preparar dados do pedido
            const orderData = {
                customer_name: customerData.name,
                customer_phone: customerData.phone,
                customer_email: customerData.email || null,
                delivery_address: customerData.address,
                delivery_city: customerData.city,
                delivery_state: customerData.state.toUpperCase(),
                delivery_zip: customerData.zip,
                notes: customerData.notes || null,
                items: cartItems.map(item => ({
                    product_id: item.id,
                    product_name: item.name,
                    product_size: item.selectedSize || null,
                    product_image: item.images && item.images.length > 0 ? item.images[0] : null,
                    quantity: item.quantity,
                    unit_price: calculateFinalPrice(item)
                }))
            };

            // Criar pedido
            const response = await orderSvc.create(orderData);
            return response.data.order_number;
        } catch (error) {
            console.error('Erro ao criar pedido:', error);
            alert(getErrorMessage(error));
            return null;
        } finally {
            setIsProcessing(false);
        }
    };

    // Função para gerar mensagem do pedido completo
    const handleFinalizeWhatsapp = async () => {
        if (cartItems.length === 0) return;

        // Mostrar formulário se ainda não foi preenchido
        if (!customerData.name) {
            setShowOrderForm(true);
            return;
        }

        // Criar pedido no sistema
        const orderNumber = await createOrder();
        if (!orderNumber) return;

        // Gerar mensagem do WhatsApp
        let message = `🛍️ *NOVO PEDIDO - ${orderNumber}*\n\n`;
        message += `👤 *Cliente:* ${customerData.name}\n`;
        message += `📱 *Telefone:* ${customerData.phone}\n`;
        if (customerData.email) {
            message += `📧 *Email:* ${customerData.email}\n`;
        }
        message += `\n📍 *Endereço de Entrega:*\n`;
        message += `${customerData.address}\n`;
        message += `${customerData.city}/${customerData.state} - CEP: ${customerData.zip}\n`;
        
        if (customerData.notes) {
            message += `\n📝 *Observações:* ${customerData.notes}\n`;
        }

        message += `\n🛒 *ITENS DO PEDIDO:*\n\n`;

        cartItems.forEach((item, index) => {
            message += `*${index + 1}. ${item.name}*\n`;
            message += `   Qtd: ${item.quantity}`;
            
            if (item.selectedSize) {
                message += ` | Tam: ${item.selectedSize}`;
            }
            message += `\n`;
            
            const hasDiscount = hasActiveDiscount(item.has_discount, item.discount_percentage);
            const finalPrice = calculateFinalPrice(item);
            
            if (hasDiscount) {
                const originalPrice = Number(item.sale_price || item.price);
                message += `   ~~${formatPrice(originalPrice)}~~ → ${formatPrice(finalPrice)} (-${item.discount_percentage}%)\n`;
            } else {
                message += `   ${formatPrice(finalPrice)}\n`;
            }
            
            message += `\n`;
        });

        message += `💰 *TOTAL: ${formatPrice(total)}*\n\n`;
        message += `✅ Pedido registrado no sistema!\n`;
        message += `Aguardo as instruções para pagamento.`;

        const url = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');

        // Limpar carrinho e fechar
        alert(`Pedido ${orderNumber} criado com sucesso! Você será redirecionado para o WhatsApp.`);
        // Aqui você pode limpar o carrinho se tiver uma função para isso
        onClose();
    };

    const handleSubmitForm = (e) => {
        e.preventDefault();
        setShowOrderForm(false);
        handleFinalizeWhatsapp();
    };

    if (!isOpen) return null;

    return (
        <div className="cart-overlay" onClick={onClose}>
            <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
                
                <div className="cart-header">
                    <h2>{showOrderForm ? 'Dados para Entrega' : 'Seu Carrinho'}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                {showOrderForm ? (
                    <form className="order-form" onSubmit={handleSubmitForm}>
                        <div className="form-group">
                            <label>Nome Completo *</label>
                            <input
                                type="text"
                                value={customerData.name}
                                onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Telefone (WhatsApp) *</label>
                            <input
                                type="tel"
                                value={customerData.phone}
                                onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                                placeholder="(11) 98765-4321"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={customerData.email}
                                onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                            />
                        </div>

                        <div className="form-group">
                            <label>Endereço Completo *</label>
                            <input
                                type="text"
                                value={customerData.address}
                                onChange={(e) => setCustomerData({...customerData, address: e.target.value})}
                                placeholder="Rua, número, complemento"
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Cidade *</label>
                                <input
                                    type="text"
                                    value={customerData.city}
                                    onChange={(e) => setCustomerData({...customerData, city: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Estado *</label>
                                <input
                                    type="text"
                                    value={customerData.state}
                                    onChange={(e) => setCustomerData({...customerData, state: e.target.value})}
                                    placeholder="SP"
                                    maxLength="2"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>CEP *</label>
                            <input
                                type="text"
                                value={customerData.zip}
                                onChange={(e) => setCustomerData({...customerData, zip: e.target.value})}
                                placeholder="01234-567"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Observações</label>
                            <textarea
                                value={customerData.notes}
                                onChange={(e) => setCustomerData({...customerData, notes: e.target.value})}
                                placeholder="Ex: Entregar no período da tarde"
                                rows="3"
                            />
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn-back" onClick={() => setShowOrderForm(false)}>
                                Voltar
                            </button>
                            <button type="submit" className="btn-submit" disabled={isProcessing}>
                                {isProcessing ? 'Processando...' : 'Finalizar Pedido'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
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
                                            {(() => {
                                                const hasDiscount = hasActiveDiscount(item.has_discount, item.discount_percentage);
                                                
                                                if (hasDiscount) {
                                                    const originalPrice = Number(item.sale_price || item.price);
                                                    const discountedPrice = calculateFinalPrice(item);
                                                    
                                                    return (
                                                        <>
                                                            <div className="old-price-card">
                                                                {formatPrice(originalPrice)}
                                                            </div>
                                                            <div className="discounted-price">
                                                                {formatPrice(discountedPrice)}
                                                            </div>
                                                        </>
                                                    );
                                                }
                                                
                                                return formatPrice(item.sale_price || item.price);
                                            })()}
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
                                <strong>{formatPrice(total)}</strong>
                            </div>
                            {/* Botão conectado à função de WhatsApp */}
                            <button 
                                className="btn-whatsapp" 
                                onClick={handleFinalizeWhatsapp}
                                disabled={isProcessing}
                            >
                                <FaWhatsapp size={20} /> 
                                {isProcessing ? 'Processando...' : 'Finalizar no WhatsApp'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Cart;