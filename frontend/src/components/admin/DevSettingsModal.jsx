import React from 'react';
import { FaTimes } from 'react-icons/fa';

/**
 * Modal de configurações avançadas (apenas para developers)
 * Permite configurar recursos e permissões do sistema
 */
const DevSettingsModal = ({ onClose }) => {
    return (
        <div className="dev-settings-overlay" onClick={onClose}>
            <div className="dev-settings-modal" onClick={(e) => e.stopPropagation()}>
                <div className="dev-settings-header">
                    <div>
                        <h2>Configuracoes Avancadas</h2>
                        <p className="dev-settings-subtitle">
                            Controle de recursos e permissoes do sistema
                        </p>
                    </div>
                    <button className="btn-close-modal" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                
                <div className="dev-settings-content">
                    <div className="dev-warning-box">
                        <div className="warning-icon">⚠️</div>
                        <div>
                            <strong>Atencao:</strong> Esta area e restrita a desenvolvedores. 
                            Alteracoes aqui podem afetar o funcionamento do sistema para outros usuarios.
                        </div>
                    </div>
                    
                    <div className="dev-settings-section">
                        <h3>Recursos Disponiveis</h3>
                        <p className="section-description">
                            Configure quais recursos estarao disponiveis para cada nivel de usuario.
                        </p>
                        
                        <div className="settings-placeholder">
                            <div className="placeholder-icon">🔧</div>
                            <h4>Funcionalidade em Desenvolvimento</h4>
                            <p>Em breve voce podera configurar:</p>
                            <ul>
                                <li>Habilitar/desabilitar recursos para Administradores</li>
                                <li>Habilitar/desabilitar recursos para Operadores</li>
                                <li>Definir limites de acoes por usuario</li>
                                <li>Configurar notificacoes do sistema</li>
                                <li>Gerenciar integracao com servicos externos</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div className="dev-settings-footer">
                    <button className="btn-secondary" onClick={onClose}>
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DevSettingsModal;
