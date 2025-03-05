import React, { useState, useEffect } from 'react';
import OrderList from '../components/OrderList/OrderList';
import OrderForm from '../components/OrderForm/OrderForm';
import axios from 'axios';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Завантаження всіх замовлень
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/orders');
      setOrders(response.data);
      setError(null);
    } catch (err) {
      setError('Помилка завантаження замовлень');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Завантаження замовлень при монтуванні компонента
  useEffect(() => {
    fetchOrders();
  }, []);

  // Створення нового або оновлення існуючого замовлення
  const handleSubmitOrder = async (orderData) => {
    try {
      if (selectedOrder) {
        // Оновлення існуючого замовлення
        await axios.put(`/api/orders/${selectedOrder._id}`, orderData);
      } else {
        // Створення нового замовлення
        await axios.post('/api/orders', orderData);
      }

      // Оновлюємо список замовлень
      fetchOrders();

      // Закриваємо форму
      setShowForm(false);
      setSelectedOrder(null);
    } catch (err) {
      setError('Помилка збереження замовлення');
      console.error(err);
    }
  };

  // Зміна статусу замовлення
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.patch(`/api/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      setError('Помилка зміни статусу');
      console.error(err);
    }
  };

  // Відкриття форми для редагування
  const handleEditOrder = async (orderId) => {
    try {
      const response = await axios.get(`/api/orders/${orderId}`);
      setSelectedOrder(response.data);
      setShowForm(true);
    } catch (err) {
      setError('Помилка завантаження замовлення');
      console.error(err);
    }
  };

  // Відкриття деталей замовлення
  const handleViewOrder = (orderId) => {
    handleEditOrder(orderId);
  };

  return (
    <div className="orders-page">
      <div className="page-header">
        <h2>Управління замовленнями</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setSelectedOrder(null);
            setShowForm(!showForm);
          }}
        >
          {showForm ? 'Скасувати' : 'Нове замовлення'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm ? (
        <OrderForm
          onSubmit={handleSubmitOrder}
          initialData={selectedOrder}
        />
      ) : (
        <>
          {loading ? (
            <div>Завантаження...</div>
          ) : (
            <OrderList
              orders={orders}
              onStatusChange={handleStatusChange}
              onViewOrder={handleViewOrder}
              onEditOrder={handleEditOrder}
            />
          )}
        </>
      )}
    </div>
  );
};

export default OrdersPage;