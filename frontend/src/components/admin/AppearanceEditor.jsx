import React from 'react';
import { FaPlus, FaPalette } from 'react-icons/fa';

/**
 * Editor de Aparência do site (placeholder)
 * Futuramente permitirá customizar cores e tema
 */
const AppearanceEditor = () => {
    return (
        <div className="appearance-editor-container">
            <div className="manager-header">
                <h2>Editor de Aparencia</h2>
                <button className="btn-save" disabled>
                    <FaPlus /> Salvar Alteracoes
                </button>
            </div>
            
            <div className="appearance-content">
                <div className="appearance-preview-section">
                    <h3>Preview do Site</h3>
                    <div className="preview-box">
                        <div className="preview-placeholder">
                            <FaPalette style={{ 
                                fontSize: '3rem', 
                                color: '#cbd5e0', 
                                marginBottom: '15px' 
                            }} />
                            <p>Preview em tempo real sera exibido aqui</p>
                        </div>
                    </div>
                </div>
                
                <div className="appearance-settings-section">
                    <h3>Personalizacao de Cores</h3>
                    <p className="section-description">
                        Customize as cores principais do site para combinar com a identidade visual da sua marca.
                    </p>
                    
                    <div className="color-settings-grid">
                        <div className="color-setting-item">
                            <label>Cor Principal</label>
                            <div className="color-input-wrapper">
                                <div className="color-preview" style={{ background: '#e74c3c' }}></div>
                                <input type="text" value="#e74c3c" disabled />
                            </div>
                            <small>Usada em botoes, links e destaques</small>
                        </div>
                        
                        <div className="color-setting-item">
                            <label>Cor Secundaria</label>
                            <div className="color-input-wrapper">
                                <div className="color-preview" style={{ background: '#2c3e50' }}></div>
                                <input type="text" value="#2c3e50" disabled />
                            </div>
                            <small>Usada em textos e elementos secundarios</small>
                        </div>
                        
                        <div className="color-setting-item">
                            <label>Cor de Fundo</label>
                            <div className="color-input-wrapper">
                                <div className="color-preview" style={{ background: '#ffffff' }}></div>
                                <input type="text" value="#ffffff" disabled />
                            </div>
                            <small>Cor de fundo principal do site</small>
                        </div>
                        
                        <div className="color-setting-item">
                            <label>Cor de Destaque</label>
                            <div className="color-input-wrapper">
                                <div className="color-preview" style={{ background: '#f39c12' }}></div>
                                <input type="text" value="#f39c12" disabled />
                            </div>
                            <small>Usada em promocoes e ofertas</small>
                        </div>
                    </div>
                    
                    <div className="feature-info-box">
                        <div className="info-icon">🎨</div>
                        <div>
                            <h4>Funcionalidade em Desenvolvimento</h4>
                            <p>Em breve voce podera personalizar completamente a aparencia do site:</p>
                            <ul>
                                <li>Escolher cores personalizadas com seletor de cores</li>
                                <li>Visualizar mudancas em tempo real</li>
                                <li>Salvar temas personalizados</li>
                                <li>Alternar entre temas claro e escuro</li>
                                <li>Personalizar fontes e espacamentos</li>
                                <li>Fazer upload de logo personalizado</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppearanceEditor;
