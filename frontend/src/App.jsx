import React, { useState } from 'react';
import { FaFilter } from 'react-icons/fa';

import Header from './components/Header';
import SidebarFilters from './components/SidebarFilters';
import ProductCard from './components/ProductCard';
import Pagination from './components/Pagination';
import Modal from './components/Modal';

function App() {
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const itemsPerPage = 12;

    const allProducts = Array.from({ length: 204 }).map((_, index) => ({
        id: index + 1,
        name: `Camisa Oficial Item ${index + 1}`,
        price: (Math.random() * (350 - 150) + 150).toFixed(2),
        type: index % 2 === 0 ? 'Nacional' : 'Internacional',
        isOffer: index % 5 === 0
    }));

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = allProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(allProducts.length / itemsPerPage);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleProductClick = (product) => {
        setSelectedProduct(product);
    };

    const closeModal = () => {
        setSelectedProduct(null);
    };

    return (
        <div className="App">
            <Header />

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
            </div>

            {selectedProduct && (
                <Modal selectedProduct={selectedProduct} closeModal={closeModal} />
            )}
        </div>
    );
}

export default App;