import React, { useState, useEffect } from 'react';
import { FaHistory, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { activityLogSvc } from '../services/api';

function ActivityLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [expandedLog, setExpandedLog] = useState(null);

    useEffect(() => {
        fetchLogs();
    }, [pagination.page]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await activityLogSvc.list({ page: pagination.page, limit: 20 });
            setLogs(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Erro ao buscar logs:', error);
            alert('Erro ao carregar logs de atividade');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR');
    };

    const toggleDetails = (logId) => {
        setExpandedLog(expandedLog === logId ? null : logId);
    };

    return (
        <div className="activity-logs">
            <div className="logs-header">
                <h2><FaHistory /> Histórico de Atividades</h2>
                <p className="logs-subtitle">
                    Total de {pagination.total} registros
                </p>
            </div>

            {loading ? (
                <div style={{ padding: '20px', textAlign: 'center' }}>Carregando...</div>
            ) : (
                <>
                    <div className="logs-list">
                        {logs.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                Nenhum log encontrado
                            </div>
                        ) : (
                            logs.map((log) => (
                                <div key={log.id} className="log-item">
                                    <div className="log-main" onClick={() => toggleDetails(log.id)}>
                                        <div className="log-info">
                                            <span className="log-action">{log.action}</span>
                                            <span className="log-user">por {log.user_name || 'Sistema'}</span>
                                            <span className="log-date">{formatDate(log.created_at)}</span>
                                        </div>
                                        <div className="log-target">
                                            <span className="log-table">{log.target_table}</span>
                                            <span className="log-id">ID: {log.target_id}</span>
                                        </div>
                                    </div>
                                    
                                    {expandedLog === log.id && log.details && (
                                        <div className="log-details">
                                            <pre>{JSON.stringify(log.details, null, 2)}</pre>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {pagination.totalPages > 1 && (
                        <div className="logs-pagination">
                            <button
                                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                disabled={pagination.page === 1}
                            >
                                <FaChevronLeft /> Anterior
                            </button>
                            <span>
                                Página {pagination.page} de {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                disabled={pagination.page === pagination.totalPages}
                            >
                                Próxima <FaChevronRight />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default ActivityLogs;
