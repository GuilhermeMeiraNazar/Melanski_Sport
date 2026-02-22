import React, { useState } from 'react';
import { FaTimes, FaUser, FaLock, FaEnvelope, FaSave } from 'react-icons/fa';
import { authSvc } from '../services/api';

function ProfileModal({ user, onClose, onUpdate }) {
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' ou 'password'
    const [loading, setLoading] = useState(false);
    
    // Dados do perfil
    const [fullName, setFullName] = useState(user.full_name || '');
    const [email, setEmail] = useState(user.email || '');
    
    // Dados de senha
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        
        if (!fullName.trim()) {
            alert('Nome completo é obrigatório');
            return;
        }

        try {
            setLoading(true);
            const response = await authSvc.updateProfile({
                full_name: fullName,
                email: email
            });

            // Atualizar localStorage
            const updatedUser = response.data.user;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            alert('Perfil atualizado com sucesso!');
            onUpdate(updatedUser);
            onClose();
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            alert(error.response?.data?.error || 'Erro ao atualizar perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('Todos os campos são obrigatórios');
            return;
        }

        if (newPassword.length < 6) {
            alert('A nova senha deve ter no mínimo 6 caracteres');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('As senhas não coincidem');
            return;
        }

        try {
            setLoading(true);
            await authSvc.changePassword({
                currentPassword,
                newPassword
            });

            alert('Senha alterada com sucesso!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            onClose();
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            alert(error.response?.data?.error || 'Erro ao alterar senha');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <FaTimes />
                </button>

                <div className="profile-modal-header">
                    <h2>Minha Conta</h2>
                    <p>Gerencie suas informações pessoais</p>
                </div>

                <div className="profile-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <FaUser /> Perfil
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
                        onClick={() => setActiveTab('password')}
                    >
                        <FaLock /> Senha
                    </button>
                </div>

                <div className="profile-modal-body">
                    {activeTab === 'profile' ? (
                        <form onSubmit={handleUpdateProfile}>
                            <div className="form-group">
                                <label>
                                    <FaUser /> Nome Completo
                                </label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Seu nome completo"
                                    required
                                />
                            </div>

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
                                />
                                <small>Ao alterar o email, você precisará verificá-lo novamente</small>
                            </div>

                            {user.role !== 'client' && (
                                <div className="form-group">
                                    <label>Cargo</label>
                                    <input
                                        type="text"
                                        value={user.role}
                                        disabled
                                        style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
                                    />
                                    <small>O cargo não pode ser alterado</small>
                                </div>
                            )}

                            <button type="submit" className="btn-save" disabled={loading}>
                                <FaSave /> {loading ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleChangePassword}>
                            <div className="form-group">
                                <label>
                                    <FaLock /> Senha Atual
                                </label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Digite sua senha atual"
                                    required
                                />
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

                            <button type="submit" className="btn-save" disabled={loading}>
                                <FaSave /> {loading ? 'Alterando...' : 'Alterar Senha'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProfileModal;
