import { useState, useEffect } from 'react';
import { FaHistory, FaFilter, FaSort } from 'react-icons/fa';
import { activityLogSvc } from '../services/api';
import { getErrorMessage } from '../utils/apiHelpers';
import Pagination from './Pagination';

/**
 * Componente de Logs de Atividade
 * Mostra histórico de ações no painel admin
 */
function ActivityLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [sortBy, setSortBy] = useState('recent'); // recent, oldest
    const [entityType, setEntityType] = useState('all'); // all, products, categories, orders, users

    useEffect(() => {
        fetchLogs();
    }, [currentPage, sortBy, entityType]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await activityLogSvc.list({ 
                page: currentPage, 
                limit: 12,
                sortBy,
                entityType
            });
            
            setLogs(response.data.data || []);
            setTotal(response.data.pagination?.total || 0);
            setTotalPages(response.data.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Erro ao buscar logs:', error);
            alert(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getEntityLabel = (type) => {
        const labels = {
            products: 'Produtos',
            categories: 'Categorias',
            orders: 'Pedidos',
            users: 'Usuários',
            appearance: 'Aparência',
            export: 'Exportação'
        };
        return labels[type] || type;
    };

    const getEntityColor = (type) => {
        const colors = {
            products: '#007bff',
            categories: '#28a745',
            orders: '#ffc107',
            users: '#dc3545',
            appearance: '#6f42c1',
            export: '#17a2b8'
        };
        return colors[type] || '#6c757d';
    };

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Reset página ao mudar filtros
    useEffect(() => {
        setCurrentPage(1);
    }, [sortBy, entityType]);

    if (loading && logs.length === 0) {
        return (
            <div className="activity-logs-loading">
                <div className="spinner"></div>
                <p>Carregando logs...</p>
            </div>
        );
    }

    return (
        <div className="activity-logs">
            {/* Header */}
            <div className="logs-header">
                <div className="header-title">
                    <FaHistory />
                    <h2>Logs de Atividade</h2>
                </div>
                <p className="logs-subtitle">
                    {total} {total === 1 ? 'registro' : 'registros'} encontrado{total !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Filtros */}
            <div className="logs-filters">
                {/* Filtro por Categoria */}
                <div className="filter-group">
                    <label>
                        <FaFilter /> Categoria
                    </label>
                    <select value={entityType} onChange={e => setEntityType(e.target.value)}>
                        <option value="all">Todas</option>
                        <option value="products">Produtos</option>
                        <option value="categories">Categorias</option>
                        <option value="orders">Pedidos</option>
                        <option value="users">Usuários</option>
                    </select>
                </div>

                {/* Filtro por Data */}
                <div className="filter-group">
                    <label>
                        <FaSort /> Ordenar
                    </label>
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                        <option value="recent">Mais Recente</option>
                        <option value="oldest">Mais Antigo</option>
                    </select>
                </div>
            </div>

            {/* Lista de Logs */}
            {logs.length === 0 ? (
                <div className="logs-empty">
                    <FaHistory />
                    <p>Nenhum log encontrado</p>
                </div>
            ) : (
                <>
                    <div className="logs-list">
                        {logs.map((log) => (
                            <div key={log.id} className="log-item">
                                <div 
                                    className="log-badge" 
                                    style={{ backgroundColor: getEntityColor(log.entity_type) }}
                                >
                                    {getEntityLabel(log.entity_type)}
                                </div>
                                
                                <div className="log-content">
                                    <div className="log-action">{log.action}</div>
                                    <div className="log-meta">
                                        <span className="log-user">
                                            {log.user_name || 'Sistema'}
                                        </span>
                                        <span className="log-separator">•</span>
                                        <span className="log-date">
                                            {formatDate(log.created_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Paginação */}
                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            paginate={paginate}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default ActivityLogs;
