import React, { useState } from 'react';
/* Adicionei os ícones que faltavam da V2 (User, BoxOpen) junto com os da V1 */
import { FaFilter, FaArrowLeft, FaArrowRight, FaShoppingCart, FaHeart, FaSearch, FaUserAlt, FaBoxOpen } from 'react-icons/fa';

function App() {
  // --- MANTEVE A LÓGICA PERFEITA DA VERSÃO 1 ---
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Simulando Banco de Dados
  const bancoDeDados = {
    times: ["Flamengo", "Grêmio", "Palmeiras", "Corinthians", "São Paulo", "Vasco", "Cruzeiro"],
    tipos: ["Camisa", "Copo", "Bola", "Agasalho", "Boné"],
    tamanhos: ["P", "M", "G", "GG", "XG"]
  };

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

  return (
    <div className="App">
      
      {/* --- AQUI ENTRA O HEADER BONITO DA VERSÃO 2 --- */}
      <header className="header-container">
        <div className="top-bar">
          <p>🔥 FRETE GRÁTIS ACIMA DE R$ 299 🔥</p>
          <div className="top-links">
            <span><FaUserAlt /> Minha Conta</span>
            <span><FaBoxOpen /> Pedidos</span>
          </div>
        </div>
        
        <nav className="main-header">
          <div className="header-content">
            <div className="logo">
              <h1>Melanski<span>Sports</span></h1>
            </div>
            
            <ul className="nav-menu">
              <li>Lançamentos</li>
              <li>Times</li>
              <li>Ofertas</li>
              <li>Acessórios</li>
            </ul>

            <div className="header-icons">
              <FaSearch className="icon search-trigger" />
              <div className="cart-icon">
                <FaShoppingCart />
                <span className="cart-count">0</span>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* --- DAQUI PARA BAIXO É A ESTRUTURA DA VERSÃO 1 (QUE FUNCIONA) --- */}
      <div className="main-container">
        
        {/* BOTÃO FLUTUANTE ESQUERDA (Mobile) */}
        <button className="mobile-filter-btn" onClick={() => setMobileFilterOpen(true)}>
          <FaFilter /> Filtros
        </button>

        {/* SIDEBAR DE FILTROS - Lógica V1 */}
        <aside className={`sidebar-filters ${mobileFilterOpen ? 'open' : ''}`}>
          <div className="filter-header">
            <h3>Filtrar por</h3>
            <span className="close-mobile" onClick={() => setMobileFilterOpen(false)}>✕</span>
          </div>

          {/* 1. PESQUISA */}
          <div className="filter-group">
            <div className="search-box">
              <input type="text" placeholder="Buscar produto..." />
              <FaSearch />
            </div>
          </div>

          {/* 2. TIME */}
          <div className="filter-group">
            <h4>Time</h4>
            <div className="filter-scroll">
              {bancoDeDados.times.map(time => (
                <label key={time} className="checkbox-label">
                  <input type="checkbox" name="time" /> {time}
                </label>
              ))}
            </div>
          </div>

          {/* 3. TIPO */}
          <div className="filter-group">
            <h4>Tipo do Produto</h4>
            {bancoDeDados.tipos.map(tipo => (
              <label key={tipo} className="checkbox-label">
                <input type="checkbox" name="tipo" /> {tipo}
              </label>
            ))}
          </div>

          {/* 4. TAMANHO */}
          <div className="filter-group">
            <h4>Tamanho</h4>
            <div className="size-grid">
              {bancoDeDados.tamanhos.map(tam => (
                <label key={tam} className="size-label">
                  <input type="checkbox" name="tamanho" />
                  <span>{tam}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 5. STATUS */}
          <div className="filter-group">
            <h4>Status</h4>
            <label className="checkbox-label offer-highlight">
              <input type="checkbox" /> Em Oferta
            </label>
            <label className="checkbox-label launch-highlight">
              <input type="checkbox" /> Lançamentos
            </label>
          </div>

          <button className="btn-clear-filters">Limpar Filtros</button>
        </aside>

        {/* VITRINE - Lógica V1 */}
        <main className="content-area">
          <div className="product-grid">
            {currentItems.map((product) => (
              <article key={product.id} className="product-card">
                {product.isOffer && <span className="badge-offer">OFERTA</span>}
                <div className="image-container">
                  <div className="product-img"></div>
                  <button className="wishlist-btn"><FaHeart /></button>
                </div>
                <div className="card-info">
                    <span className="category-tag">{product.type}</span>
                    <h3>{product.name}</h3>
                    <div className="price-row">
                      <p className="price">R$ {product.price.replace('.', ',')}</p>
                    </div>
                    <button className="btn-buy"><FaShoppingCart /> Comprar</button>
                </div>
              </article>
            ))}
          </div>

          {/* PAGINAÇÃO - Lógica V1 */}
          <div className="pagination">
            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="page-control">
              <FaArrowLeft />
            </button>
            <span className="page-info">Página <strong>{currentPage}</strong> de {totalPages}</span>
            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="page-control">
              <FaArrowRight />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;