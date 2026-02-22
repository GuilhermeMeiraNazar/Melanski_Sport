/**
 * Utilitário para limpar cache do localStorage
 * Use no console do navegador: clearCache()
 */
export const clearCache = () => {
    try {
        const keys = Object.keys(localStorage);
        let count = 0;
        
        keys.forEach(key => {
            if (key.startsWith('cache_')) {
                localStorage.removeItem(key);
                count++;
            }
        });
        
        console.log(`✅ ${count} caches removidos do localStorage`);
        console.log('🔄 Recarregue a página para buscar dados atualizados');
        
        return count;
    } catch (error) {
        console.error('❌ Erro ao limpar cache:', error);
        return 0;
    }
};

// Disponibilizar globalmente para debug
if (typeof window !== 'undefined') {
    window.clearCache = clearCache;
}

export default clearCache;
