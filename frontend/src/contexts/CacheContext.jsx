import { createContext, useContext, useState, useCallback } from 'react';

const CacheContext = createContext();

/**
 * Provider de cache client-side com TTL (Time To Live)
 * Armazena dados em memória e localStorage para persistência
 */
export const CacheProvider = ({ children }) => {
    const [memoryCache, setMemoryCache] = useState({});

    /**
     * Obtém dados do cache ou executa fetcher se não existir/expirado
     * @param {string} key - Chave única do cache
     * @param {Function} fetcher - Função assíncrona para buscar dados
     * @param {number} ttl - Tempo de vida em milissegundos (padrão: 5 minutos)
     * @param {boolean} useLocalStorage - Se deve persistir no localStorage
     */
    const getCached = useCallback(async (key, fetcher, ttl = 300000, useLocalStorage = true) => {
        const now = Date.now();

        // Verificar cache em memória primeiro
        if (memoryCache[key]) {
            const { data, expiry } = memoryCache[key];
            if (expiry > now) {
                return data;
            }
        }

        // Verificar localStorage se habilitado
        if (useLocalStorage) {
            try {
                const cached = localStorage.getItem(`cache_${key}`);
                if (cached) {
                    const { data, expiry } = JSON.parse(cached);
                    if (expiry > now) {
                        // Atualizar memoryCache
                        setMemoryCache(prev => ({
                            ...prev,
                            [key]: { data, expiry }
                        }));
                        return data;
                    }
                }
            } catch (error) {
                console.warn('Erro ao ler cache do localStorage:', error);
            }
        }

        // Cache expirado ou não existe, buscar dados
        try {
            const data = await fetcher();
            const expiry = now + ttl;
            const cacheEntry = { data, expiry };

            // Salvar em memória
            setMemoryCache(prev => ({
                ...prev,
                [key]: cacheEntry
            }));

            // Salvar em localStorage se habilitado
            if (useLocalStorage) {
                try {
                    localStorage.setItem(`cache_${key}`, JSON.stringify(cacheEntry));
                } catch (error) {
                    console.warn('Erro ao salvar cache no localStorage:', error);
                }
            }

            return data;
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            throw error;
        }
    }, [memoryCache]);

    /**
     * Invalida cache específico
     * @param {string} key - Chave do cache a invalidar
     */
    const invalidate = useCallback((key) => {
        // Remover de memória
        setMemoryCache(prev => {
            const newCache = { ...prev };
            delete newCache[key];
            return newCache;
        });

        // Remover de localStorage
        try {
            localStorage.removeItem(`cache_${key}`);
        } catch (error) {
            console.warn('Erro ao remover cache do localStorage:', error);
        }
    }, []);

    /**
     * Invalida múltiplos caches por padrão
     * @param {string} pattern - Padrão regex para invalidar
     */
    const invalidatePattern = useCallback((pattern) => {
        const regex = new RegExp(pattern);

        // Invalidar memoryCache
        setMemoryCache(prev => {
            const newCache = {};
            Object.keys(prev).forEach(key => {
                if (!regex.test(key)) {
                    newCache[key] = prev[key];
                }
            });
            return newCache;
        });

        // Invalidar localStorage
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('cache_') && regex.test(key.substring(6))) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.warn('Erro ao invalidar cache do localStorage:', error);
        }
    }, []);

    /**
     * Limpa todo o cache
     */
    const clearAll = useCallback(() => {
        setMemoryCache({});
        
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('cache_')) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.warn('Erro ao limpar cache do localStorage:', error);
        }
    }, []);

    const value = {
        getCached,
        invalidate,
        invalidatePattern,
        clearAll
    };

    return (
        <CacheContext.Provider value={value}>
            {children}
        </CacheContext.Provider>
    );
};

/**
 * Hook para usar o cache
 */
export const useCache = () => {
    const context = useContext(CacheContext);
    if (!context) {
        throw new Error('useCache deve ser usado dentro de CacheProvider');
    }
    return context;
};

export default CacheContext;
