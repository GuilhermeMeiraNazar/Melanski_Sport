import { useState } from 'react';
import { FaBox, FaCalendar, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaShoppingBag, FaDollarSign } from 'react-icons/fa';

/**
 * Card de Pedido
 * Exibe informações completas do pedido com ações de cancelar/finalizar
 */
const OrderCard = ({ order, onStatusChange }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: 'Pendente', className: 'status-pending' },
      cancelled: { label: 'Cancelado', className: 'status-cancelled' },
      completed: { label: 'Finalizado', className: 'status-completed' }
    };
    return badges[status] || badges.pending;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return `R$ ${parseFloat(price).toFixed(2).replace('.', ',')}`;
  };

  const handleStatusChange = async (newStatus) => {
    const confirmMessage = newStatus === 'cancelled'
      ? 'Tem certeza que deseja CANCELAR este pedido? Os itens voltarão ao estoque. Esta ação é irreversível!'
      : 'Tem certeza que deseja FINALIZAR este pedido? Esta ação é irreversível!';

    if (!window.confirm(confirmMessage)) return;

    setIsUpdating(true);
    try {
      await onStatusChange(order.id, newStatus);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const statusBadge = getStatusBadge(order.status);
  const canChangeStatus = order.status === 'pending';

  return (
    <div className={`order-card ${statusBadge.className}`}>
      {/* Header */}
      <div className="order-header">
        <div className="order-number">
          <FaBox />
          <span>Pedido #{order.order_number}</span>
        </div>
        <span className={`order-badge ${statusBadge.className}`}>
          {statusBadge.label}
        </span>
      </div>

      {/* Data e Hora */}
      <div className="order-info-row">
        <FaCalendar />
        <span>{formatDate(order.created_at)}</span>
      </div>

      {/* Dados do Cliente */}
      <div className="order-section">
        <h4>Cliente</h4>
        <div className="order-info-row">
          <FaUser />
          <span>{order.customer_name}</span>
        </div>
        {order.customer_email && (
          <div className="order-info-row">
            <FaEnvelope />
            <span>{order.customer_email}</span>
          </div>
        )}
        <div className="order-info-row">
          <FaPhone />
          <span>{order.customer_phone}</span>
        </div>
        {order.customer_user_name && (
          <div className="order-info-row">
            <FaUser />
            <span className="user-badge">Usuário: {order.customer_user_name}</span>
          </div>
        )}
      </div>

      {/* Endereço de Entrega */}
      <div className="order-section">
        <h4>Endereço de Entrega</h4>
        <div className="order-info-row">
          <FaMapMarkerAlt />
          <div className="address-text">
            <div>{order.delivery_address}</div>
            <div>{order.delivery_city}/{order.delivery_state} - CEP: {order.delivery_zip}</div>
          </div>
        </div>
      </div>

      {/* Itens do Pedido */}
      <div className="order-section">
        <h4>
          <FaShoppingBag /> Itens ({order.items?.length || 0})
        </h4>
        <div className="order-items">
          {order.items?.map((item, index) => (
            <div key={index} className="order-item">
              <div className="item-info">
                <span className="item-name">{item.product_name}</span>
                {item.product_size && (
                  <span className="item-size">Tamanho: {item.product_size}</span>
                )}
              </div>
              <div className="item-quantity">
                {item.quantity}x {formatPrice(item.unit_price)}
              </div>
              <div className="item-subtotal">
                {formatPrice(item.subtotal)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Observações */}
      {order.notes && (
        <div className="order-section">
          <h4>Observações</h4>
          <p className="order-notes">{order.notes}</p>
        </div>
      )}

      {/* Total */}
      <div className="order-total">
        <FaDollarSign />
        <span>Total:</span>
        <strong>{formatPrice(order.total_amount)}</strong>
      </div>

      {/* Informações de Atualização */}
      {order.updated_by_name && (
        <div className="order-footer">
          <small>
            Atualizado por: {order.updated_by_name} em {formatDate(order.updated_at)}
          </small>
        </div>
      )}

      {/* Ações */}
      {canChangeStatus && (
        <div className="order-actions">
          <button
            className="btn-cancel"
            onClick={() => handleStatusChange('cancelled')}
            disabled={isUpdating}
          >
            {isUpdating ? 'Processando...' : 'Cancelar Pedido'}
          </button>
          <button
            className="btn-complete"
            onClick={() => handleStatusChange('completed')}
            disabled={isUpdating}
          >
            {isUpdating ? 'Processando...' : 'Finalizar Pedido'}
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
