import { useState, useEffect } from 'react';
import { orderSvc } from '../../services/api';
import { getErrorMessage } from '../../utils/apiHelpers';
import OrderCard from './OrderCard';

/**
 * Visualização de Pedidos
 * Lista e gerencia todos os pedidos do sistema
 */
const OrdersView = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, cancelled, completed
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    cancelled: 0,
    completed: 0
  });

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

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status === filter);

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
        <h2>Gerenciamento de Pedidos</h2>
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
        <div className="orders-grid">
          {filteredOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersView;
