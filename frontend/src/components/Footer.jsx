import React from 'react';

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <p className="copyright">
                        © {new Date().getFullYear()} Melanski Sport. Todos os direitos reservados.
                    </p>
                </div>
                
                <div className="footer-section">
                    <p className="cnpj">
                        CNPJ: 00.000.000/0000-00
                    </p>
                </div>
                
                <div className="footer-section">
                    <p className="address">
                        Rua Exemplo, 123 - Bairro - Cidade/UF - CEP 00000-000
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
