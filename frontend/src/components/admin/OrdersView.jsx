import { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import { orderSvc } from '../../services/api';
import { getErrorMessage } from '../../utils/apiHelpers';
import OrderCard from './OrderCard';
import Pagination from '../Pagination';
import ManualSaleModal from './ManualSaleModal';

/**
 * Visualização de Pedidos
 * Lista e gerencia todos os pedidos do sistema
 */
const OrdersView = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, cancelled, completed
  const [currentPage, setCurrentPage] = useState(1);
  const [showManualSaleModal, setShowManualSaleModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    cancelled: 0,
    completed: 0
  });

  const ORDERS_PER_PAGE = 12;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderSvc.list();
      setOrders(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      alert(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ordersList) => {
    const stats = {
      total: ordersList.length,
      pending: ordersList.filter(o => o.status === 'pending').length,
      cancelled: ordersList.filter(o => o.status === 'cancelled').length,
      completed: ordersList.filter(o => o.status === 'completed').length
    };
    setStats(stats);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderSvc.updateStatus(orderId, newStatus);
      alert(`Pedido ${newStatus === 'cancelled' ? 'cancelado' : 'finalizado'} com sucesso!`);
      await fetchOrders(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert(getErrorMessage(error));
    }
  };

  const handleManualSale = async (orderData) => {
    try {
      await orderSvc.create(orderData);
      alert('Venda registrada com sucesso!');
      setShowManualSaleModal(false);
      await fetchOrders(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao registrar venda:', error);
      alert(getErrorMessage(error));
    }
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status === filter);

  // Paginação
  const indexOfLastOrder = currentPage * ORDERS_PER_PAGE;
  const indexOfFirstOrder = indexOfLastOrder - ORDERS_PER_PAGE;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset página ao mudar filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="spinner"></div>
        <p>Carregando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="orders-view">
      {/* Header com Estatísticas */}
      <div className="orders-header">
        <div className="header-title-row">
          <h2>Gerenciamento de Pedidos</h2>
          <button className="btn-manual-sale" onClick={() => setShowManualSaleModal(true)}>
            <FaPlus /> Venda Manual
          </button>
        </div>
        <div className="orders-stats">
          <div className="stat-card">
            <span className="stat-label">Total</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-card stat-pending">
            <span className="stat-label">Pendentes</span>
            <span className="stat-value">{stats.pending}</span>
          </div>
          <div className="stat-card stat-completed">
            <span className="stat-label">Finalizados</span>
            <span className="stat-value">{stats.completed}</span>
          </div>
          <div className="stat-card stat-cancelled">
            <span className="stat-label">Cancelados</span>
            <span className="stat-value">{stats.cancelled}</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="orders-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todos ({stats.total})
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pendentes ({stats.pending})
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Finalizados ({stats.completed})
        </button>
        <button
          className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilter('cancelled')}
        >
          Cancelados ({stats.cancelled})
        </button>
      </div>

      {/* Lista de Pedidos */}
      {filteredOrders.length === 0 ? (
        <div className="orders-empty">
          <p>Nenhum pedido encontrado.</p>
        </div>
      ) : (
        <>
          <div className="orders-grid">
            {currentOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              paginate={paginate}
            />
          )}
        </>
      )}

      {/* Modal de Venda Manual */}
      <ManualSaleModal
        isOpen={showManualSaleModal}
        onClose={() => setShowManualSaleModal(false)}
        onSave={handleManualSale}
      />
    </div>
  );
};

export default OrdersView;
