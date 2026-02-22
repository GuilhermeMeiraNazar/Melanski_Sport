import React from 'react';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { formatStock } from '../../utils/stockUtils';
import { formatPrice } from '../../utils/priceUtils';

/**
 * Componente de listagem de produtos no painel admin
 * Exibe tabela com produtos e ações de editar/deletar
 */
const ProductList = ({ products, onEdit, onDelete, userRole }) => {
    const canDelete = ['developer', 'administrator'].includes(userRole);

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
                    <tr>
                        <td colSpan="5" style={{textAlign:'center'}}>
                            Nenhum produto encontrado.
                        </td>
                    </tr>
                ) : (
                    products.map(p => (
                        <tr key={p.id}>
                            <td data-label="Nome">
                                <span style={{fontWeight:'600'}}>{p.name}</span>
                            </td>
                            <td data-label="Categoria">
                                <span className="badge">{p.category}</span>
                            </td>
                            <td data-label="Preço" style={{color:'#27ae60', fontWeight:'bold'}}>
                                {formatPrice(p.price || 0)}
                            </td>
                            <td data-label="Estoque">
                                {formatStock(p.stock)}
                            </td>
                            <td data-label="Ações">
                                <div className="actions-cell">
                                    <button 
                                        className="edit-btn" 
                                        onClick={() => onEdit(p)} 
                                        title="Editar"
                                    >
                                        <FaEdit />
                                    </button>
                                    {canDelete && (
                                        <button 
                                            className="delete-btn" 
                                            onClick={() => onDelete(p.id)} 
                                            title="Excluir"
                                        >
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

export default ProductList;
