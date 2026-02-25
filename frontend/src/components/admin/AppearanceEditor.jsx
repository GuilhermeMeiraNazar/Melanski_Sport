import { useState, useEffect } from 'react';
import { FaPalette, FaUndo, FaSave, FaEye, FaTimes, FaEdit } from 'react-icons/fa';
import axios from 'axios';
import { useTheme } from '../../contexts/ThemeContext';
import { API_URL } from '../../config/api';

/**
 * Editor de Aparência
 * Permite customizar cores e temas do site com preview em tempo real
 * 
 * Temas:
 * - 3 temas pré-definidos (Padrão, Escuro, Claro) - NÃO editáveis
 * - 2 temas personalizados (Custom 1, Custom 2) - Editáveis e salvos no banco
 */
const AppearanceEditor = () => {
    const { refreshTheme } = useTheme();
    const [activeTheme, setActiveTheme] = useState('default'); // default, dark, light, custom1, custom2
    const [customThemes, setCustomThemes] = useState({
        custom1: {},
        custom2: {}
    });
    const [currentColors, setCurrentColors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [allowThemeEditing, setAllowThemeEditing] = useState(false);
    const [userRole, setUserRole] = useState('');

    // Temas pré-definidos (não editáveis por padrão)
    const predefinedThemes = {
        default: {
            name: 'Padrão',
            colors: {
                primary_color: '#dc143c',
                secondary_color: '#c41230',
                accent_color: '#ff1744',
                background_color: '#ffffff',
                background_secondary: '#f5f5f5',
                background_dark: '#2c3e50',
                text_primary: '#333333',
                text_secondary: '#666666',
                text_light: '#999999',
                text_white: '#ffffff',
                button_primary_bg: '#dc143c',
                button_primary_text: '#ffffff',
                button_secondary_bg: '#6c757d',
                button_secondary_text: '#ffffff',
                border_color: '#e0e0e0',
                border_light: '#f0f0f0',
                border_dark: '#cccccc',
                success_color: '#28a745',
                warning_color: '#ffc107',
                error_color: '#dc3545',
                info_color: '#17a2b8'
            }
        },
        dark: {
            name: 'Escuro',
            colors: {
                primary_color: '#ff4757',           // Rosa vibrante para botões e destaques
                secondary_color: '#ee5a6f',         // Rosa mais suave para hover
                accent_color: '#ff6b81',            // Rosa claro para acentos
                background_color: '#1a1d2e',        // Azul escuro profundo para cards e modais
                background_secondary: '#151824',    // Azul escuro mais escuro para sidebar e áreas secundárias
                background_dark: '#0f111a',         // Quase preto para botões de tamanho e elementos escuros
                text_primary: '#f0f0f0',            // Branco suave para títulos (melhor contraste)
                text_secondary: '#b8bcc8',          // Cinza claro para textos secundários
                text_light: '#8a8f9e',              // Cinza médio para textos leves
                text_white: '#ffffff',              // Branco puro para textos em botões
                button_primary_bg: '#ff4757',       // Rosa para botões primários
                button_primary_text: '#ffffff',     // Branco para texto em botões primários
                button_secondary_bg: '#0f111a',     // Quase preto para botões secundários
                button_secondary_text: '#f0f0f0',   // Branco suave para texto em botões secundários
                border_color: '#2a2f3f',            // Cinza azulado para bordas
                border_light: '#353a4a',            // Cinza azulado claro para bordas leves
                border_dark: '#1f2330',             // Cinza azulado escuro para bordas escuras
                success_color: '#2ed573',           // Verde para sucesso
                warning_color: '#ffa502',           // Laranja para avisos
                error_color: '#ff4757',             // Rosa para erros
                info_color: '#5f9fff'               // Azul claro para informações
            }
        },
        light: {
            name: 'Claro',
            colors: {
                primary_color: '#3498db',
                secondary_color: '#2980b9',
                accent_color: '#5dade2',
                background_color: '#ffffff',
                background_secondary: '#f8f9fa',
                background_dark: '#e9ecef',
                text_primary: '#2c3e50',
                text_secondary: '#7f8c8d',
                text_light: '#95a5a6',
                text_white: '#ffffff',
                button_primary_bg: '#3498db',
                button_primary_text: '#ffffff',
                button_secondary_bg: '#95a5a6',
                button_secondary_text: '#ffffff',
                border_color: '#dee2e6',
                border_light: '#e9ecef',
                border_dark: '#ced4da',
                success_color: '#27ae60',
                warning_color: '#f39c12',
                error_color: '#e74c3c',
                info_color: '#3498db'
            }
        }
    };

    useEffect(() => {
        loadCustomThemes();
        loadDeveloperSettings();
        loadUserRole();
    }, []);

    const loadUserRole = () => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            setUserRole(user.role || '');
        }
    };

    const loadDeveloperSettings = async () => {
        try {
            const response = await axios.get(`${API_URL}/developer-settings`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            
            const settings = response.data.settings || {};
            setAllowThemeEditing(settings.allow_theme_editing?.value || false);
        } catch (error) {
            console.error('Erro ao carregar configurações do developer:', error);
            // Em caso de erro, não permitir edição de temas padrão
            setAllowThemeEditing(false);
        }
    };

    const loadCustomThemes = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            // Carregar temas personalizados
            const themesResponse = await axios.get(`${API_URL}/appearance/custom-themes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const themes = themesResponse.data.themes || {};
            setCustomThemes({
                custom1: themes.custom1 || { ...predefinedThemes.default.colors },
                custom2: themes.custom2 || { ...predefinedThemes.default.colors }
            });

            // Carregar tema ativo
            const activeThemeResponse = await axios.get(`${API_URL}/appearance/active-theme`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const active = activeThemeResponse.data.theme || 'default';
            setActiveTheme(active);
            loadThemeColors(active, themes);
        } catch (error) {
            console.error('Erro ao carregar temas:', error);
            // Usar padrão em caso de erro
            setCustomThemes({
                custom1: { ...predefinedThemes.default.colors },
                custom2: { ...predefinedThemes.default.colors }
            });
            setActiveTheme('default');
            setCurrentColors(predefinedThemes.default.colors);
        } finally {
            setLoading(false);
        }
    };

    const loadThemeColors = (theme, themes = null) => {
        if (predefinedThemes[theme]) {
            setCurrentColors(predefinedThemes[theme].colors);
        } else if (theme === 'custom1' || theme === 'custom2') {
            const customThemesData = themes || customThemes;
            setCurrentColors(customThemesData[theme]);
        }
    };

    const handleThemeSelect = (theme) => {
        setActiveTheme(theme);
        loadThemeColors(theme);
    };

    const handleColorChange = (key, value) => {
        // Verificar se pode editar
        const isPredefinedTheme = predefinedThemes[activeTheme];
        const isDeveloper = userRole === 'developer';
        
        // Só permite editar temas personalizados OU temas padrão se for developer com permissão
        if (isPredefinedTheme && !(isDeveloper && allowThemeEditing)) {
            alert('Selecione um tema personalizado para editar as cores');
            return;
        }

        setCurrentColors(prev => ({
            ...prev,
            [key]: value
        }));

        // Se for tema personalizado, atualizar também o tema personalizado
        if (activeTheme === 'custom1' || activeTheme === 'custom2') {
            setCustomThemes(prev => ({
                ...prev,
                [activeTheme]: {
                    ...prev[activeTheme],
                    [key]: value
                }
            }));
        }
    };

    const handleSaveCustomTheme = async () => {
        const isPredefinedTheme = predefinedThemes[activeTheme];
        const isDeveloper = userRole === 'developer';

        // Se for tema pré-definido, só developer com permissão pode salvar
        if (isPredefinedTheme) {
            if (!isDeveloper || !allowThemeEditing) {
                alert('Apenas developers com permissão podem editar temas padrão');
                return;
            }

            if (!window.confirm(`Salvar alterações no tema ${getThemeName(activeTheme)}? Isso irá sobrescrever o tema padrão.`)) {
                return;
            }
        } else if (activeTheme !== 'custom1' && activeTheme !== 'custom2') {
            alert('Selecione um tema para salvar');
            return;
        } else {
            if (!window.confirm(`Salvar alterações no ${activeTheme === 'custom1' ? 'Tema Personalizado 1' : 'Tema Personalizado 2'}?`)) {
                return;
            }
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            // Se for tema pré-definido, salvar como tema personalizado com nome especial
            if (isPredefinedTheme) {
                await axios.post(`${API_URL}/appearance/save-custom-theme`,
                    { 
                        themeName: `predefined_${activeTheme}`,
                        colors: currentColors
                    },
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
            } else {
                await axios.post(`${API_URL}/appearance/save-custom-theme`,
                    { 
                        themeName: activeTheme,
                        colors: currentColors
                    },
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
            }

            alert('Tema salvo com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar tema:', error);
            alert('Erro ao salvar tema');
        } finally {
            setLoading(false);
        }
    };

    const handleApplyTheme = async () => {
        if (!window.confirm(`Aplicar ${getThemeName(activeTheme)} no site?`)) {
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            await axios.post(`${API_URL}/appearance/apply-active-theme`,
                { theme: activeTheme },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            alert('Tema aplicado com sucesso!');
            await refreshTheme();
        } catch (error) {
            console.error('Erro ao aplicar tema:', error);
            alert('Erro ao aplicar tema');
        } finally {
            setLoading(false);
        }
    };

    const handleResetCustomTheme = async () => {
        const isPredefinedTheme = predefinedThemes[activeTheme];
        
        if (isPredefinedTheme) {
            alert('Não é possível resetar temas pré-definidos');
            return;
        }

        if (activeTheme !== 'custom1' && activeTheme !== 'custom2') {
            alert('Selecione um tema personalizado para resetar');
            return;
        }

        if (!window.confirm(`Resetar ${activeTheme === 'custom1' ? 'Tema Personalizado 1' : 'Tema Personalizado 2'} para o padrão?`)) {
            return;
        }

        const defaultColors = predefinedThemes.default.colors;
        setCurrentColors(defaultColors);
        setCustomThemes(prev => ({
            ...prev,
            [activeTheme]: defaultColors
        }));
    };

    const getThemeName = (theme) => {
        if (predefinedThemes[theme]) return predefinedThemes[theme].name;
        if (theme === 'custom1') return 'Tema Personalizado 1';
        if (theme === 'custom2') return 'Tema Personalizado 2';
        return theme;
    };

    const isCustomTheme = activeTheme === 'custom1' || activeTheme === 'custom2';
    const isPredefinedTheme = predefinedThemes[activeTheme];
    const isDeveloper = userRole === 'developer';
    const canEditTheme = isCustomTheme || (isPredefinedTheme && isDeveloper && allowThemeEditing);

    const colorGroups = [
        {
            title: 'Cores Principais',
            colors: [
                { key: 'primary_color', label: 'Cor Primária' },
                { key: 'secondary_color', label: 'Cor Secundária' },
                { key: 'accent_color', label: 'Cor de Destaque' }
            ]
        },
        {
            title: 'Cores de Fundo',
            colors: [
                { key: 'background_color', label: 'Fundo Principal' },
                { key: 'background_secondary', label: 'Fundo Secundário' },
                { key: 'background_dark', label: 'Fundo Escuro' }
            ]
        },
        {
            title: 'Cores de Texto',
            colors: [
                { key: 'text_primary', label: 'Texto Principal' },
                { key: 'text_secondary', label: 'Texto Secundário' },
                { key: 'text_light', label: 'Texto Claro' },
                { key: 'text_white', label: 'Texto Branco' }
            ]
        },
        {
            title: 'Cores de Botões',
            colors: [
                { key: 'button_primary_bg', label: 'Fundo Botão Primário' },
                { key: 'button_primary_text', label: 'Texto Botão Primário' },
                { key: 'button_secondary_bg', label: 'Fundo Botão Secundário' },
                { key: 'button_secondary_text', label: 'Texto Botão Secundário' }
            ]
        },
        {
            title: 'Cores de Bordas',
            colors: [
                { key: 'border_color', label: 'Borda Padrão' },
                { key: 'border_light', label: 'Borda Clara' },
                { key: 'border_dark', label: 'Borda Escura' }
            ]
        },
        {
            title: 'Cores de Status',
            colors: [
                { key: 'success_color', label: 'Sucesso' },
                { key: 'warning_color', label: 'Aviso' },
                { key: 'error_color', label: 'Erro' },
                { key: 'info_color', label: 'Informação' }
            ]
        }
    ];

    if (loading && Object.keys(currentColors).length === 0) {
        return (
            <div className="appearance-loading">
                <div className="spinner"></div>
                <p>Carregando configurações...</p>
            </div>
        );
    }

    return (
        <div className="appearance-editor">
            {/* Header */}
            <div className="appearance-header">
                <div className="header-title">
                    <FaPalette />
                    <h2>Editor de Aparência</h2>
                </div>
                <p className="header-subtitle">
                    Escolha um tema ou personalize as cores do site
                </p>
            </div>

            {/* Actions */}
            <div className="appearance-actions">
                <button 
                    className="btn-preview" 
                    onClick={() => setShowPreview(!showPreview)}
                >
                    <FaEye /> {showPreview ? 'Ocultar' : 'Mostrar'} Preview
                </button>

                <div className="actions-right">
                    {canEditTheme && (
                        <>
                            {isCustomTheme && (
                                <button 
                                    className="btn-reset" 
                                    onClick={handleResetCustomTheme}
                                    disabled={loading}
                                >
                                    <FaUndo /> Resetar
                                </button>
                            )}
                            <button 
                                className="btn-save" 
                                onClick={handleSaveCustomTheme}
                                disabled={loading}
                            >
                                <FaSave /> Salvar Tema
                            </button>
                        </>
                    )}
                    <button 
                        className="btn-apply" 
                        onClick={handleApplyTheme}
                        disabled={loading}
                    >
                        <FaEdit /> Aplicar no Site
                    </button>
                </div>
            </div>

            {/* Themes */}
            <div className="themes-section">
                <h3>Selecione um Tema</h3>
                <div className="themes-grid">
                    {/* Temas Pré-definidos */}
                    {Object.keys(predefinedThemes).map(themeKey => (
                        <button
                            key={themeKey}
                            className={`theme-card ${activeTheme === themeKey ? 'active' : ''}`}
                            onClick={() => handleThemeSelect(themeKey)}
                            disabled={loading}
                        >
                            <div className="theme-preview">
                                <div className="theme-colors">
                                    <span style={{ background: predefinedThemes[themeKey].colors.primary_color }}></span>
                                    <span style={{ background: predefinedThemes[themeKey].colors.background_color }}></span>
                                    <span style={{ background: predefinedThemes[themeKey].colors.text_primary }}></span>
                                </div>
                            </div>
                            <span className="theme-name">{predefinedThemes[themeKey].name}</span>
                            <span className="theme-badge">
                                {isDeveloper && allowThemeEditing ? 'Editável (Dev)' : 'Pré-definido'}
                            </span>
                        </button>
                    ))}

                    {/* Temas Personalizados */}
                    {['custom1', 'custom2'].map(themeKey => (
                        <button
                            key={themeKey}
                            className={`theme-card custom ${activeTheme === themeKey ? 'active' : ''}`}
                            onClick={() => handleThemeSelect(themeKey)}
                            disabled={loading}
                        >
                            <div className="theme-preview">
                                <div className="theme-colors">
                                    <span style={{ background: customThemes[themeKey]?.primary_color || '#dc143c' }}></span>
                                    <span style={{ background: customThemes[themeKey]?.background_color || '#ffffff' }}></span>
                                    <span style={{ background: customThemes[themeKey]?.text_primary || '#333333' }}></span>
                                </div>
                            </div>
                            <span className="theme-name">
                                {themeKey === 'custom1' ? 'Personalizado 1' : 'Personalizado 2'}
                            </span>
                            <span className="theme-badge custom">Editável</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Info sobre tema selecionado */}
            <div className="theme-info">
                {!canEditTheme && isPredefinedTheme && (
                    <div className="info-box warning">
                        <strong>ℹ️ Tema Pré-definido</strong>
                        <p>Este tema não pode ser editado. Selecione um "Tema Personalizado" para editar as cores.</p>
                    </div>
                )}
                {canEditTheme && isPredefinedTheme && (
                    <div className="info-box success">
                        <strong>⚠️ Modo Developer</strong>
                        <p>Você está editando um tema pré-definido. As alterações serão salvas e aplicadas ao tema padrão.</p>
                    </div>
                )}
                {isCustomTheme && (
                    <div className="info-box success">
                        <strong>✏️ Tema Editável</strong>
                        <p>Você pode editar as cores abaixo e salvar suas alterações.</p>
                    </div>
                )}
            </div>

            {/* Color Editor */}
            <div className="color-editor">
                <h3>Cores do Tema: {getThemeName(activeTheme)}</h3>
                
                {colorGroups.map(group => (
                    <div key={group.title} className="color-group">
                        <h4>{group.title}</h4>
                        <div className="color-inputs">
                            {group.colors.map(color => (
                                <div key={color.key} className="color-input-wrapper">
                                    <label>{color.label}</label>
                                    <div className="color-input-group">
                                        <input
                                            type="color"
                                            value={currentColors[color.key] || '#000000'}
                                            onChange={(e) => handleColorChange(color.key, e.target.value)}
                                            className="color-picker"
                                            disabled={!canEditTheme}
                                        />
                                        <input
                                            type="text"
                                            value={currentColors[color.key] || '#000000'}
                                            onChange={(e) => handleColorChange(color.key, e.target.value)}
                                            className="color-text"
                                            placeholder="#000000"
                                            disabled={!canEditTheme}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <div className="preview-modal">
                    <div className="preview-content" style={{
                        '--primary-color': currentColors.primary_color,
                        '--secondary-color': currentColors.secondary_color,
                        '--background-color': currentColors.background_color,
                        '--text-primary': currentColors.text_primary,
                        '--button-primary-bg': currentColors.button_primary_bg,
                        '--button-primary-text': currentColors.button_primary_text,
                        '--border-color': currentColors.border_color
                    }}>
                        <div className="preview-header">
                            <h3>Preview das Cores</h3>
                            <button onClick={() => setShowPreview(false)}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="preview-body">
                            <div className="preview-section">
                                <h4>Botões</h4>
                                <button className="preview-btn-primary">Botão Primário</button>
                                <button className="preview-btn-secondary">Botão Secundário</button>
                            </div>

                            <div className="preview-section">
                                <h4>Textos</h4>
                                <p className="preview-text-primary">Texto Principal</p>
                                <p className="preview-text-secondary">Texto Secundário</p>
                            </div>

                            <div className="preview-section">
                                <h4>Cards</h4>
                                <div className="preview-card">
                                    <h5>Card de Exemplo</h5>
                                    <p>Este é um exemplo de como os cards ficarão com as cores selecionadas.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppearanceEditor;
