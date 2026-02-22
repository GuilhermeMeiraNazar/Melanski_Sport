import React, { useState, useEffect } from 'react';
import { FaTrash, FaEdit, FaPlus, FaSignOutAlt, FaArrowLeft, FaBoxOpen, FaTimes, FaHistory, FaTags, FaChartLine, FaUsers, FaPalette, FaFileExport, FaBars } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { productSvc, categorySvc } from '../../services/api';
import ActivityLogs from '../../components/ActivityLogs';
import CategoryManager from '../../components/CategoryManager';

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
            if (error.response?.status === 401) {
                alert('Sessão expirada. Faça login novamente.');
                handleLogout();
            } else {
                alert("Erro ao carregar produtos do sistema.");
            }
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
            if (error.response?.status === 401 || error.response?.status === 403) {
                alert('Você não tem permissão para realizar esta ação.');
            } else {
                alert("Ocorreu um erro ao salvar o produto.");
            }
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
            if (error.response?.status === 403) {
                alert('Você não tem permissão para deletar produtos.');
            } else {
                alert("Erro ao excluir produto.");
            }
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
            </main>
        </div>
    );
};

const ProductList = ({ products, onEdit, onDelete, userRole }) => {
    const canDelete = ['developer', 'administrator'].includes(userRole);
    
    const formatStock = (stock) => {
        if (typeof stock === 'object' && stock !== null) {
            // Se for objeto, é estoque por tamanho
            return Object.entries(stock)
                .filter(([_, q]) => q > 0)
                .map(([s, q]) => `${s}: ${q}`)
                .join(', ') || 'Sem estoque';
        }
        // Se for número, é estoque simples
        return stock || 0;
    };

    return (
        <table className="product-list-table">
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Categoria</th>
                    <th>Preço</th>
                    <th>Estoque</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                {products.length === 0 ? (
                    <tr><td colSpan="5" style={{textAlign:'center'}}>Nenhum produto encontrado.</td></tr>
                ) : (
                    products.map(p => (
                        <tr key={p.id}>
                            <td data-label="Nome">
                                <span style={{fontWeight:'600'}}>{p.name}</span>
                            </td>
                            <td data-label="Categoria"><span className="badge">{p.category}</span></td>
                            <td data-label="Preço" style={{color:'#27ae60', fontWeight:'bold'}}>
                                R$ {parseFloat(p.price || 0).toFixed(2)}
                            </td>
                            <td data-label="Estoque">{formatStock(p.stock)}</td>
                            <td data-label="Ações">
                                <div className="actions-cell">
                                    <button className="edit-btn" onClick={() => onEdit(p)} title="Editar">
                                        <FaEdit />
                                    </button>
                                    {canDelete && (
                                        <button className="delete-btn" onClick={() => onDelete(p.id)} title="Excluir">
                                            <FaTrash />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
};

const CategorySelector = ({ onSelect, onCancel }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await categorySvc.list();
            setCategories(response.data);
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
            alert('Erro ao carregar categorias');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Carregando categorias...</div>;
    }

    return (
        <div className="admin-form-container">
            <h2 className="section-title">Selecione a Categoria do Produto</h2>
            <div className="category-grid-selector">
                {categories.map(cat => (
                    <button key={cat.id} onClick={() => onSelect(cat.name)} data-category-id={cat.id}>
                        <div className="icon-area"><FaBoxOpen /></div>
                        <span>{cat.name}</span>
                    </button>
                ))}
            </div>
            <button className="btn-cancel-category" onClick={onCancel}>
                <FaTimes /> Cancelar
            </button>
        </div>
    );
};

const ProductForm = ({ category, initialData, onSave, onCancel, isLoading }) => {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
    const [selectedCategoryName, setSelectedCategoryName] = useState(category || '');
    const [origin, setOrigin] = useState(initialData?.origin || initialData?.type || 'Nacional');
    const [gender, setGender] = useState(initialData?.gender || 'Masculino');
    const [team, setTeam] = useState(initialData?.team || '');
    const [images, setImages] = useState(initialData?.images || []);
    const [costPrice, setCostPrice] = useState(initialData?.cost_price || '');
    const [salePrice, setSalePrice] = useState(initialData?.sale_price || '');
    const [hasDiscount, setHasDiscount] = useState(initialData?.has_discount ? true : false);
    const [discountPercentage, setDiscountPercentage] = useState(initialData?.discount_percentage || 0);
    const [simpleQty, setSimpleQty] = useState(0);
    const [sizesQty, setSizesQty] = useState({ P: 0, M: 0, G: 0, GG: 0, XG: 0 });

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (categoryId && categories.length > 0) {
            const cat = categories.find(c => c.id === parseInt(categoryId));
            if (cat) {
                setSelectedCategoryName(cat.name);
            }
        }
    }, [categoryId, categories]);

    useEffect(() => {
        if (categoryId === '' && categories.length > 0 && category) {
            const matchedCategory = categories.find(c => c.name === category);
            if (matchedCategory) {
                setCategoryId(matchedCategory.id);
                setSelectedCategoryName(matchedCategory.name);
            }
        }
    }, [categories, category, categoryId]);

    useEffect(() => {
        // Atualizar estoque quando temos dados iniciais e categorias carregadas
        if (initialData && categories.length > 0) {
            const currentCategory = categories.find(c => c.id === parseInt(initialData.category_id));
            if (currentCategory) {
                const useSizes = currentCategory.has_sizes === 1 || currentCategory.has_sizes === true;
                
                if (useSizes && initialData.stock && typeof initialData.stock === 'object') {
                    // Categoria usa tamanhos e temos dados de tamanhos
                    setSizesQty(initialData.stock);
                    setSimpleQty(0);
                } else if (!useSizes) {
                    // Categoria não usa tamanhos
                    const qty = typeof initialData.stock === 'object' 
                        ? Object.values(initialData.stock)[0] || 0 
                        : initialData.stock || 0;
                    setSimpleQty(qty);
                    setSizesQty({ P: 0, M: 0, G: 0, GG: 0, XG: 0 });
                }
            }
        }
    }, [initialData, categories]);

    const fetchCategories = async () => {
        try {
            const response = await categorySvc.list();
            setCategories(response.data);
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
        }
    };

    // Função para verificar se a categoria usa tamanhos
    const usesSizes = (categoryData) => {
        // Se receber um objeto de categoria com has_sizes
        if (typeof categoryData === 'object' && categoryData !== null) {
            return categoryData.has_sizes === 1 || categoryData.has_sizes === true;
        }
        // Se receber apenas o ID, buscar na lista de categorias
        if (typeof categoryData === 'number' && categories.length > 0) {
            const cat = categories.find(c => c.id === categoryData);
            return cat ? (cat.has_sizes === 1 || cat.has_sizes === true) : false;
        }
        return false;
    };

    const finalPrice = hasDiscount 
        ? (salePrice - (salePrice * (discountPercentage / 100))).toFixed(2) 
        : salePrice;

    const handleFileSelect = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newImages = [...images];
                newImages[index] = reader.result;
                setImages(newImages);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = (indexToRemove) => {
        const newImages = images.filter((_, index) => index !== indexToRemove);
        setImages(newImages);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const currentCategory = categories.find(c => c.id === parseInt(categoryId));
        const useSizes = currentCategory ? (currentCategory.has_sizes === 1 || currentCategory.has_sizes === true) : false;
        
        onSave({
            category: selectedCategoryName,
            category_id: parseInt(categoryId),
            name,
            description,
            origin,
            gender,
            team,
            images,
            costPrice: parseFloat(costPrice),
            salePrice: parseFloat(salePrice),
            hasDiscount,
            discountPercentage: parseFloat(discountPercentage),
            stock: useSizes ? sizesQty : parseInt(simpleQty)
        });
    };

    const showSizes = categoryId && categories.length > 0 
        ? usesSizes(parseInt(categoryId))
        : false;

    return (
        <div className="admin-form-container">
            <div className="form-header-actions">
                <button onClick={onCancel} className="btn-back-circle" disabled={isLoading}>
                    <FaArrowLeft />
                </button>
                <h2>{initialData ? 'Editar' : 'Novo'} Produto</h2>
            </div>
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Categoria</label>
                    <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                        <option value="">Selecione uma categoria</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name} {(cat.has_sizes === 1 || cat.has_sizes === true) ? '(com tamanhos)' : ''}
                            </option>
                        ))}
                    </select>
                    {showSizes && (
                        <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                            Esta categoria usa controle de estoque por tamanho
                        </small>
                    )}
                </div>

                <div className="form-group">
                    <label>Fotos do Produto (Máx 5)</label>
                    <div className="image-upload-grid">
                        {[0, 1, 2, 3, 4].map((index) => (
                            <div key={index} className="image-upload-box">
                                {images[index] ? (
                                    <div className="image-preview">
                                        <img src={images[index]} alt={`Produto ${index}`} />
                                        <button 
                                            type="button" 
                                            className="btn-remove-img"
                                            onClick={() => handleRemoveImage(index)}
                                        >
                                            <FaTimes />
                                        </button>
                                        {index === 0 && <span className="main-label">Principal</span>}
                                    </div>
                                ) : (
                                    <>
                                        <input 
                                            type="file" 
                                            id={`file-input-${index}`}
                                            className="hidden-file-input"
                                            accept="image/*"
                                            onChange={(e) => handleFileSelect(e, index)}
                                            disabled={index > images.length} 
                                        />
                                        <label 
                                            htmlFor={`file-input-${index}`}
                                            className={`btn-add-img ${index > images.length ? 'disabled' : ''}`}
                                        >
                                            <FaPlus />
                                        </label>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label>Nome do Produto</label>
                    <input value={name} onChange={e => setName(e.target.value)} required />
                </div>

                <div className="form-row">
                    <div className="form-group" style={{flex:1}}>
                        <label>Origem</label>
                        <select value={origin} onChange={e => setOrigin(e.target.value)}>
                            <option value="Nacional">Nacional</option>
                            <option value="Internacional">Internacional</option>
                        </select>
                    </div>
                    <div className="form-group" style={{flex:1}}>
                        <label>Gênero</label>
                        <select value={gender} onChange={e => setGender(e.target.value)}>
                            <option value="Masculino">Masculino</option>
                            <option value="Feminino">Feminino</option>
                            <option value="Infantil">Infantil</option>
                            <option value="Unissex">Unissex</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label>Time (Opcional)</label>
                    <input 
                        type="text" 
                        placeholder="Ex: Flamengo, Real Madrid..." 
                        value={team} 
                        onChange={e => setTeam(e.target.value)} 
                    />
                </div>

                <div className="form-row">
                    <div className="form-group" style={{flex:1}}>
                        <label>Custo (R$)</label>
                        <input type="number" step="0.01" value={costPrice} onChange={e => setCostPrice(e.target.value)} required placeholder="0,00" />
                    </div>
                    <div className="form-group" style={{flex:1}}>
                        <label>Venda (R$)</label>
                        <input type="number" step="0.01" value={salePrice} onChange={e => setSalePrice(e.target.value)} required placeholder="0,00" />
                    </div>
                </div>

                <div className="form-section-box">
                    <div className="section-header-row">
                        <label className="checkbox-label">
                            <input type="checkbox" checked={hasDiscount} onChange={e => setHasDiscount(e.target.checked)} />
                            Aplicar Desconto Promocional?
                        </label>
                        {hasDiscount && <span className="discount-badge">- {discountPercentage}%</span>}
                    </div>

                    {hasDiscount && (
                        <div className="discount-inputs">
                            <div style={{flex:1}}>
                                <label>Porcentagem (%)</label>
                                <input type="number" value={discountPercentage} onChange={e => setDiscountPercentage(e.target.value)} min="0" max="100" />
                            </div>
                            <div style={{flex:1}}>
                                <label>Preço Vitrine</label>
                                <div className="price-display">
                                    R$ {finalPrice}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {showSizes ? (
                    <div className="form-section-box">
                        <label style={{marginBottom:'15px', display:'block', fontWeight:'bold'}}>
                            Estoque por Tamanho
                        </label>
                        <div className="sizes-input-wrapper">
                            {Object.keys(sizesQty).map(size => (
                                <div key={size} className="size-slot">
                                    <label>{size}</label>
                                    <input type="number" min="0" value={sizesQty[size]} 
                                           onChange={e => setSizesQty({...sizesQty, [size]: parseInt(e.target.value) || 0})} />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="form-section-box">
                        <label style={{marginBottom:'10px', display:'block', fontWeight:'bold'}}>
                            Quantidade em Estoque
                        </label>
                        <input type="number" min="0" value={simpleQty} onChange={e => setSimpleQty(e.target.value)} required />
                    </div>
                )}

                <div className="form-group" style={{marginTop:'20px'}}>
                    <label>Descrição</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} />
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-save" disabled={isLoading}>
                        {isLoading ? 'Salvando...' : 'Salvar Produto'}
                    </button>
                    <button type="button" className="btn-cancel" onClick={onCancel} disabled={isLoading}>Cancelar</button>
                </div>
            </form>
        </div>
    );
};

// Componente de Insights (placeholder por enquanto)
const InsightsView = () => {
    return (
        <div className="insights-container">
            <h2 style={{ marginBottom: '20px', color: '#333' }}>Insights e Metricas</h2>
            <div className="insights-grid">
                <div className="insight-card">
                    <div className="insight-icon" style={{ background: '#e3f2fd' }}>
                        <FaBoxOpen style={{ color: '#1976d2' }} />
                    </div>
                    <div className="insight-content">
                        <h3>Total de Produtos</h3>
                        <p className="insight-value">Em breve</p>
                    </div>
                </div>
                <div className="insight-card">
                    <div className="insight-icon" style={{ background: '#f3e5f5' }}>
                        <FaTags style={{ color: '#7b1fa2' }} />
                    </div>
                    <div className="insight-content">
                        <h3>Categorias Ativas</h3>
                        <p className="insight-value">Em breve</p>
                    </div>
                </div>
                <div className="insight-card">
                    <div className="insight-icon" style={{ background: '#e8f5e9' }}>
                        <FaChartLine style={{ color: '#388e3c' }} />
                    </div>
                    <div className="insight-content">
                        <h3>Valor Total em Estoque</h3>
                        <p className="insight-value">Em breve</p>
                    </div>
                </div>
            </div>
            <div style={{ marginTop: '30px', padding: '20px', background: '#fff', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ color: '#666' }}>Funcionalidade em desenvolvimento. Em breve voce tera acesso a metricas detalhadas do sistema.</p>
            </div>
        </div>
    );
};

// Componente de Editor de Aparencia
const AppearanceEditor = () => {
    return (
        <div className="appearance-editor-container">
            <div className="manager-header">
                <h2>Editor de Aparencia</h2>
                <button className="btn-save" disabled>
                    <FaPlus /> Salvar Alteracoes
                </button>
            </div>
            
            <div className="appearance-content">
                <div className="appearance-preview-section">
                    <h3>Preview do Site</h3>
                    <div className="preview-box">
                        <div className="preview-placeholder">
                            <FaPalette style={{ fontSize: '3rem', color: '#cbd5e0', marginBottom: '15px' }} />
                            <p>Preview em tempo real sera exibido aqui</p>
                        </div>
                    </div>
                </div>
                
                <div className="appearance-settings-section">
                    <h3>Personalizacao de Cores</h3>
                    <p className="section-description">
                        Customize as cores principais do site para combinar com a identidade visual da sua marca.
                    </p>
                    
                    <div className="color-settings-grid">
                        <div className="color-setting-item">
                            <label>Cor Principal</label>
                            <div className="color-input-wrapper">
                                <div className="color-preview" style={{ background: '#e74c3c' }}></div>
                                <input type="text" value="#e74c3c" disabled />
                            </div>
                            <small>Usada em botoes, links e destaques</small>
                        </div>
                        
                        <div className="color-setting-item">
                            <label>Cor Secundaria</label>
                            <div className="color-input-wrapper">
                                <div className="color-preview" style={{ background: '#2c3e50' }}></div>
                                <input type="text" value="#2c3e50" disabled />
                            </div>
                            <small>Usada em textos e elementos secundarios</small>
                        </div>
                        
                        <div className="color-setting-item">
                            <label>Cor de Fundo</label>
                            <div className="color-input-wrapper">
                                <div className="color-preview" style={{ background: '#ffffff' }}></div>
                                <input type="text" value="#ffffff" disabled />
                            </div>
                            <small>Cor de fundo principal do site</small>
                        </div>
                        
                        <div className="color-setting-item">
                            <label>Cor de Destaque</label>
                            <div className="color-input-wrapper">
                                <div className="color-preview" style={{ background: '#f39c12' }}></div>
                                <input type="text" value="#f39c12" disabled />
                            </div>
                            <small>Usada em promocoes e ofertas</small>
                        </div>
                    </div>
                    
                    <div className="feature-info-box">
                        <div className="info-icon">🎨</div>
                        <div>
                            <h4>Funcionalidade em Desenvolvimento</h4>
                            <p>
                                Em breve voce podera personalizar completamente a aparencia do site:
                            </p>
                            <ul>
                                <li>Escolher cores personalizadas com seletor de cores</li>
                                <li>Visualizar mudancas em tempo real</li>
                                <li>Salvar temas personalizados</li>
                                <li>Alternar entre temas claro e escuro</li>
                                <li>Personalizar fontes e espacamentos</li>
                                <li>Fazer upload de logo personalizado</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Componente de Exportacao de Dados
const ExportManager = () => {
    return (
        <div className="export-manager-container">
            <div className="manager-header">
                <h2>Exportar Dados</h2>
            </div>
            
            <div className="export-content">
                <div className="export-intro">
                    <FaFileExport style={{ fontSize: '3rem', color: '#27ae60', marginBottom: '15px' }} />
                    <h3>Exportacao de Tabelas</h3>
                    <p>
                        Exporte os dados do sistema em formato Excel (.xlsx) para analise externa, 
                        backup ou integracao com outras ferramentas.
                    </p>
                </div>
                
                <div className="export-options-grid">
                    <div className="export-option-card">
                        <div className="export-icon" style={{ background: '#e3f2fd' }}>
                            <FaBoxOpen style={{ color: '#1976d2', fontSize: '1.5rem' }} />
                        </div>
                        <h4>Produtos</h4>
                        <p>Exportar todos os produtos com detalhes completos</p>
                        <button className="btn-export-item" disabled>
                            <FaFileExport /> Exportar
                        </button>
                    </div>
                    
                    <div className="export-option-card">
                        <div className="export-icon" style={{ background: '#f3e5f5' }}>
                            <FaTags style={{ color: '#7b1fa2', fontSize: '1.5rem' }} />
                        </div>
                        <h4>Categorias</h4>
                        <p>Exportar lista de categorias cadastradas</p>
                        <button className="btn-export-item" disabled>
                            <FaFileExport /> Exportar
                        </button>
                    </div>
                    
                    <div className="export-option-card">
                        <div className="export-icon" style={{ background: '#fff3e0' }}>
                            <FaHistory style={{ color: '#f57c00', fontSize: '1.5rem' }} />
                        </div>
                        <h4>Logs de Atividade</h4>
                        <p>Exportar historico de acoes do sistema</p>
                        <button className="btn-export-item" disabled>
                            <FaFileExport /> Exportar
                        </button>
                    </div>
                    
                    <div className="export-option-card">
                        <div className="export-icon" style={{ background: '#e8f5e9' }}>
                            <FaUsers style={{ color: '#388e3c', fontSize: '1.5rem' }} />
                        </div>
                        <h4>Usuarios</h4>
                        <p>Exportar lista de usuarios do sistema</p>
                        <button className="btn-export-item" disabled>
                            <FaFileExport /> Exportar
                        </button>
                    </div>
                </div>
                
                <div className="export-info-box">
                    <div className="info-header">
                        <span className="info-badge">📊</span>
                        <h4>Funcionalidade em Desenvolvimento</h4>
                    </div>
                    <p>
                        Em breve voce podera exportar dados do sistema com as seguintes opcoes:
                    </p>
                    <div className="info-features">
                        <div className="info-feature-item">
                            <span>✓</span>
                            <div>
                                <strong>Multiplos Formatos</strong>
                                <p>Excel (.xlsx), CSV, PDF</p>
                            </div>
                        </div>
                        <div className="info-feature-item">
                            <span>✓</span>
                            <div>
                                <strong>Filtros Personalizados</strong>
                                <p>Escolha quais colunas e periodos exportar</p>
                            </div>
                        </div>
                        <div className="info-feature-item">
                            <span>✓</span>
                            <div>
                                <strong>Exportacao Agendada</strong>
                                <p>Configure exportacoes automaticas periodicas</p>
                            </div>
                        </div>
                        <div className="info-feature-item">
                            <span>✓</span>
                            <div>
                                <strong>Backup Completo</strong>
                                <p>Exporte todos os dados de uma vez</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Componente de Gerenciamento de Usuarios (placeholder por enquanto)
const UserManagement = ({ userRole }) => {
    return (
        <div className="user-management-container">
            <div className="manager-header">
                <h2>Gerenciar Usuarios</h2>
                <button className="btn-add">
                    <FaPlus /> Novo Usuario
                </button>
            </div>
            
            <div style={{ marginTop: '30px', padding: '30px', background: '#fff', borderRadius: '12px' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <FaUsers style={{ fontSize: '3rem', color: '#cbd5e0', marginBottom: '15px' }} />
                    <h3 style={{ color: '#333', marginBottom: '10px' }}>Gerenciamento de Usuarios</h3>
                    <p style={{ color: '#666', marginBottom: '20px' }}>
                        Funcionalidade em desenvolvimento. Em breve voce podera:
                    </p>
                </div>
                
                <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                            ✓ Cadastrar novos Administradores e Operadores
                        </li>
                        <li style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                            ✓ Editar permissoes e informacoes de usuarios
                        </li>
                        <li style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                            ✓ Desativar ou remover usuarios do sistema
                        </li>
                        <li style={{ padding: '10px 0' }}>
                            ✓ Visualizar historico de atividades por usuario
                        </li>
                    </ul>
                </div>
                
                <div style={{ marginTop: '30px', padding: '15px', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107' }}>
                    <p style={{ margin: 0, color: '#856404', fontSize: '0.9rem' }}>
                        <strong>Nota:</strong> Como Developer, voce podera cadastrar Administradores e Operadores. 
                        Administradores poderao cadastrar apenas Operadores.
                    </p>
                </div>
            </div>
        </div>
    );
};

// Componente do Menu Mobile (Drawer)
const MobileMenuDrawer = ({ user, currentView, setCurrentView, canManageCategories, canViewLogs, onClose, onLogout }) => {
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
                        <button className="mobile-menu-item" onClick={() => handleNavigation('list')}>
                            <FaArrowLeft />
                            <span>Voltar para Lista</span>
                        </button>
                    )}
                    
                    {canManageCategories && (
                        <button className="mobile-menu-item" onClick={() => handleNavigation('categories')}>
                            <FaTags />
                            <span>Categorias</span>
                        </button>
                    )}
                    
                    {canViewLogs && (
                        <button className="mobile-menu-item" onClick={() => handleNavigation('logs')}>
                            <FaHistory />
                            <span>Logs de Atividade</span>
                        </button>
                    )}
                    
                    {(user.role === 'developer' || user.role === 'administrator') && (
                        <>
                            <button className="mobile-menu-item" onClick={() => handleNavigation('appearance')}>
                                <FaPalette />
                                <span>Aparencia</span>
                            </button>
                            <button className="mobile-menu-item" onClick={() => handleNavigation('export')}>
                                <FaFileExport />
                                <span>Exportar Dados</span>
                            </button>
                        </>
                    )}
                    
                    {user.role === 'developer' && (
                        <>
                            <button className="mobile-menu-item" onClick={() => handleNavigation('insights')}>
                                <FaChartLine />
                                <span>Insights</span>
                            </button>
                            <button className="mobile-menu-item" onClick={() => handleNavigation('users')}>
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

// Modal de Configuracoes Avancadas (Developer Only)
const DevSettingsModal = ({ onClose }) => {
    return (
        <div className="dev-settings-overlay" onClick={onClose}>
            <div className="dev-settings-modal" onClick={(e) => e.stopPropagation()}>
                <div className="dev-settings-header">
                    <div>
                        <h2>Configuracoes Avancadas</h2>
                        <p className="dev-settings-subtitle">Controle de recursos e permissoes do sistema</p>
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
                            <p>
                                Em breve voce podera configurar:
                            </p>
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

export default Admin;
