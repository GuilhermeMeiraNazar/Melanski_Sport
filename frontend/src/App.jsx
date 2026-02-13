import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './assets/main.scss';
import Header from './components/Header';
import Cart from './components/Cart';
import Home from './pages/client/Home';
import Admin from './pages/admin/Admin';

function App() {
    const [cartOpen, setCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState([]); // 1. Estado para guardar os itens

    // 2. Função para adicionar item (será passada para a Home -> Modal)
    const addToCart = (product, size) => {
        const newItem = {
            id: Date.now(), // ID único
            ...product,
            selectedSize: size,
            quantity: 1
        };
        setCartItems([...cartItems, newItem]);
    };

    // 3. Função para remover item (será passada para o Cart)
    const removeFromCart = (itemId) => {
        const updatedList = cartItems.filter(item => item.id !== itemId);
        setCartItems(updatedList);
    };

    return (
        <Router basename="/Melanski_Sport">
            <Routes>
                <Route path="/" element={
                    <>
                        {/* Header recebe a quantidade real de itens */}
                        <Header 
                            onOpenCart={() => setCartOpen(true)} 
                            cartCount={cartItems.length} 
                        /> 
                        
                        {/* Home recebe a função de adicionar para passar ao Modal */}
                        <Home addToCart={addToCart} />

                        {/* Cart recebe a lista de itens, estado de abrir/fechar e função de remover */}
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