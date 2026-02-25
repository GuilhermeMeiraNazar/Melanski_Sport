import { useState } from 'react';
import { FaFileExport, FaBoxOpen, FaTags, FaHistory, FaUsers, FaDownload, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import { BASE_URL } from '../../config/api';

/**
 * Gerenciador de Exportação de Dados
 * Permite exportar dados em formato Excel (.xlsx)
 */
const ExportManager = () => {
    const [loading, setLoading] = useState({
        inventory: false,
        customers: false,
        categories: false,
        logs: false
    });

    const handleExport = async (type) => {
        try {
            setLoading(prev => ({ ...prev, [type]: true }));

            const token = localStorage.getItem('token');
            const endpoints = {
                inventory: '/api/export/inventory',
                customers: '/api/export/customers',
                categories: '/api/export/categories',
                logs: '/api/export/activity-logs'
            };

            const response = await axios.get(`${BASE_URL}${endpoints[type]}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob'
            });

            // Criar link de download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Extrair nome do arquivo do header ou usar padrão
            const contentDisposition = response.headers['content-disposition'];
            let filename = `export_${type}_${Date.now()}.xlsx`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }
            
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            alert('Arquivo exportado com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar:', error);
            alert(error.response?.data?.error || 'Erro ao exportar dados');
        } finally {
            setLoading(prev => ({ ...prev, [type]: false }));
        }
    };

    return (
        <div className="export-manager-container">
            <div className="manager-header">
                <FaFileExport />
                <h2>Exportar Dados</h2>
            </div>
            
            <div className="export-content">
                <div className="export-intro">
                    <FaDownload style={{ 
                        fontSize: '3rem', 
                        color: '#27ae60', 
                        marginBottom: '15px' 
                    }} />
                    <h3>Exportação de Tabelas</h3>
                    <p>
                        Exporte os dados do sistema em formato Excel (.xlsx) compatível com 
                        Microsoft Excel e Google Sheets.
                    </p>
                </div>
                
                <div className="export-options-grid">
                    <div className="export-option-card">
                        <div className="export-icon" style={{ background: '#e3f2fd' }}>
                            <FaBoxOpen style={{ color: '#1976d2', fontSize: '1.5rem' }} />
                        </div>
                        <h4>Estoque de Produtos</h4>
                        <p>Exportar produtos com estoque por tamanho, preços e descontos</p>
                        <button 
                            className="btn-export-item" 
                            onClick={() => handleExport('inventory')}
                            disabled={loading.inventory}
                        >
                            {loading.inventory ? (
                                <>
                                    <FaSpinner className="spinner" /> Exportando...
                                </>
                            ) : (
                                <>
                                    <FaFileExport /> Exportar Estoque
                                </>
                            )}
                        </button>
                    </div>
                    
                    <div className="export-option-card">
                        <div className="export-icon" style={{ background: '#e8f5e9' }}>
                            <FaUsers style={{ color: '#388e3c', fontSize: '1.5rem' }} />
                        </div>
                        <h4>Clientes Cadastrados</h4>
                        <p>Exportar lista de clientes com email e data de cadastro</p>
                        <button 
                            className="btn-export-item" 
                            onClick={() => handleExport('customers')}
                            disabled={loading.customers}
                        >
                            {loading.customers ? (
                                <>
                                    <FaSpinner className="spinner" /> Exportando...
                                </>
                            ) : (
                                <>
                                    <FaFileExport /> Exportar Clientes
                                </>
                            )}
                        </button>
                    </div>
                    
                    <div className="export-option-card">
                        <div className="export-icon" style={{ background: '#f3e5f5' }}>
                            <FaTags style={{ color: '#7b1fa2', fontSize: '1.5rem' }} />
                        </div>
                        <h4>Categorias</h4>
                        <p>Exportar categorias com total de produtos por categoria</p>
                        <button 
                            className="btn-export-item" 
                            onClick={() => handleExport('categories')}
                            disabled={loading.categories}
                        >
                            {loading.categories ? (
                                <>
                                    <FaSpinner className="spinner" /> Exportando...
                                </>
                            ) : (
                                <>
                                    <FaFileExport /> Exportar Categorias
                                </>
                            )}
                        </button>
                    </div>
                    
                    <div className="export-option-card">
                        <div className="export-icon" style={{ background: '#fff3e0' }}>
                            <FaHistory style={{ color: '#f57c00', fontSize: '1.5rem' }} />
                        </div>
                        <h4>Logs de Atividade</h4>
                        <p>Exportar histórico completo de ações do sistema</p>
                        <button 
                            className="btn-export-item" 
                            onClick={() => handleExport('logs')}
                            disabled={loading.logs}
                        >
                            {loading.logs ? (
                                <>
                                    <FaSpinner className="spinner" /> Exportando...
                                </>
                            ) : (
                                <>
                                    <FaFileExport /> Exportar Logs
                                </>
                            )}
                        </button>
                    </div>
                </div>
                
                <div className="export-info-box">
                    <div className="info-header">
                        <span className="info-badge">📊</span>
                        <h4>Informações sobre Exportação</h4>
                    </div>
                    <p>
                        Os arquivos exportados são compatíveis com:
                    </p>
                    <div className="info-features">
                        <div className="info-feature-item">
                            <span>✓</span>
                            <div>
                                <strong>Microsoft Excel</strong>
                                <p>Formato .xlsx nativo</p>
                            </div>
                        </div>
                        <div className="info-feature-item">
                            <span>✓</span>
                            <div>
                                <strong>Google Sheets</strong>
                                <p>Importe diretamente no Google Drive</p>
                            </div>
                        </div>
                        <div className="info-feature-item">
                            <span>✓</span>
                            <div>
                                <strong>LibreOffice Calc</strong>
                                <p>Software livre e gratuito</p>
                            </div>
                        </div>
                        <div className="info-feature-item">
                            <span>✓</span>
                            <div>
                                <strong>Dados Atualizados</strong>
                                <p>Exportação em tempo real do banco</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExportManager;
