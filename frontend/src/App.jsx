import React from 'react';

// Nota: A importação do SCSS foi movida para o main.jsx para evitar redundância.

function App() {
  return (
    <div className="App">
      {/* HEADER: Fixado no topo e centralizado via SCSS */}
      <header className="header">
        <h1>Melanski Sports</h1>
      </header>

      {/* BANNER: Faixa vermelha de destaque */}
      <section className="promo-banner">
        🔥 QUEIMA DE ESTOQUE: CAMISAS SELEÇÃO 10% OFF 🔥
      </section>

      {/* NAVEGAÇÃO: Barra de filtros e busca */}
      <nav className="filter-bar">
        <input type="text" placeholder="Pesquise seu time ou produto..." />
        
        <div className="filters-group">
          {/* Futuramente, estes selects serão populados via API */}
          <select><option>Ordenar por</option></select>
          <select><option>Time</option></select>
          <select><option>Tamanho</option></select>
        </div>
      </nav>

      {/* GRID: 12 produtos simulados para testar o layout responsivo */}
      <main className="product-grid">
        {Array.from({ length: 12 }).map((_, index) => (
          <article key={index} className="product-card">
            <div className="product-img">Foto do Produto</div>
            <h3>Camisa Oficial 2026</h3>
            <p>R$ 299,90</p>
          </article>
        ))}
      </main>

      {/* NEWSLETTER: Container de captura de leads */}
      <section className="newsletter">
        <h2>Fique por dentro das ofertas!</h2>
        <p>Cadastre-se e receba promoções exclusivas.</p>
        <form onSubmit={(e) => e.preventDefault()}> {/* PreventDefault evita que a página recarregue ao testar o botão */}
          <input type="text" placeholder="Nome Completo" required />
          <input type="email" placeholder="Seu melhor e-mail" required />
          <input type="tel" placeholder="WhatsApp (DDD)" required />
          <button type="submit">CADASTRAR</button>
        </form>
      </section>

      {/* FOOTER: Informações legais e copyright */}
      <footer className="footer">
        <p>© 2026 Melanski Sports - Todos os direitos reservados.</p>
        <p>CNPJ: 00.000.000/0001-00 | Rua do Esporte, 123 - Curitiba/PR</p>
      </footer>
    </div>
  );
}

export default App;