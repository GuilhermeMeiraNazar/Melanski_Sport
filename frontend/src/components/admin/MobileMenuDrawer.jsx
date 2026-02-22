import React from 'react';
import { 
    FaTimes, FaArrowLeft, FaTags, FaHistory, 
    FaPalette, FaFileExport, FaChartLine, 
    FaUsers, FaSignOutAlt, FaShoppingCart 
} from 'react-icons/fa';

/**
 * Menu lateral mobile para navegação no painel admin
 * Exibe opções baseadas nas permissões do usuário
 */
const MobileMenuDrawer = ({ 
    user, 
    currentView, 
    setCurrentView, 
    canManageCategories, 
    canViewLogs, 
    onClose, 
    onLogout 
}) => {
    const handleNavigation = (view) => {
        setCurrentView(view);
        onClose();
    };

    return (
        <>
            <div className="mobile-menu-overlay" onClick={onClose}></div>
            <div className="mobile-menu-drawer">
                <div className="mobile-menu-header">
                    <h3>Menu</h3>
                    <button className="btn-close-menu" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                
                <div className="mobile-menu-content">
                    {currentView !== 'list' && (
                        <button 
                            className="mobile-menu-item" 
                            onClick={() => handleNavigation('list')}
                        >
                            <FaArrowLeft />
                            <span>Voltar para Lista</span>
                        </button>
                    )}
                    
                    <button 
                        className="mobile-menu-item" 
                        onClick={() => handleNavigation('orders')}
                    >
                        <FaShoppingCart />
                        <span>Vendas</span>
                    </button>
                    
                    {canManageCategories && (
                        <button 
                            className="mobile-menu-item" 
                            onClick={() => handleNavigation('categories')}
                        >
                            <FaTags />
                            <span>Categorias</span>
                        </button>
                    )}
                    
                    {canViewLogs && (
                        <button 
                            className="mobile-menu-item" 
                            onClick={() => handleNavigation('logs')}
                        >
                            <FaHistory />
                            <span>Logs de Atividade</span>
                        </button>
                    )}
                    
                    {(user.role === 'developer' || user.role === 'administrator') && (
                        <>
                            <button 
                                className="mobile-menu-item" 
                                onClick={() => handleNavigation('appearance')}
                            >
                                <FaPalette />
                                <span>Aparencia</span>
                            </button>
                            <button 
                                className="mobile-menu-item" 
                                onClick={() => handleNavigation('export')}
                            >
                                <FaFileExport />
                                <span>Exportar Dados</span>
                            </button>
                        </>
                    )}
                    
                    {user.role === 'developer' && (
                        <>
                            <button 
                                className="mobile-menu-item" 
                                onClick={() => handleNavigation('insights')}
                            >
                                <FaChartLine />
                                <span>Insights</span>
                            </button>
                            <button 
                                className="mobile-menu-item" 
                                onClick={() => handleNavigation('users')}
                            >
                                <FaUsers />
                                <span>Usuarios</span>
                            </button>
                        </>
                    )}
                    
                    <div className="mobile-menu-divider"></div>
                    
                    <button className="mobile-menu-item logout" onClick={onLogout}>
                        <FaSignOutAlt />
                        <span>Sair</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default MobileMenuDrawer;
