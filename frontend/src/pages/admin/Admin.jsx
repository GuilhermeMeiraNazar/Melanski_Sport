import React, { useState } from 'react';
import { FaTrash, FaEdit, FaPlus, FaSignOutAlt, FaArrowLeft, FaBoxOpen, FaTimes, FaCamera } from 'react-icons/fa';

const initialProducts = [
    { 
        id: 1, 
        name: "Camisa Tailandesa 1", 
        category: "Roupa", 
        price: 150.00, 
        stock: { P: 2, M: 5, G: 0, GG: 0, XG: 0 }, 
        description: "Camisa top.",
        origin: "Internacional",
        gender: "Masculino",
        team: "Flamengo",
        images: [] 
    },
    { 
        id: 2, 
        name: "Copo Térmico", 
        category: "Copo", 
        price: 80.00, 
        stock: 20, 
        description: "Mantém gelado.",
        origin: "Nacional",
        gender: "",
        team: "",
        images: []
    },
];

const Admin = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [products, setProducts] = useState(initialProducts);
    const [currentView, setCurrentView] = useState('list'); 
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');

    const [loginUser, setLoginUser] = useState('');
    const [loginPass, setLoginPass] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        if (loginUser === 'admin' && loginPass === 'admin') {
            setIsAuthenticated(true);
        } else { alert('Credenciais inválidas!'); }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setCurrentView('list');
    };

    const handleSaveProduct = (formData) => {
        if (editingProduct) {
            setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...formData } : p));
        } else {
            const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
            setProducts([...products, { id: newId, ...formData }]);
        }
        setCurrentView('list');
    };

    if (!isAuthenticated) {
        return (
            <div className="login-wrapper">
                <div className="login-box">
                    <h2>Admin <span>Panel</span></h2>
                    <form onSubmit={handleLogin}>
                        <input type="text" placeholder="Usuário" value={loginUser} onChange={(e) => setLoginUser(e.target.value)} />
                        <input type="password" placeholder="Senha" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} />
                        <button type="submit">Entrar</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <header className="admin-header">
                <div className="header-title">
                    <h1>Painel Administrativo</h1>
                </div>
                <div className="admin-actions">
                    {currentView === 'list' && (
                        <button className="btn-add" onClick={() => setCurrentView('category-select')}>
                            <FaPlus /> Novo Produto
                        </button>
                    )}
                    <button className="btn-logout" onClick={handleLogout}><FaSignOutAlt /> Sair</button>
                </div>
            </header>

            <main className="admin-content">
                {currentView === 'list' && (
                    <ProductList 
                        products={products} 
                        onEdit={(p) => { setEditingProduct(p); setSelectedCategory(p.category); setCurrentView('form'); }} 
                        onDelete={(id) => window.confirm("Excluir?") && setProducts(products.filter(p => p.id !== id))} 
                    />
                )}

                {currentView === 'category-select' && (
                    <CategorySelector 
                        onSelect={(cat) => { setSelectedCategory(cat); setEditingProduct(null); setCurrentView('form'); }}
                        onCancel={() => setCurrentView('list')}
                    />
                )}

                {currentView === 'form' && (
                    <ProductForm 
                        category={selectedCategory}
                        initialData={editingProduct}
                        onSave={handleSaveProduct}
                        onCancel={() => setCurrentView('list')}
                    />
                )}
            </main>
        </div>
    );
};

