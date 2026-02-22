import React, { useState, useEffect } from 'react';
import { 
    FaPlus, FaSignOutAlt, FaArrowLeft, FaHistory, 
    FaTags, FaChartLine, FaUsers, FaPalette, 
    FaFileExport, FaBars, FaShoppingCart 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { productSvc } from '../../services/api';
import { getErrorMessage } from '../../utils/apiHelpers';

// Componentes do Admin
import ProductList from '../../components/admin/ProductList';
import ProductForm from '../../components/admin/ProductForm';
import CategorySelector from '../../components/admin/CategorySelector';
import MobileMenuDrawer from '../../components/admin/MobileMenuDrawer';
import DevSettingsModal from '../../components/admin/DevSettingsModal';
import InsightsView from '../../components/admin/InsightsView';
import AppearanceEditor from '../../components/admin/AppearanceEditor';
import ExportManager from '../../components/admin/ExportManager';
import UserManagement from '../../components/admin/UserManagement';
import OrdersView from '../../components/admin/OrdersView';

// Componentes externos
import ActivityLogs from '../../components/ActivityLogs';
import CategoryManager from '../../components/CategoryManager';

/**
 * Painel Administrativo Principal
 * Gerencia produtos, categorias, logs e configurações do sistema
 */
const Admin = () => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentView, setCurrentView] = useState('list');
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showDevSettings, setShowDevSettings] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }
        if (currentView === 'list') {
            fetchProducts();
        }
    }, [user, currentView, navigate]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await productSvc.list();
            setProducts(response.data);
        } catch (error) {
            console.error("Erro ao buscar produtos:", error);
            alert(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const handleSaveProduct = async (formData) => {
        try {
            setLoading(true);
            if (editingProduct) {
                await productSvc.update(editingProduct.id, formData);
                alert("Produto atualizado com sucesso!");
            } else {
                await productSvc.create(formData);
                alert("Produto cadastrado com sucesso!");
            }
            
            await fetchProducts();
            setCurrentView('list');
            setEditingProduct(null);
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("Tem certeza que deseja excluir permanentemente?")) return;
        
        try {
            await productSvc.delete(id);
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            console.error("Erro ao deletar:", error);
            alert(getErrorMessage(error));
        }
    };

    const canViewLogs = user && ['developer', 'administrator'].includes(user.role);
    const canManageCategories = user && ['developer', 'administrator'].includes(user.role);

    if (!user) {
        return <div style={{ padding: '50px', textAlign: 'center' }}>Redirecionando...</div>;
    }

    return (
        <div className="admin-container">
            {showDevSettings && (
                <DevSettingsModal onClose={() => setShowDevSettings(false)} />
            )}
            
            <header className="admin-header">
                <div className="header-title">
                    <button className="btn-mobile-menu" onClick={() => setShowMobileMenu(true)}>
                        <FaBars />
                    </button>
                    <h1>Painel Administrativo</h1>
                    <span 
                        className="user-role" 
                        onClick={() => user.role === 'developer' && setShowDevSettings(true)}
                        style={{ cursor: user.role === 'developer' ? 'pointer' : 'default' }}
                        title={user.role === 'developer' ? 'Clique para configuracoes avancadas' : ''}
                    >
                        {user.role}
                    </span>
                </div>
                
                {/* Botão Novo Produto - Sempre visível no mobile */}
                {currentView === 'list' && (
                    <button className="btn-add-mobile" onClick={() => setCurrentView('category-select')}>
                        <FaPlus />
                    </button>
                )}
                
                <div className="admin-actions desktop-only">
                    {currentView === 'list' && (
                        <>
                            <button className="btn-add" onClick={() => setCurrentView('category-select')}>
                                <FaPlus /> Novo Produto
                            </button>
                            <button className="btn-orders" onClick={() => setCurrentView('orders')}>
                                <FaShoppingCart /> Vendas
                            </button>
                            {canManageCategories && (
                                <button className="btn-categories" onClick={() => setCurrentView('categories')}>
                                    <FaTags /> Categorias
                                </button>
                            )}
                            {canViewLogs && (
                                <button className="btn-logs" onClick={() => setCurrentView('logs')}>
                                    <FaHistory /> Logs
                                </button>
                            )}
                            {(user.role === 'developer' || user.role === 'administrator') && (
                                <>
                                    <button className="btn-appearance" onClick={() => setCurrentView('appearance')}>
                                        <FaPalette /> Aparencia
                                    </button>
                                    <button className="btn-export" onClick={() => setCurrentView('export')}>
                                        <FaFileExport /> Exportar
                                    </button>
                                </>
                            )}
                            {user.role === 'developer' && (
                                <>
                                    <button className="btn-insights" onClick={() => setCurrentView('insights')}>
                                        <FaChartLine /> Insights
                                    </button>
                                    <button className="btn-users" onClick={() => setCurrentView('users')}>
                                        <FaUsers /> Usuarios
                                    </button>
                                </>
                            )}
                        </>
                    )}
                    {currentView !== 'list' && (
                        <button className="btn-back" onClick={() => setCurrentView('list')}>
                            <FaArrowLeft /> Voltar
                        </button>
                    )}
                    <button className="btn-logout" onClick={handleLogout}>
                        <FaSignOutAlt /> Sair
                    </button>
                </div>
            </header>

            {/* Mobile Menu Drawer */}
            {showMobileMenu && (
                <MobileMenuDrawer 
                    user={user}
                    currentView={currentView}
                    setCurrentView={setCurrentView}
                    canManageCategories={canManageCategories}
                    canViewLogs={canViewLogs}
                    onClose={() => setShowMobileMenu(false)}
                    onLogout={handleLogout}
                />
            )}

            <main className="admin-content">
                {loading && currentView === 'list' && (
                    <div style={{padding:'20px', textAlign:'center'}}>Carregando...</div>
                )}

                {!loading && currentView === 'list' && (
                    <ProductList 
                        products={products} 
                        onEdit={(p) => { 
                            setEditingProduct(p); 
                            setSelectedCategory(p.category); 
                            setCurrentView('form'); 
                        }} 
                        onDelete={handleDeleteProduct}
                        userRole={user.role}
                    />
                )}

                {currentView === 'category-select' && (
                    <CategorySelector 
                        onSelect={(cat) => { 
                            setSelectedCategory(cat); 
                            setEditingProduct(null); 
                            setCurrentView('form'); 
                        }}
                        onCancel={() => setCurrentView('list')}
                    />
                )}

                {currentView === 'form' && (
                    <ProductForm 
                        category={selectedCategory}
                        initialData={editingProduct}
                        onSave={handleSaveProduct}
                        onCancel={() => setCurrentView('list')}
                        isLoading={loading}
                    />
                )}

                {currentView === 'categories' && canManageCategories && (
                    <CategoryManager />
                )}

                {currentView === 'logs' && canViewLogs && (
                    <ActivityLogs />
                )}

                {currentView === 'appearance' && (user.role === 'developer' || user.role === 'administrator') && (
                    <AppearanceEditor />
                )}

                {currentView === 'export' && (user.role === 'developer' || user.role === 'administrator') && (
                    <ExportManager />
                )}

                {currentView === 'insights' && user.role === 'developer' && (
                    <InsightsView />
                )}

                {currentView === 'users' && user.role === 'developer' && (
                    <UserManagement userRole={user.role} />
                )}

                {currentView === 'orders' && (
                    <OrdersView />
                )}
            </main>
        </div>
    );
};

export default Admin;
