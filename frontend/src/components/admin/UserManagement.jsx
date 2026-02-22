import React from 'react';
import { FaPlus, FaUsers } from 'react-icons/fa';

/**
 * Gerenciamento de Usuários (placeholder)
 * Futuramente permitirá criar e gerenciar usuários do sistema
 */
const UserManagement = ({ userRole }) => {
    return (
        <div className="user-management-container">
            <div className="manager-header">
                <h2>Gerenciar Usuarios</h2>
                <button className="btn-add">
                    <FaPlus /> Novo Usuario
                </button>
            </div>
            
            <div style={{ 
                marginTop: '30px', 
                padding: '30px', 
                background: '#fff', 
                borderRadius: '12px' 
            }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <FaUsers style={{ 
                        fontSize: '3rem', 
                        color: '#cbd5e0', 
                        marginBottom: '15px' 
                    }} />
                    <h3 style={{ color: '#333', marginBottom: '10px' }}>
                        Gerenciamento de Usuarios
                    </h3>
                    <p style={{ color: '#666', marginBottom: '20px' }}>
                        Funcionalidade em desenvolvimento. Em breve voce podera:
                    </p>
                </div>
                
                <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ 
                            padding: '10px 0', 
                            borderBottom: '1px solid #f0f0f0' 
                        }}>
                            ✓ Cadastrar novos Administradores e Operadores
                        </li>
                        <li style={{ 
                            padding: '10px 0', 
                            borderBottom: '1px solid #f0f0f0' 
                        }}>
                            ✓ Editar permissoes e informacoes de usuarios
                        </li>
                        <li style={{ 
                            padding: '10px 0', 
                            borderBottom: '1px solid #f0f0f0' 
                        }}>
                            ✓ Desativar ou remover usuarios do sistema
                        </li>
                        <li style={{ padding: '10px 0' }}>
                            ✓ Visualizar historico de atividades por usuario
                        </li>
                    </ul>
                </div>
                
                <div style={{ 
                    marginTop: '30px', 
                    padding: '15px', 
                    background: '#fff3cd', 
                    borderRadius: '8px', 
                    border: '1px solid #ffc107' 
                }}>
                    <p style={{ margin: 0, color: '#856404', fontSize: '0.9rem' }}>
                        <strong>Nota:</strong> Como Developer, voce podera cadastrar Administradores e Operadores. 
                        Administradores poderao cadastrar apenas Operadores.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
