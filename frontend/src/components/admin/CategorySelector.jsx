import React, { useState, useEffect } from 'react';
import { FaBoxOpen, FaTimes } from 'react-icons/fa';
import { categorySvc } from '../../services/api';

/**
 * Componente para seleção de categoria ao criar produto
 * Exibe grid de categorias disponíveis
 */
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
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                Carregando categorias...
            </div>
        );
    }

    return (
        <div className="admin-form-container">
            <h2 className="section-title">Selecione a Categoria do Produto</h2>
            <div className="category-grid-selector">
                {categories.map(cat => (
                    <button 
                        key={cat.id} 
                        onClick={() => onSelect(cat.name)} 
                        data-category-id={cat.id}
                    >
                        <div className="icon-area">
                            <FaBoxOpen />
                        </div>
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

export default CategorySelector;
