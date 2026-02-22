import { useState } from 'react';

/**
 * Custom hook para gerenciar submissão de formulários
 * Centraliza lógica de loading, erro e sucesso
 * 
 * @param {Function} submitFn - Função assíncrona que realiza a submissão
 * @param {Object} options - Opções de configuração
 * @returns {Object} - Estado e funções do formulário
 */
export const useFormSubmit = (submitFn, options = {}) => {
    const {
        onSuccess,
        onError,
        resetOnSuccess = false
    } = options;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (data) => {
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const result = await submitFn(data);
            setSuccess(true);
            
            if (onSuccess) {
                onSuccess(result);
            }
            
            return result;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Erro ao processar requisição';
            setError(errorMessage);
            
            if (onError) {
                onError(err);
            }
            
            throw err;
        } finally {
            setLoading(false);
            
            if (resetOnSuccess && success) {
                setTimeout(() => {
                    setSuccess(false);
                    setError('');
                }, 3000);
            }
        }
    };

    const reset = () => {
        setLoading(false);
        setError('');
        setSuccess(false);
    };

    return {
        loading,
        error,
        success,
        handleSubmit,
        reset,
        setError
    };
};
