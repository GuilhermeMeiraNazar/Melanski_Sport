import React, { useState } from 'react';
import { FaTimes, FaEnvelope, FaLock, FaKey } from 'react-icons/fa';
import { authSvc } from '../services/api';

function ForgotPasswordModal({ onClose, onSuccess }) {
    const [step, setStep] = useState(1); // 1: Email, 2: Código e Nova Senha
    const [loading, setLoading] = useState(false);
    
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRequestReset = async (e) => {
        e.preventDefault();

        if (!email) {
            alert('Digite seu email');
            return;
        }

        try {
            setLoading(true);
            await authSvc.requestPasswordReset(email);
            alert('Código de recuperação enviado para seu email!');
            setStep(2);
        } catch (error) {
            console.error('Erro ao solicitar reset:', error);
            alert(error.response?.data?.error || 'Erro ao enviar código');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!code || !newPassword || !confirmPassword) {
            alert('Preencha todos os campos');
            return;
        }

        if (newPassword.length < 6) {
            alert('A senha deve ter no mínimo 6 caracteres');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('As senhas não coincidem');
            return;
        }

        try {
            setLoading(true);
            await authSvc.resetPassword({
                email,
                code,
                newPassword
            });
            alert('Senha resetada com sucesso! Faça login com sua nova senha.');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Erro ao resetar senha:', error);
            alert(error.response?.data?.error || 'Erro ao resetar senha');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="forgot-password-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <FaTimes />
                </button>

                <div className="forgot-password-header">
                    <FaKey className="header-icon" />
                    <h2>Recuperar Senha</h2>
                    <p>
                        {step === 1 
                            ? 'Digite seu email para receber o código de recuperação' 
                            : 'Digite o código recebido e sua nova senha'}
                    </p>
                </div>

                <div className="forgot-password-body">
                    {step === 1 ? (
                        <form onSubmit={handleRequestReset}>
                            <div className="form-group">
                                <label>
                                    <FaEnvelope /> Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    required
                                    autoFocus
                                />
                            </div>

                            <button type="submit" className="btn-submit" disabled={loading}>
                                {loading ? 'Enviando...' : 'Enviar Código'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword}>
                            <div className="form-group">
                                <label>
                                    <FaKey /> Código de Recuperação
                                </label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="Digite o código recebido"
                                    required
                                    autoFocus
                                    maxLength="6"
                                />
                                <small>Verifique seu email</small>
                            </div>

                            <div className="form-group">
                                <label>
                                    <FaLock /> Nova Senha
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Digite a nova senha"
                                    required
                                    minLength="6"
                                />
                                <small>Mínimo de 6 caracteres</small>
                            </div>

                            <div className="form-group">
                                <label>
                                    <FaLock /> Confirmar Nova Senha
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirme a nova senha"
                                    required
                                    minLength="6"
                                />
                            </div>

                            <button type="submit" className="btn-submit" disabled={loading}>
                                {loading ? 'Resetando...' : 'Resetar Senha'}
                            </button>

                            <button 
                                type="button" 
                                className="btn-back" 
                                onClick={() => setStep(1)}
                                disabled={loading}
                            >
                                Voltar
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ForgotPasswordModal;
