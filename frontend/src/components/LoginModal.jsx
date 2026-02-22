import React, { useState } from 'react';
import BaseModal from './BaseModal';
import ForgotPasswordModal from './ForgotPasswordModal';

function LoginModal({ isOpen, onClose, onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao fazer login');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            onLoginSuccess(data.user);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (showForgotPassword) {
        return (
            <ForgotPasswordModal
                onClose={() => {
                    setShowForgotPassword(false);
                    onClose();
                }}
                onSuccess={() => setShowForgotPassword(false)}
            />
        );
    }

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Login"
            className="login-modal"
            size="small"
        >
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Senha</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />
                </div>

                {error && <div className="error-message">{error}</div>}

                <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? 'Entrando...' : 'Entrar'}
                </button>

                <button 
                    type="button" 
                    className="btn-forgot-password" 
                    onClick={() => setShowForgotPassword(true)}
                >
                    Esqueci minha senha
                </button>
            </form>
        </BaseModal>
    );
}

export default LoginModal;
