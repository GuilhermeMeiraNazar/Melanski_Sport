import React, { useState } from 'react'; // Importante ter o useState
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Cart from './components/Cart';
import Home from './pages/client/Home';
import Admin from './pages/admin/Admin';

function App() {
    const [cartOpen, setCartOpen] = useState(false);

    return (
        <Router basename="/Melanski_Sport">
            <Routes>
                <Route path="/" element={
                    <>
                        {/* Agora passamos a função que muda o estado para TRUE */}
                        <Header onOpenCart={() => setCartOpen(true)} /> 
                        
                        <Home />

                        {/* Adicionamos o Componente Cart aqui e passamos o estado e a função de fechar */}
                        <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} />
                    </>
                } />

                <Route path="/admin" element={<Admin />} />
            </Routes>
        </Router>
    );
}

export default App;