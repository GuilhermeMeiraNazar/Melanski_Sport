import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaPlus, FaTimes } from 'react-icons/fa';
import { categorySvc } from '../../services/api';
import { usesSizes } from '../../utils/stockUtils';

/**
 * Formulário de criação/edição de produtos
 * Suporta categorias com e sem tamanhos
 */
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
        if (initialData && categories.length > 0) {
            const currentCategory = categories.find(c => c.id === parseInt(initialData.category_id));
            if (currentCategory) {
                const useSizes = usesSizes(currentCategory, categories);
                
                if (useSizes && initialData.stock && typeof initialData.stock === 'object') {
                    setSizesQty(initialData.stock);
                    setSimpleQty(0);
                } else if (!useSizes) {
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
        const useSizes = currentCategory ? usesSizes(currentCategory, categories) : false;
        
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
        ? usesSizes(parseInt(categoryId), categories)
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
                                {cat.name} {usesSizes(cat, categories) ? '(com tamanhos)' : ''}
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
                                        <img src={images[index]} alt={`Produto ${index}`} loading="lazy" />
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
                        <input 
                            type="number" 
                            step="0.01" 
                            value={costPrice} 
                            onChange={e => setCostPrice(e.target.value)} 
                            required 
                            placeholder="0,00" 
                        />
                    </div>
                    <div className="form-group" style={{flex:1}}>
                        <label>Venda (R$)</label>
                        <input 
                            type="number" 
                            step="0.01" 
                            value={salePrice} 
                            onChange={e => setSalePrice(e.target.value)} 
                            required 
                            placeholder="0,00" 
                        />
                    </div>
                </div>

                <div className="form-section-box">
                    <div className="section-header-row">
                        <label className="checkbox-label">
                            <input 
                                type="checkbox" 
                                checked={hasDiscount} 
                                onChange={e => setHasDiscount(e.target.checked)} 
                            />
                            Aplicar Desconto Promocional?
                        </label>
                        {hasDiscount && <span className="discount-badge">- {discountPercentage}%</span>}
                    </div>

                    {hasDiscount && (
                        <div className="discount-inputs">
                            <div style={{flex:1}}>
                                <label>Porcentagem (%)</label>
                                <input 
                                    type="number" 
                                    value={discountPercentage} 
                                    onChange={e => setDiscountPercentage(e.target.value)} 
                                    min="0" 
                                    max="100" 
                                />
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
                                    <input 
                                        type="number" 
                                        min="0" 
                                        value={sizesQty[size]} 
                                        onChange={e => setSizesQty({
                                            ...sizesQty, 
                                            [size]: parseInt(e.target.value) || 0
                                        })} 
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="form-section-box">
                        <label style={{marginBottom:'10px', display:'block', fontWeight:'bold'}}>
                            Quantidade em Estoque
                        </label>
                        <input 
                            type="number" 
                            min="0" 
                            value={simpleQty} 
                            onChange={e => setSimpleQty(e.target.value)} 
                            required 
                        />
                    </div>
                )}

                <div className="form-group" style={{marginTop:'20px'}}>
                    <label>Descrição</label>
                    <textarea 
                        value={description} 
                        onChange={e => setDescription(e.target.value)} 
                    />
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-save" disabled={isLoading}>
                        {isLoading ? 'Salvando...' : 'Salvar Produto'}
                    </button>
                    <button 
                        type="button" 
                        className="btn-cancel" 
                        onClick={onCancel} 
                        disabled={isLoading}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
