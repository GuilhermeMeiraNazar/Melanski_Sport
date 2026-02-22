import React, { useState } from 'react';
import { FaUserAlt, FaShoppingCart, FaUserShield } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import LoginModal from './LoginModal';

function Header({ onOpenCart, cartCount }) {
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const navigate = useNavigate();

    const handleLoginSuccess = (userData) => {
        setUser(userData);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const canAccessAdmin = user && ['developer', 'administrator', 'operator'].includes(user.role);

    return (
        <>
            <header className="header-container">
                <div className="top-bar">
                    <p>🔥 FRETE GRÁTIS ACIMA DE R$ 299 🔥</p>
                    <div className="top-links">
                        {user ? (
                            <>
                                <span className="user-greeting">Olá, {user.full_name}</span>
                                {canAccessAdmin && (
                                    <button 
                                        className="admin-btn" 
                                        onClick={() => navigate('/admin')}
                                    >
                                        <FaUserShield /> Admin
                                    </button>
                                )}
                                <button className="logout-btn" onClick={handleLogout}>
                                    Sair
                                </button>
                            </>
                        ) : (
                            <span onClick={() => setLoginModalOpen(true)} style={{ cursor: 'pointer' }}>
                                <FaUserAlt /> Minha Conta
                            </span>
                        )}
                    </div>
                </div>
                <nav className="main-header">
                    <div className="header-content">
                        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                            <h1>Melanski<span>Sports</span></h1>
                        </div>
                        <div className="header-icons">
                            <div className="cart-icon" onClick={onOpenCart}>
                                <FaShoppingCart />
                                {cartCount > 0 && (
                                    <span className="cart-count">{cartCount}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>
            </header>

            <LoginModal 
                isOpen={loginModalOpen}
                onClose={() => setLoginModalOpen(false)}
                onLoginSuccess={handleLoginSuccess}
            />
        </>
    );
}

export default Header;