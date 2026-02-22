import React, { useState, useEffect } from 'react';
import { FaFilter } from 'react-icons/fa';
import SidebarFilters from '../../components/SidebarFilters';
import ProductCard from '../../components/ProductCard';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import { storeSvc } from '../../services/api';
import { useCache } from '../../contexts/CacheContext';

function Home({ onOpenCart, addToCart }) {
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const { getCached, invalidatePattern } = useCache();

    // Estado dos filtros seguindo o padrão do seu backend
    const [filters, setFilters] = useState({
        page: 1,
        search: '',
        team: '',
        category: '',
        gender: '',
        origin: '',
        size: '',
        is_offer: '',
        is_launch: ''
    });

    // Dados de Paginação vindos do backend
    const [paginationData, setPaginationData] = useState({
        total: 0,
        totalPages: 1,
        currentPage: 1
    });

    // Efeito para carregar produtos sempre que os filtros mudarem
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // Criar chave de cache baseada nos filtros
                const cacheKey = `products_${JSON.stringify(filters)}`;
                
                // Usar cache com TTL de 2 minutos para produtos
                const data = await getCached(
                    cacheKey,
                    async () => {
                        const res = await storeSvc.list(filters);
                        return res.data; // Retornar apenas os dados
                    },
                    120000, // 2 minutos
                    false // Não usar localStorage para produtos (dados dinâmicos)
                );
                
                if (data) {
                    setProducts(data.data || []);
                    setPaginationData(data.pagination || { totalPages: 1 });
                }
            } catch (error) {
                console.error("Erro ao carregar produtos na Home:", error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [filters, getCached]);

    // Função de atualização de filtros vinda da Sidebar
    const handleFilterChange = (newFilters) => {
        // Invalidar cache de produtos ao mudar filtros
        invalidatePattern('products_');
        
        // Se for um reset (botão limpar), voltamos ao estado inicial
        if (Object.keys(newFilters).length === 1 && newFilters.page === 1) {
            setFilters({
                page: 1,
                search: '',
                team: '',
                category: '',
                gender: '',
                origin: '',
                size: '',
                is_offer: '',
                is_launch: ''
            });
        } else {
            // Caso contrário, mesclamos o que mudou
            setFilters(prev => ({ ...prev, ...newFilters }));
        }
    };

    const paginate = (pageNumber) => {
        setFilters(prev => ({ ...prev, page: pageNumber }));
    };

    const handleProductClick = (product) => setSelectedProduct(product);
    const closeModal = () => setSelectedProduct(null);

    return (
        <div className="main-container">
            {/* Mantido o seu layout de botão mobile */}
            <button className="mobile-filter-btn" onClick={() => setMobileFilterOpen(true)}>
                <FaFilter /> Filtros
            </button>
            
            <SidebarFilters 
                mobileFilterOpen={mobileFilterOpen} 
                setMobileFilterOpen={setMobileFilterOpen}
                currentFilters={filters}
                onFilterChange={handleFilterChange}
            />
            
            <main className="content-area">
                {loading ? (
                    /* Mantido o estilo de loading simples dentro da área de conteúdo */
                    <div style={{ textAlign: 'center', marginTop: '50px' }}>Carregando produtos...</div>
                ) : (
                    <>
                        <div className="product-grid">
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <ProductCard 
                                        key={product.id} 
                                        product={product} 
                                        handleProductClick={handleProductClick} 
                                    />
                                ))
                            ) : (
                                /* Layout de "nada encontrado" respeitando o grid */
                                <div style={{ width: '100%', textAlign: 'center', gridColumn: '1/-1', padding: '40px' }}>
                                    <h3>Nenhum produto encontrado.</h3>
                                    <p>Tente ajustar os filtros na barra lateral.</p>
                                </div>
                            )}
                        </div>

                        {/* Paginação original só aparece se houver produtos e mais de uma página */}
                        {products.length > 0 && paginationData.totalPages > 1 && (
                            <Pagination 
                                currentPage={filters.page} 
                                totalPages={paginationData.totalPages} 
                                paginate={paginate} 
                            />
                        )}
                    </>
                )}
            </main>

            {selectedProduct && (
                <Modal 
                    selectedProduct={selectedProduct} 
                    closeModal={closeModal} 
                    addToCart={addToCart} 
                />
            )}
        </div>
    );
}

export default Home;