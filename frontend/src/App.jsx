import React, { useState } from 'react';
/* Adicionei o FaWhatsapp para o botão do modal e mantive os outros */
import { FaFilter, FaArrowLeft, FaArrowRight, FaShoppingCart, FaHeart, FaSearch, FaUserAlt, FaWhatsapp } from 'react-icons/fa';

function App() {
  // --- LÓGICA ORIGINAL ---
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // --- NOVOS ESTADOS PARA O POP-UP (MODAL) ---
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  // Simulando Banco de Dados
  const bancoDeDados = {
    times: ["Flamengo", "Grêmio", "Palmeiras", "Corinthians", "São Paulo", "Vasco", "Cruzeiro"],
    tipos: ["Camisa", "Copo", "Bola", "Agasalho", "Boné"],
    tamanhos: ["P", "M", "G", "GG", "XG"],
    generos: ["Masculino", "Feminino", "Infantil"]
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

  // --- FUNÇÕES DO MODAL ---
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setActiveImgIndex(0); // Reseta a galeria
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="App">
      {/* --- HEADER --- */}
      <header className="header-container">
        <div className="top-bar">
          <p>🔥 FRETE GRÁTIS ACIMA DE R$ 299 🔥</p>
          <div className="top-links">
            <span><FaUserAlt /> Minha Conta</span>
          </div>
        </div>

        <nav className="main-header">
          <div className="header-content">
            <div className="logo">
              <h1>Melanski<span>Sports</span></h1>
            </div>
            <div className="header-icons">
              <div className="cart-icon">
                <FaShoppingCart />
                <span className="cart-count">0</span>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* --- ESTRUTURA PRINCIPAL --- */}
      <div className="main-container">
        {/* BOTÃO FLUTUANTE (Mobile) */}
        <button className="mobile-filter-btn" onClick={() => setMobileFilterOpen(true)}>
          <FaFilter /> Filtros
        </button>

        {/* SIDEBAR DE FILTROS */}
        <aside className={`sidebar-filters ${mobileFilterOpen ? 'open' : ''}`}>
          <div className="filter-header">
            <h3>Filtrar por</h3>
            <span className="close-mobile" onClick={() => setMobileFilterOpen(false)}>✕</span>
          </div>

          <div className="filter-group">
            <div className="search-box">
              <input type="text" placeholder="Buscar produto..." />
              <FaSearch />
            </div>
          </div>

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

          <div className="filter-group">
            <h4>Tipo do Produto</h4>
            {bancoDeDados.tipos.map(tipo => (
              <label key={tipo} className="checkbox-label">
                <input type="checkbox" name="tipo" /> {tipo}
              </label>
            ))}
          </div>

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

          <div className="filter-group">
            <h4>Gênero</h4>
            {bancoDeDados.generos.map(genero => (
              <label key={genero} className="checkbox-label">
                <input type="checkbox" name="genero" /> {genero}
              </label>
            ))}
          </div>

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

        {/* VITRINE */}
        <main className="content-area">
          <div className="product-grid">
            {currentItems.map((product) => (
              <article
                key={product.id}
                className="product-card"
                onClick={() => handleProductClick(product)}
              >
                {product.isOffer && <span className="badge-offer">OFERTA</span>}
                <div className="image-container">
                  <div className="product-img"></div>
                  <button className="wishlist-btn" onClick={(e) => e.stopPropagation()}><FaHeart /></button>
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

      {/* --- POP-UP / MODAL --- */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕</button>

            <div className="modal-body">
              {/* ESQUERDA: Texto */}
              <div className="modal-left-col">
                <div className="header-info">
                   <span className="modal-category">{selectedProduct.type}</span>
                   <h2>{selectedProduct.name}</h2>
                </div>
                
                {/* DIVISÃO PARA MOBILE (LADO A LADO) */}
                <div className="modal-split-mobile">
                    <div className="desc-container">
                        <p className="modal-desc">
                        Garanta já o seu! Produto oficial com qualidade premium, tecido respirável ideal.
                        Entrega rápida para todo o Brasil.
                        </p>
                    </div>

                    {/* Agrupamento Preço + Botões (Importante para o layout pedido) */}
                    <div className="price-action-group">
                        <div className="modal-price">R$ {selectedProduct.price.replace('.', ',')}</div>
                        <div className="modal-actions">
                        <button className="btn-whatsapp">
                            <FaWhatsapp /> <span>WhatsApp</span>
                        </button>
                        <button className="btn-add-cart">
                            <FaShoppingCart /> <span>Carrinho</span>
                        </button>
                        </div>
                    </div>
                </div>
              </div>

              {/* DIREITA: Galeria de Fotos */}
              <div className="modal-right-col">
                <div className="main-photo">
                  <span>Foto {activeImgIndex + 1}</span>
                </div>
                <div className="photo-thumbnails">
                  {[0, 1, 2].map((idx) => (
                    <div
                      key={idx}
                      className={`thumb ${activeImgIndex === idx ? 'active' : ''}`}
                      onClick={() => setActiveImgIndex(idx)}
                    >
                      {idx + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;