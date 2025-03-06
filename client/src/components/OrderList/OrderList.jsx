import React, { useState } from 'react';
import './OrderList.css';
import OrderQRCode from '../QRCode/QRCode';

const OrderList = ({ orders, onStatusChange, onViewOrder, onEditOrder }) => {
  const [filter, setFilter] = useState({
    status: 'all',
    searchText: '',
    dateFrom: '',
    dateTo: ''
  });
  // QR code
  const [selectedOrderForQR, setSelectedOrderForQR] = useState(null);

  const printQRCode = () => {
    const printContent = document.getElementById('qr-code-for-print');
    const windowUrl = 'about:blank';
    const uniqueName = new Date().getTime();
    const windowName = 'Print' + uniqueName;
    const printWindow = window.open(windowUrl, windowName, 'left=200,top=200,width=500,height=500');

    printWindow.document.write('<html><head><title>Друк QR-коду</title>');
    printWindow.document.write('<style>body { font-family: Arial; text-align: center; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write('</body></html>');

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

// Add this function inside the component
  const handleShowQRCode = (order) => {
    setSelectedOrderForQR(order);
  };

  // Обробник зміни фільтрів
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Функція для фільтрації замовлень
  const filteredOrders = orders.filter(order => {
    // Фільтр за статусом
    if (filter.status !== 'all' && order.status !== filter.status) {
      return false;
    }

    // Фільтр за текстом (номер, ім'я клієнта, телефон)
    if (filter.searchText) {
      const searchLower = filter.searchText.toLowerCase();
      const orderNumberMatch = order.orderNumber?.toLowerCase().includes(searchLower);
      const clientNameMatch = order.client?.name?.toLowerCase().includes(searchLower);
      const clientPhoneMatch = order.client?.phone?.toLowerCase().includes(searchLower);

      if (!orderNumberMatch && !clientNameMatch && !clientPhoneMatch) {
        return false;
      }
    }

    // Фільтр за датою "від"
    if (filter.dateFrom && new Date(order.receivedDate) < new Date(filter.dateFrom)) {
      return false;
    }

    // Фільтр за датою "до"
    if (filter.dateTo && new Date(order.receivedDate) > new Date(filter.dateTo)) {
      return false;
    }

    return true;
  });

  // Переведення статусу в читабельний формат
  const getStatusLabel = (status) => {
    const statusMap = {
      new: 'Прийнято',
      processing: 'В обробці',
      ready: 'Готово',
      delivered: 'Видано'
    };
    return statusMap[status] || status;
  };

  // Переведення статусу в клас для стилізації
  const getStatusClass = (status) => {
    const classMap = {
      new: 'status-new',
      processing: 'status-processing',
      ready: 'status-ready',
      delivered: 'status-delivered'
    };
    return `status-badge ${classMap[status] || ''}`;
  };

  return (
    <div className="order-list-container">
      <h2>Список замовлень</h2>

      {/* Фільтри */}
      <div className="filters-container">
        <div className="filter-group">
          <label htmlFor="status">Статус:</label>
          <select
            id="status"
            name="status"
            value={filter.status}
            onChange={handleFilterChange}
          >
            <option value="all">Всі статуси</option>
            <option value="new">Прийнято</option>
            <option value="processing">В обробці</option>
            <option value="ready">Готово</option>
            <option value="delivered">Видано</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="searchText">Пошук:</label>
          <input
            type="text"
            id="searchText"
            name="searchText"
            placeholder="№ замовлення, клієнт або телефон"
            value={filter.searchText}
            onChange={handleFilterChange}
          />
        </div>

        <div className="date-filters">
          <div className="filter-group">
            <label htmlFor="dateFrom">Від:</label>
            <input
              type="date"
              id="dateFrom"
              name="dateFrom"
              value={filter.dateFrom}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="dateTo">До:</label>
            <input
              type="date"
              id="dateTo"
              name="dateTo"
              value={filter.dateTo}
              onChange={handleFilterChange}
            />
          </div>
        </div>
      </div>

      {/* Таблиця замовлень */}
      <div className="table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>№ замовлення</th>
              <th>Клієнт</th>
              <th>Телефон</th>
              <th>Дата прийому</th>
              <th>Дата готовності</th>
              <th>Сума</th>
              <th>Статус</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <tr key={order._id || order.id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.client.name}</td>
                  <td>{order.client.phone}</td>
                  <td>{new Date(order.receivedDate).toLocaleDateString()}</td>
                  <td>{new Date(order.promisedDate).toLocaleDateString()}</td>
                  <td>{order.totalAmount} грн</td>
                  <td>
                    <span className={getStatusClass(order.status)}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                        className="btn btn-icon"
                        onClick={() => onViewOrder(order._id || order.id)}
                        title="Переглянути"
                    >
                      👁️
                    </button>
                    <button
                        className="btn btn-icon"
                        onClick={() => onEditOrder(order._id || order.id)}
                        title="Редагувати"
                    >
                      ✏️
                    </button>
                    <button
                        className="btn btn-icon"
                        onClick={() => window.open(`/print/${order._id || order.id}`, '_blank')}
                        title="Друкувати замовлення"
                    >
                      🖨️
                    </button>
                    <button
                        className="btn btn-icon"
                        onClick={() => window.open(`/invoice/${order._id || order.id}`, '_blank')}
                        title="Друкувати інвойс"
                    >
                      📃
                    </button>
                    {order.status !== 'delivered' && (
                        <select
                            className="status-select"
                            value={order.status}
                            onChange={(e) => onStatusChange(order._id || order.id, e.target.value)}
                        >
                          <option value="" disabled>Змінити статус</option>
                          <option value="new">Прийнято</option>
                          <option value="processing">В обробці</option>
                          <option value="ready">Готово</option>
                          <option value="delivered">Видано</option>
                        </select>
                    )}
                    <button
                        className="btn btn-icon"
                        onClick={() => handleShowQRCode(order)}
                        title="QR-код"
                    >
                      🔍
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-orders">
                  Немає замовлень, що відповідають критеріям фільтрації
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {selectedOrderForQR && (
            <div className="qr-code-modal">
              <div className="qr-code-modal-content">
                <h3>QR-код замовлення {selectedOrderForQR.orderNumber}</h3>
                <div id="qr-code-for-print">
                  <OrderQRCode orderNumber={selectedOrderForQR.orderNumber} size={200} />
                </div>
                <div className="qr-code-modal-buttons">
                  <button className="btn btn-primary" onClick={printQRCode}>
                    Друкувати
                  </button>
                  <button className="btn btn-secondary" onClick={() => setSelectedOrderForQR(null)}>
                    Закрити
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;