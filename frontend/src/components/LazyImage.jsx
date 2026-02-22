import React, { useState, useEffect, useRef } from 'react';

/**
 * Componente de imagem com lazy loading
 * Carrega imagem apenas quando entra no viewport
 * 
 * @param {string} src - URL da imagem
 * @param {string} alt - Texto alternativo
 * @param {string} placeholder - URL do placeholder (opcional)
 * @param {string} className - Classes CSS
 * @param {object} style - Estilos inline
 */
const LazyImage = ({ 
    src, 
    alt = '', 
    placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3ECarregando...%3C/text%3E%3C/svg%3E',
    className = '',
    style = {},
    ...props 
}) => {
    const [imageSrc, setImageSrc] = useState(placeholder);
    const [imageRef, setImageRef] = useState();
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        let observer;
        let didCancel = false;

        if (imageRef && imageSrc === placeholder) {
            if (IntersectionObserver) {
                observer = new IntersectionObserver(
                    entries => {
                        entries.forEach(entry => {
                            if (
                                !didCancel &&
                                (entry.intersectionRatio > 0 || entry.isIntersecting)
                            ) {
                                setIsInView(true);
                                setImageSrc(src);
                                observer.unobserve(imageRef);
                            }
                        });
                    },
                    {
                        threshold: 0.01,
                        rootMargin: '75px',
                    }
                );
                observer.observe(imageRef);
            } else {
                // Fallback para navegadores sem suporte
                setImageSrc(src);
            }
        }
        return () => {
            didCancel = true;
            if (observer && observer.unobserve) {
                observer.unobserve(imageRef);
            }
        };
    }, [src, imageSrc, imageRef, placeholder]);

    const handleLoad = () => {
        setIsLoaded(true);
    };

    return (
        <img
            ref={setImageRef}
            src={imageSrc}
            alt={alt}
            className={`${className} ${isLoaded ? 'loaded' : 'loading'}`}
            style={{
                ...style,
                opacity: isLoaded ? 1 : 0.6,
                transition: 'opacity 0.3s ease-in-out'
            }}
            onLoad={handleLoad}
            {...props}
        />
    );
};

export default LazyImage;
