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

    if (!printWindow || !printContent) return;

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

  // Функція для показу QR коду
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

  // Адаптація даних замовлень для компоненту
  const adaptedOrders = Array.isArray(orders) ? orders : [];

  // Функція для доступу до властивостей замовлення з врахуванням різних форматів API
  const getOrderProperty = (order, englishKey, ukrainianKey) => {
    // Спробуємо спочатку англійську назву, потім українську
    return order[englishKey] !== undefined ? order[englishKey] : order[ukrainianKey];
  };

  // Функція для отримання клієнта
  const getOrderClient = (order) => {
    // Спробуємо дістати інформацію про клієнта в різних форматах
    const client = order.client || order.клієнт || {};
    return {
      name: client.name || client.forname || 'Не вказано',
      phone: client.phone || 'Не вказано'
    };
  };
  
  // Функція для отримання статусу в стандартизованому форматі
  const getOrderStatus = (order) => {
    const status = order.status || order.статус;
    // Конвертуємо українські статуси в англійські
    const statusMap = {
      'нове': 'new',
      'в обробці': 'processing',
      'готове': 'ready',
      'видане': 'delivered',
      'скасоване': 'cancelled'
    };
    return statusMap[status] || status || 'new';
  };

  // Функція для фільтрації замовлень
  const filteredOrders = adaptedOrders.filter(order => {
    // Дістаємо властивості замовлення в стандартизованому форматі
    const orderStatus = getOrderStatus(order);
    const client = getOrderClient(order);
    const orderNumber = getOrderProperty(order, 'orderNumber', 'номер_замовлення') || '';
    const receivedDate = getOrderProperty(order, 'receivedDate', 'дата_створення') || new Date();
    
    // Фільтр за статусом
    if (filter.status !== 'all' && orderStatus !== filter.status) {
      return false;
    }

    // Фільтр за текстом (номер, ім'я клієнта, телефон)
    if (filter.searchText) {
      const searchLower = filter.searchText.toLowerCase();
      const orderNumberMatch = orderNumber.toLowerCase().includes(searchLower);
      const clientNameMatch = client.name.toLowerCase().includes(searchLower);
      const clientPhoneMatch = client.phone.toLowerCase().includes(searchLower);

      if (!orderNumberMatch && !clientNameMatch && !clientPhoneMatch) {
        return false;
      }
    }

    // Фільтр за датою "від"
    if (filter.dateFrom && new Date(receivedDate) < new Date(filter.dateFrom)) {
      return false;
    }

    // Фільтр за датою "до"
    if (filter.dateTo && new Date(receivedDate) > new Date(filter.dateTo)) {
      return false;
    }

    return true;
  });

  // Переведення статусу в читабельний формат
  const getStatusLabel = (status) => {
    const statusMap = {
      new: 'Прийнято',
      nове: 'Прийнято',
      processing: 'В обробці',
      'в обробці': 'В обробці',
      ready: 'Готово',
      готове: 'Готово',
      delivered: 'Видано',
      видане: 'Видано',
      cancelled: 'Скасовано',
      скасоване: 'Скасовано'
    };
    return statusMap[status] || status;
  };

  // Переведення статусу в клас для стилізації
  const getStatusClass = (status) => {
    const classMap = {
      new: 'status-new',
      nове: 'status-new',
      processing: 'status-processing',
      'в обробці': 'status-processing',
      ready: 'status-ready',
      готове: 'status-ready',
      delivered: 'status-delivered',
      видане: 'status-delivered',
      cancelled: 'status-cancelled',
      скасоване: 'status-cancelled'
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
              filteredOrders.map(order => {
                // Дістаємо всі необхідні властивості замовлення
                const id = order._id || order.id;
                const orderNumber = getOrderProperty(order, 'orderNumber', 'номер_замовлення') || '';
                const client = getOrderClient(order);
                const receivedDate = getOrderProperty(order, 'receivedDate', 'дата_створення') || new Date();
                const promisedDate = getOrderProperty(order, 'promisedDate', 'дата_виконання') || receivedDate;
                const totalAmount = getOrderProperty(order, 'totalAmount', 'сума_до_сплати') || 0;
                const status = getOrderStatus(order);
                
                return (
                  <tr key={id}>
                    <td>{orderNumber}</td>
                    <td>{client.name}</td>
                    <td>{client.phone}</td>
                    <td>{new Date(receivedDate).toLocaleDateString()}</td>
                    <td>{new Date(promisedDate).toLocaleDateString()}</td>
                    <td>{totalAmount} грн</td>
                    <td>
                      <span className={getStatusClass(status)}>
                        {getStatusLabel(status)}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="btn btn-icon"
                        onClick={() => onViewOrder(id)}
                        title="Переглянути"
                      >
                        👁️
                      </button>
                      <button
                        className="btn btn-icon"
                        onClick={() => onEditOrder(id)}
                        title="Редагувати"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-icon"
                        onClick={() => window.open(`/print/${id}`, '_blank')}
                        title="Друкувати замовлення"
                      >
                        🖨️
                      </button>
                      <button
                        className="btn btn-icon"
                        onClick={() => window.open(`/invoice/${id}`, '_blank')}
                        title="Друкувати інвойс"
                      >
                        📃
                      </button>
                      {status !== 'delivered' && status !== 'видане' && (
                        <select
                          className="status-select"
                          value={status}
                          onChange={(e) => onStatusChange(id, e.target.value)}
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
                );
              })
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
              <h3>QR-код замовлення {getOrderProperty(selectedOrderForQR, 'orderNumber', 'номер_замовлення')}</h3>
              <div id="qr-code-for-print">
                <OrderQRCode orderNumber={getOrderProperty(selectedOrderForQR, 'orderNumber', 'номер_замовлення')} size={200} />
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