// --- COMPONENTE LISTA ---
const ProductList = ({ products, onEdit, onDelete }) => {
    const formatStock = (stock, category) => {
        if (category === 'Roupa' && typeof stock === 'object') {
            return Object.entries(stock).filter(([_, q]) => q > 0).map(([s, q]) => `${s}: ${q}`).join(', ');
        }
        return stock;
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
                {products.map(p => (
                    <tr key={p.id}>
                        <td data-label="Nome">
                            <span style={{fontWeight:'600'}}>{p.name}</span>
                        </td>
                        <td data-label="Categoria"><span className="badge">{p.category}</span></td>
                        <td data-label="Preço" style={{color:'#27ae60', fontWeight:'bold'}}>
                            R$ {parseFloat(p.price).toFixed(2)}
                        </td>
                        <td data-label="Estoque">{formatStock(p.stock, p.category)}</td>
                        <td data-label="Ações">
                            <div className="actions-cell">
                                <button className="edit-btn" onClick={() => onEdit(p)} title="Editar">
                                    <FaEdit />
                                </button>
                                <button className="delete-btn" onClick={() => onDelete(p.id)} title="Excluir">
                                    <FaTrash />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

// --- COMPONENTE SELETOR ---
const CategorySelector = ({ onSelect, onCancel }) => {
    const categories = ["Roupas", "Acessorios", "Copo", "Garrafa", "Outros"];
    return (
        <div className="admin-form-container">
            <h2 className="section-title">O que você vai cadastrar?</h2>
            <div className="category-grid-selector">
                {categories.map(cat => (
                    <button key={cat} onClick={() => onSelect(cat === "Roupas" ? "Roupa" : cat)}>
                        <div className="icon-area"><FaBoxOpen /></div>
                        <span>{cat}</span>
                    </button>
                ))}
            </div>
            <button className="btn-cancel" onClick={onCancel} style={{width:'100%', marginTop:'20px'}}>Cancelar</button>
        </div>
    );
};

// --- COMPONENTE FORMULÁRIO ---
const ProductForm = ({ category, initialData, onSave, onCancel }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    
    // Novos campos
    const [origin, setOrigin] = useState(initialData?.origin || 'Nacional');
    const [gender, setGender] = useState(initialData?.gender || 'Masculino');
    const [team, setTeam] = useState(initialData?.team || '');
    
    // Imagens (Armazena URL de preview ou Objeto File)
    // Nota: Para o backend, você precisará iterar sobre isso e enviar os arquivos.
    const [images, setImages] = useState(initialData?.images || []);

    // Novos campos de Preço
    const [costPrice, setCostPrice] = useState(initialData?.costPrice || ''); 
    const [salePrice, setSalePrice] = useState(initialData?.salePrice || ''); 
    
    // Lógica de Desconto
    const [hasDiscount, setHasDiscount] = useState(initialData?.hasDiscount || false);
    const [discountPercentage, setDiscountPercentage] = useState(initialData?.discountPercentage || 0);

    // Estoque
    const [simpleQty, setSimpleQty] = useState(!initialData || category !== 'Roupa' ? (initialData?.stock || 0) : 0);
    const [sizesQty, setSizesQty] = useState(category === 'Roupa' ? (initialData?.stock || { P: 0, M: 0, G: 0, GG: 0, XG: 0 }) : {});

    // Cálculo do preço final
    const finalPrice = hasDiscount 
        ? (salePrice - (salePrice * (discountPercentage / 100))).toFixed(2) 
        : salePrice;

    // --- LÓGICA DE UPLOAD DE ARQUIVO REAL ---
    const handleFileSelect = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            // Cria uma URL temporária para mostrar na tela imediatamente
            const previewUrl = URL.createObjectURL(file);
            
            // Atualiza o estado
            const newImages = [...images];
            
            // Aqui você pode salvar um objeto { file: file, preview: previewUrl } 
            // se precisar do arquivo bruto para o backend depois. 
            // Por enquanto, salvando a URL de preview para a UI funcionar:
            newImages[index] = previewUrl; 
            
            // Opcional: Remover buracos no array
            // const cleanImages = newImages.filter(img => img);
            setImages(newImages);
        }
    };

    const handleRemoveImage = (indexToRemove) => {
        const newImages = images.filter((_, index) => index !== indexToRemove);
        setImages(newImages);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            category,
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
            price: parseFloat(finalPrice), 
            stock: category === 'Roupa' ? sizesQty : parseInt(simpleQty)
        });
    };

    return (
        <div className="admin-form-container">
            <div className="form-header-actions">
                <button onClick={onCancel} className="btn-back-circle">
                    <FaArrowLeft />
                </button>
                <h2>{initialData ? 'Editar' : 'Novo'} {category}</h2>
            </div>
            
            <form onSubmit={handleSubmit}>
                {/* --- FOTOS --- */}
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

                {/* --- NOVOS CAMPOS --- */}
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

                {/* SEÇÃO PADRONIZADA: DESCONTO */}
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

                {/* SEÇÃO PADRONIZADA: ESTOQUE */}
                {category === 'Roupa' ? (
                    <div className="form-section-box">
                        <label style={{marginBottom:'15px', display:'block', fontWeight:'bold'}}>Estoque por Tamanho</label>
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
                        <label style={{marginBottom:'10px', display:'block', fontWeight:'bold'}}>Quantidade em Estoque</label>
                        <input type="number" min="0" value={simpleQty} onChange={e => setSimpleQty(e.target.value)} required />
                    </div>
                )}

                <div className="form-group" style={{marginTop:'20px'}}>
                    <label>Descrição</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} />
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-save">Salvar Produto</button>
                    <button type="button" className="btn-cancel" onClick={onCancel}>Cancelar</button>
                </div>
            </form>
        </div>
    );
};

export default Admin;