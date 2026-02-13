// src/pages/Home.js
import React, { useState } from 'react';
import { FaFilter } from 'react-icons/fa';
import SidebarFilters from '../../components/SidebarFilters';
import ProductCard from '../../components/ProductCard';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';

function Home({ onOpenCart, addToCart }) { // Adicionada a prop addToCart que vem do App.js
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // --- LÓGICA DE PRODUTOS ---
    const itemsPerPage = 12;
    const allProducts = Array.from({ length: 204 }).map((_, index) => {
        const price = (Math.random() * (350 - 150) + 150);
        return {
            id: index + 1,
            name: `Camisa Oficial Edição ${index + 1} - Temporada 2024/25`,
            price: price.toFixed(2),
            oldPrice: (price * 1.2).toFixed(2),
            type: index % 2 === 0 ? 'Nacional' : 'Internacional',
            isOffer: index % 5 === 0,
            rating: (Math.random() * (5 - 3.5) + 3.5).toFixed(1),
            reviews: Math.floor(Math.random() * 500),
            description: 'Produto oficial com tecnologia de respiração Dri-Fit.',
            sizes: ['P', 'M', 'G', 'GG', 'XG'],
            colors: ['Vermelho', 'Preto', 'Branco'],
            images: [`https://placehold.co/600x600/f5f5f5/333?text=Frente-${index + 1}`]
        };
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = allProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(allProducts.length / itemsPerPage);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleProductClick = (product) => setSelectedProduct(product);
    const closeModal = () => setSelectedProduct(null);

    return (
        <div className="main-container">
            <button className="mobile-filter-btn" onClick={() => setMobileFilterOpen(true)}>
                <FaFilter /> Filtros
            </button>
            
            <SidebarFilters 
                mobileFilterOpen={mobileFilterOpen} 
                setMobileFilterOpen={setMobileFilterOpen} 
            />
            
            <main className="content-area">
                <div className="product-grid">
                    {currentItems.map((product) => (
                        <ProductCard 
                            key={product.id} 
                            product={product} 
                            handleProductClick={handleProductClick} 
                        />
                    ))}
                </div>
                <Pagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    paginate={paginate} 
                />
            </main>

            {/* Modal agora recebe a prop addToCart para poder enviar o item ao carrinho */}
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