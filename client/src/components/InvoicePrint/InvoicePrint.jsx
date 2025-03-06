import React from 'react';
import OrderQRCode from '../QRCode/QRCode';
import { getServiceName } from '../../utils/serviceUtils';
import './InvoicePrint.css';

const InvoicePrint = ({ order }) => {
  // Перевіряємо наявність даних замовлення
  if (!order || !order.items) {
    return <div>Немає даних для відображення квитанції</div>;
  }

  return (
      <div className="invoice-page">
        <div className="print-container">
          <div className="invoice-header">
            <div className="company-logo">
              <img src="/logo.png" alt="AKSI Logo" />
            </div>
            <div className="company-info">
              <h2>Хімчистка "AKSI"</h2>
              <p>м. Вінниця, вул. Головна, 123</p>
              <p>Тел: (067) 123-45-67</p>
              <p>https://aksi.vn.ua</p>
            </div>
          </div>

          <div className="invoice-title">
            <h1>КВИТАНЦІЯ #{order.orderNumber}</h1>
            <div className="qr-code">
              <OrderQRCode orderNumber={order.orderNumber} size={80} />
            </div>
          </div>

          <div className="invoice-details">
            <div className="detail-row">
              <span className="label">Дата прийому:</span>
              <span className="value">
              {new Date(order.receivedDate).toLocaleDateString()}
            </span>
            </div>
            <div className="detail-row">
              <span className="label">Дата готовності:</span>
              <span className="value">
              {new Date(order.promisedDate).toLocaleDateString()}
            </span>
            </div>
            <div className="detail-row">
              <span className="label">Клієнт:</span>
              <span className="value">{order.client.name}</span>
            </div>
            <div className="detail-row">
              <span className="label">Телефон:</span>
              <span className="value">{order.client.phone}</span>
            </div>
          </div>

          <table className="invoice-items">
            <thead>
            <tr>
              <th>№</th>
              <th>Опис речі</th>
              <th>Послуга</th>
              <th>Ціна</th>
            </tr>
            </thead>
            <tbody>
            {order.items.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    {item.description}
                    {item.color ? ` (${item.color})` : ''}
                    {item.material ? `, ${item.material}` : ''}
                  </td>
                  <td>{getServiceName(item.service)}</td>
                  <td>{item.price} грн</td>
                </tr>
            ))}
            </tbody>
            <tfoot>
            <tr>
              <td colSpan="3" className="total-label">
                Знижка:
              </td>
              <td>{order.discount}%</td>
            </tr>
            <tr>
              <td colSpan="3" className="total-label">
                Загальна сума:
              </td>
              <td className="total-value">{order.totalAmount} грн</td>
            </tr>
            </tfoot>
          </table>

          <div className="invoice-footer">
            <p className="terms">
              Правила: Компанія не несе відповідальності за речі, не забрані
              протягом 30 днів після дати готовності.
            </p>
            <p className="thank-you">
              Дякуємо, що обрали хімчистку "AKSI"! Ми цінуємо ваш вибір.
            </p>
            <div className="signature-block">
              <div className="signature-line">
                Підпис клієнта: _________________
              </div>
              <div className="signature-line">
                Підпис приймальника: _________________
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default InvoicePrint;