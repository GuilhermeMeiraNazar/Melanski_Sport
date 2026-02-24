import { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaUndo, FaToggleOn, FaToggleOff, FaCog, FaKey, FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { developerSettingsSvc } from '../../services/api';
import { getErrorMessage } from '../../utils/apiHelpers';
import axios from 'axios';

/**
 * Modal de configurações avançadas (apenas para developers)
 * Permite configurar recursos e permissões do sistema
 */
const DevSettingsModal = ({ onClose }) => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('features'); // 'features' ou 'credentials'
    
    // Credentials state
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [credentials, setCredentials] = useState({});
    const [showPasswords, setShowPasswords] = useState({});
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [savingCredentials, setSavingCredentials] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    useEffect(() => {
        loadSettings();
    }, []);

    useEffect(() => {
        if (activeTab === 'credentials') {
            loadServices();
        }
    }, [activeTab]);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const response = await developerSettingsSvc.getSettings();
            setSettings(response.data.settings || {});
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
            alert(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (key) => {
        setSettings(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                value: !prev[key].value
            }
        }));
    };

    const handleNumberChange = (key, value) => {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue < 0) return;

        setSettings(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                value: numValue
            }
        }));
    };

    const handleSave = async () => {
        if (!window.confirm('Salvar todas as configurações? Isso pode afetar o funcionamento do sistema.')) {
            return;
        }

        try {
            setSaving(true);
            
            // Preparar objeto com apenas os valores
            const settingsToSave = {};
            Object.keys(settings).forEach(key => {
                settingsToSave[key] = settings[key].value;
            });

            await developerSettingsSvc.updateMultipleSettings(settingsToSave);
            alert('Configurações salvas com sucesso! Recarregue a página para aplicar as mudanças.');
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            alert(getErrorMessage(error));
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm('Resetar todas as configurações para o padrão? Esta ação não pode ser desfeita.')) {
            return;
        }

        try {
            setSaving(true);
            await developerSettingsSvc.resetToDefaults();
            alert('Configurações resetadas com sucesso!');
            await loadSettings();
        } catch (error) {
            console.error('Erro ao resetar configurações:', error);
            alert(getErrorMessage(error));
        } finally {
            setSaving(false);
        }
    };

    // ========== CREDENTIALS MANAGEMENT ==========
    
    const loadServices = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            console.log('🔑 Token:', token ? 'Presente' : 'Ausente');
            console.log('🌐 API URL:', `${API_URL}/credentials`);
            
            const response = await axios.get(`${API_URL}/credentials`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('✅ Resposta da API:', response.data);
            
            setServices(response.data.services || []);
            if (response.data.services?.length > 0) {
                setSelectedService(response.data.services[0].service);
                loadCredentials(response.data.services[0].service);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar serviços:', error);
            console.error('❌ Detalhes do erro:', error.response?.data);
            console.error('❌ Status:', error.response?.status);
            alert(`Erro ao carregar serviços: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const loadCredentials = async (service) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/credentials/${service}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.credentials) {
                setCredentials(response.data.credentials);
            } else {
                setCredentials(getEmptyCredentials(service));
            }
        } catch (error) {
            console.error('Erro ao carregar credenciais:', error);
            setCredentials(getEmptyCredentials(service));
        }
    };

    const getEmptyCredentials = (service) => {
        const templates = {
            email: {
                host: '',
                port: '587',
                secure: 'false',
                user: '',
                password: '',
                from_name: 'Melanski Sport'
            },
            cloudinary: {
                cloud_name: '',
                api_key: '',
                api_secret: ''
            },
            mercadopago: {
                access_token: '',
                public_key: '',
                webhook_secret: ''
            },
            whatsapp: {
                phone_number: '',
                api_token: ''
            },
            urls: {
                frontend_url: 'http://localhost:5173',
                backend_url: 'http://localhost:3000'
            },
            jwt: {
                secret: ''
            }
        };
        return templates[service] || {};
    };

    const handleServiceChange = (service) => {
        setSelectedService(service);
        setTestResult(null);
        loadCredentials(service);
    };

    const handleCredentialChange = (field, value) => {
        setCredentials(prev => ({
            ...prev,
            [field]: value
        }));
        setTestResult(null);
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleTestCredentials = async () => {
        try {
            setTesting(true);
            setTestResult(null);
            
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/credentials/test/${selectedService}`,
                { credentials },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setTestResult({
                success: true,
                message: response.data.message || 'Teste realizado com sucesso!'
            });
        } catch (error) {
            setTestResult({
                success: false,
                message: error.response?.data?.message || 'Erro ao testar conexão'
            });
        } finally {
            setTesting(false);
        }
    };

    const handleSaveCredentials = async () => {
        if (!window.confirm('Salvar credenciais? Elas serão criptografadas e armazenadas com segurança.')) {
            return;
        }

        try {
            setSavingCredentials(true);
            const token = localStorage.getItem('token');
            
            await axios.put(
                `${API_URL}/credentials/${selectedService}`,
                { credentials },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert('Credenciais salvas com sucesso!');
            setTestResult(null);
            await loadServices(); // Recarregar para atualizar status de configurado
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert(error.response?.data?.message || 'Erro ao salvar credenciais');
        } finally {
            setSavingCredentials(false);
        }
    };

    const getServiceInfo = (service) => {
        const info = {
            email: {
                icon: '📧',
                name: 'Email (SMTP)',
                description: 'Configurações para envio de emails'
            },
            cloudinary: {
                icon: '☁️',
                name: 'Cloudinary',
                description: 'Serviço de hospedagem de imagens'
            },
            mercadopago: {
                icon: '💰',
                name: 'Mercado Pago',
                description: 'Gateway de pagamento online'
            },
            whatsapp: {
                icon: '💬',
                name: 'WhatsApp',
                description: 'Integração com WhatsApp Business'
            },
            urls: {
                icon: '🌐',
                name: 'URLs do Sistema',
                description: 'URLs do frontend e backend'
            },
            jwt: {
                icon: '🔐',
                name: 'JWT Secret',
                description: 'Chave secreta para tokens JWT'
            }
        };
        return info[service] || { icon: '⚙️', name: service, description: '' };
    };

    const renderCredentialFields = () => {
        const fields = Object.keys(credentials);
        const isPasswordField = (field) => {
            return field.includes('password') || field.includes('secret') || 
                   field.includes('token') || field.includes('key');
        };

        return fields.map(field => (
            <div key={field} className="credential-field">
                <label>
                    {field.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </label>
                <div className="input-with-toggle">
                    <input
                        type={isPasswordField(field) && !showPasswords[field] ? 'password' : 'text'}
                        value={credentials[field] || ''}
                        onChange={(e) => handleCredentialChange(field, e.target.value)}
                        placeholder={`Digite ${field}`}
                        disabled={savingCredentials || testing}
                    />
                    {isPasswordField(field) && (
                        <button
                            type="button"
                            className="toggle-visibility"
                            onClick={() => togglePasswordVisibility(field)}
                        >
                            {showPasswords[field] ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    )}
                </div>
            </div>
        ));
    };

    const featureSettings = [
        { key: 'feature_orders', label: 'Vendas/Pedidos', icon: '🛒' },
        { key: 'feature_logs', label: 'Logs de Atividade', icon: '📋' },
        { key: 'feature_appearance', label: 'Aparência', icon: '🎨' },
        { key: 'feature_export', label: 'Exportação', icon: '📤' },
        { key: 'feature_insights', label: 'Insights', icon: '📊' },
        { key: 'feature_users', label: 'Gerenciamento de Usuários', icon: '👥' }
    ];

    const limitSettings = [
        { key: 'max_products', label: 'Máximo de Produtos', icon: '📦' },
        { key: 'max_categories', label: 'Máximo de Categorias', icon: '🏷️' },
        { key: 'max_users', label: 'Máximo de Usuários', icon: '👤' }
    ];

    if (loading) {
        return (
            <div className="dev-settings-overlay">
                <div className="dev-settings-modal">
                    <div className="dev-settings-loading">
                        <div className="spinner"></div>
                        <p>Carregando configurações...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dev-settings-overlay" onClick={onClose}>
            <div className="dev-settings-modal" onClick={(e) => e.stopPropagation()}>
                <div className="dev-settings-header">
                    <div>
                        <h2>⚙️ Painel Developer</h2>
                        <p className="dev-settings-subtitle">
                            Controle de funcionalidades, limites e credenciais do sistema
                        </p>
                    </div>
                    <button className="btn-close-modal" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                {/* Tabs */}
                <div className="dev-settings-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'features' ? 'active' : ''}`}
                        onClick={() => setActiveTab('features')}
                    >
                        <FaCog /> Funcionalidades
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'credentials' ? 'active' : ''}`}
                        onClick={() => setActiveTab('credentials')}
                    >
                        <FaKey /> Credenciais
                    </button>
                </div>
                
                <div className="dev-settings-content">
                    {activeTab === 'features' && (
                        <>
                            {/* Warning Box */}
                            <div className="dev-warning-box">
                                <div className="warning-icon">⚠️</div>
                                <div>
                                    <strong>Atenção:</strong> Desabilitar funcionalidades irá ocultar os botões 
                                    e bloquear o acesso às rotas correspondentes. Usuários não poderão acessar 
                                    essas funcionalidades até que sejam reativadas.
                                </div>
                            </div>
                            
                            {/* Features Section */}
                            <div className="dev-settings-section">
                                <h3>🎯 Funcionalidades do Sistema</h3>
                                <p className="section-description">
                                    Habilite ou desabilite funcionalidades específicas do painel administrativo
                                </p>
                                
                                <div className="settings-grid">
                                    {featureSettings.map(feature => (
                                        <div key={feature.key} className="setting-item">
                                            <div className="setting-info">
                                                <span className="setting-icon">{feature.icon}</span>
                                                <div>
                                                    <label>{feature.label}</label>
                                                    <p className="setting-description">
                                                        {settings[feature.key]?.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                className={`toggle-btn ${settings[feature.key]?.value ? 'active' : ''}`}
                                                onClick={() => handleToggle(feature.key)}
                                                disabled={saving}
                                            >
                                                {settings[feature.key]?.value ? (
                                                    <><FaToggleOn /> Ativo</>
                                                ) : (
                                                    <><FaToggleOff /> Inativo</>
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Limits Section */}
                            <div className="dev-settings-section">
                                <h3>📊 Limites do Sistema</h3>
                                <p className="section-description">
                                    Defina limites máximos para recursos do sistema
                                </p>
                                
                                <div className="settings-grid">
                                    {limitSettings.map(limit => (
                                        <div key={limit.key} className="setting-item">
                                            <div className="setting-info">
                                                <span className="setting-icon">{limit.icon}</span>
                                                <div>
                                                    <label>{limit.label}</label>
                                                    <p className="setting-description">
                                                        {settings[limit.key]?.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <input
                                                type="number"
                                                min="1"
                                                max="10000"
                                                value={settings[limit.key]?.value || 0}
                                                onChange={(e) => handleNumberChange(limit.key, e.target.value)}
                                                className="limit-input"
                                                disabled={saving}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Additional Settings */}
                            <div className="dev-settings-section">
                                <h3>🔧 Configurações Adicionais</h3>
                                <div className="settings-grid">
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <span className="setting-icon">🎨</span>
                                            <div>
                                                <label>Edição de Temas Padrão</label>
                                                <p className="setting-description">
                                                    Permitir que developers editem temas pré-definidos
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            className={`toggle-btn ${settings.allow_theme_editing?.value ? 'active' : ''}`}
                                            onClick={() => handleToggle('allow_theme_editing')}
                                            disabled={saving}
                                        >
                                            {settings.allow_theme_editing?.value ? (
                                                <><FaToggleOn /> Ativo</>
                                            ) : (
                                                <><FaToggleOff /> Inativo</>
                                            )}
                                        </button>
                                    </div>

                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <span className="setting-icon">🚧</span>
                                            <div>
                                                <label>Modo Manutenção</label>
                                                <p className="setting-description">
                                                    Desabilitar acesso de clientes ao site
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            className={`toggle-btn ${settings.maintenance_mode?.value ? 'active' : ''}`}
                                            onClick={() => handleToggle('maintenance_mode')}
                                            disabled={saving}
                                        >
                                            {settings.maintenance_mode?.value ? (
                                                <><FaToggleOn /> Ativo</>
                                            ) : (
                                                <><FaToggleOff /> Inativo</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Methods Section */}
                            <div className="dev-settings-section">
                                <h3>💳 Métodos de Pagamento</h3>
                                <p className="section-description">
                                    Configure quais métodos de pagamento estarão disponíveis para os clientes
                                </p>
                                <div className="settings-grid">
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <span className="setting-icon">💬</span>
                                            <div>
                                                <label>Finalizar via WhatsApp</label>
                                                <p className="setting-description">
                                                    Permitir que clientes finalizem compras via WhatsApp
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            className={`toggle-btn ${settings.payment_whatsapp?.value ? 'active' : ''}`}
                                            onClick={() => handleToggle('payment_whatsapp')}
                                            disabled={saving}
                                        >
                                            {settings.payment_whatsapp?.value ? (
                                                <><FaToggleOn /> Ativo</>
                                            ) : (
                                                <><FaToggleOff /> Inativo</>
                                            )}
                                        </button>
                                    </div>

                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <span className="setting-icon">💰</span>
                                            <div>
                                                <label>Finalizar via Mercado Pago</label>
                                                <p className="setting-description">
                                                    Permitir pagamento online via Mercado Pago
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            className={`toggle-btn ${settings.payment_mercadopago?.value ? 'active' : ''}`}
                                            onClick={() => handleToggle('payment_mercadopago')}
                                            disabled={saving}
                                        >
                                            {settings.payment_mercadopago?.value ? (
                                                <><FaToggleOn /> Ativo</>
                                            ) : (
                                                <><FaToggleOff /> Inativo</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'credentials' && (
                        <>
                            {loading ? (
                                <div className="dev-settings-loading">
                                    <FaSpinner className="spinner" />
                                    <p>Carregando serviços...</p>
                                </div>
                            ) : services.length === 0 ? (
                                <div className="dev-settings-section">
                                    <div className="dev-warning-box">
                                        <div className="warning-icon">⚠️</div>
                                        <div>
                                            <strong>Nenhum serviço disponível.</strong> Verifique se o backend está rodando e se você tem permissão de developer.
                                        </div>
                                    </div>
                                </div>
                            ) : selectedService ? (
                                <>
                                    {/* Service Selector */}
                                    <div className="dev-settings-section">
                                        <h3>Selecione o Serviço</h3>
                                        <div className="service-tabs">
                                            {services.map(svc => {
                                                const info = getServiceInfo(svc.service);
                                                return (
                                                    <button
                                                        key={svc.service}
                                                        className={`service-tab ${selectedService === svc.service ? 'active' : ''} ${svc.is_configured ? 'configured' : ''}`}
                                                        onClick={() => handleServiceChange(svc.service)}
                                                    >
                                                        <span className="service-icon">{info.icon}</span>
                                                        <span className="service-name">{info.name}</span>
                                                        {svc.is_configured && <span className="configured-badge">✓</span>}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Service Info */}
                                    <div className="service-info-box">
                                        <div className="service-info-header">
                                            <span className="service-info-icon">{getServiceInfo(selectedService).icon}</span>
                                            <div>
                                                <h4>{getServiceInfo(selectedService).name}</h4>
                                                <p>{getServiceInfo(selectedService).description}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Credentials Form */}
                                    <div className="credentials-form">
                                        <h3>Configurações</h3>
                                        {renderCredentialFields()}
                                    </div>

                                    {/* Test Result */}
                                    {testResult && (
                                        <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
                                            {testResult.success ? (
                                                <FaCheckCircle className="result-icon" />
                                            ) : (
                                                <FaTimesCircle className="result-icon" />
                                            )}
                                            <span>{testResult.message}</span>
                                        </div>
                                    )}

                                    {/* Credentials Actions */}
                                    <div className="credentials-actions">
                                        <button
                                            className="btn-test-credentials"
                                            onClick={handleTestCredentials}
                                            disabled={savingCredentials || testing}
                                        >
                                            {testing ? (
                                                <>
                                                    <FaSpinner className="spinner" /> Testando...
                                                </>
                                            ) : (
                                                <>🧪 Testar Conexão</>
                                            )}
                                        </button>
                                        <button
                                            className="btn-save-credentials"
                                            onClick={handleSaveCredentials}
                                            disabled={savingCredentials || testing}
                                        >
                                            {savingCredentials ? (
                                                <>
                                                    <FaSpinner className="spinner" /> Salvando...
                                                </>
                                            ) : (
                                                <>
                                                    <FaSave /> Salvar Credenciais
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            ) : null}
                        </>
                    )}
                </div>
                
                <div className="dev-settings-footer">
                    {activeTab === 'features' && (
                        <>
                            <button 
                                className="btn-reset" 
                                onClick={handleReset}
                                disabled={saving}
                            >
                                <FaUndo /> Resetar Padrão
                            </button>
                            <div className="footer-right">
                                <button className="btn-secondary" onClick={onClose} disabled={saving}>
                                    Fechar
                                </button>
                                <button 
                                    className="btn-primary btn-save-dev" 
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    <FaSave /> {saving ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </>
                    )}
                    {activeTab === 'credentials' && (
                        <div className="footer-right" style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <button className="btn-secondary" onClick={onClose}>
                                Fechar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DevSettingsModal;
