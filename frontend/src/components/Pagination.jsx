import React from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

function Pagination({ currentPage, totalPages, paginate }) {
    return (
        <div className="pagination">
            {/* Botão Voltar: Desabilitado se estiver na primeira página */}
            <button 
                onClick={() => paginate(currentPage - 1)} 
                disabled={currentPage === 1} 
                className="page-control"
            >
                <FaArrowLeft />
            </button>

            <span className="page-info">
                Página <strong>{currentPage}</strong> de {totalPages}
            </span>

            {/* Botão Próximo: Desabilitado se estiver na última página */}
            <button 
                onClick={() => paginate(currentPage + 1)} 
                disabled={currentPage === totalPages} 
                className="page-control"
            >
                <FaArrowRight />
            </button>
        </div>
    );
}

export default Pagination;