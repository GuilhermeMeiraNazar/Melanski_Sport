import React from 'react';
import { FaUserAlt, FaShoppingCart } from 'react-icons/fa';

function Header({ onOpenCart, cartCount }) {
    return (
        <header className="header-container">
            <div className="top-bar">
                <p>🔥 FRETE GRÁTIS ACIMA DE R$ 299 🔥</p>
                <div className="top-links">
                    <span><FaUserAlt /> Minha Conta</span>
                </div>
            </div>
            <nav className="main-header">
                <div className="header-content">
                    <div className="logo">
                        <h1>Melanski<span>Sports</span></h1>
                    </div>
                    <div className="header-icons">
                        <div className="cart-icon" onClick={onOpenCart}>
                            <FaShoppingCart />
                            {/* Só exibe a bolinha se tiver itens */}
                            {cartCount > 0 && (
                                <span className="cart-count">{cartCount}</span>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Header;