import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './assets/main.scss';
import Header from './components/Header';
import Cart from './components/Cart';
import Home from './pages/client/Home';
import Admin from './pages/admin/Admin';

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
        <Router basename="/Melanski_Sport">
            <Routes>
                <Route path="/" element={
                    <>
                        <Header 
                            onOpenCart={() => setCartOpen(true)} 
                            cartCount={cartItems.length} 
                        /> 
                        
                        <Home addToCart={addToCart} />

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
        </Router>
    );
}

export default App;