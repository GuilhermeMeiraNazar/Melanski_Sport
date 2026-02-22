import React, { useState, useEffect } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { storeSvc } from '../services/api';

function SidebarFilters({ mobileFilterOpen, setMobileFilterOpen, currentFilters = {}, onFilterChange }) {
    const [options, setOptions] = useState({
        times: ["Flamengo", "Grêmio", "Palmeiras", "Corinthians", "São Paulo", "Vasco", "Cruzeiro"],
        tipos: ["Camisa", "Copo", "Bola", "Agasalho", "Boné"],
        tamanhos: ["P", "M", "G", "GG", "XG"],
        generos: ["Masculino", "Feminino", "Infantil"]
    });

    const [localSearch, setLocalSearch] = useState(currentFilters.search || '');

    useEffect(() => {
        async function loadFilters() {
            try {
                const res = await storeSvc.getFilters();
                if (res.data) {
                    setOptions({
                        times: res.data.times || options.times,
                        tipos: res.data.tipos || options.tipos,
                        tamanhos: res.data.tamanhos || options.tamanhos,
                        generos: res.data.generos || options.generos
                    });
                }
            } catch (error) {
                console.error("Erro ao carregar filtros dinâmicos:", error);
            }
        }
        loadFilters();
    }, []);

    const handleToggle = (key, value) => {
        const newValue = currentFilters[key] === value ? '' : value;
        onFilterChange({ ...currentFilters, [key]: newValue, page: 1 });
    };

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        onFilterChange({ ...currentFilters, search: localSearch, page: 1 });
    };

    return (
        <>
            {/* Overlay para fechar sidebar no mobile */}
            {mobileFilterOpen && (
                <div className="sidebar-overlay" onClick={() => setMobileFilterOpen(false)}></div>
            )}
            
            <aside className={`sidebar-filters ${mobileFilterOpen ? 'open' : ''}`}>
                <div className="filter-header">
                    <h3>Filtrar por</h3>
                    <button className="close-mobile" onClick={() => setMobileFilterOpen(false)}>
                        <FaTimes />
                    </button>
                </div>

                {/* BUSCA */}
                <div className="filter-group">
                    <form className="search-box" onSubmit={handleSearchSubmit}>
                        <input 
                            type="text" 
                            placeholder="Buscar produto..." 
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                        />
                        <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }}>
                            <FaSearch />
                        </button>
                    </form>
                </div>

                {/* TIME */}
                <div className="filter-group">
                    <h4>Time</h4>
                    <div className="filter-scroll">
                        {options.times.map(time => (
                            <label key={time} className="checkbox-label">
                                <input 
                                    type="checkbox" 
                                    checked={currentFilters.team === time}
                                    onChange={() => handleToggle('team', time)}
                                /> {time}
                            </label>
                        ))}
                    </div>
                </div>

                {/* TIPO */}
                <div className="filter-group">
                    <h4>Tipo do Produto</h4>
                    {options.tipos.map(tipo => (
                        <label key={tipo} className="checkbox-label">
                            <input 
                                type="checkbox" 
                                checked={currentFilters.category === tipo}
                                onChange={() => handleToggle('category', tipo)}
                            /> {tipo}
                        </label>
                    ))}
                </div>

                {/* TAMANHO */}
                <div className="filter-group">
                    <h4>Tamanho</h4>
                    <div className="size-grid">
                        {options.tamanhos.map(tam => (
                            <label key={tam} className="size-label">
                                <input 
                                    type="checkbox" 
                                    name="tamanho" 
                                    checked={currentFilters.size === tam}
                                    onChange={() => handleToggle('size', tam)}
                                />
                                <span className={currentFilters.size === tam ? 'active' : ''}>
                                    {tam}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* GÊNERO */}
                <div className="filter-group">
                    <h4>Gênero</h4>
                    {options.generos.map(genero => (
                        <label key={genero} className="checkbox-label">
                            <input 
                                type="checkbox" 
                                checked={currentFilters.gender === genero}
                                onChange={() => handleToggle('gender', genero)}
                            /> {genero}
                        </label>
                    ))}
                </div>

                {/* ORIGEM */}
                <div className="filter-group">
                    <h4>Origem</h4>
                    <label className="checkbox-label">
                        <input type="checkbox" checked={currentFilters.origin === 'Nacional'} onChange={() => handleToggle('origin', 'Nacional')} /> Nacional
                    </label>
                    <label className="checkbox-label">
                        <input type="checkbox" checked={currentFilters.origin === 'Internacional'} onChange={() => handleToggle('origin', 'Internacional')} /> Internacional
                    </label>
                </div>

                {/* STATUS */}
                <div className="filter-group">
                    <h4>Status</h4>
                    <label className="checkbox-label offer-highlight">
                        <input type="checkbox" checked={currentFilters.is_offer === 'true'} onChange={() => handleToggle('is_offer', 'true')} /> Em Oferta
                    </label>
                    <label className="checkbox-label launch-highlight">
                        <input type="checkbox" checked={currentFilters.is_launch === 'true'} onChange={() => handleToggle('is_launch', 'true')} /> Lançamentos
                    </label>
                </div>

                <button className="btn-clear-filters" onClick={() => { setLocalSearch(''); onFilterChange({ page: 1 }); }}>
                    Limpar Filtros
                </button>
            </aside>
        </>
    );
}

export default SidebarFilters;