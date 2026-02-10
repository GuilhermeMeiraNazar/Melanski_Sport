import React, { useState } from 'react';
import { FaFilter } from 'react-icons/fa';
import Header from './components/Header';
import SidebarFilters from './components/SidebarFilters';
import ProductCard from './components/ProductCard';
import Pagination from './components/Pagination';
import Modal from './components/Modal';
// import './App.scss'; // Se estiver usando create-react-app padrão

function App() {
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const itemsPerPage = 12;

    const allProducts = Array.from({ length: 204 }).map((_, index) => {
        const price = (Math.random() * (350 - 150) + 150);
        const oldPrice = price * 1.2; // Simula preço original mais caro
        
        return {
            id: index + 1,
            name: `Camisa Oficial Edição ${index + 1} - Temporada 2024/25`, // Nome mais longo estilo e-commerce
            price: price.toFixed(2),
            oldPrice: oldPrice.toFixed(2),
            type: index % 2 === 0 ? 'Nacional' : 'Internacional',
            isOffer: index % 5 === 0,
            rating: (Math.random() * (5 - 3.5) + 3.5).toFixed(1), // Avaliação 3.5 a 5.0
            reviews: Math.floor(Math.random() * 500),
            description: 'Produto oficial com tecnologia de respiração Dri-Fit. Ideal para torcedores e prática de esportes. Garantia de fábrica e selo de autenticidade incluso.',
            sizes: ['P', 'M', 'G', 'GG', 'XG'],
            colors: ['Vermelho', 'Preto', 'Branco'],
            images: [
                `https://placehold.co/600x600/f5f5f5/333?text=Frente-${index + 1}`,
                `https://placehold.co/600x600/f5f5f5/333?text=Costas-${index + 1}`,
                `https://placehold.co/600x600/f5f5f5/333?text=Detalhe-${index + 1}`,
                `https://placehold.co/600x600/f5f5f5/333?text=Uso-${index + 1}`
            ]
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