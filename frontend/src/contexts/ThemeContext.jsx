import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            const response = await axios.get(`${API_URL}/appearance/settings`);
            const settings = response.data.settings;

            // Converter para objeto simples
            const themeObj = {};
            Object.keys(settings).forEach(key => {
                themeObj[key] = settings[key].value;
            });

            setTheme(themeObj);
            applyTheme(themeObj);
        } catch (error) {
            console.error('Erro ao carregar tema:', error);
            // Usar tema padrão em caso de erro
            const defaultTheme = {
                primary_color: '#dc143c',
                secondary_color: '#c41230',
                background_color: '#ffffff',
                text_primary: '#333333'
            };
            setTheme(defaultTheme);
            applyTheme(defaultTheme);
        } finally {
            setLoading(false);
        }
    };

    const applyTheme = (themeSettings) => {
        const root = document.documentElement;

        // Aplicar TODAS as cores
        Object.keys(themeSettings).forEach(key => {
            // Converter snake_case para kebab-case para CSS Variables
            const cssVarName = `--${key.replace(/_/g, '-')}`;
            root.style.setProperty(cssVarName, themeSettings[key]);
            
            // Criar versão RGB para cores (para sombras e transparências)
            if (key.includes('color') && themeSettings[key].startsWith('#')) {
                const hex = themeSettings[key];
                const rgb = hexToRgb(hex);
                if (rgb) {
                    root.style.setProperty(`${cssVarName}-rgb`, `${rgb.r}, ${rgb.g}, ${rgb.b}`);
                }
            }
        });

        console.log('🎨 Tema aplicado:', themeSettings);
        console.log('🎨 CSS Variables definidas:', Object.keys(themeSettings).length);
    };

    // Converter HEX para RGB
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    const refreshTheme = async () => {
        await loadTheme();
    };

    return (
        <ThemeContext.Provider value={{ theme, loading, refreshTheme, applyTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
