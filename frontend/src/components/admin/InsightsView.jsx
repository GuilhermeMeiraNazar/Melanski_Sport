import React from 'react';
import { FaBoxOpen, FaTags, FaChartLine } from 'react-icons/fa';

/**
 * Componente de Insights e Métricas (placeholder)
 * Futuramente exibirá estatísticas do sistema
 */
const InsightsView = () => {
    return (
        <div className="insights-container">
            <h2 style={{ marginBottom: '20px', color: '#333' }}>Insights e Metricas</h2>
            <div className="insights-grid">
                <div className="insight-card">
                    <div className="insight-icon" style={{ background: '#e3f2fd' }}>
                        <FaBoxOpen style={{ color: '#1976d2' }} />
                    </div>
                    <div className="insight-content">
                        <h3>Total de Produtos</h3>
                        <p className="insight-value">Em breve</p>
                    </div>
                </div>
                <div className="insight-card">
                    <div className="insight-icon" style={{ background: '#f3e5f5' }}>
                        <FaTags style={{ color: '#7b1fa2' }} />
                    </div>
                    <div className="insight-content">
                        <h3>Categorias Ativas</h3>
                        <p className="insight-value">Em breve</p>
                    </div>
                </div>
                <div className="insight-card">
                    <div className="insight-icon" style={{ background: '#e8f5e9' }}>
                        <FaChartLine style={{ color: '#388e3c' }} />
                    </div>
                    <div className="insight-content">
                        <h3>Valor Total em Estoque</h3>
                        <p className="insight-value">Em breve</p>
                    </div>
                </div>
            </div>
            <div style={{ 
                marginTop: '30px', 
                padding: '20px', 
                background: '#fff', 
                borderRadius: '12px', 
                textAlign: 'center' 
            }}>
                <p style={{ color: '#666' }}>
                    Funcionalidade em desenvolvimento. Em breve voce tera acesso a metricas detalhadas do sistema.
                </p>
            </div>
        </div>
    );
};

export default InsightsView;
