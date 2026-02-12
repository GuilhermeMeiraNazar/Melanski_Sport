import React, { useState } from 'react';
import { FaTrash, FaEdit, FaPlus, FaSignOutAlt, FaArrowLeft, FaBoxOpen } from 'react-icons/fa';

const initialProducts = [
    { id: 1, name: "Camisa Tailandesa 1", category: "Roupa", price: 150.00, stock: { P: 2, M: 5, G: 0, GG: 0, XG: 0 }, description: "Camisa top." },
    { id: 2, name: "Copo Térmico", category: "Copo", price: 80.00, stock: 20, description: "Mantém gelado." },
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
                <h1>Painel Administrativo</h1>
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
                        <td>{p.name}</td>
                        <td><span className="badge">{p.category}</span></td>
                        <td>R$ {parseFloat(p.price).toFixed(2)}</td>
                        <td>{formatStock(p.stock, p.category)}</td>
                        <td className="actions-cell">
                            <button className="edit-btn" onClick={() => onEdit(p)}><FaEdit /></button>
                            <button className="delete-btn" onClick={() => onDelete(p.id)}><FaTrash /></button>
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
            <h2>O que você vai cadastrar?</h2>
            <div className="category-grid-selector">
                {categories.map(cat => (
                    <button key={cat} onClick={() => onSelect(cat === "Roupas" ? "Roupa" : cat)}>
                        <FaBoxOpen size={24} /><br/>{cat}
                    </button>
                ))}
            </div>
            <button className="btn-cancel" onClick={onCancel} style={{width:'100%', marginTop:'20px'}}>Cancelar</button>
        </div>
    );
};

// --- COMPONENTE FORMULÁRIO (A LÓGICA QUE VOCÊ QUERIA) ---
const ProductForm = ({ category, initialData, onSave, onCancel }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    
    // Novos campos de Preço
    const [costPrice, setCostPrice] = useState(initialData?.costPrice || ''); // Preço que pagou
    const [salePrice, setSalePrice] = useState(initialData?.salePrice || ''); // Preço que vende
    
    // Lógica de Desconto
    const [hasDiscount, setHasDiscount] = useState(initialData?.hasDiscount || false);
    const [discountPercentage, setDiscountPercentage] = useState(initialData?.discountPercentage || 0);

    // Estoque
    const [simpleQty, setSimpleQty] = useState(!initialData || category !== 'Roupa' ? (initialData?.stock || 0) : 0);
    const [sizesQty, setSizesQty] = useState(category === 'Roupa' ? (initialData?.stock || { P: 0, M: 0, G: 0, GG: 0, XG: 0 }) : {});

    // Cálculo do preço final com desconto para exibição
    const finalPrice = hasDiscount 
        ? (salePrice - (salePrice * (discountPercentage / 100))).toFixed(2) 
        : salePrice;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            category,
            name,
            description,
            costPrice: parseFloat(costPrice),
            salePrice: parseFloat(salePrice),
            hasDiscount,
            discountPercentage: parseFloat(discountPercentage),
            price: parseFloat(finalPrice), // O preço que vai para a vitrine
            stock: category === 'Roupa' ? sizesQty : parseInt(simpleQty)
        });
    };

    return (
        <div className="admin-form-container">
            <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px'}}>
                <button onClick={onCancel} className="btn-back"><FaArrowLeft /></button>
                <h2>{initialData ? 'Editar' : 'Novo'} {category}</h2>
            </div>
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Nome</label>
                    <input value={name} onChange={e => setName(e.target.value)} required />
                </div>

                <div className="form-row" style={{display:'flex', gap:'15px'}}>
                    <div className="form-group" style={{flex:1}}>
                        <label>Custo (O que você pagou)</label>
                        <input type="number" step="0.01" value={costPrice} onChange={e => setCostPrice(e.target.value)} required placeholder="R$ 0,00" />
                    </div>
                    <div className="form-group" style={{flex:1}}>
                        <label>Preço de Venda (S/ desconto)</label>
                        <input type="number" step="0.01" value={salePrice} onChange={e => setSalePrice(e.target.value)} required placeholder="R$ 0,00" />
                    </div>
                </div>

                <div className="discount-section" style={{background:'#f9f9f9', padding:'15px', borderRadius:'8px', marginBottom:'15px', border:'1px solid #eee'}}>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                        <label style={{fontWeight:'bold', cursor:'pointer'}}>
                            <input type="checkbox" checked={hasDiscount} onChange={e => setHasDiscount(e.target.checked)} style={{marginRight:'10px'}} />
                            Aplicar Desconto Promocional?
                        </label>
                        {hasDiscount && <span style={{color:'#27ae60', fontWeight:'bold'}}>- {discountPercentage}%</span>}
                    </div>

                    {hasDiscount && (
                        <div style={{marginTop:'15px', display:'flex', alignItems:'center', gap:'15px'}}>
                            <div style={{flex:1}}>
                                <label>Porcentagem de Desconto (%)</label>
                                <input type="number" value={discountPercentage} onChange={e => setDiscountPercentage(e.target.value)} min="0" max="100" />
                            </div>
                            <div style={{flex:1}}>
                                <label>Preço Final na Vitrine</label>
                                <div style={{padding:'10px', background:'#fff', border:'1px solid #ddd', borderRadius:'4px', fontWeight:'bold', color:'#e74c3c'}}>
                                    R$ {finalPrice}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- MANTÉM A LÓGICA DE ESTOQUE DE ROUPAS ABAIXO --- */}
                {category === 'Roupa' ? (
                    <div className="form-group">
                        <label>Estoque por Tamanho</label>
                        <div className="sizes-input-wrapper" style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:'5px'}}>
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
                    <div className="form-group">
                        <label>Quantidade em Estoque</label>
                        <input type="number" min="0" value={simpleQty} onChange={e => setSimpleQty(e.target.value)} required />
                    </div>
                )}

                <div className="form-actions" style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                    <button type="submit" className="btn-save">Salvar Produto</button>
                    <button type="button" className="btn-cancel" onClick={onCancel}>Cancelar</button>
                </div>
            </form>
        </div>
    );
};

export default Admin;