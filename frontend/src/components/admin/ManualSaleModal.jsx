import { useState, useEffect } from 'react';
import { FaTimes, FaSearch, FaPlus, FaTrash, FaShoppingCart } from 'react-icons/fa';
import { productSvc } from '../../services/api';
import { getErrorMessage } from '../../utils/apiHelpers';
import { formatPrice } from '../../utils/priceUtils';

/**
 * Modal para Input Manual de Vendas
 * Permite registrar vendas feitas fora do site
 */
const ManualSaleModal = ({ isOpen, onClose, onSave }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dados do cliente
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryState, setDeliveryState] = useState('');
  const [deliveryZip, setDeliveryZip] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.team && p.team.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productSvc.list();
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      alert(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const addProduct = (product) => {
    // Verificar se produto já foi adicionado
    const exists = selectedItems.find(item => item.product_id === product.id);
    if (exists) {
      alert('Produto já adicionado ao carrinho');
      return;
    }

    const newItem = {
      product_id: product.id,
      product_name: product.name,
      product_image: product.images?.[0] || null,
      product_size: null,
      quantity: 1,
      unit_price: product.sale_price,
      has_sizes: typeof product.stock === 'object',
      available_stock: product.stock
    };

    setSelectedItems([...selectedItems, newItem]);
  };

  const removeProduct = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, quantity) => {
    const newItems = [...selectedItems];
    newItems[index].quantity = parseInt(quantity) || 1;
    setSelectedItems(newItems);
  };

  const updateSize = (index, size) => {
    const newItems = [...selectedItems];
    newItems[index].product_size = size;
    setSelectedItems(newItems);
  };

  const calculateTotal = () => {
    return selectedItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validações
    if (selectedItems.length === 0) {
      alert('Adicione pelo menos um produto');
      return;
    }

    // Validar tamanhos
    for (const item of selectedItems) {
      if (item.has_sizes && !item.product_size) {
        alert(`Selecione o tamanho para ${item.product_name}`);
        return;
      }

      // Validar estoque
      if (item.has_sizes) {
        const available = item.available_stock[item.product_size] || 0;
        if (item.quantity > available) {
          alert(`Estoque insuficiente para ${item.product_name} (${item.product_size}). Disponível: ${available}`);
          return;
        }
      } else {
        if (item.quantity > item.available_stock) {
          alert(`Estoque insuficiente para ${item.product_name}. Disponível: ${item.available_stock}`);
          return;
        }
      }
    }

    const orderData = {
      customer_name: customerName,
      customer_email: customerEmail || null,
      customer_phone: customerPhone,
      delivery_address: deliveryAddress,
      delivery_city: deliveryCity,
      delivery_state: deliveryState.toUpperCase(),
      delivery_zip: deliveryZip,
      notes: notes || null,
      items: selectedItems.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        product_size: item.product_size || 'Geral',
        product_image: item.product_image,
        quantity: item.quantity,
        unit_price: item.unit_price
      }))
    };

    onSave(orderData);
  };

  const resetForm = () => {
    setSelectedItems([]);
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setDeliveryAddress('');
    setDeliveryCity('');
    setDeliveryState('');
    setDeliveryZip('');
    setNotes('');
    setSearchTerm('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content manual-sale-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2><FaShoppingCart /> Registrar Venda Manual</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Seção de Produtos */}
          <div className="form-section">
            <h3>Produtos</h3>
            
            {/* Busca de Produtos */}
            <div className="search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Buscar produto por nome ou time..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Lista de Produtos Disponíveis */}
            <div className="products-list">
              {loading ? (
                <p>Carregando produtos...</p>
              ) : filteredProducts.length === 0 ? (
                <p>Nenhum produto encontrado</p>
              ) : (
                filteredProducts.slice(0, 10).map(product => (
                  <div key={product.id} className="product-item">
                    <div className="product-info">
                      {product.images?.[0] && (
                        <img src={product.images[0]} alt={product.name} />
                      )}
                      <div>
                        <strong>{product.name}</strong>
                        {product.team && <span className="product-team">{product.team}</span>}
                        <span className="product-price">{formatPrice(product.sale_price)}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-add-product"
                      onClick={() => addProduct(product)}
                    >
                      <FaPlus /> Adicionar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Carrinho */}
          {selectedItems.length > 0 && (
            <div className="form-section cart-section">
              <h3>Carrinho ({selectedItems.length} {selectedItems.length === 1 ? 'item' : 'itens'})</h3>
              
              {selectedItems.map((item, index) => (
                <div key={index} className="cart-item">
                  <div className="cart-item-info">
                    <strong>{item.product_name}</strong>
                    <span>{formatPrice(item.unit_price)}</span>
                  </div>
                  
                  <div className="cart-item-controls">
                    {item.has_sizes && (
                      <select
                        value={item.product_size || ''}
                        onChange={e => updateSize(index, e.target.value)}
                        required
                      >
                        <option value="">Tamanho</option>
                        {Object.keys(item.available_stock).map(size => (
                          <option key={size} value={size}>
                            {size} ({item.available_stock[size]} disp.)
                          </option>
                        ))}
                      </select>
                    )}
                    
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => updateQuantity(index, e.target.value)}
                      required
                    />
                    
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeProduct(index)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                  
                  <div className="cart-item-total">
                    Subtotal: {formatPrice(item.quantity * item.unit_price)}
                  </div>
                </div>
              ))}

              <div className="cart-total">
                <strong>Total:</strong>
                <strong>{formatPrice(calculateTotal())}</strong>
              </div>
            </div>
          )}

          {/* Dados do Cliente */}
          <div className="form-section">
            <h3>Dados do Cliente</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Nome Completo *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Telefone *</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email (Opcional)</label>
              <input
                type="email"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Endereço de Entrega */}
          <div className="form-section">
            <h3>Endereço de Entrega</h3>
            
            <div className="form-group">
              <label>Endereço Completo *</label>
              <input
                type="text"
                placeholder="Rua, número, complemento"
                value={deliveryAddress}
                onChange={e => setDeliveryAddress(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Cidade *</label>
                <input
                  type="text"
                  value={deliveryCity}
                  onChange={e => setDeliveryCity(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Estado *</label>
                <input
                  type="text"
                  maxLength="2"
                  placeholder="SP"
                  value={deliveryState}
                  onChange={e => setDeliveryState(e.target.value.toUpperCase())}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>CEP *</label>
                <input
                  type="text"
                  value={deliveryZip}
                  onChange={e => setDeliveryZip(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="form-section">
            <h3>Observações (Opcional)</h3>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              maxLength="100"
              placeholder="Máximo 100 caracteres"
              rows="3"
            />
            <small>{notes.length}/100 caracteres</small>
          </div>

          {/* Botões */}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={() => { resetForm(); onClose(); }}>
              Cancelar
            </button>
            <button type="submit" className="btn-save">
              Registrar Venda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualSaleModal;
