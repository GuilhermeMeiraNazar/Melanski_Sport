import React from 'react';
import { FaFileExport, FaBoxOpen, FaTags, FaHistory, FaUsers } from 'react-icons/fa';

/**
 * Gerenciador de Exportação de Dados (placeholder)
 * Futuramente permitirá exportar dados em Excel/CSV
 */
const ExportManager = () => {
    return (
        <div className="export-manager-container">
            <div className="manager-header">
                <h2>Exportar Dados</h2>
            </div>
            
            <div className="export-content">
                <div className="export-intro">
                    <FaFileExport style={{ 
                        fontSize: '3rem', 
                        color: '#27ae60', 
                        marginBottom: '15px' 
                    }} />
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

export default ExportManager;
