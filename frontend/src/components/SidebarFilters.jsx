import React from 'react';
import { FaSearch } from 'react-icons/fa';

function SidebarFilters({ mobileFilterOpen, setMobileFilterOpen }) {
    const bancoDeDados = {
        times: ["Flamengo", "Grêmio", "Palmeiras", "Corinthians", "São Paulo", "Vasco", "Cruzeiro"],
        tipos: ["Camisa", "Copo", "Bola", "Agasalho", "Boné"],
        tamanhos: ["P", "M", "G", "GG", "XG"],
        generos: ["Masculino", "Feminino", "Infantil"]
    };

    return (
        <aside className={`sidebar-filters ${mobileFilterOpen ? 'open' : ''}`}>
            <div className="filter-header">
                <h3>Filtrar por</h3>
                <span className="close-mobile" onClick={() => setMobileFilterOpen(false)}>✕</span>
            </div>

            {/* BUSCA */}
            <div className="filter-group">
                <div className="search-box">
                    <input type="text" placeholder="Buscar produto..." />
                    <FaSearch />
                </div>
            </div>

            {/* FILTRO: TIME */}
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

            {/* FILTRO: TIPO */}
            <div className="filter-group">
                <h4>Tipo do Produto</h4>
                {bancoDeDados.tipos.map(tipo => (
                    <label key={tipo} className="checkbox-label">
                        <input type="checkbox" name="tipo" /> {tipo}
                    </label>
                ))}
            </div>

            {/* FILTRO: TAMANHO */}
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

            {/* FILTRO: GÊNERO */}
            <div className="filter-group">
                <h4>Gênero</h4>
                {bancoDeDados.generos.map(genero => (
                    <label key={genero} className="checkbox-label">
                        <input type="checkbox" name="genero" /> {genero}
                    </label>
                ))}
            </div>

            {/* FILTRO: ORIGEM (Nacional/Importada) */}
            <div className="filter-group">
                <h4>Origem</h4>
                <label className="checkbox-label">
                    <input type="checkbox" name="origem" /> Nacional
                </label>
                <label className="checkbox-label">
                    <input type="checkbox" name="origem" /> Internacional
                </label>
            </div>

            {/* FILTRO: STATUS */}
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
    );
}

export default SidebarFilters;