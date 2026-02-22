import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

/**
 * Componente base reutilizável para modais
 * Fornece estrutura comum: overlay, container, botão fechar, título
 * 
 * @param {boolean} isOpen - Controla visibilidade do modal
 * @param {function} onClose - Callback ao fechar modal
 * @param {string} title - Título do modal
 * @param {React.ReactNode} children - Conteúdo do modal
 * @param {string} className - Classes CSS adicionais
 * @param {boolean} closeOnOverlay - Fecha ao clicar no overlay (padrão: true)
 * @param {boolean} showCloseButton - Mostra botão X (padrão: true)
 * @param {string} size - Tamanho do modal: 'small', 'medium', 'large' (padrão: 'medium')
 */
function BaseModal({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    className = '', 
    closeOnOverlay = true,
    showCloseButton = true,
    size = 'medium'
}) {
    // Fechar modal com tecla ESC
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            // Prevenir scroll do body quando modal está aberto
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleOverlayClick = () => {
        if (closeOnOverlay) {
            onClose();
        }
    };

    const sizeClass = `modal-${size}`;

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div 
                className={`modal-content ${sizeClass} ${className}`} 
                onClick={(e) => e.stopPropagation()}
            >
                {showCloseButton && (
                    <button 
                        className="modal-close" 
                        onClick={onClose}
                        aria-label="Fechar modal"
                    >
                        <FaTimes />
                    </button>
                )}
                
                {title && <h2 className="modal-title">{title}</h2>}
                
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default BaseModal;
