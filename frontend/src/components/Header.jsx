import React from 'react';
import { FaUserAlt, FaShoppingCart } from 'react-icons/fa';

function Header() {
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
                        <div className="cart-icon">
                            <FaShoppingCart />
                            <span className="cart-count">0</span>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Header;