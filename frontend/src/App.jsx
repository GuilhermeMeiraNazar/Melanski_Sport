import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './assets/main.scss';
import Header from './components/Header';
import Cart from './components/Cart';
import Footer from './components/Footer';
import { CacheProvider } from './contexts/CacheContext';
import './utils/clearCache'; // Disponibiliza window.clearCache() para debug

// Lazy loading de páginas
const Home = lazy(() => import('./pages/client/Home'));
const Admin = lazy(() => import('./pages/admin/Admin'));

// Componente de loading
const PageLoader = () => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '1.2rem',
        color: '#666'
    }}>
        Carregando...
    </div>
);

function App() {
    const [cartOpen, setCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState([]); 

    // Adicionar item (Melhorado com ID único mais seguro)
    const addToCart = (product, size) => {
        const newItem = {
            id: Date.now() + Math.random(), // Evita bugs de ID duplicado em cliques rápidos
            ...product,
            selectedSize: size,
            quantity: 1
        };
        setCartItems([...cartItems, newItem]);
    };

    // Remover item
    const removeFromCart = (itemId) => {
        const updatedList = cartItems.filter(item => item.id !== itemId);
        setCartItems(updatedList);
    };

    return (
        <CacheProvider>
            <Router basename="/Melanski_Sport">
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        <Route path="/" element={
                            <>
                                <Header 
                                    onOpenCart={() => setCartOpen(true)} 
                                    cartCount={cartItems.length} 
                                /> 
                                
                                <Home addToCart={addToCart} />

                                <Footer />

                                {/* AQUI ESTAVA O SEGREDO: Passando a função removeItem */}
                                <Cart 
                                    isOpen={cartOpen} 
                                    onClose={() => setCartOpen(false)} 
                                    cartItems={cartItems}
                                    removeItem={removeFromCart} 
                                />
                            </>
                        } />
                        <Route path="/admin" element={<Admin />} />
                    </Routes>
                </Suspense>
            </Router>
        </CacheProvider>
    );
}

export default App;