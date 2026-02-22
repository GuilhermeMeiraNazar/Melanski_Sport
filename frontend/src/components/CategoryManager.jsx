import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { categorySvc } from '../services/api';

function CategoryManager() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', slug: '', has_sizes: false });

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await categorySvc.update(editingCategory.id, formData);
                alert('Categoria atualizada com sucesso!');
            } else {
                await categorySvc.create(formData);
                alert('Categoria criada com sucesso!');
            }
            setShowForm(false);
            setEditingCategory(null);
            setFormData({ name: '', slug: '' });
            fetchCategories();
        } catch (error) {
            console.error('Erro ao salvar categoria:', error);
            alert(error.response?.data?.error || 'Erro ao salvar categoria');
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({ 
            name: category.name, 
            slug: category.slug,
            has_sizes: category.has_sizes ? true : false
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;
        
        try {
            await categorySvc.delete(id);
            alert('Categoria excluída com sucesso!');
            fetchCategories();
        } catch (error) {
            console.error('Erro ao deletar categoria:', error);
            alert(error.response?.data?.error || 'Erro ao deletar categoria');
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingCategory(null);
        setFormData({ name: '', slug: '', has_sizes: false });
    };

    // Função para verificar se a categoria usa tamanhos (baseado no campo has_sizes)
    const usesSizes = (category) => {
        if (typeof category === 'object') {
            return category.has_sizes === 1 || category.has_sizes === true;
        }
        return false;
    };

    return (
        <div className="category-manager">
            <div className="manager-header">
                <h2>Gerenciar Categorias</h2>
                {!showForm && (
                    <button className="btn-add" onClick={() => setShowForm(true)}>
                        <FaPlus /> Nova Categoria
                    </button>
                )}
            </div>

            {showForm && (
                <div className="category-form">
                    <h3>{editingCategory ? 'Editar' : 'Nova'} Categoria</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Nome</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: Camisetas, Garrafas, Acessorios"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Slug (URL amigavel)</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="deixe vazio para gerar automaticamente"
                                />
                            </div>
                        </div>
                        <div className="form-group checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.has_sizes}
                                    onChange={(e) => setFormData({ ...formData, has_sizes: e.target.checked })}
                                />
                                <span>Esta categoria usa tamanhos (P, M, G, GG, XG)</span>
                            </label>
                            <small>
                                Marque esta opcao para produtos como camisetas, roupas e uniformes que precisam de controle de estoque por tamanho.
                            </small>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn-save">Salvar</button>
                            <button type="button" className="btn-cancel" onClick={handleCancel}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div style={{ padding: '20px', textAlign: 'center' }}>Carregando...</div>
            ) : (
                <table className="category-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Slug</th>
                            <th>Usa Tamanhos</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center' }}>
                                    Nenhuma categoria cadastrada
                                </td>
                            </tr>
                        ) : (
                            categories.map((cat) => (
                                <tr key={cat.id}>
                                    <td>{cat.id}</td>
                                    <td>{cat.name}</td>
                                    <td><code>{cat.slug}</code></td>
                                    <td>
                                        {usesSizes(cat) ? (
                                            <span className="badge badge-success">
                                                Sim
                                            </span>
                                        ) : (
                                            <span className="badge badge-default">Nao</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="actions-cell">
                                            <button
                                                className="edit-btn"
                                                onClick={() => handleEdit(cat)}
                                                title="Editar"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleDelete(cat.id)}
                                                title="Excluir"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default CategoryManager;
