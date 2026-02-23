import { useState, useEffect } from 'react';
import { FaUsers, FaPlus, FaEdit, FaTrash, FaKey, FaFilter } from 'react-icons/fa';
import { userManagementSvc } from '../../services/api';
import { getErrorMessage } from '../../utils/apiHelpers';
import Pagination from '../Pagination';

/**
 * Componente de Gerenciamento de Usuários
 * Permite criar, editar e deletar usuários administrativos
 */
function UserManagement({ userRole }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [roleFilter, setRoleFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // create, edit
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        role: 'operator'
    });
    const [tempPassword, setTempPassword] = useState('');

    useEffect(() => {
        fetchUsers();
    }, [currentPage, roleFilter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userManagementSvc.list({ 
                page: currentPage, 
                limit: 12,
                role: roleFilter
            });
            
            setUsers(response.data.data || []);
            setTotal(response.data.pagination?.total || 0);
            setTotalPages(response.data.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            alert(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (mode, user = null) => {
        setModalMode(mode);
        setSelectedUser(user);
        setTempPassword('');
        
        if (mode === 'edit' && user) {
            setFormData({
                full_name: user.full_name,
                email: user.email,
                role: user.role
            });
        } else {
            setFormData({
                full_name: '',
                email: '',
                role: userRole === 'administrator' ? 'operator' : 'operator'
            });
        }
        
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedUser(null);
        setTempPassword('');
        setFormData({
            full_name: '',
            email: '',
            role: 'operator'
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            
            if (modalMode === 'create') {
                const response = await userManagementSvc.create(formData);
                setTempPassword(response.data.tempPassword);
                alert(response.data.message);
            } else {
                await userManagementSvc.update(selectedUser.id, formData);
                alert('Usuário atualizado com sucesso');
                handleCloseModal();
            }
            
            await fetchUsers();
        } catch (error) {
            console.error('Erro ao salvar usuário:', error);
            alert(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (user) => {
        if (!window.confirm(`Tem certeza que deseja deletar o usuário ${user.full_name}?`)) {
            return;
        }
        
        try {
            setLoading(true);
            await userManagementSvc.delete(user.id);
            alert('Usuário deletado com sucesso');
            await fetchUsers();
        } catch (error) {
            console.error('Erro ao deletar usuário:', error);
            alert(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (user) => {
        if (!window.confirm(`Resetar senha de ${user.full_name}?`)) {
            return;
        }
        
        try {
            setLoading(true);
            const response = await userManagementSvc.resetPassword(user.id);
            alert(`Senha resetada!\n\nNova senha temporária: ${response.data.tempPassword}\n\nUm email foi enviado para o usuário.`);
        } catch (error) {
            console.error('Erro ao resetar senha:', error);
            alert(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const getRoleName = (role) => {
        const names = {
            developer: 'Desenvolvedor',
            administrator: 'Administrador',
            operator: 'Operador'
        };
        return names[role] || role;
    };

    const getRoleColor = (role) => {
        const colors = {
            developer: '#6f42c1',
            administrator: '#dc3545',
            operator: '#007bff'
        };
        return colors[role] || '#6c757d';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    };

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Reset página ao mudar filtro
    useEffect(() => {
        setCurrentPage(1);
    }, [roleFilter]);

    const canEdit = (user) => {
        if (userRole === 'developer') return true;
        if (userRole === 'administrator' && user.role === 'operator') return true;
        return false;
    };

    const canDelete = (user) => {
        if (user.role === 'developer') return false;
        if (userRole === 'developer') return true;
        if (userRole === 'administrator' && user.role === 'operator') return true;
        return false;
    };

    if (loading && users.length === 0) {
        return (
            <div className="user-management-loading">
                <div className="spinner"></div>
                <p>Carregando usuários...</p>
            </div>
        );
    }

    return (
        <div className="user-management">
            {/* Header */}
            <div className="users-header">
                <div className="header-title">
                    <FaUsers />
                    <h2>Gerenciamento de Usuários</h2>
                </div>
                <p className="users-subtitle">
                    {total} {total === 1 ? 'usuário' : 'usuários'} administrativo{total !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Filtros e Ações */}
            <div className="users-controls">
                <div className="filter-group">
                    <label>
                        <FaFilter /> Filtrar por Cargo
                    </label>
                    <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                        <option value="all">Todos</option>
                        <option value="developer">Desenvolvedor</option>
                        <option value="administrator">Administrador</option>
                        <option value="operator">Operador</option>
                    </select>
                </div>

                <button className="btn-add-user" onClick={() => handleOpenModal('create')}>
                    <FaPlus /> Novo Usuário
                </button>
            </div>

            {/* Lista de Usuários */}
            {users.length === 0 ? (
                <div className="users-empty">
                    <FaUsers />
                    <p>Nenhum usuário encontrado</p>
                </div>
            ) : (
                <>
                    <div className="users-list">
                        {users.map((user) => (
                            <div key={user.id} className="user-card">
                                <div className="user-info">
                                    <div className="user-name">{user.full_name}</div>
                                    <div className="user-email">{user.email}</div>
                                    <div className="user-meta">
                                        <span 
                                            className="user-role-badge" 
                                            style={{ backgroundColor: getRoleColor(user.role) }}
                                        >
                                            {getRoleName(user.role)}
                                        </span>
                                        <span className="user-date">
                                            Criado em {formatDate(user.created_at)}
                                        </span>
                                        {user.temp_password === 1 && (
                                            <span className="user-temp-badge">Senha Temporária</span>
                                        )}
                                    </div>
                                </div>

                                <div className="user-actions">
                                    {canEdit(user) && (
                                        <button 
                                            className="btn-edit" 
                                            onClick={() => handleOpenModal('edit', user)}
                                            title="Editar"
                                        >
                                            <FaEdit />
                                        </button>
                                    )}
                                    {canEdit(user) && (
                                        <button 
                                            className="btn-reset" 
                                            onClick={() => handleResetPassword(user)}
                                            title="Resetar Senha"
                                        >
                                            <FaKey />
                                        </button>
                                    )}
                                    {canDelete(user) && (
                                        <button 
                                            className="btn-delete" 
                                            onClick={() => handleDelete(user)}
                                            title="Deletar"
                                        >
                                            <FaTrash />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Paginação */}
                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            paginate={paginate}
                        />
                    )}
                </>
            )}

            {/* Modal de Criar/Editar */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                {modalMode === 'create' ? 'Novo Usuário' : 'Editar Usuário'}
                            </h3>
                            <button className="btn-close" onClick={handleCloseModal}>×</button>
                        </div>

                        {tempPassword ? (
                            <div className="password-display">
                                <h4>Usuário criado com sucesso!</h4>
                                <p>Senha temporária gerada:</p>
                                <div className="temp-password">{tempPassword}</div>
                                <p className="password-note">
                                    Um email foi enviado para o usuário com as credenciais de acesso.
                                    Guarde esta senha em local seguro.
                                </p>
                                <button className="btn-primary" onClick={handleCloseModal}>
                                    Fechar
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Nome Completo *</label>
                                    <input
                                        type="text"
                                        value={formData.full_name}
                                        onChange={e => setFormData({...formData, full_name: e.target.value})}
                                        required
                                        placeholder="Digite o nome completo"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                        required
                                        placeholder="Digite o email"
                                        disabled={modalMode === 'edit'}
                                    />
                                    {modalMode === 'edit' && (
                                        <small>Email não pode ser alterado</small>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Cargo *</label>
                                    <select
                                        value={formData.role}
                                        onChange={e => setFormData({...formData, role: e.target.value})}
                                        required
                                        disabled={userRole === 'administrator' || (modalMode === 'edit' && userRole !== 'developer')}
                                    >
                                        {userRole === 'developer' && (
                                            <>
                                                <option value="administrator">Administrador</option>
                                                <option value="operator">Operador</option>
                                            </>
                                        )}
                                        {userRole === 'administrator' && (
                                            <option value="operator">Operador</option>
                                        )}
                                    </select>
                                </div>

                                {modalMode === 'create' && (
                                    <div className="form-note">
                                        Uma senha temporária será gerada e enviada por email.
                                    </div>
                                )}

                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn-primary" disabled={loading}>
                                        {loading ? 'Salvando...' : 'Salvar'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserManagement;
